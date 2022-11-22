import { Core, SetupHelper } from './core';
export * from './types';
export { Next } from 'koa';

export {
  Core,
  SetupHelper,
}

declare module 'koa' {
  interface DefaultContext {
    core: Core;
  }
}
