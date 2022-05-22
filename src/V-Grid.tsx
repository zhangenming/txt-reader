import { memo, useState, SetStateAction, UIEvent } from 'react'
import { SIZE } from './App'
import { callWithTime, getClasses, isInvalidWord } from './utils'
let clear = 0
// Row是行， column是列
const Item3Memo = memo(Item3) // memo后不是函数形式的组件了

export default memo(
    callWithTime(function VGrid({
        TXT,
        widthCount,
        heightCount,
        currentLine,
        SET_currentLine,
        spking,
        OVERSCAN,
    }: {
        TXT: string
        widthCount: number
        heightCount: number
        currentLine: number
        SET_currentLine: (n: number) => void
        spking: boolean[]
        OVERSCAN: number
    }) {
        const L = currentLine * widthCount
        const R = (heightCount + OVERSCAN) * widthCount

        const paddingTop = currentLine
        const paddingBottom = TXT.length / widthCount - currentLine
        return (
            <>
                <div
                    className='container'
                    onScroll={onScrollHandle}
                    tabIndex={1}
                    style={{
                        height: heightCount * SIZE + 'px',
                    }}
                >
                    <div
                        className='V-Grid'
                        style={{
                            paddingTop: paddingTop * SIZE + 'px',
                            paddingBottom: paddingBottom * SIZE + 'px',
                            width: widthCount * SIZE + 'px',
                        }}
                    >
                        {[...TXT.slice(L, L + R)].map((word, i) => {
                            if (word === '\n') {
                                console.log(i, i % 1)
                            }
                            const idx = L + i
                            // 如果是\n 新建空行 省略掉useTXT
                            return (
                                <span
                                    {...{
                                        key: idx,
                                        children: word,

                                        'data-i': idx,

                                        [isInvalidWord(word)
                                            ? 'data-invalid'
                                            : word]: word,

                                        // ...(isInvalidWord(word)
                                        //     ? {
                                        //           'data-invalid': '',
                                        //       }
                                        //     : { [word]: word }),

                                        ...getClasses({
                                            speaking: spking[idx],
                                        }),
                                    }}
                                />
                            )
                        })}
                    </div>
                </div>
            </>
        )

        function onScrollHandle(e: UIEvent) {
            const lineIdxScrollChange = Math.floor(
                (e.target as HTMLElement).scrollTop / SIZE
            )

            if (0) {
                SET_currentLine(lineIdxScrollChange)
            } else {
                clearTimeout(clear)
                clear = setTimeout(() => {
                    SET_currentLine(lineIdxScrollChange)
                }, 10)
            }
        }
    })
)

function Item3({
    idx,
    word,
    spk,
}: {
    idx: number
    word: string
    spk: boolean[]
}) {
    return (
        <span
            {...{
                'data-i': idx,
                [isInvalidWord(word) ? 'data-invalid' : word]: word,

                ...getClasses({ speaking: spk[idx] }),
            }}
        >
            {word}
        </span>
    )
}
