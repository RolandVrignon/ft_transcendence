import React from "react";
import { NavLink } from 'react-router-dom';
import "./SolidFrame.scss";

type SolidFrameProps = {
	frameClass?: string;
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
		width,
		height,
		txtClass,
		txt1,
		txt2,
		link,
		children,
	}: SolidFrameProps) {

	return (
		<div
			className={`solid-frame ${frameClass}`}
			style={{
				width: (typeof width === 'number') ? `${width}px` : width,
				height: (typeof height === 'number') ? `${height}px` : height,
			}}
		>
		{children}
			<div className={`text-content ${txtClass}`}>
				<p className='color1' >
					{txt1}
				</p>
				<p className='color2' >
					{link ? (
							<NavLink to={link}>{txt2}</NavLink>
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
