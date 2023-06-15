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
	<div>
	<SolidFrame frameClass="window-frame" borderColor="red" > 
		<div>
			<SideBar />
		</div>
		<div>
			<SolidFrame
				frameClass="main-frame"
			>
				<div>
					<Title txt1={title} txt2={subtitle} />
				</div>
				<div>
					<SolidFrame frameClass="delimiter-frame" borderColor="blue">
						{children}
					</SolidFrame>
				</div>
			</SolidFrame>
		</div>
	</SolidFrame>
	</div>
	);
};

export default MainPage;
