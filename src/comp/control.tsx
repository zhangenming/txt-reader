import { getColor, getWordCount, i2rc } from '../utils'
export type item = {
    key: string
    color: string
    i: number
    count: number
    isPined: boolean
}

export default function Control({
    select,
    selectSET,
    selectArr,
    deleteHandle,
    changeHandle,
    TXT,
    lineSize,
    currentLine,
    TXTkey,
    jump,
}: {
    select: string
    selectSET: React.Dispatch<React.SetStateAction<string>>
    selectArr: item[]
    deleteHandle(key: string): void
    changeHandle(item: item): void
    TXT: string
    lineSize: number
    currentLine: number
    TXTkey: number
    jump: (target: number) => void
}) {
    return (
        <div className='control'>
            <div>
                {lineSize}-{currentLine}
            </div>
            <div>{TXTkey}</div>

            <br />
            <div className='count'>
                <span
                    className='item'
                    children={getWordCount(select, TXT)}
                    onClick={() => {
                        jump(i2rc(TXT.indexOf(select), lineSize).r)
                    }}
                />
            </div>
            <input
                type='text'
                value={select}
                onChange={e => selectSET(e.target.value)}
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
                                    jump(i2rc(TXT.indexOf(key), lineSize).r)
                                }}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
