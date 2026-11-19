/* eslint-disable max-len */
import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const Building = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}>
    <Path
      stroke="#FF8200"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.2}
      d="M11.25 17.5v-6.25c0-.345.28-.625.625-.625h2.5c.345 0 .625.28.625.625v6.25m-3.75 0H1.967m9.283 0H15m0 0h3.033m-1.158 0V7.79M3.125 17.5V7.79m0 0A2.501 2.501 0 0 0 6.25 7.28a2.494 2.494 0 0 0 1.875.846c.747 0 1.417-.327 1.875-.846a2.494 2.494 0 0 0 1.875.846c.747 0 1.417-.327 1.875-.846a2.501 2.501 0 0 0 3.125.512m-13.75 0a2.503 2.503 0 0 1-.518-3.934l.991-.99a1.25 1.25 0 0 1 .884-.367h11.036c.331 0 .65.132.883.366l.991.991a2.5 2.5 0 0 1-.517 3.934M5.625 15H8.75c.345 0 .625-.28.625-.625V11.25a.625.625 0 0 0-.625-.625H5.625A.625.625 0 0 0 5 11.25v3.125c0 .345.28.625.625.625Z"
    />
  </Svg>
);
export default Building;
