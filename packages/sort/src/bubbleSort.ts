export default function bubbleSort(arr: number[]): void {
  const n = arr.length
  // n 个元素需要比较 n - 1 次
  for (let i = 0; i < n - 1; i++) {
    // 标记是否发生了交换
    // 如果一轮下来发现没有发生交换 那么没必要继续迭代
    let hasSwap = false

    // 用 j 去对比 已经比较过的不需要再比较
    //所以需要减去 i 让其不会比较到倒数第 i 个已经排好序的元素
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        // 常规的交换元素
        // const temp = arr[j]
        // arr[j] = arr[j + 1]
        // arr[j + 1] = temp

        // 高级且方便的交换
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        hasSwap = true
      }
    }

    if (!hasSwap) break
  }
}
