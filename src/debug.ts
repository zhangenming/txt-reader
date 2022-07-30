Object.defineProperties(Object.prototype, {
    ll: {
        get() {
            console.log(this)
            return this
        },
    },
    lls: {
        get() {
            console.time()
            return this
        },
    },
    lle: {
        get() {
            console.timeEnd()
            return this
        },
    },
})

export function runWithTime(str: any = '', fn: Function = () => {}) {
    console.time(str)
    const rs = fn()
    console.timeEnd(str)
    return rs
}

const p = performance.now.bind(performance)
export function sleepSync(t: number = 100) {
    const old = p()
    while (old - p() > -t) {
        window.x += 1
    }
}
