const showInfo = false
const _overscan = {
    top: 0,
    bot: 0,
}
const RENDER = { app: 0, reader: 0, VG: 0 }
// console.log('APP TSX')

import type { item } from './comp/control'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
    config,
    getSelectionString,
    getStyle,
    getWord,
    getWordPosition,
    querySelector,
    querySelectorAll,
} from './utils'
import { Effect } from './comp/comp'
import {
    restoreCurrentWord,
    useKey,
    useKeyScroll,
    useScroll,
    useSizeCount,
    useTXT,
} from './hook'
import Control from './comp/control'
import VG from './V-Grid'

import { getHoldingKey, useStatePaire, useStateWithLS } from './hookUtils'
import { scrollToNext } from './reader'

export const SIZE_W = 25
export const SIZE_H = 25
const DIFF = 3

export const featureFlag = { line: false }

const APP = () => {
    const [globalWords, SET_globalWords] = useStateWithLS('_globalWords')

    if (showInfo) {
        console.log('\n')
        console.log('\n')
        console.log('↓↓↓↓↓↓↓↓↓↓↓↓')
        console.log('%c------- render begin -------------------', 'color: red;')
    }
    // runWithTime(() => {}, 1)
    RENDER.app++

    const [widthCount, heightCount] = useSizeCount() // 二级rerender first

    useTXT(widthCount)

    const [
        scrollTop,
        currentLine,
        blockL,
        blockR,
        onScrollHandle,
        stopScroll,
        overscan,
        setUpdata,
    ] = useScroll(_overscan, heightCount)

    restoreCurrentWord(currentLine, [widthCount]) // 二级rerender second

    const [refVG, hoverRef] = useKeyScroll()

    const [onKeyDown, onKeyUp, clickType] = useKey(
        overscan.get.bot,
        widthCount,
        currentLine,
        heightCount
    )

    const [selectArr, SET_selectArr] = useStateWithLS<item[]>('selectArr')
    const [feature, setFeature] = useState(true)
    const [stopControl, SET_stopControl] = useState(false)
    const pined = useStatePaire('')

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

    const ctr = (
        <Control
            {...{
                currentLine,
                tabIndex: 1,
                onKeyDown,
                onKeyUp,
                setUpdata,
                overscan,
                feature,
                setFeature,
                RENDER,
                scrollTop,
                stopControl,
                SET_stopControl,
                stopScroll,
                pined,
                selectArr,
                blockL,
                widthCount,
                heightCount,
            }}
        />
    )
    const staleCtr = useMemo(() => ctr, [stopControl])
    const control = stopControl ? staleCtr : ctr

    return (
        <>
            <Effect
                showInfo={showInfo}
                msg='------------------ effect begin ------------------'
            />
            <div className='control'>{control}</div>

            <div
                aaaaaa={'aaaaaa'}
                className='reader'
                ref={refVG}
                {...{
                    tabIndex: 1,
                    onScroll: onScrollHandle,
                    onClick: GoToNextItemHandle,
                    onKeyDown,
                    onKeyUp,
                    onMouseOver: e => {
                        querySelectorAll('.hoverByJs').forEach(node =>
                            node.classList.toggle('hoverByJs')
                        )

                        const word = getWord(e.target as Element)!
                        // ||
                        // (e.target as Element).className

                        if ([' ', ',', '。', undefined].includes(word)) return

                        // 局部匹配
                        // selectArr.map(e => {
                        //     if (e.key.includes(word) || word.includes(e.key)) {
                        //         document
                        //             .querySelectorAll(geneSelector(e.key))
                        //             .forEach(e => e.classList.add('hoverByJs'))
                        //     }
                        // })

                        querySelectorAll(geneSelector(word)).forEach(node =>
                            node.classList.toggle('hoverByJs')
                        )
                    },
                }}
            >
                {/* <div className='reader-helper' /> */}

                {useCallback<any>(
                    <VG
                        {...{
                            blockL,
                            blockR,
                            widthCount,
                            heightCount,
                            feature,
                            RENDER,
                            onScrollHandle,
                            // 不用添加进依赖 isAotOver变化不需要主动触发VG变化, 这种需求vue怎么处理?
                        }}
                    />,
                    [blockL, blockR, widthCount, heightCount]
                )}

                {/* <div
                    ref={hoverRef}
                    className='next'
                    onMouseOver={() => console.log}
                >
                    NEXT
                </div> */}
            </div>

            <div
                className='autoScrolling'
                onMouseOver={() => console.log}
            ></div>

            <>
                <style>
                    {
                        // Array(6)
                        //     .fill(null)
                        //     .map((_, i) => `span:hover ${'+span '.repeat(i)}`)
                        //     .join(',\n') + '{background:yellowgreen}'
                        // aot 卡, 使用jit
                    }
                </style>

                {(() => {
                    const styles = {
                        '--clickType': clickType,
                        '--SIZE_H': SIZE_H + 'px',
                        '--SIZE_W': SIZE_W + 'px',
                        '--readerHight': heightCount * SIZE_H + 'px',
                        '--VG_width': widthCount * SIZE_W + 'px',
                        '--VG_height': config.line2Block.length * SIZE_H + 'px',
                    }
                    const vals = Object.entries(styles).reduce(
                        (all, [key, val]) => (all += `${key}: ${val};\n`),
                        '\n'
                    )

                    return createPortal(
                        <style slot='--变量'>{`:root {${vals}}`}</style>,
                        document.head
                    )
                })()}

                {useMemo(() => {
                    return createPortal(
                        selectArr.map(
                            ({ key, color, count, isOneScreen, isPined }) => (
                                <style key={key} slot={key}>
                                    {getStyle(
                                        key,
                                        color,
                                        isPined || pined.get === key,
                                        count,
                                        isOneScreen
                                    )}
                                </style>
                            )
                        ),
                        document.head
                    )
                }, [pined, selectArr])}
            </>

            <Effect
                showInfo={showInfo}
                msg='------- render OVER -------------------'
            />
        </>
    )
    function GoToNextItemHandle({ target }: React.MouseEvent) {
        // 拉选selection状态
        if (target instanceof HTMLDivElement) {
            const selection = getSelectionString()
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

            // 删除
            if (getHoldingKey().Backspace) {
                return deleteHandle(word)
            }

            // 跳转
            const clickBlock = Number(
                querySelector('.V-Grid div:hover').dataset.block // js <-> html
            )
            const clickLineBase = config.block2Line(clickBlock)
            const clickLineoffset = Math.floor(
                [...target.parentNode!.childNodes.values()].indexOf(target) /
                    widthCount
            )
            scrollToNext(clickLineBase + clickLineoffset, word)
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
            const L = currentLine
            const R = currentLine + heightCount

            const l = count.at(0)!
            const r = count.at(-1)!
            return l >= L && r <= R
        })()

        // if (isOneScreen) {
        //     setTimeout(() => {
        //         deleteHandle(select)
        //     }, 5000)
        // }
        if (count.length === 1) {
            setTimeout(() => {
                deleteHandle(select)
            }, 1000)
        }

        SETWRAP_selectArr([
            ...selectArr,
            {
                key: select,
                color: 'mediumblue',
                i: Date.now(),
                count: count.length,
                isPined: false,
                isOneScreen: false,
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
        if ('- 0123456789'.includes(word)) return `[class="${word}"]`
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
