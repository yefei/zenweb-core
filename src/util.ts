import Debug, { Debugger as _Debugger } from 'debug';

export type Debugger = _Debugger;

/**
 * zenweb debug
 */
export const debug = createDebug('zenweb');

/**
 * 创建一个 debug 对象
 * @param namespace 命名空间
 * @returns 
 */
export function createDebug(namespace: string): Debugger {
  return Debug(namespace);
}

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
    getPrototypeOf() {
      return Object.getPrototypeOf(call());
    },
    setPrototypeOf(target, v) {
      return Object.setPrototypeOf(call(), v);
    },
    isExtensible() {
      return Object.isExtensible(call());
    },
    preventExtensions() {
      return <any> Object.preventExtensions(call());
    },
    getOwnPropertyDescriptor(target, p) {
      return Object.getOwnPropertyDescriptor(call(), p);
    },
    defineProperty(target, property, attributes) {
      return <any> Object.defineProperty(call(), property, attributes);
    },
    has(target, p) {
      const ins = call();
      return p in ins;
    },
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
    set(target, p, newValue, receiver) {
      const ins = call();
      (<any>ins)[p] = newValue;
      return true;
    },
    deleteProperty(target, p) {
      const ins = call();
      return delete (<any>ins)[p];
    },
    ownKeys() {
      return Reflect.ownKeys(call());
    },
  });
}
