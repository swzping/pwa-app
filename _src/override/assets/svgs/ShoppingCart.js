/* eslint-disable max-len */
import * as React from 'react';
import Svg, {G, Path} from 'react-native-svg';

const ShoppingCart = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={21.505}
    height={21.5}
    {...props}>
    <G
      data-name="Shopping Cart"
      fill="none"
      stroke={props.color || '#858585'}
      strokeWidth={1.5}>
      <Path
        data-name="Path 569"
        d="M15.37 20.75H6.136a4.055 4.055 0 0 1-4.039-3.436L.766 8.174A1.255 1.255 0 0 1 2.025 6.75h17.456a1.256 1.256 0 0 1 1.259 1.424l-1.331 9.14a4.055 4.055 0 0 1-4.039 3.436Z"
      />
      <Path
        data-name="Path 570"
        d="M6.754 10.75v-6a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v6"
        strokeLinecap="round"
      />
    </G>
  </Svg>
);

export default ShoppingCart;
