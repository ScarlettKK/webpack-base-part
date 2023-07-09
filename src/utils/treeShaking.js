/**
 * Tree Shaking
 * 
 * 为什么?
 * 开发时我们定义了一些工具函数库，或者引用第三方工具函数库或组件库。
 * 如果没有特殊处理的话我们打包时会引入整个库，但是实际上可能我们可能只用上极小部分的功能。
 * 这样将整个库都打包进来，体积就太大了。
 * 
 * 是什么?
 * Tree Shaking 是一个术语，通常用于描述移除 JavaScript 中的没有使用上的代码。
 * 注意：它依赖 ES Module，commonjs不得行
 * 
 * 怎么用？
 * Webpack 已经默认开启了这个功能，无需其他配置。
 * 
 * 下面是测试，结果是可以看到 noUse 函数没有被打包
 */
export const noUse = () => {
    console.log('this js function is not imported!')
}

export const used = () => {
    console.log('this js function is imported!')
}