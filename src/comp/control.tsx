import { getColor, i2rc } from '../utils'
export type item = {
    key: string
    color: string
    i: number
    count: number
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
}) {
    return (
        <div className='control'>
            <div>{currentLine}</div>
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
                {selectArr.map(({ i, key, count }, idx) => (
                    <div className='selectItem' key={key} slot={key}>
                        <span
                            children={idx}
                            onClick={() => deleteHandle(key)}
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
                                            i,
                                            key,
                                            count,
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
                                const i = TXT.indexOf(key)
                                gridRef.current.scrollToItem({
                                    align: 'center',
                                    rowIndex: i2rc(i, lineSize).r,
                                })
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
