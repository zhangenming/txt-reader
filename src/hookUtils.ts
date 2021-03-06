import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react'

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

const ref_wls: any = {}
export function useWithLocalStorage(flag: string) {
    const [state, SET_state] = useState(() =>
        Number(localStorage.getItem(flag))
    )

    ref_wls.current = state

    useEffect(() => {
        window.onunload = () => {
            localStorage.setItem(flag, String(ref_wls.current))
        }
    }, [])

    return [state, SET_state] as const
}

export type paire<S> = {
    get: S
    set: Dispatch<SetStateAction<S>>
}
export function useStatePaire<S>(initialState: S | (() => S)): paire<S> {
    const [state, SET_state] = useState(initialState)
    return {
        get: state,
        set: SET_state,
    }
}
