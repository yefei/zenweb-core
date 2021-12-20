import { Core } from './core';
export { Core } from './core';
export * from './types';

declare module 'koa' {
  interface BaseContext {
    core: Core;
  }
}
