import { useEffect } from 'react'
import { doHas } from './reader'
import { config } from './hook'

export const floor = Math.floor
// console.log('utils TS')

const getAllWordPositionCache: { [key: string]: number[] } = {}
export function getAllWordPosition(word: string) {
    const key = word + config.line2Block.length
    const t = Array(word.length).fill(0)

    if (!getAllWordPositionCache[key]) {
        getAllWordPositionCache[key] = getWordPosition(word).flatMap((n: number) => t.map((_, i) => n + i))
    }
    return getAllWordPositionCache[key]
}

const getAllWordPositionWithNodeCache: { [key: string]: HTMLElement[] } = {}
export function getAllWordPositionWithNode(word: string) {
    const key = word + config.line2Block.length

    if (!getAllWordPositionWithNodeCache[key]) {
        getAllWordPositionWithNodeCache[key] = getAllWordPosition(word).map(idx => querySelector(`[data-i="${idx}"]`))
    }
    return getAllWordPositionWithNodeCache[key]
}

export function makeFuncCache(
    func: (..._: any) => any,
    // getKey = (x: any) => JSON.stringify(x)
) {
    const cache: any = {}
    return (x: any) => {
        const key = JSON.stringify(func(x))

        if (!cache[key]) {
            cache[key] = func(x)
        }
        return cache[key]
    }
}

// 查找一个字符串中的所有子串的位置
const getWordPositionCache: any = {}
export function getWordPosition(word: string): number[] {
    if (word === '') return []

    const txt = config.txt
    const key = word + txt.length
    if (!getWordPositionCache[key]) {
        const positions = []
        let pos = txt.indexOf(word)
        while (pos != -1) {
            positions.push(pos)
            pos = txt.indexOf(word, pos + word.length)
        }

        getWordPositionCache[key] = positions
    }
    return getWordPositionCache[key]
}

export function getWordCount(word: string) {
    return config.txt.split(word).length - 1
}

export function getClasses(classes: object) {
    const className = Object.entries(classes)
        .filter(([_, v]) => v)
        .map(([k]) => k)
        .join(' ')
    return className && { className }
}

export function getStyle(word: string, color: string, isPined: boolean, count: number, isOneScreen: boolean) {
    if (count === 0 || word === '' || word === ' ') return

    const justOne = count === 1

    // 自动联想
    // word = (function test2() {
    //     if (justOne) return word

    //     const wordPosition = getWordPosition(word, TXT)

    //     let left = 1
    //     while (arrIsOne(wordPosition.map(getWordLeft))) {
    //         word = getWordLeft(wordPosition[0]) + word
    //         left++
    //     }
    //     let right = 1 + word.length - left
    //     while (arrIsOne(wordPosition.map(getWordRight))) {
    //         word = word + getWordRight(wordPosition[0])
    //         right++
    //     }

    //     return word

    //     function getWordLeft(idx: number) {
    //         return TXT[idx - left]
    //     }
    //     function getWordRight(idx: number) {
    //         return TXT[idx + right]
    //     }
    //     function arrIsOne(arr: string[]) {
    //         return [...new Set(arr)].length === 1
    //     }
    // })()

    const wordLen = word.length

    const hoverStyle = `{
        background:bisque; 
        color:forestgreen;
        box-shadow: 0px 3px 0px red, 0px -3px 0px red;
        z-index: 2;
    /*filter: brightness(0.8);*/}`

    const base = word
        .split('')
        .reduce((all, now) => all + `.${now}` + '+', '')
        .slice(0, -1) //去掉末尾' +'

    const _HOVER = doHover(base).join(',\n')
    const HOVER = `\
:has(
${_HOVER}
)`
    const _HAS = doHas(wordLen, base).join(',\n').replaceAll(':has()', '')
    const HAS = `\
:is(
${_HAS}
)`
    /* return后 有个空格 必要 不然\n失效; */
    return `
/* css1 高亮 常亮 所有 */
${getCss1()}



/* css2 高亮 常亮 只first/last */
${getCss2()}




/* css3 高亮 当hover */



/* css4 左右联动 当hover 功耗高 */

`

    function getCss1() {
        const type =
            isOneScreen || justOne
                ? `\
background: linear-gradient(#000,#000);
  background-size: 100% ${justOne ? 2 : 4}px;
  background-repeat: no-repeat;
  background-position: 0px 50%;`
                : `cursor: var(--clickType);${isPined ? 'background:sandybrown' : ''}`

        const style = `
{
  color: ${color};
  content: '${word}';
  font-weight: 900;
  ${type}
}`

        return _HAS + style
    }
    function getCss2() {
        if (justOne) return '/* 只有一个没必要显示 */'

        const first = getSelector('findIndex', 'find', 'indexOf', 0)
        const last = getSelector('findLastIndex', 'findLast', 'lastIndexOf', word.length - 1)
        return (
            first + '{box-shadow: -3px -1px 0px 0px #973636, -3px 1px 0px 0px #973636;position:relative}\n' + last + '{box-shadow: 3px -1px 0px 0px #973636, 3px 1px 0px 0px #973636;position:relative}'
        )
        function getSelector(findIdx: string, find: string, idxOf: string, offset: number) {
            const arr = config.BLOCK as any
            const BlockIdx = arr[findIdx]((e: string) => e.includes(word))
            const ItemIdx = arr[find]((e: string) => e.includes(word))![idxOf](word) + 1 + offset
            return `.V-Grid div[data-block="${BlockIdx}"] span:nth-child(${ItemIdx})`
        }
    }

    function getCss3() {
        if (justOne) return '/* 只有一个没必要显示 */'

        return HOVER + '\n' + HAS + hoverStyle
    }

    function getCss4() {
        const leftDom = `[slot='${word}']`

        /* left ui */
        const css1 = `${leftDom}:hover\n{color:${color};background:cornflowerblue }\n\n\n`

        /* hover: left ui */
        const type2 = `${leftDom}:hover,\n\n`

        /* hover: left ui 联动 right reader */
        const type3 = `\
:has(${leftDom}:hover) 
${HAS},\n\n`

        /* hover: right reader 联动left ui */
        const type4 = HOVER + '\n' + leftDom

        const css2 = type2 + type3 + type4 + hoverStyle

        return css1 + css2
    }

    // [ [洛]+[萨]+[科]+[技]:hover, [洛]+[萨]+[科]:hover+[技], [洛]+[萨]:hover+[科]+[技], [洛]:hover+[萨]+[科]+[技] ]
    function doHover(base: string) {
        return Array(wordLen) //1: word.length
            .fill(0)
            .map((_, index, arr) => {
                let idx = 0
                return base.replaceAll(/\[.*?\]/g, e => {
                    if (++idx === arr.length - index) {
                        return `${e}:hover`
                    }
                    return e
                })
            })
    }

    // [ [洛]+[萨]+[科]+[技], [洛]+[萨]+[科]:has(+[技]), [洛]+[萨]:has(+[科]+[技]), [洛]:has(+[萨]+[科]+[技]) ]
    function doHass(base: string) {
        const t = base.split('+')
        return Array(wordLen) //1: word.length
            .fill(0)
            .map((_, idx) => {
                const l = t.slice(0, idx + 1).join('+')
                const r = t.slice(idx + 1).join('+')
                return idx === wordLen - 1 ? l : `${l}:has(+${r})`
            })
    }
}

export function rc2i(r: number, c: number, lineSize: number) {
    return r * lineSize + c
}
export function i2rc(i: number, lineSize: number = config.lineSize) {
    return {
        r: floor(i / lineSize),
        c: i % lineSize,
    }
}

export function getColor() {
    const [l, g, b] = [floor(Math.random() * 256), floor(Math.random() * 256), floor(Math.random() * 256)]
    return `rgb(${l},${g},${b})`
}

export function querySelector(selector: string) {
    return document.querySelector<HTMLElement>(selector)!
}
export function querySelectorAll(selector: string) {
    return document.querySelectorAll<HTMLElement>(selector)!
}

export function useEffectWrap(func: any = () => {}, deps?: any) {
    if (!0) {
        const name = new Error().stack!.split('\n')[3].split('(')[0].replaceAll('    at ', '')

        const type = (() => {
            if (!deps) return 'every' // 没数组
            if (!deps.length) return 'onece' // 空数组
            return deps
        })()

        const flag = `      EFFECT --- ${name} (${type}) `.slice(0, 100)

        console.log('注册', name)
        useEffect(function EFFECT() {
            console.log('执行', name)
            console.time(flag)
            func()
            console.timeEnd(flag)
        }, deps)
    } else {
        useEffect(func, deps)
    }
}

export function callWithTime(name: any, func?: any) {
    if (!func) {
        func = name
        name = new Error()
            .stack!.split('\n')[2]
            .match(/src\/.*tsx/)?.[0]
            .slice(4, -4)
    }

    const f = {
        [name]: function (...x: any) {
            console.time(name)
            const rt = func(...x)
            console.timeEnd(name)
            return rt
        },
    }

    if (!1) {
        return Object.values(f)[0]
    } else {
        return func
    }
}

function geneFunc(f: any) {
    f = f + ''
    const l = f.indexOf('{') + 1
    const r = f.lastIndexOf('}')
    const newF = `
${f.slice(0, l)}
console.time()
${f.slice(l, r)}
console.timeEnd()
${f.slice(r)}
`

    console.log(88, newF)

    return newF
}

export function callWithTime2(name: string, func: any) {
    return eval(`()=>function ${name}(...x){
        console.time('  CALL -  ' + name)
        const rt = func(...x)
        console.timeEnd('  CALL -  ' + name)
        return rt}`)()

    return function name(...x: any) {
        console.time('  CALL -  ' + name)
        const rt = func(...x)
        console.timeEnd('  CALL -  ' + name)
        return rt
    }
}

export function chunk(arr: any[], chunkSize: number) {
    if (chunkSize == 0) return

    const rs = []
    for (let i = 0; i < arr.length; i += chunkSize) {
        rs.push(arr.slice(i, i + chunkSize))
    }
    return rs
}

export function chunkString(line: string, len: number) {
    const s = 0
    if (line.length < len - s) {
        return line
    }

    return line.match(new RegExp('.{1,' + (len - s) + '}', 'g'))!
}

const features = [...new URLSearchParams(location.search).keys()]

export const hasFeature = (f: string = 'x', l: Function = () => true, r: Function = () => false) => (features.includes(f) ? l() : r())

export const getFeature = (f: string) => new URLSearchParams(location.search).get(f)

export function getWord(ele: Element) {
    const content = getComputedStyle(ele).content // js <-> css
    return content === 'normal' ? undefined : content.slice(1, -1)
}
