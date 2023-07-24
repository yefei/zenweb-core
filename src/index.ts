import { Core } from './core';
import { SetupHelper } from './setup';
import { CoreOption } from './types';
export * from './types';

export {
  Core,
  SetupHelper,
}

const CORE = Symbol.for('zenweb@core');

/**
 * 创建全局 Core 实例
 * - 如果实例已经存在则抛出异常
 * - 全局实例默认启用 `asyncLocalStorage`
 */
export function createCore(opt?: CoreOption) {
  if (CORE in global) {
    throw new Error('Core instance already exists.');
  }
  //@ts-ignore
  return global[CORE] = new Core({
    asyncLocalStorage: true,
    ...opt,
  });
}

/**
 * 取得全局 Core 实例
 * - 如果无法取得则抛出异常
 */
export function getCore(): Core {
  if (!(CORE in global)) {
    throw new Error('Core instance not exists.');
  }
  //@ts-ignore
  return global[CORE];
}

/**
 * 取得当前请求上下文
 */
export function getContext() {
  const core = getCore();
  return core.app.ctxStorage?.getStore();
}
