import { SIZE_H } from './App'
import { getHoldingKey } from './hook'
import { config, querySelector } from './utils'

export function scrollToNext(incept: number, word: string) {
    const nextLine = (() => {
        const allLine = config.JIT
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
            const pre = allLine.slice(0, incept).findLastIndex(findLine)
            return pre === -1 ? getLast() : pre
        }

        // 下一个
        const next = allLine.slice(incept + 1).findIndex(findLine)
        return next === -1 ? getFirst() : incept + 1 + next

        function findLine(line: string) {
            return line.includes(word)
        }
        function getFirst() {
            return allLine.findIndex(findLine)
        }
        function getLast() {
            return allLine.findLastIndex(findLine)
        }
    })()

    // 赋值scrollTop会触发onscroll event
    querySelector('.container').scrollTop += (nextLine - incept) * SIZE_H
}
