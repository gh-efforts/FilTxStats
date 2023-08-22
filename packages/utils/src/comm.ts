// 平均分割数组
export function splitArray<T>(baseArray: any[], n: number): T[][] {
  let length = baseArray.length;
  let sliceNum = length % n === 0 ? length / n : Math.floor(length / n + 1);
  let res = [];
  for (let i = 0; i < length; i += sliceNum) {
    let arr = baseArray.slice(i, i + sliceNum);
    res.push(arr);
  }
  return res;
}
