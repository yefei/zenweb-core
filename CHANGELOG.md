# Changelog

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
