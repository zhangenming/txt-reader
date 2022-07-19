import './App.css'
import './debug.js'
import type { item } from './comp/control'
import { useState, useEffect, memo, useMemo, useCallback, useRef } from 'react'
import {
    callWithTime,
    floor,
    getSelectionString,
    getStyle,
    getWordCount,
    getWordPosition,
    hasFeature,
    i2rc,
    useEffectWrap,
} from './utils'
import {
    useKey,
    useKeyScroll,
    useScroll,
    useSizeCount,
    useSpking,
    useTXT,
} from './hook'
import Control from './comp/control'
import VG from './V-Grid'
const VGM = memo(VG)

import { Effect } from './comp/comp'
import { runWithTime } from './debug.js'
import { useHover, useStatePaire } from './hookUtils'
// import { useScrollData } from './useSrollData'
const RENDER = { app: 0, reader: 0, VG: 0 }
;(window as any).RENDER = RENDER

export const SIZE_W = 25
export const SIZE_H = 25
const DIFF = 3

const o = !1
const OVERSCAN_top = o ? 0 : 10
const OVERSCAN_bottom_ = o ? 0 : 30
const OVERSCAN_change_ = o ? 0 : 10

const APP = () => {
    const showInfo = false
    if (showInfo) {
        console.log('\n')
        console.log('\n')
        console.log('↓↓↓↓↓↓↓↓↓↓↓↓')
        console.log('%c------- render begin -------------------', 'color: red;')
    }
    // runWithTime(() => {}, 1)
    RENDER.app++
    const [OVERSCAN_bottom, SET_OVERSCAN_bottom] = useState(OVERSCAN_bottom_)
    const [OVERSCAN_change, SET_OVERSCAN_change] = useState(OVERSCAN_change_)

    const { widthCount, heightCount } = useSizeCount()

    // const { scrolling } = useScrollData()
    const [isAotOver, SET_isAotOver] = useState(false)
    const [txt, txtLen, TXT, TXTLen, TXTBlock, txtDOM] = useTXT(
        widthCount,
        () => SET_isAotOver(true)
    )

    // const spking = useSpking(TXT, TXTLen)
    const refVG = useRef<HTMLElement>(null)
    const [hoverRef, isHovered] = useHover()
    useKeyScroll(refVG, isHovered)

    const stopScroll = useStatePaire(false)
    const [
        updata,
        setUpdata,
        scrollTop,
        currentLine,
        onScrollHandle,
        jumpLine,
    ] = useScroll(txtLen, stopScroll)

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
            return
            // 需要通过全局函数拿值 而不是e
            const selection = getSelectionString()
            // 随便点击也会触发这个事件 值是空 覆盖到期望值
            if (selection) {
                SET_select(selection)
            }
        }
    }, [])

    const [isTargetArr, SET_isTargetArr] = useState<number[]>([])

    const [feature, setFeature] = useState(true)

    showInfo &&
        useEffect(() => {
            console.log(
                '%c------------------ effect OVER -------------------',
                'color: red;'
            )
            // runWithTime(() => {}, 4)
            console.log('↑↑↑↑↑↑↑↑↑↑↑↑')
            console.log('\n')
            console.log('\n')
        })

    const [stopControl, SET_stopControl] = useState(false)

    const PROPS = {
        control: {
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
            jumpLine,
            tabIndex: 1,
            onKeyDown,
            onKeyUp,
            setUpdata,
            OVERSCAN_change,
            SET_OVERSCAN_change,
            OVERSCAN_bottom,
            SET_OVERSCAN_bottom,
            feature,
            setFeature,
            RENDER,
            scrollTop,
            isAotOver,
            stopControl,
            SET_stopControl,
            stopScroll,
        },
        VG: {
            TXT,
            widthCount,
            heightCount,
            currentLine,
            // spking,
            OVERSCAN_top,
            OVERSCAN_bottom,
            ref: refVG,
            TXTBlock,
            txtDOM,
            feature,
            RENDER,
            onScrollHandle,
            isAotOver, // 不用添加进依赖 isAotOver变化不需要主动触发VG变化, 这种需求vue怎么处理?
        },
    }

    const ctr = <Control {...PROPS.control} ref={hoverRef} />
    const staleCtr = useMemo(() => ctr, [stopControl])
    const control = stopControl ? staleCtr : ctr

    const deps_VG = [
        widthCount,
        heightCount,
        TXT,
        updata,
        false && floor(currentLine / (OVERSCAN_change || 1)),
        OVERSCAN_bottom,
        stopScroll.get,
    ]

    const callback = useCallback(<VG {...PROPS.VG} />, deps_VG)
    // const mm = useMemo(() => {
    //     RENDER.VG++ // 副作用
    //     return <VG {...PROPS.VG} />
    // }, deps_VG)

    // // memo到哪个层级?
    // const vgm = <VGM {...useMemo(() => PROPS.VG, deps_VG)} />

    // const controlmm = useMemo(() => <Control />, [currentLine])

    return (
        <>
            <Effect
                showInfo={showInfo}
                msg='------------------ effect begin ------------------'
            />

            {/* <Control /> */}
            {/* {controlmm} */}
            {control}

            <div
                {...{
                    className: 'reader',
                    style: {
                        '--clickType': clickType,
                        '--SIZE_H': SIZE_H + 'px',
                        '--SIZE_W': SIZE_W + 'px',
                    },
                    onClick: GoToNextItemHandle,
                }}
            >
                <div className='reader-helper' />

                {callback}

                <div
                    ref={hoverRef}
                    className='next'
                    onMouseOver={() => console.log}
                >
                    {(OVERSCAN_top + OVERSCAN_bottom + heightCount) *
                        widthCount}
                    NEXT
                    {/* -- {scrolling ? 1 : 2} */}
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

                {/* <style>
                    {(() => {
                        const first = OVERSCAN_top * widthCount + 1
                        const last = OVERSCAN_bottom * widthCount + 1
                        const selector = `.V-Grid span:is(:nth-child(${first}), :nth-last-child(${last}))`
                        return selector + ` \n\n {background: steelblue;}`
                    })()}
                </style> */}

                {useMemo(() => {
                    return [
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
                    ))
                }, [select, selectArr])}
            </div>
            <Effect
                showInfo={showInfo}
                msg='------- render OVER -------------------'
            />
        </>
    )
    function GoToNextItemHandle({ target, metaKey, altKey }: React.MouseEvent) {
        const selection = getSelectionString()

        // 拉选selection状态
        if (target instanceof HTMLDivElement) {
            // console.log('div', selection)

            // 拉取存在值 从列表删除
            if (selectArr.find(e => e.key === selection)) {
                deleteHandle(selection)
            } else {
                addHandle(selection)
            }
        }

        // 点击click状态
        if (target instanceof HTMLSpanElement) {
            // console.log('span', selection)

            const content = getComputedStyle(target).content // js <-> css
            if (content === 'normal') return
            const word = content.slice(1, -1) //去掉引号

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

    function addHandle(select: string) {
        if (select === '') {
            return
        }

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

export default APP
