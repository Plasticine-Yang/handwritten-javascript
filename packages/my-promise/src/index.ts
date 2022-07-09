import { MyPromise } from './my-promise'
;(MyPromise as any).deferred = function () {
  const res: any = {}
  res.promise = new MyPromise((resolve, reject) => {
    res.resolve = resolve
    res.reject = reject
  })

  return res
}

export default MyPromise
