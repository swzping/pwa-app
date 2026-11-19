import React from 'react';
import Svg, {Defs, LinearGradient, Path, Stop} from 'react-native-svg';

const TaskListTabBg = props => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 252 59"
    fill="none"
    preserveAspectRatio="none"
    {...props}>
    <Defs>
      <LinearGradient
        id="task_tab_grad"
        x1="90.5"
        y1="0"
        x2="91"
        y2="70.5"
        gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#FFD38B" />
        <Stop offset="1" stopColor="#FF8200" />
      </LinearGradient>
    </Defs>
    <Path
      d="M0 0H235C244.389 0 252 7.61116 252 17V59H0V0Z"
      fill="url(#task_tab_grad)"
    />
  </Svg>
);

export default TaskListTabBg;
