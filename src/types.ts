import { AsyncLocalStorage } from 'async_hooks';
import * as koa from 'koa';
import { Core } from './core';
import { SetupHelper } from './setup';

export type State = koa.DefaultState;

/**
 * 统一 Conext 实体，用于注入识别
 */
export class Context {
  constructor() {
    throw new TypeError('Context is used for injection description, cannot be initialized.');
  }
}

/**
 * Context 不再支持使用 `[key: string]: any` 容易引发运行时 bug，
 * 让 TS 编译时检查属性必须存在
 */
export interface Context extends koa.ParameterizedContext<State, koa.DefaultContextExtends> {
  core: Core;
}

declare module 'koa' {
  interface Context {
    core: Core;
  }
}

/**
 * 中间件方法
 */
export interface Middleware extends koa.Middleware<State, Context> {}

/**
 * 中间件下一步处理调用
 */
export type Next = koa.Next;

/**
 * koa 应用实例
 */
export interface Application extends koa<State, Context> {
  ctxStorage: AsyncLocalStorage<Context> | undefined;
  readonly currentContext: Context | undefined;
}

export interface CoreOption {
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
  proxyIpHeader?: string;

  /**
   * max ips read from proxy ip header, default to 0 (means infinity)
   */
  maxIpsCount?: number;

  /**
   * 是否启用 asyncLocalStorage
   * @default false
   */
  asyncLocalStorage?: boolean;
}

export type SetupFunction = (setup: SetupHelper) => void | Promise<void>;
export type SetupAfterFunction = () => void | Promise<void>;
export type SetupDestroyFunction = () => void | Promise<void>;

export interface LoadedModule {
  /**
   * 模块名称
   */
  name: string;

  /**
   * 模块安装函数
   */
  setup: SetupFunction;

  /**
   * 模块初始化位置信息，用于查错
   */
  location?: string;

  /**
   * setup 助手
   */
  helper: SetupHelper;
}
