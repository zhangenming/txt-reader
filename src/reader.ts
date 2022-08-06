import { SIZE_H } from './App'
import { config } from './hook'
import { getHoldingKey } from './hookUtils'
import { querySelector, querySelectorAll } from './utils'
// console.log('reader TS')
export function scrollToNext(clickLine: number, word: string) {
    const nextLine = (() => {
        const allLine = config.LINE
        const { Control, Alt } = getHoldingKey()

        // todo click的时候判断holding -> hold直接执行 略过click
        if (Control && Alt) {
            // 第一个
            return getFirst()
        }

        if (Control) {
            // 最后一个
            return getLast()
        }

        if (Alt) {
            // 上一个
            const pre = (allLine.slice(0, clickLine) as any).findLastIndex(
                findNextWord
            )
            return pre === -1 ? getLast() : pre
        }

        // 下一个
        const next = allLine.slice(clickLine + 1).findIndex(findNextWord)
        return next === -1 ? getFirst() : clickLine + 1 + next

        function findNextWord(line1: string, idx: number, arr: string[]) {
            return line1.includes(word) || willFindWithDouble()
            function willFindWithDouble() {
                const line2 = arr[idx + 1]
                if (!line2) return

                const len = word.length - 1
                const line = line1.slice(-len) + line2.slice(0, len)
                return line.includes(word)
            }
        }
        function getFirst() {
            return allLine.findIndex(findNextWord)
        }
        function getLast() {
            return (allLine as any).findLastIndex(findNextWord)
        }
    })()

    // 赋值scrollTop会触发onscroll event
    querySelector('.reader').scrollTop += (nextLine - clickLine) * SIZE_H
}

export function hoverWords(word: string) {
    querySelector(`[title=${word}]`)?.classList.toggle('hoverByJs')
    querySelectorAll('.hoverByJs').forEach(node =>
        node.classList.toggle('hoverByJs')
    )

    // ||
    // (e.target as Element).className

    if ([' ', ',', '。', undefined].includes(word)) return

    // 局部匹配
    // selectArr.map(e => {
    //     if (e.key.includes(word) || word.includes(e.key)) {
    //         document
    //             .querySelectorAll(geneSelector(e.key))
    //             .forEach(e => e.classList.add('hoverByJs'))
    //     }
    // })

    querySelectorAll(geneSelector(word)).forEach(node =>
        node.classList.toggle('hoverByJs')
    )
    querySelector(`[title=${word}]`).classList.toggle('hoverByJs')

    // const len = config.LINE.length
    // SET_searchItemsPos(
    //     config.LINE.flatMap((line, idx) =>
    //         line.includes(word)
    //             ? ((idx / len) * 100).toFixed(3) + '%'
    //             : []
    //     ).ll
    // )

    function geneSelector(word: string) {
        if (word.length === 1) {
            return '.V-Grid ' + getCls(word)
        }
        const base = word
            .split('')
            .reduce((all, now) => all + getCls(now) + '+', '')
            .slice(0, -1) //去掉末尾' +'

        const _HAS = doHas(word.length, base)
            .join(',\n')
            .replaceAll(':has()', '')
        const HAS = `:is(${_HAS})`

        return '.V-Grid ' + HAS

        function getCls(word: string) {
            if ('- 0123456789'.includes(word)) return `[class="${word}"]`
            return `.${word}`
        }
    }
}

export function doHas(wordLen: number, base: string) {
    const t = base.split('+')
    return Array(wordLen)
        .fill(0)
        .map((_, idx) => {
            const l = t.slice(0, idx + 1).join('+')
            const r = t.slice(idx + 1).join('+')
            return idx === wordLen - 1 ? l : `${l}:has(+${r})`
        })
}
