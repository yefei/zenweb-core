import * as koa from 'koa';
import { SetupHelper } from './core';

// 统一 Conext 实体并用于注入识别
export class Context {}
export interface Context extends koa.Context {}

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
}

export type SetupFunction = (setup: SetupHelper) => void | Promise<void>;
export type SetupAfterFunction = () => void | Promise<void>;

export interface LoadedModule {
  /**
   * 模块安装函数
   */
  setup: SetupFunction;

  /**
   * 模块名称
   */
  name: string;

  /**
   * 模块初始化位置信息，用于查错
   */
  stack: string;
}
