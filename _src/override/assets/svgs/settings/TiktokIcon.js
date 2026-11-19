import React from 'react';

import Svg, {Path} from 'react-native-svg';

const TiktokIcon = ({width = 23, height = 26, fill = '#222222', ...props}) => (
  <Svg width={width} height={height} viewBox="0 0 23 26" fill="none" {...props}>
    <Path d="M16.3286 0H11.9468V17.7101C11.9468 19.8203 10.2615 21.5536 8.16429 21.5536C6.06703 21.5536 4.38175 19.8203 4.38175 17.7101C4.38175 15.6377 6.02958 13.942 8.05195 13.8667V9.42031C3.59528 9.49563 0 13.1507 0 17.7101C0 22.3073 3.67018 26 8.20175 26C12.7333 26 16.4034 22.2696 16.4034 17.7101V8.62897C18.0513 9.83479 20.0736 10.5507 22.2083 10.5884V6.14203C18.9127 6.02899 16.3286 3.31594 16.3286 0Z" fill={fill}/>
  </Svg>
);


export default TiktokIcon;

