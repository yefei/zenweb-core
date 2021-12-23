import { SetupHelper } from './core';

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
