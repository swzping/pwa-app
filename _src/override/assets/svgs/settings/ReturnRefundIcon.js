import React from 'react';
import Svg, {Path} from 'react-native-svg';

const ReturnRefundIcon = ({width = 20, height = 20, fill = '#222222', ...props}) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M13.6875 4.5H10.75V7H15.125L14.1562 4.8125C14.0625 4.625 13.875 4.5 13.6875 4.5ZM15.5 8.5H4.5V15C4.5 15.2812 4.71875 15.5 5 15.5H15C15.25 15.5 15.5 15.2812 15.5 15V8.5ZM4.84375 7H9.25V4.5H6.28125C6.09375 4.5 5.90625 4.625 5.84375 4.8125L4.84375 7ZM13.6875 3C14.4688 3 15.1875 3.46875 15.5 4.1875L16.8125 7.125C16.9375 7.375 17 7.65625 17 7.9375V15C17 16.125 16.0938 17 15 17H5C3.875 17 3 16.125 3 15V7.9375C3 7.65625 3.03125 7.375 3.15625 7.125L4.46875 4.1875C4.78125 3.46875 5.5 3 6.28125 3H13.6875Z"
      fill={fill}
    />
  </Svg>
);

export default ReturnRefundIcon;

