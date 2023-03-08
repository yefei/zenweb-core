import { Debugger } from 'debug';
import { Core } from './core';
import { Context, Middleware, SetupAfterFunction, SetupDestroyFunction } from './types';
import { debug } from './util';

export const SETUP_AFTER = Symbol('zenweb#setupAfter');
export const SETUP_DESTROY = Symbol('zenweb#setupDestroy');

export class SetupHelper {
  /**
   * Core 实例
   */
  readonly core: Core;

  [SETUP_AFTER]: SetupAfterFunction;
  [SETUP_DESTROY]: SetupDestroyFunction;

  /**
   * 模块名称
   */
  readonly name: string;

  /**
   * 模块命名空间调试信息输出
   */
  readonly debug: Debugger;

  constructor(core: Core, name: string) {
    this.core = core;
    this.name = name;
    this.debug = debug.extend(name);
  }

  /**
   * 取得 Koa Application 实例
   */
  get app() {
    return this.core.app;
  }

  /**
   * 定义核心属性
   * @param prop 
   * @param attributes 
   * @returns 
   */
  defineCoreProperty(prop: PropertyKey, attributes: PropertyDescriptor) {
    if (prop in this.core) {
      throw new Error(`define core property [${String(prop)}] duplicated`);
    }
    this.debug('defineCoreProperty: %s', prop);
    Object.defineProperty(this.core, prop, attributes);
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
    Object.defineProperty(this.app.context, prop, attributes);
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
    Object.defineProperty(this.app.context, prop, {
      get() {
        if (this[CACHE] === undefined) {
          this[CACHE] = get(this) || null;
        }
        return this[CACHE];
      }
    });
  }

  private _checkContextPropertyExists(prop: PropertyKey) {
    if (prop in this.app.context) {
      throw new Error(`define context property [${String(prop)}] duplicated`);
    }
  }

  /**
   * 检查核心属性是否存在
   * @param prop 属性名称
   * @param msg 自定义错误信息
   */
  checkCoreProperty(prop: PropertyKey, msg?: string) {
    if (!(prop in this.core)) {
      throw new Error(msg || `check core property [${String(prop)}] miss`);
    }
  }

  /**
   * 检查上下文属性是否存在
   * @param prop 属性名称
   * @param msg 自定义错误信息
   */
  checkContextProperty(prop: PropertyKey, msg?: string) {
    if (!(prop in this.app.context)) {
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
    this.app.use(middleware);
  }
}
