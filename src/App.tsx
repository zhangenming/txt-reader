import './App.css'

import { useState, createRef } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'

import {
    getWordPosition,
    getAllWordPosition,
    getClasses,
    getStyle,
} from './utils'
import items from './data'

const itemSize = 30
const readerWidth = innerWidth - 100
const readerHeight = innerHeight
export const columnCount = Math.floor(readerWidth / itemSize) - 1

// import _TXT from '../txt/mc'
// export const TXT = (() =>
//     _TXT
//         .replaceAll('\n', '\n\n')
//         .replaceAll(/[0-9]{4}年/gi, x => {
//             return x + `(${Number(x.slice(0, -1)) - 1328}岁)`
//         })
//         .replaceAll(/（[0-9]{4}）/gi, e => {
//             return `${e}(${Number(e.slice(1, -1)) - 1328}岁)`
//         })
//         // .replaceAll('的', '') // 会对搜索结果造成影响
//         .split('\n')
//         .filter(e => e)
//         .map(e => {
//             return e + ' '.repeat(columnCount * 2 - (e.length % columnCount))
//         })
//         .join(''))()

import _TXT from '../txt/白鹿原'

export const TXT = (() =>
    _TXT
        .replaceAll('    ', '  ')
        .split('\n')
        .filter(e => e)
        .map(e => {
            return e + ' '.repeat(columnCount * 2 - (e.length % columnCount))
        })
        .join(''))()

console.log(_TXT.length, TXT.length)

const isSpkArr = (() => {
    let isSpeaking = false
    return [...TXT].map(e => {
        if (e === '“') {
            isSpeaking = true
            return false
        }
        if (e === '”') {
            isSpeaking = false
            return false
        }
        return isSpeaking
    })
    return [...TXT].map(e => {
        let rt = isSpeaking
        if (e === '“') isSpeaking = true
        if (e === '”') rt = isSpeaking = false
        return rt
    })
})()

const Cells = (
    {
        columnIndex,
        rowIndex,
        style,
        isScrolling,
    }: {
        columnIndex: number
        rowIndex: number
        style: object
        isScrolling?: boolean
    },
    select?: string
) => {
    const idx = rowIndex * columnCount + columnIndex
    // idx < 100 && console.time() // devtools记录模式快很多
    const word = TXT[idx]

    const classes = getClasses({
        speaking: isSpkArr[idx],
        // isOdd: rowIndex % 2,
    })

    const props = (function gene() {
        return {
            ...classes,

            style: {
                ...style,
                ...getStyles(word),
                // userSelect: isScrolling ? 'none' : 'text',

                '--var-color': 'black',
            } as any,

            children: word,
            // key: idx, // ?

            'data-e': word,
            'data-i': idx,
            // 'data-next': targetNextIdx,
            'data-rowindex': rowIndex,
            'data-columnindex': columnIndex,
            // 'data-index': index,
        }
    })()
    // idx < 100 && console.timeEnd()
    return <span {...props} />

    function getStyles(word: string) {
        const style1 = word === '“' || word === '('
        const style2 = word === '”' || word === ')'
        const style3 = word === ' ' || word === '　'

        return {
            ...(style1 && {
                textAlign: 'right',
            }),
            ...(style2 && {
                textAlign: 'left',
            }),
            ...(style3 &&
                {
                    // fontSize: '0',
                    // 'user-select': 'none',
                }),
        }
    }
}

export default function App() {
    const [select, setSelect] = useState('版权归')
    const gridRef = createRef<Grid>()
    return (
        <>
            <div className='control'>
                <input
                    type='text'
                    value={select}
                    onChange={e => setSelect(e.target.value)}
                />
                {TXT.split(select).length - 1}
            </div>

            <div className='resourse'>
                <script>{`console.log(3)`}</script>

                <style>
                    {`
                        .isSpeaking {
                            background:#6666ee
                        }
                    `}
                </style>
                <style>
                    {
                        // Array(columnCount)
                        //     .fill(null)
                        //     .map((_, i) => `span:hover ${'+span '.repeat(i)}`)
                        //     .join(',\n') + '{background:yellowgreen}'
                        // // // // // // //
                        // aot 卡, 使用jit
                        // span:hover,
                        // span:hover + span,
                        // span:hover + span + span,
                        // span:hover + span + span + span {
                        //     background: yellowgreen;
                        // }
                    }
                </style>

                {items.map(([color, roles], key) => (
                    <style key={key}>
                        {roles
                            .filter(e => e)
                            .map(word => getStyle(word, color))}
                    </style>
                ))}
                <style>{getStyle(select, 'red')}</style>
            </div>

            <div className='wrap' onClick={GoToNextItem}>
                <Grid
                    ref={gridRef}
                    useIsScrolling
                    // item counts
                    columnCount={columnCount}
                    rowCount={TXT.length / columnCount}
                    // item style
                    columnWidth={itemSize}
                    rowHeight={itemSize}
                    // wrap style
                    height={readerHeight}
                    width={readerWidth}
                >
                    {/* {renderProps => Cell(renderProps, select)} */}
                    {Cells}
                </Grid>
            </div>
        </>
    )

    function GoToNextItem({ target, metaKey, altKey }: React.MouseEvent) {
        const selectionObj = getSelection()
        if (!selectionObj) return

        const selectionStr = selectionObj.toString()

        // selectionObj.removeAllRanges()
        if (selectionStr.length > 0 && selectionStr.length < 210) {
            if (selectionStr.includes('\n')) return
            setSelect(selectionStr.replaceAll(' ', ''))
            return
        }

        if (!(target instanceof HTMLElement)) return alert(1)

        const _content = getComputedStyle(target).content
        if (_content === 'normal') return
        const content = _content.slice(1, -1) //去掉引号

        const wordAllPosition = getAllWordPosition(content)

        const clickIdx = wordAllPosition.indexOf(Number(target.dataset.i))
        if (clickIdx === -1) return

        const nextIdx = (() => {
            const len = wordAllPosition.length
            if (altKey && metaKey) return len - 1 // 直接跳到最后一个 {
            if (altKey) return 0 // 直接跳到第一个

            let nextIdx = clickIdx + content.length * (metaKey ? -1 : 1) // meta 相反方向
            if (nextIdx > len - 1) {
                return nextIdx - len //处理从数组尾到头
            }
            return nextIdx
        })()

        const nextIDX = wordAllPosition.at(nextIdx) //从头到尾

        gridRef.current?.scrollToItem({
            align: 'center',
            columnIndex: nextIDX % columnCount,
            rowIndex: Math.floor(nextIDX / columnCount),
        })
    }

    // console.time('app')

    // console.time('hook')

    // console.timeEnd('hook')

    // console.time('render')
    const render = <></>
    // console.timeEnd('render')

    // console.timeEnd('app')
    return render
}
