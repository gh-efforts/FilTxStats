
/**
 * bruceService 历史数据处理
 * 
 * pg 导出的 insert 转化为 mysql 可导入的 sql
 * 用于处理 lily actors 历史数据
 * 
 */

const readLine = require('readline');
let path = require('path');
let fs = require('fs');



let rl = readLine.createInterface(
  fs.createReadStream(path.resolve('/Users/xz/Desktop/CMMI/actordt.sql'))
  , 
  // process.stdout
  // fs.createWriteStream(path.resolve)
  );

const id2addr = {
  'f01906216':	'f1khdd2v7il7lxn4zjzzrqwceh466mq5k333ktu7q',
  'f086971':	'f1m2swr32yrlouzs7ijui3jttwgc6lxa5n5sookhi',
  'f047684':	'f1ys5qqiciehcml3sp764ymbbytfn3qoar5fo3iwy'
}

const SH = 3484079;
const EH = 4535279;

// 小于 3484079 高度的最新余额
const beforeSHLatest = {
  'f01906216':	'4136530422469798531545538',
  'f086971':	'68936152543787523127605502',
  'f047684':	'63963159003977167436234334'
}

let map = new Map();
let addridheightMap = new Map();

function fo(str) {
  return str.trim().replace(/'/ig, '');
}

rl.on('line', async function (line) {
  // console.log('这是用户输入的内容：' + line);
  
  let urls = line.trim().split(/,|\(|\)/ig);

  let addressId = fo(urls[11]);
  let address = id2addr[fo(urls[11])];
  let height = fo(urls[17]);
  let balance = fo(urls[15]);
  let fill = 0;
  
  let sArr = map.get(addressId);
  if(!sArr) {
    sArr = [];
    map.set(addressId, sArr);
  }
  let item = {
    addressId,
    address,
    height,
    balance,
    fill,
  };
  sArr.push(item);
  addridheightMap.set(`${item.addressId}_${item.height}`, item);
});


rl.on('close', async function() {

  // process.exit(0); // 退出当前进程,会导致异步任务直接被关掉

  for(let [k,v] of map) {
    const filePath = path.join(__dirname, `${k}.sql`);
    const writableStream = fs.createWriteStream(filePath, { flags: 'a' });


    console.log(k, v.length);
    //按照 height 排序
    v.sort((a,b) => parseInt(a.height) - parseInt(b.height));
    let preb = beforeSHLatest[k];
    for(let i=SH; i<=EH; i++) {
      let cur = addridheightMap.get(`${k}_${i}`);
      if(cur) {
        preb = cur.balance;
        writableStream.write(`insert into actors(address_id, address, height, balance, fill, cid) values ('${k}', '${id2addr[k]}', '${i}', '${preb}', 0, '');\n`);
        continue;   //已经存在，不加
      }
      // v.push({
      //   addressId: k,
      //   address: id2addr[k],
      //   height: i,
      //   balance: preb,
      //   fill: 1,
      // });

      writableStream.write(`insert into actors(address_id, address, height, balance, fill, cid) values ('${k}', '${id2addr[k]}', '${i}', '${preb}', 1, '');\n`);
      if((i-SH)%10000 ==0) {
        console.log (i);
      }
    }



    writableStream.end(); // 确保所有数据都被写入
    writableStream.on('finish', () => {
      console.log('所有数据已写入文件');
    });
    writableStream.on('error', (err) => {
      console.error('写入文件时出错:', err);
    });
  }
});
