import * as Koa from 'koa';
import { CoreOption, SetupCallbak, LoadedModule, SetupAfterCallbak } from './types';
import { getStackLocation } from './util';

const KOA = Symbol('zenweb#koa');
const LOADED = Symbol('zenweb#loaded');
const START_TIME = Symbol('zenweb#startTime');
const SETUP_AFTER = Symbol('zenweb#setupAfter');
const CORE = Symbol('zenweb#core');
const STACK = Symbol('zenweb#stack');

export class SetupHelper {
  [CORE]: Core;
  [SETUP_AFTER]: SetupAfterCallbak;

  constructor(core: Core) {
    this[CORE] = core;
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
    Object.defineProperty(this[CORE], prop, attributes);
  }

  /**
   * 定义上下文附加属性
   * @param prop 
   * @param attributes 
   * @returns 
   */
  defineContextProperty(prop: PropertyKey, attributes: PropertyDescriptor) {
    if (prop in this[CORE].koa.context) {
      throw new Error(`define context property [${String(prop)}] duplicated`);
    }
    Object.defineProperty(this[CORE].koa.context, prop, attributes);
  }

  /**
   * 在 KOA.Context 中定义属性并缓存，当第一次调用属性时执行 get 方法，之后不再调用 get
   * @param prop 属性名称
   * @param get 第一次访问时回调
   */
  defineContextCacheProperty(prop: PropertyKey, get: (ctx: Koa.Context) => any) {
    const CACHE = Symbol('zenweb#contextCacheProperty');
    this.defineContextProperty(prop, {
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
  after(callback: SetupAfterCallbak) {
    this[SETUP_AFTER] = callback;
  }

  /**
   * 使用全局中间件
   */
  middleware(middleware: Koa.Middleware) {
    this[CORE].koa.use(middleware);
  }
}

export class Core {
  [START_TIME]: number = Date.now();
  [KOA]: Koa;
  [LOADED]: LoadedModule[] = [];

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
  setup(setup: SetupCallbak) {
    const stack = getStackLocation();
    this[LOADED].push({ setup, stack });
    return this;
  }

  /**
   * 启动所有模块代码
   */
  async boot() {
    const setupAfters: { callback: SetupAfterCallbak, stack: string }[] = [];
    // 初始化模块
    for (const { setup, stack } of this[LOADED]) {
      const helper = new SetupHelper(this);
      try {
        await setup(helper);
      } catch (err) {
        console.error(`setup module [${stack}]:`, err);
        process.exit(1);
      }
      if (helper[SETUP_AFTER]) {
        setupAfters.push({ callback: helper[SETUP_AFTER], stack });
      }
    }
    // 所有模块初始化完成后调用
    for (const { callback, stack } of setupAfters) {
      try {
        await callback();
      } catch (err) {
        console.error(`setup module after [${stack}]:`, err);
        process.exit(1);
      }
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
