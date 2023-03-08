import * as Application from 'koa';
import { Server, createServer } from 'http';
import { hostname } from 'os';
import { CoreOption, LoadedModule, SetupFunction } from './types';
import { debug, getStackLocation } from './util';
import { SetupHelper, SETUP_AFTER, SETUP_DESTROY } from './setup';

export {
  Application,
}

export class Core {
  /**
   * 取得应用名称
   * 获取顺序: env.APP_NAME || hostname
   */
  readonly name = process.env.APP_NAME || hostname();

  /**
   * 启动时间: 毫秒时间戳
   */
  readonly startTime: number = Date.now();

  /**
   * 取得 Koa Application 实例
   */
  readonly app: Application;

  /**
   * 已载入的模块
   */
  readonly loadedModules: LoadedModule[] = [];

  /**
   * 取得 http.Server 实例
   */
  readonly server: Server;

  /**
   * core debug 信息打印
   */
  readonly debug = debug.extend('core');

  /**
   * 应用是否正在停止中
   */
  private _stopping = false;

  constructor(option?: CoreOption) {
    this.app = new Application(option);
    Object.defineProperty(this.app.context, 'core', { value: this });
    this.server = createServer(this.app.callback());
  }

  /**
   * 安装模块
   * @param setup 模块模块安装函数
   */
  setup(setup: SetupFunction) {
    const location = getStackLocation();
    this.debug('module [%s] loaded', setup.name || location);
    this.loadedModules.push({ setup, location, helper: new SetupHelper(this, setup.name) });
    return this;
  }

  /**
   * 启动所有模块代码
   */
  async boot() {
    // 初始化模块
    for (const { setup, helper, location } of this.loadedModules) {
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
    for (const { helper, location } of this.loadedModules) {
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
        console.log('server on:', port);
        resolve();
      });
    });
  }

  /**
   * 关闭端口监听
   */
  closeListen() {
    return new Promise<void>((resolve, reject) => {
      if (!this.server.listening) {
        return resolve();
      }
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
      console.log('boot time: %o ms', Date.now() - this.startTime);
      await this.listen(port);
      this._signalReceiver();
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  /**
   * 进程型号接收处理
   */
  private _signalReceiver() {
    process.on('SIGTERM', signal => this.stop(signal));
    process.on('SIGINT', signal => this.stop(signal));

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.on('data', data => {
        if (data[0] === 3) { // Ctrl+C
          process.stdin.setRawMode(false);
          process.stdin.destroy();
          this.stop('SIGINT');
        }
      });
      console.log('press Ctrl+C to stop server');
    }
  }

  /**
   * 停止应用
   */
  async stop(signal?: string | number) {
    console.log(`received stop signal: ${signal}`);

    if (this._stopping) {
      console.error('force exit');
      // 再次收到退出信号，走强制退出流程并打印未关闭的资源
      if ((<any>process).getActiveResourcesInfo) {
        console.error('active resources:', (<any>process).getActiveResourcesInfo());
      }
      process.exit(1);
    }
    this._stopping = true;

    // 停止监听
    console.log('close listen...');
    await this.closeListen().catch(e => console.error('close listen error:', e));

    // 停止模块
    console.log('destroy modules...');
    for (const { helper, location } of this.loadedModules.reverse()) {
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
  }
}
