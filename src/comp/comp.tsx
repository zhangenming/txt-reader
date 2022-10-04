import { lazy, memo, Suspense, useEffect, useRef, useState } from 'react'
import { SIZE_H } from '../App'
import { runWithTime } from '../debug'
import { querySelector } from '../utils'
// console.log('COMP....')

export default function Comp({ RENDER }: any) {
    const { reader, app } = RENDER
    const [x, _set_x] = useState(0)

    // console.log('render comp')
    // useEffect(() => {
    //     //     sleepSync(1000)
    //     console.log('effect comp')

    //     if (RENDER.reader === x) return
    //     _set_x(RENDER.reader)
    // })

    return (
        <>
            <span>app:{app}</span>
            <span>reader:{reader}</span>
        </>
    )
}
function Comp2({ rerender_reader }: any) {
    const [x, _set_x] = useState(0)
    useEffect(() => {
        _set_x(rerender_reader.current)
    }, [rerender_reader.current])

    return (
        <button onClick={() => _set_x(x + 1)}>
            btn{x}-{rerender_reader.current}
        </button>
    )
}

export function Effect({ showInfo, msg }: any) {
    if (!showInfo) return
    // sleepSync(10)
    if (msg.includes('render OVER')) {
        runWithTime(msg)
    }
    useEffect(() => {
        if (msg.includes('effect begin')) {
            runWithTime(msg)
        }
    })

    // return msg
}

type refCur = { cur: number }
export function UseMouseScroll({ speed: s }: any) {
    const [speed, SET_speed] = useState(s)
    const speedRef = useRef(speed)
    speedRef.current = speed

    const ref = useRef<HTMLDivElement>(null)
    useEffect(function useMouseScroll() {
        let rAF: refCur = { cur: 0 }
        const node = ref.current!
        node.onmouseover = () => runRAF(rAF)
        node.onmouseout = () => clearRaf(rAF)
        return () => clearRaf(rAF)
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

    return (
        <div
            ref={ref}
            style={{ 'font-size': 13 }}
            onWheel={({ deltaY }) => {
                SET_speed(speedRef.current * (deltaY < 0 ? 6 / 5 : 5 / 6))
            }}
        >
            {/* {speed} */}
        </div>
    )

    function runRAF(rAF: refCur) {
        if (rAF.cur) return
        ;(function run() {
            rAF.cur = requestAnimationFrame(() => {
                querySelector('.reader').scrollTop += speedRef.current //触发 onScrollHandle
                run()
            })
        })()
    }
    function clearRaf(rAF: refCur) {
        cancelAnimationFrame(rAF.cur)
        rAF.cur = 0
    }
}
