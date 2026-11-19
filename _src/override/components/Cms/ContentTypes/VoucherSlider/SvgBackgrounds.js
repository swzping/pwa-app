import React from 'react';
import Svg, {Path} from 'react-native-svg';

// 上半部分SVG背景 - 左下角和右下角有凹进去的半圆
export const TopSectionBackground = ({
  width = 220,
  height = 130,
  fill = '#FFFFFF',
}) => {
  const topPath =
    'M216 0C218.209 0 220 1.79086 220 4V125.667C217.581 125.667 215.564 127.528 215.101 130H4.89941C4.45261 ' +
    '127.616 2.56065 125.8 0.256836 125.674L0 125.667V4C0 1.79086 1.79086 0 4 0H216Z';

  return (
    <Svg width={width} height={height} viewBox="0 0 220 130" fill="none">
      <Path d={topPath} fill={fill} />
    </Svg>
  );
};

// 下半部分SVG背景 - 左上角和右上角有凹进去的半圆
export const BottomSectionBackground = ({
  width = 220,
  height = 30,
  fill = '#FFFFFF',
}) => {
  const bottomPath =
    'M215.101 0C215.035 0.323144 215 0.657495 215 1C215 3.76142 217.239 6 220 6V26C220 28.2091 218.209 30 216 ' +
    '30H4C1.79086 30 1.12746e-07 28.2091 0 26V5C2.76142 5 5 2.76142 5 0H215.101Z';

  return (
    <Svg width={width} height={height} viewBox="0 0 220 30" fill="none">
      <Path d={bottomPath} fill={fill} />
    </Svg>
  );
};
