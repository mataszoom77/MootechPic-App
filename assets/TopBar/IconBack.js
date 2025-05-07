import * as React from "react";
import Svg, { Path } from "react-native-svg";

const IconBack = ({ width = 24, height = 24, color = "#000" }) => (
  <Svg width={width} height={height} viewBox="0 0 45 34" fill="none">
    <Path d="M26.5 8L17.7071 16.7929C17.3166 17.1834 17.3166 17.8166 17.7071 18.2071L26.5 27" fill={color} />
  </Svg>
);

export default IconBack;
