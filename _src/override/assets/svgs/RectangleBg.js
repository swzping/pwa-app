import React from 'react';

import Svg, {Defs, LinearGradient, Path, Stop} from 'react-native-svg';

/**
 * LoyaltyCard 卡片的圆角渐变背景（米色系）
 * 替代原 Rectangle.svg
 */
const RectangleBg = props => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 351 119"
    fill="none"
    preserveAspectRatio="none"
    {...props}>
    <Defs>
      <LinearGradient
        id="rect_linear"
        x1="351"
        y1="14.1149"
        x2="-93"
        y2="96.6149"
        gradientUnits="userSpaceOnUse">
        <Stop offset="0.0196303" stopColor="#FE922F" />
        <Stop offset="0.475423" stopColor="#FEA33F" />
        <Stop offset="1" stopColor="#FCA638" />
      </LinearGradient>
    </Defs>
    <Path
      opacity={1}
      d="M0 12C0 5.37258 5.37258 0 12 0H167.677C171.619 0 175.403 1.55217 178.21 4.32071L187.794 13.7737C189.665 15.6194 192.188 16.6542 194.816 16.6542H339C345.627 16.6542 351 22.0268 351 28.6542V107C351 113.627 345.627 119 339 119H12C5.37258 119 0 113.627 0 107V12Z"
      fill="url(#rect_linear)"
      stroke="rgb(255, 211.65, 140.25)"
      strokeWidth={1}
    />
  </Svg>
);

export default RectangleBg;
