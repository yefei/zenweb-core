import { Core, SetupHelper } from './core';
export * from './types';

export {
  Core,
  SetupHelper,
}

declare module 'koa' {
  interface DefaultContext {
    core: Core;
  }
}
