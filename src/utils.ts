export function getAllWordPosition(word: string, TXT: string) {
    return getWordPosition(TXT, word).flatMap((n: number) =>
        Array(word.length)
            .fill(0)
            .map((_, i) => n + i)
    )

    // 查找一个字符串中的所有子串的位置
    function getWordPosition(TXT: string, word: string) {
        if (word === '') return Array(TXT.length)

        const positions = []
        let pos = TXT.indexOf(word)
        while (pos != -1) {
            positions.push(pos)
            pos = TXT.indexOf(word, pos + word.length)
        }

        return positions
    }
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

export function getStyle(TXT: string, word: string, color: string) {
    const count = getWordCount(word, TXT)
    if (count === 0 || word === '' || word === ' ') return

    const targets = Array.from(word)
        .map(word => `[${word}]`)
        .map((_, i, arr) =>
            arr.reduce((all, item, j) => {
                const q = j === i + 1 ? ':has(+' : '+'
                const w = j === arr.length - 1 && i != arr.length - 1 ? ')' : ''
                return all + q + item + w
            })
        )

    /* return后 有个空格 必要 不然\n失效; */
    return `
/* 高亮 常亮 所有*/
${getCss1()}

/* 高亮 常亮 first/last */
${getCss2()}

/* 高亮 当hover */
${getCss3()}
`

    function getCss1() {
        return getCssSelectorL() + getCssStyleR()

        function getCssSelectorL() {
            return targets.join(',\n')
        }
        // background: linear-gradient(#000,#000);
        // background-size: 100% 2px;
        // background-repeat: no-repeat;
        // background-position: 0px 50%;
        function getCssStyleR() {
            const css1 =
                count === 1
                    ? 'text-decoration: line-through red'
                    : 'cursor:se-resize'
            const css2 = `color:${color}`
            const css3 = `content:"${word}"`

            return (
                '\n{\n' +
                [css1, css2, css3].reduce((all, now) => {
                    return `${all} ${now};\n`
                }, '') +
                '}'
            )
        }
    }
    function getCss2() {
        const wordPosition = getAllWordPosition(word, TXT)
        const first = wordPosition[0]
        const last = wordPosition.at(-1)

        return [setCss(first), setCss(last!, true)].join('\n')

        function setCss(item: number, isLast?: boolean) {
            const selector = `.wrap span[data-i='${item}']::${
                isLast ? 'after' : 'before'
            }`
            const style = JSON.stringify({
                width: '1px',
                height: '30px',
                content: `''`,
                background: 'red',
            })
                .replaceAll('"', '')
                .replaceAll(',', ';')
                .replace('{', '{ ')
                .replace('}', ' }')

            return selector + style
        }
    }
    function getCss3() {
        const base = word
            .split('')
            .reduce((all, now) => all + `[${now}]+`, '')
            .slice(0, -1) //去掉末尾' +'

        const HOVER = doHover(base, word.length)
        const HAS = doHas(base, word.length)

        const selector = type1() + ',\n\n\n' + type3() + ',\n\n\n' + type9()
        return selector.replaceAll(':has()', '') + '{filter: brightness(0.8);}' // 最右边的has不必要

        // :is([洛]+[萨]+[科]+[技]:hover, [洛]+[萨]+[科]:hover+[技], [洛]+[萨]:hover+[科]+[技], [洛]:hover+[萨]+[科]+[技])
        function doHover(str: string, len: number) {
            return Array(len) //1: word.length
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
        function doHas(base: string | any[], len: number) {
            return Array(len) //1: word.length
                .fill(0)
                .map((_, index, arr) => {
                    const n = 3 + (arr.length - 1 - index) * 4 //var
                    const L = base.slice(0, n)
                    const R = base.slice(n)
                    return L + ':has(' + R + ')'
                })
        }
        function type1() {
            // self 4 x 4
            const withHover = HAS.map((e, _, arr) => doHover(e, arr.length))
            const rs = withHover.flat().join(',\n')

            return rs
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
            const R = ` ~ :is(${HOVER.join(', ')})`
            const rs = HAS.map(e => e.slice(0, -1) + R + ' )').join(',\n')
            return rs
            // [洛]+[萨]+[科]+[技]:has( ~ :is([洛]+[萨]+[科]+[技]:hover, [洛]+[萨]+[科]:hover+[技], [洛]+[萨]:hover+[科]+[技], [洛]:hover+[萨]+[科]+[技]) ),
            // [洛]+[萨]+[科]:has(+[技] ~ :is([洛]+[萨]+[科]+[技]:hover, [洛]+[萨]+[科]:hover+[技], [洛]+[萨]:hover+[科]+[技], [洛]:hover+[萨]+[科]+[技]) ),
            // [洛]+[萨]:has(+[科]+[技] ~ :is([洛]+[萨]+[科]+[技]:hover, [洛]+[萨]+[科]:hover+[技], [洛]+[萨]:hover+[科]+[技], [洛]:hover+[萨]+[科]+[技]) ),
            // [洛]:has(+[萨]+[科]+[技] ~ :is([洛]+[萨]+[科]+[技]:hover, [洛]+[萨]+[科]:hover+[技], [洛]+[萨]:hover+[科]+[技], [洛]:hover+[萨]+[科]+[技]) ),
        }
        function type9() {
            // down 1 x 1
            const rs = `:is(${HOVER.join(', ')})\n~ :is(${HAS.join(', ')})`
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
}

export function rc2i(r: number, c: number, lineSize: number) {
    return r * lineSize + c
}
export function i2rc(i: number | string, lineSize: number) {
    return {
        r: Math.floor(Number(i) / lineSize),
        c: Number(i) % lineSize,
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
