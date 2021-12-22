/**
 * 取得调用栈中位置信息，例如文件位置
 * @param stackIndex 第几层
 */
export function getStackLocation(stackIndex = 3) {
  const stack = new Error().stack.split('\n')[stackIndex];
  if (stack) {
    // Stack trace format :
    // https://v8.dev/docs/stack-trace-api
    return stack.slice(stack.indexOf('(') + 1, stack.lastIndexOf(')'));
  }
}
