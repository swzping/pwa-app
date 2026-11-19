import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const ErrorIcon = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715
       2 12 2C17.5228 2 22 6.47715 22 12ZM12 13C11.4477 13 11 12.5523 11 12V8C11 7.44772
       11.4477 7 12 7C12.5523 7 13 7.44772 13 8V12C13 12.5523 12.5523 13 12 13ZM11 16C11
       16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12
       15C11.4477 15 11 15.4477 11 16Z"
      fill="#CC2B1E"
    />
  </Svg>
);

export default ErrorIcon;
