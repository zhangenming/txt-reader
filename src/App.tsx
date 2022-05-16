import type { item } from './comp/control'
import './App.css'
import { useState, useEffect } from 'react'

import { getStyle, getWordCount, getWordPosition, i2rc } from './utils'
import { useKey, useScroll, useSize, useSpk, useTxt } from './hook'
import Control from './comp/control'
import VGrid from './V-Grid'

const SIZE = 30
const OVERSCAN = 0 //15
const DIFF = 3

function getSelectionString() {
    //todo with hook effect
    return document.getSelection()!.toString().replaceAll('\n', '') // 处理flex回车问题
}

window.nextDomIdx = []

window.xx = 0

export default function App() {
    window.xx = 0
    const [lineSize, heightLineCount] = useSize(SIZE)

    const [TXT, TXTkey] = useTxt(lineSize)

    const [currentLine, currentLineSET, jump] = useScroll(
        TXTkey,
        heightLineCount
    )

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

    const [selectArr, selectArrSet] = useState<item[]>(
        JSON.parse(localStorage.getItem(TXTkey + 'selectArr') || '[]')
    )

    useEffect(() => {
        localStorage.setItem(TXTkey + 'selectArr', JSON.stringify(selectArr))
    }, [selectArr])

    // 列表逻辑
    useEffect(() => {
        document.onselectionchange = function () {
            // 需要通过全局函数拿值 而不是e
            const selection = getSelectionString()
            // 随便点击也会触发这个事件 值是空 覆盖到期望值
            if (selection) {
                selectSET(selection)
            }
        }
    }, [])

    var asas = 0
    return (
        <>
            <Control
                {...{
                    select,
                    selectSET,
                    selectArr,
                    deleteHandle,
                    changeHandle,
                    TXT,
                    lineSize,
                    currentLine,
                    TXTkey,
                    jump,
                    asas, // ok why, ts
                }}
                // error
                asas={0}
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
                    onCopy(e) {
                        e.preventDefault()
                        e.clipboardData.setData(
                            'text/plain',
                            getSelectionString()
                        )
                    },
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

                {[
                    {
                        key: select,
                        color: 'black',
                        i: Date.now(),
                        count: getWordCount(select, TXT),
                        isPined: false,
                    },
                    ...selectArr,
                ].map(({ key, color, isPined }, idx) => (
                    <style key={key + idx} slot={key}>
                        {getStyle(
                            TXT,
                            key,
                            color,
                            isPined || key === select,
                            idx === 0
                        )}
                    </style>
                ))}
            </div>
        </>
    )

    function GoToNextItemHandle({ target, metaKey, altKey }: React.MouseEvent) {
        const selectionStr = getSelectionString()

        // 拉选selection状态
        if (target instanceof HTMLDivElement) {
            // 拉取起始值 添加到列表
            // if (getWordCount(selectionStr, TXT) > 10) {
            //     addHandle()
            // }

            // 拉取存在值 从列表删除
            if (selectArr.find(e => e.key === selectionStr)) {
                deleteHandle(selectionStr)
                // getSelection()!.removeAllRanges()
                selectSET('')
            }
        }

        // 点击click状态
        if (target instanceof HTMLSpanElement) {
            const content = getComputedStyle(target).content
            if (content === 'normal') return
            const word = content.slice(1, -1) //去掉引号

            // 点击的是拉取状态 添加到列表
            if (select === word) {
                addHandle()
                return
            }

            // 其他点击 走跳转逻辑
            const wordPosition = getWordPosition(word, TXT)
            const len = wordPosition.length
            const wordLen = word.length

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

            jump(i2rc(nextIdx, lineSize).r)
        }
    }

    function addHandle() {
        // 为什么不需要参数
        if (select === '' || select === '\n') {
            alert(1)
            return // 什么时候会出现?
        }

        selectSET('')

        selectArrSetWrap([
            ...selectArr,
            {
                key: select,
                color: 'black',
                i: Date.now(),
                count: getWordCount(select, TXT),
                isPined: false,
            },
        ])

        getSelection()!.removeAllRanges()
    }
    function deleteHandle(key: string) {
        selectArrSetWrap(selectArr.filter(e => e.key !== key))
    }
    function changeHandle(item: item) {
        selectArrSetWrap([
            ...selectArr.filter(e => e.key !== item.key),
            {
                ...item,
            },
        ])
    }

    function selectArrSetWrap(arr: item[]) {
        selectArrSet(
            arr.sort((l, r) =>
                r.count != l.count ? r.count - l.count : r.i - l.i
            )
        )
    }
}
