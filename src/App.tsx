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
import {
    areEqual,
    FixedSizeGrid as Grid,
    GridOnScrollProps,
} from 'react-window'
import {
    getClasses,
    getStyle,
    getWordCount,
    getWordPosition,
    i2rc,
    queryDom,
    rc2i,
    isInvalidWord,
} from './utils'
import { useKey, useScrollHandle, useSize, useTxt } from './hook'
import Control from './comp/control'

const SIZE = 30
const OVERSCAN = 2 //15
const DIFF = 3

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
    isTargetArr: number[],
    { columnIndex, rowIndex, style, isScrolling }: props
) => {
    const idx = rc2i(rowIndex, columnIndex, lineSize)
    // idx < 100 && console.time() // devtools记录模式快很多
    const word = TXT[idx]

    const classes = getClasses({
        speaking: (function test() {
            return TXT.indexOf('“', idx) > TXT.indexOf('”', idx) && word !== '”'
        })(),
        isTarget: nextDomIdx.includes(idx),
        // isTarget: isTargetArr.includes(idx),
        // isOdd: rowIndex % 2,
    })

    const props = (function gene() {
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
            // 'data-word': word, // 性能不好
            [isInvalidWord(word) ? 'data-invalid' : word]: word, // Recalculate Style 性能提高了非常多
        }
    })()

    // idx < 100 && console.timeEnd()
    return <span {...props} />
}

const gridRef: any = createRef()
function App() {
    const [readerWidth, readerHeight, lineSize, heightLineCount] = useSize(SIZE)
    const [TXT, TXTkey] = useTxt(lineSize)
    const [scrollHandle, currentLine] = useScrollHandle(lineSize)
    const [keyDownHandle, keyUpHandle, clickType] = useKey(
        OVERSCAN,
        DIFF,
        lineSize,
        currentLine,
        heightLineCount,
        SIZE,
        gridRef
    )

    const [isTargetArr, isTargetArrSET] = useState<number[]>([])

    const [select, selectSET] = useState('')
    const selectWrap = {
        key: select,
        color: 'black',
        i: Date.now(),
        count: getWordCount(select, TXT),
        isPined: false,
    }

    const [selectArr, selectArrSET] = useState<item[]>(
        JSON.parse(localStorage.getItem(TXTkey + 'selectArr') || '[]')
    )

    useEffect(() => {
        gridRef.current.scrollToItem({
            align: 'start',
            rowIndex: Number(localStorage.getItem(TXTkey + 'idx')) + OVERSCAN,
        })
        // queryDom<HTMLElement>('.wrap')!.style.display = 'block' // todo
    }, [])

    useEffect(() => {
        const timer = setInterval(() => {
            const idx = queryDom('.wrap span:first-child').dataset.i
            localStorage.setItem(
                TXTkey + 'idx',
                i2rc(Number(idx), lineSize).r + ''
            )

            localStorage.setItem(
                TXTkey + 'selectArr',
                JSON.stringify(selectArr)
            )
        }, 1000)
        return () => clearInterval(timer)
    }, [selectArr])

    const _children = (props: props) => {
        return Cells(lineSize, TXT, isTargetArr, props)
    }
    const children = useMemo(() => {
        return memo(_children, areEqual)
    }, [lineSize, isTargetArr])
    const Reader = (
        <Grid
            onScroll={scrollHandle}
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

    // const [int, intSET] = useState(1)
    // useEffect(() => {
    //     const x = setInterval(() => {
    //         intSET(int => int + 1)
    //     }, 1000)
    //     return () => clearInterval(x)
    // }, [])

    return (
        <div
            onKeyDown={keyDownHandle}
            onKeyUp={keyUpHandle}
            tabIndex={0}
            className='App'
            style={
                {
                    '--clickType': clickType,
                } as any
            }
        >
            <Control
                {...{
                    select,
                    selectSET,
                    selectArr,
                    selectArrSET,
                    selectWrap,
                    selectionObj,
                    gridRef,
                    TXT,
                    lineSize,
                    deleteHandle,
                    currentLine,
                    TXTkey,
                }}
            />
            <div className='reader' onClick={GoToNextItemHandle}>
                <div className='wrap'>
                    <div
                        className='reader-helper'
                        style={
                            {
                                '--SIZE': SIZE,
                                '--DIFF': DIFF,
                            } as any
                        }
                    ></div>
                    {Reader}
                    {/* {Reader()} */}
                    {/* <Reader /> */}
                </div>
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

                {[selectWrap, ...selectArr].map(
                    ({ key, color, isPined }, idx) => (
                        <style key={key} slot={key}>
                            {getStyle(
                                TXT,
                                key,
                                color,
                                isPined || key === selectWrap.key,
                                idx === 0
                            )}
                        </style>
                    )
                )}
            </div>
        </div>
    )

    function GoToNextItemHandle({ target, metaKey, altKey }: React.MouseEvent) {
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

            selectSET(selectionStr.replaceAll(' ', ''))
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
            selectSET('')
            selectionObj.removeAllRanges()
            return
        }

        selectSET('')
        selectArrSET(
            [...selectArr, selectWrap].sort((l, r) =>
                r.count != l.count ? r.count - l.count : r.i - l.i
            )
        )

        selectionObj.removeAllRanges()
    }

    function deleteHandle(key: string) {
        selectArrSET(
            [...selectArr.filter(e => e.key !== key)].sort((l, r) =>
                r.count != l.count ? r.count - l.count : r.i - l.i
            )
        )
    }
}

export default App
