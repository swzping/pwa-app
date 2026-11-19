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
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="10"
      strokeWidth="2"
      d="M12.807 28.976c1.534.23 2.881-.842 3.411-2.3 1.741-4.784 1.741-9.488 1.741-9.488l-3.025-3.025s-4.582-.116-9.3 1.48c-1.655.561-2.78 2.164-2.423 3.876.995 4.786 5.362 8.822 9.596 9.457z"
    />
    <Path
      stroke={props.color || '#969696'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="10"
      strokeWidth="1.5"
      d="M5.5 23.409L8.5 21M8 26.2l3-2.665"
    />
    <Path
      stroke={props.color || '#969696'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="10"
      strokeWidth="2"
      d="M18 17.5l-3.401-3.4L25.162 3.996c1.123-1.184 2.687-1.389 3.65-.205 1.123 1.184.874 2.591-.25 3.606L18 17.5z"
    />
    <Path
      stroke={props.color || '#969696'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="10"
      strokeWidth="1.5"
      d="M19 10l3.025 3.025"
    />
  </Svg>
);

export default Heart;
