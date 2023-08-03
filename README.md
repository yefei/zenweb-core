# core - 核心

核心模块用于模块的加载与服务启动

## 依赖模块

无

## 配置项

| 配置项 | 类型 | 默认值 | 功能 |
| ----- | --- | ----- | ---- |
| env  | string | development | 执行环境，开发环境为 `development` 生产环境为 `production`，一般通过 NODE_ENV 环境变量指定
| keys | string[] | 无 | Cookie 签名密钥
| proxy | boolean | false | 信任代理头信息，例如前级为 Nginx 为了取得真实客户端 ip 地址需要设置为 `true`
| subdomainOffset | number | 无 | 子域名位置
| proxyIpHeader | string | X-Forwarded-For | 代理后客户端真实 ip 头字段名
| maxIpsCount | number | 0 | 多级代理后允许的 ip 数量，0 无限制

## Core 挂载项

| 挂载项 | 类型 | 功能 |
| ----- | --- | ---- |
| name | string | 应用名称，获取顺序: env.APP_NAME、hostname
| startTime | number | 启动时间: 毫秒时间戳
| app | Koa | 取得 Koa 实例
| loadedModules | LoadedModule[] | 已载入的模块
| server | Server | 取得 http.Server 实例
| debug | Debugger | core debug 方法

## Context 挂载项

| 挂载项 | 类型 | 功能 |
| ----- | --- | ---- |
| core | Core | Core 模块实例

## 全局方法

| 名称  | 功能 |
| ----- | ---- |
| initCore | 初始化全局 Core 对象
| getCore | 取得全局 Core 对象
| getContext | 取得当前请求上下文对象

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
