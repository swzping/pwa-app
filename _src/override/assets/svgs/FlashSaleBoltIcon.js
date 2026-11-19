import * as React from 'react';

import Svg, {Path} from 'react-native-svg';

/**
 * 变体缩略图角标：橙色闪电徽标，标记闪购变体。
 *
 * 徽标形状（16x16）按设计稿圆角：
 *   top-left 8 / top-right 0 / bottom-right 22.303 / bottom-left 22.303
 * 相邻圆角之和超过边长时，按 CSS border-radius 规则整体等比收缩，
 * 保证路径合法。
 */
const SIZE = 16;

const clampRadii = (w, h, tl, tr, br, bl) => {
  const scale = (a, b, len) => (a + b > len ? len / (a + b) : 1);
  const s = Math.min(
    scale(tl, tr, w),
    scale(tr, br, h),
    scale(br, bl, w),
    scale(bl, tl, h),
  );
  return {
    tl: tl * s,
    tr: tr * s,
    br: br * s,
    bl: bl * s,
  };
};

const roundedRectPath = (w, h, tl, tr, br, bl) => {
  const r = clampRadii(w, h, tl, tr, br, bl);
  return [
    `M0,${r.tl}`,
    `A${r.tl},${r.tl} 0 0 1 ${r.tl},0`,
    `L${w - r.tr},0`,
    `A${r.tr},${r.tr} 0 0 1 ${w},${r.tr}`,
    `L${w},${h - r.br}`,
    `A${r.br},${r.br} 0 0 1 ${w - r.br},${h}`,
    `L${r.bl},${h}`,
    `A${r.bl},${r.bl} 0 0 1 0,${h - r.bl}`,
    'Z',
  ].join(' ');
};

const BADGE_PATH = roundedRectPath(SIZE, SIZE, 8, 0, 22.303, 22.303);

const FlashSaleBoltIcon = ({width = SIZE, height = SIZE, ...props}) => (
  <Svg
    width={width}
    height={height}
    viewBox={`0 0 ${SIZE} ${SIZE}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path d={BADGE_PATH} fill="#FF8200" />
    <Path d="M9.4 2.4L4.8 9H7.3L6.6 13.6L11.2 7H8.7L9.4 2.4Z" fill="#FFD342" />
  </Svg>
);

export default FlashSaleBoltIcon;
