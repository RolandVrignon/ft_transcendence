import React from "react";
import "./SolidFrame.scss";

type SolidFrameProps = {
	frameClass?: string;
	txt1?: string;
	txt2?: string;
	fontSize?: string;
	borderColor?: string;
	backgroundColor?: string;
	borderRadius?: string;
	borderWidth?: string;
	width?: string | number; // Allow numbers for percentages
	height?: string | number; // Allow numbers for percentages
	children?: React.ReactNode;
	link?: string;
};

function SolidFrame({
		frameClass,
		txt1,
		txt2,
		fontSize= '32px',
		borderColor = 'black',
		backgroundColor = 'transparent',
		borderRadius = '10px',
		borderWidth = '1px',
		width,
		height,
		children,
		link
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
			<div className="text-content">
				<p>
					<span className='color1' style={{fontSize: fontSize}}>
						{txt1}
					</span>
				</p>
				<span className='color2' style={{fontSize: fontSize}}>
				{link ? (
						<a href={link}>{txt2}</a>
					) : (
						<p>{txt2}</p>
					)
				}
				</span>
			</div>
		</div>
	);
}

export default SolidFrame;
