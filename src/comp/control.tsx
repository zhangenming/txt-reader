import { forwardRef } from 'react'
import { featureFlag } from '../App'
import { useStatePaire } from '../hookUtils'
import { scrollToNext } from '../reader'
import { config } from '../utils'
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
        selectArr,
        changeHandle,
        widthCount,
        heightCount,
        currentLine,
        setUpdata,
        overscan,
        feature,
        setFeature,
        RENDER,
        scrollTop,
        stopControl,
        SET_stopControl,
        stopScroll,
        pined,
        L,
        R,
    }: {
        selectArr: item[]
        deleteHandle(key: string): void
        changeHandle(item: item): void
        TXT: string
        widthCount: number
        heightCount: number
        currentLine: number
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
            <div>{(config.txt.length / 10000).toFixed(2)}万</div>
            <br />
            {/* <div>
                <div>scrollTop:</div>
                <span>{scrollTop}</span>
            </div> */}
            <div>
                <div>currentLine:</div>
                <span>
                    {currentLine}(
                    {((currentLine / config.LINE.length) * 100).toFixed(2)}
                    %)
                </span>
            </div>
            <span>L{L}</span>
            <span>BLOCK{config.line2Block[L]}</span>
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
            {/*
            
            
            
            */}
            <br />
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
                {selectArr.map(item => {
                    const { key, count, isOneScreen } = item
                    // if (count === 1 || isOneScreen) return
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
                                onClick={() => {
                                    scrollToNext(currentLine + 2, key)
                                }}
                                title={key}
                            />
                            <span
                                className='count'
                                children={count}
                                onClick={() => {
                                    // react 会不会每个span都新建了一个函数事件
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
