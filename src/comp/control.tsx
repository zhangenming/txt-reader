import { SIZE } from '../App'
import { floor, getColor, getWordCount, i2rc } from '../utils'
export type item = {
    key: string
    color: string
    i: number
    count: number
    isPined: boolean
}

export default function Control({
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
    SET_currentLine,
    domC,
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
}) {
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
            <button
                onClick={() => {
                    const lineIdxScrollChange = floor(
                        (domC.current as HTMLElement).scrollTop / SIZE
                    )

                    console.log(domC, lineIdxScrollChange)
                    setTimeout(() => {
                        SET_currentLine(lineIdxScrollChange)
                    }, 1111)
                }}
            >
                updata
            </button>

            <div>{currentLine}</div>
            <div>
                {widthCount}-{heightCount}
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
}
