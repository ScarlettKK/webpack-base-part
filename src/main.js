/**
 * 兼容性处理更深一级：有的浏览器不支持promise语法
 * 而babel并不能处理sync 函数、promise 对象、数组的一些方法（includes）等
 * 此时我们需要引入core-js补丁
 * 下面是其中一种引入方法，按需加载，因为我们只需要处理下面的promise语法
 * 缺点是可能会导致打包体积增大，毕竟这里引入了一个插件
 * 另一种配置方法是在babel.config.js中，可以做全量语法配置
 */
// import "core-js/es/promise";

import count from './utils/count'
// import sum from './utils/sum'
import { used } from './utils/treeShaking'

// 要想webpack打包资源，必须引入该资源，css等样式资源也不例外
import './assets/icons/iconfont.css'

import './styles/index.css'
import './styles/index.less'
import './styles/index.sass'
import './styles/index.scss'
import './styles/index.styl'

console.log(count(2, 1))
// console.log(sum(1, 2, 3, 4, 5, 6))
used()

// 动态导入：比如给btn绑定事件，用户真正点击的时候才加载对应的函数，没点击不加载
document.getElementById("btn").onclick = function () {
    // import 动态导入 --> 实现按需加载
    // 将动态导入的文件拆分成单独模块（单独分割），在需要的时候再单独加载
    // 即使只被引用了一次，也会代码分割

    // eslint不能识别动态导入语法，这里需要单独配置

    // 项目使用场景：路由的import语法
    // 注意这里的sum需要是export而不是export default

    // webpackChunkName: "sum"：这是webpack动态导入模块命名的方式，也叫webpack魔法命名
    // "sum"将来就会作为[name]的值显示。
    // 但单单这里配置还不够，还需要在webpack pro配置文件中配置
    import(/* webpackChunkName: "sum" */ "./utils/sum").then(({ sum }) => {
        alert(sum(1, 2, 3, 4, 5));
    });
};

// 添加promise代码
const promise = Promise.resolve();
promise.then(() => {
    console.log("hello promise");
});

// 判断是否支持热模块替换功能
if (module.hot) {
    // 热模块加载，对这个文件重新进行接收
    // 一旦count.js变化，只加载发生变化的部分，也就是只更新count文件

    // 不过这里只是重新加载文件，并不会调用上面的console
    // module.hot.accept('./utils/count')
    // module.hot.accept('./utils/sum')

    // 重新调用可以用下面的回调函数：
    module.hot.accept("./utils/count.js", function (count) {
        const result1 = count(2, 1);
        console.log(result1);
    });

    module.hot.accept("./utils/sum.js", function (sum) {
        const result2 = sum(1, 2, 3, 4);
        console.log(result2);
    });

    // 注意：
    // 上面这样写会很麻烦，所以实际开发我们会使用其他 loader 来解决。
    // 比如：vue-loader, react-hot-loader
}

/**
 * 为什么?
 * 开发 Web App 项目，项目一旦处于网络离线情况，就没法访问了。
 * 我们希望给项目提供离线体验。
 * 
 * 是什么?
 * 渐进式网络应用程序(progressive web application - PWA)：
 * 是一种可以提供类似于 native app(原生应用程序) 体验的 Web App 的技术。
 * 其中最重要的是，在 离线(offline) 时应用程序能够继续运行功能。
 * 内部通过 Service Workers 技术实现的。
 */

// 注意：serviceWorker还需要在app中注册才能使用
if ("serviceWorker" in navigator) { // 需要判断存在才使用（有兼容性问题）
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/service-worker.js")
            .then((registration) => {
                console.log("SW registered: ", registration);
            })
            .catch((registrationError) => {
                console.log("SW registration failed: ", registrationError);
            });
    });
}
 /**
* 此时npm run build后打开html页面，会报错
* 此时如果直接通过 VSCode 访问打包后页面，在浏览器控制台会发现 SW registration failed。
* 因为我们打开的访问路径是：http://127.0.0.1:5500/dist/index.html。
* 此时页面会去请求 service-worker.js 文件，请求路径是：http://127.0.0.1:5500/service-worker.js，这样找不到会 404。
* 实际 service-worker.js 文件路径是：http://127.0.0.1:5500/dist/service-worker.js。
* 
* 解决方案
* npm i serve -g
* serve 也是用来启动开发服务器来部署代码查看效果的。
* 此时通过 serve 启动的服务器我们 service-worker 就能注册成功了。
*/