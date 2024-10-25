import { Close } from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import OverLay from "../common/OverLay";
import { callAPI } from "@/utils/API/callAPI";
import {
  getAssigneeDropdownData,
  getClientDropdownData,
  getDepartmentDataByClient,
  getManagerDropdownData,
  getProcessDropdownData,
  getProjectDropdownData,
  getReviewerDropdownData,
  getStatusDropdownData,
  getSubProcessDropdownData,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";
import { toast } from "react-toastify";
import {
  getYears,
  hasPermissionWorklog,
  isWeekend,
} from "@/utils/commonFunction";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";
import TaskIcon from "@/assets/icons/TaskIcon";
import { useRouter } from "next/navigation";
import { LabelValue, LabelValueType, User } from "@/utils/Types/types";
import { WorkitemGetbyid } from "@/utils/Types/worklogsTypes";

interface TaskEditDrawer {
  onOpen: boolean;
  onClose: () => void;
  onEdit: number;
  onDataFetch: (() => void) | null;
}

const TaskEditDrawer = ({
  onOpen,
  onClose,
  onEdit,
  onDataFetch,
}: TaskEditDrawer) => {
  const router = useRouter();
  const yearWorklogsDrawerDropdown = getYears();
  const [isLoadingWorklogs, setIsLoadingWorklogs] = useState(false);
  const [editDataWorklogs, setEditDataWorklogs] =
    useState<WorkitemGetbyid | null>(null);
  const [
    inputTypePreperationWorklogsDrawer,
    setInputTypePreperationWorklogsDrawer,
  ] = useState("text");
  const [inputTypeReviewWorklogsDrawer, setInputTypeReviewWorklogsDrawer] =
    useState("text");

  // Task
  const [taskWorklogsDrawer, setTaskWorklogsDrawer] = useState(true);
  const [clientWorklogsDropdownData, setClientWorklogsDropdownData] = useState<
    LabelValue[] | []
  >([]);
  const [clientNameWorklogs, setClientNameWorklogs] = useState<number>(0);
  const [typeOfWorkWorklogsDropdownData, setTypeOfWorkWorklogsDropdownData] =
    useState<LabelValue[] | []>([]);
  const [typeOfWorkWorklogs, setTypeOfWorkWorklogs] = useState<number>(0);
  const [projectWorklogsDropdownData, setProjectWorklogsDropdownData] =
    useState<LabelValue[] | []>([]);
  const [projectNameWorklogs, setProjectNameWorklogs] = useState<number>(0);
  const [processWorklogsDropdownData, setProcessWorklogsDropdownData] =
    useState<LabelValue[] | []>([]);
  const [processNameWorklogs, setProcessNameWorklogs] = useState<number>(0);
  const [subProcessWorklogsDropdownData, setSubProcessWorklogsDropdownData] =
    useState<LabelValue[] | []>([]);
  const [subProcessWorklogs, setSubProcessWorklogs] = useState<number>(0);
  const [clientTaskNameWorklogs, setClientTaskNameWorklogs] =
    useState<string>("");
  const [managerWorklogsDropdownData, setManagerWorklogsDropdownData] =
    useState<LabelValue[] | []>([]);
  const [managerWorklogs, setManagerWorklogs] = useState<number>(0);
  const isQaWorklogsDropdownData = [
    {
      label: "Yes",
      value: 1,
    },
    {
      label: "No",
      value: 0,
    },
  ];
  const [isQaWorklogs, setIsQaWorklogs] = useState<number>(0);
  const [statusWorklogsDropdownData, setStatusWorklogsDropdownData] = useState<
    LabelValueType[] | []
  >([]);
  const [statusWorklogsDropdownDataUse, setStatusWorklogsDropdownDataUse] =
    useState<LabelValueType[] | []>([]);
  const [statusWorklogs, setStatusWorklogs] = useState<number>(0);
  const [descriptionWorklogs, setDescriptionWorklogs] = useState<string>("");
  const [priorityWorklogs, setPriorityWorklogs] = useState<number>(0);
  const [quantityWorklogs, setQuantityWorklogs] = useState<number>(1);
  const [receiverDateWorklogs, setReceiverDateWorklogs] = useState<string>("");
  const [dueDateWorklogs, setDueDateWorklogs] = useState<string>("");
  const [allInfoDateWorklogs, setAllInfoDateWorklogs] = useState<string>("");
  const [assigneeWorklogsDropdownData, setAssigneeWorklogsDropdownData] =
    useState<LabelValue[] | []>([]);
  const [assigneeWorklogs, setAssigneeWorklogs] = useState<number>(0);
  const [assigneeWorklogsDisable, setAssigneeWorklogsDisable] =
    useState<boolean>(true);
  const [reviewerWorklogsDropdownData, setReviewerWorklogsDropdownData] =
    useState<LabelValue[] | []>([]);
  const [departmentWorklogs, setDepartmentWorklogs] = useState(0);
  const [departmentWorklogsDropdownData, setDepartmentWorklogsDropdownData] =
    useState<LabelValueType[] | []>([]);
  const [departmentWorklogsType, setDepartmentWorklogsType] = useState("");
  const [reviewerWorklogs, setReviewerWorklogs] = useState<number>(0);
  const [dateOfReviewWorklogs, setDateOfReviewWorklogs] = useState<string>("");
  const [dateOfPreperationWorklogs, setDateOfPreperationWorklogs] =
    useState<string>("");
  const [estTimeDataWorklogs, setEstTimeDataWorklogs] = useState([]);
  const [returnYearWorklogs, setReturnYearWorklogs] = useState<number>(0);
  const [noOfPagesWorklogs, setNoOfPagesWorklogs] = useState<number>(0);
  const [checklistWorkpaperWorklogs, setChecklistWorkpaperWorklogs] =
    useState<number>(0);
  const [valueMonthYearFrom, setValueMonthYearFrom] = useState<any>(null);
  const [valueMonthYearTo, setValueMonthYearTo] = useState<any>(null);
  const [reworkReceiverDateWorklogs, setReworkReceiverDateWorklogs] =
    useState<any>("");
  const [reworkDueDateWorklogs, setReworkDueDateWorklogs] = useState<any>("");

  const previousYearStartDate = dayjs()
    .subtract(1, "year")
    .startOf("year")
    .toDate();
  const currentYearEndDate = dayjs().endOf("year").toDate();

  // Update
  const [taskWorklogsEditDrawer, setTaskWorklogsEditDrawer] = useState(true);
  const [clientNameWorklogsEdit, setClientNameWorklogsEdit] =
    useState<number>(0);
  const [clientNameWorklogsEditErr, setClientNameWorklogsEditErr] =
    useState(false);
  const [typeOfWorkWorklogsEdit, setTypeOfWorkWorklogsEdit] =
    useState<number>(0);
  const [typeOfWorkWorklogsEditErr, setTypeOfWorkWorklogsEditErr] =
    useState(false);
  const [
    typeOfWorkWorklogsDropdownDataEdit,
    setTypeOfWorkWorklogsDropdownDataEdit,
  ] = useState<LabelValue[] | []>([]);
  const [projectNameWorklogsEdit, setProjectNameWorklogsEdit] =
    useState<number>(0);
  const [projectNameWorklogsEditErr, setProjectNameWorklogsEditErr] =
    useState(false);
  const [projectWorklogsDropdownDataEdit, setProjectWorklogsDropdownDataEdit] =
    useState<LabelValue[] | []>([]);
  const [processNameWorklogsEdit, setProcessNameWorklogsEdit] =
    useState<number>(0);
  const [processNameWorklogsEditErr, setProcessNameWorklogsEditErr] =
    useState(false);
  const [processWorklogsDropdownDataEdit, setProcessWorklogsDropdownDataEdit] =
    useState<LabelValue[] | []>([]);
  const [subProcessWorklogsEdit, setSubProcessWorklogsEdit] =
    useState<number>(0);
  const [subProcessWorklogsEditErr, setSubProcessWorklogsEditErr] =
    useState(false);
  const [
    subProcessWorklogsDropdownDataEdit,
    setSubProcessWorklogsDropdownDataEdit,
  ] = useState<LabelValue[] | []>([]);
  const [clientTaskNameWorklogsEdit, setClientTaskNameWorklogsEdit] =
    useState<string>("");
  const [clientTaskNameWorklogsEditErr, setClientTaskNameWorklogsEditErr] =
    useState(false);
  const [managerWorklogsDropdownDataEdit, setManagerWorklogsDropdownDataEdit] =
    useState<LabelValue[] | []>([]);
  const [managerWorklogsEdit, setManagerWorklogsEdit] = useState<number>(0);
  const [managerWorklogsEditErr, setManagerWorklogsEditErr] = useState(false);
  const [isQaWorklogsEdit, setIsQaWorklogsEdit] = useState<number>(0);
  const [qaQuantityWorklogsEdit, setQAQuantityWorklogsEdit] = useState<
    number | null
  >(null);
  const [statusWorklogsEdit, setStatusWorklogsEdit] = useState<number>(0);
  const [statusWorklogsEditErr, setStatusWorklogsEditErr] = useState(false);
  const [descriptionWorklogsEdit, setDescriptionWorklogsEdit] =
    useState<string>("");
  const [descriptionWorklogsEditErr, setDescriptionWorklogsEditErr] =
    useState<boolean>(false);
  const [priorityWorklogsEdit, setPriorityWorklogsEdit] = useState<
    string | number
  >(0);
  const [quantityWorklogsEdit, setQuantityWorklogsEdit] = useState<number>(1);
  const [quantityWorklogsEditErr, setQuantityWorklogsEditErr] = useState(false);
  const [receiverDateWorklogsEdit, setReceiverDateWorklogsEdit] =
    useState<string>("");
  const [receiverDateWorklogsEditErr, setReceiverDateWorklogsEditErr] =
    useState(false);
  const [dueDateWorklogsEdit, setDueDateWorklogsEdit] = useState<string>("");
  const [allInfoDateWorklogsEdit, setAllInfoDateWorklogsEdit] =
    useState<string>("");
  const [assigneeWorklogsEdit, setAssigneeWorklogsEdit] = useState<number>(0);
  const [assigneeWorklogsEditErr, setAssigneeWorklogsEditErr] = useState(false);
  const [
    assigneeWorklogsDropdownDataEdit,
    setAssigneeWorklogsDropdownDataEdit,
  ] = useState<LabelValue[] | []>([]);
  const [reviewerWorklogsEdit, setReviewerWorklogsEdit] = useState<number>(0);
  const [reviewerWorklogsEditErr, setReviewerWorklogsEditErr] = useState(false);
  const [
    reviewerWorklogsDropdownDataEdit,
    setReviewerWorklogsDropdownDataEdit,
  ] = useState<LabelValue[] | []>([]);
  const [departmentWorklogsEdit, setDepartmentWorklogsEdit] = useState(0);
  const [departmentWorklogsEditErr, setDepartmentWorklogsEditErr] =
    useState(false);
  const [
    departmentWorklogsDropdownDataEdit,
    setDepartmentWorklogsDropdownDataEdit,
  ] = useState<LabelValueType[] | []>([]);
  const [departmentWorklogsTypeEdit, setDepartmentWorklogsTypeEdit] =
    useState("");
  const [estTimeDataWorklogsEdit, setEstTimeDataWorklogsEdit] = useState([]);
  const [returnYearWorklogsEdit, setReturnYearWorklogsEdit] =
    useState<number>(0);
  const [returnYearWorklogsEditErr, setReturnYearWorklogsEditErr] =
    useState(false);
  const [noOfPagesWorklogsEdit, setNoOfPagesWorklogsEdit] = useState<number>(0);
  const [checklistWorkpaperWorklogsEdit, setChecklistWorkpaperWorklogsEdit] =
    useState<number>(0);
  const [
    checklistWorkpaperWorklogsEditErr,
    setChecklistWorkpaperWorklogsEditErr,
  ] = useState(false);
  const [errorlogSignedOffPending, setErrorlogSignedOffPending] =
    useState(false);
  const [valueMonthYearFromEdit, setValueMonthYearFromEdit] =
    useState<any>(null);
  const [valueMonthYearToEdit, setValueMonthYearToEdit] = useState<any>(null);
  const [reworkReceiverDateWorklogsEdit, setReworkReceiverDateWorklogsEdit] =
    useState<any>("");
  const [
    reworkReceiverDateWorklogsEditErr,
    setReworkReceiverDateWorklogsEditErr,
  ] = useState(false);
  const [reworkDueDateWorklogsEdit, setReworkDueDateWorklogsEdit] =
    useState<any>("");

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const validateField = (value: any) => {
      if (
        value === 0 ||
        value === "" ||
        value === null ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return true;
      }
      return false;
    };

    const fieldValidationsEdit = {
      clientName: validateField(clientNameWorklogsEdit),
      typeOfWork: validateField(typeOfWorkWorklogsEdit),
      projectName: validateField(projectNameWorklogsEdit),
      processName: validateField(processNameWorklogsEdit),
      subProcess: validateField(subProcessWorklogsEdit),
      clientTaskName: validateField(clientTaskNameWorklogsEdit),
      descriptionWorklogs:
        departmentWorklogsTypeEdit !== "WhitelabelTaxation" &&
        validateField(descriptionWorklogsEdit),
      status: validateField(statusWorklogsEdit),
      quantity: validateField(quantityWorklogsEdit),
      receiverDate: validateField(receiverDateWorklogsEdit),
      dueDate: validateField(dueDateWorklogsEdit),
      assignee: validateField(assigneeWorklogsEdit),
      reviewer: validateField(reviewerWorklogsEdit),
      department: validateField(departmentWorklogsEdit),
      manager: validateField(managerWorklogsEdit),
      returnYear:
        typeOfWorkWorklogsEdit === 3 && validateField(returnYearWorklogsEdit),
      checklistWorkpaper:
        typeOfWorkWorklogsEdit === 3 &&
        validateField(checklistWorkpaperWorklogsEdit),
    };

    setClientNameWorklogsEditErr(fieldValidationsEdit.clientName);
    setTypeOfWorkWorklogsEditErr(fieldValidationsEdit.typeOfWork);
    setProjectNameWorklogsEditErr(fieldValidationsEdit.projectName);
    setStatusWorklogsEditErr(fieldValidationsEdit.status);
    setProcessNameWorklogsEditErr(fieldValidationsEdit.processName);
    setSubProcessWorklogsEditErr(fieldValidationsEdit.subProcess);
    setClientTaskNameWorklogsEditErr(fieldValidationsEdit.clientTaskName);
    departmentWorklogsTypeEdit !== "WhitelabelTaxation" &&
      setDescriptionWorklogsEditErr(fieldValidationsEdit.descriptionWorklogs);
    setQuantityWorklogsEditErr(fieldValidationsEdit.quantity);
    setReceiverDateWorklogsEditErr(fieldValidationsEdit.receiverDate);
    assigneeWorklogsDisable &&
      setAssigneeWorklogsEditErr(fieldValidationsEdit.assignee);
    setReviewerWorklogsEditErr(fieldValidationsEdit.reviewer);
    setDepartmentWorklogsEditErr(fieldValidationsEdit.department);
    setManagerWorklogsEditErr(fieldValidationsEdit.manager);
    typeOfWorkWorklogsEdit === 3 &&
      setReturnYearWorklogsEditErr(fieldValidationsEdit.returnYear);
    typeOfWorkWorklogsEdit === 3 &&
      setChecklistWorkpaperWorklogsEditErr(
        fieldValidationsEdit.checklistWorkpaper
      );
    setClientTaskNameWorklogsEditErr(
      clientTaskNameWorklogsEdit.trim().length < 4 ||
        clientTaskNameWorklogsEdit.trim().length > 100
    );
    setQuantityWorklogsEditErr(
      quantityWorklogsEdit.toString().length <= 0 ||
        quantityWorklogsEdit.toString().length > 4 ||
        quantityWorklogsEdit <= 0 ||
        quantityWorklogsEdit.toString().includes(".")
    );

    const hasEditErrors = Object.values(fieldValidationsEdit).some(
      (error) => error
    );

    const data = {
      WorkItemId: onEdit > 0 ? onEdit : 0,
      ClientId: clientNameWorklogsEdit,
      WorkTypeId: typeOfWorkWorklogsEdit,
      taskName: clientTaskNameWorklogsEdit,
      ProjectId: projectNameWorklogsEdit === 0 ? null : projectNameWorklogsEdit,
      ProcessId: processNameWorklogsEdit === 0 ? null : processNameWorklogsEdit,
      SubProcessId:
        subProcessWorklogsEdit === 0 ? null : subProcessWorklogsEdit,
      StatusId: statusWorklogsEdit,
      Priority: priorityWorklogsEdit === 0 ? 0 : priorityWorklogsEdit,
      Quantity: quantityWorklogsEdit <= 0 ? null : quantityWorklogsEdit,
      Description:
        descriptionWorklogsEdit.toString().length <= 0
          ? null
          : descriptionWorklogsEdit.toString().trim(),
      ReceiverDate: dayjs(receiverDateWorklogsEdit).format("YYYY/MM/DD"),
      DueDate: dayjs(dueDateWorklogsEdit).format("YYYY/MM/DD"),
      allInfoDate:
        allInfoDateWorklogsEdit === ""
          ? null
          : dayjs(allInfoDateWorklogsEdit).format("YYYY/MM/DD"),
      AssignedId: assigneeWorklogsEdit,
      ReviewerId: reviewerWorklogsEdit,
      DepartmentId: departmentWorklogsEdit,
      managerId: managerWorklogsEdit,
      TaxReturnType: null,
      TaxCustomFields:
        typeOfWorkWorklogsEdit !== 3
          ? null
          : {
              ReturnYear: returnYearWorklogsEdit,
              Complexity: null,
              CountYear: null,
              NoOfPages: noOfPagesWorklogsEdit,
            },
      checklistWorkpaper:
        checklistWorkpaperWorklogsEdit === 1
          ? true
          : checklistWorkpaperWorklogsEdit === 2
          ? false
          : null,
      PeriodFrom:
        valueMonthYearFromEdit === null || valueMonthYearFromEdit === ""
          ? null
          : dayjs(valueMonthYearFromEdit).format("YYYY/MM/DD"),
      PeriodTo:
        valueMonthYearToEdit === null || valueMonthYearToEdit === ""
          ? null
          : dayjs(valueMonthYearToEdit).format("YYYY/MM/DD"),
      ReworkReceivedDate: !!reworkReceiverDateWorklogsEdit
        ? dayjs(reworkReceiverDateWorklogsEdit).format("YYYY/MM/DD")
        : null,
      ReworkDueDate: !!reworkDueDateWorklogsEdit
        ? dayjs(reworkDueDateWorklogsEdit).format("YYYY/MM/DD")
        : null,
      IsQARequired:
        departmentWorklogsTypeEdit == "SMB" ? isQaWorklogsEdit : null,
      QAQuantity:
        departmentWorklogsTypeEdit == "SMB" ? qaQuantityWorklogsEdit : null,
      ManualTimeList: null,
      SubTaskList: null,
      RecurringObj: null,
      ReminderObj: null,
    };

    const saveWorklog = async () => {
      setIsLoadingWorklogs(true);
      const params = data;
      const url = `${process.env.worklog_api_url}/workitem/saveworkitem`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success(
            `Worklog ${onEdit > 0 ? "Updated" : "created"} successfully.`
          );
          onEdit > 0 && getEditDataWorklogs();
          handleClose();
          setIsLoadingWorklogs(false);
        } else {
          setIsLoadingWorklogs(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    };

    if (
      onEdit > 0 &&
      typeOfWorkWorklogsEdit !== 3 &&
      !hasEditErrors &&
      clientTaskNameWorklogsEdit.trim().length > 3 &&
      clientTaskNameWorklogsEdit.trim().length <= 100 &&
      quantityWorklogsEdit > 0 &&
      quantityWorklogsEdit < 10000 &&
      !quantityWorklogsEditErr &&
      !quantityWorklogsEdit.toString().includes(".") &&
      !reworkReceiverDateWorklogsEditErr
    ) {
      if (hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs")) {
        saveWorklog();
      } else {
        toast.error("User don't have permission to Update Task.");
        getEditDataWorklogs();
      }
    } else if (
      onEdit > 0 &&
      typeOfWorkWorklogsEdit === 3 &&
      !hasEditErrors &&
      clientTaskNameWorklogsEdit.trim().length > 3 &&
      clientTaskNameWorklogsEdit.trim().length <= 100 &&
      quantityWorklogsEdit > 0 &&
      quantityWorklogsEdit < 10000 &&
      !quantityWorklogsEditErr &&
      !quantityWorklogsEdit.toString().includes(".") &&
      !reworkReceiverDateWorklogsEditErr
    ) {
      if (hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs")) {
        saveWorklog();
      } else {
        toast.error("User don't have permission to Update Task.");
        getEditDataWorklogs();
      }
    }
  };

  // OnEdit
  const getEditDataWorklogs = async () => {
    const params = {
      WorkitemId: onEdit,
    };
    const url = `${process.env.worklog_api_url}/workitem/getbyid`;
    const successCallback = (
      ResponseData: WorkitemGetbyid,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setEditDataWorklogs(ResponseData);
        setClientNameWorklogs(ResponseData.ClientId);
        setClientNameWorklogsEdit(ResponseData.ClientId);
        setTypeOfWorkWorklogs(ResponseData.WorkTypeId);
        setTypeOfWorkWorklogsEdit(ResponseData.WorkTypeId);
        setProjectNameWorklogs(
          ResponseData.ProjectId === null ? 0 : ResponseData.ProjectId
        );
        setProjectNameWorklogsEdit(
          ResponseData.ProjectId === null ? 0 : ResponseData.ProjectId
        );
        setProcessNameWorklogs(
          ResponseData.ProcessId === null ? 0 : ResponseData.ProcessId
        );
        setProcessNameWorklogsEdit(
          ResponseData.ProcessId === null ? 0 : ResponseData.ProcessId
        );
        setSubProcessWorklogs(
          ResponseData.SubProcessId === null ? 0 : ResponseData.SubProcessId
        );
        setSubProcessWorklogsEdit(
          ResponseData.SubProcessId === null ? 0 : ResponseData.SubProcessId
        );
        setClientTaskNameWorklogs(
          ResponseData.TaskName === null ? "" : ResponseData.TaskName
        );
        setClientTaskNameWorklogsEdit(
          ResponseData.TaskName === null ? "" : ResponseData.TaskName
        );
        setStatusWorklogs(ResponseData.StatusId);
        setStatusWorklogsEdit(ResponseData.StatusId);
        setAllInfoDateWorklogs(
          ResponseData.AllInfoDate === null ? "" : ResponseData.AllInfoDate
        );
        setAllInfoDateWorklogsEdit(
          ResponseData.AllInfoDate === null ? "" : ResponseData.AllInfoDate
        );
        setErrorlogSignedOffPending(ResponseData.ErrorlogSignedOffPending);
        setPriorityWorklogs(
          ResponseData.Priority === null ? 0 : ResponseData.Priority
        );
        setPriorityWorklogsEdit(
          ResponseData.Priority === null ? 0 : ResponseData.Priority
        );
        setQuantityWorklogs(ResponseData.Quantity);
        setQuantityWorklogsEdit(ResponseData.Quantity);
        setDescriptionWorklogs(
          ResponseData.Description === null ? "" : ResponseData.Description
        );
        setDescriptionWorklogsEdit(
          ResponseData.Description === null ? "" : ResponseData.Description
        );
        setReceiverDateWorklogs(ResponseData.ReceiverDate);
        setReceiverDateWorklogsEdit(ResponseData.ReceiverDate);
        setDueDateWorklogs(ResponseData.DueDate);
        setDueDateWorklogsEdit(ResponseData.DueDate);
        setDateOfReviewWorklogs(
          ResponseData.ReviewerDate === null ? "" : ResponseData.ReviewerDate
        );
        setDateOfPreperationWorklogs(
          ResponseData.PreparationDate === null
            ? ""
            : ResponseData.PreparationDate
        );
        setAssigneeWorklogs(ResponseData.AssignedId);
        setAssigneeWorklogsEdit(ResponseData.AssignedId);
        setDepartmentWorklogs(ResponseData.DepartmentId);
        setDepartmentWorklogsEdit(ResponseData.DepartmentId);
        setReviewerWorklogs(ResponseData.ReviewerId);
        setReviewerWorklogsEdit(ResponseData.ReviewerId);
        setManagerWorklogs(
          ResponseData.ManagerId === null ? 0 : ResponseData.ManagerId
        );
        setManagerWorklogsEdit(
          ResponseData.ManagerId === null ? 0 : ResponseData.ManagerId
        );
        setReturnYearWorklogs(
          ResponseData.TypeOfReturnId === 0
            ? 0
            : ResponseData.TaxCustomFields === null
            ? 0
            : ResponseData.TaxCustomFields.ReturnYear
        );
        setReturnYearWorklogsEdit(
          ResponseData.TypeOfReturnId === 0
            ? 0
            : ResponseData.TaxCustomFields === null
            ? 0
            : ResponseData.TaxCustomFields.ReturnYear
        );
        setNoOfPagesWorklogs(
          ResponseData.TypeOfReturnId === 0
            ? 0
            : ResponseData.TaxCustomFields === null
            ? 0
            : ResponseData.TaxCustomFields.NoOfPages
        );
        setNoOfPagesWorklogsEdit(
          ResponseData.TypeOfReturnId === 0
            ? 0
            : ResponseData.TaxCustomFields === null
            ? 0
            : ResponseData.TaxCustomFields.NoOfPages
        );
        setChecklistWorkpaperWorklogs(
          ResponseData.ChecklistWorkpaper === true
            ? 1
            : ResponseData.ChecklistWorkpaper === false
            ? 2
            : 0
        );
        setChecklistWorkpaperWorklogsEdit(
          ResponseData.ChecklistWorkpaper === true
            ? 1
            : ResponseData.ChecklistWorkpaper === false
            ? 2
            : 0
        );
        setValueMonthYearFrom(
          ResponseData.PeriodFrom === null
            ? null
            : dayjs(ResponseData.PeriodFrom)
        );
        setValueMonthYearFromEdit(
          ResponseData.PeriodFrom === null
            ? null
            : dayjs(ResponseData.PeriodFrom)
        );
        setValueMonthYearTo(
          ResponseData.PeriodTo === null ? null : dayjs(ResponseData.PeriodTo)
        );
        setValueMonthYearToEdit(
          ResponseData.PeriodTo === null ? null : dayjs(ResponseData.PeriodTo)
        );
        setReworkReceiverDateWorklogs(
          !!ResponseData.ReworkReceivedDate
            ? ResponseData.ReworkReceivedDate
            : ""
        );
        setReworkReceiverDateWorklogsEdit(
          !!ResponseData.ReworkReceivedDate
            ? ResponseData.ReworkReceivedDate
            : ""
        );
        setReworkDueDateWorklogs(
          !!ResponseData.ReworkDueDate ? ResponseData.ReworkDueDate : ""
        );
        setReworkDueDateWorklogsEdit(
          !!ResponseData.ReworkDueDate ? ResponseData.ReworkDueDate : ""
        );
        setIsQaWorklogs(
          !!ResponseData.IsQARequired ? ResponseData.IsQARequired : 0
        );
        setIsQaWorklogsEdit(
          !!ResponseData.IsQARequired ? ResponseData.IsQARequired : 0
        );
        setQAQuantityWorklogsEdit(
          ResponseData.QAQuantity !== null
            ? Number(ResponseData.QAQuantity)
            : null
        );
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const getData = async () => {
      await getEditDataWorklogs();
    };
    getData();
  }, [onEdit, onOpen]);

  useEffect(() => {
    const getData = async () => {
      const statusData =
        typeOfWorkWorklogs > 0 &&
        (await getStatusDropdownData(typeOfWorkWorklogs));
      onOpen &&
        onEdit === 0 &&
        (await setStatusWorklogsDropdownDataUse(
          statusData.filter(
            (item: LabelValueType) =>
              item.Type === "PendingFromAccounting" ||
              item.Type === "Assigned" ||
              item.Type === "NotStarted" ||
              item.Type === "InProgress" ||
              item.Type === "Stop" ||
              item.Type === "OnHoldFromClient" ||
              item.Type === "WithDraw" ||
              item.Type === "WithdrawnbyClient" ||
              (typeOfWorkWorklogs !== 3 && item.Type === "PartialSubmitted") ||
              (onEdit > 0 &&
                (item.Type === "Rework" ||
                  item.Type === "ReworkInProgress" ||
                  item.Type === "ReworkPrepCompleted"))
          )
        ));
      onOpen &&
        onEdit > 0 &&
        !errorlogSignedOffPending &&
        setStatusWorklogsDropdownDataUse(
          statusData.filter(
            (item: LabelValueType) =>
              item.Type === "PendingFromAccounting" ||
              item.Type === "Assigned" ||
              item.Type === "OnHoldFromClient" ||
              item.Type === "WithDraw" ||
              item.Type === "WithdrawnbyClient" ||
              item.Type === "NotStarted" ||
              item.Type === "InProgress" ||
              item.Type === "Stop" ||
              item.Type === "Rework" ||
              item.value === statusWorklogs
          )
        );
      onOpen &&
        onEdit > 0 &&
        errorlogSignedOffPending &&
        setStatusWorklogsDropdownDataUse(
          statusData.filter(
            (item: LabelValueType) =>
              item.Type === "PendingFromAccounting" ||
              item.Type === "PartialSubmitted" ||
              item.Type === "Assigned" ||
              item.Type === "OnHoldFromClient" ||
              item.Type === "WithDraw" ||
              item.Type === "WithdrawnbyClient" ||
              item.Type === "Rework" ||
              item.Type === "ReworkInProgress" ||
              item.Type === "ReworkPrepCompleted" ||
              item.value === statusWorklogs
          )
        );
    };
    getData();
  }, [onOpen, typeOfWorkWorklogs]);

  useEffect(() => {
    const getData = async () => {
      const statusData =
        typeOfWorkWorklogsEdit > 0 &&
        (await getStatusDropdownData(typeOfWorkWorklogsEdit));
      typeOfWorkWorklogsEdit > 0 &&
        (await setStatusWorklogsDropdownData(statusData));
    };
    getData();
  }, [onOpen, typeOfWorkWorklogsEdit]);

  useEffect(() => {
    const getData = async () => {
      const departmentData = await getDepartmentDataByClient(
        clientNameWorklogs
      );
      departmentData.length > 0
        ? setDepartmentWorklogsDropdownData(departmentData)
        : setDepartmentWorklogsDropdownData([]);
      const departmentType =
        departmentData.length > 0 &&
        departmentData
          .map((i: LabelValueType) =>
            i.value == departmentWorklogs ? i.Type : false
          )
          .filter((j: number | boolean) => j !== false)[0];
      setDepartmentWorklogsType(departmentType);
    };
    clientNameWorklogs > 0 && getData();
  }, [clientNameWorklogs]);

  useEffect(() => {
    const deptType = departmentWorklogsDropdownData
      ?.map((i: LabelValueType) =>
        i.value === departmentWorklogs ? i.Type : false
      )
      .filter((j: any) => j != false)[0];
    setDepartmentWorklogsType(!!deptType ? deptType.toString() : "");
  }, [departmentWorklogs, departmentWorklogsDropdownData]);

  useEffect(() => {
    const getData = async () => {
      const departmentDataEdit = await getDepartmentDataByClient(
        clientNameWorklogsEdit
      );
      departmentDataEdit.length > 0
        ? setDepartmentWorklogsDropdownDataEdit(departmentDataEdit)
        : setDepartmentWorklogsDropdownDataEdit([]);
      const departmentType =
        departmentDataEdit.length > 0 &&
        departmentDataEdit
          .map((i: LabelValueType) =>
            i.value == departmentWorklogsEdit ? i.Type : false
          )
          .filter((j: number | boolean) => j !== false)[0];
      setDepartmentWorklogsTypeEdit(departmentType);
    };
    clientNameWorklogsEdit > 0 && getData();
  }, [clientNameWorklogsEdit]);

  useEffect(() => {
    const deptType = departmentWorklogsDropdownDataEdit
      ?.map((i: LabelValueType) =>
        i.value === departmentWorklogsEdit ? i.Type : false
      )
      .filter((j: any) => j != false)[0];
    setDepartmentWorklogsTypeEdit(!!deptType ? deptType.toString() : "");
  }, [departmentWorklogsEdit, departmentWorklogsDropdownDataEdit]);

  useEffect(() => {
    const getData = async () => {
      getUserDetails();
      setClientWorklogsDropdownData(await getClientDropdownData());
      const workTypeData =
        clientNameWorklogs > 0 &&
        (await getTypeOfWorkDropdownData(clientNameWorklogs));
      clientNameWorklogs > 0 &&
        setTypeOfWorkWorklogsDropdownData(
          await getTypeOfWorkDropdownData(clientNameWorklogs)
        );
      workTypeData.length > 0 &&
        onEdit === 0 &&
        setTypeOfWorkWorklogs(
          workTypeData.map((i: LabelValue) => i.value).includes(3)
            ? 3
            : workTypeData.map((i: LabelValue) => i.value).includes(1)
            ? 1
            : workTypeData.map((i: LabelValue) => i.value).includes(2)
            ? 2
            : 0
        );
    };

    onOpen && getData();
  }, [clientNameWorklogs, onOpen]);

  useEffect(() => {
    const getData = async () => {
      const projectData =
        clientNameWorklogs > 0 &&
        typeOfWorkWorklogs > 0 &&
        (await getProjectDropdownData(clientNameWorklogs, typeOfWorkWorklogs));
      projectData.length > 0
        ? setProjectWorklogsDropdownData(projectData)
        : setProjectWorklogsDropdownData([]);
      projectData.length > 0 &&
        projectData.length === 1 &&
        onEdit === 0 &&
        setProjectNameWorklogs(projectData.map((i: LabelValue) => i.value)[0]);

      const processData =
        clientNameWorklogs > 0 &&
        typeOfWorkWorklogs > 0 &&
        departmentWorklogs > 0 &&
        (await getProcessDropdownData(
          clientNameWorklogs,
          typeOfWorkWorklogs,
          departmentWorklogs
        ));
      processData.length > 0
        ? setProcessWorklogsDropdownData(
            processData?.map(
              (i: { Id: number; Name: string; EstimatedHour: number }) =>
                new Object({ label: i.Name, value: i.Id })
            )
          )
        : setProcessWorklogsDropdownData([]);

      const data =
        processNameWorklogs !== 0 &&
        (await getSubProcessDropdownData(
          clientNameWorklogs,
          typeOfWorkWorklogs,
          processNameWorklogs
        ));
      data.length > 0 && setEstTimeDataWorklogs(data);
      data.length > 0
        ? setSubProcessWorklogsDropdownData(
            data.map(
              (i: { Id: number; Name: string; EstimatedHour: number }) =>
                new Object({ label: i.Name, value: i.Id })
            )
          )
        : setSubProcessWorklogsDropdownData([]);
    };

    getData();
  }, [processNameWorklogs, typeOfWorkWorklogs, departmentWorklogs]);

  useEffect(() => {
    const getData = async () => {
      setManagerWorklogsDropdownData(
        await getManagerDropdownData(typeOfWorkWorklogs)
      );
      setAssigneeWorklogsDropdownData(
        await getAssigneeDropdownData([clientNameWorklogs], typeOfWorkWorklogs)
      );

      setReviewerWorklogsDropdownData(
        await getReviewerDropdownData([clientNameWorklogs], typeOfWorkWorklogs)
      );
    };

    typeOfWorkWorklogs !== 0 && getData();
  }, [typeOfWorkWorklogs, clientNameWorklogs]);

  // Edit dropdown
  useEffect(() => {
    const getData = async () => {
      clientNameWorklogsEdit > 0 &&
        setTypeOfWorkWorklogsDropdownDataEdit(
          await getTypeOfWorkDropdownData(clientNameWorklogsEdit)
        );
    };

    onOpen && getData();
  }, [clientNameWorklogsEdit, onOpen]);

  useEffect(() => {
    const getData = async () => {
      const projectData =
        clientNameWorklogsEdit > 0 &&
        typeOfWorkWorklogsEdit > 0 &&
        (await getProjectDropdownData(
          clientNameWorklogsEdit,
          typeOfWorkWorklogsEdit
        ));
      projectData.length > 0 && setProjectWorklogsDropdownDataEdit(projectData);

      const processData =
        clientNameWorklogsEdit > 0 &&
        typeOfWorkWorklogsEdit > 0 &&
        departmentWorklogsEdit > 0 &&
        (await getProcessDropdownData(
          clientNameWorklogsEdit,
          typeOfWorkWorklogsEdit,
          departmentWorklogsEdit
        ));
      processData.length > 0
        ? setProcessWorklogsDropdownDataEdit(
            processData?.map(
              (i: { Id: number; Name: string; EstimatedHour: number }) =>
                new Object({ label: i.Name, value: i.Id })
            )
          )
        : setProcessWorklogsDropdownDataEdit([]);

      const data =
        processNameWorklogsEdit !== 0 &&
        (await getSubProcessDropdownData(
          clientNameWorklogsEdit,
          typeOfWorkWorklogsEdit,
          processNameWorklogsEdit
        ));
      data.length > 0 && setEstTimeDataWorklogsEdit(data);
      data.length > 0
        ? setSubProcessWorklogsDropdownDataEdit(
            data.map(
              (i: { Id: number; Name: string; EstimatedHour: number }) =>
                new Object({ label: i.Name, value: i.Id })
            )
          )
        : setSubProcessWorklogsDropdownDataEdit([]);
    };

    getData();
  }, [processNameWorklogsEdit, typeOfWorkWorklogsEdit, departmentWorklogsEdit]);

  useEffect(() => {
    const getData = async () => {
      setManagerWorklogsDropdownDataEdit(
        await getManagerDropdownData(typeOfWorkWorklogsEdit)
      );
      setAssigneeWorklogsDropdownDataEdit(
        await getAssigneeDropdownData(
          [clientNameWorklogsEdit],
          typeOfWorkWorklogsEdit
        )
      );

      setReviewerWorklogsDropdownDataEdit(
        await getReviewerDropdownData(
          [clientNameWorklogsEdit],
          typeOfWorkWorklogsEdit
        )
      );
    };

    typeOfWorkWorklogs > 0 && getData();
  }, [typeOfWorkWorklogsEdit, clientNameWorklogsEdit]);

  const getUserDetails = async () => {
    const params = {};
    const url = `${process.env.api_url}/auth/getuserdetails`;
    const successCallback = (
      ResponseData: User,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setAssigneeWorklogsDisable(ResponseData.IsHaveManageAssignee);
        !ResponseData.IsHaveManageAssignee &&
          setAssigneeWorklogs(ResponseData.UserId);
      }
    };
    callAPI(url, params, successCallback, "GET");
  };

  const handleClose = () => {
    setIsLoadingWorklogs(false);
    setEditDataWorklogs(null);

    setClientNameWorklogs(0);
    setTypeOfWorkWorklogs(0);
    setProjectNameWorklogs(0);
    setClientTaskNameWorklogs("");
    setProcessNameWorklogs(0);
    setSubProcessWorklogs(0);
    setManagerWorklogs(0);
    setStatusWorklogs(0);
    setDescriptionWorklogs("");
    setPriorityWorklogs(0);
    setQuantityWorklogs(1);
    setReceiverDateWorklogs("");
    setDueDateWorklogs("");
    setAllInfoDateWorklogs("");
    setAssigneeWorklogs(0);
    setAssigneeWorklogsDisable(true);
    setReviewerWorklogs(0);
    setDepartmentWorklogs(0);
    setDepartmentWorklogsType("");
    setDateOfReviewWorklogs("");
    setDateOfPreperationWorklogs("");
    setEstTimeDataWorklogs([]);
    setReturnYearWorklogs(0);
    setNoOfPagesWorklogs(0);
    setChecklistWorkpaperWorklogs(0);
    setValueMonthYearFrom(null);
    setValueMonthYearTo(null);
    setReworkReceiverDateWorklogs(null);
    setReworkDueDateWorklogs(null);
    setIsQaWorklogs(0);

    setClientNameWorklogsEdit(0);
    setClientNameWorklogsEditErr(false);
    setTypeOfWorkWorklogsEdit(0);
    setTypeOfWorkWorklogsEditErr(false);
    setProjectNameWorklogsEdit(0);
    setProjectNameWorklogsEditErr(false);
    setClientTaskNameWorklogsEdit("");
    setClientTaskNameWorklogsEditErr(false);
    setProcessNameWorklogsEdit(0);
    setProcessNameWorklogsEditErr(false);
    setSubProcessWorklogsEdit(0);
    setSubProcessWorklogsEditErr(false);
    setManagerWorklogsEdit(0);
    setManagerWorklogsEditErr(false);
    setStatusWorklogsEdit(0);
    setStatusWorklogsEditErr(false);
    setDescriptionWorklogsEdit("");
    setPriorityWorklogsEdit(0);
    setQuantityWorklogsEdit(1);
    setQuantityWorklogsEditErr(false);
    setReceiverDateWorklogs("");
    setReceiverDateWorklogsEditErr(false);
    setDueDateWorklogsEdit("");
    setAllInfoDateWorklogsEdit("");
    setAssigneeWorklogsEdit(0);
    setAssigneeWorklogsEditErr(false);
    setReviewerWorklogsEdit(0);
    setReviewerWorklogsEditErr(false);
    setDepartmentWorklogsEdit(0);
    setDepartmentWorklogsEditErr(false);
    setDepartmentWorklogsTypeEdit("");
    setEstTimeDataWorklogsEdit([]);
    setReturnYearWorklogsEdit(0);
    setReturnYearWorklogsEditErr(false);
    setNoOfPagesWorklogsEdit(0);
    setChecklistWorkpaperWorklogsEdit(0);
    setChecklistWorkpaperWorklogsEditErr(false);
    setValueMonthYearFromEdit(null);
    setValueMonthYearToEdit(null);
    setReworkReceiverDateWorklogsEdit(null);
    setReworkDueDateWorklogsEdit(null);
    setIsQaWorklogsEdit(0);
    setQAQuantityWorklogsEdit(null);

    setClientWorklogsDropdownData([]);
    setTypeOfWorkWorklogsDropdownData([]);
    setProjectWorklogsDropdownData([]);
    setProcessWorklogsDropdownData([]);
    setSubProcessWorklogsDropdownData([]);
    setStatusWorklogsDropdownData([]);
    setStatusWorklogsDropdownDataUse([]);
    setAssigneeWorklogsDropdownData([]);
    setReviewerWorklogsDropdownData([]);
    setManagerWorklogsDropdownData([]);

    setTypeOfWorkWorklogsDropdownDataEdit([]);
    setProjectWorklogsDropdownDataEdit([]);
    setProcessWorklogsDropdownDataEdit([]);
    setSubProcessWorklogsDropdownDataEdit([]);
    setAssigneeWorklogsDropdownDataEdit([]);
    setReviewerWorklogsDropdownDataEdit([]);

    onDataFetch?.();

    if (typeof window !== "undefined") {
      const pathname = window.location.href.includes("id=");
      if (pathname) {
        onClose();
        router.push("/worklogs");
      } else {
        onClose();
      }
    }
  };

  // useEffect(() => {
  //   if (typeOfWorkWorklogsEdit > 0 && typeOfWorkWorklogsEdit !== 3) {
  //     const reviewerDate = dayjs();
  //     setReceiverDateWorklogsEdit(reviewerDate.toISOString());
  //     setReceiverDateWorklogsEditErr(false);
  //     let nextDate: any = reviewerDate;
  //     if (reviewerDate.day() === 4) {
  //       nextDate = nextDate.add(4, "day");
  //     } else if (reviewerDate.day() === 5) {
  //       nextDate = nextDate.add(4, "day");
  //     } else if (reviewerDate.day() === 6) {
  //       nextDate = nextDate.add(4, "day");
  //     } else {
  //       nextDate = dayjs(reviewerDate).add(3, "day").toDate();
  //     }
  //     setDueDateWorklogsEdit(nextDate);
  //   } else {
  //     setReceiverDateWorklogsEdit("");
  //     setDueDateWorklogsEdit("");
  //   }
  // }, [typeOfWorkWorklogsEdit]);

  return (
    <>
      <div
        className={`fixed top-0 right-0 z-30 h-screen w-[1300px] border border-lightSilver bg-pureWhite transform  ${
          onOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="sticky top-0 !h-[9%] bg-whiteSmoke border-b z-30 border-lightSilver">
          <div className="flex px-[6px] justify-between items-center pt-4">
            <div className="flex items-center pl-[5px]">Edit Task</div>
            <Tooltip title="Close" placement="left" arrow>
              <IconButton className="mr-[10px]" onClick={handleClose}>
                <Close />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <div className="overflow-y-scroll !h-[91%]">
          {hasPermissionWorklog("Task/SubTask", "View", "WorkLogs") && (
            <div className="pt-1" id="tabpanel-0">
              <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                <span className="flex items-center">
                  <TaskIcon />
                  <span className="ml-[21px]">Task</span>
                </span>
                <div className="flex gap-4">
                  {onEdit > 0 && (
                    <span>
                      Created By :&nbsp;
                      {editDataWorklogs !== null &&
                        editDataWorklogs?.CreatedByName}
                    </span>
                  )}
                  <span
                    className={`cursor-pointer ${
                      taskWorklogsDrawer ? "rotate-180" : ""
                    }`}
                    onClick={() => setTaskWorklogsDrawer(!taskWorklogsDrawer)}
                  >
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
              {taskWorklogsDrawer && (
                <Grid container className="px-8">
                  <Grid item xs={3} className="pt-4">
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      options={clientWorklogsDropdownData}
                      value={
                        clientWorklogsDropdownData.find(
                          (i: LabelValue) => i.value === clientNameWorklogs
                        ) || null
                      }
                      disabled
                      sx={{ mx: 0.75, width: 300 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          label={
                            <span>
                              Client Name
                              <span className="text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={3} className="pt-4">
                    <FormControl
                      variant="standard"
                      sx={{ mx: 0.75, width: 300, mt: -0.3 }}
                      disabled
                    >
                      <InputLabel id="demo-simple-select-standard-label">
                        Type of Work
                        <span className="text-defaultRed">&nbsp;*</span>
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-standard-label"
                        id="demo-simple-select-standard"
                        value={
                          typeOfWorkWorklogs === 0 ? "" : typeOfWorkWorklogs
                        }
                      >
                        {typeOfWorkWorklogsDropdownData.map(
                          (i: LabelValue, index: number) => (
                            <MenuItem value={i.value} key={index}>
                              {i.label}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3} className="pt-4">
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      options={projectWorklogsDropdownData}
                      value={
                        projectWorklogsDropdownData.find(
                          (i: LabelValue) => i.value === projectNameWorklogs
                        ) || null
                      }
                      disabled
                      sx={{ mx: 0.75, width: 300 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          label={
                            <span>
                              Project Name
                              <span className="text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={3} className="pt-4">
                    <Autocomplete
                      id="combo-box-demo"
                      options={statusWorklogsDropdownDataUse}
                      value={
                        statusWorklogsDropdownDataUse.find(
                          (i: LabelValueType) => i.value === statusWorklogs
                        ) || null
                      }
                      disabled
                      sx={{ mx: 0.75, width: 300 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          label={
                            <span>
                              Status
                              <span className="text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={3} className="pt-4">
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      options={departmentWorklogsDropdownData}
                      disabled
                      value={
                        departmentWorklogsDropdownData.find(
                          (i: LabelValueType) => i.value === departmentWorklogs
                        ) || null
                      }
                      sx={{
                        width: 300,
                        mx: 0.75,
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          label={
                            <span>
                              Department
                              <span className="text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={3} className="pt-4">
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      options={processWorklogsDropdownData}
                      value={
                        processWorklogsDropdownData.find(
                          (i: LabelValue) => i.value === processNameWorklogs
                        ) || null
                      }
                      disabled
                      sx={{ mx: 0.75, width: 300 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          label={
                            <span>
                              Process Name
                              <span className="text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={3} className="pt-4">
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      options={subProcessWorklogsDropdownData}
                      value={
                        subProcessWorklogsDropdownData.find(
                          (i: LabelValue) => i.value === subProcessWorklogs
                        ) || null
                      }
                      disabled
                      sx={{ mx: 0.75, width: 300 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          label={
                            <span>
                              Sub-Process
                              <span className="text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={3} className="pt-4">
                    <TextField
                      label={
                        <span>
                          Task Name
                          <span className="!text-defaultRed">&nbsp;*</span>
                        </span>
                      }
                      fullWidth
                      className="pt-1"
                      disabled
                      value={
                        clientTaskNameWorklogs?.trim().length <= 0
                          ? ""
                          : clientTaskNameWorklogs
                      }
                      margin="normal"
                      variant="standard"
                      sx={{ mx: 0.75, width: 300, mt: -0.5 }}
                    />
                  </Grid>
                  <Grid item xs={3} className="pt-4">
                    <TextField
                      label={
                        departmentWorklogsType === "WhitelabelTaxation" ? (
                          "Description"
                        ) : (
                          <span>
                            Description
                            <span className="!text-defaultRed">&nbsp;*</span>
                          </span>
                        )
                      }
                      fullWidth
                      value={
                        descriptionWorklogs?.trim().length <= 0
                          ? ""
                          : descriptionWorklogs
                      }
                      disabled
                      margin="normal"
                      variant="standard"
                      sx={{ mx: 0.75, width: 300, mt: -0.8 }}
                    />
                  </Grid>
                  <Grid item xs={3} className="pt-4">
                    <FormControl
                      variant="standard"
                      sx={{ mx: 0.75, width: 300, mt: -1.2 }}
                      disabled
                    >
                      <InputLabel id="demo-simple-select-standard-label">
                        Priority
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-standard-label"
                        id="demo-simple-select-standard"
                        value={priorityWorklogs === 0 ? "" : priorityWorklogs}
                      >
                        <MenuItem value={1}>High</MenuItem>
                        <MenuItem value={2}>Medium</MenuItem>
                        <MenuItem value={3}>Low</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3} className="pt-4">
                    <TextField
                      label="Estimated Time"
                      disabled
                      fullWidth
                      value={
                        subProcessWorklogs > 0
                          ? (estTimeDataWorklogs as any[])
                              .map((i) => {
                                const hours = Math.floor(
                                  i.EstimatedHour / 3600
                                );
                                const minutes = Math.floor(
                                  (i.EstimatedHour % 3600) / 60
                                );
                                const remainingSeconds = i.EstimatedHour % 60;
                                const formattedHours = hours
                                  .toString()
                                  .padStart(2, "0");
                                const formattedMinutes = minutes
                                  .toString()
                                  .padStart(2, "0");
                                const formattedSeconds = remainingSeconds
                                  .toString()
                                  .padStart(2, "0");
                                return subProcessWorklogs === i.Id
                                  ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
                                  : null;
                              })
                              .filter((i) => i !== null)
                          : ""
                      }
                      margin="normal"
                      variant="standard"
                      sx={{ mx: 0.75, width: 300, mt: -0.8 }}
                    />
                  </Grid>
                  <Grid item xs={3} className="pt-4">
                    <TextField
                      label={
                        <span>
                          Quantity
                          <span className="!text-defaultRed">&nbsp;*</span>
                        </span>
                      }
                      onFocus={(e) =>
                        e.target.addEventListener(
                          "wheel",
                          function (e) {
                            e.preventDefault();
                          },
                          { passive: false }
                        )
                      }
                      type="number"
                      fullWidth
                      disabled
                      value={quantityWorklogs}
                      margin="normal"
                      variant="standard"
                      sx={{ mx: 0.75, width: 300, mt: -0.8 }}
                    />
                  </Grid>
                  <Grid item xs={3} className="pt-4">
                    <TextField
                      label="Standard Time"
                      fullWidth
                      value={
                        subProcessWorklogs > 0
                          ? (estTimeDataWorklogs as any[])
                              .map((i) => {
                                const hours = Math.floor(
                                  (i.EstimatedHour * quantityWorklogs) / 3600
                                );
                                const minutes = Math.floor(
                                  ((i.EstimatedHour * quantityWorklogs) %
                                    3600) /
                                    60
                                );
                                const remainingSeconds =
                                  (i.EstimatedHour * quantityWorklogs) % 60;
                                const formattedHours = hours
                                  .toString()
                                  .padStart(2, "0");
                                const formattedMinutes = minutes
                                  .toString()
                                  .padStart(2, "0");
                                const formattedSeconds = remainingSeconds
                                  .toString()
                                  .padStart(2, "0");
                                return subProcessWorklogs === i.Id
                                  ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
                                  : null;
                              })
                              .filter((i) => i !== null)
                          : ""
                      }
                      disabled
                      margin="normal"
                      variant="standard"
                      sx={{
                        mx: 0.75,
                        maxWidth: 300,
                        mt: typeOfWorkWorklogs === 3 ? -0.9 : -0.8,
                      }}
                    />
                  </Grid>
                  <Grid item xs={3} className="pt-4">
                    <div
                      className={`inline-flex -mt-[11px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]`}
                    >
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label={
                            <span>
                              Received Date
                              <span className="!text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                          disabled
                          value={
                            receiverDateWorklogs === ""
                              ? null
                              : dayjs(receiverDateWorklogs)
                          }
                          shouldDisableDate={isWeekend}
                          maxDate={dayjs(Date.now())}
                          slotProps={{
                            textField: {
                              readOnly: true,
                            } as Record<string, any>,
                          }}
                        />
                      </LocalizationProvider>
                    </div>
                  </Grid>
                  <Grid item xs={3} className="pt-4">
                    <div
                      className={`inline-flex -mt-[11px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]`}
                    >
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label={
                            <span>
                              Due Date
                              <span className="!text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                          value={
                            dueDateWorklogs === ""
                              ? null
                              : dayjs(dueDateWorklogs)
                          }
                          disabled
                          onChange={(newDate: any) => {
                            setDueDateWorklogs(newDate.$d);
                          }}
                          slotProps={{
                            textField: {
                              readOnly: true,
                            } as Record<string, any>,
                          }}
                        />
                      </LocalizationProvider>
                    </div>
                  </Grid>
                  {departmentWorklogsType === "WhitelabelTaxation" && (
                    <Grid item xs={3} className="pt-4">
                      <div
                        className={`inline-flex -mt-[11px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]`}
                      >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="All Info Date"
                            disabled
                            value={
                              allInfoDateWorklogs === ""
                                ? null
                                : dayjs(allInfoDateWorklogs)
                            }
                          />
                        </LocalizationProvider>
                      </div>
                    </Grid>
                  )}
                  <Grid
                    item
                    xs={3}
                    className={`${
                      typeOfWorkWorklogs === 3 &&
                      departmentWorklogsType !== "WhitelabelTaxation"
                        ? "pt-2"
                        : typeOfWorkWorklogs === 3 &&
                          departmentWorklogsType === "WhitelabelTaxation"
                        ? "pt-4"
                        : departmentWorklogsType !== "WhitelabelTaxation"
                        ? "pt-[17px]"
                        : "pt-5"
                    }`}
                  >
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      options={assigneeWorklogsDropdownData}
                      disabled
                      value={
                        assigneeWorklogsDropdownData.find(
                          (i: LabelValue) => i.value === assigneeWorklogs
                        ) || null
                      }
                      sx={{
                        width: 300,
                        mt: typeOfWorkWorklogs === 3 ? 0.2 : -1,
                        mx: 0.75,
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          label={
                            <span>
                              Assignee
                              <span className="text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={3}
                    className={`${typeOfWorkWorklogs === 3 ? "pt-4" : "pt-5"}`}
                  >
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      options={reviewerWorklogsDropdownData}
                      disabled
                      value={
                        reviewerWorklogsDropdownData.find(
                          (i: LabelValue) => i.value === reviewerWorklogs
                        ) || null
                      }
                      sx={{
                        width: 300,
                        mt: typeOfWorkWorklogs === 3 ? 0.2 : -1,
                        mx: 0.75,
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          label={
                            <span>
                              Reviewer
                              <span className="text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={3}
                    className={`${typeOfWorkWorklogs === 3 ? "pt-4" : "pt-5"}`}
                  >
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      options={managerWorklogsDropdownData}
                      disabled
                      value={
                        managerWorklogsDropdownData.find(
                          (i: LabelValue) => i.value === managerWorklogs
                        ) || null
                      }
                      sx={{
                        width: 300,
                        mt: typeOfWorkWorklogs === 3 ? 0.2 : -1,
                        mx: 0.75,
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          label={
                            <span>
                              Manager
                              <span className="text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                        />
                      )}
                    />
                  </Grid>
                  {departmentWorklogsType === "SMB" && (
                    <Grid
                      item
                      xs={3}
                      className={`${
                        typeOfWorkWorklogs === 3 ? "pt-4" : "pt-5"
                      }`}
                    >
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={isQaWorklogsDropdownData}
                        disabled
                        value={
                          isQaWorklogsDropdownData.find(
                            (i: LabelValue) => i.value === isQaWorklogs
                          ) || null
                        }
                        onChange={(e, value: LabelValue | null) => {}}
                        sx={{
                          width: 300,
                          mt: typeOfWorkWorklogs === 3 ? 0.2 : -1,
                          mx: 0.75,
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label="Is QA"
                          />
                        )}
                      />
                    </Grid>
                  )}
                  {(departmentWorklogsType === "WhitelabelAccounting" ||
                    departmentWorklogsType === "WhitelabelAustralia" ||
                    departmentWorklogsType === "UK" ||
                    departmentWorklogsType === "Germany") && (
                    <Grid
                      item
                      xs={3}
                      className={`${
                        typeOfWorkWorklogs === 3 ? "pt-4" : "pt-5"
                      }`}
                    >
                      <div
                        className={`inline-flex -mt-[11px] mx-[6px] muiDatepickerCustomizer muiDatepickerCustomizerMonth w-full max-w-[300px]`}
                      >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            minDate={dayjs(previousYearStartDate)}
                            maxDate={dayjs(currentYearEndDate)}
                            views={["year", "month"]}
                            label="Period From"
                            disabled
                            value={
                              valueMonthYearFrom === ""
                                ? null
                                : valueMonthYearFrom
                            }
                            onChange={(newDate: any) =>
                              setValueMonthYearFrom(newDate.$d)
                            }
                          />
                        </LocalizationProvider>
                      </div>
                    </Grid>
                  )}
                  {(departmentWorklogsType === "WhitelabelAccounting" ||
                    departmentWorklogsType === "WhitelabelAustralia" ||
                    departmentWorklogsType === "UK" ||
                    departmentWorklogsType === "Germany") && (
                    <Grid
                      item
                      xs={3}
                      className={`${
                        typeOfWorkWorklogs === 3 ? "pt-4" : "pt-5"
                      }`}
                    >
                      <div
                        className={`inline-flex -mt-[11px] mx-[6px] muiDatepickerCustomizer muiDatepickerCustomizerMonth w-full max-w-[300px]`}
                      >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            minDate={dayjs(previousYearStartDate)}
                            maxDate={dayjs(currentYearEndDate)}
                            views={["year", "month"]}
                            label="Period To"
                            disabled
                            value={
                              valueMonthYearTo === "" ? null : valueMonthYearTo
                            }
                            onChange={(newDate: any) =>
                              setValueMonthYearTo(newDate.$d)
                            }
                          />
                        </LocalizationProvider>
                      </div>
                    </Grid>
                  )}
                  {typeOfWorkWorklogs === 3 && (
                    <>
                      <Grid item xs={3} className="pt-4">
                        <FormControl
                          variant="standard"
                          sx={{ width: 300, mt: -0.3, mx: 0.75 }}
                          disabled
                        >
                          <InputLabel id="demo-simple-select-standard-label">
                            Return Year
                            <span className="text-defaultRed">&nbsp;*</span>
                          </InputLabel>
                          <Select
                            labelId="demo-simple-select-standard-label"
                            id="demo-simple-select-standard"
                            value={
                              returnYearWorklogs === 0 ? "" : returnYearWorklogs
                            }
                          >
                            {yearWorklogsDrawerDropdown.map(
                              (i: LabelValue, index: number) => (
                                <MenuItem value={i.value} key={index}>
                                  {i.label}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={3} className="pt-4">
                        <TextField
                          label="No of Pages"
                          type="number"
                          fullWidth
                          disabled
                          value={
                            noOfPagesWorklogs === 0 ? "" : noOfPagesWorklogs
                          }
                          margin="normal"
                          variant="standard"
                          sx={{ width: 300, mt: 0, mx: 0.75 }}
                        />
                      </Grid>
                      <Grid item xs={3} className="pt-4">
                        <FormControl
                          variant="standard"
                          sx={{ width: 300, mt: -0.4, mx: 0.75 }}
                          disabled
                        >
                          <InputLabel id="demo-simple-select-standard-label">
                            Checklist/Workpaper
                            <span className="text-defaultRed">&nbsp;*</span>
                          </InputLabel>
                          <Select
                            labelId="demo-simple-select-standard-label"
                            id="demo-simple-select-standard"
                            value={
                              checklistWorkpaperWorklogs === 0
                                ? ""
                                : checklistWorkpaperWorklogs
                            }
                          >
                            <MenuItem value={1}>Yes</MenuItem>
                            <MenuItem value={2}>No</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </>
                  )}
                  {onEdit > 0 && (
                    <>
                      <Grid
                        item
                        xs={3}
                        className={`${
                          typeOfWorkWorklogs === 3 ? "pt-4" : "pt-5"
                        }`}
                      >
                        <TextField
                          label="Date of Preperation"
                          type={inputTypePreperationWorklogsDrawer}
                          disabled
                          fullWidth
                          value={dateOfPreperationWorklogs}
                          onChange={(e) =>
                            setDateOfPreperationWorklogs(e.target.value)
                          }
                          onFocus={() =>
                            setInputTypePreperationWorklogsDrawer("date")
                          }
                          onBlur={() => {
                            setInputTypePreperationWorklogsDrawer("text");
                          }}
                          margin="normal"
                          variant="standard"
                          sx={{
                            width: 300,
                            mt: typeOfWorkWorklogs === 3 ? 0 : -1,
                            mx: 0.75,
                          }}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={3}
                        className={`${
                          typeOfWorkWorklogs === 3 ? "pt-4" : "pt-5"
                        }`}
                      >
                        <TextField
                          label="Date of Review"
                          disabled
                          type={inputTypeReviewWorklogsDrawer}
                          fullWidth
                          value={dateOfReviewWorklogs}
                          onChange={(e) =>
                            setDateOfReviewWorklogs(e.target.value)
                          }
                          onFocus={() =>
                            setInputTypeReviewWorklogsDrawer("date")
                          }
                          onBlur={() => {
                            setInputTypeReviewWorklogsDrawer("text");
                          }}
                          margin="normal"
                          variant="standard"
                          sx={{
                            width: 300,
                            mt: typeOfWorkWorklogs === 3 ? 0 : -1,
                            mx: 0.75,
                          }}
                        />
                      </Grid>
                      {!!reworkReceiverDateWorklogs && (
                        <Grid item xs={3} className="pt-5">
                          <div
                            className={`inline-flex -mt-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]`}
                          >
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DatePicker
                                label={
                                  <span>
                                    Rework Received Date
                                    <span className="!text-defaultRed">
                                      &nbsp;*
                                    </span>
                                  </span>
                                }
                                disabled
                                value={
                                  reworkReceiverDateWorklogs === ""
                                    ? null
                                    : dayjs(reworkReceiverDateWorklogs)
                                }
                                slotProps={{
                                  textField: {
                                    readOnly: true,
                                  } as Record<string, any>,
                                }}
                              />
                            </LocalizationProvider>
                          </div>
                        </Grid>
                      )}
                      {!!reworkDueDateWorklogs && (
                        <Grid
                          item
                          xs={3}
                          className={`${
                            typeOfWorkWorklogs === 3 ? "pt-4" : "pt-6"
                          }`}
                        >
                          <div
                            className={`inline-flex -mt-[11px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]`}
                          >
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DatePicker
                                label={
                                  <span>
                                    Rework Due Date
                                    <span className="!text-defaultRed">
                                      &nbsp;*
                                    </span>
                                  </span>
                                }
                                value={
                                  reworkDueDateWorklogs === ""
                                    ? null
                                    : dayjs(reworkDueDateWorklogs)
                                }
                                disabled
                                slotProps={{
                                  textField: {
                                    readOnly: true,
                                  } as Record<string, any>,
                                }}
                              />
                            </LocalizationProvider>
                          </div>
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              )}
            </div>
          )}

          {/* Edit form data */}
          <form onSubmit={handleSubmit} className="mt-20">
            {hasPermissionWorklog("Task/SubTask", "View", "WorkLogs") && (
              <div className="pt-1" id="tabpanel-0">
                <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                  <span className="flex items-center">
                    <TaskIcon />
                    <span className="ml-[21px]">Edit Task</span>
                  </span>
                  <div className="flex gap-4">
                    <span
                      className={`cursor-pointer ${
                        taskWorklogsEditDrawer ? "rotate-180" : ""
                      }`}
                      onClick={() =>
                        setTaskWorklogsEditDrawer(!taskWorklogsEditDrawer)
                      }
                    >
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                {taskWorklogsEditDrawer && (
                  <Grid container className="px-8">
                    <Grid item xs={3} className="pt-4">
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={clientWorklogsDropdownData}
                        value={
                          clientWorklogsDropdownData.find(
                            (i: LabelValue) =>
                              i.value === clientNameWorklogsEdit
                          ) || null
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setClientNameWorklogsEdit(value.value);
                          setTypeOfWorkWorklogsEdit(0);
                          setTypeOfWorkWorklogsEditErr(false);
                          setProjectNameWorklogsEdit(0);
                          setProjectNameWorklogsEditErr(false);
                          setStatusWorklogsEdit(0);
                          setStatusWorklogsEditErr(false);
                          setProcessNameWorklogsEdit(0);
                          setProcessNameWorklogsEditErr(false);
                          setSubProcessWorklogsEdit(0);
                          setSubProcessWorklogsEditErr(false);
                          assigneeWorklogsDisable && setAssigneeWorklogsEdit(0);
                          assigneeWorklogsDisable &&
                            setAssigneeWorklogsEditErr(false);
                          setReviewerWorklogsEdit(0);
                          setReviewerWorklogsEditErr(false);
                          setDepartmentWorklogsEdit(0);
                          setDepartmentWorklogsEditErr(false);
                          setDepartmentWorklogsTypeEdit("");
                          setValueMonthYearFromEdit(null);
                          setValueMonthYearToEdit(null);
                          setManagerWorklogsEdit(0);
                          setManagerWorklogsEditErr(false);
                        }}
                        sx={{ mx: 0.75, width: 300 }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label={
                              <span>
                                Client Name
                                <span className="text-defaultRed">&nbsp;*</span>
                              </span>
                            }
                            error={clientNameWorklogsEditErr}
                            onBlur={() => {
                              if (clientNameWorklogsEdit > 0) {
                                setClientNameWorklogsEditErr(false);
                              }
                            }}
                            helperText={
                              clientNameWorklogsEditErr
                                ? "This is a required field."
                                : ""
                            }
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <FormControl
                        variant="standard"
                        sx={{ mx: 0.75, width: 300, mt: -0.3 }}
                        error={typeOfWorkWorklogsEditErr}
                      >
                        <InputLabel id="demo-simple-select-standard-label">
                          Type of Work
                          <span className="text-defaultRed">&nbsp;*</span>
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-standard-label"
                          id="demo-simple-select-standard"
                          value={
                            typeOfWorkWorklogsEdit === 0
                              ? ""
                              : typeOfWorkWorklogsEdit
                          }
                          onChange={(e) => {
                            assigneeWorklogsDisable &&
                              setAssigneeWorklogsEdit(0);
                            setReviewerWorklogsEdit(0);
                            setTypeOfWorkWorklogsEdit(Number(e.target.value));
                            setProjectNameWorklogsEdit(0);
                            setProjectNameWorklogsEditErr(false);
                            setProcessNameWorklogsEdit(0);
                            setProcessNameWorklogsEditErr(false);
                            setSubProcessWorklogsEdit(0);
                            setSubProcessWorklogsEditErr(false);
                            setStatusWorklogsEdit(0);
                            setStatusWorklogsEditErr(false);
                            setDepartmentWorklogsEdit(0);
                            setDepartmentWorklogsEditErr(false);
                            setDepartmentWorklogsTypeEdit("");
                            setValueMonthYearFromEdit(null);
                            setValueMonthYearToEdit(null);
                            setManagerWorklogsEdit(0);
                            setManagerWorklogsEditErr(false);
                          }}
                          onBlur={() => {
                            if (typeOfWorkWorklogsEdit > 0) {
                              setTypeOfWorkWorklogsEditErr(false);
                            }
                          }}
                        >
                          {typeOfWorkWorklogsDropdownDataEdit.map(
                            (i: LabelValue, index: number) => (
                              <MenuItem value={i.value} key={index}>
                                {i.label}
                              </MenuItem>
                            )
                          )}
                        </Select>
                        {typeOfWorkWorklogsEditErr && (
                          <FormHelperText>
                            This is a required field.
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={projectWorklogsDropdownDataEdit}
                        value={
                          projectWorklogsDropdownDataEdit.find(
                            (i: LabelValue) =>
                              i.value === projectNameWorklogsEdit
                          ) || null
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setProjectNameWorklogsEdit(value.value);
                        }}
                        sx={{ mx: 0.75, width: 300 }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label={
                              <span>
                                Project Name
                                <span className="text-defaultRed">&nbsp;*</span>
                              </span>
                            }
                            error={projectNameWorklogsEditErr}
                            onBlur={() => {
                              if (projectNameWorklogsEdit > 0) {
                                setProjectNameWorklogsEditErr(false);
                              }
                            }}
                            helperText={
                              projectNameWorklogsEditErr
                                ? "This is a required field."
                                : ""
                            }
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <Autocomplete
                        id="combo-box-demo"
                        options={statusWorklogsDropdownData}
                        value={
                          statusWorklogsDropdownData.find(
                            (i: LabelValueType) =>
                              i.value === statusWorklogsEdit
                          ) || null
                        }
                        onChange={(e, value: LabelValueType | null) => {
                          value && setStatusWorklogsEdit(value.value);
                        }}
                        sx={{ mx: 0.75, width: 300 }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label={
                              <span>
                                Status
                                <span className="text-defaultRed">&nbsp;*</span>
                              </span>
                            }
                            error={statusWorklogsEditErr}
                            onBlur={() => {
                              if (statusWorklogsEdit > 0) {
                                setStatusWorklogsEditErr(false);
                              }
                            }}
                            helperText={
                              statusWorklogsEditErr
                                ? "This is a required field."
                                : ""
                            }
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={departmentWorklogsDropdownDataEdit}
                        value={
                          departmentWorklogsDropdownDataEdit.find(
                            (i: LabelValue) =>
                              i.value === departmentWorklogsEdit
                          ) || null
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setDepartmentWorklogsEdit(value.value);
                          setProcessNameWorklogsEdit(0);
                          setSubProcessWorklogsEdit(0);
                          setValueMonthYearFromEdit(null);
                          setValueMonthYearToEdit(null);
                          setDescriptionWorklogsEdit("");
                          setDescriptionWorklogsEditErr(false);
                          setAllInfoDateWorklogsEdit("");
                        }}
                        sx={{
                          width: 300,
                          mx: 0.75,
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label={
                              <span>
                                Department
                                <span className="text-defaultRed">&nbsp;*</span>
                              </span>
                            }
                            error={departmentWorklogsEditErr}
                            onBlur={() => {
                              if (departmentWorklogs > 0) {
                                setDepartmentWorklogsEditErr(false);
                              }
                            }}
                            helperText={
                              departmentWorklogsEditErr
                                ? "This is a required field."
                                : ""
                            }
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={processWorklogsDropdownDataEdit}
                        value={
                          processWorklogsDropdownDataEdit.find(
                            (i: LabelValue) =>
                              i.value === processNameWorklogsEdit
                          ) || null
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setProcessNameWorklogsEdit(value.value);
                          setProcessNameWorklogsEditErr(false);
                          value && setSubProcessWorklogsEdit(0);
                          setSubProcessWorklogsEditErr(false);
                        }}
                        sx={{ mx: 0.75, width: 300 }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label={
                              <span>
                                Process Name
                                <span className="text-defaultRed">&nbsp;*</span>
                              </span>
                            }
                            error={processNameWorklogsEditErr}
                            onBlur={() => {
                              if (processNameWorklogsEdit > 0) {
                                setProcessNameWorklogsEditErr(false);
                              }
                            }}
                            helperText={
                              processNameWorklogsEditErr
                                ? "This is a required field."
                                : ""
                            }
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={subProcessWorklogsDropdownDataEdit}
                        value={
                          subProcessWorklogsDropdownDataEdit.find(
                            (i: LabelValue) =>
                              i.value === subProcessWorklogsEdit
                          ) || null
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setSubProcessWorklogsEdit(value.value);
                          setSubProcessWorklogsEditErr(false);
                        }}
                        sx={{ mx: 0.75, width: 300 }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label={
                              <span>
                                Sub-Process
                                <span className="text-defaultRed">&nbsp;*</span>
                              </span>
                            }
                            error={subProcessWorklogsEditErr}
                            onBlur={() => {
                              if (subProcessWorklogsEdit > 0) {
                                setSubProcessWorklogsEditErr(false);
                              }
                            }}
                            helperText={
                              subProcessWorklogsEditErr
                                ? "This is a required field."
                                : ""
                            }
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <TextField
                        label={
                          <span>
                            Task Name
                            <span className="!text-defaultRed">&nbsp;*</span>
                          </span>
                        }
                        fullWidth
                        className="pt-1"
                        value={
                          clientTaskNameWorklogsEdit?.trim().length <= 0
                            ? ""
                            : clientTaskNameWorklogsEdit
                        }
                        onChange={(e) => {
                          setClientTaskNameWorklogsEdit(e.target.value);
                          setClientTaskNameWorklogsEditErr(false);
                        }}
                        onBlur={(e) => {
                          if (
                            e.target.value.trim().length < 4 ||
                            e.target.value.trim().length > 100
                          ) {
                            setClientTaskNameWorklogsEditErr(true);
                          }
                        }}
                        error={clientTaskNameWorklogsEditErr}
                        helperText={
                          clientTaskNameWorklogsEditErr &&
                          clientTaskNameWorklogsEdit?.trim().length > 0 &&
                          clientTaskNameWorklogsEdit?.trim().length < 4
                            ? "Minimum 4 characters required."
                            : clientTaskNameWorklogsEditErr &&
                              clientTaskNameWorklogsEdit?.trim().length > 100
                            ? "Maximum 100 characters allowed."
                            : clientTaskNameWorklogsEditErr
                            ? "This is a required field."
                            : ""
                        }
                        margin="normal"
                        variant="standard"
                        sx={{ mx: 0.75, width: 300, mt: -0.5 }}
                      />
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <TextField
                        label={
                          departmentWorklogsTypeEdit ===
                          "WhitelabelTaxation" ? (
                            "Description"
                          ) : (
                            <span>
                              Description
                              <span className="!text-defaultRed">&nbsp;*</span>
                            </span>
                          )
                        }
                        fullWidth
                        value={
                          descriptionWorklogsEdit?.trim().length <= 0
                            ? ""
                            : descriptionWorklogsEdit
                        }
                        onChange={(e) => {
                          setDescriptionWorklogsEdit(e.target.value);
                          setDescriptionWorklogsEditErr(false);
                        }}
                        onBlur={(e) => {
                          if (
                            departmentWorklogsTypeEdit === "WhitelabelTaxation"
                          ) {
                            setDescriptionWorklogsEditErr(false);
                          } else if (
                            e.target.value.trim().length <= 0 ||
                            e.target.value.trim().length > 100
                          ) {
                            setDescriptionWorklogsEditErr(true);
                          }
                        }}
                        error={descriptionWorklogsEditErr}
                        helperText={
                          descriptionWorklogsEditErr &&
                          descriptionWorklogsEdit?.trim().length > 100
                            ? "Maximum 100 characters allowed."
                            : descriptionWorklogsEditErr
                            ? "This is a required field."
                            : ""
                        }
                        margin="normal"
                        variant="standard"
                        sx={{ mx: 0.75, width: 300, mt: -0.8 }}
                      />
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <FormControl
                        variant="standard"
                        sx={{ mx: 0.75, width: 300, mt: -1.2 }}
                      >
                        <InputLabel id="demo-simple-select-standard-label">
                          Priority
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-standard-label"
                          id="demo-simple-select-standard"
                          value={
                            priorityWorklogsEdit === 0
                              ? ""
                              : priorityWorklogsEdit
                          }
                          onChange={(e) =>
                            setPriorityWorklogsEdit(e.target.value)
                          }
                        >
                          <MenuItem value={1}>High</MenuItem>
                          <MenuItem value={2}>Medium</MenuItem>
                          <MenuItem value={3}>Low</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <TextField
                        label="Estimated Time"
                        disabled
                        fullWidth
                        value={
                          subProcessWorklogsEdit > 0
                            ? (estTimeDataWorklogsEdit as any[])
                                .map((i) => {
                                  const hours = Math.floor(
                                    i.EstimatedHour / 3600
                                  );
                                  const minutes = Math.floor(
                                    (i.EstimatedHour % 3600) / 60
                                  );
                                  const remainingSeconds = i.EstimatedHour % 60;
                                  const formattedHours = hours
                                    .toString()
                                    .padStart(2, "0");
                                  const formattedMinutes = minutes
                                    .toString()
                                    .padStart(2, "0");
                                  const formattedSeconds = remainingSeconds
                                    .toString()
                                    .padStart(2, "0");
                                  return subProcessWorklogsEdit === i.Id
                                    ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
                                    : null;
                                })
                                .filter((i) => i !== null)
                            : ""
                        }
                        margin="normal"
                        variant="standard"
                        sx={{ mx: 0.75, width: 300, mt: -0.8 }}
                      />
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <TextField
                        label={
                          <span>
                            Quantity
                            <span className="!text-defaultRed">&nbsp;*</span>
                          </span>
                        }
                        onFocus={(e) =>
                          e.target.addEventListener(
                            "wheel",
                            function (e) {
                              e.preventDefault();
                            },
                            { passive: false }
                          )
                        }
                        type="number"
                        fullWidth
                        value={quantityWorklogsEdit}
                        onChange={(e) => {
                          setQuantityWorklogsEdit(Number(e.target.value));
                          setQuantityWorklogsEditErr(false);
                        }}
                        onBlur={(e) => {
                          if (
                            e.target.value.trim().length > 0 &&
                            e.target.value.trim().length < 5 &&
                            !e.target.value.trim().includes(".")
                          ) {
                            setQuantityWorklogsEditErr(false);
                          }
                        }}
                        error={quantityWorklogsEditErr}
                        helperText={
                          quantityWorklogsEditErr &&
                          quantityWorklogsEdit.toString().includes(".")
                            ? "Only intiger value allowed."
                            : quantityWorklogsEditErr &&
                              quantityWorklogsEdit.toString() === ""
                            ? "This is a required field."
                            : quantityWorklogsEditErr &&
                              quantityWorklogsEdit <= 0
                            ? "Enter valid number."
                            : quantityWorklogsEditErr &&
                              quantityWorklogsEdit.toString().length > 4
                            ? "Maximum 4 numbers allowed."
                            : ""
                        }
                        margin="normal"
                        variant="standard"
                        sx={{ mx: 0.75, width: 300, mt: -0.8 }}
                      />
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <TextField
                        label="Standard Time"
                        fullWidth
                        value={
                          subProcessWorklogsEdit > 0
                            ? (estTimeDataWorklogsEdit as any[])
                                .map((i) => {
                                  const hours = Math.floor(
                                    (i.EstimatedHour * quantityWorklogsEdit) /
                                      3600
                                  );
                                  const minutes = Math.floor(
                                    ((i.EstimatedHour * quantityWorklogsEdit) %
                                      3600) /
                                      60
                                  );
                                  const remainingSeconds =
                                    (i.EstimatedHour * quantityWorklogsEdit) %
                                    60;
                                  const formattedHours = hours
                                    .toString()
                                    .padStart(2, "0");
                                  const formattedMinutes = minutes
                                    .toString()
                                    .padStart(2, "0");
                                  const formattedSeconds = remainingSeconds
                                    .toString()
                                    .padStart(2, "0");
                                  return subProcessWorklogsEdit === i.Id
                                    ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
                                    : null;
                                })
                                .filter((i) => i !== null)
                            : ""
                        }
                        disabled
                        margin="normal"
                        variant="standard"
                        sx={{
                          mx: 0.75,
                          maxWidth: 300,
                          mt: typeOfWorkWorklogsEdit === 3 ? -0.9 : -0.8,
                        }}
                      />
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <div
                        className={`inline-flex -mt-[11px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px] ${
                          receiverDateWorklogsEditErr ? "datepickerError" : ""
                        }`}
                      >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label={
                              <span>
                                Received Date
                                <span className="!text-defaultRed">
                                  &nbsp;*
                                </span>
                              </span>
                            }
                            onError={() =>
                              setReceiverDateWorklogsEditErr(false)
                            }
                            value={
                              receiverDateWorklogsEdit === ""
                                ? null
                                : dayjs(receiverDateWorklogsEdit)
                            }
                            // shouldDisableDate={isWeekend}
                            maxDate={dayjs(Date.now())}
                            onChange={(newDate: any) => {
                              setReceiverDateWorklogsEdit(newDate.$d);
                              setReceiverDateWorklogsEditErr(false);
                              const selectedDate = dayjs(newDate.$d);
                              let nextDate: any = selectedDate;
                              if (selectedDate.day() === 4) {
                                nextDate = nextDate.add(4, "day");
                              } else if (selectedDate.day() === 5) {
                                nextDate = nextDate.add(4, "day");
                              } else if (selectedDate.day() === 6) {
                                nextDate = nextDate.add(4, "day");
                              } else {
                                nextDate = dayjs(newDate.$d)
                                  .add(3, "day")
                                  .toDate();
                              }
                              setDueDateWorklogsEdit(nextDate);
                              !!reworkDueDateWorklogsEdit &&
                              new Date(reworkDueDateWorklogsEdit) <
                                new Date(newDate.$d)
                                ? setReworkReceiverDateWorklogsEditErr(true)
                                : setReworkReceiverDateWorklogsEditErr(false);
                            }}
                            slotProps={{
                              textField: {
                                helperText: receiverDateWorklogsEditErr
                                  ? "This is a required field."
                                  : "",
                                readOnly: true,
                              } as Record<string, any>,
                            }}
                          />
                        </LocalizationProvider>
                      </div>
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <div
                        className={`inline-flex -mt-[11px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]`}
                      >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label={
                              <span>
                                Due Date
                                <span className="!text-defaultRed">
                                  &nbsp;*
                                </span>
                              </span>
                            }
                            value={
                              dueDateWorklogsEdit === ""
                                ? null
                                : dayjs(dueDateWorklogsEdit)
                            }
                            shouldDisableDate={isWeekend}
                            minDate={dayjs(receiverDateWorklogs)}
                            onChange={(newDate: any) => {
                              setDueDateWorklogsEdit(newDate.$d);
                            }}
                            slotProps={{
                              textField: {
                                readOnly: true,
                              } as Record<string, any>,
                            }}
                          />
                        </LocalizationProvider>
                      </div>
                    </Grid>
                    {departmentWorklogsTypeEdit === "WhitelabelTaxation" && (
                      <Grid item xs={3} className="pt-4">
                        <div
                          className={`inline-flex -mt-[11px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]`}
                        >
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label="All Info Date"
                              shouldDisableDate={isWeekend}
                              value={
                                allInfoDateWorklogsEdit === ""
                                  ? null
                                  : dayjs(allInfoDateWorklogsEdit)
                              }
                              onChange={(newDate: any) =>
                                setAllInfoDateWorklogsEdit(newDate.$d)
                              }
                            />
                          </LocalizationProvider>
                        </div>
                      </Grid>
                    )}
                    <Grid
                      item
                      xs={3}
                      className={`${
                        typeOfWorkWorklogsEdit === 3 &&
                        departmentWorklogsTypeEdit !== "WhitelabelTaxation"
                          ? "pt-2"
                          : typeOfWorkWorklogsEdit === 3 &&
                            departmentWorklogsTypeEdit === "WhitelabelTaxation"
                          ? "pt-4"
                          : departmentWorklogsTypeEdit !== "WhitelabelTaxation"
                          ? "pt-[17px]"
                          : "pt-5"
                      }`}
                    >
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={assigneeWorklogsDropdownDataEdit}
                        value={
                          assigneeWorklogsDropdownDataEdit.find(
                            (i: LabelValue) => i.value === assigneeWorklogsEdit
                          ) || null
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setAssigneeWorklogsEdit(value.value);
                        }}
                        sx={{
                          width: 300,
                          mt: typeOfWorkWorklogsEdit === 3 ? 0.2 : -1,
                          mx: 0.75,
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label={
                              <span>
                                Assignee
                                <span className="text-defaultRed">&nbsp;*</span>
                              </span>
                            }
                            error={assigneeWorklogsEditErr}
                            onBlur={() => {
                              if (assigneeWorklogsEdit > 0) {
                                setAssigneeWorklogsEditErr(false);
                              }
                            }}
                            helperText={
                              assigneeWorklogsEditErr
                                ? "This is a required field."
                                : ""
                            }
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={3}
                      className={`${
                        typeOfWorkWorklogsEdit === 3 ? "pt-4" : "pt-5"
                      }`}
                    >
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={reviewerWorklogsDropdownDataEdit}
                        value={
                          reviewerWorklogsDropdownDataEdit.find(
                            (i: LabelValue) => i.value === reviewerWorklogsEdit
                          ) || null
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setReviewerWorklogsEdit(value.value);
                        }}
                        sx={{
                          width: 300,
                          mt: typeOfWorkWorklogsEdit === 3 ? 0.2 : -1,
                          mx: 0.75,
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label={
                              <span>
                                Reviewer
                                <span className="text-defaultRed">&nbsp;*</span>
                              </span>
                            }
                            error={reviewerWorklogsEditErr}
                            onBlur={() => {
                              if (reviewerWorklogsEdit > 0) {
                                setReviewerWorklogsEditErr(false);
                              }
                            }}
                            helperText={
                              reviewerWorklogsEditErr
                                ? "This is a required field."
                                : ""
                            }
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={3}
                      className={`${
                        typeOfWorkWorklogsEdit === 3 ? "pt-4" : "pt-5"
                      }`}
                    >
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={managerWorklogsDropdownDataEdit}
                        value={
                          managerWorklogsDropdownDataEdit.find(
                            (i: LabelValue) => i.value === managerWorklogsEdit
                          ) || null
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setManagerWorklogsEdit(value.value);
                        }}
                        sx={{
                          width: 300,
                          mt: typeOfWorkWorklogsEdit === 3 ? 0.2 : -1,
                          mx: 0.75,
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label={
                              <span>
                                Manager
                                <span className="text-defaultRed">&nbsp;*</span>
                              </span>
                            }
                            error={managerWorklogsEditErr}
                            onBlur={() => {
                              if (managerWorklogsEdit > 0) {
                                setManagerWorklogsEditErr(false);
                              }
                            }}
                            helperText={
                              managerWorklogsEditErr
                                ? "This is a required field."
                                : ""
                            }
                          />
                        )}
                      />
                    </Grid>
                    {departmentWorklogsTypeEdit === "SMB" && (
                      <Grid
                        item
                        xs={3}
                        className={`${
                          typeOfWorkWorklogsEdit === 3 ? "pt-4" : "pt-5"
                        }`}
                      >
                        <Autocomplete
                          disablePortal
                          id="combo-box-demo"
                          options={isQaWorklogsDropdownData}
                          value={
                            isQaWorklogsDropdownData.find(
                              (i: LabelValue) => i.value === isQaWorklogsEdit
                            ) || null
                          }
                          onChange={(e, value: LabelValue | null) => {
                            value && setIsQaWorklogsEdit(value.value);
                          }}
                          sx={{
                            width: 300,
                            mt: typeOfWorkWorklogsEdit === 3 ? 0.2 : -1,
                            mx: 0.75,
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="standard"
                              label="Is QA"
                            />
                          )}
                        />
                      </Grid>
                    )}
                    {(departmentWorklogsTypeEdit === "WhitelabelAccounting" ||
                      departmentWorklogsTypeEdit === "WhitelabelAustralia" ||
                      departmentWorklogsTypeEdit === "UK" ||
                      departmentWorklogsType === "Germany") && (
                      <Grid
                        item
                        xs={3}
                        className={`${
                          typeOfWorkWorklogs === 3 ? "pt-4" : "pt-5"
                        }`}
                      >
                        <div
                          className={`inline-flex -mt-[11px] mx-[6px] muiDatepickerCustomizer muiDatepickerCustomizerMonth w-full max-w-[300px]`}
                        >
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              minDate={dayjs(previousYearStartDate)}
                              maxDate={dayjs(currentYearEndDate)}
                              views={["year", "month"]}
                              label="Period From"
                              value={
                                valueMonthYearFromEdit === ""
                                  ? null
                                  : valueMonthYearFromEdit
                              }
                              onChange={(newDate: any) =>
                                setValueMonthYearFromEdit(newDate.$d)
                              }
                            />
                          </LocalizationProvider>
                        </div>
                      </Grid>
                    )}
                    {(departmentWorklogsTypeEdit === "WhitelabelAccounting" ||
                      departmentWorklogsTypeEdit === "WhitelabelAustralia" ||
                      departmentWorklogsTypeEdit === "UK" ||
                      departmentWorklogsType === "Germany") && (
                      <Grid
                        item
                        xs={3}
                        className={`${
                          typeOfWorkWorklogs === 3 ? "pt-4" : "pt-5"
                        }`}
                      >
                        <div
                          className={`inline-flex -mt-[11px] mx-[6px] muiDatepickerCustomizer muiDatepickerCustomizerMonth w-full max-w-[300px]`}
                        >
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              minDate={dayjs(previousYearStartDate)}
                              maxDate={dayjs(currentYearEndDate)}
                              views={["year", "month"]}
                              label="Period To"
                              value={
                                valueMonthYearToEdit === ""
                                  ? null
                                  : valueMonthYearToEdit
                              }
                              onChange={(newDate: any) =>
                                setValueMonthYearToEdit(newDate.$d)
                              }
                            />
                          </LocalizationProvider>
                        </div>
                      </Grid>
                    )}
                    {typeOfWorkWorklogsEdit === 3 && (
                      <>
                        <Grid item xs={3} className="pt-4">
                          <FormControl
                            variant="standard"
                            sx={{ width: 300, mt: -0.3, mx: 0.75 }}
                            error={returnYearWorklogsEditErr}
                          >
                            <InputLabel id="demo-simple-select-standard-label">
                              Return Year
                              <span className="text-defaultRed">&nbsp;*</span>
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-standard-label"
                              id="demo-simple-select-standard"
                              value={
                                returnYearWorklogsEdit === 0
                                  ? ""
                                  : returnYearWorklogsEdit
                              }
                              onChange={(e) =>
                                setReturnYearWorklogsEdit(
                                  Number(e.target.value)
                                )
                              }
                              onBlur={() => {
                                if (returnYearWorklogsEdit > 0) {
                                  setReturnYearWorklogsEditErr(false);
                                }
                              }}
                            >
                              {yearWorklogsDrawerDropdown.map(
                                (i: LabelValue, index: number) => (
                                  <MenuItem value={i.value} key={index}>
                                    {i.label}
                                  </MenuItem>
                                )
                              )}
                            </Select>
                            {returnYearWorklogsEditErr && (
                              <FormHelperText>
                                This is a required field.
                              </FormHelperText>
                            )}
                          </FormControl>
                        </Grid>
                        <Grid item xs={3} className="pt-4">
                          <TextField
                            label="No of Pages"
                            type="number"
                            fullWidth
                            value={
                              noOfPagesWorklogsEdit === 0
                                ? ""
                                : noOfPagesWorklogsEdit
                            }
                            onChange={(e) =>
                              setNoOfPagesWorklogsEdit(Number(e.target.value))
                            }
                            margin="normal"
                            variant="standard"
                            sx={{ width: 300, mt: 0, mx: 0.75 }}
                          />
                        </Grid>
                        <Grid item xs={3} className="pt-4">
                          <FormControl
                            variant="standard"
                            sx={{ width: 300, mt: -0.4, mx: 0.75 }}
                            error={checklistWorkpaperWorklogsEditErr}
                          >
                            <InputLabel id="demo-simple-select-standard-label">
                              Checklist/Workpaper
                              <span className="text-defaultRed">&nbsp;*</span>
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-standard-label"
                              id="demo-simple-select-standard"
                              value={
                                checklistWorkpaperWorklogsEdit === 0
                                  ? ""
                                  : checklistWorkpaperWorklogsEdit
                              }
                              onChange={(e) =>
                                setChecklistWorkpaperWorklogsEdit(
                                  Number(e.target.value)
                                )
                              }
                              onBlur={() => {
                                if (checklistWorkpaperWorklogsEdit > 0) {
                                  setChecklistWorkpaperWorklogsEditErr(false);
                                }
                              }}
                            >
                              <MenuItem value={1}>Yes</MenuItem>
                              <MenuItem value={2}>No</MenuItem>
                            </Select>
                            {checklistWorkpaperWorklogsEditErr && (
                              <FormHelperText>
                                This is a required field.
                              </FormHelperText>
                            )}
                          </FormControl>
                        </Grid>
                      </>
                    )}
                    {!!reworkReceiverDateWorklogsEdit && (
                      <Grid
                        item
                        xs={3}
                        className={
                          typeOfWorkWorklogsEdit === 3 ? "pt-5" : "pt-4"
                        }
                      >
                        <div
                          className={`inline-flex -mt-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]`}
                        >
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label={
                                <span>
                                  Rework Received Date
                                  <span className="!text-defaultRed">
                                    &nbsp;*
                                  </span>
                                </span>
                              }
                              value={
                                reworkReceiverDateWorklogsEdit === ""
                                  ? null
                                  : dayjs(reworkReceiverDateWorklogsEdit)
                              }
                              minDate={dayjs(receiverDateWorklogsEdit)}
                              maxDate={dayjs(Date.now())}
                              onChange={(newDate: any) => {
                                setReworkReceiverDateWorklogsEdit(newDate.$d);
                                const selectedDate = dayjs(newDate.$d);
                                let nextDate: any = selectedDate;
                                nextDate = dayjs(newDate.$d)
                                  .add(1, "day")
                                  .toDate();
                                setReworkDueDateWorklogsEdit(nextDate);
                                !!receiverDateWorklogsEdit &&
                                new Date(receiverDateWorklogsEdit) >
                                  new Date(newDate.$d)
                                  ? setReworkReceiverDateWorklogsEditErr(true)
                                  : setReworkReceiverDateWorklogsEditErr(false);
                              }}
                              slotProps={{
                                textField: {
                                  readOnly: true,
                                } as Record<string, any>,
                              }}
                            />
                          </LocalizationProvider>
                        </div>
                      </Grid>
                    )}
                    {!!reworkDueDateWorklogsEdit && (
                      <Grid
                        item
                        xs={3}
                        className={
                          typeOfWorkWorklogsEdit === 3 ? "pt-5" : "pt-4"
                        }
                      >
                        <div
                          className={`inline-flex -mt-[8px] mb-4 mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]`}
                        >
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label={
                                <span>
                                  Rework Due Date
                                  <span className="!text-defaultRed">
                                    &nbsp;*
                                  </span>
                                </span>
                              }
                              value={
                                reworkDueDateWorklogsEdit === ""
                                  ? null
                                  : dayjs(reworkDueDateWorklogsEdit)
                              }
                              minDate={dayjs(reworkReceiverDateWorklogsEdit)}
                              shouldDisableDate={isWeekend}
                              onChange={(newDate: any) => {
                                setReworkDueDateWorklogsEdit(newDate.$d);
                              }}
                              slotProps={{
                                textField: {
                                  readOnly: true,
                                } as Record<string, any>,
                              }}
                            />
                          </LocalizationProvider>
                        </div>
                      </Grid>
                    )}
                  </Grid>
                )}
              </div>
            )}

            <div className="sticky bottom-0 !h-[9%] bg-whiteSmoke border-b z-30 border-lightSilver flex p-2 justify-end items-center">
              <div>
                <Button
                  variant="outlined"
                  className="rounded-[4px] !h-[36px] !text-secondary"
                  onClick={handleClose}
                >
                  <span className="flex items-center justify-center gap-[10px] px-[5px]">
                    Close
                  </span>
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  className="rounded-[4px] !h-[36px] !mx-6 !bg-secondary cursor-pointer"
                >
                  <span className="flex items-center justify-center gap-[10px] px-[5px]">
                    {onEdit > 0 ? "Save Task" : "Create Task"}
                  </span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {isLoadingWorklogs ? <OverLay /> : ""}
    </>
  );
};

export default TaskEditDrawer;
