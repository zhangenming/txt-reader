import { forwardRef, Fragment } from 'react'
import { SIZE_H, SIZE_W } from './App'
import { config } from './utils'

// Row是行， column是列
// memo后不是函数形式的组件了
export default forwardRef(function VGrid(
    {
        widthCount,
        heightCount,
        currentLine,
        onScrollHandle,
        overscan,
    }: {
        widthCount: number
        heightCount: number
        currentLine: number
        spking: boolean[]
    },
    ref: any
    // ref: React.MutableRefObject<HTMLDivElement>
) {
    // console.log('render VG')
    // useEffect(() => {
    //     console.log('effect VG')
    // })

    const { JIT, AOT } = config

    const L = Math.max(0, currentLine - overscan.top)
    const R = Math.min(JIT.length, currentLine + overscan.bot + heightCount)

    return (
        <>
            <div
                className='container'
                style={{
                    height: heightCount * SIZE_H,
                }}
                onScroll={onScrollHandle}
                tabIndex={1}
                ref={ref}
            >
                <div
                    className='V-Grid'
                    style={{
                        width: widthCount * SIZE_W,
                        paddingTop: L * SIZE_H,
                        height: JIT.length * SIZE_H,
                    }}
                >
                    {/* // 滚动一行 domdiff 部分更新比全量更新好(key->domdiff) */}
                    {/* // 滚动全屏 domdiff 删除key直接更新属性 比删除dom新建dom好 */}
                    {/* 滑动的时候卡 能不能滑动的时候暂时只新建dom  删除dom稍后操作 */}
                    {AOT.length === JIT.length
                        ? AOT.slice(L, R)
                        : JIT.slice(L, R).map((line, i) =>
                              geneLine(line, L + i)
                          )}
                </div>
            </div>
        </>
    )
})

export function geneLine(line: string, key: number) {
    return (
        <div data-line={key} key={key}>
            {[...line].map(geneItem)}
        </div>
    )
}

let isSpeaking = false
function geneItem(word: string, i: number) {
    if (word === '”') {
        isSpeaking = false
    }

    const rt = (
        <span
            {...{
                i: i + 1,
                key: i,
                children: word,
                className: word,
                style: {
                    background: isSpeaking && 'teal',
                },
            }}
        />
    )

    if (word === '“') {
        isSpeaking = true
    }

    return rt
}

export function geneChild(word: string, idx: number) {
    if (word === '”') {
        isSpeaking = false
    }

    const rt = (
        <span
            {...{
                key: idx,
                children: word,
                className: word,
                style: { background: isSpeaking && 'teal' },
            }}
        />
    )

    if (word === '“') {
        isSpeaking = true
    }

    return rt
}

export function geneChild2(words: string[], idx: number, key: number) {
    return (
        <Fragment key={key}>
            {words.map((word, i) => (
                // word的原子的 how to cache?
                <span
                    {...{
                        key: idx + i,
                        children: word,
                        className: word,
                    }}
                />
            ))}
        </Fragment>
    )
}
