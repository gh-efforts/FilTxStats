/**
 * @file 切换项目为编译状态
 */

const fs = require('fs');
const path = require('path');

// 切换某个包的 package.json 文件为编译模式
async function changePackageJsonFileToBuildMode(packageName) {
  const packageFilePath = path.resolve(
    __dirname,
    `../packages/${packageName}/package.json`
  );
  const packageFileContent = fs.readFileSync(packageFilePath).toString();
  const packageFileData = JSON.parse(packageFileContent);

  Object.assign(packageFileData, {
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
  });

  fs.writeFileSync(
    packageFilePath,
    JSON.stringify(packageFileData, null, 2) + '\n',
    {
      flag: 'w+',
    }
  );
}

// 切换所有包的 package.json 文件为编译模式
async function changeAllPackageJsonFileToBuildMode() {
  const allPackages = fs.readdirSync('../packages');

  for (const package of allPackages) {
    await changePackageJsonFileToBuildMode(package);
  }
}

// 切换项目到编译状态
async function changeProjectToBuildMode() {
  changeAllPackageJsonFileToBuildMode();
}

changeProjectToBuildMode();
