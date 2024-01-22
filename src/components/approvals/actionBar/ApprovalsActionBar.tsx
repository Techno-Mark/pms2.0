import React from "react";
import { toast } from "react-toastify";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import {
  Accept,
  AcceptWithNotes,
  Status,
  Assignee,
  Reviewer,
  ErrorLogs,
  EditTime,
} from "./components/ActionBarComponents";
import CustomActionBar from "@/components/common/actionBar/CustomActionBar";

import {
  Edit,
  Priority,
  Comments,
} from "@/components/common/actionBar/components/ActionBarComponents";
import { callAPI } from "@/utils/API/callAPI";

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

const ApprovalsActionBar = ({
  selectedRowsCount,
  selectedRowStatusId,
  selectedRowIds,
  selectedWorkItemIds,
  selectedRowClientId,
  selectedRowWorkTypeId,
  settingSelectedId,
  id,
  workitemId,
  onEdit,
  onComment,
  reviewList,
  getReviewList,
  getInitialPagePerRows,
  handleClearSelection,
  getOverLay,
}: any) => {
  const isReviewer = reviewList
    .filter(
      (i: any) =>
        selectedWorkItemIds.includes(i.WorkitemId) &&
        i.ReviewerId == localStorage.getItem("UserId")
    )
    .map((i: any) => i.WorkitemId);

  const isNotReviewer = reviewList
    .filter(
      (i: any) =>
        selectedWorkItemIds.includes(i.WorkitemId) &&
        i.ReviewerId != localStorage.getItem("UserId")
    )
    .map((i: any) => i.WorkitemId);

  const acceptWorkitem = async (note: string, id: number[]) => {
    getOverLay(true);
    const params = {
      workitemSubmissionIds: id,
      comment: note ? note : null,
    };
    const url = `${process.env.worklog_api_url}/workitem/approval/acceptworkitem`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Selected tasks have been successfully approved.");
        handleClearSelection();
        getReviewList();
        getInitialPagePerRows();
        getOverLay(false);
      } else if (ResponseStatus === "Warning" && error === false) {
        toast.warning(ResponseData);
        handleClearSelection();
        getReviewList();
        getOverLay(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const propsForActionBar = {
    onEdit,
    workitemId,
    id,
    selectedRowIds,
    acceptWorkitem,
    selectedWorkItemIds,
    selectedRowStatusId,
    selectedRowsCount,
    handleClearSelection,
    getReviewList,
    reviewList,
    selectedRowClientId,
    selectedRowWorkTypeId,
    onComment,
    settingSelectedId,
  };

  return (
    <div>
      <CustomActionBar {...propsForActionBar}>
        <ConditionalComponent
          condition={
            hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs") &&
            selectedRowsCount === 1
          }
          className="text-slatyGrey"
          Component={Edit}
          propsForActionBar={{
            onEdit: onEdit,
            selectedRowId: workitemId,
            id: id,
          }}
        />
        <ConditionalComponent
          condition={
            hasPermissionWorklog("", "Approve", "Approvals") &&
            isNotReviewer.length === 0 &&
            isReviewer.length > 0
          }
          Component={Accept}
          propsForActionBar={propsForActionBar}
        />
        <ConditionalComponent
          condition={
            hasPermissionWorklog("", "Approve", "Approvals") &&
            selectedRowsCount === 1 &&
            isNotReviewer.length === 0 &&
            isReviewer.length > 0
          }
          Component={AcceptWithNotes}
          propsForActionBar={propsForActionBar}
        />

        <ConditionalComponentWithoutConditions
          Component={Priority}
          propsForActionBar={{
            selectedRowIds: selectedWorkItemIds,
            selectedRowStatusId: selectedRowStatusId,
            selectedRowsCount: selectedRowsCount,
            getData: getReviewList,
          }}
          getOverLay={getOverLay}
        />

        <ConditionalComponentWithoutConditions
          Component={Status}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />
        <ConditionalComponentWithoutConditions
          Component={Assignee}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />
        <ConditionalComponentWithoutConditions
          Component={Reviewer}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />

        <ConditionalComponent
          condition={
            hasPermissionWorklog("Comment", "View", "WorkLogs") &&
            selectedRowsCount === 1 &&
            isNotReviewer.length === 0 &&
            isReviewer.length > 0
          }
          className="pt-1"
          Component={Comments}
          propsForActionBar={{
            onComment: onComment,
            selectedRowId: workitemId,
          }}
        />

        <ConditionalComponent
          condition={
            hasPermissionWorklog("ErrorLog", "View", "WorkLogs") &&
            selectedRowsCount === 1 &&
            isNotReviewer.length === 0 &&
            isReviewer.length > 0
          }
          className=""
          Component={ErrorLogs}
          propsForActionBar={propsForActionBar}
        />

        <ConditionalComponent
          condition={
            hasPermissionWorklog("", "Approve", "Approvals") &&
            selectedRowsCount === 1 &&
            isNotReviewer.length === 0 &&
            isReviewer.length > 0
          }
          className=""
          Component={EditTime}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />
      </CustomActionBar>
    </div>
  );
};

export default ApprovalsActionBar;
