export function sum(...args) {
    return args.reduce((p, c) => p + c, 0)
}

// runtime打包配置测试
console.log('runtime test')