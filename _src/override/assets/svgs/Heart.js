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
      fill={props.color || '#858585'}
      fillRule="evenodd"
      d="M16 27c-.257 0-.514-.068-.737-.214C14.806 26.504 4 19.656 4 12.366 4 8.87 5.786 6.24 8.778 5.327c2.489-.756 5.358-.158 7.222 1.377 1.864-1.535 4.722-2.133 7.222-1.377C26.214 6.24 28 8.87 28 12.366c0 7.3-10.806 14.138-11.263 14.42-.223.135-.48.214-.737.214z"
      clipRule="evenodd"
    />
  </Svg>
);

export default Heart;
