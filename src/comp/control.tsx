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
    selectionObj,
    gridRef,
    TXT,
    lineSize,
}: {
    setSelect: React.Dispatch<React.SetStateAction<string>>
    setSelectArr: React.Dispatch<React.SetStateAction<item[]>>
    select: string
    selectArr: item[]
    selectWrap: item
    selectionObj: Selection
    gridRef: any
    TXT: string
    lineSize: number
}) {
    return (
        <div className='control'>
            {/* <button onClick={() => setX(X + 1)}>{X}</button> */}
            {/* <p>行长度:{columnCount}</p> */}

            <div className='count'>
                <button
                    onClick={() => {
                        if (select === '') return

                        setSelect('')
                        setSelectArr([...selectArr, selectWrap])

                        selectionObj.removeAllRanges()
                    }}
                >
                    add
                </button>
                {selectWrap.count}
            </div>

            <input
                type='text'
                value={select}
                onChange={e => setSelect(e.target.value)}
            />
            <div>
                {selectArr
                    .sort((l, r) => l.i - r.i)
                    .map((e, idx) => (
                        <div className='selectItem' key={e.i} slot={e.key}>
                            <span
                                children={idx}
                                onClick={() => {
                                    // react 会不会每个span都新建了一个函数事件
                                    setSelectArr([
                                        ...selectArr.filter(ee => ee.i !== e.i),
                                    ])
                                }}
                            />
                            <span
                                children={e.key}
                                onClick={() => {
                                    setSelectArr([
                                        ...selectArr.filter(ee => ee.i !== e.i),
                                        { ...e, color: getColor() },
                                    ])
                                }}
                            />
                            <span
                                className='item'
                                children={e.count}
                                onClick={() => {
                                    const i = TXT.indexOf(e.key)
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
