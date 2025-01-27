import CustomActionBar from "@/components/common/actionBar/CustomActionBar";
import React from "react";
import Priority from "./components/Priority";
import EmailType from "./components/EmailType";
import Status from "./components/Status";
import Assignee from "./components/Assignee";
import Tag from "./components/Tag";
import { callAPI } from "@/utils/API/callAPI";
import { toast } from "react-toastify";
import { Button } from "@mui/material";
import AcceptTask from "@/assets/icons/AcceptTask";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";

const InboxActionBar = ({
  selectedRowsCount,
  selectedRows,
  selectedRowIds,
  selectedRowClientId,
  selectedRowEmailType,
  selectedRowAssignee,
  getData,
  handleClearSelection,
  getOverLay,
  tagDropdown,
  getTagDropdownData,
  getTabData,
  tab,
}: {
  selectedRowsCount: number;
  selectedRows: number[];
  selectedRowIds: number[];
  selectedRowClientId: number[];
  selectedRowEmailType: number[];
  selectedRowAssignee: number[];
  getData: () => void;
  handleClearSelection: () => void;
  getOverLay?: (e: boolean) => void;
  tagDropdown?: { label: string; value: string }[];
  getTagDropdownData?: () => void;
  getTabData?: () => void;
  tab: string;
}) => {
  const propsForActionBar = {
    selectedRowsCount,
    selectedRows,
    selectedRowIds,
    selectedRowClientId,
    selectedRowEmailType,
    selectedRowAssignee,
    getData,
    handleClearSelection,
    getOverLay,
    tagDropdown,
    getTagDropdownData,
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

  const submitWorkItem = async () => {
    getOverLay?.(true);
    const params = {
      TicketIds: selectedRowIds,
    };
    const url = `${process.env.emailbox_api_url}/emailbox/mailmove`;
    const successCallback = (
      ResponseData: boolean | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Task moved to inbox successfully.");
        handleClearSelection();
        getData();
        getTabData?.();
        getOverLay?.(false);
      } else if (ResponseStatus === "Warning") {
        toast.warning(ResponseData);
        handleClearSelection();
        getData();
        getOverLay?.(false);
      } else {
        getOverLay?.(false);
        handleClearSelection();
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const AcceptButton = () => (
    <span className="pl-2 pr-2 border-t-0 cursor-pointer border-b-0 border-x-[1.5px] border-gray-300">
      <ColorToolTip title="Accept" arrow>
        <div onClick={submitWorkItem}>
          <AcceptTask />
        </div>
      </ColorToolTip>
    </span>
  );

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
        <ConditionalComponent
          condition={!selectedRowAssignee.includes(0)}
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
            tagDropdown: tagDropdown,
            getTagDropdownData: getTagDropdownData,
          }}
          getOverLay={getOverLay}
        />
        {tab === "Approval" && <AcceptButton />}
      </CustomActionBar>
    </div>
  );
};

export default InboxActionBar;
