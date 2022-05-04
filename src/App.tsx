import './App.css'
import { useState, createRef, useEffect, useCallback } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'

// import txt from '../txt/三国演义'
import txt from '../txt/循环'
// import txt from '../txt/白鹿原'
import items from './data'
import { getAllWordPosition, getClasses, getStyle } from './utils'

function useSize() {
    const [Width, setWidth] = useState(innerWidth - 100)
    const [Height, setHeight] = useState(innerHeight)
    useEffect(() => {
        window.onresize = function () {
            setWidth(innerWidth - 100)
            setHeight(innerHeight)
        }

        return () => {}
    }, [])

    return [Width, Height]
}
function useTxt(n: number) {
    const [TXT, setTXT] = useState(setFunc)
    useEffect(() => {
        setTXT(setFunc)
    }, [n])
    return TXT

    function setFunc() {
        return txt
            .replaceAll('\n', '\n')
            .split('\n')
            .filter(e => e)
            .map(e => e + ' '.repeat(n) + ' '.repeat(n - (e.length % n || n)))
            .join('')
    }
}
function useSpk(TXT: string) {
    const [SPK, setSPK] = useState<boolean[]>([])

    useEffect(() => {
        let isSpeaking = false
        const arr = [...TXT].map(e => {
            if (e === '“') {
                isSpeaking = true
                return false
            }
            if (e === '”') {
                isSpeaking = false
                return false
            }
            return isSpeaking
        })
        setSPK(arr)
    }, [TXT])
    return SPK
}
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

    const [select, setSelect] = useState('版权归')

    const gridRef = createRef<Grid>()

    useEffect(() => {
        gridRef.current?.scrollToItem({
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

    const CELL = useCallback(Cells.bind(0, columnCount, TXT, isSpkArr), [
        columnCount,
        TXT,
        isSpkArr,
    ]) // 尝试使用对象引用传值{}

    return (
        <>
            <div className='control'>
                <p>行长度:{columnCount}</p>

                <input
                    type='text'
                    value={select}
                    onChange={e => setSelect(e.target.value)}
                />
                <button onClick={add}>add</button>
                {TXT.split(select).length - 1}

                <style>
                    {`
                        .isSpeaking {
                            background:#6666ee
                        }
                    `}
                </style>
                <script>{`console.log(3)`}</script>
            </div>

            <div className='resourse'>
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

                {/* {items.map(([color, roles], key) => (
                    <style key={key}>
                        {roles
                            .filter(e => e)
                            .map(word =>
                                getStyle(TXT, columnCount, word, color)
                            )}
                    </style>
                ))} */}
                <style>{getStyle(TXT, select, 'red')}</style>
            </div>

            <div className='wrap' onClick={GoToNextItem}>
                <Grid
                    ref={gridRef}
                    useIsScrolling
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
                >
                    {
                        CELL
                        // renderProps =>
                        //     Cells(renderProps, columnCount, TXT, isSpkArr)
                    }
                </Grid>
            </div>
        </>
    )
    function add() {}

    function GoToNextItem({ target, metaKey, altKey }: React.MouseEvent) {
        const selectionObj = getSelection()
        if (!selectionObj) return

        const selectionStr = selectionObj.toString()

        // selectionObj.removeAllRanges()
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

        gridRef.current?.scrollToItem({
            align: 'center',
            // columnIndex: nextIdx! % columnCount,
            rowIndex: Math.floor(nextIdx! / columnCount),
        })
    }
}
