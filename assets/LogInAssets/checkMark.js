import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SvgComponent(props) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M20.25 3.75H3.75a1.5 1.5 0 00-1.5 1.5v13.5a1.5 1.5 0 001.5 1.5h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5zm-.97 4.28l-9 9a.747.747 0 01-1.06 0l-3.75-3.75a.75.75 0 111.06-1.06l3.22 3.22 8.47-8.47a.75.75 0 111.06 1.06z"
        fill="#ADC81B"
      />
    </Svg>
  )
}

export default SvgComponent
