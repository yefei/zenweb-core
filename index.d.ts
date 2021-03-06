import * as Koa from 'koa';

export type setupCallback = (core: Core, options?: any) => Promise<void>;

export interface CoreOptions {
  /**
   * Environment
   * default: development
   */
  env?: string;

  /**
   * Signed cookie keys
   */
  keys?: string[];

  /**
   * Trust proxy headers
   */
  proxy?: boolean;

  /**
   * Subdomain offset
   */
  subdomainOffset?: number;

  /**
   * proxy ip header, default to X-Forwarded-For
   */
  proxyIpHeader?: boolean;

  /**
   * max ips read from proxy ip header, default to 0 (means infinity)
   */
  maxIpsCount?: boolean;
}

export declare class Core {
  constructor(options?: CoreOptions);
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
