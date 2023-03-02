import { Debugger } from 'debug';
import { Core } from './core';
import { Context, Middleware, SetupAfterFunction, SetupDestroyFunction } from './types';
import { debug } from './util';

const CORE = Symbol('zenweb#core');
export const SETUP_AFTER = Symbol('zenweb#setupAfter');
export const SETUP_DESTROY = Symbol('zenweb#setupDestroy');

export class SetupHelper {
  [CORE]: Core;
  [SETUP_AFTER]: SetupAfterFunction;
  [SETUP_DESTROY]: SetupDestroyFunction;

  name: string;
  debug: Debugger;

  constructor(core: Core, name: string) {
    this[CORE] = core;
    this.name = name;
    this.debug = debug.extend(name);
  }

  /**
   * 取得Core实例
   */
  get core() {
    return this[CORE];
  }

  /**
   * 取得KOA实例
   */
  get koa() {
    return this[CORE].koa;
  }

  /**
   * 定义核心属性
   * @param prop 
   * @param attributes 
   * @returns 
   */
  defineCoreProperty(prop: PropertyKey, attributes: PropertyDescriptor) {
    if (prop in this[CORE]) {
      throw new Error(`define core property [${String(prop)}] duplicated`);
    }
    this.debug('defineCoreProperty: %s', prop);
    Object.defineProperty(this[CORE], prop, attributes);
  }

  private _checkContextPropertyExists(prop: PropertyKey) {
    if (prop in this[CORE].koa.context) {
      throw new Error(`define context property [${String(prop)}] duplicated`);
    }
  }

  /**
   * 定义上下文附加属性
   * @param prop 
   * @param attributes 
   * @returns 
   */
  defineContextProperty(prop: PropertyKey, attributes: PropertyDescriptor) {
    this._checkContextPropertyExists(prop);
    this.debug('defineContextProperty: %s', prop);
    Object.defineProperty(this[CORE].koa.context, prop, attributes);
  }

  /**
   * 在 Context 中定义属性并缓存，当第一次调用属性时执行 get 方法，之后不再调用 get
   * @param prop 属性名称
   * @param get 第一次访问时回调
   */
  defineContextCacheProperty(prop: PropertyKey, get: (ctx: Context) => any) {
    this._checkContextPropertyExists(prop);
    this.debug('defineContextCacheProperty: %s', prop);
    const CACHE = Symbol('zenweb#contextCacheProperty');
    Object.defineProperty(this[CORE].koa.context, prop, {
      get() {
        if (this[CACHE] === undefined) {
          this[CACHE] = get(this) || null;
        }
        return this[CACHE];
      }
    });
  }

  /**
   * 检查核心属性是否存在
   * @param prop 属性名称
   * @param msg 自定义错误信息
   */
  checkCoreProperty(prop: PropertyKey, msg?: string) {
    if (!(prop in this[CORE])) {
      throw new Error(msg || `check core property [${String(prop)}] miss`);
    }
  }

  /**
   * 检查上下文属性是否存在
   * @param prop 属性名称
   * @param msg 自定义错误信息
   */
  checkContextProperty(prop: PropertyKey, msg?: string) {
    if (!(prop in this[CORE].koa.context)) {
      throw new Error(msg || `check context property [${String(prop)}] miss`);
    }
  }

  /**
   * 所有模块初始化完成后执行回调
   */
  after(callback: SetupAfterFunction) {
    this[SETUP_AFTER] = callback;
  }

  /**
   * 销毁回调
   * 服务停止时会调用方法，等待方法完成
   */
  destroy(callback: SetupDestroyFunction) {
    this[SETUP_DESTROY] = callback;
  }

  /**
   * 使用全局中间件
   */
  middleware(middleware: Middleware) {
    this.debug('middleware: %s', middleware.name || '-');
    this[CORE].koa.use(middleware);
  }
}
