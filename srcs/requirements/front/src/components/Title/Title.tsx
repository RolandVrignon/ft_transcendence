import React from "react";
import SolidFrame from '../SolidFrame/SolidFrame'
import "./Title.scss"

type TitleProps = {
	className?: string;
	txt1: string;
	txt2?: string;
};

const Title: React.FC<TitleProps> = ({
	className='title',
	txt1,
	txt2,
	}) => {
		// Define the height depending on text
		let fontSize = "24px";
		let fontSizeInt = parseInt(fontSize, 10);
		let height = (typeof txt2 === "undefined") ? (fontSizeInt + 6) : 2*(fontSizeInt + 6);
		// Define the width depending on the text length
		let width = Math.max(txt1.length, (txt2 ? txt2.length : 0))*fontSizeInt/2;
		console.log(width);
		return (
			<SolidFrame
				className={className}
				backgroundColor="white"
				height= {height}
				width={width}
				fontSize={fontSize}
				txt1={txt1}
				txt2={txt2}
			/>
	);
};

export default Title;
