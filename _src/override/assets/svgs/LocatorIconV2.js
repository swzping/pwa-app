/* eslint-disable max-len */
import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const LocatorIcon = props => {
  const color = props.color || '#858585';
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="none"
      viewBox="0 0 32 32"
      {...props}>
      <Path
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fillRule="evenodd"
        d="M23.5 14c0 3.164-1.597 6.093-3.608 8.328-.991 1.1-2.021 1.962-2.872 2.53a6.977 6.977 0 01-1.02.579 6.977 6.977 0 01-1.02-.58c-.85-.567-1.88-1.428-2.872-2.53C10.097 20.094 8.5 17.165 8.5 14a7.5 7.5 0 0115 0zm2.5 0c0 8-8 14-10 14S6 22 6 14C6 8.477 10.477 4 16 4s10 4.477 10 10zm-10 3a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    </Svg>
  );
};

export default LocatorIcon;
