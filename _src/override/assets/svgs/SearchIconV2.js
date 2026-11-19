/* eslint-disable max-len */
import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const SearchIcon = props => (
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
      clipRule="evenodd"
      d="M23.5 15a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0zm-2.23 9.039A10.95 10.95 0 0115 26C8.925 26 4 21.075 4 15S8.925 4 15 4s11 4.925 11 11a10.96 10.96 0 01-2.847 7.385l3.73 3.731a1.25 1.25 0 01-1.767 1.768l-3.845-3.845z"
    />
  </Svg>
);
export default SearchIcon;
