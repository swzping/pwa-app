import React from 'react';
import {View} from 'react-native';

import Svg, {Path} from 'react-native-svg';

const ClearIcon = ({
  width = 14,
  height = 14,
  color = 'white',
  backgroundColor = '#ccc',
  marginTop = 8,
}) => {
  // Split the long SVG path into multiple parts for better readability
  const pathPart1 =
    'M4.53033 10.5303C4.23744 10.8232 3.76256 10.8232 3.46967 10.5303C3.17678 10.2374 3.17678 9.76256 ' +
    '3.46967 9.46967L5.93934 7L3.46967 4.53033C3.17678 4.23744 3.17678 3.76256 3.46967 3.46967C3.76256 3.17678 ' +
    '4.23744 3.17678 4.53033 3.46967L7 5.93934L9.46967 3.46967C9.76256 3.17678 10.2374 3.17678 10.5303 3.46967C' +
    '10.8232 3.76256 10.8232 4.23744 10.5303 4.53033L8.06066 7L10.5303 9.46967C10.8232 9.76256 10.8232 10.2374 ' +
    '10.5303 10.5303C10.2374 10.8232 9.76256 10.8232 9.46967 10.5303L7 8.06066L4.53033 10.5303Z';

  return (
    <View
      style={{
        width: width + 4,
        height: height + 4,
        borderRadius: (width + 4) / 2,
        backgroundColor: backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: marginTop,
      }}>
      <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d={pathPart1}
          fill={color}
        />
      </Svg>
    </View>
  );
};

export default ClearIcon;
