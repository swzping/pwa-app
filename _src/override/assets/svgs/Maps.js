/* eslint-disable max-len */
import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const Maps = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}>
    <Path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.2}
      d="M7.5 5.625V12.5m5-5v6.875m.42 2.915 4.062-2.031a.937.937 0 0 0 .518-.839V4.017a.938.938 0 0 0-1.357-.839L12.92 4.79a.938.938 0 0 1-.838 0L7.919 2.71a.937.937 0 0 0-.838 0L3.018 4.74a.937.937 0 0 0-.518.84v10.403a.937.937 0 0 0 1.357.838L7.08 15.21a.938.938 0 0 1 .838 0l4.162 2.081a.938.938 0 0 0 .838 0Z"
    />
  </Svg>
);
export default Maps;
