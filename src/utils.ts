import { TXTdone } from './App'

// 查找一个字符串中的所有子串的位置
const getWordPositionCache: any = {}
export function getWordPosition(word: string) {
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
const getAllWordPosition2Cache: any = {} // todo with decorator
export function getAllWordPosition2(word: string) {
    if (!getAllWordPosition2Cache[word]) {
        const tmp = Object.entries(
            getWordPosition(word).flatMap((n: any) =>
                Array(word.length)
                    .fill(0)
                    .map((_, i) => n + i)
            )
        )
        getAllWordPosition2Cache[word] = tmp.reduce((all, [_, v]) => {
            all[v] = v
            return all
        }, {})
        getAllWordPosition2Cache[word].firstIdx = tmp[0][1]
        getAllWordPosition2Cache[word].lastIdx = tmp.at(-1)[1]
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
