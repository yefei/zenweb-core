import * as Koa from 'koa';
import Debug, { Debugger } from 'debug';
import { CoreOption, LoadedModule, SetupFunction, SetupAfterFunction } from './types';
import { getStackLocation } from './util';

const debug = Debug('zenweb:core');
const KOA = Symbol('zenweb#koa');
const LOADED = Symbol('zenweb#loaded');
const START_TIME = Symbol('zenweb#startTime');
const SETUP_AFTER = Symbol('zenweb#setupAfter');
const CORE = Symbol('zenweb#core');

export class SetupHelper {
  [CORE]: Core;
  [SETUP_AFTER]: SetupAfterFunction;
  name: string;
  debug: Debugger;

  constructor(core: Core, name: string) {
    this[CORE] = core;
    this.name = name;
    this.debug = debug.extend('module:' + name);
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
   * 在 KOA.Context 中定义属性并缓存，当第一次调用属性时执行 get 方法，之后不再调用 get
   * @param prop 属性名称
   * @param get 第一次访问时回调
   */
  defineContextCacheProperty(prop: PropertyKey, get: (ctx: Koa.Context) => any) {
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
   * 使用全局中间件
   */
  middleware(middleware: Koa.Middleware) {
    this.debug('middleware: %s', middleware.name || '-');
    this[CORE].koa.use(middleware);
  }
}
export class Core {
  [START_TIME]: number = Date.now();
  [KOA]: Koa;
  [LOADED]: LoadedModule[] = [];
  [key: PropertyKey]: any;

  constructor(option?: CoreOption) {
    this[KOA] = new Koa(option);
    this._init();
  }

  /**
   * 取得KOA实例
   */
  get koa() {
    return this[KOA];
  }

  /**
   * 初始化
   */
  private _init() {
    Object.defineProperty(this.koa.context, 'core', { value: this });
  }

  /**
   * 安装模块
   * @param setup 模块模块安装函数
   */
  setup(setup: SetupFunction) {
    const stack = getStackLocation();
    const name = setup.name || stack;
    debug('module [%s] loaded', name);
    this[LOADED].push({ setup, stack, name });
    return this;
  }

  /**
   * 启动所有模块代码
   */
  async boot() {
    const setupAfters: { callback: SetupAfterFunction, stack: string, name: string }[] = [];
    // 初始化模块
    for (const { setup, stack, name } of this[LOADED]) {
      const helper = new SetupHelper(this, name);
      debug('module [%s] setup', name);
      try {
        await setup(helper);
      } catch (err) {
        console.error(`module [${setup.name}] (${stack}) setup error:`, err);
        process.exit(1);
      }
      if (helper[SETUP_AFTER]) {
        setupAfters.push({ callback: helper[SETUP_AFTER], stack, name });
      }
      debug('module [%s] setup success', name);
    }
    // 所有模块初始化完成后调用
    for (const { callback, stack, name } of setupAfters) {
      debug('module [%s] setup after', name);
      try {
        await callback();
      } catch (err) {
        console.error(`module [${name}] (${stack}) setup after error:`, err);
        process.exit(1);
      }
      debug('module [%s] setup after success', name);
    }
    return this;
  }

  /**
   * 监听端口，默认 7001
   */
  listen(port?: number) {
    port = port || Number(process.env.PORT) || 7001;
    return this.koa.listen(port, () => {
      console.log(`server on: %s.`, port);
    });
  }

  /**
   * 启动应用
   */
  start(port?: number) {
    return this.boot().then(() => {
      console.info('boot time: %o ms', Date.now() - this[START_TIME]);
      return this.listen(port);
    }, err => {
      console.error(err);
      process.exit(1);
    });
  }
}
