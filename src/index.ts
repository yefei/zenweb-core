import { Core } from './core';
import { SetupHelper } from './setup';
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
