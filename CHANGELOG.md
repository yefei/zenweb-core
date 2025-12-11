# Changelog

## [5.2.1] - 2025-12-11
- $debug 功能支持直接显示对象

## [5.2.0] - 2025-12-10
- 模块安装支持加载顺序参数 `order`

## [5.1.0] - 2024-10-8
- ESM
- 使用 npm 管理

## [5.0.0] - 2024-9-19
- 规范 global 统一 $ 前缀

## [4.3.2] - 2024-7-8
- 服务关闭阻塞放到模块关闭后

## [4.3.1] - 2024-1-9
- 兼容新的 @types/koa ctxStorage

## [4.3.0] - 2024-1-5
- 新增 $debug 方法

## [4.2.2] - 2024-1-4
- util.zenwebDebug

## [4.2.0] - 2024-1-3
- util.createDebug

## [4.1.4] - 2024-1-3
- optionalDependencies

## [4.1.3] - 2024-1-3
- 规范 type

## [4.1.2] - 2023-11-21
- remove: callProxy console.log({ target })

## [4.1.1] - 2023-8-18
- 完善 callProxy 其他代理

## [4.1.0] - 2023-8-10
- 新增 callProxy 方法实现 $core $ctx 全局变量

## [4.0.0] - 2023-7-24
- 全局实例方式

## [3.6.0] - 2023-7-23
- 升级: koa@2.14.2 asyncLocalStorage

## [3.5.5] - 2023-3-27
- remove: tsconfig-base

## [3.5.4] - 2023-3-27
- fix: tsconfig-base

## 3.5.3
- tsconfig-base
- Context remove abstract

## 3.5.1
- null 检查

## 3.5.0
新增: Core.moduleExists
新增: SetupHelper.assertModuleExists
修改: Core.setup 方法增加 name 参数
删除: SetupHelper.checkCoreProperty
删除: SetupHelper.checkContextProperty

## 3.4.0
koa 版本锁定 2.13
Context 不再支持 [key: string]: any 定义
