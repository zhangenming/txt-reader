import {
    useState,
    useRef,
    useEffect,
    Dispatch,
    SetStateAction,
    useMemo,
    MutableRefObject,
    RefObject,
} from 'react'
import { config } from './hook'
import { querySelector } from './utils'
// console.log('hookUtils TS')
export function useHover(
    ref: React.MutableRefObject<HTMLDivElement | undefined>
) {
    const [isHover, SET_isHover] = useState(false)
    const handleMouseOver = () => SET_isHover(true)
    const handleMouseOut = () => SET_isHover(false)

    useEffect(() => {
        const node = ref.current!
        node.addEventListener('mouseover', handleMouseOver)
        node.addEventListener('mouseout', handleMouseOut)
        // return () => {
        //     node.removeEventListener('mouseover', handleMouseOver)
        //     node.removeEventListener('mouseout', handleMouseOut)
        // }
    }, [])
    return isHover
}

// 存
window.onbeforeunload = () => {
    Object.entries(refSWLS).forEach(([key, { state, fn }]) => {
        if (key.includes('globalWords')) {
            localStorage.setItem(key, JSON.stringify(Array.from(state)))
        } else if (key.includes('selectArr')) {
            localStorage.setItem(key, JSON.stringify(state) || '[]')
        } else if (key.includes('currentBlock')) {
            localStorage.setItem(key, fn?.())
        } else {
            localStorage.setItem(key, state)
        }
    })
}

const refSWLS: { [key: string]: { fn: Function | undefined; state: any } } = {}
// 取
export function useStateWithLS<T>(key: string, fn?: Function) {
    const flag = `${key} - ${config.txt.length}`

    const [state, SET_state] = useState<T>(() => {
        let rs = JSON.parse(localStorage.getItem(flag))
        if (flag.includes('globalWords')) {
            rs = new Set(rs)
        }
        if (flag.includes('selectArr')) {
            rs = rs || []
        }
        return rs
    })

    refSWLS[flag] = {
        state,
        fn,
    } // 注册onbeforeunload

    return [state, SET_state] as const
}

export type paire<S> = {
    get: S
    set: Dispatch<SetStateAction<S>>
}
export function useStatePaire<S>(initialState?: any) {
    const [state, SET_state] = useState(initialState)
    return useMemo(
        () => ({
            get: state,
            set: SET_state,
        }),
        [state]
    )
}

export function useStateCompare(initialState?: any) {
    const [state, SET_state] = useState(initialState)
    return [
        state,
        e => {
            if (e === state) return
            SET_state(e)
        },
    ]
}

export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>()
    useEffect(() => {
        ref.current = value
    }, [value])
    return ref.current
}

export function useDidMountEffect(func: Function, deps: any[]) {
    const firstUpdate = useRef(true)
    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false
        } else {
            func()
        }
    }, deps)
}

const useKeyHoldRef: any = {}
export function getHoldingKey(key?: string) {
    return key ? useKeyHoldRef[key] : useKeyHoldRef
}
export function useKeyHold() {
    useEffect(() => {
        document.body.onkeydown = e => {
            useKeyHoldRef[e.key] = true
        }
        document.body.onkeyup = e => {
            useKeyHoldRef[e.key] = false
        }
    }, [])
}

export function useMemo2(fn: any, deps: any[]) {
    return fn()
}
