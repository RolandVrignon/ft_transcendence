import React from "react";
import './TitleBlock.scss'

type TitleBlockProps = {
  children: React.ReactNode;
}

function TitleBlock(props: TitleBlockProps) {
	const { children } = props;

	return (
		<div className="title-block">
			<div className="orverlap-group">
				<div className="background">
				</div>
					<h2 className="title valign-text-middle iceberg-normal-black-24px">
					{children}
					</h2>
			</div>
		</div>
	);
}

export default TitleBlock;
