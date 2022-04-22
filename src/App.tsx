import { useState, createRef } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'
import items, { Item } from './data'

import './App.css'
import TXT from '../txt/mc'
import {
    getWordPosition,
    getAllWordPosition,
    getAllWordPosition2,
    getClasses,
} from './utils'

const columnCount = 32

export const TXTdone = TXT.replaceAll('\n', '\n\n')
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
    .join('')

const isSpkArr = (() => {
    let isSpeaking: boolean = false
    return [...TXTdone].map(e => {
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
    return [...TXTdone].map(e => {
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
    select: string
) => {
    const idx = rowIndex * columnCount + columnIndex
    // idx < 100 && console.time() // devtools记录模式快很多
    const word = TXTdone[idx]

    const wordPst = getWordPosition(select)
    const allWordPst = getAllWordPosition2(select)
    // const allWordPstArr = [...allWordPst]

    const classes = getClasses({
        speaking: isSpkArr[idx],

        [wordPst.length === 1 ? 'select_just-one' : 'select_many']:
            allWordPst[idx],

        'select_first-item': idx === allWordPst.first,
        'select_last-item': idx === allWordPst.last,
    })

    // idx < 100 && console.timeEnd()
    return (
        <i
            {...{
                ...classes,

                style: {
                    ...style,
                    ...getStyles(word),
                    'user-select': isScrolling ? 'none' : 'text',
                    // 'user-select': 'text',
                } as any,

                children: word,
                key: idx, // ?

                'data-e': word,
                'data-i': idx,
            }}
        />
    )

    function getStyles(word: string) {
        const style1 = word === '“' || word === '('
        const style2 = word === '”' || word === ')'
        const style3 = word === ' ' || word === '　'

        return {
            ...(style1 && {
                'text-align': 'right',
            }),
            ...(style2 && {
                'text-align': 'left',
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
    const [select, setSelect] = useState('我')
    const gridRef = createRef<Grid>()
    const win = (
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
                <style>
                    {`
                    .isSpeaking {
                        background:#6666ee
                    }
                    .isSelect {
                        color:red
                    }
                    `}
                </style>
                <Grid
                    ref={gridRef}
                    useIsScrolling
                    //
                    columnCount={columnCount}
                    rowCount={111113}
                    //
                    columnWidth={30}
                    rowHeight={30}
                    //
                    height={750}
                    width={columnCount * 30 + 33}
                >
                    {renderProps => Cell(renderProps, select)}
                </Grid>
            </div>
        </>
    )
    return win
    // console.time('app')

    // console.time('hook')
    const [s, ss] = useState('年4')
    const [selectArr, setSelectArr] = useState(items)
    const styles = [...items, [[select], 'red'] as Item].map(
        ([roules, color]) => getCss(roules, color)
    )
    // console.timeEnd('hook')

    // console.time('render')
    const render = (
        <>
            {styles}
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
            if (altKey && metaKey) return wordAllPosition.length - 1 // 直接跳到最后一个 {
            if (altKey) return 0 // 直接跳到第一个

            let nextIdx = clickIdx + select.length * (metaKey ? -1 : 1) // meta 相反方向
            if (nextIdx > wordAllPosition.length - 1) {
                return nextIdx - wordAllPosition.length //处理从数组尾到头
            }
            return nextIdx
        })()

        const nextDomIdx = wordAllPosition.at(nextIdx) //从头到尾

        gridRef.current?.scrollToItem({
            align: 'center',
            columnIndex: nextDomIdx % columnCount,
            rowIndex: Math.floor(nextDomIdx / columnCount),
        })
        // const nextDom = document.querySelector<HTMLElement>(
        //     `[data-i='${nextDomIdx}']`
        // )
        // if (!nextDom) return

        // document.documentElement.scrollTop = nextDom.offsetTop - 440
    }
}

function getCssSelectorL(select: string) {
    const len = select.length
    const count = TXTdone.split(select).length - 1
    if (count === 0) return

    return (
        Array.from(select)
            .map(word => `[data-e='${word}']`)
            .map((_, i, arr) =>
                arr.reduce((all, item, j) => {
                    const last = j === len - 1 ? ')'.repeat(len - 1 - i) : ''
                    const L = all + `:has(+` + item + last
                    const R = all + `+` + item
                    return i < j ? L : R
                })
            )
            .reduce((all, item) => {
                return all + '\n' + item + ','
            }, '')
            .slice(0, -1) + '\n'
    )
}
function getCssStyleR(word: string, color: string) {
    const css1 =
        TXT.split(word).length - 1 === 1
            ? 'text-decoration: line-through red'
            : 'cursor:se-resize'
    const css2 = `color:${color}`

    return (
        '{' +
        [css1, css2].reduce((all, now) => {
            return `${all} ${now};\n`
        }, '\n') +
        '}'
    )
}
function getCss(arr: string[], color: string) {
    return arr
        .filter(e => e)
        .map((word, idx) => {
            return (
                <style key={idx}>
                    {getCssSelectorL(word) + getCssStyleR(word, color)}
                    {getCss2(word)}
                </style>
            )
        })
}
function getCss2(word: string) {
    const len = word.length
    const wordPosition = getAllWordPosition(word)
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
            return all + `[data-i='${now}'],` //hack for css-specificity
            return all + `[data-i='${now}']${'[data-i]'.repeat(len)},` //hack for css-specificity
        }, '')
        .slice(0, -1)

    const style = JSON.stringify(_style)
        .replaceAll('"', '')
        .replaceAll(',', ';')
    return selector + style
}
