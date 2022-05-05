import { useEffect, useState } from 'react'

// import txt from '../txt/三国演义'
import txt from '../txt/循环'
// import txt from '../txt/白鹿原'

export function useSize(itemSize: number) {
    const [Width, setWidth] = useState(innerWidth - 100)
    const [Height, setHeight] = useState(innerHeight)
    useEffect(() => {
        window.onresize = function () {
            setWidth(innerWidth - 100)
            setHeight(innerHeight)
        }
    }, [])

    return [Width, Height, Math.floor(Width / itemSize) - 1]
}
export function useTxt(colCount: number) {
    const [TXT, setTXT] = useState(setFunc)
    useEffect(() => {
        setTXT(setFunc)
    }, [colCount])
    return TXT

    function setFunc() {
        return txt
            .replaceAll('\n', '\n')
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
