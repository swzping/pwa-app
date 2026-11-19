/* eslint-disable max-len */
import * as React from 'react';
import Svg, {Path, G} from 'react-native-svg';

const Hair = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
    {...props}>
    <G>
      <Path
        stroke={props.color || '#969696'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M26.509 5.48c1.692 1.135 1.45 2.569.95 3.435l-6.006-3.467-7.5 12.99 5.608 3.238c.24.138.319.442.147.658-.535.676-1.782 1.862-3.414.92l-3.62-2.091-4.25 7.361c-.557.964-1.795 1.851-3.259 1.006-1.54-.89-1.471-2.452-.915-3.415 4.496-7.45 13.695-22.721 14.183-23.566.585-1.013 1.63-.79 2.07-.537L26.51 5.48z"
      />
      <Path
        stroke={props.color || '#969696'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M20.29 8.24l5.67 3.274M18.79 10.838l5.67 3.273M17.29 13.435l5.67 3.274M15.79 16.034l5.67 3.274"
      />
      <Path
        fill={props.color || '#969696'}
        d="M7.28 27.865a1 1 0 11-1.731-1 1 1 0 011.732 1z"
      />
    </G>
  </Svg>
);

export default Hair;
