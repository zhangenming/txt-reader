import { columnCount, TXT } from './App'
// import _TXT from '../txt/mc'

// export const TXT = _TXT
//     .replaceAll('\n', '\n\n')
//     .replaceAll(/[0-9]{4}年/gi, x => {
//         return x + `(${Number(x.slice(0, -1)) - 1328}岁)`
//     })
//     .replaceAll(/（[0-9]{4}）/gi, e => {
//         return `${e}(${Number(e.slice(1, -1)) - 1328}岁)`
//     })
//     // .replaceAll('的', '') // 会对搜索结果造成影响
//     .split('\n')
//     .filter(e => e)
//     .map(e => {
//         return e + ' '.repeat(columnCount * 2 - (e.length % columnCount))
//     })
//     .join('')

// 查找一个字符串中的所有子串的位置
const getWordPositionCache: any = {}
export function getWordPosition(word: string) {
    if (!getWordPositionCache[word]) {
        const positions = []
        let pos = TXT.indexOf(word)
        while (pos > -1) {
            positions.push(pos)
            pos = TXT.indexOf(word, pos + word.length)
        }
        getWordPositionCache[word] = positions
    }

    return getWordPositionCache[word]
}

const getAllWordPositionCache: any = {} // todo with decorator
export function getAllWordPosition(word: string) {
    if (!getAllWordPositionCache[word]) {
        getAllWordPositionCache[word] = getWordPosition(word).flatMap(
            (n: number) =>
                Array(word.length)
                    .fill(0)
                    .map((_, i) => n + i)
        )
    }

    return getAllWordPositionCache[word]
}
const getAllWordPosition2Cache: any = {} // todo with decorator
export function getAllWordPosition2(word: string) {
    if (!getAllWordPosition2Cache[word]) {
        const tmp = getWordPosition(word) // [163, 3053731]
            .flatMap((n: any) =>
                Array(word.length)
                    .fill(0)
                    .map((_, i) => n + i)
            ) // [163, 164, 165, 3053731, 3053732, 3053733]

        getAllWordPosition2Cache[word] = tmp.reduce(
            (
                all: { [x: string]: any[] },
                idx: string | number,
                i: number,
                arr: string | any[]
            ) => {
                const next =
                    arr[i + word.length] || arr[i + word.length - arr.length]

                all[idx] = [i, next]
                return all
            },
            {}
        )
        /*
        {
            "163": [
                "0",
                3053731
            ],
            "164": [
                "1",
                3053732
            ],
            "165": [
                "2",
                3053733
            ],
            "3053731": [
                "3",
                163
            ],
            "3053732": [
                "4",
                164
            ],
            "3053733": [
                "5",
                165
            ]
        }
        */
        getAllWordPosition2Cache[word].firstIdx = tmp[0]
        getAllWordPosition2Cache[word].lastIdx = tmp.at(-1)
        getAllWordPosition2Cache[word].wordCount = tmp.length / word.length
        getAllWordPosition2Cache[word].wordType =
            tmp.length / word.length === 1 ? 'select_just-one' : 'select_many'
    }

    return getAllWordPosition2Cache[word]
}

export function getClasses(classes: object) {
    const className = Object.entries(classes)
        .filter(([_, v]) => v)
        .map(([k]) => k)
        .join(' ')
    return className && { className }
}

export function getStyle(word: string, color: string) {
    /* return后 有个空格 必要 不然\n失效; */
    return ` 
/* ${word} */
${getCss1(word, color)}
${getCss2(word)}
/* ${word} */
`

    function getCss1(word: string, color: string) {
        return getCssSelectorL(word) + getCssStyleR(word, color)

        function getCssSelectorL(select: string) {
            const len = select.length
            const count = TXT.split(select).length - 1
            if (count === 0) return

            return Array.from(select)
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
        function getCssStyleR(word: string, color: string) {
            const css1 =
                TXT.split(word).length - 1 === 1
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
    function getCss2(word: string) {
        const len = word.length
        const wordPosition = getAllWordPosition(word)
        if (!wordPosition.length) return
        const first = [wordPosition[0]]
        const last = wordPosition.slice(-1)
        const last2 = [wordPosition.at(0)]

        return [
            setCss(
                first,
                {
                    'border-left': '1px solid red',
                },
                len
            ),
            setCss(
                last,
                {
                    'border-right': '1px solid red',
                },
                len
            ),
        ].join('\n')

        function setCss(item: number[], _style: object, len: number) {
            const selector = item
                .reduce((all, now) => {
                    return all + `[data-i='${now}'],`
                    return all + `[data-i='${now}']${'[data-i]'.repeat(len)},` //hack for css-specificity
                }, '')
                .slice(0, -1)

            const style = JSON.stringify(_style)
                .replaceAll('"', '')
                .replaceAll(',', ';')
                .replace('{', '{ ')
                .replace('}', ' }')
            return selector + style
        }
    }
}
