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
    getStyle,
    getWord,
    getWordPosition,
    querySelector,
    querySelectorAll,
} from './utils'
import { Effect, UseMouseScroll } from './comp/comp'
import {
    restoreCurrentWord,
    useKey,
    useLoad,
    useScroll,
    useSizeCount,
    useTXT,
    config,
} from './hook'
import Control from './comp/control'
import VG from './V-Grid'

import {
    getHoldingKey,
    usePrevious,
    useStatePaire,
    useStateWithLS,
} from './hookUtils'
import { hoverWords, scrollToNext, useHoverWords } from './reader'

export const SIZE_W = 25
export const SIZE_H = 25

import mc from '../txt/mc'

const APP = () => {
    RENDER.app++

    const [widthCount, heightCount] = useSizeCount() // 二级rerender first
    // const [txt, SET_load] = useLoad()
    useTXT(widthCount, mc)

    const [
        scrollTop,
        currentLine,
        blockL,
        blockR,
        onScrollHandle,
        stopScroll,
        overscan,
        setUpdata,
    ] = useScroll(_overscan, widthCount, heightCount)

    const [onKeyDown, onKeyUp, clickType] = useKey(
        overscan.get.bot,
        widthCount,
        currentLine,
        heightCount
    )

    const [globalWords, SET_globalWords] = useStateWithLS('_globalWords')
    const [selectArr, SET_selectArr] = useStateWithLS<item[]>('selectArr')
    const pined = useStatePaire('')

    const [hoverWord, SET_hoverWord, searchItems] = useHoverWords()

    return (
        <>
            <div className='control'>
                <div>
                    {(() => {
                        const [x, setX] = useState(0)
                        return (
                            <>
                                <button onClick={() => setX(x + 1)}>
                                    add x
                                </button>
                                {Array(1e3 + x)
                                    .fill(1)
                                    .map((e, i) => (
                                        <span>{i}</span>
                                    ))}
                            </>
                        )
                    })()}
                </div>
                <Control
                    {...{
                        currentLine,
                        setUpdata,
                        overscan,
                        RENDER,
                        scrollTop,
                        stopScroll,
                        pined,
                        selectArr,
                        blockL,
                        widthCount,
                        heightCount,
                        changeHandle,
                        hoverWord,
                        SET_hoverWord,
                    }}
                />
            </div>

            <div
                className='reader'
                {...{
                    onScroll: onScrollHandle,
                    onClick: GoToNextItemHandle,
                    onMouseOver: e =>
                        SET_hoverWord(getWord(e.target as Element)!),
                    // onMouseOver: e => {
                    //     const word = getWord(e.target as Element)
                    //     if (word === hoverWord) return // usefull for react
                    //     SET_hoverWord(word)
                    // },

                    onKeyDown,
                    onKeyUp,
                }}
            >
                {useCallback<any>(
                    <VG
                        {...{
                            blockL,
                            blockR,
                            // 不用添加进依赖 isAotOver变化不需要主动触发VG变化, 这种需求vue怎么处理?
                        }}
                    />,
                    [blockL, blockR]
                )}
            </div>

            {/* {
                UseMouseScroll({ speed: 0.1 })
                // memo后不能函数调用了
            } */}
            <UseMouseScroll speed={0.1} />

            {/* cache dom, use display */}
            <div className='search'>{searchItems}</div>

            <>
                {/* <style>
                    {
                        Array(6)
                            .fill(null)
                            .map((_, i) => `span:hover ${'+span '.repeat(i)}`)
                            .join(',\n') + '{background:yellowgreen}'
                        // aot 卡, 使用jit
                    }
                </style> */}

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
        </>
    )

    function GoToNextItemHandle({ target }: React.MouseEvent) {
        // 拉选selection状态
        if (target instanceof HTMLDivElement) {
            const select = getSelection()!
            const selection = select.toString().replaceAll(/\n/g, '')

            if (selectArr.find(e => e.key === selection)) {
                deleteHandle(selection)
            } else {
                addHandle(selection)
            }
            select.removeAllRanges()
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
            const clickLineBase = config.block2Line[clickBlock]
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
        setTimeout(() => {
            pined.set('')
        }, 1000)

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
