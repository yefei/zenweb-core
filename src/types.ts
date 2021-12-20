import { Core } from "./core";

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
  proxyIpHeader?: string;

  /**
   * max ips read from proxy ip header, default to 0 (means infinity)
   */
  maxIpsCount?: number;
}

export type SetupFunction = (core: Core, option?: any) => void | Promise<void>;
export type SetupAfterFunction = (core: Core) => void | Promise<void>;

export interface LoadedModule {
  name: string;
  setup?: SetupFunction;
  option?: any;
}
