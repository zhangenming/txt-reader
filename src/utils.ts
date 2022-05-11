function getAllWordPosition(word: string, TXT: string) {
    return getWordPosition(word, TXT).flatMap((n: number) =>
        Array(word.length)
            .fill(0)
            .map((_, i) => n + i)
    )
}
// 查找一个字符串中的所有子串的位置
export function getWordPosition(word: string, TXT: string) {
    if (word === '') return Array(TXT.length)

    const positions = []
    let pos = TXT.indexOf(word)
    while (pos != -1) {
        positions.push(pos)
        pos = TXT.indexOf(word, pos + word.length)
    }

    return positions
}

export function getWordCount(word: string, TXT: string) {
    return word === '' ? TXT.length : TXT.split(word).length - 1
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
    isSelect: boolean
) {
    const count = getWordCount(word, TXT)
    if (count === 0 || word === '' || word === ' ') return

    const justOne = count === 1

    const wordLen = word.length

    const hoverStyle =
        '\n{background:bisque; color:forestgreen;/*filter: brightness(0.8);*/}'

    const base = word
        .split('')
        .reduce((all, now) => all + `[${now}]+`, '')
        .slice(0, -1) //去掉末尾' +'

    const HOVER = doHover(base).join(', ').replaceAll(':has()', '')
    const _HAS = doHas(base)
    const HAS = _HAS.join(', ').replaceAll(':has()', '')

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
            : `cursor: var(--clickType);${
                  isSelect ? 'background:#eae!important;' : ''
              }`

        const style = `
{
  color: ${color};
  content: '${word}';
  ${type}
}`

        const selector = Array.from(word)
            .map(word => `[${word}]`)
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

        const wordPosition = getAllWordPosition(word, TXT)

        const [first, ...firstNext] = wordPosition.slice(0, wordLen)
        const lastPriv = wordPosition.slice(wordPosition.length - wordLen)
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

        const selector = type1() + ',\n\n' + type3() + ',\n\n' + type9()

        return selector + hoverStyle // 最右边的has不必要

        function type1() {
            // self 4 x 4
            const withHover = _HAS.map(e => doHover(e))
            const rs = withHover.flat().join(',\n')

            return rs.replaceAll(':has()', '')
            // [洛]+[萨]+[科]+[技]:hover:has(),
            // [洛]+[萨]+[科]:hover+[技]:has(),
            // [洛]+[萨]:hover+[科]+[技]:has(),
            // [洛]:hover+[萨]+[科]+[技]:has(),
            // [洛]+[萨]+[科]:has(+[技]:hover),
            // [洛]+[萨]+[科]:hover:has(+[技]),
            // [洛]+[萨]:hover+[科]:has(+[技]),
            // [洛]:hover+[萨]+[科]:has(+[技]),
            // [洛]+[萨]:has(+[科]+[技]:hover),
            // [洛]+[萨]:has(+[科]:hover+[技]),
            // [洛]+[萨]:hover:has(+[科]+[技]),
            // [洛]:hover+[萨]:has(+[科]+[技]),
            // [洛]:has(+[萨]+[科]+[技]:hover),
            // [洛]:has(+[萨]+[科]:hover+[技]),
            // [洛]:has(+[萨]:hover+[科]+[技]),
            // [洛]:hover:has(+[萨]+[科]+[技]),
        }
        function type3() {
            // up 4 x 1
            const R = ` ~ :is(${HOVER})`
            const rs = _HAS.map(e => e.slice(0, -1) + R + ' )').join(',\n')

            return rs
            // [洛]+[萨]+[科]+[技]:has( ~ :is([洛]+[萨]+[科]+[技]:hover, [洛]+[萨]+[科]:hover+[技], [洛]+[萨]:hover+[科]+[技], [洛]:hover+[萨]+[科]+[技]) ),
            // [洛]+[萨]+[科]:has(+[技] ~ :is([洛]+[萨]+[科]+[技]:hover, [洛]+[萨]+[科]:hover+[技], [洛]+[萨]:hover+[科]+[技], [洛]:hover+[萨]+[科]+[技]) ),
            // [洛]+[萨]:has(+[科]+[技] ~ :is([洛]+[萨]+[科]+[技]:hover, [洛]+[萨]+[科]:hover+[技], [洛]+[萨]:hover+[科]+[技], [洛]:hover+[萨]+[科]+[技]) ),
            // [洛]:has(+[萨]+[科]+[技] ~ :is([洛]+[萨]+[科]+[技]:hover, [洛]+[萨]+[科]:hover+[技], [洛]+[萨]:hover+[科]+[技], [洛]:hover+[萨]+[科]+[技]) ),
        }
        function type9() {
            // down 1 x 1
            const rs = `:is(${HOVER}) ~ :is(${HAS})`
            return rs
            // :is([洛]+[萨]+[科]+[技]:hover, [洛]+[萨]+[科]:hover+[技], [洛]+[萨]:hover+[科]+[技], [洛]:hover+[萨]+[科]+[技])
            // ~ :is([洛]+[萨]+[科]+[技]:has(), [洛]+[萨]+[科]:has(+[技]), [洛]+[萨]:has(+[科]+[技]), [洛]:has(+[萨]+[科]+[技])){
            //     background: red!important;
            // }
        }

        //         const selector = targets.map(
        //             x => `
        // ${x}:has( ~${x}:hover),
        // ${x}:hover,
        // ${x}:hover ~${x}
        // `
        //         )

        //         return selector + `{background: #000;}`
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

    // :is([洛]+[萨]+[科]+[技]:hover, [洛]+[萨]+[科]:hover+[技], [洛]+[萨]:hover+[科]+[技], [洛]:hover+[萨]+[科]+[技])
    function doHover(str: string) {
        return Array(wordLen) //1: word.length
            .fill(0)
            .map((_, index, arr) => {
                let idx = 0
                return str.replaceAll(/\[.\]/g, (e: any) => {
                    if (++idx === arr.length - index) {
                        return `${e}:hover`
                    }
                    return e
                })
            })
    }
    // :is([洛]+[萨]+[科]+[技], [洛]+[萨]+[科]:has(+[技]), [洛]+[萨]:has(+[科]+[技]), [洛]:has(+[萨]+[科]+[技]))
    function doHas(base: string) {
        return Array(wordLen) //1: word.length
            .fill(0)
            .map((_, index, arr) => {
                const n = 3 + (arr.length - 1 - index) * 4 //var
                const L = base.slice(0, n)
                const R = base.slice(n)
                return L + ':has(' + R + ')'
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
