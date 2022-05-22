import './App.css'
import type { item } from './comp/control'
import { useState, useEffect, memo } from 'react'
import {
    callWithTime,
    getStyle,
    getWordCount,
    getWordPosition,
    i2rc,
    useEffectWrap,
} from './utils'
import { useKey, useScroll, useSize, useSpk, useTXT } from './hook'
import Control from './comp/control'
import VGrid from './V-Grid'

export const SIZE = 30
const OVERSCAN = 30 //30
const DIFF = 3

function getSelectionString() {
    //todo with hook effect
    return document.getSelection()!.toString().replaceAll('\n', '') // 处理flex回车问题
}

const APP = () => {
    // const [hook, hookSET] = useState() // for clear hook count
    console.log('%c --- RENDER --- ', 'background: #222; color: #bada55')

    const { width: lineSize, height: heightLineCount } = useSize()
    const [TXT, txtLen, TXTLen] = useTXT(lineSize)
    // const spk = useSpk(TXT, TXTLen)

    const [isTargetArr, isTargetArrSET] = useState<number[]>([])
    const [currentLine, currentLineSET, jump] = useScroll(
        txtLen,
        heightLineCount
    )

    const [onKeyDown, onKeyUp, clickType] = useKey(
        OVERSCAN,
        DIFF,
        lineSize,
        currentLine,
        heightLineCount,
        jump
    )

    const [select, selectSET] = useState('')

    const [selectArr, selectArrSet] = useState<item[]>(
        JSON.parse(localStorage.getItem(txtLen + 'selectArr') || '[]')
    )

    useEffectWrap(() => {
        localStorage.setItem(txtLen + 'selectArr', JSON.stringify(selectArr))
    }, [selectArr])

    // 列表逻辑
    useEffectWrap(() => {
        document.onselectionchange = function () {
            // 需要通过全局函数拿值 而不是e
            const selection = getSelectionString()
            // 随便点击也会触发这个事件 值是空 覆盖到期望值
            if (selection) {
                selectSET(selection)
            }
        }
    }, [])

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
                    txtLen,
                    TXTLen,
                    lineSize,
                    heightLineCount,
                    currentLine,
                    jump,
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

                <div className='wrap'>
                    <VGrid
                        {...{
                            TXT,
                            lineSize,
                            heightLineCount,
                            height: (TXT.length / lineSize) * 30,
                            SIZE,
                            currentLine,
                            currentLineSET,
                            // spk,
                            OVERSCAN,
                        }}
                    />
                </div>

                <div className='next' onMouseOver={() => console.log}>
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

                <style>
                    {(() => {
                        const last = lineSize * OVERSCAN + 1
                        const selector = `.V-Grid span:is(:first-child, :nth-last-child(${last}))`
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
function APPwrap() {
    console.time()
    const rt = APP()
    console.timeEnd()
    return rt
}

export default callWithTime('APP', APP)
