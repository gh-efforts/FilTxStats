import { bigDiv } from 'happy-node-utils';
import BigNumber from 'bignumber.js';
type BigElement = string | number | BigNumber;

export function convertToFil(a: BigElement): BigNumber {
  if (+a === 0) return new BigNumber(0);
  return new BigNumber(a).dividedBy(BigNumber(1e18));
}

// 转换为 PiB
export function convertPowerToPiB(a: BigElement): BigNumber {
  if (+a === 0) return new BigNumber(0);

  return new BigNumber(a).dividedBy(BigNumber(1024 ** 5));
}

// 转换为 EiB
export function convertPowerToEiB(a: BigElement): BigNumber {
  if (+a === 0) return new BigNumber(0);

  return new BigNumber(a).dividedBy(BigNumber(1024 ** 6));
}

export function unitB2Pib(num: string, length = 4) {
  const Kb = bigDiv(new BigNumber(num), 1024);
  const Mb = bigDiv(Kb, 1024);
  const Gb = bigDiv(Mb, 1024);
  const Tib = bigDiv(Gb, 1024);
  const Pib = bigDiv(Tib, 1024);
  return Pib.toFixed(length, BigNumber.ROUND_DOWN);
}

export function unitB2Tib(num: string, length = 4) {
  const Kb = bigDiv(new BigNumber(num), 1024);
  const Mb = bigDiv(Kb, 1024);
  const Gb = bigDiv(Mb, 1024);
  const Tib = bigDiv(Gb, 1024);
  return Tib.toFixed(length, BigNumber.ROUND_DOWN);
}
