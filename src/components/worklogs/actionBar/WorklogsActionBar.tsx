import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@mui/material";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import {
  getDepartmentDataByClient,
  getProjectDropdownData,
  getSubProcessDropdownData,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";
import {
  Delete,
  Assignee,
  Status,
  Duplicate,
  Recurring,
  Client,
  Project,
  Process,
  SubProcess,
  ReturnYear,
  Manager,
  DateReceived,
} from "./components/ActionBarComponents";
import {
  Edit,
  Priority,
  Comments,
} from "@/components/common/actionBar/components/ActionBarComponents";
import CustomActionBar from "@/components/common/actionBar/CustomActionBar";
import { callAPI } from "@/utils/API/callAPI";
import TypeOfWork from "./components/TypeOfWork";
import Reviewer from "./components/Reviewer";
import {
  WorkitemList,
  WorklogsActionBarProps,
} from "@/utils/Types/worklogsTypes";
import {
  IdNameEstimatedHour,
  LabelValue,
  LabelValueType,
} from "@/utils/Types/types";
import Department from "./components/Department";

const WorklogsActionBar = ({
  selectedRowsCount,
  selectedRowId,
  selectedRowsdata,
  selectedRowClientId,
  selectedRowWorkTypeId,
  selectedRowDepartmentId,
  selectedRowDepartmentType,
  selectedRowIds,
  onEdit,
  handleClearSelection,
  onRecurring,
  onComment,
  workItemData,
  getWorkItemList,
  isUnassigneeClicked,
  getOverLay,
}: WorklogsActionBarProps) => {
  const [typeOfWorkDropdownData, setTypeOfWorkDropdownData] = useState<
    LabelValue[]
  >([]);
  const [departmentDropdownData, setDepartmentDropdownData] = useState<
    LabelValueType[]
  >([]);
  const [projectDropdownData, setProjectDropdownData] = useState<LabelValue[]>(
    []
  );
  const [processDropdownData, setProcessDropdownData] = useState<LabelValue[]>(
    []
  );
  const [subProcessDropdownData, setSubProcessDropdownData] = useState<
    IdNameEstimatedHour[]
  >([]);

  const getProcessData = async (
    ids: number[],
    WorkTypeId: number,
    DepartmentId: number
  ) => {
    const params = {
      ClientIds: ids,
      WorkTypeId: WorkTypeId,
      DepartmentId: DepartmentId,
    };
    const url = `${process.env.worklog_api_url}/workitem/getclientcommonprocess`;
    const successCallback = (
      ResponseData: LabelValue[],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setProcessDropdownData(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const getTypeOfWorkData = async (clientName: number) => {
      clientName > 0 &&
        setTypeOfWorkDropdownData(await getTypeOfWorkDropdownData(clientName));
    };

    const getDepartmentData = async (clientId: number) => {
      const data = await getDepartmentDataByClient(clientId);
      const department = localStorage.getItem("departmentId") || 0;
      const adminStatus = localStorage.getItem("isAdmin") === "true";

      if (adminStatus === false) {
        setDepartmentDropdownData(
          data.filter((data: LabelValueType) => data.value == department)
        );
      } else {
        setDepartmentDropdownData(data);
      }
    };

    const getProjectData = async (clientName: number, workTypeId: number) => {
      clientName > 0 &&
        workTypeId > 0 &&
        setProjectDropdownData(
          await getProjectDropdownData(clientName, workTypeId)
        );
    };

    if (
      workItemData
        .map((i: WorkitemList) =>
          selectedRowIds.includes(i.WorkitemId) &&
          i.ClientId > 0 &&
          i.WorkTypeId === 0
            ? i.WorkitemId
            : undefined
        )
        .filter((j: number | undefined) => j !== undefined).length > 0 &&
      workItemData
        .map((i: WorkitemList) =>
          selectedRowIds.includes(i.WorkitemId) && i.ClientId === 0
            ? i.WorkitemId
            : undefined
        )
        .filter((j: number | undefined) => j !== undefined).length <= 0 &&
      workItemData
        .map((i: WorkitemList) =>
          selectedRowIds.includes(i.WorkitemId) &&
          i.ClientId > 0 &&
          i.WorkTypeId !== 0
            ? i.WorkitemId
            : undefined
        )
        .filter((j: number | undefined) => j !== undefined).length <= 0 &&
      Array.from(new Set(selectedRowClientId)).length === 1
    ) {
      getTypeOfWorkData(Array.from(new Set(selectedRowClientId))[0]);
    } else {
      setTypeOfWorkDropdownData([]);
    }

    if (
      workItemData
        .map((i: WorkitemList) =>
          selectedRowIds.includes(i.WorkitemId) &&
          i.ClientId > 0 &&
          i.DepartmentId === 0
            ? i.WorkitemId
            : undefined
        )
        .filter((j: number | undefined) => j !== undefined).length > 0 &&
      workItemData
        .map((i: WorkitemList) =>
          selectedRowIds.includes(i.WorkitemId) && i.ClientId === 0
            ? i.WorkitemId
            : undefined
        )
        .filter((j: number | undefined) => j !== undefined).length <= 0 &&
      workItemData
        .map((i: WorkitemList) =>
          selectedRowIds.includes(i.WorkitemId) &&
          i.ClientId > 0 &&
          i.DepartmentId !== 0
            ? i.WorkitemId
            : undefined
        )
        .filter((j: number | undefined) => j !== undefined).length <= 0 &&
      Array.from(new Set(selectedRowClientId)).length === 1
    ) {
      getDepartmentData(Array.from(new Set(selectedRowClientId))[0]);
    } else {
      setDepartmentDropdownData([]);
    }

    if (
      workItemData
        .map((i: WorkitemList) =>
          selectedRowIds.includes(i.WorkitemId) &&
          i.ClientId > 0 &&
          i.WorkTypeId > 0 &&
          i.ProjectId === 0
            ? i.WorkitemId
            : undefined
        )
        .filter((j: number | undefined) => j !== undefined).length > 0 &&
      workItemData
        .map((i: WorkitemList) =>
          selectedRowIds.includes(i.WorkitemId) &&
          i.ClientId === 0 &&
          i.WorkTypeId === 0
            ? i.WorkitemId
            : undefined
        )
        .filter((j: number | undefined) => j !== undefined).length <= 0 &&
      workItemData
        .map((i: WorkitemList) =>
          selectedRowIds.includes(i.WorkitemId) &&
          i.ClientId > 0 &&
          i.WorkTypeId > 0 &&
          i.ProjectId !== 0
            ? i.WorkitemId
            : undefined
        )
        .filter((j: number | undefined) => j !== undefined).length <= 0 &&
      Array.from(new Set(selectedRowClientId)).length === 1 &&
      Array.from(new Set(selectedRowWorkTypeId)).length === 1
    ) {
      getProjectData(
        Array.from(new Set(selectedRowClientId))[0],
        Array.from(new Set(selectedRowWorkTypeId))[0]
      );
    } else {
      setProjectDropdownData([]);
    }

    if (
      (workItemData
        .map((i: WorkitemList) =>
          selectedRowIds.includes(i.WorkitemId) &&
          i.ClientId > 0 &&
          i.WorkTypeId > 0 &&
          i.DepartmentId > 0 &&
          i.ProcessId === 0
            ? i.WorkitemId
            : undefined
        )
        .filter((j: number | undefined) => j !== undefined).length > 0 &&
        workItemData
          .map((i: WorkitemList) =>
            selectedRowIds.includes(i.WorkitemId) &&
            i.ClientId === 0 &&
            i.WorkTypeId === 0 &&
            i.DepartmentId === 0
              ? i.WorkitemId
              : undefined
          )
          .filter((j: number | undefined) => j !== undefined).length <= 0 &&
        workItemData
          .map((i: WorkitemList) =>
            selectedRowIds.includes(i.WorkitemId) &&
            i.ClientId > 0 &&
            i.WorkTypeId > 0 &&
            i.DepartmentId > 0 &&
            i.ProcessId !== 0
              ? i.WorkitemId
              : undefined
          )
          .filter((j: number | undefined) => j !== undefined).length <= 0 &&
        Array.from(new Set(selectedRowWorkTypeId)).length === 1,
      Array.from(new Set(selectedRowDepartmentId)).length === 1)
    ) {
      getProcessData(
        selectedRowClientId,
        Array.from(new Set(selectedRowWorkTypeId))[0],
        Array.from(new Set(selectedRowDepartmentId))[0]
      );
    } else {
      setProcessDropdownData([]);
    }

    const getSubProcessData = async (
      clientName: number,
      WorkTypeId: number,
      processId: number
    ) => {
      clientName > 0 &&
        setSubProcessDropdownData(
          await getSubProcessDropdownData(clientName, WorkTypeId, processId)
        );
    };
    if (
      workItemData
        .map((i: WorkitemList) =>
          selectedRowIds.includes(i.WorkitemId) &&
          i.ClientId > 0 &&
          i.ProcessId > 0 &&
          i.SubProcessId === 0
            ? i.WorkitemId
            : undefined
        )
        .filter((j: number | undefined) => j !== undefined).length > 0 &&
      workItemData
        .map((i: WorkitemList) =>
          selectedRowIds.includes(i.WorkitemId) &&
          i.ClientId === 0 &&
          i.ProcessId === 0
            ? i.WorkitemId
            : undefined
        )
        .filter((j: number | undefined) => j !== undefined).length <= 0 &&
      workItemData
        .map((i: WorkitemList) =>
          selectedRowIds.includes(i.WorkitemId) &&
          i.ClientId > 0 &&
          i.ProcessId > 0 &&
          i.SubProcessId !== 0
            ? i.WorkitemId
            : undefined
        )
        .filter((j: number | undefined) => j !== undefined).length <= 0 &&
      Array.from(new Set(selectedRowClientId)).length === 1 &&
      Array.from(new Set(selectedRowWorkTypeId)).length === 1 &&
      Array.from(
        new Set(
          workItemData
            .map(
              (i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) && i.ProcessId
            )
            .filter((j: number | boolean) => j !== false)
        )
      ).length === 1
    ) {
      getSubProcessData(
        Array.from(new Set(selectedRowClientId))[0],
        Array.from(new Set(selectedRowWorkTypeId))[0],
        Array.from(
          new Set(
            workItemData
              .map(
                (i: any) => selectedRowIds.includes(i.WorkitemId) && i.ProcessId
              )
              .filter((j: number | boolean) => j !== false)
          )
        )[0]
      );
    } else {
      setSubProcessDropdownData([]);
    }
  }, [selectedRowClientId]);

  function areAllValuesSame(arr: number[]) {
    return arr.every((value, index, array) => value === array[0]);
  }

  const handleAssigneeForSubmission = (
    arr: WorkitemList[],
    userId: string | null
  ) => {
    const workItemIds: number[] = [];
    const selctedWorkItemStatusIds: number[] = [];

    for (const item of arr) {
      if (item.AssignedToId === parseInt(userId || "", 10)) {
        workItemIds.push(item.WorkitemId);
        selctedWorkItemStatusIds.push(item.StatusId);
      }
    }
    return { workItemIds, selctedWorkItemStatusIds };
  };

  const submitWorkItem = async () => {
    const userId = localStorage.getItem("UserId");
    const { workItemIds } = handleAssigneeForSubmission(
      selectedRowsdata,
      userId
    );

    if (workItemIds.length === 0) {
      toast.warning("Only Assignee can submit the task.");
      return;
    }

    if (workItemIds.length < selectedRowsCount) {
      toast.warning("Only Assignee can submit the task.");
    }
    getOverLay?.(true);
    const params = {
      workitemIds: workItemIds,
    };
    const url = `${process.env.worklog_api_url}/workitem/saveworkitemsubmission`;
    const successCallback = (
      ResponseData: boolean | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("The task has been successfully submitted.");
        handleClearSelection();
        getWorkItemList();
        getOverLay?.(false);
      } else if (ResponseStatus === "Warning") {
        toast.warning(ResponseData);
        handleClearSelection();
        getWorkItemList();
        getOverLay?.(false);
      } else {
        getOverLay?.(false);
        handleClearSelection();
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const SubmitButton = () => (
    <span className="pl-2 pr-2 border-t-0 cursor-pointer border-b-0 border-x-[1.5px] border-gray-300">
      <Button
        variant="outlined"
        className=" rounded-[4px] h-8 !text-[10px]"
        onClick={submitWorkItem}
      >
        Submit Task
      </Button>
    </span>
  );

  const propsForActionBar = {
    onEdit,
    onRecurring,
    onComment,
    workItemData,
    selectedRowId,
    selectedRowIds,
    handleClearSelection,
    getWorkItemList,
    selectedRowsCount,
    selectedRowClientId,
    selectedRowWorkTypeId,
    selectedRowDepartmentId,
    selectedRowDepartmentType,
    areAllValuesSame,
    typeOfWorkDropdownData,
    departmentDropdownData,
    projectDropdownData,
    processDropdownData,
    subProcessDropdownData,
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

  return (
    <div>
      <CustomActionBar {...propsForActionBar}>
        <ConditionalComponent
          condition={
            hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs") &&
            selectedRowsCount === 1 &&
            (workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.StatusType !== "Submitted" &&
                i.WorkTypeId === 1
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length > 0 ||
              workItemData
                .map((i: WorkitemList) =>
                  selectedRowIds.includes(i.WorkitemId) && i.WorkTypeId !== 1
                    ? i.WorkitemId
                    : undefined
                )
                .filter((j: number | undefined) => j !== undefined).length >
                0) &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.StatusType === "QAInProgress" ||
                  i.StatusType === "QACompleted" ||
                  i.StatusType === "QASubmitted")
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0
          }
          className="text-slatyGrey"
          Component={Edit}
          propsForActionBar={{ onEdit: onEdit, selectedRowId: selectedRowId }}
        />

        <ConditionalComponent
          condition={
            hasPermissionWorklog("Task/SubTask", "Delete", "WorkLogs") &&
            !isUnassigneeClicked &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.StatusType === "Submitted" &&
                i.WorkTypeId === 1
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.StatusType === "QAInProgress" ||
                  i.StatusType === "QACompleted" ||
                  i.StatusType === "QASubmitted")
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0
          }
          Component={Delete}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />

        <ConditionalComponentWithoutConditions
          Component={Priority}
          propsForActionBar={{
            selectedRowIds: selectedRowIds,
            selectedRowsCount: selectedRowsCount,
            getData: getWorkItemList,
          }}
          getOverLay={getOverLay}
        />

        <ConditionalComponent
          condition={
            // areAllValuesSame(selectedRowClientId) &&
            // areAllValuesSame(selectedRowWorkTypeId) &&
            // Array.from(new Set(selectedRowWorkTypeId)).length === 1
            hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs") &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId > 0 &&
                i.WorkTypeId > 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length > 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId === 0 &&
                i.WorkTypeId === 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            Array.from(new Set(selectedRowWorkTypeId)).length === 1 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.StatusType === "QAInProgress" ||
                  i.StatusType === "QACompleted" ||
                  i.StatusType === "QASubmitted")
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0
          }
          Component={Assignee}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />

        <ConditionalComponent
          condition={
            hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs") &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId > 0 &&
                i.WorkTypeId > 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length > 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId === 0 &&
                i.WorkTypeId === 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            Array.from(new Set(selectedRowWorkTypeId)).length === 1 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.StatusType === "QAInProgress" ||
                  i.StatusType === "QACompleted" ||
                  i.StatusType === "QASubmitted")
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0
          }
          Component={Status}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />

        <ConditionalComponent
          condition={!isUnassigneeClicked}
          Component={Duplicate}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />

        <ConditionalComponent
          condition={
            hasPermissionWorklog("Reccuring", "View", "WorkLogs") &&
            selectedRowsCount === 1 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.StatusType === "QAInProgress" ||
                  i.StatusType === "QACompleted" ||
                  i.StatusType === "QASubmitted")
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0
          }
          Component={Recurring}
          propsForActionBar={propsForActionBar}
        />

        <ConditionalComponent
          condition={
            hasPermissionWorklog("Comment", "View", "WorkLogs") &&
            selectedRowsCount === 1 &&
            !isUnassigneeClicked &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.StatusType === "QAInProgress" ||
                  i.StatusType === "QACompleted" ||
                  i.StatusType === "QASubmitted")
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0
          }
          Component={Comments}
          propsForActionBar={{
            onComment: onComment,
            selectedRowId: selectedRowId,
          }}
        />

        <ConditionalComponent
          condition={
            hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs") &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.ClientId === 0 || i.ClientId === null)
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length > 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) && i.ClientId > 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.StatusType === "QAInProgress" ||
                  i.StatusType === "QACompleted" ||
                  i.StatusType === "QASubmitted")
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0
          }
          Component={Client}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />

        <ConditionalComponent
          condition={
            hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs") &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId > 0 &&
                i.WorkTypeId === 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length > 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) && i.ClientId === 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId > 0 &&
                i.WorkTypeId !== 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            Array.from(new Set(selectedRowClientId)).length === 1 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.StatusType === "QAInProgress" ||
                  i.StatusType === "QACompleted" ||
                  i.StatusType === "QASubmitted")
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0
          }
          Component={TypeOfWork}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />

        <ConditionalComponent
          condition={
            hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs") &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId > 0 &&
                i.DepartmentId === 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length > 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) && i.ClientId === 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId > 0 &&
                i.DepartmentId !== 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            Array.from(new Set(selectedRowClientId)).length === 1 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.StatusType === "QAInProgress" ||
                  i.StatusType === "QACompleted" ||
                  i.StatusType === "QASubmitted")
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0
          }
          Component={Department}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />

        <ConditionalComponent
          condition={
            hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs") &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId > 0 &&
                i.WorkTypeId > 0 &&
                i.ProjectId === 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length > 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId === 0 &&
                i.WorkTypeId === 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId > 0 &&
                i.WorkTypeId === 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId > 0 &&
                i.WorkTypeId > 0 &&
                i.ProjectId !== 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            Array.from(new Set(selectedRowClientId)).length === 1 &&
            Array.from(new Set(selectedRowWorkTypeId)).length === 1 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.StatusType === "QAInProgress" ||
                  i.StatusType === "QACompleted" ||
                  i.StatusType === "QASubmitted")
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0
          }
          Component={Project}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />

        <ConditionalComponent
          condition={
            hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs") &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId > 0 &&
                i.WorkTypeId > 0 &&
                i.ProcessId === 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length > 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId === 0 &&
                i.WorkTypeId === 0 &&
                i.DepartmentId === 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId > 0 &&
                i.WorkTypeId > 0 &&
                i.DepartmentId === 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId > 0 &&
                i.WorkTypeId > 0 &&
                i.DepartmentId > 0 &&
                i.ProcessId !== 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            Array.from(new Set(selectedRowClientId)).length === 1 &&
            Array.from(new Set(selectedRowWorkTypeId)).length === 1 &&
            Array.from(new Set(selectedRowDepartmentId)).length === 1 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.StatusType === "QAInProgress" ||
                  i.StatusType === "QACompleted" ||
                  i.StatusType === "QASubmitted")
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0
          }
          Component={Process}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />

        <ConditionalComponent
          condition={
            hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs") &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId > 0 &&
                i.ProcessId > 0 &&
                i.SubProcessId === 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length > 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId === 0 &&
                i.ProcessId === 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId > 0 &&
                i.ProcessId > 0 &&
                i.SubProcessId !== 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            Array.from(
              new Set(
                workItemData
                  .map(
                    (i: WorkitemList) =>
                      selectedRowIds.includes(i.WorkitemId) && i.ProcessId
                  )
                  .filter((j: number | boolean) => j !== false)
              )
            ).length === 1 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.StatusType === "QAInProgress" ||
                  i.StatusType === "QACompleted" ||
                  i.StatusType === "QASubmitted")
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0
          }
          Component={SubProcess}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />

        <ConditionalComponent
          condition={
            hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs") &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.ReturnYear === 0 || i.ReturnYear === null) &&
                i.WorkTypeId === 3
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length > 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                ((i.ReturnYear !== null && i.ReturnYear > 0) ||
                  i.ReturnYear !== null) &&
                i.WorkTypeId === 3
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.StatusType === "QAInProgress" ||
                  i.StatusType === "QACompleted" ||
                  i.StatusType === "QASubmitted")
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0
          }
          Component={ReturnYear}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />
        <ConditionalComponent
          condition={
            areAllValuesSame(selectedRowClientId) &&
            areAllValuesSame(selectedRowWorkTypeId) &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId > 0 &&
                i.WorkTypeId > 0 &&
                (i.ReviewerId === 0 || i.ReviewerId === null)
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length > 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId === 0 &&
                i.WorkTypeId === 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            Array.from(
              new Set(
                workItemData
                  .map(
                    (i: WorkitemList) =>
                      selectedRowIds.includes(i.WorkitemId) && i.WorkTypeId
                  )
                  .filter((j: number | boolean) => j !== false)
              )
            ).length === 1 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.StatusType === "QAInProgress" ||
                  i.StatusType === "QACompleted" ||
                  i.StatusType === "QASubmitted")
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0
          }
          Component={Reviewer}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />

        <ConditionalComponent
          condition={
            areAllValuesSame(selectedRowClientId) &&
            areAllValuesSame(selectedRowWorkTypeId) &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId > 0 &&
                i.WorkTypeId > 0 &&
                (i.ManagerId === 0 || i.ManagerId === null)
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length > 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                i.ClientId === 0 &&
                i.WorkTypeId === 0
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            Array.from(
              new Set(
                workItemData
                  .map(
                    (i: WorkitemList) =>
                      selectedRowIds.includes(i.WorkitemId) && i.WorkTypeId
                  )
                  .filter((j: number | boolean) => j !== false)
              )
            ).length === 1 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.StatusType === "QAInProgress" ||
                  i.StatusType === "QACompleted" ||
                  i.StatusType === "QASubmitted")
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0
          }
          Component={Manager}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />

        <ConditionalComponent
          condition={
            hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs") &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.ReceiverDate?.length === 0 || i.ReceiverDate === null)
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length > 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.ReceiverDate?.length > 0 || i.ReceiverDate !== null)
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0 &&
            workItemData
              .map((i: WorkitemList) =>
                selectedRowIds.includes(i.WorkitemId) &&
                (i.StatusType === "QAInProgress" ||
                  i.StatusType === "QACompleted" ||
                  i.StatusType === "QASubmitted")
                  ? i.WorkitemId
                  : undefined
              )
              .filter((j: number | undefined) => j !== undefined).length <= 0
          }
          Component={DateReceived}
          propsForActionBar={propsForActionBar}
          getOverLay={getOverLay}
        />

        <SubmitButton />
      </CustomActionBar>
    </div>
  );
};

export default WorklogsActionBar;
