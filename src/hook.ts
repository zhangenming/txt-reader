const autoScrollSpeed = 1
import {
    createElement,
    RefObject,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { SIZE_H, SIZE_W } from './App'
import { paire, usePrevious, useStatePaire, useStateWithLS } from './hookUtils'
import { config, getAllWordPosition, hasFeature } from './utils'
import { chunkString, floor, i2rc, querySelector } from './utils'
import { geneBlock } from './V-Grid'

import _txt from '../txt/mc'
const txt = hasFeature('test') ? (await import('../txt/test')).default : _txt
config.txt = txt

type react_SET<T = any> = React.Dispatch<React.SetStateAction<T>>

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
        const widthCount = floor(width / SIZE_W)
        const heightCount = floor(height / SIZE_W)

        return [widthCount, heightCount]
    }
}

export function useTXT(widthCount: number) {
    // useEffect deps也能达到缓存减少rerender目的? 和useMemo什么区别?
    useMemo(() => {
        config.JIT = getJIT()
        config.AOT = getAOT()
        config.LINE = getLines()
        config.line2Block = (() => {
            let block = -1
            return config.LINE.map(line => {
                if (line.startsWith(' ')) {
                    block++
                }
                return block
            })
        })()
        config.block2Line = block =>
            config.line2Block.findIndex(e => e === block)
    }, [widthCount])

    function LR2lr(L: number, R: number) {}

    function getJIT() {
        return (
            txt //去掉多余空行, 注意有两种空格
                .replaceAll(/[　\n ]+/g, '\n')
                // .replaceAll(/\n　　/g, '\n')
                // // 段落
                .replaceAll(/\n/g, '\n\n')
                // 句号
                // .replaceAll(/(?<!“[^“”]*?)(。|？|！)/g, '$1\n\n')
                // // 下引号
                // .replaceAll(/(。|？|！)”/g, '$1”\n\n')
                // // 逗号
                // .replaceAll(/(?<!“[^“”]*?)，/g, '，\n')
                .split('\n')
                .map(block => '  ' + block)
        )
    }
    function getLines() {
        return (
            config.JIT
                // split and join
                .flatMap(function lineMaybeSplit(block) {
                    return chunkString(block, widthCount)
                })
            // .reduce(function lineMaybeJoin(
            //     accLine: string[],
            //     nowLine,
            //     idx,
            //     arr
            // ) {
            //     if (hasFeature('x')) {
            //         if (nowLine.includes('种种种种')) {
            //             // debugger
            //         }
            //         const preLine = accLine.at(-1)
            //         const nextLine = arr[idx + 1]
            //         if (
            //             preLine?.includes('，') &&
            //             preLine?.startsWith('  ') &&
            //             preLine?.length + nowLine.length < widthCount / 2 &&
            //             preLine?.length + nowLine.length >
            //                 nowLine.length + nextLine.length &&
            //             nowLine !== '  '
            //         ) {
            //             // nowLine.ll
            //             accLine[accLine.length - 1] += nowLine.slice(2)
            //         } else {
            //             accLine.push(nowLine)
            //         }
            //     } else {
            //         accLine.push(nowLine)
            //     }
            //     return accLine
            //     // return [...accLine, nowLine]
            //     // return accLine.concat(nowLine)
            // },
            // [])
        )
    }
    function getAOT() {
        if (hasFeature('aot')) {
            console.time('AOT done')
            requestIdleCallback(doWork)
        }
        return []

        function doWork(deadline: IdleDeadline) {
            const { JIT, AOT } = config // 这时候AOT拿到的是return []的[]
            while (deadline.timeRemaining()) {
                if (AOT.length === JIT.length) {
                    console.timeEnd('AOT done')
                    return
                }
                AOT.push(geneBlock(JIT[AOT.length], AOT.length))
            }
            requestIdleCallback(doWork)
        }
    }
}

export function useScroll(
    _overscan: {
        top: number
        bot: number
    },
    heightCount: number
) {
    const stopScroll = useStatePaire(false)
    const overscan = useStatePaire(_overscan)

    const [updata, setUpdata] = useState(0)
    const [scrollTop, SET_scrollTop] = useStateWithLS('scrollTop')
    useEffect(() => {
        if (querySelector('.container')) {
            querySelector('.container').scrollTop = scrollTop //触发 onScrollHandle
        }
    }, [])

    const currentLine = getCurrentLine(scrollTop)
    const { LINE, line2Block } = config
    const L = Math.max(0, currentLine - overscan.get.top)
    const R = Math.min(
        LINE.length,
        currentLine + overscan.get.bot + heightCount
    )

    const blockL = line2Block[L]
    const blockR = line2Block[R] + 1

    return [
        scrollTop,
        currentLine,
        blockL,
        blockR,
        onScrollHandle,
        setUpdata,
        stopScroll,
        overscan,
    ] as const
    // useCallback/useEffect[]存在 就需注意 值过期问题

    function onScrollHandle(e: UIEvent) {
        if (stopScroll.get) return

        const scrollTopNow = (e.target as HTMLElement).scrollTop
        if (scrollTopNow === scrollTop) return

        SET_scrollTop(scrollTopNow)
    }
    function getCurrentLine(scrollTop: number) {
        return floor(scrollTop / SIZE_H)
    }
}

const useKeyHoldRef: any = {}
export function getHoldingKey(key?: string) {
    return key ? useKeyHoldRef[key] : useKeyHoldRef
}
function useKeyHold() {
    useEffect(() => {
        querySelector('#root').onkeydown = e => {
            useKeyHoldRef[e.key] = true
        }
        querySelector('#root').onkeyup = e => {
            useKeyHoldRef[e.key] = false
        }
    }, [])
}

let clear: number
export function useKey(
    OVERSCAN_bottom: number,
    DIFF: number,
    lineSize: number,
    currentLine: number,
    heightLineCount: number
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

            // jump(currentLine + OVERSCAN_bottom + heightLineCount - DIFF)
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
