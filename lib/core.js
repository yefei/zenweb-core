import assert from 'node:assert';
import Debug from 'debug';
import Koa from 'koa';

const debug = Debug('zenweb:core');
const KOA = Symbol('zenweb#koa');
const LOADED = Symbol('zenweb#loaded');
const START_TIME = Symbol('zenweb#startTime');
const SETUP_AFTER = Symbol('zenweb#setupAfter');

export default class Core {
  constructor(options) {
    this[START_TIME] = Date.now();
    this[KOA] = new Koa(options);
    this[LOADED] = [];
    this[SETUP_AFTER] = [];
    this._init();
  }

  /**
   * 取得KOA实例
   * @returns {Koa}
   */
  get koa() {
    return this[KOA];
  }

  /**
   * 取得已载入模块列表
   * @returns {{ mod: string, name: string, option: any }[]}
   */
  get loaded() {
    return this[LOADED];
  }

  /**
   * 初始化
   * @private
   */
  _init() {
    Object.defineProperty(this.koa.context, 'core', { value: this });
  }

  /**
   * 在 KOA.Context 中定义属性并缓存，当第一次调用属性时执行 get 方法，之后不再调用 get
   * @param {string|number|symbol} prop 属性名称
   * @param {function(Koa.Context)} get 第一次访问时回调
   */
  defineContextCacheProperty(prop, get) {
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
   * @param {string} name 模块名
   * @throws {Error}
   * @returns {Core}
   */
  check(name) {
    assert(this[LOADED].findIndex(i => i.name === name) > -1, `module [${name}] must be setup`);
    return this;
  }

  /**
   * 安装模块
   * @param {string|((core: Core, option: *) => void)} mod 模块名称或模块引用
   * @param {*} [option] 模块配置项
   * @param {string} [name] 模块名称
   * @returns {Core}
   */
  setup(mod, option, name) {
    if (typeof mod !== 'string') {
      name = name || mod.name;
    } else {
      name = name || mod;
    }
    debug('setup module [%s] option: %o', name, option);
    this[LOADED].push({ name, mod, option });
    return this;
  }

  /**
   * 所有模块初始化完成后执行回调
   * @param {() => any | Promise<any>} callback
   */
  setupAfter(callback) {
    this[SETUP_AFTER].push(callback);
    return this;
  }

  /**
   * 初始化模块列表
   * @private
   */
  async _setupInit() {
    for (const { name, mod, option } of this[LOADED]) {
      let _mod = mod;
      if (typeof _mod === 'string') {
        try {
          _mod = await import(_mod);
        } catch (err) {
          console.error('load module [%s] error: %s', name, err);
          process.exit(1);
        }
      }
      if (typeof _mod === 'object') {
        _mod = _mod.setup;
        if (typeof _mod !== 'function') {
          console.error('module [%s] miss setup function', name);
          process.exit(1);
        }
      }
      try {
        await _mod(this, option);
      } catch (err) {
        throw new Error(`setup module [${name}] error: ${err}`);
      }
      debug('setup module [%s] success', name);
    }
    // 所有模块初始化完成
    for (const callback of this[SETUP_AFTER]) {
      await callback.apply(this);
    }
  }

  /**
   * @param {Koa.Middleware} middleware 
   * @returns 
   */
  use(middleware) {
    this.koa.use(middleware);
    return this;
  }

  /**
   * 启动所有模块代码
   */
  async boot() {
    await this._setupInit();
  }

  /**
   * 监听端口
   * @param {number} [port=7001] 
   */
  listen(port) {
    port = port || Number(process.env.PORT) || 7001;
    return this.koa.listen(port, () => {
      console.log(`server on: %s.`, port);
    });
  }

  /**
   * 启动应用并监听端口
   * @param {number} [port] 监听端口
   */
  start(port) {
    this.boot().then(() => {
      console.info('boot time: %o ms', Date.now() - this[START_TIME]);
      return this.listen(port);
    }, err => {
      console.error(err);
      process.exit(1);
    });
  }
}
