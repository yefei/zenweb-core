import { Core } from './core';
import { CoreOption, SetupFunction } from './types';

const CORE = Symbol.for('zenweb@core');

/**
 * 初始化全局 Core 实例
 * - 如果实例已经存在则抛出异常
 * - 全局实例默认启用 `asyncLocalStorage`
 */
export function initCore(opt?: CoreOption) {
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
  return getCore().app.ctxStorage?.getStore();
}

/**
 * 安装模块
 * @param setup 模块模块安装函数
 * @param name 自定义模块名称，不指定则取模块内置名称
 */
export function setup(setup: SetupFunction, name?: string) {
  return getCore().setup(setup, name);
}
