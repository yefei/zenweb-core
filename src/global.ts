import { Core } from './core';
import { Context, CoreOption } from './types';
import { callProxy } from './util';

const CORE = Symbol.for('zenweb@core');

/**
 * 初始化全局 Core 实例
 * - 如果实例已经存在则抛出异常
 * - 全局实例默认启用 `asyncLocalStorage`
 */
export function initCore(opt?: CoreOption): Core | never {
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
export function getCore(): Core | never {
  if (!(CORE in global)) {
    throw new Error('Core instance not exists.');
  }
  //@ts-ignore
  return global[CORE];
}

/**
 * 取得当前请求上下文
 * @param force 默认 true 必须取得，如果无法取得则抛出异常
 */
export function getContext(force?: true): Context | never;
export function getContext(force: false): Context | undefined;
export function getContext(force = true) {
  const ctx = getCore().app.ctxStorage?.getStore();
  if (force && !ctx) {
    throw new Error('Context instance not exists.');
  }
  return ctx;
}

/**
 * 快捷方式: Core 实例
 */
export const $core = callProxy(getCore);

/**
 * 快捷方式: 当前请求上下文
 */
export const $ctx = callProxy<Context>(getContext);
