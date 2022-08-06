const autoScrollSpeed = 1
import React from 'react'
import {
    createElement,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { SIZE_H, SIZE_W } from './App'
import {
    useHover,
    useKeyHold,
    usePrevious,
    useStatePaire,
    useStateWithLS,
} from './hookUtils'
import { getAllWordPosition, hasFeature } from './utils'
import { chunkString, floor, i2rc, querySelector } from './utils'
import { geneBlock } from './V-Grid'
// console.log('HOOK')

export function useSizeCount() {
    const [state, SET_state] = useState(getter)

    useEffect(() => {
        let timer: number
        window.onresize = () => {
            clearTimeout(timer)
            timer = setTimeout(() => SET_state(getter), 1000) // 二级rerender
        }
    }, [])

    return state

    function getter() {
        const min = 0
        const width = innerWidth - 100 - min - 17 /*滚轴宽度*/ - 20
        const height = innerHeight - 10 - min
        const widthCount = floor(width / SIZE_W)
        const heightCount = floor(height / SIZE_W)

        return [widthCount, heightCount]
    }
}

// import _1629 from '../txt/1629'
// import 诡秘之主 from '../txt/诡秘之主'

// const txt = hasFeature('test')
//     ? (await import('../txt/test')).default
//     : 'loading'

export const config: {
    txt: string
    BLOCK_AOT: JSX.Element[] // block element
    BLOCK: string[] // block string
    LINE: string[] // line string
    line2Block: [number, number, number][]
    block2Line: number[]
} = {}.ll as any

export function useLoad() {
    const [state, SET_state] = useState('loading')
    const [load, SET_load] = useState('test')
    useEffect(() => {
        setTimeout(() => {
            fetch(`../txt/${load}.txt`)
                .then(r => r.text())
                .then(text => {
                    SET_state(text)
                })
        }, 1000)
    }, [load])
    return [state, SET_load] as const
}

export function useTXT(widthCount: number, txt: string) {
    // useEffect deps也能达到缓存减少rerender目的? 和useMemo什么区别?  useMemo是同步的

    useMemo(
        function init() {
            config.txt = txt
            config.BLOCK = txt
                //去掉多余空行, 注意有两种空格
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
                // .ll.filter(e => e !== '')
                .map(block => '  ' + block)
        },
        [txt]
    )

    useMemo(() => {
        config.LINE = config.BLOCK
            // split and join
            .flatMap(function blockMaybeSplit(block) {
                // block or line?
                return chunkString(block, widthCount)
            })
        // .reduce(function blockMaybeJoin(
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

        config.line2Block = (() => {
            let block = -1
            let lineOfBlock = 1
            return config.LINE.map(line => {
                if (line.startsWith(' ')) {
                    block++
                    lineOfBlock = 1
                } else {
                    lineOfBlock++
                }
                return [block, lineOfBlock, (lineOfBlock - 1) * widthCount + 1]
            })
        })()

        let _line = 0
        config.block2Line = config.BLOCK.map((_, i, arr) => {
            if (i === 0) return 0
            return (_line += Math.ceil(arr[i - 1].length / widthCount))
        })
        // config.block2Line = block =>
        //     config.line2Block.findIndex(e => e[0] === block) //性能太差
    }, [txt, widthCount])

    if (hasFeature('aot')) {
        useMemo(
            function AOT() {
                console.time('AOT done')
                config.BLOCK_AOT = []
                const { BLOCK, BLOCK_AOT, block2Line } = config // 此时只有txt,JIT是完毕的, []是引用, 异步补全
                const over = BLOCK.length

                requestIdleCallback(doWork) //async
                function doWork(deadline: IdleDeadline) {
                    while (deadline.timeRemaining()) {
                        const block = BLOCK_AOT.length
                        if (block === over) {
                            return console.timeEnd('AOT done')
                        }
                        BLOCK_AOT.push(
                            geneBlock(BLOCK[block], block, block2Line[block])
                        ) //error
                    }
                    requestIdleCallback(doWork)
                }
            },
            [txt]
        )
    }
}

let clear2: number
export function useScroll(
    _overscan: {
        top: number
        bot: number
    },
    widthCount: number,
    heightCount: number,
    txt = config.txt
) {
    const stopScroll = useStatePaire(false)
    const overscan = useStatePaire(_overscan)
    const [updata, setUpdata] = useState(0)

    const [scrollTop, SET_scrollTop] = useStateWithLS<number>('scrollTop')
    const currentLine = floor(scrollTop / SIZE_H)
    const [blockL, blockR] = useMemo(
        function computed() {
            const { line2Block, LINE } = config

            return [
                Math.max(0, line2Block[currentLine][0] - overscan.get.top),

                line2Block[
                    Math.min(LINE.length - 1, currentLine + heightCount)
                ][0] +
                    overscan.get.bot +
                    1,
            ]
        },
        [currentLine, txt]
    )

    restoreCurrentWord(currentLine, [widthCount]) // 二级rerender second

    return [
        scrollTop,
        currentLine,
        blockL,
        blockR,
        onScrollHandle,
        stopScroll,
        overscan,
        setUpdata,
    ] as const
    // useCallback/useEffect[]存在 就需注意 值过期问题

    function onScrollHandle(e: React.UIEvent<HTMLDivElement, UIEvent>) {
        if (stopScroll.get) return

        const scrollTopNow = (e.target as HTMLElement).scrollTop
        if (scrollTopNow === scrollTop) return

        clearTimeout(clear2)
        clear2 = setTimeout(() => {
            SET_scrollTop(scrollTopNow)
        }) // todo clear
    }
}
export function restoreCurrentWord(currentLine: number, deps: any[]) {
    const [currentBlock] = useStateWithLS<number>(
        'currentBlock',
        () => config.line2Block[currentLine][0]
    )
    useEffect(() => {
        // 赋值触发onscroll event
        querySelector('.reader').scrollTop =
            config.block2Line[currentBlock] * SIZE_H
    }, deps)
}

let clear: number
export function useKey(
    OVERSCAN_bottom: number,
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
                const x = OVERSCAN_bottom * lineSize
                const xx = `:nth-child(${x}) ~ :not([data-invalid=" "])` // magic
                const target = Number(querySelector(xx).dataset.i)
                const rc = i2rc(target, lineSize).r
                const rs = rc - currentLine - heightLineCount - OVERSCAN_bottom

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

type refCur = { cur: number }
export function useMouseScroll() {
    useEffect(function useMouseScroll() {
        let rAF: refCur = { cur: 0 }
        const node = querySelector('.scrolling')
        node.onmouseover = () => runRAF(rAF, autoScrollSpeed)
        node.onmouseout = () => clearRaf(rAF)
    }, [])

    useEffect(function useKeyScroll() {
        let rAF: refCur = { cur: 0 }
        const map: any = {
            w: -30,
            s: 30,
            x: 0.1,
            z: SIZE_H / 5,
            q: -1,
            a: 1,
        }

        document.onkeydown = e => {
            // keydown浏览器原生 触发频率是 32ms
            // 但现在由requestAnimationFrame触发onScrollHandle的频率是 16ms
            const val = map[e.key]
            if (val) {
                e.preventDefault()
                runRAF(rAF, val)
            }
        }
        document.onkeyup = () => {
            clearRaf(rAF)
        }
    }, [])

    return React.createElement('div', {
        className: 'scrolling',
    })

    function runRAF(rAF: refCur, val: number) {
        if (rAF.cur) return
        ;(function run() {
            rAF.cur = requestAnimationFrame(() => {
                querySelector('.reader').scrollTop += val //触发 onScrollHandle
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
