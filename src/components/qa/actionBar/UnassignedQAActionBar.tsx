import CustomActionBar from "@/components/common/actionBar/CustomActionBar";
import React from "react";
import QA from "./QA";

const UnassignedQAActionBar = ({
  selectedRowIds,
  selectedRowsCount,
  handleClearSelection,
  getQaList,
}: any) => {
  const propsForActionBar = {
    selectedRowIds,
    handleClearSelection,
    selectedRowsCount,
    getQaList,
  };

  const ConditionalComponentWithoutConditions = ({
    Component,
    propsForActionBar,
    className,
    getOverLay,
  }: any) => (
    <span
      className={`pl-2 pr-2 cursor-pointer border-x border-gray-300 ${className}`}
    >
      <Component {...propsForActionBar} getOverLay={getOverLay} />
    </span>
  );

  return (
    <div>
      <CustomActionBar {...propsForActionBar} isSmall={true}>
        <ConditionalComponentWithoutConditions
          className="text-slatyGrey"
          Component={QA}
          propsForActionBar={{
            selectedRowIds: selectedRowIds,
            handleClearSelection: handleClearSelection,
            getQaList: getQaList,
          }}
        />
      </CustomActionBar>
    </div>
  );
};

export default UnassignedQAActionBar;
