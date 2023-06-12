import React from "react";
import "./SolidFrame.scss";

type SolidFrameProps = {
  className?: string;
  txt_1?: string;
  txt_2?: string;
  borderColor?: string;
  backgroundColor?: string;
  borderRadius?: string;
  borderWidth?: string;
  width?: string | number; // Allow numbers for percentages
  height?: string | number; // Allow numbers for percentages
};

function SolidFrame({
    className,
    txt_1,
    txt_2,
    borderColor = 'black',
    backgroundColor = 'transparent',
    borderRadius = '10px',
    borderWidth = '1px',
    width,
    height,
  }: SolidFrameProps) {

  return (
    <div
      className={`solid-frame ${className && " " + className}`}
      style={{
        borderColor, 
        backgroundColor, 
        borderRadius, 
        borderWidth,
        borderStyle: 'solid',
        width: typeof width === 'number' ? `${width}%` : width, 
        height: typeof height === 'number' ? `${height}%` : height, 
      }}
    >
			<span className="text-content">
				<span className='grey'>
				  {txt_1}
				</span>
				<span className='black'>
				  {txt_2}
				</span>
			</span>
    </div>
  );
}

export default SolidFrame;
