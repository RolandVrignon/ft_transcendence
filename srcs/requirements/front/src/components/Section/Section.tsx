import React from "react";
import './Section.scss';
import TitleBlock from "../TitleBlock/TitleBlock";

type SectionProps = {
  titleBlockProps: TitleBlockProps;
}

function App() {
	return <Section titleBlockProps={sectionData.titleBlockProps} />;
}

export default App;

function Section(props: SectionProps) {
	const { titleBlockProps } = props;

	return (
	<div className="match-history">
		<div className="overlap-group1">
			<Separator />
			<TitleBlock>{titleBlockProps.children}</TitleBlock>
		</div>
	</div>
	);
}

function Separator() {
	return <div className="separator"></div>;
}

function TitleBlock(props) {
	const { children } = props;

	return (
		<div className="stats">
			<div className="overlap-group">
				<div className="background"></div>
				<h1 className="title valign-text-middle iceberg-normal-black-24px">
					{children}
				</h1>
			</div>
		</div>
	);
}

const titleBlockData = {
	children: "Match history",
};

const sectionData = {
	titleBlockProps: titleBlockData,
}
