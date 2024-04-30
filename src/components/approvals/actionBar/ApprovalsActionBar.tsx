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
import Reject from "./components/Reject";
import { ApprovalsActionBarData, List } from "@/utils/Types/approvalsTypes";

interface ConditionalComponentWithoutConditions {
  Component: any;
  propsForActionBar: {
    selectedRowIds: number[] | [];
    selectedRowsCount: number;
    getData: () => void;
  };
  getOverLay?: (e: boolean) => void;
}

interface ConditionalComponent {
  condition?: any;
  className?: string;
  Component?: any;
  propsForActionBar?: any;
  getOverLay?: (e: boolean) => void;
}

const ConditionalComponentWithoutConditions = ({
  Component,
  propsForActionBar,
  getOverLay,
}: ConditionalComponentWithoutConditions) => (
  <span className={`pl-2 pr-2 cursor-pointer border-l-[1.5px] border-gray-300`}>
    <Component {...propsForActionBar} getOverLay={getOverLay} />
  </span>
);

const ConditionalComponent = ({
  condition,
  className,
  Component,
  propsForActionBar,
  getOverLay,
}: ConditionalComponent) =>
  condition ? (
    <span
      className={`pl-2 pr-2 cursor-pointer border-l-[1.5px] border-gray-300 ${className}`}
    >
      <Component {...propsForActionBar} getOverLay={getOverLay} />
    </span>
  ) : null;

const ApprovalsActionBar = ({
  selectedRowsCount,
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
}: ApprovalsActionBarData) => {
  const isReviewer = reviewList
    .filter(
      (i: List) =>
        selectedWorkItemIds.includes(i.WorkitemId) &&
        i.ReviewerId == Number(localStorage.getItem("UserId"))
    )
    .map((i: List) => i.WorkitemId);

  const isNotReviewer = reviewList
    .filter(
      (i: List) =>
        selectedWorkItemIds.includes(i.WorkitemId) &&
        i.ReviewerId != Number(localStorage.getItem("UserId"))
    )
    .map((i: List) => i.WorkitemId);

  const acceptWorkitem = async (note: string, id: number[]) => {
    getOverLay?.(true);
    const params = {
      workitemSubmissionIds: id,
      comment: note ? note : null,
    };
    const url = `${process.env.worklog_api_url}/workitem/approval/acceptworkitem`;
    const successCallback = (
      ResponseData: number | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Selected tasks have been successfully approved.");
        handleClearSelection();
        getReviewList();
        getInitialPagePerRows();
        getOverLay?.(false);
      } else if (ResponseStatus === "Warning" && error === false) {
        toast.warning(ResponseData);
        handleClearSelection();
        getReviewList();
        getOverLay?.(false);
      } else {
        getOverLay?.(false);
        getReviewList();
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const rejectWorkitem = async (note: string, id: number[]) => {
    getOverLay?.(true);
    const params = {
      workitemSubmissionIds: id,
      comment: note ? note : null,
    };
    const url = `${process.env.worklog_api_url}/workitem/approval/rejectworkitem`;
    const successCallback = (
      ResponseData: number | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Selected tasks have been successfully rejected.");
        handleClearSelection();
        getReviewList();
        getInitialPagePerRows();
        getOverLay?.(false);
      } else if (ResponseStatus === "Warning" && error === false) {
        toast.warning(ResponseData);
        handleClearSelection();
        getReviewList();
        getOverLay?.(false);
      } else {
        getOverLay?.(false);
        getReviewList();
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  function areAllValuesSame(arr: number[] | []) {
    return arr.every((value, index, array) => value === array[0]);
  }

  const propsForActionBar = {
    onEdit,
    workitemId,
    id,
    selectedRowIds,
    acceptWorkitem,
    rejectWorkitem,
    selectedWorkItemIds,
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
            isReviewer.length > 0 &&
            reviewList.filter(
              (i: List) =>
                i.WorkitemId === workitemId &&
                i.StatusType !== "PartialSubmitted"
            ).length > 0
          }
          Component={Accept}
          propsForActionBar={propsForActionBar}
        />
        <ConditionalComponent
          condition={
            hasPermissionWorklog("", "Approve", "Approvals") &&
            selectedRowsCount === 1 &&
            isNotReviewer.length === 0 &&
            isReviewer.length > 0 &&
            reviewList.filter(
              (i: List) =>
                i.WorkitemId === workitemId &&
                i.StatusType !== "PartialSubmitted"
            ).length > 0
          }
          Component={AcceptWithNotes}
          propsForActionBar={propsForActionBar}
        />
        <ConditionalComponent
          condition={
            hasPermissionWorklog("", "Reject", "Approvals") &&
            selectedRowsCount === 1 &&
            isNotReviewer.length === 0 &&
            isReviewer.length > 0 &&
            !Array.from(new Set(selectedRowWorkTypeId)).includes(3) &&
            reviewList.filter(
              (i: List) =>
                i.WorkitemId === workitemId &&
                i.StatusType !== "PartialSubmitted"
            ).length > 0
          }
          Component={Reject}
          propsForActionBar={propsForActionBar}
        />

        <ConditionalComponentWithoutConditions
          Component={Priority}
          propsForActionBar={{
            selectedRowIds: selectedWorkItemIds,
            selectedRowsCount: selectedRowsCount,
            getData: getReviewList,
          }}
          getOverLay={getOverLay}
        />

        <ConditionalComponent
          condition={
            hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs") &&
            Array.from(new Set(selectedRowWorkTypeId)).length === 1
          }
          Component={Status}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />

        <ConditionalComponent
          condition={
            areAllValuesSame(selectedRowClientId) &&
            areAllValuesSame(selectedRowWorkTypeId) &&
            Array.from(new Set(selectedRowWorkTypeId)).length === 1
          }
          Component={Assignee}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />

        <ConditionalComponent
          condition={
            areAllValuesSame(selectedRowClientId) &&
            areAllValuesSame(selectedRowWorkTypeId) &&
            Array.from(new Set(selectedRowWorkTypeId)).length === 1
          }
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
            isReviewer.length > 0 &&
            reviewList.filter((i: List) => i.WorkitemId === workitemId)[0]
              .IsFinalSubmited
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
