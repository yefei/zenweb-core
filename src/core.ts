import * as Koa from 'koa';
import * as http from 'http';
import { Debugger } from 'debug';
import { CoreOption, LoadedModule, SetupFunction } from './types';
import { debug, getStackLocation } from './util';
import { SetupHelper, SETUP_AFTER, SETUP_DESTROY } from './setup';

const KOA = Symbol('zenweb#koa');
const LOADED = Symbol('zenweb#loaded');
const START_TIME = Symbol('zenweb#startTime');
const SERVER = Symbol('zenweb#server');

export class Core {
  [START_TIME]: number = Date.now();
  [KOA]: Koa;
  [LOADED]: LoadedModule[] = [];
  [SERVER]: http.Server;
  debug: Debugger;
  private _stopping: boolean;

  constructor(option?: CoreOption) {
    this.debug = debug.extend('core');
    this[KOA] = new Koa(option);
    this[SERVER] = http.createServer(this[KOA].callback());
    this._init();
  }

  /**
   * 取得KOA实例
   */
  get koa() {
    return this[KOA];
  }

  /**
   * 取得 http.Server 实例
   */
  get server() {
    return this[SERVER];
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
    const location = getStackLocation();
    this.debug('module [%s] loaded', setup.name || location);
    this[LOADED].push({ setup, location, helper: new SetupHelper(this, setup.name) });
    return this;
  }

  /**
   * 启动所有模块代码
   */
  async boot() {
    // 初始化模块
    for (const { setup, helper, location } of this[LOADED]) {
      helper.debug('setup');
      try {
        await setup(helper);
      } catch (err) {
        console.error(`module [${helper.name}] (${location}) setup error:`, err);
        process.exit(1);
      }
      helper.debug('setup success');
    }
    // 所有模块初始化完成后调用
    for (const { helper, location } of this[LOADED]) {
      if (!helper[SETUP_AFTER]) {
        continue;
      }
      helper.debug('after');
      try {
        await helper[SETUP_AFTER]();
      } catch (err) {
        console.error(`module [${helper.name}] (${location}) setup after error:`, err);
        process.exit(1);
      }
      helper.debug('after success');
    }
    return this;
  }

  /**
   * 监听端口，默认 7001
   */
  listen(port?: number) {
    port = port || Number(process.env.PORT) || 7001;
    return new Promise<void>((resolve) => {
      this.server.listen(port, () => {
        console.log(`server on: %s`, port);
        resolve();
      });
    });
  }

  /**
   * 关闭端口监听
   */
  closeListen() {
    return new Promise<void>((resolve, reject) => {
      this.server.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  /**
   * 启动应用
   */
  async start(port?: number) {
    try {
      await this.boot();
      console.log('boot time: %o ms', Date.now() - this[START_TIME]);
      process.on('SIGINT', signal => this.stop(signal));
      process.on('SIGTERM', signal => this.stop(signal));
      await this.listen(port);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  /**
   * 停止应用
   */
  async stop(signal?: string | number) {
    console.log(`\nReceived stop signal: ${signal}`);

    if (this._stopping) return;
    this._stopping = true;

    console.log('server stopping...');
    
    // 停止监听
    await this.closeListen().catch(e => console.error('close listen error:', e));

    // 停止模块
    for (const { helper, location } of this[LOADED]) {
      if (!helper[SETUP_DESTROY]) {
        continue;
      }
      helper.debug('destroy');
      try {
        await helper[SETUP_DESTROY]();
        helper.debug('destroy success');
      } catch (err) {
        console.error(`module [${helper.name}] (${location}) destroy error:`, err);
      }
    }

    // 退出
    console.log('server stopped');
    process.exit(0);
  }
}
