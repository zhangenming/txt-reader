import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)

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
