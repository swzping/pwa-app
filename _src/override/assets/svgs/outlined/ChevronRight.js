/* eslint-disable max-len */
import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const ChevronRight = ({size = '1em', color = 'currentColor', ...props}) => (
  <Svg viewBox="0 0 16 17" width={16} height={17} fill="none" {...props}>
    <Path
      d="M11.516 7.055a.723.723 0 010 1.054l-4.5 4.5a.723.723 0 01-1.055 0 .723.723 0 010-1.054L9.92 7.57l-3.96-3.96a.723.723 0 010-1.055.723.723 0 011.055 0l4.5 4.5z"
      fill={color}
    />
  </Svg>
);

export default ChevronRight;
