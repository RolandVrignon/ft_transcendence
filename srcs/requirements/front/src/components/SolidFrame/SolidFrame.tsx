import React from "react";
import "./SolidFrame.scss";

type SolidFrameProps = {
	className?: string;
	txt_1?: string;
	txt_2?: string;
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
		className,
		txt_1,
		txt_2,
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
			className={`solid-frame ${className}`}
			style={{
				borderColor,
				backgroundColor,
				borderRadius,
				borderWidth,
				borderStyle: 'solid',
				width: (typeof width === 'number') ? `${width}%` : width,
				height: (typeof height === 'number') ? `${height}%` : height,
			}}
		>
		{children}
			<span className="text-content">
				<span className='grey' style={{fontSize: fontSize}}>
					<p>{txt_1}</p>
				</span>
				<span className='black' style={{fontSize: fontSize}}>
				{link ? (
						<a href={link}>{txt_2}</a>
					) : (
						<p>{txt_2}</p>
					)
				}
				</span>
			</span>
		</div>
	);
}

export default SolidFrame;
