import { lazy, memo, Suspense, useEffect, useState } from 'react'
import { runWithTime, sleepSync } from '../debug'

export default function Comp({ RENDER }: any) {
    const { reader, app } = RENDER
    const [x, _set_x] = useState(0)

    // console.log('render comp')
    // useEffect(() => {
    //     //     sleepSync(1000)
    //     console.log('effect comp')

    //     if (RENDER.reader === x) return
    //     _set_x(RENDER.reader)
    // })

    return (
        <>
            <span>app:{app}</span>
            <span>reader:{reader}</span>
        </>
    )
}
function Comp2({ rerender_reader }: any) {
    const [x, _set_x] = useState(0)
    useEffect(() => {
        _set_x(rerender_reader.current)
    }, [rerender_reader.current])

    return (
        <button onClick={() => _set_x(x + 1)}>
            btn{x}-{rerender_reader.current}
        </button>
    )
}

export function Effect({ showInfo, msg }: any) {
    if (!showInfo) return
    // sleepSync(10)
    if (msg.includes('render OVER')) {
        runWithTime(msg)
    }
    useEffect(() => {
        if (msg.includes('effect begin')) {
            runWithTime(msg)
        }
    })

    // return msg
}

const APP = () => {
    return
    const callback = useCallback(
        (() => {
            const rt = /* @__PURE__ */ _jsxDEV(
                VGrid,
                {
                    ...props_VG,
                },
                void 0,
                false,
                {
                    fileName: _jsxFileName,
                    lineNumber: 181,
                    columnNumber: 24,
                },
                this
            )
            return rt
        })(),
        deps_VG
    )
    return /* @__PURE__ */ _jsxDEV(
        _Fragment,
        {
            children: [
                /* @__PURE__ */ _jsxDEV(
                    Effect,
                    {
                        msg: '------------------ effect begin ------------------',
                    },
                    void 0,
                    false,
                    {
                        fileName: _jsxFileName,
                        lineNumber: 198,
                        columnNumber: 13,
                    },
                    this
                ),
                /* @__PURE__ */ _jsxDEV(
                    Control,
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
                        tabIndex: 1,
                        onKeyDown,
                        onKeyUp,
                        domC,
                        updata,
                        setUpdata,
                        OVERSCAN_change,
                        SET_OVERSCAN_change,
                        OVERSCAN_bottom,
                        SET_OVERSCAN_bottom,
                        feature,
                        setFeature,
                        RENDER,
                        scrollTop,
                    },
                    void 0,
                    false,
                    {
                        fileName: _jsxFileName,
                        lineNumber: 199,
                        columnNumber: 13,
                    },
                    this
                ),
                /* @__PURE__ */ _jsxDEV(
                    'div',
                    {
                        className: 'reader',
                        style: {
                            '--clickType': clickType,
                            '--SIZE_H': SIZE_H + 'px',
                            '--SIZE_W': SIZE_W + 'px',
                        },
                        onClick: GoToNextItemHandle,
                        children: [
                            /* @__PURE__ */ _jsxDEV(
                                'div',
                                {
                                    className: 'reader-helper',
                                },
                                void 0,
                                false,
                                {
                                    fileName: _jsxFileName,
                                    lineNumber: 241,
                                    columnNumber: 17,
                                },
                                this
                            ),
                            1
                                ? useMemo(
                                      () =>
                                          /* @__PURE__ */ _jsxDEV(
                                              VGM,
                                              {
                                                  ...props_VG,
                                              },
                                              void 0,
                                              false,
                                              {
                                                  fileName: _jsxFileName,
                                                  lineNumber: 243,
                                                  columnNumber: 35,
                                              },
                                              this
                                          ),
                                      deps_VG
                                  )
                                : /* @__PURE__ */ _jsxDEV(
                                      VGrid,
                                      {
                                          ...props_VG,
                                      },
                                      void 0,
                                      false,
                                      {
                                          fileName: _jsxFileName,
                                          lineNumber: 245,
                                          columnNumber: 21,
                                      },
                                      this
                                  ),
                            /* @__PURE__ */ _jsxDEV(
                                'div',
                                {
                                    className: 'next',
                                    onMouseOver: () => console.log,
                                    children: [
                                        (OVERSCAN_top +
                                            OVERSCAN_bottom +
                                            heightCount) *
                                            widthCount,
                                        'NEXT',
                                    ],
                                },
                                void 0,
                                true,
                                {
                                    fileName: _jsxFileName,
                                    lineNumber: 248,
                                    columnNumber: 17,
                                },
                                this
                            ),
                        ],
                    },
                    void 0,
                    true,
                    {
                        fileName: _jsxFileName,
                        lineNumber: 230,
                        columnNumber: 13,
                    },
                    this
                ),
                /* @__PURE__ */ _jsxDEV(
                    'div',
                    {
                        className: 'styles',
                        children: [
                            {
                                key: select,
                                color: 'black',
                                i: Date.now(),
                                count: getWordCount(select, TXT),
                                isPined: false,
                            },
                            ...selectArr,
                        ].map(({ key, color, isPined }, idx) =>
                            /* @__PURE__ */ _jsxDEV(
                                'style',
                                {
                                    slot: key,
                                    children: getStyle(
                                        TXT,
                                        key,
                                        color,
                                        isPined || key === select,
                                        idx === 0
                                    ),
                                },
                                key + idx,
                                false,
                                {
                                    fileName: _jsxFileName,
                                    lineNumber: 293,
                                    columnNumber: 21,
                                },
                                this
                            )
                        ),
                    },
                    void 0,
                    false,
                    {
                        fileName: _jsxFileName,
                        lineNumber: 256,
                        columnNumber: 13,
                    },
                    this
                ),
                /* @__PURE__ */ _jsxDEV(
                    Effect,
                    {
                        msg: '------- render OVER -------------------',
                    },
                    void 0,
                    false,
                    {
                        fileName: _jsxFileName,
                        lineNumber: 304,
                        columnNumber: 13,
                    },
                    this
                ),
            ],
        },
        void 0,
        true
    )
}
