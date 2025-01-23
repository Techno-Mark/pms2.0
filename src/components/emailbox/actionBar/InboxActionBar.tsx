import CustomActionBar from "@/components/common/actionBar/CustomActionBar";
import React from "react";
import Priority from "./components/Priority";
import EmailType from "./components/EmailType";
import Status from "./components/Status";
import Assignee from "./components/Assignee";
import Tag from "./components/Tag";

const InboxActionBar = ({
  selectedRowsCount,
  selectedRows,
  selectedRowIds,
  selectedRowClientId,
  selectedRowEmailType,
  getData,
  handleClearSelection,
  getOverLay,
}: {
  selectedRowsCount: number;
  selectedRows: number[];
  selectedRowIds: number[];
  selectedRowClientId: number[];
  selectedRowEmailType: number[];
  getData: () => void;
  handleClearSelection: () => void;
  getOverLay?: (e: boolean) => void;
}) => {
  const propsForActionBar = {
    selectedRowsCount,
    selectedRows,
    selectedRowIds,
    selectedRowClientId,
    selectedRowEmailType,
    getData,
    handleClearSelection,
    getOverLay,
  };

  const ConditionalComponentWithoutConditions = ({
    Component,
    propsForActionBar,
    className,
    getOverLay,
  }: any) => (
    <span
      className={`pl-2 pr-2 cursor-pointer border-l-[1.5px] border-gray-300 ${className}`}
    >
      <Component {...propsForActionBar} getOverLay={getOverLay} />
    </span>
  );

  const ConditionalComponent = ({
    condition,
    className,
    Component,
    propsForActionBar,
    additionalBorderClass = "",
    getOverLay,
  }: any) =>
    condition ? (
      <span
        className={`pl-2 pr-2 cursor-pointer border-l-[1.5px] border-gray-300 ${additionalBorderClass} ${className}`}
      >
        <Component {...propsForActionBar} getOverLay={getOverLay} />
      </span>
    ) : null;

  function areAllValuesSame(arr: number[]) {
    return arr.every((value, index, array) => value === array[0]);
  }

  return (
    <div>
      <CustomActionBar small={true} {...propsForActionBar}>
        <ConditionalComponentWithoutConditions
          Component={EmailType}
          propsForActionBar={{
            selectedRowIds: selectedRowIds,
            selectedRowsCount: selectedRowsCount,
            getData: getData,
            handleClearSelection: handleClearSelection,
          }}
          getOverLay={getOverLay}
        />
        <ConditionalComponent
          condition={
            areAllValuesSame(selectedRowClientId) &&
            !selectedRowEmailType.includes(0)
          }
          Component={Assignee}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />
        <ConditionalComponentWithoutConditions
          Component={Priority}
          propsForActionBar={{
            selectedRowIds: selectedRowIds,
            selectedRowsCount: selectedRowsCount,
            getData: getData,
          }}
          getOverLay={getOverLay}
        />
        <ConditionalComponentWithoutConditions
          Component={Status}
          propsForActionBar={{
            selectedRowIds: selectedRowIds,
            selectedRowsCount: selectedRowsCount,
            getData: getData,
          }}
          getOverLay={getOverLay}
        />
        <ConditionalComponentWithoutConditions
          Component={Tag}
          className="border-r"
          propsForActionBar={{
            selectedRowIds: selectedRowIds,
            selectedRowsCount: selectedRowsCount,
            getData: getData,
          }}
          getOverLay={getOverLay}
        />
      </CustomActionBar>
    </div>
  );
};

export default InboxActionBar;
