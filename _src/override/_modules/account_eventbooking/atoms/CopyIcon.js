import * as React from 'react';

import Svg, {ClipPath, Defs,G, Path} from 'react-native-svg';

const Copy = props => {
  return (
    <Svg width="20" height="20" fill="none" viewBox="0 0 20 20" {...props}>
      <G clipPath="url(#a)">
        <Path
          stroke="#FF8200"
          d="M3.333 13.333c-.916 0-1.666-.75-1.666-1.666V3.333c0-.916.75-1.666 1.666-1.666h8.334c.916 0 1.666.75 1.666 1.666m-5 3.334h8.334c.92 0 1.666.746 1.666 1.666v8.334c0 .92-.746 1.666-1.666 1.666H8.333c-.92 0-1.666-.746-1.666-1.666V8.333c0-.92.746-1.666 1.666-1.666"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </G>
      <Defs>
        <ClipPath>
          <Path fill="#fff" d="M0 0h20v20H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default Copy;
