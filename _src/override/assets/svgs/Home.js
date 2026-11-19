/* eslint-disable max-len */
import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const Home = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={23.722}
    height={21.5}
    {...props}>
    <Path
      d="M11.861.75S4.988 6.683 1.15 9.897a1.157 1.157 0 0 0-.4.853 1.11 1.11 0 0 0 1.111 1.111h2.222v7.778a1.11 1.11 0 0 0 1.111 1.111h3.334a1.111 1.111 0 0 0 1.111-1.111v-4.445h4.444v4.444a1.111 1.111 0 0 0 1.111 1.112h3.333a1.11 1.11 0 0 0 1.111-1.111v-7.778h2.222a1.11 1.11 0 0 0 1.112-1.111 1.089 1.089 0 0 0-.426-.853C18.732 6.683 11.861.75 11.861.75Z"
      fill="none"
      stroke={props.color || '#858585'}
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </Svg>
);

export default Home;
