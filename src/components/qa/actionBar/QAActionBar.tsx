import Edit from "@/components/common/actionBar/components/Edit";
import CustomActionBar from "@/components/common/actionBar/CustomActionBar";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import React from "react";
import QA from "./QA";
import { Button } from "@mui/material";
import { callAPI } from "@/utils/API/callAPI";
import { toast } from "react-toastify";
import ErrorLogs from "./ErrorLogs";

const QAActionBar = ({
  selectedRowsCount,
  selectedRows,
  selectedRowIds,
  selectedRowSubmissionIds,
  selectedRowId,
  selectedRowSubmissionId,
  onEdit,
  getQaItemList,
  onErrorLog,
  handleClearSelection,
  getOverLay,
}: any) => {
  const propsForActionBar = {
    selectedRowsCount,
    selectedRows,
    selectedRowIds,
    selectedRowSubmissionIds,
    selectedRowId,
    selectedRowSubmissionId,
    onEdit,
    getQaItemList,
    onErrorLog,
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

  const submitWorkItem = async () => {
    getOverLay?.(true);
    const params = {
      WorkitemSubmissionIds: selectedRowSubmissionIds,
    };
    const url = `${process.env.worklog_api_url}/workitem/quality/acceptworkitem`;
    const successCallback = (
      ResponseData: boolean | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("The task has been successfully submitted.");
        handleClearSelection();
        getQaItemList();
        getOverLay?.(false);
      } else if (ResponseStatus === "Warning") {
        toast.warning(ResponseData);
        handleClearSelection();
        getQaItemList();
        getOverLay?.(false);
      } else {
        getOverLay?.(false);
        getQaItemList();
        handleClearSelection();
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const SubmitButton = () => (
    <span className="pl-2 pr-2 cursor-pointer border-x-[1.5px] border-gray-300">
      <Button
        variant="outlined"
        className=" rounded-[4px] h-8 !text-[10px]"
        onClick={submitWorkItem}
      >
        Submit Task
      </Button>
    </span>
  );

  return (
    <div>
      <CustomActionBar {...propsForActionBar} isSmall={true}>
        <ConditionalComponent
          condition={
            hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs") &&
            selectedRowsCount === 1
          }
          className="text-slatyGrey"
          Component={Edit}
          propsForActionBar={{
            onEdit: onEdit,
            selectedRowId: selectedRowId,
            id: selectedRowSubmissionId,
          }}
        />

        {/* <ConditionalComponent
          condition={
            hasPermissionWorklog("", "ErrorLog", "QA") &&
            selectedRowsCount === 1
          }
          className=""
          Component={ErrorLogs}
          propsForActionBar={propsForActionBar}
        /> */}
        {/* <ConditionalComponentWithoutConditions
          className="text-slatyGrey"
          Component={QA}
          propsForActionBar={{
            selectedRowIds: selectedRowIds,
            handleClearSelection: handleClearSelection,
            getQaList: getQaItemList,
          }}
        /> */}

        <SubmitButton />
      </CustomActionBar>
    </div>
  );
};

export default QAActionBar;
