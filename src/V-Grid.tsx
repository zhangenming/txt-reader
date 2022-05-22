import { memo, useState, SetStateAction, UIEvent } from 'react'
import { callWithTime, getClasses, isInvalidWord } from './utils'

let clear = 0
// Row是行， column是列
const Item3Memo = memo(Item3) // memo后不是函数形式的组件了

export default memo(
    callWithTime(function VGrid({
        TXT,
        lineSize,
        heightLineCount,
        height,
        SIZE,
        currentLine,
        currentLineSET,
        spk,
        OVERSCAN,
    }: {
        TXT: string
        lineSize: number
        heightLineCount: number
        height: number
        SIZE: number
        currentLine: number
        currentLineSET: (n: number) => void
        spk: boolean[]
        OVERSCAN: number
    }) {
        const L = currentLine * lineSize
        const R = (heightLineCount + OVERSCAN) * lineSize

        return (
            <>
                <div
                    className='container'
                    onScroll={onScrollHandle}
                    tabIndex={1}
                    style={{
                        height: heightLineCount * SIZE + 'px',
                    }}
                >
                    <div
                        className='V-Grid'
                        style={{
                            paddingTop: currentLine * SIZE + 'px',
                            paddingBottom: height - currentLine * SIZE + 'px',
                            width: lineSize * 30 + 'px',
                        }}
                    >
                        {[...TXT.slice(L, L + R)].map((word, i) => {
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

                                        // ...getClasses({ speaking: spk[idx] }),
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
                currentLineSET(lineIdxScrollChange)
            } else {
                clearTimeout(clear)
                clear = setTimeout(() => {
                    currentLineSET(lineIdxScrollChange)
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
