import {
    memo,
    useState,
    SetStateAction,
    UIEvent,
    forwardRef,
    useEffect,
} from 'react'
import { SIZE_H, SIZE_W } from './App'
import {
    callWithTime,
    floor,
    getClasses,
    hasFeature,
    isInvalidWord,
} from './utils'

let timer: number
// Row是行， column是列
// memo后不是函数形式的组件了
export default forwardRef(function VGrid(
    {
        TXT,
        widthCount,
        heightCount,
        currentLine,
        spking,
        OVERSCAN_top,
        OVERSCAN_bottom,
        TXTBlock,
        txtDOM,
        feature,
        RENDER,
        onScrollHandle,
        isAotOver,
    }: {
        TXT: string
        widthCount: number
        heightCount: number
        currentLine: number
        spking: boolean[]
        OVERSCAN_top: number
        OVERSCAN_bottom: number
        TXTBlock: string[][]
    },
    ref: any
    // ref: React.MutableRefObject<HTMLDivElement>
) {
    // console.log('render VG')
    // useEffect(() => {
    //     console.log('effect VG')
    // })
    const paddingTop = currentLine - OVERSCAN_top
    const paddingBottom = TXT.length / widthCount - currentLine
    // console.log(paddingTop, paddingBottom)

    const L = Math.max(0, (currentLine - OVERSCAN_top) * widthCount)
    const R = (currentLine + OVERSCAN_bottom + heightCount) * widthCount

    return (
        <>
            <div
                className='container'
                onScroll={onScrollHandle}
                tabIndex={1}
                style={{
                    height: heightCount * SIZE_H,
                }}
                ref={ref}
            >
                <div
                    className='V-Grid'
                    style={{
                        // big bug
                        paddingTop: paddingTop * SIZE_H,
                        paddingBottom: paddingBottom * SIZE_H,
                        width: widthCount * SIZE_W,
                    }}
                >
                    {(() => {
                        // console.log('render VG')
                        // useEffect(() => {
                        //     console.log('effect VG')
                        // })
                        RENDER.reader++

                        // return 1
                        console.time('render reader')
                        const rs = isAotOver
                            ? txtDOM.slice(L, R)
                            : [...TXT.slice(L, R)].map((word, i) =>
                                  geneChild(word, i + L)
                              )
                        // 滚动一行 domdiff 部分更新比全量更新好(key->domdiff)
                        // 滚动全屏 domdiff 删除key直接更新属性 比删除dom新建dom好
                        console.timeEnd('render reader')
                        return rs
                    })()}
                    {(() => {
                        return

                        if (feature) {
                            return txtDOM.slice(L, R)
                        } else {
                            return [...TXT.slice(L, R)].map(geneChild)
                        }

                        let tempIdx = 0
                        let newLineIdx = 0

                        // reduce有必要 虽然返回数目和之前相同 貌似可以使用map
                        // 但中途修改了新数组 map做不到(只能修改原数组)
                        // .reduce(transform, [])

                        // const isNeedLine = preLine.lastIndexOf('\n')
                        // if (isNeedLine != -1) {
                        //     const newLine = preLine.slice(isNeedLine)

                        //     // rt = rt.slice(0, -widthCount)
                        // }

                        const enterIdx = TXT.lastIndexOf('\n', L) + 1

                        const need = widthCount - (enterIdx % widthCount)

                        // console.log(L)

                        if (L - enterIdx === need) {
                        } else {
                        }
                        // rt.unshift('\n')

                        const preLine = [...TXT.slice(L - widthCount, L)]
                        const firstLine = [...TXT.slice(L, L + widthCount)]

                        const idx2 = firstLine.lastIndexOf('\n')
                        if (idx2 === -1) {
                            // rt.unshift(...TXT.slice(L - need, L))
                        } else {
                            // Array(idx2)
                            //     .fill(0)
                            //     .forEach(() => {
                            //         rt.shift()
                            //     })
                        }

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

                        function geneChild(word: string, i: number) {
                            const idx = L + i

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

                                        // ...getClasses({
                                        //     speaking: spking[idx],
                                        // }),
                                    }}
                                />
                            )
                        }
                    })()}
                </div>
            </div>
        </>
    )
})
// dom6 key4 invalid3

export function geneChild(word: string, idx: number) {
    return (
        <span
            {...{
                key: idx,
                children: word,
                'data-i': idx,
                [isInvalidWord(word) ? 'data-invalid' : word]: word,
            }}
        />
    )
}
