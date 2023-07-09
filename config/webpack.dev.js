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

/**
 * Thead：为什么？
 * 当项目越来越庞大时，打包速度越来越慢，甚至于需要一个下午才能打包出来代码。这个速度是比较慢的。
 * 我们想要继续提升打包速度，其实就是要提升 js 的打包速度，因为其他文件都比较少。
 * 而对 js 文件处理主要就是 eslint 、babel、Terser 三个工具，所以我们要提升它们的运行速度。
 * 注：Terser 为 webpack 自带，用于压缩文件，生产模式下自动开启，此处是开发模式，不做处理
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
                        // 注意：这里的options配置不能与use配置共存
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
    // 插件
    plugins: [
        //插件的配置
        // 下面是eslint插件
        new ESLintWebpackPlugin({
            // 指定检查文件的根目录
            // 绝对路径都需要回退一层，因为__dirname是当前绝对路径，当前在config目录下
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
        /**
         * 开发时我们修改了其中一个模块代码，Webpack 默认会将所有模块全部重新打包编译，速度很慢。
         * 所以我们需要做到修改某个模块代码，就只有这个模块代码需要重新打包编译，其他模块不变，这样打包速度就能很快。
         * HotModuleReplacement（HMR/热模块替换）：在程序运行中，替换、添加或删除模块，而无需重新加载整个页面。
         * 注意：样式（css）天然具备热模块替换功能，但是js没有，下面开启后还是会整个页面刷新
         * 所以js需要特殊处理一下，见main.js
         * 只在dev模式下有用
         */
        hot: true, // 开启HMR功能（只能用于开发环境，生产环境不需要了）
    },
    // 模式
    mode: "development", // 开发模式,
    /**
     * SourceMap（源代码映射）是一个用来生成源代码与构建后代码一一映射的文件的方案。
     * 它会生成一个 xxx.map 文件，里面包含源代码和构建后代码每一行、每一列的映射关系。
     * 当构建后代码出错了，会通过 xxx.map 文件，从构建后代码出错位置找到映射后源代码出错位置
     * 从而让浏览器提示源代码文件出错位置，帮助我们更快的找到错误根源。
     * 开发模式：cheap-module-source-map
     * 优点：打包编译速度快，只包含行映射
     * 缺点：没有列映射
     */
    devtool: "cheap-module-source-map",
};

// 基础篇总结：https://yk2012.github.io/sgg_webpack5/base/summary.html