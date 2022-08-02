// 拷贝对象的类型 -- 可以是对象也可以是数组
type ClonedObjType = Record<string | symbol, any> | any[]

const memo = new WeakSet<any>()

export const deepClone = <T>(target: T): T => {
  // 非引用类型的数据不需要深拷贝
  if (typeof target !== 'object') return target

  // Map、Set、Date、普通对象等引用类型需要深拷贝
  // 避免循环引用
  if (memo.has(target)) return target

  // 处理 Map 的拷贝
  if (target instanceof Map) {
    const clonedMap = new Map()

    // 缓存 避免循环引用
    memo.add(clonedMap)

    target.forEach((value, key) => clonedMap.set(key, deepClone(value)))

    return clonedMap as unknown as T
  }

  // 处理 Set 的拷贝
  if (target instanceof Set) {
    const clonedSet = new Set()

    memo.add(clonedSet)

    target.forEach(value => clonedSet.add(deepClone(value)))

    return clonedSet as unknown as T
  }

  // 处理 Date 和 RegExp 的拷贝 -- 调用构造函数来拷贝
  if (['RegExp', 'Date'].includes((target as any).constructor.name)) {
    const constructor = (target as any).constructor

    memo.add(target)

    return new constructor(target)
  }

  // 来到这里就只可能是拷贝普通对象或者数组了
  // 初始化拷贝对象 -- 要注意区分数组类型
  const clonedObj: ClonedObjType = Array.isArray(target) ? [] : {}

  memo.add(target)

  for (const key of Object.getOwnPropertyNames(target)) {
    // 遍历自身对象的所有字符串属性进行深拷贝
    clonedObj[key] = deepClone(target[key])
  }

  for (const key of Object.getOwnPropertySymbols(target)) {
    // 遍历自身对象的所有 symbol 属性进行深拷贝
    clonedObj[key] = deepClone[target[key]]
  }

  return clonedObj as T
}
