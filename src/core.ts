import * as assert from 'assert';
import Debug from 'debug';
import * as Koa from 'koa';
import { CoreOptions, LoadedModule, SetupAfterFunction, SetupFunction } from './types';

const debug = Debug('zenweb:core');
const KOA = Symbol('zenweb#koa');
const LOADED = Symbol('zenweb#loaded');
const START_TIME = Symbol('zenweb#startTime');
const SETUP_AFTER = Symbol('zenweb#setupAfter');

export class Core {
  [START_TIME]: number = Date.now();
  [KOA]: Koa;
  [LOADED]: LoadedModule[] = [];
  [SETUP_AFTER]: SetupAfterFunction[] = [];

  constructor(options?: CoreOptions) {
    this[KOA] = new Koa(options);
    this._init();
  }

  /**
   * 取得KOA实例
   */
  get koa() {
    return this[KOA];
  }

  /**
   * 取得已载入模块列表
   */
  get loaded() {
    return this[LOADED];
  }

  /**
   * 初始化
   */
  private _init() {
    Object.defineProperty(this.koa.context, 'core', { value: this });
  }

  /**
   * 在 KOA.Context 中定义属性并缓存，当第一次调用属性时执行 get 方法，之后不再调用 get
   * @param prop 属性名称
   * @param get 第一次访问时回调
   */
  defineContextCacheProperty(prop: PropertyKey, get: (ctx: Koa.Context) => any) {
    const CACHE = Symbol('zenweb#contextCacheProperty');
    Object.defineProperty(this.koa.context, prop, {
      get() {
        if (this[CACHE] === undefined) {
          this[CACHE] = get(this) || null;
        }
        return this[CACHE];
      }
    });
  }

  /**
   * 检查模块是否已经安装，没有安装抛出异常
   * @param name 模块名
   * @throws {Error}
   */
  check(name: string) {
    assert(this[LOADED].findIndex(i => i.name === name) > -1, `module [${name}] must be setup`);
    return this;
  }

  /**
   * 安装模块
   * @param nameOrFunction 模块名称或模块安装函数
   * @param option 模块配置项
   * @param name 模块名称
   */
  setup(nameOrFunction: string | SetupFunction, option?: any, name?: string) {
    if (typeof nameOrFunction === 'string') {
      name = name || nameOrFunction;
    } else {
      name = name || nameOrFunction.name;
      var setup = nameOrFunction;
    }
    debug('setup module [%s] option: %o', name, option);
    this[LOADED].push({ name, setup, option });
    return this;
  }

  /**
   * 所有模块初始化完成后执行回调
   */
  setupAfter(callback: SetupAfterFunction) {
    this[SETUP_AFTER].push(callback);
    return this;
  }

  /**
   * 初始化模块列表
   */
  private async _setupInit() {
    for (const { name, setup, option } of this[LOADED]) {
      let _setup = setup;
      if (!_setup) {
        try {
          var mod: { setup: SetupFunction } | SetupFunction = require(name);
        } catch (err) {
          console.error('load module [%s] error: %s', name, err);
          process.exit(1);
        }
      }
      if (typeof mod === 'object') { // module.exports = { setup: SetupFunction }
        _setup = mod.setup;
      } else if (typeof mod === 'function') { // module.exports = SetupFunction
        _setup = mod;
      }
      if (typeof _setup !== 'function') {
        console.error('module [%s] miss setup function', name);
        process.exit(1);
      }
      try {
        await _setup(this, option);
      } catch (err) {
        throw new Error(`init module [${name}] error: ${err}`);
      }
      debug('init module [%s] success', name);
    }
    // 所有模块初始化完成
    for (const callback of this[SETUP_AFTER]) {
      await callback(this);
    }
  }

  /**
   * 使用全局中间件
   */
  use(middleware: Koa.Middleware) {
    this.koa.use(middleware);
    return this;
  }

  /**
   * 启动所有模块代码
   */
  boot() {
    return this._setupInit();
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
