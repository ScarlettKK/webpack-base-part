// 顺序无要求，但要注意文件名以及文件位置
// 有了此配置文件后，webpack运行指令变得简单了
// 之前的指令，适用于无配置文件：npx webpack ./src/main.js --mode=production
// 新指令：npx webpack

// Node.js的核心模块，专门用来处理文件路径
const path = require("path");

module.exports = {
    // 入口
    // 相对路径和绝对路径都行，此处是相对路径
    entry: "./src/main.js",
    // 输出
    output: {
        // path: 文件输出目录，必须是绝对路径
        // path.resolve()方法返回一个绝对路径
        // __dirname 当前文件的文件夹绝对路径，是一个内置变量
        path: path.resolve(__dirname, "dist"),
        // filename: 输出文件名
        filename: "main.js",
    },
    // 加载器
    module: {
        // loader的配置
        rules: [
            {
                // 只检测xxx文件，文件名匹配此正则表达式
                test: /\.css$/,
                // 使用什么laoder去处理这些文件
                // 执行顺序：从下到上，先执行css，后执行style
                // 看完下面两个的作用就知道为什么有顺序
                use: [
                    "style-loader", // 将js中css通过创建style标签的形式，添加到html文件中使样式生效（见打包后网页中的html代码
                    "css-loader" // 将css资源编译成commonjs模块，打包到js中
                ],
                // 另一种写法：loader: "xxx"，与use不同，此处只可以使用一个loader，use是多个
            },
            {
                test: /\.less$/,
                use: [
                    // compiles Less to CSS
                    'style-loader',
                    'css-loader',
                    'less-loader', // 将less编译成css文件
                ],
            },
            {
                test: /\.s[ac]ss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader', // 将sass编译成css文件
                ],
            },
            {
                test: /\.styl$/,
                use: ["style-loader", "css-loader", "stylus-loader"],
            },
        ],
    },
    // 插件
    plugins: [
        //插件的配置
    ],
    // 模式
    mode: "development", // 开发模式
};
