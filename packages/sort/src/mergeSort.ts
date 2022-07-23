export default function mergeSort(arr: number[]) {
  const n = arr.length
  // base case
  if (n <= 1) return arr

  // 以中间作为分界点 切割成左右两个子数组
  const mid = Math.floor(n / 2)
  const leftArr = mergeSort(arr.slice(0, mid))
  const rightArr = mergeSort(arr.slice(mid, n))

  // 合并
  arr = merge(leftArr, rightArr)

  return arr
}

function merge(leftArr: number[], rightArr: number[]): number[] {
  let res: number[] = []
  const m = leftArr.length
  const n = rightArr.length
  // 两个指针分别遍历左右两个子数组
  let i = 0
  let j = 0

  while (i < m && j < n) {
    if (leftArr[i] < rightArr[j]) {
      res.push(leftArr[i])
      i++
    } else {
      res.push(rightArr[j])
      j++
    }
  }

  if (i < m) {
    res = res.concat(leftArr.slice(i))
  } else {
    res = res.concat(rightArr.slice(j))
  }

  return res
}
