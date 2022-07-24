export function myNew(constructor: Function, ...args: any[]) {
  // new 调用构造函数时 创建一个对象 该对象的隐式原型指向构造函数的原型对象
  // 构造函数中的 this 会指向创建出来的这个对象
  const thisObj = Object.create(constructor.prototype)

  constructor.apply(thisObj, args)

  return thisObj
}
