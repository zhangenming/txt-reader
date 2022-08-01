import { SIZE_H } from './App'
import { getHoldingKey } from './hook'
import { config, querySelector } from './utils'

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

        function findNextWord(line: any, idx: number, arr: string[]) {
            const nextLine = arr[idx + 1] // 防止词被隔断到两行
            return (line + nextLine).includes(word)
        }
        function getFirst() {
            return allLine.findIndex(findNextWord)
        }
        function getLast() {
            return allLine.findLastIndex(findNextWord)
        }
    })()

    // 赋值scrollTop会触发onscroll event
    querySelector('.container').scrollTop += (nextLine - clickLine) * SIZE_H
}
