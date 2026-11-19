/* eslint-disable max-len */
import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const Vertor = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={26}
    height={26}
    fill="none"
    viewBox="0 0 26 26"
    {...props}>
    <Path
      stroke={props.color || '#fff'}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.6 9.4L9.4 16.6M9.4 9.4L16.6 16.6M25 13C25 19.6274 19.6274 25 13 25C6.37258 25 1 19.6274 1 13C1 6.37258 6.37258 1 13 1C19.6274 1 25 6.37258 25 13Z"
    />
  </Svg>
);

export default Vertor;

