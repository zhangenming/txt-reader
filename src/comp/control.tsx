import { getColor, i2rc } from '../utils'
export type item = {
    key: string
    color: string
    i: number
    count: number
}
export default function Control({
    setSelect,
    setSelectArr,
    select,
    selectArr,
    selectWrap,
    gridRef,
    TXT,
    lineSize,
    addHandle,
    deleteHandle,
}: {
    setSelect: React.Dispatch<React.SetStateAction<string>>
    setSelectArr: React.Dispatch<React.SetStateAction<item[]>>
    select: string
    selectArr: item[]
    selectWrap: item
    gridRef: any
    TXT: string
    lineSize: number
    addHandle: () => void
    deleteHandle(key: string): void
}) {
    return (
        <div
            className='control'
            onKeyDown={e => console.log(2, e)}
            onKeyUp={e => console.log(3, e)}
            tabIndex={0}
        >
            {/* <button onClick={() => setX(X + 1)}>{X}</button> */}
            {/* <p>行长度:{columnCount}</p> */}

            <div className='count'>
                <button onClick={addHandle}>add</button>
                {selectWrap.count}
            </div>

            <input
                type='text'
                value={select}
                onChange={e => setSelect(e.target.value)}
            />
            <div>
                {selectArr
                    .sort((l, r) => r.count - l.count)
                    .map(({ i, key, count }, idx) => (
                        <div className='selectItem' key={i} slot={key}>
                            <span
                                children={idx}
                                onClick={() => deleteHandle(key)}
                            />
                            <span
                                children={key}
                                onClick={() => {
                                    // react 会不会每个span都新建了一个函数事件
                                    setSelectArr([
                                        ...selectArr.filter(ee => ee.i !== i),
                                        { i, key, count, color: getColor() },
                                    ])
                                }}
                            />
                            <span
                                className='item'
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
