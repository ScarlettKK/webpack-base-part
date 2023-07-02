import count from './utils/count'
import sum from './utils/sum'

// 要想webpack打包资源，必须引入该资源，css等样式资源也不例外
import './styles/index.css'
import './styles/index.less'
import './styles/index.sass'
import './styles/index.scss'
import './styles/index.styl'

console.log(count(1, 2))
console.log(sum(1, 2, 3, 4, 5))