const getAllWordPositionCache: any = {}
function getAllWordPosition(word: string, TXT: string) {
    const key = word + TXT.length

    if (!getAllWordPositionCache[key]) {
        getAllWordPositionCache[key] = getWordPosition(word, TXT).flatMap(
            (n: number) =>
                Array(word.length)
                    .fill(0)
                    .map((_, i) => n + i)
        )
    }
    return getAllWordPositionCache[key]
}
// 查找一个字符串中的所有子串的位置
const getWordPositionCache: any = {}
export function getWordPosition(word: string, TXT: string) {
    const key = word + TXT.length
    if (!getWordPositionCache[key]) {
        const positions = []
        let pos = TXT.indexOf(word)
        while (pos != -1) {
            positions.push(pos)
            pos = TXT.indexOf(word, pos + word.length)
        }

        getWordPositionCache[key] = positions
    }
    return getWordPositionCache[key]

    if (word === '') return Array(TXT.length)

    const positions = []
    let pos = TXT.indexOf(word)
    while (pos != -1) {
        positions.push(pos)
        pos = TXT.indexOf(word, pos + word.length)
    }

    return positions
}

const getWordCountCache: any = {}
export function getWordCount(word: string, TXT: string) {
    const key = word + TXT.length

    if (!getWordCountCache[key]) {
        getWordCountCache[key] =
            word === '' ? TXT.length : TXT.split(word).length - 1
    }
    return getWordCountCache[key]
}

export function getClasses(classes: object) {
    const className = Object.entries(classes)
        .filter(([_, v]) => v)
        .map(([k]) => k)
        .join(' ')
    return className && { className }
}

export function getStyle(
    TXT: string,
    word: string,
    color: string,
    isPined: boolean,
    isSelect: boolean
) {
    const count = getWordCount(word, TXT)
    if (count === 0 || word === '' || word === ' ') return

    const justOne = count === 1

    // 自动联想
    word = (function test2() {
        if (justOne) return word

        const wordPosition = getWordPosition(word, TXT)

        let left = 1
        while (arrIsOne(wordPosition.map(getWordLeft))) {
            word = getWordLeft(wordPosition[0]) + word
            left++
        }
        let right = 1 + word.length - left
        while (arrIsOne(wordPosition.map(getWordRight))) {
            word = word + getWordRight(wordPosition[0])
            right++
        }

        return word

        function getWordLeft(idx: number) {
            return TXT[idx - left]
        }
        function getWordRight(idx: number) {
            return TXT[idx + right]
        }
        function arrIsOne(arr: string[]) {
            return [...new Set(arr)].length === 1
        }
    })()

    const wordLen = word.length

    const hoverStyle = `\n{
        background:bisque; 
        color:forestgreen;
        box-shadow: 0px 3px 0px red, 0px -3px 0px red;
        z-index: 2;
    /*filter: brightness(0.8);*/}`

    const base = word
        .split('')

        .reduce(
            (all, now) =>
                all +
                (isInvalidWord(now) ? `[data-invalid='${now}']` : `[${now}]`) +
                '+',
            ''
        )

        .slice(0, -1) //去掉末尾' +'

    const HOVER = doHover(base).join(', ').replaceAll(':has()', '')
    const HAS = doHas(base).join(', ').replaceAll(':has()', '')

    /* return后 有个空格 必要 不然\n失效; */
    return `
/* 高亮 常亮 所有*/
${getCss1()}


/* 高亮 常亮 只first/last */
${getCss2()}


/* 高亮 当hover */
${getCss3()}


/* 左右联动 当hover */
${getCss4()}
`

    function getCss1() {
        const type = justOne
            ? `\
background: linear-gradient(#000,#000);
  background-size: 100% 2px;
  background-repeat: no-repeat;
  background-position: 0px 50%;`
            : `cursor: var(--clickType);${isPined ? 'background:#eae' : ''}`

        const style = `
{
  color: ${color};
  content: '${word}';
  ${type}
}`

        const selector = Array.from(word)
            .map(word =>
                isInvalidWord(word) ? `[data-invalid='${word}']` : `[${word}]`
            )
            .map((_, i, arr) =>
                arr.reduce((all, item, j) => {
                    const q = j === i + 1 ? ':has(+' : '+'
                    const w =
                        j === arr.length - 1 && i != arr.length - 1 ? ')' : ''
                    return all + q + item + w
                })
            )
            .join(',\n')
        return selector + style
    }

    function getCss2() {
        if (justOne) return '/* 只有一个没必要显示 */'

        const allWordPosition = getAllWordPosition(word, TXT)

        const [first, ...firstNext] = allWordPosition.slice(0, wordLen)
        const lastPriv = allWordPosition.slice(allWordPosition.length - wordLen)
        const last = lastPriv.pop()!

        return [
            {
                selector: [first],
                style: `${color} transparent transparent ${color}`,
            },
            { selector: firstNext, style: `${color} transparent transparent` },
            {
                selector: lastPriv,
                style: `transparent transparent ${color} transparent`,
            },
            {
                selector: [last],
                style: `transparent ${color} ${color} transparent`,
            },
        ]
            .map(({ selector, style }) => setCss(selector, style))
            .join('\n')

        const q = setCss([first], `${color} transparent transparent ${color}`)
        const w = setCss(firstNext, `${color} transparent transparent`)
        const e = setCss(
            lastPriv,
            `transparent transparent ${color} transparent`
        )
        const r = setCss([last], `transparent ${color} ${color} transparent`)
        return [q, w, e, r].join('\n')

        function setCss(l: number[], r: string) {
            const x = l.map(e => `[data-i='${e}']`)
            return `.wrap span:is(${x}) { border:solid; border-color:${r}; }`
        }
    }

    function getCss3() {
        if (justOne) return '/* 只有一个没必要显示 */'

        return `:has(${HOVER}) \n:is(${HAS})` + hoverStyle
    }

    function getCss4() {
        const leftDom = `[slot='${word}']`

        /* left ui */
        const type1 = `${leftDom}:hover\n{color:${color};background:cornflowerblue }\n\n`

        /* hover: left ui */
        const type2 = `${leftDom}:has(.count:hover),\n`

        /* hover: left ui 联动 right reader */
        const type3 = `:has(${leftDom} .count:hover) :is(${HAS}),\n`

        /* hover: right reader 联动left ui */
        const type4 = `:has(${HOVER}) ${leftDom}`

        return type1 + type2 + type3 + type4 + hoverStyle
    }

    // [ [洛]+[萨]+[科]+[技]:hover, [洛]+[萨]+[科]:hover+[技], [洛]+[萨]:hover+[科]+[技], [洛]:hover+[萨]+[科]+[技] ]
    function doHover(str: string) {
        return Array(wordLen) //1: word.length
            .fill(0)
            .map((_, index, arr) => {
                let idx = 0
                return str.replaceAll(/\[.*?\]/g, (e: any) => {
                    if (++idx === arr.length - index) {
                        return `${e}:hover`
                    }
                    return e
                })
            })
    }
    // [ [洛]+[萨]+[科]+[技], [洛]+[萨]+[科]:has(+[技]), [洛]+[萨]:has(+[科]+[技]), [洛]:has(+[萨]+[科]+[技]) ]
    function doHas(base: string) {
        return Array(wordLen) //1: word.length
            .fill(0)
            .map((_, idx) => {
                const n = (idx + 1) * (base.length / wordLen)
                const L = base.slice(0, n)
                const R = base.slice(n)
                return `${L}:has(${R})`
            })
    }
}

export function rc2i(r: number, c: number, lineSize: number) {
    return r * lineSize + c
}
export function i2rc(i: number, lineSize: number) {
    return {
        r: Math.floor(i / lineSize),
        c: i % lineSize,
    }
}

export function getColor() {
    const [l, g, b] = [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
    ]
    return `rgb(${l},${g},${b})`
}

export function queryDom(selector: string) {
    return document.querySelector<HTMLElement>(selector)!
}

const warning =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`' +
    `©×─―—-–~≈÷=*“”"　  ·?,.°%‘’⋯…()/@&;|0123456789'`
const error = `＂ℓａｄｅｇｈｉｋｌｍｎｕｏｐｒｓｖｗｙｚ：＇。．～，！？／（）《》〉「」［］【】；、﹢－＝ＢＣＦＧＪＫＶＷＱＩＹＬＡＭＤＴＨＮＯＰＳＺ１２３４５６７８９０％℃`
const invalidSTR = [...warning, ...error]

export function isInvalidWord(word: string) {
    // if (/[0-9]/.test(word)) return 'data-num'
    // if (/[a-z]/.test(word)) return 'data-lower'
    // if (/[A-Z]/.test(word)) return 'data-upper'
    // if (error.includes(word)) return 'data-error'
    // if (warning.includes(word)) return 'data-warning'
    return invalidSTR.includes(word)
}
