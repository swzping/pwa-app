import * as React from 'react';
import Svg, {Path, Rect} from 'react-native-svg';

const ScanIcon = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    fill="none"
    viewBox="0 0 28 28"
    {...props}>
    <Path
      fill={props.color || '#FF8200'}
      fillRule="evenodd"
      // eslint-disable-next-line max-len
      d="M7.25 3A4.25 4.25 0 0 0 3 7.25v1.5a1.25 1.25 0 1 0 2.5 0v-1.5c0-.966.784-1.75 1.75-1.75h1.5a1.25 1.25 0 1 0 0-2.5zm0 22A4.25 4.25 0 0 1 3 20.75v-1.5a1.25 1.25 0 1 1 2.5 0v1.5c0 .966.784 1.75 1.75 1.75h1.5a1.25 1.25 0 1 1 0 2.5zM25 7.25A4.25 4.25 0 0 0 20.75 3h-1.5a1.25 1.25 0 1 0 0 2.5h1.5c.966 0 1.75.784 1.75 1.75v1.5a1.25 1.25 0 1 0 2.5 0zM20.75 25A4.25 4.25 0 0 0 25 20.75v-1.5a1.25 1.25 0 1 0-2.5 0v1.5a1.75 1.75 0 0 1-1.75 1.75h-1.503a1.25 1.25 0 1 0 0 2.5z"
      clipRule="evenodd"
    />
    <Rect
      width="4"
      height="8"
      x="8"
      y="10"
      fill={props.color || '#FF8200'}
      rx="1"
    />
    <Rect
      width="2"
      height="8"
      x="14"
      y="10"
      fill={props.color || '#FF8200'}
      rx="1"
    />
    <Rect
      width="2"
      height="8"
      x="18"
      y="10"
      fill={props.color || '#FF8200'}
      rx="1"
    />
  </Svg>
);

export default ScanIcon;
