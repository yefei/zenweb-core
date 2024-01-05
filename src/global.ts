import { Core } from './core';
import { Context, CoreOption } from './types';
import { Debugger, callProxy, createDebug, getStackLocation } from './util';

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

/**
 * 带有 Context(如果有的话) 信息的 debug 输出
 */
export const $debug = createDebug('app');
const _origDebug = $debug.log;
$debug.log = function (...args) {
  const stack = getStackLocation();
  args.unshift(stack);
  const ctx = getContext(false);
  if (ctx) {
    args.unshift(`${ctx.method} ${$ctx.path}`);
  }
  console.log(...args);
};

/**
 * 带有 Context(如果有的话) 信息的 debug 输出
 */
/*
export function $debug(formatter: any, ...args: any[]) {
  const self = this || _ctxDebug;
  if (!self.enabled) return;
  const stack = getStackLocation();
  formatter = `${stack}\n${formatter}`;
  const ctx = getContext(false);
  if (ctx) {
    formatter = `${ctx.method} ${$ctx.path}\n${formatter}`;
  }
  self(formatter, ...args);
}
*/

/**
 * 扩展 $debug 命名空间
 * @param namespace 
 */
/*
$debug.extend = function (namespace: string, delimiter?: string) {
  const self = _ctxDebug.extend(namespace, delimiter);
  return $debug.bind(self);
}
*/
