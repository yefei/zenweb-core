# ZenWeb Core module

[ZenWeb](https://www.npmjs.com/package/zenweb)

ZenWeb Core Module - Module loader and Server

## 自定义模块入口样例代码

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
