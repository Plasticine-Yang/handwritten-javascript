function throttle(fn: Function, delay: number) {
  let called = false

  return function (this: any, ...args: any[]) {
    // 当调用过时再次尝试调用是不允许的
    if (called) return

    called = true
    setTimeout(() => {
      fn.apply(this, args)
      // 执行完毕之后重置调用状态为未调用 这样下次调用时就允许调用了
      called = false
    }, delay)
  }
}
