import React from 'react';

import {SvgXml} from 'react-native-svg';

/**
 * LoyaltyCard 二维码占位图
 * 路径较复杂，使用 SvgXml 保持原始 SVG 内容
 */
const xml = `<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.410592" y="0.410592" width="55.1788" height="55.1788" rx="4.58941" fill="#FFE7BA" stroke="#FFE7BA" stroke-width="0.821184"/>
</svg>
`;

const QrcodePlaceholder = ({width = 56, height = 56}) => (
  <SvgXml xml={xml} width={width} height={height} />
);

export default QrcodePlaceholder;
