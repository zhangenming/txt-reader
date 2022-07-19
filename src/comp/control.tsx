import { forwardRef, lazy, Suspense, useEffect, useState } from 'react'
import { SIZE_H } from '../App'
import { useStatePaire } from '../hookUtils'
import { floor, getColor, getWordCount, i2rc } from '../utils'
import Comp from './comp'
export type item = {
    key: string
    color: string
    i: number
    count: number
    isPined: boolean
}

export default forwardRef(function Control(
    {
        select,
        SET_select,
        selectArr,
        deleteHandle,
        changeHandle,
        TXT,
        TXTLen,
        txtLen,
        widthCount,
        heightCount,
        currentLine,
        jumpLine,
        onKeyUp,
        onKeyDown,
        setUpdata,
        OVERSCAN_change,
        SET_OVERSCAN_change,
        OVERSCAN_bottom,
        SET_OVERSCAN_bottom,
        feature,
        setFeature,
        RENDER,
        scrollTop,
        isAotOver,
        stopControl,
        SET_stopControl,
        stopScroll,
    }: any & {
        select: string
        SET_select: React.Dispatch<React.SetStateAction<string>>
        selectArr: item[]
        deleteHandle(key: string): void
        changeHandle(item: item): void
        TXT: string
        TXTLen: number
        txtLen: number
        widthCount: number
        heightCount: number
        currentLine: number
        jumpLine: (target: number) => void
        onKeyUp: (e: React.KeyboardEvent<Element>) => void
        onKeyDown: (e: React.KeyboardEvent<Element>) => void
    },
    ref
) {
    // console.log('render Control')
    const ctrX = useStatePaire(0)

    return (
        <div
            {...{
                className: 'control',
                tabIndex: 1,
                onKeyUp,
                onKeyDown,
                // 两种方式空格连续按着时 原生不卡 自己实现卡
            }}
        >
            <span onClick={() => ctrX.set((v: any) => v + 1)}>
                <span key={ctrX.get}> ctrX:{ctrX.get}</span>
            </span>
            isAotOver:{String(isAotOver)}
            <button onClick={() => SET_stopControl((v: any) => !v)}>
                stopControl:{String(stopControl)}
            </button>
            <button onClick={() => stopScroll.set((v: any) => !v)}>
                stopScroll:{String(stopScroll.get)}
            </button>
            <span>APP:{RENDER.app}</span>
            <span>VG: {RENDER.VG}</span>
            <button
                onClick={() => {
                    setUpdata((e: number) => e + 1)
                }}
            >
                手动updata
            </button>
            {/*  */}
            <br />
            实验切换{feature + ''}
            <button onClick={() => setFeature((f: boolean) => !f)}>
                toggle
            </button>
            {/*  */}
            <br />
            动态刷新间隔
            <input
                type='text'
                onInput={e =>
                    SET_OVERSCAN_change((e.target as unknown as any).value)
                }
                value={OVERSCAN_change}
            />
            {/*  */}
            <br />
            静态元素覆盖
            <input
                type='text'
                onInput={e =>
                    SET_OVERSCAN_bottom(
                        Number((e.target as unknown as any).value)
                    )
                }
                value={OVERSCAN_bottom}
            />
            {/*  */}
            <br />
            <div>
                <div>scrollTop:</div>
                <span>{scrollTop}</span>
            </div>
            <div>
                <div>currentLine:</div>
                <span>{currentLine}</span>
            </div>
            <div>
                <div>size:</div>
                <span>
                    {widthCount}-{heightCount}
                </span>
            </div>
            <br />
            <div>{txtLen / 10000}</div>
            <div>{TXTLen / 10000}</div>
            <br />
            <div className='count'>
                <span
                    className='item'
                    children={getWordCount(select, TXT)}
                    onClick={() => {
                        jumpLine(i2rc(TXT.indexOf(select), widthCount).r)
                    }}
                />
            </div>
            <input
                type='text'
                value={select}
                onChange={e => SET_select(e.target.value)}
                onKeyDown={e => e.stopPropagation()}
            />
            <div>
                {selectArr.map((item, idx) => {
                    const { i, key, count, isPined } = item
                    return (
                        <div className='selectItem' key={key} slot={key}>
                            <span
                                children={idx}
                                onClick={() => {
                                    deleteHandle(item.key)
                                }}
                            />
                            <span
                                className='key'
                                children={key}
                                title={key}
                                onClick={() => {
                                    // react 会不会每个span都新建了一个函数事件
                                    changeHandle({
                                        ...item,
                                        color: getColor(),
                                    })
                                }}
                            />
                            <span
                                className='count'
                                children={count}
                                onClick={() => {
                                    // todo with alt
                                    jumpLine(
                                        i2rc(TXT.indexOf(key), widthCount).r
                                    )
                                }}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
})
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
