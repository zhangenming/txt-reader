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
    getClasses,
    getStyle,
    getWordCount,
    getWordPosition,
    i2rc,
    queryDom,
    rc2i,
    isInvalidWord,
} from './utils'
import { useKey, useScroll, useSize, useSpk, useTxt } from './hook'
import Control from './comp/control'
import VGrid from './V-Grid'

const SIZE = 30
const OVERSCAN = 0 //15
const DIFF = 3

const gridRef: any = createRef()
const selectionObj = getSelection()!

window.nextDomIdx = []

window.xx = 0

export default function App() {
    window.xx = 0
    const [lineSize, heightLineCount] = useSize(SIZE)

    const [TXT, TXTkey] = useTxt(lineSize)

    const [currentLine, currentLineSET, jump] = useScroll(TXTkey)

    const spk = useSpk(TXT)

    const [keyDownHandle, keyUpHandle, clickType] = useKey(
        OVERSCAN,
        DIFF,
        lineSize,
        currentLine,
        heightLineCount,
        SIZE,
        jump
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
        const timer = setInterval(() => {
            localStorage.setItem(
                TXTkey + 'selectArr',
                JSON.stringify(selectArr)
            )
        }, 1000)

        return () => clearInterval(timer)
    }, [selectArr])

    return (
        <>
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
                    jump,
                    heightLineCount,
                }}
            />

            <div
                {...{
                    className: 'reader',
                    style: {
                        '--clickType': clickType,
                    } as any,
                    onClick: GoToNextItemHandle,
                    onKeyDown: keyDownHandle,
                    onKeyUp: keyUpHandle,
                    tabIndex: 0,
                }}
            >
                <div className='reader-helper' />

                <VGrid
                    {...{
                        TXT,
                        lineSize,
                        heightLineCount,
                        height: (TXT.length / lineSize) * 30,
                        SIZE,
                        currentLine,
                        currentLineSET,
                        spk,
                        OVERSCAN,
                    }}
                />

                <div className='next' onMouseOver={() => console.log(1)}>
                    NEXT
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
        </>
    )

    function GoToNextItemHandle({ target, metaKey, altKey }: React.MouseEvent) {
        const selectionStr = selectionObj.toString().replaceAll('\n', '') // why?

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
            (pos: number) => Math.abs(pos - clickIdx) < wordLen
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

        jump(i2rc(nextIdx, lineSize).r - heightLineCount / 2)
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
