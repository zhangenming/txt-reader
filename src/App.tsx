import './App.css'
import { useState, createRef, useEffect, useCallback, useMemo } from 'react'
import Grid from './react-window'
import { getAllWordPosition, getClasses, getStyle, getWordCount } from './utils'
import { useSize, useSpk, useTxt } from './hook'

const selectionObj = getSelection()!

const Cells = (
    columnCount: number,
    TXT: string,
    isSpkArr: boolean[],
    {
        columnIndex,
        rowIndex,
        style,
        isScrolling,
    }: {
        columnIndex: number
        rowIndex: number
        style: object
        isScrolling?: boolean
    }
) => {
    const idx = rowIndex * columnCount + columnIndex
    // idx < 100 && console.time() // devtools记录模式快很多
    const word = TXT[idx]

    const classes = getClasses({
        speaking: isSpkArr[idx],
        // isOdd: rowIndex % 2,
    })

    const props = (function gene() {
        return {
            ...classes,

            style: {
                ...style,
                ...getStyles(word),
                // userSelect: isScrolling ? 'none' : 'text',

                '--var-color': 'black',
            } as any,

            children: word,
            // key: idx, // ?

            'data-e': word,
            'data-i': idx,
            // 'data-next': targetNextIdx,
            'data-rowindex': rowIndex,
            'data-columnindex': columnIndex,
            // 'data-index': index,
        }
    })()
    // idx < 100 && console.timeEnd()
    return <span {...props} />

    function getStyles(word: string) {
        const style1 = word === '“' || word === '('
        const style2 = word === '”' || word === ')'
        const style3 = word === ' ' || word === '　'

        return {
            ...(style1 && {
                textAlign: 'right',
            }),
            ...(style2 && {
                textAlign: 'left',
            }),
            ...(style3 &&
                {
                    // fontSize: '0',
                    // 'user-select': 'none',
                }),
        }
    }
}

export default function App() {
    const [readerWidth, readerHeight] = useSize()
    const itemSize = 30
    const columnCount = Math.floor(readerWidth / itemSize) - 1
    const TXT = useTxt(columnCount) //299e81

    const isSpkArr = useSpk(TXT)

    const gridRef: any = createRef()

    useEffect(() => {
        gridRef.current.scrollToItem({
            align: 'center',
            rowIndex: Number(localStorage.getItem('idx')) + 17, // 33 适应屏幕高度行数
        })
        const timer = setInterval(() => {
            const idx = document.querySelector<HTMLElement>(
                '.wrap span:first-child'
            )
            localStorage.setItem('idx', idx!.dataset.rowindex!)
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const [select, setSelect] = useState('')
    const [selectArr, setSelectArr] = useState<string[]>([])

    function add() {
        setSelect('')
        setSelectArr([...selectArr, select])

        selectionObj.removeAllRanges()
    }

    const CELL = useCallback(Cells.bind(0, columnCount, TXT, isSpkArr), [
        columnCount,
        TXT,
        isSpkArr,
    ]) // 尝试使用对象引用传值{}

    const G = useMemo(() => {
        console.log(1)
        return () => {
            console.log(2)
            return (
                <Grid
                    // onScroll={e => console.log(3)}
                    // item counts
                    columnCount={columnCount}
                    rowCount={TXT.length / columnCount}
                    // item style
                    columnWidth={itemSize}
                    rowHeight={itemSize}
                    // wrap style
                    height={readerHeight}
                    width={readerWidth}
                    // else
                    ref={gridRef}
                    useIsScrolling
                    children={CELL}
                />
            )
        }
    }, [gridRef])

    return (
        <>
            <div className='control'>
                {/* <p>行长度:{columnCount}</p> */}

                <div className='count'>
                    <button onClick={add}>add</button>
                    {getWordCount(TXT, select)}
                </div>

                <input
                    type='text'
                    value={select}
                    onChange={e => setSelect(e.target.value)}
                />

                {selectArr.join('\n')}
            </div>

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

                {[select, ...selectArr].map((select, key) => (
                    <style key={key}>{getStyle(TXT, select, 'red')}</style>
                ))}

                <style>
                    {`
                        .isSpeaking {
                            background:#6666ee
                        }
                    `}
                </style>
                <script>{`console.log(3)`}</script>
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

        const wordAllPosition = getAllWordPosition(TXT, word)

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

        const nextIdx = wordAllPosition.at(nextPos) //从头到尾

        gridRef.current.scrollToItem({
            align: 'center',
            rowIndex: Math.floor(nextIdx! / columnCount),
        })
    }
}
