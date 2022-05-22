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

const book = decodeURI(location.hash).slice(1) || '星之继承者（全3册）'
const txt = (await import('../txt/' + book)).default

import { i2rc, queryDom, useEffectWrap } from './utils'
const { floor } = Math

export function useSize() {
    const [size, sizeSET] = useState(getter)

    useEffectWrap(() => {
        window.onresize = () => sizeSET(getter)
    }, [])

    return size

    function getter() {
        return {
            width: floor((innerWidth - 100 - 15) / SIZE),
            height: floor((innerHeight - 30) / SIZE),
        }
    }
}
const useTxtCache: any = {}
export function useTXT(n: number) {
    // ? 为什么两周前就写出的形式 现在才判断出这就是最佳实践
    const [TXT, setTXT] = useState(getter)

    useEffectWrap(() => {
        setTXT(getter)
    }, [n])

    return [TXT, txt.length, TXT.length] as const

    function getter(): string {
        if (!useTxtCache[n]) {
            useTxtCache[n] = txt
                .split('\n')
                .map((e: string) => {
                    const line2rest = n - (e.length % n || n) // 第二行空格剩余补齐
                    return e + ' '.repeat(n + line2rest) // 完整第一行 + 第二行空格剩余补齐
                })
                .join('')
        }
        return useTxtCache[n]
    }
}

export function useSpk(TXT: string, TXTLen: number) {
    const [SPK, setSPK] = useState(getter)

    useEffectWrap(() => {
        setSPK(getter)
    }, [TXTLen])

    return SPK

    function getter() {
        const arr = []

        let isSpeaking = false
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

        console.log('useSpk', TXTLen, arr)
        return arr
    }
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

export function useScroll(txtLen: number, heightLineCount: number) {
    const [currentLine, currentLineSET] = useState(() =>
        Number(localStorage.getItem(txtLen + 'idx'))
    ) // 函数形式只会执行一次

    useEffectWrap(() => {
        queryDom('.container').scrollTop = currentLine * SIZE // todo, dom -> react ref?
    }, [])

    return [currentLine, useCallback(SET, [txtLen]), jumpLine] as const

    function jumpLine(currentLine: number) {
        const target = currentLine - floor(heightLineCount / 2)

        SET(target)
        queryDom('.container').scrollTop = target * SIZE
    }

    function SET(n: number) {
        currentLineSET(n)
        localStorage.setItem(txtLen + 'idx', n + '')
    }
}

let clear: number
export function useKey(
    OVERSCAN: number,
    DIFF: number,
    lineSize: number,
    currentLine: number,
    heightLineCount: number,
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
