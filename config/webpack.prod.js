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

/**
 * Thead：为什么？
 * 当项目越来越庞大时，打包速度越来越慢，甚至于需要一个下午才能打包出来代码。这个速度是比较慢的。
 * 我们想要继续提升打包速度，其实就是要提升 js 的打包速度，因为其他文件都比较少。
 * 而对 js 文件处理主要就是 eslint 、babel、Terser 三个工具，所以我们要提升它们的运行速度。
 * 注：Terser 为 webpack 自带，用于压缩文件，生产模式下自动开启
 * 我们可以开启多进程同时处理 js 文件，这样速度就比之前的单进程打包更快了。
 * 
 * Thead：是什么？
 * 多进程打包：开启电脑的多个进程同时干一件事，速度更快。
 * 需要注意：请【仅在特别耗时的操作中使用】，因为每个进程启动就有大约为 600ms 左右开销。
 * 也就是文件多的时候才有提升性能的效果，文件少的时候会让打包更慢
 * 
 * Thead：使用方法见下面
 */
// nodejs核心模块，直接使用
const os = require("os");
// 我们启动进程的数量就是我们 CPU 的核数
// 下面是获取 CPU 的核数，因为每个电脑都不一样
// 超过电脑核数就做不了
// 这里还要用一个 thread-loader 来实现功能，可以自行下载
const threads = os.cpus().length;
// 这里也需要处理一下Terser多进程，注意Terser是webpack自带，不需要另外下载什么
const TerserPlugin = require("terser-webpack-plugin");
/**
 * 开发如果项目中引用了较多图片，那么图片体积会比较大，将来请求速度比较慢。
 * 我们可以对图片进行压缩，减少图片体积。
 * 
 * 注意：如果项目中图片都是在线链接，那么就不需要了。
 * 本地项目静态图片才需要进行压缩
 * 
 * image-minimizer-webpack-plugin: 用来压缩图片的插件
 */
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

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
                        // 使用 thread多线程 后 js 需要多个 loader处理，所以这里改为use
                        use: [
                            {
                                loader: "thread-loader", // 开启多进程
                                options: {
                                    workers: threads, // 电脑内核数量，也是进程数量
                                },
                            },
                            {
                                loader: "babel-loader",
                                /**
                                 * cache: 为什么?
                                 * 一般项目中最大比例的就是js文件
                                 * 主要处理js的工具是： Eslint 检查 和 Babel 编译
                                 * 每次打包时 js 文件都要经过 Eslint 检查 和 Babel 编译，速度比较慢。
                                 * 我们可以缓存之前的 Eslint 检查 和 Babel 编译结果，这样第二次打包时速度就会更快了。
                                 * cache: 是什么?
                                 * 【对 Eslint 检查 和 Babel 编译结果进行缓存】
                                 * 注意提升的是第二次第三次第四次打包速度，首次还是要全打包的
                                 */
                                options: {
                                    cacheDirectory: true, // 开启babel编译缓存
                                    cacheCompression: false, // 缓存文件不要压缩，因为压缩需要时间，代码上线时用不上缓存文件，体积大小不影响加载速度，只会占点内存
                                    /**
                                    * @babel/plugin-transform-runtime插件：为什么?
                                    * Babel 为编译的每个文件都插入了辅助代码，使代码体积过大！
                                    * Babel 对一些公共方法使用了非常小的辅助代码，比如 _extend。
                                    * 默认情况下会被添加到每一个需要它的文件中，假设有10个文件用到它，他就被定义10次
                                    * 你可以将这些辅助代码作为一个独立模块，来避免重复引入。
                                    * 
                                    * @babel/plugin-transform-runtime插件：是什么?
                                    * @babel/plugin-transform-runtime: 禁用了 Babel 自动对每个文件的 runtime 注入，
                                    * 而是引入 @babel/plugin-transform-runtime 并且使所有辅助代码从这里引用。
                                    * 相当于这是一个全局方法包，大家都从这里引入
                                    */
                                    plugins: ["@babel/plugin-transform-runtime"], // 减少代码体积
                                },

                            },
                        ],

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
            cache: true, // 开启缓存
            // 缓存目录
            cacheLocation: path.resolve(
                __dirname,
                "../node_modules/.cache/.eslintcache"
            ),
            threads, // 开启多进程+设置进程数量，threads是电脑核数，也是进程数
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
        //下面的压缩方式是旧的webpack4

        // css压缩
        // webpack官网放在 optimization 下，配置相对会更麻烦一些，也可以看看下面
        // new CssMinimizerPlugin(),

        // 配置Terser多进程方式1
        // new TerserPlugin({
        //     parallel: threads // 开启多进程
        // })
    ],
    optimization: {
        // webpack5 推荐压缩配置方式：
        minimize: true,
        // 代码分割配置
        // 单入口文件只需要这样配置，全部用默认
        // 单入口加这个splitChunks配置的作用：如果用上node_modules中代码，会把node_modules中代码打包成单独文件
        //                                如果有动态导入语法，也会单独打包成文件
        // 可以看到配置这一项+动态导入语法，可以打包出两个文件
        splitChunks: { chunks: "all" },
        minimizer: [
            // css压缩也可以写到optimization.minimizer里面，效果一样的
            new CssMinimizerPlugin(),
            // 配置Terser多进程方式2
            // 当生产模式会默认开启TerserPlugin，
            // 但是这里我们需要进行其他配置（threads），就要重新写了
            new TerserPlugin({
                parallel: threads // 开启多进程
            }),
            // 压缩图片
            // 注意有无损有损两种模式，这里的例子是无损，可以去官网看看ImageMinimizerPlugin官方文档
            // 无损有损选一种即可
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.imageminGenerate,
                    options: {
                        plugins: [
                            ["gifsicle", { interlaced: true }],
                            ["jpegtran", { progressive: true }],
                            ["optipng", { optimizationLevel: 5 }],
                            [
                                "svgo",
                                {
                                    plugins: [
                                        "preset-default",
                                        "prefixIds",
                                        {
                                            name: "sortAttrs",
                                            params: {
                                                xmlnsOrder: "alphabetical",
                                            },
                                        },
                                    ],
                                },
                            ],
                        ],
                    },
                },
            }),
        ],
    },
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
