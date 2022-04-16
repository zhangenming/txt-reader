import { useState, MouseEvent } from 'react'
import './App.css'
import TXTa from '../txt/2'
import TXTb from '../txt/诡秘之主.js'
import TXTc from '../txt/jy/sd'
const flag = '111'.length % 2
const txt = (() => {
  if (flag) {
    return TXTc.replaceAll('\n', '\n\n').slice(0, 111)
  } else {
    return TXTb.slice(0, 1e6).replaceAll('\n', '    ')
  }
})()
const txtForSearch = (() => {
  if (flag) {
    console.log(TXTc.length)
    return TXTc
  } else {
    console.log(TXTb.length)
    return TXTb
  }
})()

const txtDom = (() => {
  // console.time('txtDom')
  let isSpeaking: boolean
  const txtDom = [...txt].map((e, i, arr) => {
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
        <i key={i} data-el={e} data-i={i} className={i as unknown as string}>
          {e}
        </i>
      )
    }
    return (
      <i key={i} data-er={e} data-i={i} className={i as unknown as string}>
        {e}
      </i>
    )
  })
  // console.timeEnd('txtDom')
  return txtDom
})()

const colors = ['red', 'blueviolet', 'gainsboro', 'magenta']
const items = ['M102', 'M103', '丁仪']

export default function App() {
  // console.time('app')

  // console.time('hook')
  const [select, setSelect] = useState('年4')
  const [q, qq] = useState('年4')
  const [s, ss] = useState('年4')
  const [selectArr, setSelectArr] = useState(items)

  const css = getCss(1 ? [select] : [select, ...selectArr])
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
        -- {txtForSearch.split(select).length - 1} --
        <input type='text' value={s} onChange={e => ss(e.target.value)} />
      </div>

      <div className='wrap'>
        <div>样赞叹这座二百五十年前的建筑物</div>
        <div>样赞叹这座二百五十年前的建筑物</div>
        <div
          onClick={e => nextDom(e, setSelect, select)}
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
}
function nextDom(
  { target, nativeEvent }: React.MouseEvent,
  setSelect: React.Dispatch<React.SetStateAction<string>>,
  select: string
) {
  const selectionObj = getSelection()
  if (!selectionObj) return

  const selectionStr = selectionObj.toString()
  if (selectionStr) {
    setSelect(selectionStr)
    // selectionObj.removeAllRanges()
    return
  }

  if (!(target instanceof HTMLElement)) return

  const wordAllPosition = getWordAllPosition(select)

  const clickIdx = wordAllPosition.indexOf(Number(target.dataset.i))
  if (clickIdx === -1) return

  let nextIdx = clickIdx + select.length * (nativeEvent.metaKey ? -1 : 1)
  if (nextIdx > wordAllPosition.length - 1) {
    //处理从数组尾到头
    nextIdx = nextIdx - wordAllPosition.length
  }
  const targetDomIdx = wordAllPosition.at(nextIdx) //处理头到尾
  const targetDom = document.querySelector<HTMLElement>(
    `[data-i='${targetDomIdx}']`
  )
  if (!targetDom) return

  document.documentElement.scrollTop = targetDom.offsetTop - 440
}

// 查找一个字符串中的所有子串的位置
function getWordPosition(word: string) {
  const positions = []
  let pos = txt.indexOf(word)
  while (pos > -1) {
    positions.push(pos)
    pos = txt.indexOf(word, pos + word.length)
  }
  return positions
}
function getWordAllPosition(word: string) {
  return getWordPosition(word).flatMap(n =>
    Array(word.length)
      .fill(0)
      .map((_, i) => n + i)
  )
}

function getCssSelectorL(select: string) {
  const len = select.length
  const count = txt.split(select).length - 1
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
function getCssStyleR(word: string, idx: number) {
  const css1 =
    txtForSearch.split(word).length - 1 === 1
      ? 'text-decoration: line-through red'
      : 'cursor:se-resize'
  const css2 = `color:${colors[idx] || 'black'}`

  return (
    '{' +
    [css1, css2].reduce((all, now) => {
      return `${all} ${now};\n`
    }, '\n') +
    '}'
  )
}
function getCss(arr: string[]) {
  return arr.map((word, idx) => {
    return (
      <style key={idx}>{getCssSelectorL(word) + getCssStyleR(word, idx)}</style>
    )
  })
  return arr.reduce((all, item, n) => {
    const result = getCssSelectorL(item)
    if (!result) return all
    return all + result + `{color:${colors[n] || 'black'}}\n`
  }, '')
}
