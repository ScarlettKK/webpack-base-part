// 具体教程请参考同文件夹下的eslint-doc.js文件
module.exports = {
    // 继承 Eslint 规则
    extends: ["eslint:recommended"],
    env: {
        node: true, // 启用node中全局变量
        browser: true, // 启用浏览器中全局变量，启用console.log
    },
    parserOptions: {
        ecmaVersion: 6, // es6语法
        sourceType: "module", // 模块化
    },
    rules: {
        "no-var": 2, // 不能使用 var 定义变量
    },
    plugins: ["import"] // 解决动态导入语法报错
};