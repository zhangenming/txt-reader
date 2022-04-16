import { useState, MouseEvent } from 'react'
import './App.css'
import TXTa from '../txt/2'
import TXTb from '../txt/诡秘之主.js'
const TXT2 = (() => {
  console.log(TXTa.length)
  if ('111111111'.length % 2) {
    return TXTa.replaceAll('\n\n', '\n    ').slice(0, 2e4)
    return TXTa.replaceAll('\n', '\n\n').repeat(1)
  } else {
    return TXTb.slice(0, 300).replaceAll('\n', '    ')
  }
})()
const txt = (() => {
  // console.time('txt')
  const txt = (
    <div>
      {[...TXT2].map((e, i, arr) => {
        if (i < arr.length / 211) {
          return (
            <i key={i} data-e={e} data-i={i} className={i as unknown as string}>
              {e}
            </i>
          )
        }

        return (
          <i key={i} data-e={e} data-i={i} className={i as unknown as string}>
            {e}
          </i>
        )
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
          <i key={i} data-er={e} data-i={i} className={i as unknown as string}>
            {e}
          </i>
        )
      })}
    </div>
  )
  // console.timeEnd('txt')
  return txt
})()

const colors = ['red', 'blueviolet', 'gainsboro', 'magenta']
const items = ['M102', 'M103', '丁仪']

function App() {
  // console.time('app')

  // console.time('hook')
  const [select, setSelect] = useState('年4')
  const [q, qq] = useState('年4')
  const [s, ss] = useState('年4')
  const [selectArr, setSelectArr] = useState(items)

  const css = getCss(1 ? [select] : [select, ...selectArr])

  function next({ target, nativeEvent }: MouseEvent) {
    const selectionObj = getSelection()
    if (!selectionObj) return

    const selectionStr = selectionObj.toString()
    if (selectionStr) {
      setSelect(selectionStr)
      selectionObj.removeAllRanges()
      return
    }

    if (!(target instanceof HTMLElement)) return
    const itemIdx = searchSubStr(select).flatMap(n =>
      Array(select.length)
        .fill(0)
        .map((_, i) => n + i)
    )
    const currentIdx = itemIdx.indexOf(Number(target.dataset.i))
    if (currentIdx === -1) return

    const distance = select.length * (nativeEvent.metaKey ? -1 : 1)
    const targetDomIdx = itemIdx[currentIdx + distance]
    const targetDom = document.querySelector<HTMLElement>(
      `[data-i='${targetDomIdx}']`
    )
    if (!targetDom) return

    document.documentElement.scrollTop = targetDom.offsetTop - 440
  }
  // console.timeEnd('hook')

  // console.time('render')
  const render = (
    <>
      {css}
      <style>{s + '{color:red}'}</style>

      <div className='control'>
        <input
          type='text'
          value={select}
          onChange={e => setSelect(e.target.value)}
        />
        -- {TXT2.split(select).length - 1} --
        <input type='text' value={s} onChange={e => ss(e.target.value)} />
      </div>

      <div className='wrap' onClick={next}>
        <div>年</div>
        <div>年</div>
        <div>年</div>
        <div>年</div>
        <div>年轻人</div>
        <div>样赞叹这座二百五十年前的建筑物</div>
        {txt}
      </div>
    </>
  )
  // console.timeEnd('render')

  // console.timeEnd('app')
  return render
}

export default App

// 查找一个字符串中的所有子串的位置
function searchSubStr(subStr: string) {
  // if (subStr === '') return [] //
  const positions = []
  let pos = TXT2.indexOf(subStr)
  while (pos > -1) {
    positions.push(pos)
    pos = TXT2.indexOf(subStr, pos + subStr.length)
  }
  return positions
}

function getCssItem(select: string) {
  const len = select.length
  const count = TXT2.split(select).length - 1
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
function getCss(arr: string[]) {
  return arr.map((item, n) => (
    <style key={n}>
      {getCssItem(item) + `{cursor:se-resize; color:${colors[n] || 'black'}}`}
    </style>
  ))
  return arr.reduce((all, item, n) => {
    const result = getCssItem(item)
    if (!result) return all
    return all + result + `{color:${colors[n] || 'black'}}\n`
  }, '')
}
