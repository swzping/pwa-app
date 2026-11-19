/* eslint-disable max-len */
import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const CategoryIcon = props => (
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
      d="M22.5 12.5a3 3 0 100-6 3 3 0 000 6zm0 2.5a5.5 5.5 0 100-11 5.5 5.5 0 000 11zm-10 7.5a3 3 0 11-6 0 3 3 0 016 0zm2.5 0a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0zm7.5 3a3 3 0 100-6 3 3 0 000 6zm0 2.5a5.474 5.474 0 002.904-.828l.712.712a1.25 1.25 0 001.768-1.768l-.712-.712A5.5 5.5 0 1022.5 28zm-10-18.5a3 3 0 11-6 0 3 3 0 016 0zm2.5 0a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"
      clipRule="evenodd"
    />
  </Svg>
);

export default CategoryIcon;
