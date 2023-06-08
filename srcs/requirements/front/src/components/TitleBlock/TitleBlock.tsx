import React, { ReactNode } from "react";
import './TitleBlock.scss'

function TitleBlock<T extends ReactNode>(props: TitleBlockProps<T>) {
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

export type TitleBlockProps<T extends ReactNode> = {
  children: T;
}

export default TitleBlock;
