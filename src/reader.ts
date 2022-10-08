import React from 'react'
import { useMemo, useState } from 'react'
import { SIZE_H } from './App'
import { config } from './hook'
import { getHoldingKey, useStatePaire } from './hookUtils'
import { querySelector, querySelectorAll } from './utils'
// console.log('reader TS')
export function scrollToNext(
    clickLine: number,
    word: string,
    nextType = (() => {
        const { Control, Alt } = getHoldingKey()
        if (Control && Alt) return 'first'
        if (Control) return 'last'
        if (Alt) return 'prev'
        return 'next'
    })(),
) {
    const nextLine = (() => {
        const Line = config.LINE

        // todo click的时候判断holding -> hold直接执行 略过click
        if (nextType == 'first') return getFirst()
        if (nextType == 'last') return getLast()
        if (nextType == 'prev') {
            const pre = (Line.slice(0, clickLine) as any).findLastIndex(findNextWord)
            return pre === -1 ? getLast() : pre
        }

        const next = Line.slice(clickLine + 1).findIndex(findNextWord)
        return next === -1 ? getFirst() : clickLine + 1 + next

        // find with line -> find with block?
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
            return Line.findIndex(findNextWord)
        }
        function getLast() {
            return (Line as any).findLastIndex(findNextWord)
        }
    })()

    // 赋值scrollTop会触发onscroll event
    querySelector('.reader').scrollTop += (nextLine - clickLine) * SIZE_H
}

function hoverWords(word: string | undefined) {
    querySelector(`[title="${word}"]`)?.classList.toggle('hoverByJs')
    querySelectorAll('.hoverByJs').forEach(node => node.classList.toggle('hoverByJs'))

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

    querySelectorAll(geneSelector(word!)).forEach(node => node.classList.toggle('hoverByJs'))
    querySelector(`[title=${word}]`)?.classList.toggle('hoverByJs')

    function geneSelector(word: string) {
        if (word.length === 1) {
            return '.V-Grid ' + getCls(word)
        }
        const base = word
            .split('')
            .reduce((all, now) => all + getCls(now) + '+', '')
            .slice(0, -1) //去掉末尾' +'

        const _HAS = doHas(word.length, base).join(',\n').replaceAll(':has()', '')
        const HAS = `:is(${_HAS})`

        return '.V-Grid ' + HAS

        function getCls(word: string) {
            if ('- 0123456789'.includes(word)) return `[class="${word}"]`
            return `.${word}`
        }
    }
}

const useHoverWordsCache: any = {} // if (hoverWord === '') return []
export function useHoverWords() {
    const [hoverWord, SET_hoverWord] = useState<string>()

    const searchItemsDoms = useMemo(() => {
        hoverWords(hoverWord)
        if (hoverWord === undefined) return
        if (!useHoverWordsCache[hoverWord]) {
            // line + arr[idx + 1] 处理情形: 一个词被两句话隔开
            useHoverWordsCache[hoverWord] = config.LINE.flatMap((line, idx, arr) =>
                (line + arr[idx + 1]).includes(hoverWord)
                    ? React.createElement('i', {
                          style: { top: (idx / config.LINE.length) * 100 + 1 /*滚轴自身*/ + '%' },
                      })
                    : [],
            )
        }
        return useHoverWordsCache[hoverWord]
    }, [hoverWord])

    return [hoverWord, SET_hoverWord, searchItemsDoms] as const
}
function withCache(fn: () => {}) {
    const cache = {}
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
