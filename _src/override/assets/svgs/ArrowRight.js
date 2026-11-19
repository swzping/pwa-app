import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const ArrowRight = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 14 14"
    fill="none"
    {...props}>
    <Path
      d="M5.25 10.5L8.75 7L5.25 3.5"
      stroke={props.color || '#FF8200'}
      strokeWidth={props.strokeWidth || "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ArrowRight;

