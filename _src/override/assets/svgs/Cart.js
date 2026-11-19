/* eslint-disable max-len */
import * as React from 'react';
import Svg, {G, Circle, Path} from 'react-native-svg';

const Cart = props => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={18.5} height={18.5} {...props}>
    <G
      data-name="2561279_cart_shopping_icon"
      transform="translate(-.25 -.25)"
      fill="none"
      stroke={props.color || '#fff'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}>
      <Circle
        data-name="Ellipse 133"
        cx={1.5}
        cy={1.5}
        r={1.5}
        transform="translate(5 15)"
      />
      <Circle
        data-name="Ellipse 134"
        cx={1.5}
        cy={1.5}
        r={1.5}
        transform="translate(14 15)"
      />
      <Path
        data-name="Path 513"
        d="M4.609 4.864H18l-1.3 6.483a1.545 1.545 0 0 1-1.545 1.244H6.989a1.545 1.545 0 0 1-1.545-1.345l-1.175-8.9A1.545 1.545 0 0 0 2.739 1H1"
      />
    </G>
  </Svg>
);

export default Cart;
