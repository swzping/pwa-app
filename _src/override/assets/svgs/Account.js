/* eslint-disable max-len */
import * as React from 'react';
import Svg, {G, Circle, Path} from 'react-native-svg';

const Account = props => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={19.2} height={20} {...props}>
    <G fill="none" strokeLinejoin="round">
      <G
        data-name="Ellipse 4"
        transform="translate(4)"
        stroke={props.color || '#858585'}
        strokeWidth={1.5}>
        <Circle cx={5.6} cy={5.6} r={5.6} stroke="none" />
        <Circle cx={5.6} cy={5.6} r={4.85} />
      </G>
      <G data-name="Path 7">
        <Path d="M9.6 10.4a9.6 9.6 0 0 1 9.6 9.6H0a9.6 9.6 0 0 1 9.6-9.6Z" />
        <Path
          d="M9.6 11.9c-3.954 0-7.255 2.848-7.96 6.6h15.92c-.705-3.752-4.006-6.6-7.96-6.6m0-1.5a9.6 9.6 0 0 1 9.6 9.6H0a9.6 9.6 0 0 1 9.6-9.6Z"
          fill={props.color || '#858585'}
        />
      </G>
    </G>
  </Svg>
);

export default Account;
