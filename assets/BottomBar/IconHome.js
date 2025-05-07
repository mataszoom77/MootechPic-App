import * as React from "react";
import Svg, { Path } from "react-native-svg";

const IconHome = ({ width = 24, height = 24, color = "#000" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path d="M3.76929 9L12.4231 2L21.077 9V20C21.077 20.5304 20.8744 21.0391 20.5137 21.4142C20.1531 21.7893 19.6639 22 19.1539 22H5.69236C5.18233 22 4.69319 21.7893 4.33254 21.4142C3.9719 21.0391 3.76929 20.5304 3.76929 20V9Z" fill={color} />
  <Path d="M9.53851 22V12H15.3077V22" fill={color} />
  </Svg>
);

export default IconHome;
