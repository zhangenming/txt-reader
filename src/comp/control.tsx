import React, { useState } from 'react'
import { config } from '../hook'
import { getHoldingKey, useStatePaire } from '../hookUtils'
import { hoverWords, scrollToNext } from '../reader'
import { getWord, querySelector } from '../utils'
export type item = {
    key: string
    color: string
    i: number
    count: number
    isPined: boolean
    isOneScreen: boolean
}
// console.log('control')

export default function Control({
    selectArr,
    changeHandle,
    widthCount,
    heightCount,
    currentLine,
    setUpdata,
    overscan,
    RENDER,
    scrollTop,
    stopControl,
    SET_stopControl,
    stopScroll,
    pined,
    blockL,
    deleteHandle,
    hoverWord,
    SET_hoverWord,
}: {
    selectArr: item[]
    deleteHandle(key: string): void
    changeHandle(item: item): void
    widthCount: number
    heightCount: number
    currentLine: number
}) {
    // console.log('render Control')
    const ctrX = useStatePaire(0)

    return (
        <>
            <div>
                <div>scrollTop:</div>
                <span>{scrollTop}</span>
            </div>
            {(() => {
                const [state, SET_state] = useState(111111)
                return (
                    <>
                        <input
                            value={state}
                            onChange={e => SET_state(Number(e.target.value))}
                        />
                        <button
                            onClick={() =>
                                (querySelector('.reader').scrollTop -=
                                    Number(state))
                            }
                        >
                            up
                        </button>
                        <button
                            onClick={() =>
                                (querySelector('.reader').scrollTop +=
                                    Number(state))
                            }
                        >
                            down
                        </button>
                        <button
                            onClick={() =>
                                (querySelector('.reader').scrollTop = 0)
                            }
                        >
                            0
                        </button>
                        <button
                            onClick={() =>
                                (querySelector('.reader').scrollTop +=
                                    config.LINE.length * 25)
                            }
                        >
                            99
                        </button>
                    </>
                )
            })()}
            <div>
                <div>Line:</div>
                <span>
                    {currentLine}(
                    {((currentLine / config.LINE.length) * 100).toFixed(2)}
                    %)
                </span>
            </div>
            <span>BLCOK: {blockL}</span>
            {/* <span>R{R}</span> */}
            <span onClick={() => ctrX.set((v: any) => v + 1)}>
                <span key={ctrX.get}> ctrX:{ctrX.get}</span>
            </span>
            {/* isAotOver:{String(config.AOT.length === config.JIT.length)} */}
            <button onClick={() => SET_stopControl((v: any) => !v)}>
                stopControl:{String(stopControl)}
            </button>
            <button onClick={() => stopScroll.set((v: any) => !v)}>
                stopScroll:{String(stopScroll.get)}
            </button>
            {/* <span>APP:{RENDER.app}</span>
            <span>VG: {RENDER.VG}</span> */}
            <button
                onClick={() => {
                    setUpdata((e: number) => e + 1)
                }}
            >
                手动updata
            </button>
            {/*  */}
            <br />
            <div>{(config.txt.length / 10000).toFixed(2)}万</div>
            <br />
            {/*  */}
            <br />
            元素覆盖 TOP
            <input
                type='text'
                onInput={e =>
                    overscan.set(o => ({
                        ...o,
                        top: Number((e.target as any).value),
                    }))
                }
                value={overscan.get.top}
            />
            bottom
            <input
                type='text'
                onInput={e =>
                    overscan.set(o => ({
                        ...o,
                        bot: Number((e.target as any).value),
                    }))
                }
                value={overscan.get.bot}
            />
            {/*  */}
            <br />
            <div>
                宽: {widthCount}- 高:{heightCount}
            </div>
            <div>
                {selectArr.map(item => {
                    const { key, count, isOneScreen } = item
                    if (count === 1 || isOneScreen) return
                    return (
                        <div
                            className='selectItem'
                            key={key}
                            title={key}
                            style={{
                                background: pined.get === key ? 'deeppink' : '',
                            }}
                            onMouseEnter={() => SET_hoverWord(key)}
                        >
                            <span
                                className='key'
                                children={key}
                                onClick={() => {
                                    changeHandle({
                                        ...item,
                                        isPined: true,
                                    })
                                    scrollToNext(currentLine + 2, key)
                                }}
                            />
                            <span
                                className={item.isPined ? 'isPined' : ''}
                                children={count}
                                onClick={() => {
                                    // react 会不会每个span都新建了一个函数事件
                                    if (getHoldingKey().Backspace) {
                                        return deleteHandle(item.key)
                                    }
                                    changeHandle({
                                        ...item,
                                        isPined: !item.isPined,
                                    })

                                    // deleteHandle(item.key)
                                }}
                            />
                        </div>
                    )
                })}
            </div>
        </>
    )
}

// const Lazy = lazy(() => {
//     return new Promise(resolve => {
//         setTimeout(() => {
//             resolve({
//                 default: props => <Control {...props} />,
//             })
//         })
//     })
// })
// props => (
//     <Suspense fallback={<div>loading...</div>}>
//         <Lazy {...props} />
//     </Suspense>
// )
