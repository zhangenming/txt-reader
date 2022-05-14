import { useEffect, useState } from 'react'

// const txt = JSON.parse(localStorage.getItem('txt'))
// import _txt from '../txt/三国演义'
// import _txt from '../txt/循环'
// import _txt from '../txt/白鹿原'
// import _txt from '../txt/天道'
// import _txt from '../txt/挽救计划'
// import _txt from '../txt/重生之超级战舰'
// import _txt from '../txt/诡秘之主'
// import _txt from '../txt/活着'
// import _txt from '../txt/人类大瘟疫'
import _txt from '../txt/图灵'
// import _txt from '../txt/圣墟'

let txt = _txt
if (location.hash) {
    txt = (await import('../txt/圣墟')).default
}

import { i2rc, queryDom } from './utils'
const { floor } = Math

export function useSize(itemSize: number) {
    const [size, sizeSET] = useState({
        width: 0,
        height: 0,
    })

    useEffect(() => {
        const dom = getComputedStyle(queryDom('.container')) // alive

        reset()
        window.onresize = reset

        function reset() {
            sizeSET({
                width: parseInt(dom.width),
                height: parseInt(dom.height),
            })
        }
    }, [])

    return [floor(size.width / itemSize), floor(size.height / itemSize)]
}

const useTxtCache: any = {}
export function useTxt(colCount: number) {
    const [TXT, setTXT] = useState(setFunc)
    useEffect(() => {
        setTXT(setFunc)
    }, [colCount])

    // Object.entries(
    //     [...TXT].reduce((acc, cur, i) => {
    //         const key = TXT.slice(i, i + 5)

    //         if (
    //             [...key].some(k =>
    //                 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(k.toLocaleUpperCase())
    //             )
    //         )
    //             return acc

    //         if (!acc[key]) acc[key] = 1
    //         acc[key]++
    //         return acc
    //     }, {})
    // ).sort((q, w) => w[1] - q[1])

    return [TXT, txt.length] as const

    function setFunc() {
        if (!useTxtCache[colCount]) {
            useTxtCache[colCount] = txt
                .split('\n')
                .map(setLineWithSomeSpace)
                .join('')
        }
        return useTxtCache[colCount]
    }
    function setLineWithSomeSpace(e: string) {
        const line2rest = colCount - (e.length % colCount || colCount)
        return e + ' '.repeat(colCount + line2rest) // 完整第一行 + 第二行空格剩余补齐
    }
}

export function useSpk(TXT: string) {
    const [SPK, setSPK] = useState<boolean[]>([])

    useEffect(() => {
        let isSpeaking = false
        const arr = []
        for (let i = 0; i < TXT.length / 10; i++) {
            if (TXT[i] === '“') {
                isSpeaking = true
                arr.push(false)
            } else if (TXT[i] === '”') {
                isSpeaking = false
                arr.push(false)
            } else {
                arr.push(isSpeaking)
            }
        }
        setSPK(arr)
    }, [TXT])

    return SPK
}

export function useScrollHandle(lineSize: number) {
    const [currentLineIdx, currentLineIdxSET] = useState(0)

    return [scrollHandle, currentLineIdx] as const

    function scrollHandle() {
        currentLineIdxSET(
            i2rc(
                Number(queryDom('.wrap span:first-child').dataset.i),
                lineSize // should from useScrollHandle or scrollHandle?
            ).r
        )
    }
}

export function useScroll(TXTkey: number) {
    // console.log(Number(localStorage.getItem(TXTkey + 'idx')))

    const [currentLine, currentLineSET] = useState(
        Number(localStorage.getItem(TXTkey + 'idx'))
    )

    useEffect(() => {
        const timer = setInterval(() => {
            localStorage.setItem(TXTkey + 'idx', currentLine + '')
        }, 5000)

        return () => clearInterval(timer)
    }, [currentLine])

    useEffect(() => {
        jump(currentLine)
    }, [])

    return [currentLine, currentLineSET, jump] as const

    function jump(target: number) {
        // console.log(target, floor(target))

        currentLineSET(floor(target))
        setTimeout(() => {
            queryDom('.container').scrollTop = floor(target) * 30
        })
    }
}

let clear: number
export function useKey(
    OVERSCAN: number,
    DIFF: number,
    lineSize: number,
    currentLine: number,
    heightLineCount: number,
    SIZE: number,
    jump: (target: number) => void
) {
    const [isMetaHold, isMetaHoldSet] = useState(false)
    const [isAltHold, isAltHoldSet] = useState(false)
    const clickType = (() => {
        if (isMetaHold && isAltHold) return 's-resize'
        if (isMetaHold) return 'w-resize'
        if (isAltHold) return 'n-resize'
        return 'e-resize'
    })()

    return [keyDownHandle, keyUpHandle, clickType] as const

    function keyUpHandle(e: React.KeyboardEvent) {
        if (e.key === 'Meta') {
            isMetaHoldSet(false)
        }
        if (e.key === 'Alt') {
            isAltHoldSet(false)
        }
    }

    function keyDownHandle(e: React.KeyboardEvent) {
        if (e.metaKey) {
            isMetaHoldSet(true)
        }
        if (e.altKey) {
            isAltHoldSet(true)
        }
        if (e.code === 'Space') {
            setTimeout(() => {
                const x = (OVERSCAN + DIFF) * lineSize
                const xx = `:nth-child(${x}) ~ :not([data-invalid=" "])` // magic
                const target = Number(queryDom(xx).dataset.i)
                const rc = i2rc(target, lineSize).r
                const rs = DIFF + rc - currentLine - heightLineCount - OVERSCAN

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

            jump(currentLine + OVERSCAN + heightLineCount - DIFF)
        }
    }
}
