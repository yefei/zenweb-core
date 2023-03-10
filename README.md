# ZenWeb Core module

[ZenWeb](https://www.npmjs.com/package/zenweb)

自定义模块入口样例代码

```typescript
import { SetupFunction } from '@zenweb/core';

// 自定义模块配置项
export interface MyModOption {}

// 是否有 opt 参数或者其他参数由模块开发者自定义
export default function (opt?: MyModOption): SetupFunction {
  // 返回函数的名称将作为模块名称显示
  return function mymodname(setup) {}
}
```

## Changelog

### 3.5.1
- null 检查

### 3.5.0
新增: Core.moduleExists
新增: SetupHelper.assertModuleExists
修改: Core.setup 方法增加 name 参数
删除: SetupHelper.checkCoreProperty
删除: SetupHelper.checkContextProperty

### 3.4.0
koa 版本锁定 2.13
Context 不再支持 [key: string]: any 定义
