import { useCallback, useEffect, useState } from 'react'
import { SIZE } from './App'

// const txt = JSON.parse(localStorage.getItem('txt'))
// '三国演义'
// '循环'
// '白鹿原'
// '天道'
// '挽救计划'
// '重生之超级战舰'
// '诡秘之主'
// '活着'
// '人类大瘟疫'
// '图灵'
// '圣墟'
//
import txt from '../txt/星之继承者（全3册）'

const book = decodeURI(location.hash).slice(1) || '星之继承者（全3册）'
// const txt = (await import('../txt/' + book)).default

import { floor, i2rc, makeFuncCache, queryDom, useEffectWrap } from './utils'

export function useSizeCount() {
    const call = useCallback(makeFuncCache(getter), [])

    const [state, SET_state] = useState(call)

    useEffect(() => {
        window.onresize = () => {
            SET_state(call)
        }
    }, [state])

    return state

    function getter() {
        const min = 0
        const width = innerWidth - 100 - min - 15 /*滚轴宽度*/
        const height = innerHeight - 30 - min
        return {
            widthCount: floor(width / SIZE),
            heightCount: floor(height / SIZE),
        }
    }
}

const useTxtCache: any = {}
export function useTXT(widthCount: number) {
    // txt(with widthCount) -> TXT
    const [state, SET_state] = useState(getter)

    useEffect(() => {
        SET_state(getter)
    }, [widthCount])

    return [state, state.length, txt.length] as const

    function getter(): string {
        if (!useTxtCache[widthCount]) {
            useTxtCache[widthCount] = txt
                .split('\n')
                .map((e: string) => {
                    const all =
                        widthCount -
                        (e.length % widthCount || widthCount) + // 第一行空格剩余补齐
                        widthCount // 完整第二行

                    return e + '〇'.repeat(all)
                })
                .join('')
        }
        return useTxtCache[widthCount]
    }
    // todo 全局处理->局部加载
}

export function useSpking(TXT: string, TXTLen: number) {
    // todo 全局处理->局部加载
    const call = useCallback(makeFuncCache(getter), [TXTLen])
    const [state, SET_state] = useState(call)

    useEffect(() => {
        SET_state(call)
    }, [TXTLen])

    return state

    function getter() {
        const results = []

        let isSpeaking = false
        for (let i = 0; i < TXT.length / 10; i++) {
            if (TXT[i] === '“') {
                isSpeaking = true
                results.push(false)
            } else if (TXT[i] === '”') {
                isSpeaking = false
                results.push(false)
            } else {
                results.push(isSpeaking)
            }
        }

        return results
    }
}

export function useScroll(txtLen: number, heightLineCount: number) {
    const [state, SET_state] = useState(() =>
        Number(localStorage.getItem(txtLen + 'idx'))
    ) // 函数形式只会执行一次

    useEffect(() => {
        queryDom('.container').scrollTop = state * SIZE // todo, dom -> react ref?
    }, [])

    return [state, useCallback(SET, [txtLen]), jumpLine] as const

    function jumpLine(_target: number) {
        const target = _target - floor(heightLineCount / 2)

        SET(target)
        queryDom('.container').scrollTop = target * SIZE
    }

    function SET(n: number) {
        SET_state(n)
        localStorage.setItem(txtLen + 'idx', n + '')
    }
}

let clear: number
export function useKey(
    OVERSCAN_bottom: number,
    DIFF: number,
    lineSize: number,
    currentLine: number,
    heightLineCount: number,
    jump: (target: number) => void
) {
    const [isMetaHold, SET_isMetaHold] = useState(false)
    const [isAltHold, SET_isAltHold] = useState(false)
    const clickType = (() => {
        if (isMetaHold && isAltHold) return 's-resize'
        if (isMetaHold) return 'w-resize'
        if (isAltHold) return 'n-resize'
        return 'e-resize'
    })()

    return [keyDownHandle, keyUpHandle, clickType] as const

    function keyUpHandle(e: React.KeyboardEvent) {
        if (e.key === 'Meta') {
            SET_isMetaHold(false)
        }
        if (e.key === 'Alt') {
            SET_isAltHold(false)
        }
    }

    function keyDownHandle(e: React.KeyboardEvent) {
        if (e.metaKey) {
            SET_isMetaHold(true)
        }
        if (e.altKey) {
            SET_isAltHold(true)
        }
        if (e.code === 'Space') {
            setTimeout(() => {
                const x = (OVERSCAN_bottom + DIFF) * lineSize
                const xx = `:nth-child(${x}) ~ :not([data-invalid=" "])` // magic
                const target = Number(queryDom(xx).dataset.i)
                const rc = i2rc(target, lineSize).r
                const rs =
                    DIFF + rc - currentLine - heightLineCount - OVERSCAN_bottom

                const dom = queryDom('.reader-helper').style
                dom.top = rs * SIZE + 'px'
                dom.height = '30px'
                dom.opacity = '0.5'
                dom.background = 'yellowgreen'

                // console.log(clear) // react

                clearTimeout(clear)

                clear = setTimeout(() => {
                    dom.height = '0'
                    dom.opacity = '0'
                    dom.background = 'cornflowerblue'
                }, 1111)
            })

            jump(currentLine + OVERSCAN_bottom + heightLineCount - DIFF)
        }
    }
}
