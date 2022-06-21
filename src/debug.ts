Object.defineProperties(Object.prototype, {
    ll: {
        get() {
            console.log(this)
            return this
        },
    },
})

export const a = 1
