import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

function Google(props) {
  return (
    <Svg
      width={21}
      height={20}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_1_1607)">
        <Path
          d="M20.49 10.187c0-.82-.069-1.417-.216-2.037H10.7v3.698h5.62c-.113.92-.725 2.303-2.084 3.233l-.02.124 3.028 2.292.21.02c1.926-1.738 3.037-4.296 3.037-7.33z"
          fill="#4285F4"
        />
        <Path
          d="M10.7 19.931c2.753 0 5.064-.886 6.753-2.414l-3.218-2.436c-.862.587-2.017.997-3.536.997a6.126 6.126 0 01-5.801-4.141l-.12.01-3.148 2.38-.041.112c1.677 3.256 5.122 5.492 9.11 5.492z"
          fill="#34A853"
        />
        <Path
          d="M4.897 11.937a6.008 6.008 0 01-.34-1.971c0-.687.125-1.351.33-1.971l-.007-.132-3.187-2.42-.104.05A9.79 9.79 0 00.5 9.965a9.79 9.79 0 001.088 4.473l3.308-2.502z"
          fill="#FBBC05"
        />
        <Path
          d="M10.7 3.853c1.914 0 3.206.809 3.943 1.484l2.878-2.746C15.753.985 13.453 0 10.699 0 6.711 0 3.266 2.237 1.59 5.492l3.297 2.503A6.152 6.152 0 0110.7 3.853z"
          fill="#EB4335"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1_1607">
          <Path fill="#fff" transform="translate(.5)" d="M0 0H20V20H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default Google
