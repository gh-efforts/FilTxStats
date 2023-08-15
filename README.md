### 简介

### 待办事项

- [x] 项目框架搭建 01.12-01.13

- [x] 矿工管理（CRUD）01.29-01.30

- [x] 节点业务属性（CRUD）01.29-01.30

- [x] 节点统计（所有节点，遍历 lotus 接口）01.31-02.03

- [x] 节点列表（节点分页，遍历 lotus 接口）01.31-02.03

- [x] 节点的 owner、worker、control 地址（节点分页，遍历 lotus 接口）02.06-02.08

- [x] 业务地址（从 bank_monitor 中把业务地址导过来，钱包地址分页展示、统计所有钱包地址余额）02.09-02.10

- [x] 资金流转（lily 数据库查询、长短地址转换接口）02.13-02.17

- [x] 明细表（lily 数据库查询）02.20-02.21

- [x] 下载功能 02.22-02.24

- [x] 前后端联调 02.27-03.03

### Apps and Packages

- `insight`: a [Midwayjs](http://www.midwayjs.org/) server，向千里眼提供接口服务
- `insight-entity`: insight 服务数据库的 entity 文件
- `lily-entity`: lily 数据库的 entity 文件

### Script

- `dev_mode`: 将`packages`中的包的 package.json 文件的 main 与 types 字段指向 ts 文件。用于本地开发
- `build_mode`: 将`packages`中的包的 package.json 文件的 main 与 types 字段指向 js 文件。用于构建部署

### Build

To build all apps and packages, run the following command:

```
cd data-warehouse
npm run build_mode
npm run build
```

### Develop

To develop all apps and packages, run the following command:

```
cd data-warehouse
npm run dev_mode
npm run dev
```

### 打包服务为 docker 镜像

在根目录下运行

```shell
docker build -f ./apps/insight/DockerFile -t insight:1.0.0 .
```

### 目录视图

```js
data-warehouse
├─ .eslintrc.json
├─ .gitignore
├─ .prettierrc.js
├─ README.md
├─ apps
│  └─ insight        // 主服务，向前端提供接口服务
├─ package-lock.json
├─ package.json
├─ packages
│  ├─ insight-entity // insight 服务数据库的 entity 文件
│  └─ lily-entity    // lily 数据库的 entity 文件
│  └─ loga           // 封装所有调用loga服务的请求
├─ script
│  └─ dev_mode.js
│  └─ build_mode.js
└─ turbo.json
```
