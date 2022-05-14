import { getColor, i2rc } from '../utils'
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
    selectArrSET,
    selectWrap,
    gridRef,
    TXT,
    lineSize,
    deleteHandle,
    currentLine,
    TXTkey,
    jump,
    heightLineCount,
}: {
    select: string
    selectSET: React.Dispatch<React.SetStateAction<string>>
    selectArr: item[]
    selectArrSET: React.Dispatch<React.SetStateAction<item[]>>
    selectWrap: item
    gridRef: any
    TXT: string
    lineSize: number
    deleteHandle(key: string): void
    currentLine: number
    TXTkey: number
    jump: (target: number) => void
    heightLineCount: number
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
                    children={selectWrap.count}
                    onClick={() => {
                        const i = TXT.indexOf(selectWrap.key)
                        gridRef.current.scrollToItem({
                            align: 'center',
                            rowIndex: i2rc(i, lineSize).r,
                        })
                    }}
                />
            </div>
            <input
                type='text'
                value={select}
                onChange={e => {
                    selectSET(e.target.value)
                }}
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
                                    selectArrSET(
                                        [
                                            ...selectArr.filter(e => e.i !== i),
                                            {
                                                ...item,
                                                isPined: !isPined,
                                            },
                                        ].sort((l, r) =>
                                            r.count != l.count
                                                ? r.count - l.count
                                                : r.i - l.i
                                        )
                                    )
                                }}
                            />
                            <span
                                className='key'
                                children={key}
                                onClick={() => {
                                    // react 会不会每个span都新建了一个函数事件
                                    selectArrSET(
                                        [
                                            ...selectArr.filter(e => e.i !== i),
                                            {
                                                ...item,
                                                color: getColor(),
                                            },
                                        ].sort((l, r) =>
                                            r.count != l.count
                                                ? r.count - l.count
                                                : r.i - l.i
                                        )
                                    )
                                }}
                            />
                            <span
                                className='count'
                                children={count}
                                onClick={() => {
                                    jump(
                                        i2rc(TXT.indexOf(key), lineSize).r -
                                            heightLineCount / 2
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
