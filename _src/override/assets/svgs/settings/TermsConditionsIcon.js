import React from 'react';
import Svg, {Path} from 'react-native-svg';

const TermsConditionsIcon = ({width = 20, height = 20, fill = '#222222', ...props}) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M14 16.5C14.25 16.5 14.5 16.2812 14.5 16V7H12C11.4375 7 11 6.5625 11 6V3.5H6C5.71875 3.5 5.5 3.75 5.5 4V16C5.5 16.2812 5.71875 16.5 6 16.5H14ZM4 4C4 2.90625 4.875 2 6 2H11.1562C11.6875 2 12.1875 2.21875 12.5625 2.59375L15.4062 5.4375C15.7812 5.8125 16 6.3125 16 6.84375V16C16 17.125 15.0938 18 14 18H6C4.875 18 4 17.125 4 16V4Z"
      fill={fill}
    />
  </Svg>
);

export default TermsConditionsIcon;

