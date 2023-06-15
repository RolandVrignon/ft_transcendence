import React from "react";
import SolidFrame from '../SolidFrame/SolidFrame'
import Title from '../Title/Title'
import './MainPage.scss'

type MainPageProps = {
	title: string;
	subtitle?: string;
	children?: React.ReactNode;
};

const MainPage: React.FC<MainPageProps> = ({
	title,
	subtitle,
	children,
	}) => {
	return (
	<SolidFrame
		frameClass="main-frame"
	>
		<Title txt1={title} txt2={subtitle} />
		{children}
	</SolidFrame>
	);
};

export default MainPage;
