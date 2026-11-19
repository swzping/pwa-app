import React from 'react';

import Svg, {Defs, LinearGradient, Path,Stop} from 'react-native-svg';

/**
 * 首页 NavBar 及 LoyaltyCard 的橙色渐变背景
 * 替代原 backGroundColor.svg（Android 上 SvgUri + resolveAssetSource 无效）
 */
const BackgroundGradient = props => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 375 196"
    fill="none"
    preserveAspectRatio="none"
    {...props}>
    <Defs>
      <LinearGradient
        id="bg_grad"
        x1="187.5"
        y1="0"
        x2="187.5"
        y2="196"
        gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#FF6F00" />
        <Stop offset="0.5" stopColor="#FF8200" />
        <Stop offset="1" stopColor="#FFEFD0" />
      </LinearGradient>
    </Defs>
    <Path d="M0 0H375V200H0V0Z" fill="url(#bg_grad)" />
  </Svg>
);

export default BackgroundGradient;
