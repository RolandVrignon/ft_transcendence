import React, { ReactNode } from "react";
import "./SolidFrame.scss";

type SolidFrameProps = {
  className?: string;
  borderColor: string;
  backgroundColor: string;
  width: string;
  height: string;
  borderRadius: string;
};

function SolidFrame(props: SolidFrameProps) {
  const {
    className,
    borderColor,
    backgroundColor,
    width,
    height,
    borderRadius,
  } = props;

  return (
    <div
      className={`solid-frame ${className}`}
      style={{ borderColor, backgroundColor, width, height, borderRadius }}
    ></div>
  );
}

export default SolidFrame;
