import React from 'react';

import Svg, {Path} from 'react-native-svg';

const XIcon = ({width = 48, height = 48, fill = '#222222', ...props}) => (
  <Svg width={width} height={height} viewBox="0 0 48 48" fill="none" {...props}>
    <Path fill-rule="evenodd" clip-rule="evenodd" d="M36 36L26.6145 22.0124L26.6305 22.0255L35.0929 12H32.265L25.3713 20.16L19.8968 12H12.4802L21.2425 25.0593L21.2414 25.0582L12 36H14.8279L22.4921 26.9215L28.5834 36H36ZM18.7763 14.1818L31.9449 33.8182H29.7039L16.5247 14.1818H18.7763Z" fill={fill}/>
  </Svg>
);

export default XIcon;
