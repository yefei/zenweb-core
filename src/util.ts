import Debug from 'debug';

/**
 * debug
 */
export const debug = Debug('zenweb');

/**
 * 取得调用栈中位置信息，例如文件位置
 * @param stackIndex 第几层
 */
export function getStackLocation(stackIndex = 3) {
  const stack = new Error().stack?.split('\n')[stackIndex];
  if (stack) {
    // Stack trace format :
    // https://v8.dev/docs/stack-trace-api
    return stack.slice(stack.indexOf('(') + 1, stack.lastIndexOf(')'));
  }
}

/**
 * 调用代理
 * - 当对象中属性或方法被调用时通过 `call` 取得对象并返回被调用方法
 * @param call 返回对象实例
 */
export function callProxy<T extends object>(call: () => T) {
  return new Proxy({} as T, {
    //@ts-ignore
    get(target, p, receiver) {
      const ins = call();
      if (p in ins) {
        const _p: Function | unknown = (<any>ins)[p];
        if (typeof _p === 'function') {
          _p.bind(ins);
        }
        return _p;
      }
    },
    //@ts-ignore
    has(target, p) {
      const ins = call();
      return p in ins;
    },
  });
}
