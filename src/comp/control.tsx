import { forwardRef, lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { featureFlag, SIZE_H } from '../App'
import { getHoldKey } from '../hook'
import { useStatePaire } from '../hookUtils'
import { floor, getColor, getWordCount, getWordPosition, i2rc } from '../utils'
import Comp from './comp'
export type item = {
    key: string
    color: string
    i: number
    count: number
    isPined: boolean
    isOneScreen: boolean
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
        OVERSCAN_top,
        SET_OVERSCAN_top,
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
        pined,
        mouseHover,
        mouseHoverTargets,
    }: {
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
            实验切换{!feature + ''}
            <button
                onClick={() => {
                    featureFlag.line = !featureFlag.line
                    setFeature((f: boolean) => !f)
                }}
            >
                实验 toggle
            </button>
            {/*  */}
            <br />
            元素覆盖 TOP
            <input
                type='text'
                onInput={e =>
                    SET_OVERSCAN_top(Number((e.target as unknown as any).value))
                }
                value={OVERSCAN_top}
            />
            bottom
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
                {widthCount}-{heightCount}
            </div>
            <br />
            <div>{(txtLen / 10000).toFixed(2)}万</div>
            <div>{(TXTLen / 10000).toFixed(2)}万</div>
            <br />
            {/* <div>
                <div>scrollTop:</div>
                <span>{scrollTop}</span>
            </div> */}
            <div>
                <div>currentLine:</div>
                <span>
                    {currentLine}(
                    {((currentLine / (TXTLen / widthCount)) * 100).toFixed(2)}%)
                </span>
            </div>
            <br />
            {/* <div className='count'>
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
            /> */}
            <div>
                {selectArr.map((item, idx) => {
                    const { key, count, isOneScreen } = item
                    if (count === 1 || isOneScreen) return
                    return (
                        <div
                            className='selectItem'
                            key={key}
                            slot={key}
                            style={{
                                background: pined.get === key ? 'deeppink' : '',
                            }}
                        >
                            <span
                                className='key'
                                children={key}
                                onClick={() => handleJump(key)}
                                title={key}
                            />
                            <span
                                className='count'
                                children={count}
                                onClick={() => {
                                    // react 会不会每个span都新建了一个函数事件
                                    // changeHandle({
                                    //     ...item,
                                    //     color: getColor(),
                                    // })
                                    deleteHandle(item.key)
                                }}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )

    function handleJump(key: string) {
        const [firstLine, nextLine, nextLine2] = getNextLine(key)
        if (getHoldKey('ctrl')) {
            console.log(22, nextLine2)
            jumpLine(nextLine2)
            return
        }
        if (pined.get !== key) {
            pined.set(key)
            jumpLine(firstLine)
        } else {
            jumpLine(nextLine)
        }
    }

    function getNextLine(key: string) {
        const all = getWordPosition(key).map(i => i2rc(i).r)
        const firstLine = all[0]
        const nextLine =
            all.find(e => e > currentLine + heightCount) || firstLine // last->first

        const nextLine2 = all.find(e => e > currentLine) || firstLine // last->first

        return [firstLine - 2, nextLine - 2, nextLine2]
    }
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
