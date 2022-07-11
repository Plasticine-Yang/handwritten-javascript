# Feature

这是一个可以完美通过 `Promises A+` 规范的，用`TypeScript`实现的`promise`

其中核心在于`then`方法的实现，`then`返回了一个`MyPromise`实例，并使用`queueMicrotask`将任务放到微任务队列中执行

# How To Run

终端切换到`monorepo`的根目录或者该子仓库目录下，输入：

```shell
pnpm build && pnpm test
```

然后就可以看到所有单元测试正在跑，并且能够顺利通过！
