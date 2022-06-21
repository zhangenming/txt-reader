import React, {
    memo,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { callWithTime, callWithTime2, useEffectWrap } from './utils'

// import { render } from 'react-dom'
// render(<App />, document.getElementById('root'))

setTimeout(() => {
    const xx = !1 ? <TEST3 /> : <App />
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <App />
        //  <React.StrictMode>{xx}</React.StrictMode>
    )
})

function Aspps() {
    const inputRef = React.useRef<HTMLInputElement>(null)

    function handleClick() {
        // 按钮点击时，命令式的调用dom.focus方法
        inputRef.current.focus()
    }

    return (
        <div className='App'>
            <input ref={inputRef} placeholder='我是输入框' />
            <button onClick={handleClick}>开始输入</button>
        </div>
    )
}
const App22 = () => {
    const h1Ref = useRef<HTMLHeadingElement>(null)

    console.log(h1Ref) // { current: null }

    useEffect(() => {
        console.log(h1Ref) // { current: <h1_object> }
    })

    return <h1 ref={h1Ref}>App</h1>
}

const App4 = () => {
    const [X, setX] = useX(
        () => Number(localStorage.getItem('search') || '0'),
        () => {
            console.log(X)
            localStorage.setItem('search', X)
        }
    )
    return <button onClick={() => setX(X + 1)}>{X}</button>
}

function useX(v, f) {
    const [X, setX] = React.useState(v)

    React.useEffect(f, [X])

    return [X, setX] as const
}
function TEST3() {
    const [x, xSET] = useState(1)

    const r = useRef(33)
    console.log(r)

    return <div onClick={() => xSET(x + 1)}>xxxxx {x}</div>
}

const A = callWithTime2('A', ({ children }) => {
    console.log('A')

    useEffectWrap()
    return <div>A{children}</div>
})
const B = callWithTime2('B', () => {
    console.log('B')

    useEffectWrap()
    return <div>B</div>
})

const C = callWithTime2('C', props => {
    console.log('C')
    useEffectWrap()
    return <div>C</div>
})

const b = <B />
const c = <C />
const Ab = <A>{b}</A>
const Ac = <A>{c}</A>

function TEST2() {
    return (
        <>
            <CdTimerComp2 />
            <CdTimerComp3 />
        </>
    )
    return (
        <>
            <B /> <C />
        </>
    )
}

window.x = 1
const TEST = () => {
    const [a, setA] = useState(0)
    console.time('TEST-' + a)
    const [open, openSET] = useState(true)

    useEffectWrap(() => {
        if (a < 1000 / x) {
            setA(a + 1)
        } else {
            console.log(Math.floor(window.x / 10000))
        }
        // sleepSync(4)
    })
    const x = 111
    // sleepSync(x)
    const rt = (
        <div>
            <button onClick={() => openSET(!open)}>butn{a}</button>
            <button onClick={() => setA(a + 1)}>butn{a}</button>
        </div>
    )

    console.timeEnd('TEST-' + a)
    return rt
}

const p = performance.now.bind(performance)
function sleepSync(t: number) {
    console.time()
    const old = p()
    while (old - p() > -t) {
        window.x += 1
    }
    console.timeEnd()
}
function sleepSync2() {
    console.time()
    let i = 0
    while (i++ < 1e6) {
        d()
    }
    console.timeEnd()
}
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

// Object.entries(
//     [...TXT].reduce((acc, cur, i) => {
//         const key = TXT.slice(i, i + 5)

//         if (
//             [...key].some(k =>
//                 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(k.toLocaleUpperCase())
//             )
//         )
//             return acc

//         if (!acc[key]) acc[key] = 1
//         acc[key]++
//         return acc
//     }, {})
// ).sort((q, w) => w[1] - q[1])

const CdTimerComp = () => {
    // The following code is to fetch the current play from the URL

    const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000
    const NOW_IN_MS = new Date().getTime()

    const dateTimeAfterThreeDays = NOW_IN_MS + THREE_DAYS_IN_MS
    const [targetDate, setTargetDate] = useState(
        new Date(dateTimeAfterThreeDays)
    )

    const handleChange = event => {
        console.log(new Date(event.target.value))

        event.preventDefault()
        if (event.target.value) {
            setTargetDate(new Date(event.target.value))
        } else {
            setTargetDate(new Date(dateTimeAfterThreeDays))
        }
    }

    const [days, hours, minutes, seconds] = useCountDown(targetDate)

    return (
        <>
            <div className='play-details'>
                <div className='play-details-body'>
                    <div className='countdown-container'>
                        <form>
                            <label htmlFor='countdown-date-time'>
                                Select a Date and Time:
                            </label>
                            <input
                                type='datetime-local'
                                id='countdown-date-time'
                                name='countdown-date-time'
                                onChange={handleChange}
                            />
                        </form>
                        <p>
                            Select a date and time in the past, present, and
                            future to see how the countdown timer will display.
                        </p>

                        <ShowCounter
                            days={days}
                            hours={hours}
                            minutes={minutes}
                            seconds={seconds}
                        />
                    </div>
                </div>
            </div>
        </>
    )

    function ExpiredNotice() {
        return (
            <div className='expired-notice'>
                <span>Expired!!!</span>
                <p>Please select a future date and time.</p>
            </div>
        )
    }

    function useCountDown(targetDate) {
        const countDownDate = new Date(targetDate).getTime()

        const [countDown, setCountDown] = useState(
            countDownDate - new Date().getTime()
        )

        useEffect(() => {
            const interval = setInterval(() => {
                setCountDown(countDownDate - new Date().getTime())
            }, 1000)

            return () => clearInterval(interval)
        }, [countDownDate])

        return getReturnValues(countDown)

        function getReturnValues(countDown) {
            // calculate time left
            const days = Math.floor(countDown / (1000 * 60 * 60 * 24))
            const hours = Math.floor(
                (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            )
            const minutes = Math.floor(
                (countDown % (1000 * 60 * 60)) / (1000 * 60)
            )
            const seconds = Math.floor((countDown % (1000 * 60)) / 1000)

            return [days, hours, minutes, seconds]
        }
    }

    function ShowCounter({ days, hours, minutes, seconds }) {
        return (
            <div className='show-counter'>
                <a
                    href='https://tapasadhikary.com'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='countdown-link'
                >
                    <DateTimeDisplay
                        value={days}
                        type={'Days'}
                        isDanger={days <= 3}
                    />
                    <p>:</p>
                    <DateTimeDisplay
                        value={hours}
                        type={'Hours'}
                        isDanger={false}
                    />
                    <p>:</p>
                    <DateTimeDisplay
                        value={minutes}
                        type={'Mins'}
                        isDanger={false}
                    />
                    <p>:</p>
                    <DateTimeDisplay
                        value={seconds}
                        type={'Seconds'}
                        isDanger={false}
                    />
                </a>
            </div>
        )

        function DateTimeDisplay({ value, type, isDanger }) {
            return (
                <div className={isDanger ? 'countdown danger' : 'countdown'}>
                    <p>{value}</p>
                    <span>{type}</span>
                </div>
            )
        }
    }
}

const CdTimerComp2 = () => {
    const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000
    const NOW_IN_MS = new Date().getTime()
    const THREEDAY = NOW_IN_MS + THREE_DAYS_IN_MS

    const targetDate = new Date(THREEDAY)

    return (
        <>
            <div className='play-details'>
                <div className='play-details-body'>
                    <div className='countdown-container'>
                        <CountDownTimer targetDate={targetDate} />
                    </div>
                </div>
            </div>
        </>
    )
}
function CountDownTimer({ targetDate }) {
    const [days, hours, minutes, seconds] = useCountDown(targetDate)
    return (
        <ShowCounter
            days={days}
            hours={hours}
            minutes={minutes}
            seconds={seconds}
        />
    )
}
const CdTimerComp3 = () => {
    // The following code is to fetch the current play from the URL

    const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000
    const NOW_IN_MS = new Date().getTime()
    const THREEDAY = NOW_IN_MS + THREE_DAYS_IN_MS

    const targetDate = new Date(THREEDAY)

    //
    const [days, hours, minutes, seconds] = useCountDown(targetDate)

    return (
        <>
            <div className='play-details'>
                <div className='play-details-body'>
                    <div className='countdown-container'>
                        <ShowCounter
                            days={days}
                            hours={hours}
                            minutes={minutes}
                            seconds={seconds}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

function ShowCounter({ days, hours, minutes, seconds }) {
    return (
        <div className='show-counter'>
            <a
                href='https://tapasadhikary.com'
                target='_blank'
                rel='noopener noreferrer'
                className='countdown-link'
            >
                <DateTimeDisplay
                    value={days}
                    type={'Days'}
                    isDanger={days <= 3}
                />
                <p>:</p>
                <DateTimeDisplay
                    value={hours}
                    type={'Hours'}
                    isDanger={false}
                />
                <p>:</p>
                <DateTimeDisplay
                    value={minutes}
                    type={'Mins'}
                    isDanger={false}
                />
                <p>:</p>
                <DateTimeDisplay
                    value={seconds}
                    type={'Seconds'}
                    isDanger={false}
                />
            </a>
        </div>
    )

    function DateTimeDisplay({ value, type, isDanger }) {
        return (
            <div className={isDanger ? 'countdown danger' : 'countdown'}>
                <p>{value}</p>
                <span>{type}</span>
            </div>
        )
    }
}
function useCountDown(targetDate) {
    const countDownDate = new Date(targetDate).getTime()

    const [countDown, setCountDown] = useState(
        countDownDate - new Date().getTime()
    )

    useEffect(() => {
        const interval = setInterval(() => {
            setCountDown(countDownDate - new Date().getTime())
        }, 1000)

        return () => clearInterval(interval)
    }, [countDownDate])

    return getReturnValues(countDown)

    function getReturnValues(countDown) {
        // calculate time left
        const days = Math.floor(countDown / (1000 * 60 * 60 * 24))
        const hours = Math.floor(
            (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        )
        const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((countDown % (1000 * 60)) / 1000)

        return [days, hours, minutes, seconds]
    }
}
