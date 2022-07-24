function debounce(fn: Function, delay: number): Function {
  let timer: number

  return function (this: unknown, ...args: any[]) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
