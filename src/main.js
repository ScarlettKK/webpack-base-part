import count from './utils/count'
import sum from './utils/sum'

// 要想webpack打包资源，必须引入该资源，css等样式资源也不例外
import './assets/icons/iconfont.css'

import './styles/index.css'
import './styles/index.less'
import './styles/index.sass'
import './styles/index.scss'
import './styles/index.styl'

console.log(count(2, 1))
console.log(sum(1, 2, 3, 4, 5, 6))

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