import { SetupHelper } from '../src/index';

interface MyModOption {}

/**
 * 模块安装入口
 * @param opt 模块自己的一些配置信息
 * @returns 必须返回一个函数，函数类型可以是 async
 */
export default function (opt?: MyModOption) {
  // 返回函数的名称将作为模块名称显示
  return function mymodname(setup: SetupHelper) {
    // setup.checkCoreProperty('aaaa');
    setup.defineCoreProperty('mymod', { value: 1 });
    setup.middleware(function mymiddleware(ctx, next) {
      return next();
    });
    setup.after(() => {
      // throw new Error('afdasdasdasd');
    });
  }
}