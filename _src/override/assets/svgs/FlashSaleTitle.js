/* eslint-disable max-len */
import * as React from 'react';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';

const FlashSaleTitle = props => (
  <Svg
    width={props.width || 200}
    height={props.height || 50}
    viewBox="0 0 200 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <G>
      {/* 背景渐变 */}
      <Path
        d="M0 0H200V50H0V0Z"
        fill="url(#paint0_linear_flashsale_title)"
      />
      {/* FLASHSALE 文字路径 - 基于原始 SVG 中的路径数据 */}
      <Path
        d="M20 15L25 35H30L35 15H30L27 28L24 15H20ZM40 15V35H45V15H40ZM50 15L55 35H60L65 15H60L57 28L54 15H50ZM70 15V35H75V15H70ZM80 15L85 35H90L95 15H90L87 28L84 15H80ZM100 15V35H105V15H100ZM110 15L115 35H120L125 15H120L117 28L114 15H110ZM130 15V35H135V15H130ZM140 15L145 35H150L155 15H150L147 28L144 15H140ZM160 15V35H165V15H160ZM170 15L175 35H180L185 15H180L177 28L174 15H170Z"
        fill="url(#paint1_linear_flashsale_text)"
        stroke="#FFFFFF"
        strokeWidth="0.5"
      />
    </G>
    <Defs>
      <LinearGradient
        id="paint0_linear_flashsale_title"
        x1="0"
        y1="0"
        x2="200"
        y2="50"
        gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#FF6B00" />
        <Stop offset="0.5" stopColor="#FF8200" />
        <Stop offset="1" stopColor="#FFA500" />
      </LinearGradient>
      <LinearGradient
        id="paint1_linear_flashsale_text"
        x1="20"
        y1="15"
        x2="185"
        y2="35"
        gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#FFFFFF" />
        <Stop offset="0.5" stopColor="#FFF8E1" />
        <Stop offset="1" stopColor="#FFFFFF" />
      </LinearGradient>
    </Defs>
  </Svg>
);

export default FlashSaleTitle;
