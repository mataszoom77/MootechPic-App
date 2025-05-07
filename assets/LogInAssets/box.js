import * as React from "react"
import Svg, { Path } from "react-native-svg"

function Box(props) {
  return (
    <Svg
      width={20}
      height={17}
      viewBox="0 0 20 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M1.5.5H18a1 1 0 011 1V15a1 1 0 01-1 1H1.5a1 1 0 01-1-1V1.5a1 1 0 011-1z"
        stroke="#ADC81B"
      />
    </Svg>
  )
}

export default Box
