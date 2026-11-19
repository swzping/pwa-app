import React from 'react';
import Svg, {Path} from 'react-native-svg';

const BrandsIcon = ({width = 20, height = 20, fill = '#222222', ...props}) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M4 3.5C4 2.6875 4.65625 2 5.5 2V3.5V15.8125L9.5625 12.9062C9.8125 12.7188 10.1562 12.7188 10.4375 12.9062L14.5 15.8125V3.5H5.5V2H14.5C15.3125 2 16 2.6875 16 3.5V17.25C16 17.5312 15.8438 17.8125 15.5938 17.9375C15.3438 18.0625 15.0312 18.0312 14.8125 17.875L10 14.4375L5.15625 17.875C4.9375 18.0312 4.65625 18.0625 4.40625 17.9375C4.15625 17.8125 4 17.5312 4 17.25V3.5Z"
      fill={fill}
    />
  </Svg>
);

export default BrandsIcon;

