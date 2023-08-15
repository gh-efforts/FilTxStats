# 简介

## 本地启动

```shell
npm run dev
```

## 目录结构

```js
insight
├─ .dockerignore
├─ .editorconfig
├─ .eslintrc.json
├─ .gitignore
├─ .mocharc.yml
├─ .turbo
├─ .vscode
│  ├─ launch.json
│  └─ settings.json
├─ DockerFile
├─ README.md
├─ bootstrap.js
├─ commitlint.config.js
├─ docker-compose.yaml
├─ package.json
├─ src
│  ├─ app
│  │  ├─ comm
│  │  │  ├─ crypto.ts
│  │  │  ├─ ipipfree.ipdb
│  │  │  ├─ myError.ts
│  │  │  ├─ page.ts
│  │  │  ├─ pathToRegexp.ts
│  │  │  ├─ redis.ts
│  │  │  └─ userContext.ts
│  │  ├─ constant							// 枚举文件目录
│  │  ├─ controller						// 路由及controller文件目录
│  │  │  └─ home.ts
│  │  ├─ mapping
│  │  │  ├─ lily							// lily数据库mapping文件目录
│  │  │  └─ insight						// insight数据库mapping文件目录
│  │  ├─ model
│  │  │  └─ dto
│  │  │     ├─ admin.ts
│  │  │     ├─ base.ts
│  │  │     ├─ class.ts
│  │  │     └─ user.ts
│  │  └─ service
│  │     ├─ filcoin						// fil相关业务处理文件目录（lily数据库、loga服务接口调用）
│  │     │   ├─ lily.ts				// 操作lily数据库
│  │     │   └─ loga.ts				// 调用loga服务
│  │     └─ insight						// insight业务处理目录
│  ├─ config
│  │  ├─ config.default.ts
│  │  ├─ config.local.ts
│  │  ├─ config.prod.ts
│  │  └─ config.unittest.ts
│  ├─ configuration.ts
│  ├─ core
│  │  ├─ baseController.ts
│  │  ├─ baseMapping.ts
│  │  └─ baseService.ts
│  ├─ filter
│  │  └─ notfound.ts
│  ├─ interface.ts
│  └─ middleware							// 中间件目录
│     ├─ accessLog.ts
│     ├─ format.ts
│     ├─ jwt.ts
│     └─ requestId.ts
├─ test
│  ├─ controller
│  │  ├─ home.test.ts
│  │  └─ user.test.ts
│  ├─ root.config.ts
│  ├─ root.hooks.ts
│  ├─ service
│  │  ├─ classroom.test.ts
│  │  └─ user.test.ts
│  └─ util
│     └─ index.ts
├─ tsconfig.json
└─ typings
   ├─ app
   │  ├─ extend
   │  │  └─ helper.d.ts
   │  └─ index.d.ts
   └─ config
      ├─ index.d.ts
      └─ plugin.d.ts

```
