const autoScrollSpeed = 1
const updataTime = 300
import {
    createElement,
    Dispatch,
    RefObject,
    SetStateAction,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { featureFlag, SIZE_H, SIZE_W } from './App'
import { runWithTime } from './debug'
import { paire, usePrevious, useWithLocalStorage } from './hookUtils'
import { config, getAllWordPosition, getClasses, hasFeature } from './utils'
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
// import _txt from '../txt/围城'
// const book = decodeURI(location.hash).slice(1) || '星之继承者（全3册）'
const forDevtool = hasFeature('short')
const _txt = (await import('../txt/' + (forDevtool ? 'test' : '围城'))).default
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
import { geneChild, geneChild2 } from './V-Grid'

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
    }, []) // 第一次render执行了两次? 与上面的useState(getter)

    return state

    function getter() {
        const min = 0
        const width = innerWidth - 100 - min - 17 /*滚轴宽度*/ - 20
        const height = innerHeight - 30 - min
        const widthCount = floor(width / SIZE_W)

        config.lineSize = widthCount
        return {
            widthCount,
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

    // const dom = useMemo(() => {
    //     console.time()
    //     requestIdleCallback(doWork)
    //     // const spking = useSpking(state, state.length)
    //     // return [...state].map(geneChild)
    //     let idx = -1
    //     const rs: any = []
    //     return rs

    //     function doWork(deadline: IdleDeadline) {
    //         while (deadline.timeRemaining()) {
    //             if (++idx > state.length) {
    //                 callback()
    //                 console.timeEnd()
    //                 return
    //             }
    //             // 现在是每个字一个child, 还是每行一个?
    //             rs.push(geneChild(state[idx], idx))
    //         }
    //         requestIdleCallback(doWork)
    //     }
    // }, [state]) // todo

    const dom2 = useMemo(() => {
        console.time()
        requestIdleCallback(doWork)
        // const spking = useSpking(state, state.length)
        // return [...state].map(geneChild)
        let idx = 0
        const rs: any = []
        return rs

        function doWork(deadline: IdleDeadline) {
            while (deadline.timeRemaining()) {
                if (idx > state.length) {
                    callback()
                    console.timeEnd()
                    return
                }
                // 现在是每个字一个child, 还是每行一个?
                rs.push(
                    geneChild2(
                        [...state.slice(idx, idx + widthCount)],
                        idx,
                        rs.length
                    )
                )
                idx += widthCount
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
        dom2,
        // featureFlag.line ? dom : dom2,
    ] as const

    function getter(): string {
        if (!useTxtCache[widthCount]) {
            useTxtCache[widthCount] = _txt
                .replaceAll(/[　\n ]+/g, '\n  ') //去掉多余空行, 注意有两种空格
                .split('\n')
                .map((e: string) => {
                    const all =
                        widthCount -
                        (e.length % widthCount || widthCount) + //第一行空格剩余补齐
                        widthCount //完整第二行

                    return e + ' '.repeat(all)
                })
                .join('')
        }

        return (config.TXT = useTxtCache[widthCount])
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
        jumpLine,
    ] as const

    function jumpLine(target: number, offset: number = 0) {
        querySelector('.container').scrollTop = target * SIZE_H - offset
    }
    function onScrollHandle(e: UIEvent) {
        if (stopScroll.get) return
        // //isScrollByMonted
        // if (timer === undefined) {
        //     timer = 0
        //     return
        // }
        const scrollTopNow = (e.target as HTMLElement).scrollTop

        if (scrollTopNow === scrollTop) return

        SET_scrollTop(scrollTopNow)
        // console.log('scrollHadnle', scrollTopNow)
        // console.log('scrollHadnle stale', scrollTop,  currentLine)

        if (getCurrentLine(scrollTopNow) === currentLine) return

        clearTimeout(timer)
        timer = setTimeout(() => {
            setUpdata((e: any) => e + 1)
        }, updataTime)
    }
    function getCurrentLine(scrollTop: number) {
        return floor(scrollTop / SIZE_H)
    }
}

const useKeyHoldRef: any = {}
export function getHoldKey(key?: string) {
    return key ? useKeyHoldRef[key + 'Hold'] : useKeyHoldRef
}
function useKeyHold(key?: string) {
    useEffect(() => {
        querySelector('#root').onkeydown = e => {
            const key = getKey(e.key)
            useKeyHoldRef[key + 'Hold'] = true
        }
        querySelector('#root').onkeyup = e => {
            const key = getKey(e.key)
            useKeyHoldRef[key + 'Hold'] = false
        }
    }, [])

    function getKey(key: string) {
        return (
            {
                Control: 'ctrl',
            }[key] || key
        )
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
    useKeyHold()
    const [isCtrlHold, SET_isCtrlHold] = useState(false)
    const [isShiftHold, SET_isShiftHold] = useState(false)
    const clickType = (() => {
        if (isCtrlHold && isShiftHold)
            return 'url(/src/assert/last.svg) 15 15, pointer'
        if (isCtrlHold) return 'url(/src/assert/prev.svg) 15 15, pointer'
        if (isShiftHold) return 'url(/src/assert/first.svg) 15 15, pointer'
        return 'url(/src/assert/next.svg) 15 15, pointer'
    })()

    return [keyDownHandle, keyUpHandle, clickType] as const

    function keyUpHandle(e: React.KeyboardEvent) {
        if (e.key === 'Control') {
            SET_isCtrlHold(false)
        }
        if (e.key === 'Shift') {
            SET_isShiftHold(false)
        }
    }

    function keyDownHandle(e: React.KeyboardEvent) {
        if (e.ctrlKey) {
            SET_isCtrlHold(true)
        }
        if (e.shiftKey) {
            SET_isShiftHold(true)
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
            runRAF(rAF, autoScrollSpeed)
        }
        return () => clearRaf(rAF)
    }, [isHovered])

    useEffect(() => {
        let rAF: refCur = { cur: 0 }

        document.onkeydown = e => {
            // keydown浏览器原生 触发频率是 32ms
            // 但现在由requestAnimationFrame触发onScrollHandle的频率是 16ms
            const val = {
                w: -30,
                s: 30,
                x: 0.1,
                z: SIZE_H / 5,
                q: -1,
                a: 1,
            }[e.key]
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

export function useMouseHover(L: number, R: number) {
    const [mouseHover, SET_mouseHover] = useState('')
    const pre = usePrevious(mouseHover)
    useLayoutEffect(() => {
        doColor(pre, 'unset')
        doColor(mouseHover, 'medium')
    }, [mouseHover])
    return [mouseHover, SET_mouseHover] as const

    function doColor(word: string | undefined, color: string) {
        getAllWordPosition(word || '')
            .filter(idx => idx > L && idx < R)
            .map(idx => querySelector(`[data-i="${idx}"]`))
            .filter(e => e)
            .forEach(e => {
                e.style['-webkit-text-stroke-width'] = color
            })
    }
}
