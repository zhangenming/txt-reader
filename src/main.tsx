import './App.css'
import { runWithTime } from './debug'

import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { render } from 'react-dom'

// import whyDidYouRender from '@welldone-software/why-did-you-render'
// const { default: whyDidYouRender } = await import(
//     '@welldone-software/why-did-you-render'
// )

// whyDidYouRender(React, {
//     // logOnDifferentValues: true,
//     trackAllPureComponents: true,
//     // trackHooks: true,
// })

import APP from './App'
import { callWithTime, callWithTime2, useEffectWrap } from './utils'
setTimeout(() => {
    const dom = !0 ? (
        <>
            <APP />
        </>
    ) : (
        <App5 />
    )

    if (!0) {
        ReactDOM.createRoot(document.getElementById('root')!).render(dom)
    } else {
        render(dom, document.getElementById('root')!)
    }
})
function App5() {
    return (
        <>
            2222
            <C />
        </>
    )
    function C() {
        console.log(111)
        useMemo(() => {
            // debugger
            console.log(222)
            aaaa // 故意写错一个不存在的变量
            console.log(333)
        }, [])
        console.log(444)
        return 'c'
    }
}
function App52() {
    return (
        <>
            2222
            <C />
        </>
    )
    function C() {
        console.log(111)
        useEffect(() => {
            console.log(222)
            aaaa // 故意写错一个不存在的变量
            console.log(333)
        }, []) //useEffect报错 也没用DOM输出
        console.log(444)
        return 'c'
    }
}
function App51() {
    let x
    try {
        x = <C /> //这里只是语法糖 并没有执行
    } catch {}

    return <>222{x}</> // 这里才相当于C()!!!!!!!!!!!
    function C() {
        console.log(111)
        useMemo(() => {
            // debugger
            console.log(222)
            aaaa // 故意写错一个不存在的变量
            console.log(333)
        }, [])
        console.log(444)
        return 'c'
    }
}
const useUpdate = (fn, dep) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!count) return
        setCount(x => x + 1) // 删掉这行就不会两次执行
    }, [dep])

    useEffect(() => {
        if (count > 1) {
            fn()
        }
    }, [count])
}

const App2 = () => {
    const [n, setN] = useState(0)
    const add = () => {
        setN(n + 1)
    }

    console.log('app')

    useUpdate(() => console.log('n changed'), n)
    return (
        <div>
            {n}
            <button onClick={add}>+1</button>
        </div>
    )
}
let t = performance.now()
let x = 0
function time() {
    window.w = (performance.now() - t) / x++

    setTimeout(() => {
        time()
    }, 0)
}
function Time() {
    window.w = (performance.now() - t) / x++

    const [count, setCount] = useState(0)
    setTimeout(() => {
        setCount(count + 1)
    }, 0) // 0.1 ????
    return
}

function Aa() {
    const d = <D />
    // const d =
    //     /* @__PURE__ */
    //     _jsxDEV(
    //         D,
    //         {},
    //         void 0,
    //         false,
    //         {
    //             fileName: _jsxFileName,
    //             lineNumber: 53,
    //             columnNumber: 15,
    //         },
    //         this
    //     )

    // const d =  {
    //     $$typeof: Symbol(react.element)
    //     key: null
    //     props: {
    //     }
    //     ref: null
    //     type: D
    // }
    console.log(d, (<D />).type === D, D())
    debugger

    return (
        <>
            <B>
                <C />
                <D />
            </B>
            <D />
        </>
    )
    function B({ children }) {
        console.log('B')
        useEffect(() => {
            console.log('effect B')
        })
        return <>{children}</>
    }

    function C() {
        console.log('C')
        useEffect(() => {
            console.log('effect C')
        })
        return <></>
    }
    function D() {
        console.log('D')
        useEffect(() => {
            console.log('effect D')
        })
        return <></>
    }
}

function App() {
    // const q = <LargeList n={3} />
    // const w = <LargeList n={3} />
    // const e = <LargeList n={3} />
    // const q = LargeList({ n: 3 })
    // const w = LargeList({ n: 3 })
    // const e = LargeList({ n: 3 })
    const r = (
        <>
            {/* <L n={3} result={q} />
        <L n={4} result={w} />
        <L n={5} result={e} /> */}
            <L n={3} result={<LargeList n={3} />} />
            <L n={4} result={<LargeList n={4} />} />
            <L n={5} result={<LargeList n={5} />} />
            {/* <L result={<LargeList n={5} />} />
            <R result={<LargeList n={5} />} /> */}
        </>
    )
    return r
    function LargeList({ n }) {
        console.log(2)

        return (
            <div style={{ display: 'none' }}>
                {[...Array(10 ** n)].map((_, i) => (
                    <li>{i}</li>
                ))}
            </div>
        )
    }
    function L({ n, result }) {
        console.log(1)

        console.time(n)
        useEffect(() => {
            console.timeEnd(n)
        })
        const [count, setCount] = useState(0)
        return (
            <>
                <button onClick={() => setCount(count + 1)}>
                    increase{count}
                </button>

                <div style={{ display: 'none' }}>{result}</div>
            </>
        )
    }
}
const Component = ({ onClick }) => {
    console.log('heavy component!')
    return <button onClick={onClick}>x</button>
}
const PureComponent = React.memo(({ onClick }) => {
    console.log('pure heavy component!')
    return <button onClick={onClick}>x</button>
})

const xx = <Component />
const Parent = () => {
    const [count, setCount] = React.useState(0)

    const r = useRef()
    r.current = count
    const dom = (
        <Component onClick={() => console.log(`hi #${r.current}-${count}!`)} />
    )
    let X
    X = dom
    X = React.useMemo(() => dom, [])
    // X = () => React.useMemo(() => dom, [])
    // X = React.useMemo(() => () => dom, [])
    // X = React.useCallback(() => dom, [])
    // X = React.useCallback(dom, [])

    return (
        <>
            {xx}
            <button onClick={() => setCount(count + 1)}>
                increase counter{count}
            </button>
        </>
    )
    return useMemo(
        () => (
            <>
                {X}
                <button onClick={() => setCount(count + 1)}>
                    increase counter{count}
                </button>
            </>
        ),
        [count]
    )
}
const Parent2 = () => {
    const [count, setCount] = React.useState(0)
    const r = useRef()
    r.current = count
    const handleClick = React.useCallback(
        () => console.log(`hi #${r.current}!`),
        []
    )

    return (
        <>
            <PureComponent onClick={handleClick} />
            <button onClick={() => setCount(count + 1)}>
                increase counter{count}
            </button>
        </>
    )
}
function T9() {}
function T8() {
    const Comp = () => {
        return <input type='text' readOnly value={Math.random()} />
    }
    const [count, setCount] = useState(0)
    return (
        <>
            <button onClick={() => setCount(e => e + 1)}>btn{count}</button>
            {/* 方式一,  dom diff结果是更新 整个组件 */}
            <Comp />
            {/* 方式二,  dom diff结果是只更新 变化了的属性 */}
            {Comp()}
        </>
    )
}

function T83() {
    const X2 = <input type='text' readOnly value={3} />
    const X22 = () => <input type='text' readOnly value={3} />
    // const X222 = () => X22()
    const X3 = useMemo(() => <input type='text' readOnly value={3} />, [])
    const X33 = () =>
        useMemo(() => <input type='text' readOnly value={3} />, [])
    const [count, setCount] = useState(0)
    return (
        <>
            <button onClick={() => setCount(e => e + 1)}>btn{count}</button>

            <input type='text' readOnly value={3} />

            {/* {X1}
            <X11 /> */}

            {X2}
            <X22 />
            {X22()}

            {/* {X3}
            <X33 /> */}

            {/* {useMemo(() => {
                console.log(3)
                return <X />
            }, [count])}
            {useMemo(() => {
                console.log(4)
                return X()
            }, [count])} */}
        </>
    )
}

function JOKER(props) {
    console.log('xx')

    return 1
    const [count, setCount] = useState(props.count)
    useEffect(() => {
        console.log("I am JOKER's useEffect--->", props.count)
        setCount(props.count)
    }, [props.count])

    console.log("I am JOKER's  render-->", props.count, count)
    return (
        <div>
            <p style={{ color: 'red' }}>JOKER: You clicked {count} times</p>
        </div>
    )
}

const MMJ = memo(JOKER)
function DC() {
    const [count, setCount] = useState(0)
    const A = useMemo(() => <JOKER count={count} />, [count])

    return (
        <div>
            <button
                onClick={() => {
                    setCount(count + 1)
                }}
            >
                Click me{count}
            </button>
            <JOKER count={count} x={{ d: 233 }} />
        </div>
    )
}
function Test7() {
    const [x, setX] = useState(0)
    const [y, setY] = useState(0)

    // useEffect(function R() {
    //     requestAnimationFrame(() => {
    //         setX(e => e + 1)
    //         R()
    //     })
    // }, [])
    useEffect(function R() {
        setInterval(() => {
            runWithTime(() => setX(e => e + 1), 1)
        }, 8)
    }, [])
    useEffect(function R() {
        setInterval(() => {
            runWithTime(() => setY(e => e + 1), 2)
        }, 32)
    }, [])
    return `${x}-${y}-${x / y}`
}

function Test6() {
    const dom = useRef()
    // const dom = useRef<HTMLDivElement>(null)
    const [x, setX] = useState(0)

    useEffect(() => {
        console.log(1)
        setX(1)
    }, [])
    useEffect(() => {
        console.log(2)
        setX(2)
    }, [])
    useEffect(() => {
        console.log(3)
        setX(1)
    }, [])

    return <div ref={dom}>{x}</div>
}

function Test5() {
    const [state, setState] = useState()
    useEffect(() => {
        setState(1)
    }, [])

    console.log(11)
    return (
        <>
            <button onClick={() => setState(state + 1)}>btn{state}</button>
        </>
    )
}
function TEST4() {
    const [X1, setX1] = React.useState(1)
    const [X2, setX2] = React.useState(1)
    const [X3, setX3] = React.useState(1)
    const [X4, setX4] = React.useState(1)

    // useEffect(() => {
    //     setX2(x => x + 1)
    // }, [X1])
    // useEffect(() => {
    //     setX3(x => x + 1)
    // }, [X2])
    // useEffect(() => {
    //     setX4(x => x + 1)
    // }, [X3])

    return (
        <>
            <button
                onClick={() => {
                    console.time(1)
                    alert(X1)
                    setX1(X1 + 5)
                    alert(X1)
                    console.timeEnd(1)
                }}
            >
                +5
            </button>
            {X1}-{X2}-{X3}-{X4}
            <button onClick={() => setX1(x => x + 1)}>add</button>
            <button onClick={() => setX2(x => x + 1)}>add</button>
            <button onClick={() => setX3(x => x + 1)}>add</button>
        </>
    )
}
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
//usecontext传ref不会引起render
