/**
 * @file 切换项目为开发状态
 */

const fs = require('fs');
const path = require('path');

// 切换某个包的 package.json 文件为开发状态
async function changePackageJsonFileToDevMode(packageName) {
  const packageFilePath = path.resolve(
    __dirname,
    `../packages/${packageName}/package.json`
  );
  console.log(packageName);
  const packageFileContent = fs.readFileSync(packageFilePath).toString();
  const packageFileData = JSON.parse(packageFileContent);

  Object.assign(packageFileData, {
    main: 'index.ts',
    types: 'index.d.ts',
  });

  fs.writeFileSync(
    packageFilePath,
    JSON.stringify(packageFileData, null, 2) + '\n',
    {
      flag: 'w+',
    }
  );
}

// 切换所有包的 package.json 文件为开发状态
async function changeAllPackageJsonFileToDevMode() {
  const allPackages = fs.readdirSync(path.resolve(__dirname, `../packages`));

  for (const package of allPackages) {
    await changePackageJsonFileToDevMode(package);
  }
}

// 切换项目到开发状态
async function changeProjectToDevMode() {
  changeAllPackageJsonFileToDevMode();
}

changeProjectToDevMode();
