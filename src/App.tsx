import type { item } from './comp/control'
import './App.css'
import {
    useState,
    createRef,
    useEffect,
    memo,
    useMemo,
    useCallback,
    KeyboardEvent,
} from 'react'
import { areEqual, FixedSizeGrid as Grid } from 'react-window'
import {
    getClasses,
    getStyle,
    getWordCount,
    getWordPosition,
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

const warning = `×─―—-–~≈*“”　 ·？?,，.。！％%《》‘'’⋯…．、[]［］【；：（）()/／@１２３４５６７８９０1234567890℃;`
const error = `ｉ＝ＢＣＦＫＶＷＱＩＹＬＡＭＤＴＨＮＳ`
const STR = [...warning, ...error]

const selectionObj = getSelection()!

window.nextDomIdx = []
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
    isTargetArr: number[],
    { columnIndex, rowIndex, style, isScrolling }: props
) => {
    const idx = rc2i(rowIndex, columnIndex, lineSize)
    // idx < 100 && console.time() // devtools记录模式快很多
    const word = TXT[idx]

    const classes = getClasses({
        speaking: isSpkArr[idx],
        isTarget: nextDomIdx.includes(idx),
        // isTarget: isTargetArr.includes(idx),
        // isOdd: rowIndex % 2,
    })

    const props = (function gene() {
        const wordType = getWordType(word)
        return {
            ...classes,

            style: {
                ...style,
                // ...getStyles(word),
                userSelect: isScrolling ? 'none' : 'text',

                // '--var-color': 'black',
            } as any,

            children: word,
            // key: idx, // ?

            'data-i': idx, //
            [wordType ? 'data-e' : word]: wordType ? word : '', // Recalculate Style 性能提高了非常多
            // ...(wordType ? { [word.toLowerCase()]: '' } : { word }),
        }

        function getWordType(word: string) {
            return STR.includes(word)
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
    const TXT = useTxt(lineSize)
    const isSpkArr = useSpk(TXT)

    const [isTargetArr, isTargetArrSET] = useState<number[]>([])

    const [select, setSelect] = useState('')
    const selectWrap = {
        key: select,
        color: 'black',
        i: Date.now(),
        count: getWordCount(select, TXT),
    }

    const [selectArr, setSelectArr] = useState<item[]>(
        JSON.parse(localStorage.getItem('selectArr') || '[]')
    )

    const gridRef: any = createRef()
    useEffect(() => {
        gridRef.current.scrollToItem({
            align: 'center',
            rowIndex: Number(localStorage.getItem('idx')) + 17 + OVERSCAN - 1, // 33 适应屏幕高度行数
        })
    }, [])

    const [isMetaDown, isMetaDownSet] = useState(false)
    const [isAltDown, isAltDownSet] = useState(false)
    const clickType = (() => {
        if (isMetaDown && isAltDown) return 's-resize'
        if (isMetaDown) return 'w-resize'
        if (isAltDown) return 'n-resize'
        return 'e-resize'
    })()

    useEffect(() => {
        const timer = setInterval(() => {
            const idx = document.querySelector<HTMLElement>(
                '.wrap span:first-child'
            )!.dataset.i!
            localStorage.setItem('idx', i2rc(idx, lineSize).r + '')

            localStorage.setItem('selectArr', JSON.stringify(selectArr))
        }, 1000)
        return () => clearInterval(timer)
    }, [selectArr])

    const _children = (props: props) => {
        return Cells(lineSize, TXT, isSpkArr, isTargetArr, props)
    }
    const children = useMemo(() => {
        return memo(_children, areEqual)
    }, [lineSize, isSpkArr, isTargetArr])
    const G = () => (
        <Grid
            style={{ '--clickType': clickType } as any}
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
            useIsScrolling
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
                    addHandle,
                    deleteHandle,
                }}
            />
            <div
                className='wrap'
                onClick={GoToNextItem}
                onKeyDown={keyDownHandle}
                onKeyUp={keyUpHandle}
                tabIndex={0}
            >
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
                        {getStyle(TXT, key, color, key === selectWrap.key)}
                    </style>
                ))}
            </div>
        </>
    )

    function keyDownHandle(event: KeyboardEvent) {
        if (event.metaKey) {
            isMetaDownSet(true)
        }
        if (event.altKey) {
            isAltDownSet(true)
        }
    }
    function keyUpHandle(event: KeyboardEvent) {
        if (event.key === 'Meta') {
            isMetaDownSet(false)
        }
        if (event.key === 'Alt') {
            isAltDownSet(false)
        }
    }

    function GoToNextItem({ target, metaKey, altKey }: React.MouseEvent) {
        const selectionStr = selectionObj + ''

        if (selectionStr) {
            if (selectionStr.length > 210 || selectionStr.includes('\n')) return

            if (selectionStr === select) {
                addHandle()
                return
            }
            if (selectArr.find(e => e.key === selectionStr)) {
                deleteHandle(selectionStr)
                return
            }

            setSelect(selectionStr.replaceAll(' ', ''))
            return
        }

        if (!(target instanceof HTMLElement)) return alert(1) // ?

        const content = getComputedStyle(target).content
        if (content === 'normal') return
        const word = content.slice(1, -1) //去掉引号
        const wordLen = word.length //去掉引号

        const wordPosition = getWordPosition(word, TXT)
        const len = wordPosition.length

        const clickIdx = Number(target.dataset.i)
        const clickPos = wordPosition.findIndex(
            pos => Math.abs(pos - clickIdx) < wordLen
        )
        if (clickPos === -1) return

        const nextPos = (() => {
            if (altKey && metaKey) return len - 1 // 直接跳到最后一个
            if (altKey) return 0 // 直接跳到第一个

            const nextPos = clickPos + (metaKey ? -1 : 1) // meta 相反方向
            if (nextPos === len) {
                return 0 // 点最后一个时 跳到第一个
            }
            if (nextPos === -1) {
                return len - 1 // 点最后一个时 跳到第一个
            }
            return nextPos
        })()

        const nextIdx = wordPosition.at(nextPos)! //从头到尾
        nextDomIdx = Array(wordLen)
            .fill(0)
            .map((_, i) => i + nextIdx)

        isTargetArrSET(
            Array(wordLen)
                .fill(0)
                .map((_, i) => i + nextIdx)
        )
        setTimeout(() => {
            isTargetArrSET([])
        }, 1111)

        gridRef.current.scrollToItem({
            align: 'center',
            rowIndex: i2rc(nextIdx, lineSize).r,
        })
    }

    function addHandle() {
        if (selectArr.find(e => e.key === selectWrap.key)) {
            setSelect('')
            selectionObj.removeAllRanges()
            return
        }

        setSelect('')
        setSelectArr([...selectArr, selectWrap])

        selectionObj.removeAllRanges()
    }

    function deleteHandle(key: string) {
        setSelectArr([...selectArr.filter(e => e.key !== key)])
    }
}

export default App
