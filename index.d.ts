import * as Koa from 'koa';

export type setupCallback = (core: Core, options?: any) => Promise<void>;

export declare class Core {
  constructor();
  koa: Koa;
  loaded: string[];
  defineContextCacheProperty(prop: string | number | symbol, get: (ctx: Koa.Context) => any): void;
  check(mod: string): Core;
  setup(mod: string | setupCallback, options?: any, name?: string): Core;
  setupAfter(callback: () => any | Promise<any>): Core;
  boot(): Promise<void>;
  listen(port?: number): void;
  start(port?: number): void;
}

declare module 'koa' {
  interface BaseContext {
    core: Core;
  }
}
