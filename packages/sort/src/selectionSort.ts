/**
 * 选择排序中的选择意思就是每次选择一个最小的元素放到正确的位置
 */
export default function selectionSort(arr: number[]) {
  const n = arr.length
  // 遍历数组 做 n 次选择 每次选择最小的元素放到正确位置
  for (let i = 0; i < n; i++) {
    // 当前的基准元素作为最小元素 有比基准元素小的元素就更新 minIdx
    // 最终 minIdx 指向的就是 arr[i...n-1] 中的最小元素
    // 把它放到 arr[i] 处即可
    let minIdx = i
    for (let j = i; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j
    }
    // 交换 i 和 minIdx
    ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
  }
}

const arr = [3, 2, 5, 8, 7, 6, 1]
selectionSort(arr)
