// 用于dev环境下的配置
// npx webpack serve --config ./config/webpack.dev.js
// 配置对象顺序无要求，但要注意文件名以及文件位置
// 有了此配置文件后，webpack运行指令变得简单了
// 之前的指令，适用于无配置文件：npx webpack ./src/main.js --mode=production
// 新指令：npx webpack

// Node.js的核心模块，专门用来处理文件路径
const path = require("path");
// 这里注意eslint是插件，需要引入才能用
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
// html插件也是一样
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    // 入口
    // 相对路径和绝对路径都行，此处是相对路径，就是相对base-part整个文件夹的路径，所以不需要更改
    entry: "./src/main.js",
    // 输出
    output: {
        // 开发模式下不需要输出
        path: undefined,
        // 没有输出，但是文件名还是需要指定的，用于内存中使用
        filename: "js/main.js",
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
            // 处理图片资源：
            // 过去在 Webpack4 时，我们处理图片资源通过 file-loader 和 url-loader 进行处理
            // 现在 Webpack5 已经将两个 Loader 功能内置到 Webpack 里了，我们只需要简单配置即可处理图片资源
            {
                test: /\.(png|jpe?g|gif|webp)$/,
                type: "asset", // 相当于使用 file-loader 和 url-loader 
                // 有的时候需要将图片转成base64 url
                // 好处是可以减少请求数量，坏处是会增大图片体积，所以只适用于小图片
                // 所以下面增加这个配置，对于小于这个size的图片才生效转base64操作
                parser: {
                    dataUrlCondition: {// 转base64配置
                        maxSize: 10 * 1024 // 小于10kb图片转base64
                    }
                    // 最后在网页上以及打包后的dist文件中可以验证此效果，打包后图片只有一个，另一个是url
                    //（最好删了dist再打包，否则图片文件可能会被上一次打包影响
                },
                generator: {
                    // 指定生成的图片存放路径 + 名称
                    // hash是随机哈希值，ext是原文件扩展名，query是url中的查询参数（如有）
                    // :10是指哈希值只取前10位，防止名称过长
                    filename: 'images/[hash:10][ext][query]'
                }
            },
            {
                test: /\.(ttf|woff2?)$/,
                type: "asset/resource", // 相当于file-loader，只会对文件原封不动输出，不转base64
                generator: {
                    // 指定生成的图片存放路径 + 名称
                    // hash是随机哈希值，ext是原文件扩展名，query是url中的查询参数（如有）
                    // :10是指哈希值只取前10位，防止名称过长
                    filename: 'fonts/[hash:10][ext][query]'
                }
            },
            {
                test: /\.(map4|map3|avi)$/, // 处理音视频资源
                type: "asset/resource", // 相当于file-loader，只会对文件原封不动输出，不转base64
                generator: {
                    // 指定生成的图片存放路径 + 名称
                    // hash是随机哈希值，ext是原文件扩展名，query是url中的查询参数（如有）
                    // :10是指哈希值只取前10位，防止名称过长
                    filename: 'media/[hash:10][ext][query]'
                }
            },
            {
                test: /\.js$/, // babel处理js文件
                exclude: /node_modules/, // 排除node_modules代码不编译
                loader: "babel-loader",
            },
        ],
    },
    // 插件
    plugins: [
        //插件的配置
        // 下面是eslint插件
        new ESLintWebpackPlugin({
            // 指定检查文件的根目录
            // 绝对路径都需要回退一层，因为__dirname是当前绝对路径，当前在config目录下
            context: path.resolve(__dirname, "../src"),
        }),
        new HtmlWebpackPlugin({
            // 以 index.html 为模板创建文件
            // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
            template: path.resolve(__dirname, "../index.html"),
        }),
    ],
    // 开发服务器
    // 每次更改完代码，都可以自动编译打包，并且刷新页面展示
    // 运行：npx webpack serve
    // 注意：开发服务器不会输出dist文件夹下的资源，它只在内存中打包编译展示，此处删除dist文件对他没有影响
    devServer: {
        host: "localhost", // 启动服务器域名
        port: "3000", // 启动服务器端口号
        open: true, // 是否自动打开浏览器
    },
    // 模式
    mode: "development", // 开发模式
};
