import './App.css'
import type { item } from './comp/control'
import { useState, useEffect, memo, useMemo, useCallback } from 'react'
import {
    callWithTime,
    getSelectionString,
    getStyle,
    getWordCount,
    getWordPosition,
    i2rc,
    useEffectWrap,
} from './utils'
import { useKey, useScroll, useSizeCount, useSpking, useTXT } from './hook'
import Control from './comp/control'
import VGrid from './V-Grid'

export const SIZE = 30
const OVERSCAN_top = 0
const OVERSCAN_bottom = 0
const DIFF = 3

let REDNER = 0
const APP = () => {
    // const [hook, hookSET] = useState() // for clear hook count, 本身也会引入新的计数
    console.log('%c --- RENDER --- ', 'background: #222; color: #bada55')

    const { widthCount, heightCount } = useSizeCount()
    const [TXT, TXTLen, txtLen] = useTXT(widthCount)
    const spking = useSpking(TXT, TXTLen)

    const [currentLine, SET_currentLine, jumpLine] = useScroll(
        txtLen,
        heightCount
    )

    const [onKeyDown, onKeyUp, clickType] = useKey(
        OVERSCAN_bottom,
        DIFF,
        widthCount,
        currentLine,
        heightCount,
        jumpLine
    )

    const [select, SET_select] = useState('')

    const [selectArr, SET_selectArr] = useState<item[]>(
        JSON.parse(localStorage.getItem(txtLen + 'selectArr') || '[]')
    )

    useEffect(() => {
        localStorage.setItem(txtLen + 'selectArr', JSON.stringify(selectArr))
    }, [selectArr])

    // 列表逻辑
    useEffect(() => {
        document.onselectionchange = function () {
            // 需要通过全局函数拿值 而不是e
            const selection = getSelectionString()
            // 随便点击也会触发这个事件 值是空 覆盖到期望值
            if (selection) {
                SET_select(selection)
            }
        }
    }, [])

    const [isTargetArr, SET_isTargetArr] = useState<number[]>([])

    return (
        <>
            <Control
                {...{
                    select,
                    SET_select,
                    selectArr,
                    deleteHandle,
                    changeHandle,
                    TXT,
                    TXTLen,
                    txtLen,
                    widthCount,
                    heightCount,
                    currentLine,
                    jump: jumpLine,
                    tabIndex: 1,
                    onKeyDown,
                    onKeyUp,
                }}
            />

            <div
                {...{
                    className: 'reader',
                    style: {
                        '--clickType': clickType,
                    },
                    onClick: GoToNextItemHandle,
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

                {useCallback(
                    (
                        <VGrid
                            {...{
                                TXT,
                                widthCount,
                                heightCount,
                                currentLine,
                                SET_currentLine,
                                spking,
                                OVERSCAN_top,
                                OVERSCAN_bottom,
                            }}
                        />
                    ) as any,
                    [Math.round(currentLine / 10)]
                )}

                <div className='next' onMouseOver={() => console.log}>
                    NEXT {++REDNER}
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

                <style>
                    {(() => {
                        const first = OVERSCAN_top * widthCount + 1
                        const last = OVERSCAN_bottom * widthCount + 1
                        const selector = `.V-Grid span:is(:nth-child(${first}), :nth-last-child(${last}))`
                        return selector + ` \n\n {background: steelblue;}`
                    })()}
                </style>

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
            } else {
                addHandle()
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

            SET_isTargetArr(
                Array(wordLen)
                    .fill(0)
                    .map((_, i) => i + nextIdx)
            )
            setTimeout(() => {
                SET_isTargetArr([])
            }, 1111)

            jumpLine(i2rc(nextIdx, widthCount).r)
        }
    }

    function addHandle() {
        // 为什么不需要参数
        if (select === '' || select === '\n') {
            alert(1)
            return // 什么时候会出现?
        }

        SET_select('')

        SETWRAP_selectArr([
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
        SET_select('')
        SETWRAP_selectArr(selectArr.filter(e => e.key !== key))
    }
    function changeHandle(item: item) {
        SETWRAP_selectArr([
            ...selectArr.filter(e => e.key !== item.key),
            {
                ...item,
            },
        ])
    }

    function SETWRAP_selectArr(arr: item[]) {
        SET_selectArr(
            arr.sort((l, r) =>
                r.count != l.count ? r.count - l.count : r.i - l.i
            )
        )
    }
}
function APPwrap() {
    console.time()
    const rt = APP()
    console.timeEnd()
    return rt
}

export default callWithTime('APP', APP)
