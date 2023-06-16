import React from "react";
import SolidFrame from '../SolidFrame/SolidFrame'
import "./Title.scss"

type TitleProps = {
	txt1: string;
	txt2?: string;
};

const Title: React.FC<TitleProps> = ({
	txt1,
	txt2,
	}) => {
		// Define the height depending on text
			let fontSize = "32px";
			let fontSizeInt = parseInt(fontSize, 10);
			let height = (typeof txt2 === "undefined") ? (fontSizeInt + 6) : 2*(fontSizeInt + 6);
		// Define the width depending on the text length
			let width = Math.max(txt1.length, (txt2 ? txt2.length : 0))*fontSizeInt/2;
			width = width < 150 ? 150 : width;
		return (
			<SolidFrame
				frameClass="title-frame"
				txtClass="text-title"
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
