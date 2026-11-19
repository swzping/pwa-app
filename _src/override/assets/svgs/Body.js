import * as React from 'react';
import Svg, {Path, G, Circle} from 'react-native-svg';

const Body = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
    {...props}>
    <G>
      <Path
        stroke={props.color || '#969696'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8.945 28.004c-6.886 0-6.268-6.18-6.445-9.004h27s.5 9-7 9.004c-7.5.004-5.502 0-5.502 0H8.945z"
      />
      <Path
        stroke={props.color || '#969696'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M8.415 28l-1.768 2.781M24.148 28l1.768 2.781"
      />
      <Path
        stroke={props.color || '#969696'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M1 19h30"
      />
      <Circle
        cx="18"
        cy="13"
        r="2.25"
        stroke={props.color || '#969696'}
        strokeWidth="1.5"
      />
      <Circle
        cx="23.5"
        cy="7.5"
        r="1.75"
        stroke={props.color || '#969696'}
        strokeWidth="1.5"
      />
      <Path
        stroke={props.color || '#969696'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M6 22.5c.5 2 1.5 2.5 4 2.5"
      />
      <Circle
        cx="19"
        cy="2"
        r="1.25"
        stroke={props.color || '#969696'}
        strokeWidth="1.5"
      />
    </G>
  </Svg>
);

export default Body;
