import * as React from 'react';
import Svg, {G, Rect} from 'react-native-svg';

const Category = props => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} {...props}>
    <G fill="none" stroke={props.color || '#858585'} strokeWidth={1.5}>
      <G data-name="Rectangle 1001" transform="translate(11 11)">
        <Rect width={9} height={9} rx={3} stroke="none" />
        <Rect x={0.75} y={0.75} width={7.5} height={7.5} rx={2.25} />
      </G>
      <G data-name="Rectangle 1009" transform="translate(11)">
        <Rect width={9} height={9} rx={3} stroke="none" />
        <Rect x={0.75} y={0.75} width={7.5} height={7.5} rx={2.25} />
      </G>
      <G data-name="Rectangle 1007" transform="translate(0 11)">
        <Rect width={9} height={9} rx={3} stroke="none" />
        <Rect x={0.75} y={0.75} width={7.5} height={7.5} rx={2.25} />
      </G>
      <G data-name="Rectangle 1008">
        <Rect width={9} height={9} rx={3} stroke="none" />
        <Rect x={0.75} y={0.75} width={7.5} height={7.5} rx={2.25} />
      </G>
    </G>
  </Svg>
);

export default Category;
