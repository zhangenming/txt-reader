import { useState, memo } from 'react'
import './App.css'
// import TXTa from '../txt/2'
// import TXTb from '../txt/诡秘之主.js'
import TXTc from '../txt/mc'

const txtAll = TXTc

const txtHalf = txtAll
    .slice(0, 11111)
    .replaceAll('\n', '\n\n')
    .replaceAll(/[0-9]{4}年/gi, x => {
        return x + `(${Number(x.slice(0, -1)) - 1328}岁)`
    })
    .replaceAll(/（[0-9]{4}）/gi, e => {
        return `${e}(${Number(e.slice(1, -1)) - 1328}岁)`
    })
    .replaceAll('的', '')

const txtDom = (() => {
    // console.time('txtDom')
    let isSpeaking: boolean
    const txtDom = [...txtHalf].map((e, i, arr) => {
        if (e === '”') isSpeaking = false
        const dom = (
            <i
                key={i}
                data-e={e}
                data-i={i}
                className={isSpeaking && e != '　' ? 'isSpeaking' : ''}
            >
                {e}
            </i>
        )
        if (e === '“') isSpeaking = true
        return dom
        if (i < arr.length / 2) {
            return (
                <i
                    key={i}
                    data-el={e}
                    data-i={i}
                    className={i as unknown as string}
                >
                    {e}
                </i>
            )
        }
        return (
            <i
                key={i}
                data-er={e}
                data-i={i}
                className={i as unknown as string}
            >
                {e}
            </i>
        )
    })
    // console.timeEnd('txtDom')
    return txtDom
})()

type roules = string[]
type color = string
type Item = [roules, color]
const items: Item[] = [
    [
        [
            '孙德崖',
            '张士诚',
            '陈友谅',
            '徐寿辉',
            '郭子兴',
            '刘福通',
            '张定边',
            '',
            '',
            '',
            '红巾军',
        ],
        'black',
    ],
    [
        [
            '朱重八',
            '朱元璋',
            '李善长',
            '常遇春',
            '徐达',
            '刘基',
            '冯胜',
            '朱文正',
            '邓愈',
            '张子明',
            '李文忠',
            '',
            '',
        ],
        'firebrick',
    ],
    [
        [
            '年',
            '州',
            '凤阳',
            '南京',
            '集庆',
            '应天',
            '镇江',
            '太平',
            '洪都',
            '安丰',
            '',
            '',
            '',
            '',
        ],
        'yellow',
    ],
]
const XX = memo(function X() {
    return <div>{txtDom}</div>
})
export default function App() {
    // const [q, qq] = useState('年4')
    // const dom = useMemo(() => txtDom, [''])
    // return (
    //     <div>
    //     <ul className='toc'>
    //     <li>Intro</li>
    //     <li>
    //         Topic
    //         <ul>
    //             <li>Subtopic</li>
    //             <li>Subtopic</li>
    //             <li>Subtopic</li>
    //         </ul>
    //     </li>
    //     <li>
    //         Topic
    //         <ul>
    //             <li>Subtopic</li>
    //             <li>Subtopic</li>
    //             <li>Subtopic</li>
    //         </ul>
    //     </li>
    //     <li>Closing</li>
    // </ul>
    //         <div>
    //             <style>{q + '{color:black}'}</style>
    //             <input
    //                 type='text'
    //                 value={q}
    //                 onChange={e => qq(e.target.value)}
    //             />
    //         </div>
    //         <div className='wrap'>
    //             <XX />
    //         </div>
    //     </div>
    // )
    // console.time('app')

    // console.time('hook')
    const [select, setSelect] = useState('我')
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

            <div className='control'>
                <input
                    type='text'
                    value={select}
                    onChange={e => setSelect(e.target.value)}
                />
                -- {txtAll.split(select).length - 1}(
                {txtHalf.split(select).length - 1})--
                <input
                    type='text'
                    value={s}
                    onChange={e => ss(e.target.value)}
                />
            </div>

            <div className='wrap'>
                <div>样赞叹这座二百五十年前的建筑物</div>
                <div>样赞叹这座二百五十年前的建筑物</div>
                <div
                    onClick={whenClickThenFindNextDom}
                    onDoubleClick={e => {
                        e.stopPropagation()
                        e.preventDefault()
                        return false
                    }}
                >
                    {txtDom}
                </div>
            </div>
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
        if (selectionStr) {
            setSelect(selectionStr)
            // selectionObj.removeAllRanges()
            return
        }

        if (!(target instanceof HTMLElement)) return

        const wordPosition = getWordPosition(select)
        if (wordPosition.length === 1) return

        const wordAllPosition = getAllWordPosition(wordPosition, select.length)

        const clickIdx = wordAllPosition.indexOf(Number(target.dataset.i))
        if (clickIdx === -1) return

        let nextIdx
        if (altKey) {
            if (metaKey) {
                nextIdx = wordAllPosition.length - 1 // 直接跳到最后一个
            } else {
                nextIdx = 0 // 直接跳到第一个
            }
        } else {
            nextIdx = clickIdx + select.length * (metaKey ? -1 : 1) // meta 相反方向
            if (nextIdx > wordAllPosition.length - 1) {
                //处理从数组尾到头
                nextIdx = nextIdx - wordAllPosition.length
            }
        }

        const nextDomIdx = wordAllPosition.at(nextIdx) //从头到尾
        const nextDom = document.querySelector<HTMLElement>(
            `[data-i='${nextDomIdx}']`
        )
        if (!nextDom) return

        document.documentElement.scrollTop = nextDom.offsetTop - 440
    }
}

// 查找一个字符串中的所有子串的位置
function getWordPosition(word: string) {
    const positions = []
    let pos = txtHalf.indexOf(word)
    while (pos > -1) {
        positions.push(pos)
        pos = txtHalf.indexOf(word, pos + word.length)
    }
    return positions
}
function getAllWordPosition(wordPosition: number[] | string, len: number) {
    if (typeof wordPosition === 'string') {
        wordPosition = getWordPosition(wordPosition) // when add cache can delete
    }
    return wordPosition.flatMap(n =>
        Array(len)
            .fill(0)
            .map((_, i) => n + i)
    )
}

function getCssSelectorL(select: string) {
    const len = select.length
    const count = txtHalf.split(select).length - 1
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
        txtAll.split(word).length - 1 === 1
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
    const wordPosition = getAllWordPosition(word, len)
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
