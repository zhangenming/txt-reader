import { TXTdone } from "./App"

// 查找一个字符串中的所有子串的位置
const getWordPositionCache: any = {}
export function getWordPosition(word: string,) {
    if (!getWordPositionCache[word]) {
        const positions = []
        let pos = TXTdone.indexOf(word)
        while (pos > -1) {
            positions.push(pos)
            pos = TXTdone.indexOf(word, pos + word.length)
        }
        getWordPositionCache[word] = positions
    }

    return getWordPositionCache[word]
}

const getAllWordPositionCache: any = {} // todo with decorator
export function getAllWordPosition(word: string) {
    if (!getAllWordPositionCache[word]) {
        getAllWordPositionCache[word] = new Set(
            getWordPosition(word).flatMap(n =>
                Array(word.length)
                    .fill(0)
                    .map((_, i) => n + i)
            )
        )
    }

    return getAllWordPositionCache[word]
}

export function getClasses(classes: object) {
    const className = Object.entries(classes)
        .filter(([_, v]) => v)
        .map(([k]) => k)
        .join(', ')
    return className && { className }
}
