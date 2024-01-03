import { Core } from './core';
import type { Context, CoreOption } from './types';
import { callProxy } from './util';

declare global {
  var __zenweb_core: Core;
}

/**
 * 初始化全局 Core 实例
 * - 如果实例已经存在则抛出异常
 * - 全局实例默认启用 `asyncLocalStorage`
 */
export function initCore(opt?: CoreOption) {
  if (globalThis.__zenweb_core) {
    throw new Error('Core instance already exists.');
  }
  return globalThis.__zenweb_core = new Core({
    asyncLocalStorage: true,
    ...opt,
  });
}

/**
 * 取得全局 Core 实例
 * - 如果无法取得则抛出异常
 */
export function getCore() {
  if (!globalThis.__zenweb_core) {
    throw new Error('Core instance not exists.');
  }
  return globalThis.__zenweb_core;
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
