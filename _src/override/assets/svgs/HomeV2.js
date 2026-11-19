/* eslint-disable max-len */
import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const HomeIcon = props => (
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
      d="M16.671 4.195a1.25 1.25 0 00-1.342 0l-11 7a1.25 1.25 0 001.342 2.11l.08-.05v10.448C5.75 26.076 7.652 28 10 28h12c2.346 0 4.25-1.924 4.25-4.297V13.254l.078.05a1.25 1.25 0 001.342-2.109l-11-7zm-2.67 15.055a2 2 0 014 0v5a1 1 0 01-1 1h-2a1 1 0 01-1-1v-5z"
      clipRule="evenodd"
    />
  </Svg>
);

export default HomeIcon;
