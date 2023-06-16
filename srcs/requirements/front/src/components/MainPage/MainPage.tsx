import React from "react";
import SideBar from "../SideBar/SideBar";
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
		frameClass="window-frame"
		borderColor="red" > 
			<SideBar />
			<SolidFrame
				frameClass="main-frame"
			>
					<Title txt1={title} txt2={subtitle} />
					<SolidFrame 
						frameClass="content-frame"
						borderRadius="0px"
						borderColor="transparent"
						backgroundColor="transparent">
							{children}
					</SolidFrame>
			</SolidFrame>
	</SolidFrame>
	);
};

export default MainPage;
