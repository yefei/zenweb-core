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
export function $initCore(opt?: CoreOption) {
  if (globalThis.__zenweb_core) {
    throw new Error('Global @zenweb/core instance already exists.');
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
export function $getCore() {
  if (!globalThis.__zenweb_core) {
    throw new Error('Global @zenweb/core instance not exists.');
  }
  return globalThis.__zenweb_core;
}

/**
 * 取得当前请求上下文
 * @param force 默认 true 必须取得，如果无法取得则抛出异常
 */
export function $getContext(force?: true): Context | never;
export function $getContext(force: false): Context | undefined;
export function $getContext(force = true) {
  const ctx = $getCore().app.ctxStorage?.getStore();
  if (force && !ctx) {
    throw new Error('Context instance not exists.');
  }
  return ctx;
}

/**
 * 快捷方式: Core 实例
 */
export const $core = callProxy($getCore);

/**
 * 快捷方式: 当前请求上下文
 */
export const $ctx = callProxy<Context>($getContext);

// 带有调试信息的 debug

function _ctxDebugOutput(debug: Debugger, formatter: any, args: any[]) {
  if (!debug.enabled) return;
  const stack = getStackLocation(4);
  formatter = `${stack}\n${formatter}`;
  const ctx = $getContext(false);
  if (ctx) {
    formatter = `${ctx.method} ${$ctx.path}\n${formatter}`;
  }
  debug(formatter, ...args);
}

const _ctxDebug = createDebug('app');

/**
 * 带有请求信息(如果有的话)和所在行数的 debug 输出
 */
export function $debug(formatter: any, ...args: any[]) {
  _ctxDebugOutput(_ctxDebug, formatter, args);
}

/**
 * 是否启用
 */
$debug.enabled = _ctxDebug.enabled;

/**
 * 扩展 $debug 命名空间
 * @param namespace 命名
 * @param delimiter 分隔符，默认 :
 */
$debug.extend = function (namespace: string, delimiter?: string) {
  const debug = _ctxDebug.extend(namespace, delimiter);
  function output(formatter: any, ...args: any[]) {
    _ctxDebugOutput(debug, formatter, args);
  }
  output.enabled = debug.enabled;
  output.extend = function (_namespace: string) {
    return $debug.extend(namespace + (delimiter || ':') + _namespace);
  }
  return output as typeof $debug;
}
