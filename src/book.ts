const warning =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`' +
    `	©×+─―—-–~≈÷=*“”"　  ·?,.•°%‘’⋯…!<>()/@&;|0123456789'`

const error = `＂￥㊟ℓａｄｅｇｈｉｋｌｍｎｕｏｐｒｓｖｗｙｚ：＇。・．～，！？／（）《》〉「」『』［］【】；、﹢－＝ＢＣＦＧＪＫＶＷＱＩＹＬＡＭＤＴＨＮＯＰＳＺ１２３４５６７８９０％℃`

export const invalidData = new Set([...warning, ...error])
