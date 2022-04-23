import './App.css'

import { useState, createRef, Key } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'

import {
    getWordPosition,
    getAllWordPosition,
    getAllWordPosition2,
    getClasses,
} from './utils'
import items from './data'

import _TXT from '../txt/mc'

const columnCount = 32

export const TXT = (() =>
    _TXT
        .replaceAll('\n', '\n\n')
        .replaceAll(/[0-9]{4}年/gi, x => {
            return x + `(${Number(x.slice(0, -1)) - 1328}岁)`
        })
        .replaceAll(/（[0-9]{4}）/gi, e => {
            return `${e}(${Number(e.slice(1, -1)) - 1328}岁)`
        })
        // .replaceAll('的', '') // 会对搜索结果造成影响
        .split('\n')
        .filter(e => e)
        .map(e => {
            return e + ' '.repeat(columnCount * 2 - (e.length % columnCount))
        })
        .join(''))()

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

const Cell = (
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

    // const {
    //     [idx]: [index, targetNextIdx] = [],
    //     wordType,
    //     firstIdx,
    //     lastIdx,
    // } = getAllWordPosition2(select)

    const classes = getClasses({
        speaking: isSpkArr[idx],

        // [wordType]: targetNextIdx, // IDX 0是0  不能用此判断

        // 'select_first-item': idx === firstIdx,
        // 'select_last-item': idx === lastIdx,
    })

    const props = (function gene() {
        return {
            ...classes,

            style: {
                ...style,
                ...getStyles(word),
                // userSelect: isScrolling ? 'none' : 'text',
                userSelect: 'text',

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
    return <i {...props} />

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

            <div className='wrap' onClick={whenClickThenFindNextDom}>
                <script>{`console.log(3)`}</script>

                <style>
                    {`
                    .isSpeaking {
                        background:#6666ee
                    }
                    `}
                </style>

                <Grid
                    ref={gridRef}
                    useIsScrolling
                    // item counts
                    columnCount={columnCount}
                    rowCount={111113}
                    // item style
                    columnWidth={30}
                    rowHeight={30}
                    // wrap style
                    height={750}
                    width={columnCount * 30 + 33}
                >
                    {/* {renderProps => Cell(renderProps, select)} */}
                    {Cell}
                </Grid>

                {(() => {
                    return items.map(([roles, color], key) => (
                        <style key={key}>
                            {roles
                                .filter(e => e)
                                .map(word => getStyle(word, color))}
                        </style>
                    ))
                })()}
                <style>{getStyle(select, 'red')}</style>
            </div>
        </>
    )
    // console.time('app')

    // console.time('hook')
    const [s, ss] = useState('年4')

    // console.timeEnd('hook')

    // console.time('render')
    const render = (
        <>
            <style>{s + '{color:red}'}</style>
        </>
    )
    // console.timeEnd('render')

    // console.timeEnd('app')
    return render

    function whenClickThenFindNextDom({
        target,
        metaKey,
        altKey,
    }: React.MouseEvent) {
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

        const wordPosition = getWordPosition(select)
        if (wordPosition.length === 1) return

        const wordAllPosition = [...getAllWordPosition(select)]

        const clickIdx = wordAllPosition.indexOf(Number(target.dataset.i))
        if (clickIdx === -1) return

        const nextIdx = (() => {
            const len = wordAllPosition.length
            if (altKey && metaKey) return len - 1 // 直接跳到最后一个 {
            if (altKey) return 0 // 直接跳到第一个

            let nextIdx = clickIdx + select.length * (metaKey ? -1 : 1) // meta 相反方向
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
}

function getCssSelectorL(select: string) {
    const len = select.length
    const count = TXT.split(select).length - 1
    if (count === 0) return

    return Array.from(select)
        .map(word => `[data-e='${word}']`)
        .map((_, i, arr) =>
            arr.reduce((all, item, j) => {
                const last = j === len - 1 ? ')'.repeat(len - 1 - i) : ''
                const L = all + `:has(+` + item + last
                const R = all + `+` + item
                return i < j ? L : R
            })
        )
        .join(',\n')
}
function getCssStyleR(word: string, color: string) {
    const css1 =
        TXT.split(word).length - 1 === 1
            ? 'text-decoration: line-through red'
            : 'cursor:se-resize'
    const css2 = `color:${color}`
    const css3 = `content:'${word}'`

    return (
        '\n{\n' +
        [css1, css2, css3].reduce((all, now) => {
            return `${all} ${now};\n`
        }, '') +
        '}'
    )
}

function getStyle(word: string, color: string) {
    /* return后 有个空格 必要 不然\n失效; */
    return ` 
/* ${word} */
${getCss1(word, color)}
${getCss2(word)}
/* ${word} */
`
}
function getCss1(word: string, color: string) {
    return getCssSelectorL(word) + getCssStyleR(word, color)
}
function getCss2(word: string) {
    const len = word.length
    const wordPosition = [...getAllWordPosition(word)]
    if (!wordPosition.length) return
    const first = [wordPosition[0]]
    const last = wordPosition.slice(-1)
    const last2 = [wordPosition.at(0)]

    return [
        setCss(
            first,
            {
                'border-left': '1px solid red',
            },
            len
        ),
        setCss(
            last,
            {
                'border-right': '1px solid red',
            },
            len
        ),
    ]
}

function setCss(item: number[], _style: object, len: number) {
    const selector = item
        .reduce((all, now) => {
            return all + `[data-i='${now}'],`
            return all + `[data-i='${now}']${'[data-i]'.repeat(len)},` //hack for css-specificity
        }, '')
        .slice(0, -1)

    const style = JSON.stringify(_style)
        .replaceAll('"', '')
        .replaceAll(',', ';')
        .replace('{', '{ ')
        .replace('}', ' }')
    return selector + style
}
