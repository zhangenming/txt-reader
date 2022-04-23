type roules = string[]
type color = string
export type Item = [roules, color]

const sg = [
    [
        [
            '孙德崖',
            '张士诚',
            '陈友谅',
            '徐寿辉',
            '郭子兴',
            '刘福通',
            '张定边',
            '很精彩，历史可以写',
            '',
            '',
            '红巾军',
        ],
        'black',
    ],
    [
        [
            '朱重八',
            '朱元璋',
            '李善长',
            '常遇春',
            '徐达',
            '刘基',
            '冯胜',
            '朱文正',
            '邓愈',
            '张子明',
            '李文忠',
            '',
            '',
        ],
        'firebrick',
    ],
    [
        [
            '年',
            '州',
            '凤阳',
            '南京',
            '集庆',
            '应天',
            '镇江',
            '太平',
            '洪都',
            '安丰',
            '',
            '',
            '',
            '',
        ],
        'yellow',
    ],
]

const bly = [
    ['black', '白鹿 滋水'],
    ['firebrick', '秉德 老汉 鹿三 长工 白赵氏 朱先生 鹿子霖'],
    ['indigo', '他 嘉轩'],
    ['yellow', '她 '],
]

export default bly.map((e: any) => {
    e[1] = e[1].split(' ')
    return e
}) as [string, string[]][]
