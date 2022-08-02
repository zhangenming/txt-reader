import { forwardRef, Fragment, useMemo } from 'react'
import { SIZE_H, SIZE_W } from './App'
import { config, hasFeature } from './utils'

// console.log('VG TSX ')
// Row是行， column是列
// memo后不是函数形式的组件了
export default forwardRef(function VGrid(
    {
        widthCount,
        heightCount,
        onScrollHandle,
        blockL,
        blockR,
    }: {
        widthCount: number
        heightCount: number
    },
    ref: any
    // ref: React.MutableRefObject<HTMLDivElement>
) {
    // console.log('render VG')
    // useEffect(() => {
    //     console.log('effect VG')
    // })

    const {
        BLOCK_STR_JIT: JIT,
        BLOCK_ELE_AOT: AOT,
        line2Block,
        block2Line,
    } = config

    const paddingTop = block2Line(blockL) * SIZE_H
    return (
        <>
            <div
                className='container'
                onScroll={onScrollHandle}
                tabIndex={1}
                ref={ref}
            >
                <div
                    className='V-Grid'
                    style={{
                        paddingTop,
                    }}
                >
                    {/* // 滚动一行 domdiff 部分更新比全量更新好(key->domdiff) */}
                    {/* // 滚动全屏 domdiff 删除key直接更新属性 比删除dom新建dom好 */}
                    {/* 滑动的时候卡 能不能滑动的时候暂时只新建dom  删除dom稍后操作 */}

                    {AOT.length === JIT.length
                        ? AOT.slice(blockL, blockR)
                        : JIT.slice(blockL, blockR).map((block, i) =>
                              geneBlock(block, blockL + i)
                          )}
                    {/* // todo remove just temp value JIT */}
                </div>
            </div>
        </>
    )
})

let isSpeaking = 0
const itemMap: any = {}
export function geneBlock(line: string, key: number) {
    return line === '  ' ? (
        // <i key={key} />
        ''
    ) : (
        <div key={key} data-block-idx={key} data-str={line}>
            {[...line].map(geneItem)}
        </div>
    )
}

function geneItem(word: string) {
    if (word === '”') {
        isSpeaking = 0
    }

    if (!hasFeature('cache')) {
        return (
            <span
                {...{
                    children: word,
                    className: word,
                    style: {
                        background: isSpeaking && 'teal',
                    },
                }}
            />
        )
    }

    if (!itemMap[word]) {
        itemMap[word] = [
            <span className={word}>{word}</span>,
            <span
                {...{
                    children: word,
                    className: word,
                    style: {
                        background: 'teal',
                    },
                }}
            />,
        ]
    }

    const spk = isSpeaking

    if (word === '“') {
        isSpeaking = 1
    }

    return itemMap[word][spk]
}

function geneChild2(words: string[], idx: number, key: number) {
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
