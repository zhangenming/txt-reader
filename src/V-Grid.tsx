import {
    memo,
    useState,
    SetStateAction,
    UIEvent,
    forwardRef,
    useEffect,
    Fragment,
    useLayoutEffect,
} from 'react'
import { featureFlag, SIZE_H, SIZE_W } from './App'
import { usePrevious } from './hookUtils'
import {
    callWithTime,
    floor,
    getAllWordPosition,
    getAllWordPositionWithNode,
    getClasses,
    hasFeature,
    isInvalidWord,
    querySelector,
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
        TXTLen,
        mouseHover,
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

    // OVERSCAN_top = OVERSCAN_bottom = 0

    const beginLine = Math.max(0, currentLine - OVERSCAN_top)

    const L = beginLine * widthCount
    const R = Math.min(
        TXTLen,
        (currentLine + OVERSCAN_bottom + heightCount) * widthCount
    )

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
                        width: widthCount * SIZE_W,
                        paddingTop: beginLine * SIZE_H,
                        height: (TXTLen / widthCount) * SIZE_H,
                    }}
                >
                    {(() => {
                        console.time('render reader')
                        // console.log('render VG')
                        // useEffect(() => {
                        //     console.log('effect VG')
                        // })
                        RENDER.reader++

                        const rs = isAotOver //todo
                            ? featureFlag.line
                                ? txtDOM.slice(L, R)
                                : txtDOM.slice(L / widthCount, R / widthCount)
                            : [...TXT.slice(L, R)].map((word, i) =>
                                  geneChild(word, i + L)
                              )
                        // 滚动一行 domdiff 部分更新比全量更新好(key->domdiff)
                        // 滚动全屏 domdiff 删除key直接更新属性 比删除dom新建dom好
                        console.timeEnd('render reader')

                        return rs
                    })()}
                </div>
            </div>
        </>
    )
})
// dom6 key4 invalid3

export function geneChild2(words: string[], idx: number, key: number) {
    return (
        <Fragment key={key}>
            {words.map((word, i) => (
                <span
                    {...{
                        key: idx + i,
                        children: word,
                        'data-i': idx + i,
                        [isInvalidWord(word) ? 'data-invalid' : word]: word,
                    }}
                />
            ))}
        </Fragment>
    )
}
export function geneChild(word: string, idx: number) {
    return (
        <span
            {...{
                key: idx,
                children: word,
                'data-i': idx,
                [isInvalidWord(word) ? 'data-invalid' : word]: word,
                // style: {
                //     background: mouseHoverTargets?.includes(idx) ? 'red' : '',
                // },
            }}
        />
    )
}
