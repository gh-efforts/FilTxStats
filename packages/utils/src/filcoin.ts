import * as dayjs from 'dayjs';
import { bigDiv } from 'happy-node-utils';

// 转换fil的金额
export function transferFilValue(
  value: string | number,
  format: number = 1e18
): string {
  return bigDiv(value, format).toString();
}

// 根据高度获取对应时间
export function getTimeByHeight(
  height: number,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  const timeStr = getTimeByHeightRaw(height).format(format);
  return timeStr;
}
export function getTimeByHeightRaw(height: number): dayjs.Dayjs {
  const timeStr = dayjs('2023-01-01 00:00:00').add(
    (height - 2473200) * 30,
    'second'
  );
  return timeStr;
}

// 根据时间获取对应高度
export function getHeightByTime(timeStr: string | Date) {
  const height =
    Math.floor(
      dayjs(timeStr).diff(dayjs('2023-01-01 00:00:00'), 'second') / 30
    ) + 2473200;
  return height;
}

export function getYesterdayTime() {
  const startAt = dayjs()
    .subtract(1, 'day')
    .startOf('day')
    .format('YYYY-MM-DD HH:mm:ss');

  const endAt = dayjs()
    .subtract(1, 'day')
    .endOf('day')
    .format('YYYY-MM-DD HH:mm:ss');

  return {
    startAt,
    endAt,
  };
}
