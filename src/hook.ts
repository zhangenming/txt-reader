import { useEffect, useState } from 'react'

// import txt from '../txt/三国演义'
// import txt from '../txt/循环'
// import txt from '../txt/白鹿原'
// import txt from '../txt/人类大瘟疫'
// import txt from '../txt/天道'
import txt from '../txt/挽救计划'
import { i2rc, queryDom } from './utils'
const { floor } = Math

export function useSize(itemSize: number) {
    const [Width, setWidth] = useState(innerWidth - 100)
    const [Height, setHeight] = useState(
        floor(innerHeight / itemSize) * itemSize
    )

    useEffect(() => {
        window.onresize = function () {
            setWidth(innerWidth - 100)
            setHeight(floor(innerHeight / itemSize) * itemSize)
        }
    }, [])

    return [
        Width,
        Height,
        floor(Width / itemSize) - 1,
        floor(Height / itemSize),
    ]
}

export function useTxt(colCount: number) {
    const [TXT, setTXT] = useState(setFunc)
    useEffect(() => {
        setTXT(setFunc)
    }, [colCount])

    return [TXT, TXT.length] as [string, number]

    function setFunc() {
        return txt
            .replaceAll('\n\n', '\n')
            .replaceAll('\n', '\n  ')
            .split('\n')
            .filter(e => e)
            .map(setLineWithSomeSpace)
            .join('')
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
        const arr = [...TXT].map(e => {
            if (e === '“') {
                isSpeaking = true
                return false
            }
            if (e === '”') {
                isSpeaking = false
                return false
            }
            return isSpeaking
        })
        setSPK(arr)
    }, [TXT])

    return SPK
}

export function useScrollHandle(lineSize: number) {
    const [currentLineIdx, currentLineIdxSET] = useState(0)

    return [scrollHandle, currentLineIdx] as [() => void, number]

    function scrollHandle() {
        currentLineIdxSET(
            i2rc(
                Number(
                    document.querySelector<HTMLElement>(
                        '.wrap span:first-child'
                    )?.dataset.i!
                ),
                lineSize // should from useScrollHandle or scrollHandle?
            ).r
        )
    }
}

export function useKey(
    OVERSCAN: number,
    DIFF: number,
    lineSize: number,
    currentLine: number,
    heightLineCount: number,
    SIZE: number,
    gridRef: {
        current: {
            scrollToItem: (arg0: {
                align: string
                //  "auto" | "smart" | "center" | "end" | "start";
                rowIndex: number
            }) => void
        }
    }
) {
    const [isMetaHold, isMetaHoldSet] = useState(false)
    const [isAltHold, isAltHoldSet] = useState(false)
    const clickType = (() => {
        if (isMetaHold && isAltHold) return 's-resize'
        if (isMetaHold) return 'w-resize'
        if (isAltHold) return 'n-resize'
        return 'e-resize'
    })()

    return [keyDownHandle, keyUpHandle, clickType] as [
        () => void,
        () => void,
        string
    ]

    function keyUpHandle(e: KeyboardEvent) {
        if (e.key === 'Meta') {
            isMetaHoldSet(false)
        }
        if (e.key === 'Alt') {
            isAltHoldSet(false)
        }
    }

    function keyDownHandle(e: KeyboardEvent) {
        if (e.metaKey) {
            isMetaHoldSet(true)
        }
        if (e.altKey) {
            isAltHoldSet(true)
        }
        if (e.code === 'Space') {
            setTimeout(() => {
                const x = (OVERSCAN + DIFF) * lineSize
                const xx = `:nth-child(${x}) ~ :not([data-e=" "])` // magic
                const target = queryDom(xx).dataset.i
                const rc = i2rc(Number(target), lineSize)
                const r = rc.r - currentLine - heightLineCount - OVERSCAN
                const rs = (DIFF + r + 1) * SIZE + 'px'

                const dom = queryDom('.reader-helper').style
                dom.top = rs
                dom.background = 'yellowgreen'
                dom.height = '5px'

                setTimeout(() => {
                    dom.background = 'cornflowerblue'
                    dom.height = '0'
                }, 1111)
            })

            gridRef.current.scrollToItem({
                align: 'start',
                //  "auto" | "smart" | "center" | "end" | "start";
                rowIndex: currentLine + OVERSCAN + heightLineCount - DIFF,
            })
        }
    }
}
