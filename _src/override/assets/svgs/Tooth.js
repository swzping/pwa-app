/* eslint-disable max-len */
import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const Heart = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
    {...props}>
    <Path
      stroke={props.color || '#969696'}
      strokeWidth="2"
      d="M4.693 8.91c1.874-4.967 7.655-3.98 10.311-2.865 1.094.458 1.831.277 2.344 0 4.016-2.176 9.15-.826 10.109 2.864 2.289 8.809-3.281 16.927-5.156 18.837-2.589 2.637-3.696.477-3.962-.69-.399-1.748-.256-1.698-.991-3.82-.203-.584-.671-1.093-1.406-.956-1.14.212-1.678 2.566-1.875 4.775-.128 1.433-.577 2.814-3.483 1.169C6.365 25.836 2.349 15.118 4.693 8.91z"
    />
    <Path
      stroke={props.color || '#969696'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M8.615 10.538c-.606.538-1.528 2.585-.364 6.462"
    />
  </Svg>
);

export default Heart;
