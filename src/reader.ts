import { SIZE_H } from './App'
import { getHoldingKey } from './hookUtils'
import { config, querySelector } from './utils'
// console.log('reader TS')

export function scrollToNext(clickLine: number, word: string) {
    const nextLine = (() => {
        const allLine = config.LINE
        const { Control, Alt } = getHoldingKey()

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
            const pre = allLine.slice(0, clickLine).findLastIndex(findNextWord)
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
            return allLine.findLastIndex(findNextWord)
        }
    })()

    // 赋值scrollTop会触发onscroll event
    querySelector('.reader').scrollTop += (nextLine - clickLine) * SIZE_H
}
