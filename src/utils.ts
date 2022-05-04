export function getAllWordPosition(TXT: string, word: string) {
    return getWordPosition().flatMap((n: number) =>
        Array(word.length)
            .fill(0)
            .map((_, i) => n + i)
    )

    // 查找一个字符串中的所有子串的位置
    function getWordPosition() {
        const positions = []
        let pos = TXT.indexOf(word)
        while (pos > -1) {
            positions.push(pos)
            pos = TXT.indexOf(word, pos + word.length)
        }

        return positions
    }
}

export function getClasses(classes: object) {
    const className = Object.entries(classes)
        .filter(([_, v]) => v)
        .map(([k]) => k)
        .join(' ')
    return className && { className }
}

export function getStyle(TXT: string, word: string, color: string) {
    const L = TXT.split(word).length - 1
    if (L === 0) return

    const len = word.length

    /* return后 有个空格 必要 不然\n失效; */
    return ` 
/* ${word} */
${getCss1()}
${getCss2()}
/* ${word} */
`

    function getCss1() {
        return getCssSelectorL() + getCssStyleR()

        function getCssSelectorL() {
            return Array.from(word)
                .map(word => `[data-e='${word}']`)
                .map((_, i, arr) =>
                    arr.reduce((all, item, j) => {
                        const last =
                            j === len - 1 ? ')'.repeat(len - 1 - i) : ''
                        const L = all + `:has(+` + item + last
                        const R = all + `+` + item
                        return i < j ? L : R
                    })
                )
                .join(',\n')
        }
        function getCssStyleR() {
            const css1 =
                L === 1
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
        const wordPosition = getAllWordPosition(TXT, word)
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
}
