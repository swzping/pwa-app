import React from 'react';
import Svg, {Path} from 'react-native-svg';

const ErrorIcon = ({width = 18, height = 19}) => {
  // Split the long SVG paths into multiple parts for better readability
  const circlePath =
    'M9 18.5C13.9706 18.5 18 14.4706 18 9.5C18 4.52944 13.9706 0.5 9 0.5C4.02944 0.5 0 4.52944 0 9.5C0 14.4706 ' +
    '4.02944 18.5 9 18.5Z';

  const crossPath =
    'M12.8122 5.68774C12.3575 5.23297 11.6203 5.23312 11.1655 5.68774L8.9999 7.85338L6.83426 5.68774C6.37965 ' +
    '5.23297 5.6424 5.23297 5.18764 5.68774C4.73303 6.14235 4.73303 6.87959 5.18764 7.33436L7.35328 9.50014L5.18764 ' +
    '11.6659C4.73303 12.1205 4.73303 12.8578 5.18764 13.3125C5.64226 13.7673 6.3795 13.7672 6.83426 13.3125L8.9999 ' +
    '11.1469L11.1655 13.3125C11.6202 13.7673 12.3574 13.7673 12.8122 13.3125C13.2668 12.8579 13.2668 12.1207 ' +
    '12.8122 11.6659L10.6465 9.50014L12.8122 7.33436C13.2668 6.87974 13.2668 6.1425 12.8122 5.68774Z';

  return (
    <Svg width={width} height={height} viewBox="0 0 18 19" fill="none">
      <Path d={circlePath} fill="#E41305" />
      <Path d={crossPath} fill="white" />
    </Svg>
  );
};

export default ErrorIcon;
