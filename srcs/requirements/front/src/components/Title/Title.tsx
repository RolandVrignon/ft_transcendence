import React from "react";
import SolidFrame from '../SolidFrame/SolidFrame'
import "./Title.scss"

type TitleProps = {
	txt_1: string;
	txt_2?: string;
};

const Title: React.FC<TitleProps> = ({
	txt_1,
	txt_2
	}) => {
		return (
			<SolidFrame
				className="title"
				height= "40px"
				width="40%"
				txt_1={txt_1}
				txt_2={txt_2}
			/>
	);
};

export default Title;
