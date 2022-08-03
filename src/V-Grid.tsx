import { Fragment } from 'react'
import { SIZE_H } from './App'
import { config, hasFeature } from './utils'

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

    const { BLOCK_STR_JIT: JIT, BLOCK_ELE_AOT: AOT, block2Line } = config

    return (
        <>
            <div className='V-Grid'>
                <div
                    role='占位符'
                    style={{
                        height: block2Line(blockL) * SIZE_H,
                    }}
                />
                {/* // 滚动一行 domdiff 部分更新比全量更新好(key->domdiff) */}
                {/* // 滚动全屏 domdiff 删除key直接更新属性 比删除dom新建dom好 */}
                {/* 滑动的时候卡 能不能滑动的时候暂时只新建dom  删除dom稍后操作 */}

                {AOT.length === JIT.length
                    ? AOT.slice(blockL, blockR)
                    : JIT.slice(blockL, blockR).map((block, i) =>
                          geneBlock(block, blockL + i, block2Line(blockL + i))
                      )}
                {/* // todo remove just temp value JIT */}
            </div>
        </>
    )
}

let isSpeaking = 0
const itemMap: any = {}
export function geneBlock(line: string, blockIdx: number, lineIdx: number) {
    return line === '  ' ? (
        <div key={blockIdx} data-line={lineIdx} />
    ) : (
        // ''
        // doing fail
        <div
            key={blockIdx}
            data-line={lineIdx}
            data-block={blockIdx}
            data-str={
                line.length < 20
                    ? line
                    : line.slice(0, 10) + '...' + line.slice(-10)
            }
        >
            {[...line].map(geneItem)}
        </div>
    )
}

function geneItem(word: string) {
    if (!itemMap[word]) {
        // console.log(1)

        itemMap[word] = [
            <span className={word} children={word} />,
            <span
                className={word}
                children={word}
                style={{
                    background: 'teal',
                }}
            />,
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
