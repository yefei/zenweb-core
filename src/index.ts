import { Core, SetupHelper } from './core';
export * from './types';
export { Next, Middleware } from 'koa';

export {
  Core,
  SetupHelper,
}

declare module 'koa' {
  interface DefaultContext {
    core: Core;
  }
}
