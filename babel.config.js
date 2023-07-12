
// 这里的配置文件同样有很多种写法：参考 https://yk2012.github.io/sgg_webpack5/base/javascript.html#_1-%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6-1
// 同样选一种即可，这里采用 babel.config.js
// 这里用babel插件主要是为了适配不同浏览器（如ie等不支持es6语法
// webpack关于babel的包要下载比较多，参考webpack官网或：https://yk2012.github.io/sgg_webpack5/base/javascript.html#_3-%E5%9C%A8-webpack-%E4%B8%AD%E4%BD%BF%E7%94%A8-1
module.exports = {
    // 预设
    // 就是一组 Babel 插件, 扩展 Babel 功能
    /**
     * 例如：
     * @babel/preset-env: 一个智能预设，允许您使用最新的 JavaScript。
     * @babel/preset-react：一个用来编译 React jsx 语法的预设
     * @babel/preset-typescript：一个用来编译 TypeScript 语法的预设
     */
    // 智能预设：能够编译ES6语法
    presets: [
        [
            "@babel/preset-env",
            // 按需加载core-js的polyfill
            // 如如何编写下面的配置可以去 babel 官网查找
            // useBuiltIns：按需加载自动引入
            {
                useBuiltIns: "usage",
                corejs: { version: "3", proposals: true }
            },
        ],
    ],
};