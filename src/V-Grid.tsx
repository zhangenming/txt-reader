import { memo, useState, SetStateAction, UIEvent } from 'react'
import { SIZE } from './App'
import { callWithTime, floor, getClasses, isInvalidWord } from './utils'

// Row是行， column是列
// memo后不是函数形式的组件了

export default memo(
    callWithTime(function VGrid({
        TXT,
        widthCount,
        heightCount,
        currentLine,
        SET_currentLine,
        spking,
        OVERSCAN_top,
        OVERSCAN_bottom,
    }: {
        TXT: string
        widthCount: number
        heightCount: number
        currentLine: number
        SET_currentLine: (n: number) => void
        spking: boolean[]
        OVERSCAN_top: number
        OVERSCAN_bottom: number
    }) {
        const L = (currentLine - OVERSCAN_top) * widthCount
        const R = (currentLine + heightCount + OVERSCAN_bottom) * widthCount

        const paddingTop = currentLine - OVERSCAN_top
        const paddingBottom = TXT.length / widthCount - currentLine

        console.log('VG.....')

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
                        {(() => {
                            let tempIdx = 0
                            let newLineIdx = 0

                            return (
                                [...TXT.slice(L, R)]
                                    // reduce有必要 虽然返回数目和之前相同 貌似可以使用map
                                    // 但中途修改了新数组 map做不到(只能修改原数组)
                                    .reduce(transform, [])
                                    .map(geneChild)
                            )

                            function transform(
                                acc: (string | number)[],
                                cur: string,
                                i: number
                            ) {
                                if (cur !== '〇' && tempIdx == 0) {
                                    acc.push(cur) // 正常字符 加入
                                }
                                if (cur === '〇') {
                                    tempIdx++ // 占位符 舍弃
                                }
                                if (cur !== '〇' && tempIdx != 0) {
                                    acc.push(cur) // 正常字符 加入
                                    acc[i - 1] = tempIdx // 发现上一个就是标志位 重新赋值
                                    tempIdx = 0
                                }
                                return acc
                            }

                            function geneChild(
                                word: string | number,
                                i: number
                            ) {
                                const idx = L + i

                                //标志符
                                if (typeof word === 'number') {
                                    return (
                                        <span
                                            key={idx}
                                            style={{
                                                width: 'inherit',
                                            }}
                                            data-newlineidx={newLineIdx++}
                                        />
                                    )
                                }

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
                            }
                        })()}
                    </div>
                </div>
            </>
        )

        function onScrollHandle(e: UIEvent) {
            const lineIdxScrollChange = floor(
                (e.target as HTMLElement).scrollTop / SIZE
            )
            SET_currentLine(lineIdxScrollChange)
        }
    })
)
