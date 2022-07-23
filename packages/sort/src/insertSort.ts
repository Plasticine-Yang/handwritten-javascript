export default function insertSort(arr: number[]) {
  const n = arr.length
  // 假定前面的元素有序 将无序的元素逐个在有序的序列中找到正确的位置进行插入
  // 寻找的过程中要将元素往后移
  // 由于单个元素是有序的，所以从第 1 个元素开始遍历而不是第 0 个
  for (let i = 1; i < n; i++) {
    // j 从后往前遍历 找出正确的插入位置
    let j = i
    const curNum = arr[i]

    // 当前面的元素都比我大时 我需要继续前进寻找比我小或相等的元素
    while (j > 0 && arr[j - 1] > curNum) {
      // 每次前进都要把我前面的那个元素后移一位
      arr[j] = arr[j - 1]
      j--
    }

    // j 最后停在比我小的元素后面，只需要把我插到那里即可
    arr[j] = curNum
  }
}
