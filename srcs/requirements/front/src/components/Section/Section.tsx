import React from "react";
import './Section.scss';
import TitleBlock, { TitleBlockProps } from "../TitleBlock/TitleBlock";

type SectionProps = {
  titleBlockProps: TitleBlockProps<string>;
}

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

const titleBlockData = {
  children: "Match history",
};

const sectionData = {
  titleBlockProps: titleBlockData,
};

export default Section;
