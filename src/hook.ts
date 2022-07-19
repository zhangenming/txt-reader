import {
    createElement,
    Dispatch,
    RefObject,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { SIZE_H, SIZE_W } from './App'
import { runWithTime } from './debug'
import { paire, useWithLocalStorage } from './hookUtils'
import { getClasses, hasFeature } from './utils'
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
// import _txt from '../txt/活着'
// const book = decodeURI(location.hash).slice(1) || '星之继承者（全3册）'
const forDevtool = hasFeature('short')
const _txt = (await import('../txt/' + (forDevtool ? 'test' : '活着'))).default
// const _txt = (await import('../txt/' + (forDevtool ? 'test' : '诡秘之主')))
//     .default

import {
    chunk,
    chunkString,
    floor,
    getWordCount,
    i2rc,
    isInvalidWord,
    makeFuncCache,
    querySelector,
    useEffectWrap,
} from './utils'
import { geneChild } from './V-Grid'

export function useSizeCount() {
    const [state, SET_state] = useState(getter)

    useEffect(() => {
        let timer: number
        window.onresize = () => {
            clearTimeout(timer)
            timer = setTimeout(function () {
                SET_state(getter)
            }, 200)
        }
    }, [])

    return state

    function getter() {
        const min = 0
        const width = innerWidth - 100 - min - 17 /*滚轴宽度*/ - 20
        const height = innerHeight - 30 - min
        return {
            widthCount: floor(width / SIZE_W),
            heightCount: floor(height / SIZE_H),
        }
    }
}
type react_SET<T = any> = React.Dispatch<React.SetStateAction<T>>

const useTxtCache: any = {}
export function useTXT(widthCount: number, callback: Function) {
    // txt(with widthCount) -> TXT
    const [state, SET_state] = useState(getter) //慢一拍

    useEffect(() => {
        SET_state(getter) //再慢一拍
    }, [widthCount])

    const dom = useMemo(() => {
        console.time()
        requestIdleCallback(doWork)
        // const spking = useSpking(state, state.length)
        // return [...state].map(geneChild)
        let idx = -1
        const rs: any = []
        return rs

        function doWork(deadline: IdleDeadline) {
            while (deadline.timeRemaining()) {
                if (++idx > state.length) {
                    callback()
                    console.timeEnd()
                    return
                }
                // 现在是每个字一个child, 还是每行一个?
                rs.push(geneChild(state[idx], idx))
            }
            requestIdleCallback(doWork)
        }
    }, [state]) // todo

    return [
        _txt,
        _txt.length,
        state,
        state.length,
        // chunkString(state, widthCount),
        1,
        dom,
    ] as const

    function getter() {
        if (!useTxtCache[widthCount]) {
            useTxtCache[widthCount] = _txt
                .replaceAll(/    /g, '  ')
                .replaceAll(/\n+/g, '\n')
                .split('\n')
                .map((e: string) => {
                    const all =
                        widthCount -
                        (e.length % widthCount || widthCount) + // 第一行空格剩余补齐
                        widthCount // 完整第二行

                    return e + ' '.repeat(all)
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
        for (let i = 0; i < TXT.length; i++) {
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

let timer: number
export function useScroll(txtLen: number, stopScroll: paire<boolean>) {
    const [updata, setUpdata] = useState(0)
    const [scrollTop, SET_scrollTop] = useWithLocalStorage('scrollTop' + txtLen)

    const currentLine = getCurrentLine(scrollTop)
    // console.log('---useScroll2', scrollTop, currentLine)
    // runWithTime(() => {})

    useEffect(() => {
        // runWithTime(() => {})
        if (querySelector('.container')) {
            console.log('monted scrollTop', scrollTop)
            querySelector('.container').scrollTop = scrollTop //触发 onScrollHandle
        }
    }, [])

    return [
        updata,
        setUpdata,
        scrollTop,
        currentLine,
        onScrollHandle,
        // useCallback(onScrollHandle, [txtLen, currentLine]),
        // useCallback/useEffect[]存在 就需注意 值过期问题
    ] as const

    function onScrollHandle(e: UIEvent) {
        if (stopScroll.get) return
        // //isScrollByMonted
        // if (timer === undefined) {
        //     timer = 0
        //     return
        // }
        const scrollTopNow = (e.target as HTMLElement).scrollTop

        if (scrollTop === scrollTopNow) return

        SET_scrollTop(scrollTopNow)
        // console.log('scrollHadnle', scrollTopNow)
        // console.log('scrollHadnle stale', scrollTop,  currentLine)

        if (currentLine === getCurrentLine(scrollTopNow)) return

        clearTimeout(timer)
        timer = setTimeout(() => {
            setUpdata((e: any) => e + 1)
        }, 100)
    }
    function getCurrentLine(scrollTop: number) {
        return floor(scrollTop / SIZE_H)
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
                const target = Number(querySelector(xx).dataset.i)
                const rc = i2rc(target, lineSize).r
                const rs =
                    DIFF + rc - currentLine - heightLineCount - OVERSCAN_bottom

                const dom = querySelector('.reader-helper').style
                dom.top = rs * SIZE_H + 'px'
                dom.height = '30px'
                dom.opacity = '0.5'
                dom.background = 'yellowgreen'

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
function useRenderCounter() {
    const ref = useRef()
    useEffect(() => {
        ref.current.textContent = Number(ref.current.textContent || '0') + 1
    })
    return createElement('span', {
        ref: ref,
    })
    // return <span ref={ref} />
}
function _useCounter(ref) {
    useEffect(() => {
        ref.current.textContent = Number(ref.current.textContent || '0') + 1
    })
}
export function useCounter(ref = useRef()) {
    useEffect(() => {
        ref.current.textContent = Number(ref.current.textContent || '0') + 1
    })
    return ref
}

export function useKeyScroll(ref: RefObject<HTMLElement>, isHovered: boolean) {
    type refCur = { cur: number }

    useEffect(() => {
        let rAF: refCur = { cur: 0 }
        if (isHovered) {
            runRAF(rAF, 0.18)
        }
        return () => clearRaf(rAF)
    }, [isHovered])

    useEffect(() => {
        let rAF: refCur = { cur: 0 }

        document.onkeydown = e => {
            // keydown浏览器原生 触发频率是 32ms
            // 但现在由requestAnimationFrame触发onScrollHandle的频率是 16ms
            const val = { w: -30, s: 30, x: 0.1, z: SIZE_H / 5 }[e.key]
            if (val) {
                e.preventDefault()
                runRAF(rAF, val)
            }
        }
        document.onkeyup = () => {
            clearRaf(rAF)
        }
    }, [])

    function runRAF(rAF: refCur, val: number) {
        if (rAF.cur) return
        ;(function run() {
            rAF.cur = requestAnimationFrame(() => {
                // todo 和useScroll2交互
                // console.log('rAF scrollTop', scrollTop)
                ref.current!.scrollTop += val //触发 onScrollHandle
                run()
            })
        })()
    }
    function clearRaf(rAF: refCur) {
        cancelAnimationFrame(rAF.cur)
        rAF.cur = 0
    }
}
