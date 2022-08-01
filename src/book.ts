console.log('book')

const warning =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`' +
    `	②①③○©×+─―—-–~≈÷=*“”"　  ·?,.•°%‘’⋯…!<>()/@&;|0123456789∪'`

const error = `＼＾㈡�＃＆＂￥㊟ℓａｂｃｄｅＥｆｇｈｉⅠⅡⅢⅣｊｋｌｍｎｕｏｐｑｒＲｓｔｖｗｘＸｙｚＵ：＇。□・．＊≌～＋，！？／〔〕（）《》〈〉「」『』［］【】；、﹢－＝ＢＣＦＧＪＫＶＷＱＩＹＬＡＭＤＴＨＮＯＰＳＺ１２３４５６７８９０％℃`

export const invalidData = new Set([...warning, ...error])
