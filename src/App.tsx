import type { item } from './comp/control'
import './App.css'
import {
    useState,
    createRef,
    useEffect,
    memo,
    useMemo,
    useCallback,
} from 'react'
import { areEqual, FixedSizeGrid as Grid } from 'react-window'
import {
    getAllWordPosition,
    getClasses,
    getStyle,
    getWordCount,
    i2rc,
    rc2i,
} from './utils'
import { useSize, useSpk, useTxt } from './hook'
import Control from './comp/control'

const SIZE = 30
const OVERSCAN = 2 //15
setInterval(() => {
    // console.log(document.querySelector('.wrap>div>div').childElementCount)
}, 1222)

const selectionObj = getSelection()!

type props = {
    columnIndex: number
    rowIndex: number
    style: object
    isScrolling?: boolean
}
const Cells = (
    lineSize: number,
    TXT: string,
    isSpkArr: boolean[],
    { columnIndex, rowIndex, style, isScrolling }: props
) => {
    const idx = rc2i(rowIndex, columnIndex, lineSize)
    // idx < 100 && console.time() // devtools记录模式快很多
    const word = TXT[idx]

    const classes = getClasses({
        speaking: isSpkArr[idx],
        // isOdd: rowIndex % 2,
    })

    const props = (function gene() {
        const wordType = getWordType(word)
        return {
            ...classes,

            style: {
                ...style,
                ...getStyles(word),
                userSelect: isScrolling ? 'none' : 'text',

                '--var-color': 'black',
            } as any,

            children: word,
            // key: idx, // ?

            'data-i': idx, //
            [wordType ? word.toLowerCase() : 'data-e']: wordType ? '' : word, // Recalculate Style 性能提高了非常多
            // ...(wordType ? { [word.toLowerCase()]: '' } : { word }),
        }

        function getWordType(word: string) {
            const STR = `—“”　 ·？，。！《》‘’⋯．、[]；：（）()／—@1234567890`
            return STR.indexOf(word) === -1
        }
    })()

    // idx < 100 && console.timeEnd()
    return <span {...props} />

    function getStyles(word: string) {
        const style1 = word === '“' || word === '('
        const style2 = word === '”' || word === ')'
        const style3 = word === ' ' || word === '　'

        return {
            // ...(style1 && {
            //     textAlign: 'right',
            // }),
            // ...(style2 && {
            //     textAlign: 'left',
            // }),
            ...(style3 &&
                {
                    // fontSize: '0',
                    // 'user-select': 'none',
                }),
        }
    }
}
function App() {
    const [readerWidth, readerHeight, lineSize] = useSize(SIZE)
    const TXT = useTxt(lineSize) //299e81
    const isSpkArr = useSpk(TXT)

    const [select, setSelect] = useState('')
    const selectWrap = {
        key: select,
        color: 'red',
        i: Date.now(),
        count: getWordCount(select, TXT),
    }

    const [selectArr, setSelectArr] = useState<item[]>(
        JSON.parse(sessionStorage.getItem('selectArr') || '[]')
    )

    const gridRef: any = createRef()
    useEffect(() => {
        gridRef.current.scrollToItem({
            align: 'center',
            rowIndex: Number(sessionStorage.getItem('idx')) + 17 + OVERSCAN - 1, // 33 适应屏幕高度行数
        })
    }, [])
    useEffect(() => {
        const timer = setInterval(() => {
            const idx = document.querySelector<HTMLElement>(
                '.wrap span:first-child'
            )!.dataset.i!
            sessionStorage.setItem('idx', i2rc(idx, lineSize).r + '')

            sessionStorage.setItem('selectArr', JSON.stringify(selectArr))
        }, 1000)
        return () => clearInterval(timer)
    }, [selectArr])

    const _children = (props: props) => {
        return Cells(lineSize, TXT, isSpkArr, props)
    }
    const children = useMemo(() => {
        return memo(_children, areEqual)
    }, [lineSize, isSpkArr])
    const G = () => (
        <Grid
            // onScroll={e => console.log(3)}
            // item counts
            columnCount={lineSize}
            rowCount={TXT.length / lineSize}
            // item style
            columnWidth={SIZE}
            rowHeight={SIZE}
            // wrap style
            height={readerHeight}
            width={readerWidth}
            //
            ref={gridRef}
            children={children}
            // overscanCount={6}
            overscanRowCount={OVERSCAN}
            // useIsScrolling
        />
    )

    return (
        <>
            <Control
                {...{
                    setSelect,
                    setSelectArr,
                    select,
                    selectArr,
                    selectWrap,
                    selectionObj,
                    gridRef,
                    TXT,
                    lineSize,
                }}
            />

            <div className='wrap' onClick={GoToNextItem}>
                {G()}
                {/* <G /> */}
            </div>

            <div className='styles'>
                {/* <style>
                    {
                        Array(columnCount)
                            .fill(null)
                            .map((_, i) => `span:hover ${'+span '.repeat(i)}`)
                            .join(',\n') + '{background:yellowgreen}'
                        // // // // // //
                        // aot 卡, 使用jit
                        // span:hover,
                        // span:hover + span,
                        // span:hover + span + span,
                        // span:hover + span + span + span {
                        //     background: yellowgreen;
                        // }
                    }
                </style> */}

                {[selectWrap, ...selectArr].map(({ key, color }) => (
                    <style key={key} slot={key}>
                        {getStyle(TXT, key, color)}
                    </style>
                ))}
            </div>
        </>
    )

    function GoToNextItem({ target, metaKey, altKey }: React.MouseEvent) {
        const selectionStr = selectionObj + ''

        if (selectionStr.length > 0 && selectionStr.length < 210) {
            if (selectionStr.includes('\n')) return
            setSelect(selectionStr.replaceAll(' ', ''))
            return
        }

        if (!(target instanceof HTMLElement)) return alert(1) // ?

        const content = getComputedStyle(target).content
        if (content === 'normal') return
        const word = content.slice(1, -1) //去掉引号

        const wordAllPosition = getAllWordPosition(word, TXT)

        const clickPos = wordAllPosition.indexOf(Number(target.dataset.i))
        if (clickPos === -1) return

        const nextPos = (() => {
            const len = wordAllPosition.length
            if (altKey && metaKey) return len - 1 // 直接跳到最后一个
            if (altKey) return 0 // 直接跳到第一个

            let nextPos = clickPos + word.length * (metaKey ? -1 : 1) // meta 相反方向
            if (nextPos > len - 1) {
                return nextPos - len //处理从数组尾到头
            }
            return nextPos
        })()

        const nextIdx = wordAllPosition.at(nextPos)! //从头到尾

        gridRef.current.scrollToItem({
            align: 'center',
            rowIndex: i2rc(nextIdx, lineSize).r,
        })
    }
}

export default App
