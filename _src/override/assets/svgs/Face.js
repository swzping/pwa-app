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
      d="M24 26.37l-3.5.63 2 1.5c-1.635 1.453-4.31 2-6.4 2-1.998 0-4.997-.496-6.723-1.95l2.123-1.635L8 26.37C5.003 23.1 4 17.5 4.2 14.106c0-2.362.727-4.633 1.999-6.54l2.907.817-.818-3.088A11.843 11.843 0 0116.1 2.388c2.998 0 5.723 1.09 7.813 2.907l-.818 3.088 2.907-.817C27.274 9.473 28 11.653 28 14.106c0 4.394-.911 8.902-4 12.263z"
    />
    <Path
      stroke={props.color || '#969696'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="10"
      strokeWidth="1.5"
      d="M11.104 17.134c1.656 0 2.998-.814 2.998-1.817 0-1.004-1.342-1.817-2.998-1.817-1.655 0-2.998.813-2.998 1.817 0 1.003 1.343 1.817 2.998 1.817zM21.006 17.134c1.655 0 2.997-.814 2.997-1.817 0-1.004-1.342-1.817-2.997-1.817-1.656 0-2.998.813-2.998 1.817 0 1.003 1.342 1.817 2.998 1.817zM16.01 24.31c1.504 0 2.725-.53 2.725-1.182 0-.652-1.22-1.18-2.726-1.18-1.505 0-2.725.528-2.725 1.18 0 .652 1.22 1.181 2.725 1.181z"
    />
  </Svg>
);

export default Heart;
