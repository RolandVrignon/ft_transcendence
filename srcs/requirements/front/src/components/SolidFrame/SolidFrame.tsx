import React from "react";
import "./SolidFrame.scss";

type SolidFrameProps = {
	className?: string;
	borderThickness: string;
	borderColor: string;
	backgroundColor: string;
	width: string;
	height: string;
	borderRadius: string;
	txt?: string;
};

function SolidFrame(props: SolidFrameProps) {
	const {
		className,
		borderThickness,
		borderColor,
		backgroundColor,
		width,
		height,
		borderRadius,
		txt,
	} = props;

	return (
		<div
			className={`solid-frame ${className}`}
			style={{
				borderColor,
				backgroundColor,
				width,
				height,
				borderRadius,
				borderWidth: borderThickness,
				borderStyle: 'solid'
			}}
		>
			<span className='text-content'>
				{txt}
			</span>
		</div>
	);
}

export default SolidFrame;
