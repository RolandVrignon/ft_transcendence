import React from "react";
import "./SolidFrame.scss";

type SolidFrameProps = {
	frameClass?: string;
	fontSize?: string;
	borderColor?: string;
	backgroundColor?: string;
	borderRadius?: string;
	borderWidth?: string;
	width?: string | number; // Allow numbers for percentages
	height?: string | number; // Allow numbers for percentages
	txtClass?: string;
	txt1?: string;
	txt2?: string;
	children?: React.ReactNode;
	link?: string;
};

function SolidFrame({
		frameClass,
		borderColor = 'black',
		backgroundColor = 'transparent',
		borderRadius = '0px',
		borderWidth = '0px',
		width,
		height,
		txtClass,
		fontSize= '40px',
		txt1,
		txt2,
		link,
		children,
	}: SolidFrameProps) {

	return (
		<div
			className={`solid-frame ${frameClass}`}
			style={{
				borderColor,
				backgroundColor,
				borderRadius,
				borderWidth,
				borderStyle: 'solid',
				width: (typeof width === 'number') ? `${width}px` : width,
				height: (typeof height === 'number') ? `${height}px` : height,
			}}
		>
		{children}
			<div className={`text-content ${txtClass}`}>
				<p className='color1' style={{fontSize: fontSize}}>
					{txt1}
				</p>
				<p className='color2' style={{fontSize: fontSize}}>
					{link ? (
							<a href={link}>{txt2}</a>
						) : (
							<>{txt2}</>
						)
					}
				</p>
			</div>
		</div>
	);
}

export default SolidFrame;
