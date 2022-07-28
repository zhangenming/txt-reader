import './App.css'
import './debug.js'
import type { item } from './comp/control'
import { useState, useEffect, memo, useMemo, useCallback, useRef } from 'react'
import {
    callWithTime,
    floor,
    getAllWordPosition,
    getFeature,
    getSelectionString,
    getStyle,
    getWord,
    getWordCount,
    getWordPosition,
    hasFeature,
    i2rc,
    isInvalidWord,
    querySelector,
    querySelectorAll,
    useEffectWrap,
} from './utils'
import {
    getHoldKey,
    useKey,
    useKeyScroll,
    useMouseHover,
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
import { useHover, useStatePaire, useWithLocalStorage } from './hookUtils'
// import { useScrollData } from './useSrollData'
const RENDER = { app: 0, reader: 0, VG: 0 }
;(window as any).RENDER = RENDER

export const SIZE_W = 25
export const SIZE_H = 25
const DIFF = 3

const o = !1
const OVERSCAN_top_ = o ? 0 : 0
const OVERSCAN_bottom_ = o ? 0 : 0
const OVERSCAN_change_ = o ? 0 : 10

export const featureFlag = { line: false }

const APP = () => {
    const [globalWords, SET_globalWords] = useWithLocalStorage('_globalWords')

    const showInfo = false
    if (showInfo) {
        console.log('\n')
        console.log('\n')
        console.log('↓↓↓↓↓↓↓↓↓↓↓↓')
        console.log('%c------- render begin -------------------', 'color: red;')
    }
    // runWithTime(() => {}, 1)
    RENDER.app++
    const [OVERSCAN_top, SET_OVERSCAN_top] = useState(OVERSCAN_top_)
    const [OVERSCAN_bottom, SET_OVERSCAN_bottom] = useState(OVERSCAN_bottom_)
    const [OVERSCAN_change, SET_OVERSCAN_change] = useState(OVERSCAN_change_)

    const { widthCount, heightCount } = useSizeCount()

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

    const [selectArr, SET_selectArr] = useWithLocalStorage<item[]>(
        'selectArr' + txtLen
    )

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

    const pined = useStatePaire('')

    const L = currentLine * widthCount
    const R = (currentLine + heightCount) * widthCount
    const [mouseHover, SET_mouseHover] = useMouseHover(L, R)

    const PROPS = {
        control: {
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
            OVERSCAN_top,
            SET_OVERSCAN_top,
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
            pined,
            mouseHover,
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
            TXTLen,
            mouseHover,
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
        OVERSCAN_top,
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
    let hoverWord: string
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
                    onKeyDown,
                    onKeyUp,
                    // onMouseOver: e => {
                    //     SET_mouseHover(getWord(e.target as Element) || '')
                    //     e.target.style['outline'] = 'double'
                    // },
                    // onMouseOut(e) {
                    //     e.target.style['outline'] = 'unset'
                    // },
                    ...(() => {
                        return {}
                        let tmp //cache
                        return {
                            onMouseOver: e => {
                                tmp = getAllWordPosition(
                                    getWord(e.target as Element) || ''
                                )
                                    .filter(idx => idx > L && idx < R)
                                    .map(idx =>
                                        querySelector(`[data-i="${idx}"]`)
                                    )
                                    .filter(e => e)

                                tmp.forEach(e => {
                                    e.style['-webkit-text-stroke-width'] =
                                        'medium'
                                })
                            },
                            onMouseOut(e) {
                                tmp?.forEach(e => {
                                    e.style['-webkit-text-stroke-width'] =
                                        'unset'
                                })
                            },
                        }
                    })(),

                    onMouseOver: e => {
                        document
                            .querySelectorAll('.hover')
                            .forEach(e => e.classList.remove('hover'))

                        const word = getWord(e.target as Element)!
                        // ||   (e.target as Element).className

                        if ([' ', ',', '。', undefined].includes(word)) return

                        // 局部匹配
                        selectArr.map(e => {
                            if (e.key.includes(word) || word.includes(e.key)) {
                                document
                                    .querySelectorAll(geneSelector(e.key))
                                    .forEach(e => e.classList.add('hover'))
                            }
                        })
                    },
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
                    return selectArr.map(
                        ({ key, color, count, isOneScreen }) => (
                            <style key={key} slot={key}>
                                {getStyle(
                                    TXT,
                                    key,
                                    color,
                                    pined.get === key,
                                    count,
                                    isOneScreen
                                )}
                            </style>
                        )
                    )
                }, [pined, selectArr])}
            </div>
            <Effect
                showInfo={showInfo}
                msg='------- render OVER -------------------'
            />
        </>
    )
    function GoToNextItemHandle({
        target,
        ctrlKey,
        shiftKey,
        pageY,
    }: React.MouseEvent) {
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
            const word = getWord(target)
            if (word === undefined) return

            if (getHoldKey().BackspaceHold) {
                deleteHandle(word)
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
                if (shiftKey && ctrlKey) return len - 1 // 直接跳到最后一个
                if (shiftKey) return 0 // 直接跳到第一个

                const nextPos = clickPos + (ctrlKey ? -1 : 1) // ctrl 相反方向
                if (nextPos === len) {
                    return 0 // 点最后一个时 跳到第一个
                }
                if (nextPos === -1) {
                    return len - 1 // 点最后一个时 跳到第一个
                }
                return nextPos
            })()

            const nextIdx = wordPosition.at(nextPos)! //从头到尾

            // SET_isTargetArr(
            //     Array(wordLen)
            //         .fill(0)
            //         .map((_, i) => i + nextIdx)
            // )
            // setTimeout(() => {
            //     SET_isTargetArr([])
            // }, 1111)

            jumpLine(i2rc(nextIdx, widthCount).r, pageY)
        }
    }

    function addHandle(select: string) {
        if (select === '') {
            return
        }

        SET_globalWords(e => new Set([...e, select]))
        pined.set(select)

        const count = getWordPosition(select)
        const isOneScreen = (() => {
            const l = count.at(0)!
            const r = count.at(-1)!
            return l >= L && r <= R
        })()

        if (isOneScreen) {
            setTimeout(() => {
                deleteHandle(select)
            }, 5000)
        }
        if (count.length === 1) {
            setTimeout(() => {
                deleteHandle(select)
            }, 1000)
        }

        SETWRAP_selectArr([
            ...selectArr,
            {
                key: select,
                color: 'black',
                i: Date.now(),
                count: count.length,
                isPined: false,
                isOneScreen,
                // isOneScreenWill
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

function geneSelector(word: string) {
    if (word.length === 1) {
        return '.V-Grid ' + getCls(word)
    }
    const base = word
        .split('')
        .reduce((all, now) => all + getCls(now) + '+', '')
        .slice(0, -1) //去掉末尾' +'

    const _HAS = doHas(word.length, base).join(',\n').replaceAll(':has()', '')
    const HAS = `:is(${_HAS})`

    return '.V-Grid ' + HAS

    function getCls(word: string) {
        if (' 0123456789'.includes(word)) return `[class="${word}"]`
        return `.${word}`
    }
}
export function doHas(wordLen: number, base: string) {
    const t = base.split('+')
    return Array(wordLen)
        .fill(0)
        .map((_, idx) => {
            const l = t.slice(0, idx + 1).join('+')
            const r = t.slice(idx + 1).join('+')
            return idx === wordLen - 1 ? l : `${l}:has(+${r})`
        })
}
