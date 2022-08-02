import {
    useState,
    useRef,
    useEffect,
    Dispatch,
    SetStateAction,
    useMemo,
} from 'react'
import { config, querySelector } from './utils'
config.ll
// console.log('hookUtils TS')

export function useHover() {
    const [value, setValue] = useState(false)
    const ref = useRef(null)
    const handleMouseOver = () => setValue(true)
    const handleMouseOut = () => setValue(false)
    useEffect(() => {
        const node = ref.current
        if (node) {
            node.addEventListener('mouseover', handleMouseOver)
            node.addEventListener('mouseout', handleMouseOut)
            return () => {
                node.removeEventListener('mouseover', handleMouseOver)
                node.removeEventListener('mouseout', handleMouseOut)
            }
        }
    }, [ref.current])
    return [ref, value] as const
}

window.onbeforeunload = () => {
    Object.entries(refWLS).forEach(([key, val]) => {
        if (key.includes('globalWords')) {
            localStorage.setItem(key, JSON.stringify(Array.from(val)))
        } else if (key.includes('selectArr')) {
            localStorage.setItem(key, JSON.stringify(val) || '[]')
        } else {
            localStorage.setItem(key, val)
        }
    })
}

const refWLS: any = {}
export function useStateWithLS<T>(key: string) {
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

    refWLS[flag] = state

    return [state, SET_state] as const
}

export type paire<S> = {
    get: S
    set: Dispatch<SetStateAction<S>>
}
export function useStatePaire<S>(initialState: S | (() => S)): paire<S> {
    const [state, SET_state] = useState(initialState)
    return useMemo(
        () => ({
            get: state,
            set: SET_state,
        }),
        [state]
    )
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
        querySelector('#root').onkeydown = e => {
            useKeyHoldRef[e.key] = true
        }
        querySelector('#root').onkeyup = e => {
            useKeyHoldRef[e.key] = false
        }
    }, [])
}
