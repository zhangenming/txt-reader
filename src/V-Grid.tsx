import { Fragment } from 'react'
import { SIZE_H } from './App'
import { config } from './hook'
import { hasFeature } from './utils'
// console.log('VG TSX ')
// Row是行， column是列
// memo后不是函数形式的组件了
export default function VGrid({
    blockL,
    blockR,
}: {
    blockL: number
    blockR: number
}) {
    // console.log('render VG')
    // useEffect(() => {
    //     console.log('effect VG')
    // })

    const { BLOCK, BLOCK_AOT, block2Line } = config

    return (
        <>
            <div className='V-Grid'>
                <nav
                    role='占位符'
                    style={{
                        height: block2Line[blockL] * SIZE_H,
                    }}
                />
                {/* // 滚动一行 domdiff 部分更新比全量更新好(key->domdiff) */}
                {/* // 滚动全屏 domdiff 删除key直接更新属性 比删除dom新建dom好 */}
                {/* 滑动的时候卡 能不能滑动的时候暂时只新建dom  删除dom稍后操作 */}

                {/* // todo remove just temp value JIT */}
                {/* todo  首屏直出(缓存到LS) 躲避txt过大等待加载 */}
                {hasFeature('aot')
                    ? BLOCK_AOT.slice(blockL, blockR)
                    : BLOCK.slice(blockL, blockR).map((block, i) =>
                          geneBlock(block, blockL + i, block2Line[blockL + i])
                      )}
            </div>
        </>
    )
}

const blockCache: any = {}
const xxx = new Set()
export function geneBlock(block: string, blockIdx: number, lineIdx?: number) {
    if (!blockCache[blockIdx]) {
        xxx.add(blockIdx)
        blockCache[blockIdx] =
            block === '  ' ? (
                <div key={blockIdx} />
            ) : (
                // ''
                // doing fail
                <div
                    key={blockIdx}
                    data-line={lineIdx}
                    data-block={blockIdx}
                    data-str={
                        block.length < 20
                            ? block
                            : block.slice(0, 10) + '...' + block.slice(-10)
                    }
                >
                    {[...block].map(geneItem)}
                </div>
            )
    }

    return blockCache[blockIdx]
}

let isSpeaking = 0
const itemMap: any = {}
function geneItem(word: string) {
    if (!itemMap[word]) {
        itemMap[word] = [
            <span className={word} children={word} />,
            <span className={word + ' speaking'} children={word} />,
        ]
    }

    if (word === '”') {
        isSpeaking = 0
    }

    const spk = isSpeaking

    if (word === '“') {
        isSpeaking = 1
    }

    return itemMap[word][spk]

    return (
        <span
            className={word + isSpeaking ? '  speaking' : ''}
            children={word}
        />
    )
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
