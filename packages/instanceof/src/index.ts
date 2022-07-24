export function myInstanceof(obj: any, constructor: any): boolean {
  let p = Object.getPrototypeOf(obj)

  while (p !== null) {
    if (p === constructor.prototype) return true
    p = Object.getPrototypeOf(p)
  }

  return false
}
