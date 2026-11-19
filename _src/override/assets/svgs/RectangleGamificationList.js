import React from 'react';

import Svg, {Defs, LinearGradient, Path, Stop} from 'react-native-svg';

const RectangleGamificationList = props => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 343 312"
    fill="none"
    preserveAspectRatio="none"
    {...props}>
    <Defs>
      <LinearGradient
        id="task_list_bg_grad"
        x1="171"
        y1="43.8795"
        x2="174.645"
        y2="448.999"
        gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#FFFFFF" />
        <Stop offset="1" stopColor="#FFFFFF" />
      </LinearGradient>
    </Defs>
    <Path
      d="M0 15C0 6.71573 6.71573 0 15 0L118.043 0C124.326 0 129.944 3.91607 132.117 9.81147L141.383 34.9454C143.556 40.8407 149.174 44.7568 155.457 44.7568H328C336.284 44.7568 343 51.4725 343 59.7568V397C343 405.284 336.284 412 328 412H15C6.71574 412 0 405.284 0 397V15Z"
      fill="url(#task_list_bg_grad)"
    />
  </Svg>
);

export default RectangleGamificationList;
