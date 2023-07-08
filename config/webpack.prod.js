// 用于product环境下的配置
// 运行：npx webpack --config ./config/webpack.prod.js
// 【注意生产模式不需要dev server】
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
/**
 * Css 文件目前被打包到 js 文件中，当 js 文件加载时，会创建一个 style 标签来生成样式
 * 这样对于网站来说，会出现闪屏现象，用户体验不好
 * 我们应该是单独的 Css 文件，通过 link 标签加载性能才好
 * 本插件会将 CSS 提取到单独的文件中，为每个包含 CSS 的 JS 文件创建一个 CSS 文件
 * 并且支持 CSS 和 SourceMaps 的按需加载
 * 下文需要将 style-loder 全部替换成 MiniCssExtractPlugin.loader
 * style-loder会动态创建style标签，我们不再需要此功能
 */
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// css 代码压缩插件
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

// 获取处理样式的Loaders
// 简化合并重复代码
const getStyleLoaders = (preProcessor) => {
    return [
        MiniCssExtractPlugin.loader,
        "css-loader",
        {
            // 注意位置，在less、sass、stylus loader之后
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: [
                        "postcss-preset-env", // 能解决大多数样式兼容性问题
                    ],
                },
            },
        },
        preProcessor,
    ].filter(Boolean); //这里过滤undefined
};

module.exports = {
    // 入口
    // 相对路径和绝对路径都行，此处是相对路径，就是相对base-part整个文件夹的路径，所以不需要更改
    entry: "./src/main.js",
    // 输出
    output: {
        // path: 文件输出目录，必须是绝对路径
        // path.resolve()方法返回一个绝对路径
        // __dirname 当前文件的文件夹绝对路径，是一个内置变量
        // 这里的是绝对路径 需要回退
        // 生产模式需要输出
        path: path.resolve(__dirname, "../dist"),
        // filename: 入口js文件输出文件名
        // 加一个“js/”路径可以让其打包出来的js入口文件分文件夹存放，不乱
        // 其他文件根据path配置，还是存放于dist文件夹下
        filename: "js/main.js",
        // 每次打包都自动清空上次打包结果
        // webpack5最新功能，无需插件
        // 原理：在打包之前，将path整个目录清空，再进行打包
        clean: true,
    },
    // 加载器，webpack不能识别的模块，通过loader来识别，如图片、less等
    module: {
        // loader的配置
        rules: [
            {
                // 打包时每个文件都会经过[所有] loader 处理
                // 虽然因为 test 正则原因实际没有处理上，但是都要过一遍。比较慢。
                // 即使匹配上了其中一个，也会继续匹配下去
                // oneOf:顾名思义就是只能匹配上一个 loader, 剩下的就不匹配了。
                // 文件多的时候才会有明显差异
                oneOf: [
                    {
                        // 只检测xxx文件，文件名匹配此正则表达式
                        test: /\.css$/,
                        // 使用什么laoder去处理这些文件
                        // 执行顺序：从下到上，先执行css，后执行style
                        // 看完下面两个的作用就知道为什么有顺序
                        use: getStyleLoaders(),
                        // 另一种写法：loader: "xxx"，与use不同，此处只可以使用一个loader，use是多个
                    },
                    {
                        test: /\.less$/,
                        use: getStyleLoaders('less-loader'),
                    },
                    {
                        test: /\.s[ac]ss$/,
                        use: getStyleLoaders('sass-loader'),
                    },
                    {
                        test: /\.styl$/,
                        use: getStyleLoaders('stylus-loader'),
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
                        /**
                         * 开发时我们需要使用第三方的库或插件，所有文件都下载到 node_modules 中了。
                         * 而这些文件是不需要编译可以直接使用的。
                         * 所以我们在对 js 文件处理时，要排除 node_modules 下面的文件。
                         * include: 包含，只处理 xxx 文件
                         * exclude: 排除，除了 xxx 文件以外其他文件都处理
                         * 【注意！】include跟exclude只能写其中一个，不能两个同时写
                         * 
                         * 此功能针对js文件使用多，所以这里例子用在eslint以及babel上
                         * 
                         * 样式文件一般不作此处理，原因如下：
                         * 基本上开发的时候引入第三方样式少
                         * 即使引入了第三方样式，最后也希望它跟我们自定义的样式打包在一起
                         */
                        // exclude: /node_modules/, // 排除node_modules代码不编译，其他文件都处理
                        include: path.resolve(__dirname, "../src"), // 也可以用包含，只处理src下文件
                        loader: "babel-loader",
                    },
                ]
            }
        ],
    },
    // 插件，扩展webpack功能，在css html js等基础工具上进行升级，如压缩、语法检查
    plugins: [
        //插件的配置
        // 下面是eslint插件
        new ESLintWebpackPlugin({
            // 指定检查文件的根目录
            context: path.resolve(__dirname, "../src"),
            exclude: "node_modules", // 默认值，不写也有效果
        }),
        new HtmlWebpackPlugin({
            // 以 index.html 为模板创建文件
            // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
            // 下面的css文件也会被自动创建link标签引入
            template: path.resolve(__dirname, "../index.html"),
        }),
        // 提取css成单独文件
        new MiniCssExtractPlugin({
            // 定义输出文件名和目录
            filename: "styles/main.css",
        }),
        // css压缩
        // webpack官网放在 optimization 下，配置相对会更麻烦一些，也可以看看
        new CssMinimizerPlugin(),
    ],
    // 模式
    // 默认生产模式已经开启了 js 压缩
    // 如果添加了 HtmlWebpackPlugin 插件，则会在生产模式下默认开启 html 压缩
    // 不需要额外进行配置
    mode: "production", // 生产模式
    /**
     * SourceMap（源代码映射）是一个用来生成源代码与构建后代码一一映射的文件的方案。
     * 它会生成一个 xxx.map 文件，里面包含源代码和构建后代码每一行、每一列的映射关系。
     * 当构建后代码出错了，会通过 xxx.map 文件，从构建后代码出错位置找到映射后源代码出错位置
     * 从而让浏览器提示源代码文件出错位置，帮助我们更快的找到错误根源。
     * 生产模式：source-map
     * 优点：包含行/列映射
     * 缺点：打包编译速度更慢
     */
    devtool: "source-map",
};

// 基础篇总结：https://yk2012.github.io/sgg_webpack5/base/summary.html
