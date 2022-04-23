import { TXT } from './App'

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
        getAllWordPositionCache[word] = new Set(
            getWordPosition(word).flatMap((n: number) =>
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
