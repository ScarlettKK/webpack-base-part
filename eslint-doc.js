// 有很多种配置格式，这里采用js格式
// 其他格式参考：https://yk2012.github.io/sgg_webpack5/base/javascript.html#_1-%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6
module.exports = {
    // 解析选项
    // eslint检查语法的规则，如版本、模块化、其他特性等等
    parserOptions: {
        ecmaVersion: 6, // ES 语法版本
        sourceType: "module", // ES 模块化
        ecmaFeatures: { // ES 其他特性
            jsx: true // 如果是 React 项目，就需要开启 jsx 语法
        }
    },
    // 具体检查规则
    // 有哪些规则？如何处理？
    // 规则严重程度等级如下：
    // "off" 或 0 - 关闭规则
    // "warn" 或 1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出)
    // "error" 或 2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)
    // 数组是双规则的意思，一般第一个元素是更严格的规则
    rules: {
        semi: "error", // 禁止使用分号
        'array-callback-return': 'warn', // 强制数组方法的回调函数中有 return 语句，否则警告
        'default-case': [
            'warn', // 要求 switch 语句中有 default 分支，否则警告
            { commentPattern: '^no default$' } // 允许在最后注释 no default, 就不会有警告了
        ],
        eqeqeq: [
            'warn', // 强制使用 === 和 !==，否则警告
            'smart' // https://eslint.org/docs/latest/rules/eqeqeq#smart 除了少数情况下不会有警告
        ],
    },
    // 继承其他规则
    // 开发中一点点写 rules 规则太费劲了，所以有更好的办法，继承现有的规则
    /*
        现有以下较为有名的规则：
        Eslint 官方的规则：eslint:recommended
        Vue Cli 官方的规则：plugin:vue/essential
        React Cli 官方的规则：react-app
    */
    extends: ["react-app"],
    /*
        如果官方规则有一些不想要：
        rules: {
            // 我们的规则会覆盖掉react-app的规则
            // 所以想要修改规则直接改就是了
            eqeqeq: ["warn", "smart"],
        },
    */
    // ...
    // 其他规则详见：https://zh-hans.eslint.org/docs/latest/
};