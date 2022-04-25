import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// import { render } from 'react-dom'
// render(<App />, document.getElementById('root'))

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)

// console.log(screen.width, screen.availWidth)
// console.log(outerWidth, innerWidth)
// console.log(
//     document.documentElement.offsetWidth,
//     document.documentElement.clientWidth,
//     document.documentElement.scrollWidth
// )
// console.log(
//     document.body.offsetWidth,
//     document.body.clientWidth,
//     document.body.scrollWidth
// )

// [...$$('*')].map(e=>[e.clientWidth, e.offsetWidth, e.scrollWidth, e]).sort((q,w)=>w[2]-q[2]).slice(0,10)
// console.log($0.clientWidth, $0.offsetWidth, $0.scrollWidth)

// const xx = txtForSearch
//     .replaceAll('\n', '')
//     .replaceAll('　', '')
//     .replaceAll('。', '')
//     .replaceAll('，', '')
// const xxx = Object.entries(
//     [...xx].reduce((all: any, _, i) => {
//         const NOW = xx.slice(i, i + 2)
//         if (!all[NOW]) all[NOW] = 0
//         all[NOW]++
//         return all
//     }, {})
// )
//     .sort((q, w) => {
//         return w[1] - q[1]
//     })
//     .slice(0, 3000)
// console.log(xxx)

/* // const [R, setR] = useState(txt)
// useEffect(() => {
//   setTimeout(() => {
//     setR((r) => r.flatMap((e) => setColor(e, '想要翻身')))
//     setTimeout(() => {
//       setR((r) => r.flatMap((e) => setColor(e, '，')))
//       setTimeout(() => {
//         setR((r) => r.flatMap((e) => setColor(e, '？')))
//         setTimeout(() => {
//           setR((r) => r.flatMap((e) => setColor(e, '的')))
//           setTimeout(() => {
//             setR((r) => r.flatMap((e) => setColor(e, '试试')))
//           }, 100)
//         }, 100)
//       }, 100)
//     }, 100)
//   }, 100)
// }, []) */
