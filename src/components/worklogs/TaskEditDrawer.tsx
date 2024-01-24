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

const TaskEditDrawer = ({ onOpen, onClose, onEdit, onDataFetch }: any) => {
  const router = useRouter();
  const yearWorklogsDrawerDropdown = getYears();
  const [isLoadingWorklogs, setIsLoadingWorklogs] = useState(false);
  const [editDataWorklogs, setEditDataWorklogs] = useState<any>([]);
  const [
    inputTypePreperationWorklogsDrawer,
    setInputTypePreperationWorklogsDrawer,
  ] = useState("text");
  const [inputTypeReviewWorklogsDrawer, setInputTypeReviewWorklogsDrawer] =
    useState("text");

  // Task
  const [taskWorklogsDrawer, setTaskWorklogsDrawer] = useState(true);
  const [clientWorklogsDropdownData, setClientWorklogsDropdownData] =
    useState<any>([]);
  const [clientNameWorklogs, setClientNameWorklogs] = useState<any>(0);
  const [typeOfWorkWorklogsDropdownData, setTypeOfWorkWorklogsDropdownData] =
    useState<any>([]);
  const [typeOfWorkWorklogs, setTypeOfWorkWorklogs] = useState<string | number>(
    0
  );
  const [projectWorklogsDropdownData, setProjectWorklogsDropdownData] =
    useState<any>([]);
  const [projectNameWorklogs, setProjectNameWorklogs] = useState<any>(0);
  const [processWorklogsDropdownData, setProcessWorklogsDropdownData] =
    useState<any>([]);
  const [processNameWorklogs, setProcessNameWorklogs] = useState<any>(0);
  const [subProcessWorklogsDropdownData, setSubProcessWorklogsDropdownData] =
    useState([]);
  const [subProcessWorklogs, setSubProcessWorklogs] = useState<any>(0);
  const [clientTaskNameWorklogs, setClientTaskNameWorklogs] =
    useState<string>("");
  const [managerWorklogsDropdownData, setManagerWorklogsDropdownData] =
    useState<any>([]);
  const [managerWorklogs, setManagerWorklogs] = useState<any>(0);
  const [statusWorklogsDropdownData, setStatusWorklogsDropdownData] =
    useState<any>([]);
  const [statusWorklogsDropdownDataUse, setStatusWorklogsDropdownDataUse] =
    useState([]);
  const [statusWorklogs, setStatusWorklogs] = useState<any>(0);
  const [descriptionWorklogs, setDescriptionWorklogs] = useState<string>("");
  const [priorityWorklogs, setPriorityWorklogs] = useState<string | number>(0);
  const [quantityWorklogs, setQuantityWorklogs] = useState<any>(1);
  const [receiverDateWorklogs, setReceiverDateWorklogs] = useState<any>("");
  const [dueDateWorklogs, setDueDateWorklogs] = useState<any>("");
  const [allInfoDateWorklogs, setAllInfoDateWorklogs] = useState<any>("");
  const [assigneeWorklogsDropdownData, setAssigneeWorklogsDropdownData] =
    useState<any>([]);
  const [assigneeWorklogs, setAssigneeWorklogs] = useState<any>([]);
  const [assigneeWorklogsDisable, setAssigneeWorklogsDisable] =
    useState<any>(true);
  const [reviewerWorklogsDropdownData, setReviewerWorklogsDropdownData] =
    useState([]);
  const [reviewerWorklogs, setReviewerWorklogs] = useState<any>([]);
  const [dateOfReviewWorklogs, setDateOfReviewWorklogs] = useState<string>("");
  const [dateOfPreperationWorklogs, setDateOfPreperationWorklogs] =
    useState<string>("");
  const [estTimeDataWorklogs, setEstTimeDataWorklogs] = useState([]);
  const [returnYearWorklogs, setReturnYearWorklogs] = useState<string | number>(
    0
  );
  const [noOfPagesWorklogs, setNoOfPagesWorklogs] = useState<any>(0);
  const [checklistWorkpaperWorklogs, setChecklistWorkpaperWorklogs] =
    useState<any>(0);

  // Update
  const [taskWorklogsEditDrawer, setTaskWorklogsEditDrawer] = useState(true);
  const [clientNameWorklogsEdit, setClientNameWorklogsEdit] = useState<any>(0);
  const [clientNameWorklogsEditErr, setClientNameWorklogsEditErr] =
    useState(false);
  const [typeOfWorkWorklogsEdit, setTypeOfWorkWorklogsEdit] = useState<
    string | number
  >(0);
  const [typeOfWorkWorklogsEditErr, setTypeOfWorkWorklogsEditErr] =
    useState(false);
  const [
    typeOfWorkWorklogsDropdownDataEdit,
    setTypeOfWorkWorklogsDropdownDataEdit,
  ] = useState<any>([]);
  const [projectNameWorklogsEdit, setProjectNameWorklogsEdit] =
    useState<any>(0);
  const [projectNameWorklogsEditErr, setProjectNameWorklogsEditErr] =
    useState(false);
  const [projectWorklogsDropdownDataEdit, setProjectWorklogsDropdownDataEdit] =
    useState<any>([]);
  const [processNameWorklogsEdit, setProcessNameWorklogsEdit] =
    useState<any>(0);
  const [processNameWorklogsEditErr, setProcessNameWorklogsEditErr] =
    useState(false);
  const [processWorklogsDropdownDataEdit, setProcessWorklogsDropdownDataEdit] =
    useState<any>([]);
  const [subProcessWorklogsEdit, setSubProcessWorklogsEdit] = useState<any>(0);
  const [subProcessWorklogsEditErr, setSubProcessWorklogsEditErr] =
    useState(false);
  const [
    subProcessWorklogsDropdownDataEdit,
    setSubProcessWorklogsDropdownDataEdit,
  ] = useState([]);
  const [clientTaskNameWorklogsEdit, setClientTaskNameWorklogsEdit] =
    useState<string>("");
  const [clientTaskNameWorklogsEditErr, setClientTaskNameWorklogsEditErr] =
    useState(false);
  const [managerWorklogsEdit, setManagerWorklogsEdit] = useState<any>(0);
  const [managerWorklogsEditErr, setManagerWorklogsEditErr] = useState(false);
  const [statusWorklogsEdit, setStatusWorklogsEdit] = useState<any>(0);
  const [statusWorklogsEditErr, setStatusWorklogsEditErr] = useState(false);
  const [descriptionWorklogsEdit, setDescriptionWorklogsEdit] =
    useState<string>("");
  const [priorityWorklogsEdit, setPriorityWorklogsEdit] = useState<
    string | number
  >(0);
  const [quantityWorklogsEdit, setQuantityWorklogsEdit] = useState<any>(1);
  const [quantityWorklogsEditErr, setQuantityWorklogsEditErr] = useState(false);
  const [receiverDateWorklogsEdit, setReceiverDateWorklogsEdit] =
    useState<any>("");
  const [receiverDateWorklogsEditErr, setReceiverDateWorklogsEditErr] =
    useState(false);
  const [dueDateWorklogsEdit, setDueDateWorklogsEdit] = useState<any>("");
  const [allInfoDateWorklogsEdit, setAllInfoDateWorklogsEdit] =
    useState<any>("");
  const [assigneeWorklogsEdit, setAssigneeWorklogsEdit] = useState<any>([]);
  const [assigneeWorklogsEditErr, setAssigneeWorklogsEditErr] = useState(false);
  const [
    assigneeWorklogsDropdownDataEdit,
    setAssigneeWorklogsDropdownDataEdit,
  ] = useState<any>([]);
  const [reviewerWorklogsEdit, setReviewerWorklogsEdit] = useState<any>([]);
  const [reviewerWorklogsEditErr, setReviewerWorklogsEditErr] = useState(false);
  const [
    reviewerWorklogsDropdownDataEdit,
    setReviewerWorklogsDropdownDataEdit,
  ] = useState([]);
  const [estTimeDataWorklogsEdit, setEstTimeDataWorklogsEdit] = useState([]);
  const [returnYearWorklogsEdit, setReturnYearWorklogsEdit] = useState<
    string | number
  >(0);
  const [returnYearWorklogsEditErr, setReturnYearWorklogsEditErr] =
    useState(false);
  const [noOfPagesWorklogsEdit, setNoOfPagesWorklogsEdit] = useState<any>(0);
  const [checklistWorkpaperWorklogsEdit, setChecklistWorkpaperWorklogsEdit] =
    useState<any>(0);
  const [
    checklistWorkpaperWorklogsEditErr,
    setChecklistWorkpaperWorklogsEditErr,
  ] = useState(false);

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
      status: validateField(statusWorklogsEdit),
      quantity: validateField(quantityWorklogsEdit),
      receiverDate: validateField(receiverDateWorklogsEdit),
      dueDate: validateField(dueDateWorklogsEdit),
      assignee: validateField(assigneeWorklogsEdit),
      reviewer: validateField(reviewerWorklogsEdit),
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
    setQuantityWorklogsEditErr(fieldValidationsEdit.quantity);
    setReceiverDateWorklogsEditErr(fieldValidationsEdit.receiverDate);
    assigneeWorklogsDisable &&
      setAssigneeWorklogsEditErr(fieldValidationsEdit.assignee);
    setReviewerWorklogsEditErr(fieldValidationsEdit.reviewer);
    setManagerWorklogsEditErr(fieldValidationsEdit.manager);
    typeOfWorkWorklogsEdit === 3 &&
      setReturnYearWorklogsEditErr(fieldValidationsEdit.returnYear);
    typeOfWorkWorklogsEdit === 3 &&
      setChecklistWorkpaperWorklogsEditErr(
        fieldValidationsEdit.checklistWorkpaper
      );
    setClientTaskNameWorklogsEditErr(
      clientTaskNameWorklogsEdit.trim().length < 4 ||
        clientTaskNameWorklogsEdit.trim().length > 50
    );
    setQuantityWorklogsEditErr(
      quantityWorklogsEdit.length <= 0 ||
        quantityWorklogsEdit.length > 4 ||
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
      Quantity: quantityWorklogsEdit,
      Description:
        descriptionWorklogsEdit.toString().length <= 0
          ? null
          : descriptionWorklogsEdit.toString().trim(),
      ReceiverDate: dayjs(receiverDateWorklogsEdit).format("YYYY/MM/DD"),
      DueDate: dayjs(dueDateWorklogsEdit).format("YYYY/MM/DD"),
      allInfoDate:
        allInfoDateWorklogsEdit === "" ? null : allInfoDateWorklogsEdit,
      AssignedId: assigneeWorklogsEdit,
      ReviewerId: reviewerWorklogsEdit,
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
        ResponseData: any,
        error: any,
        ResponseStatus: any
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
      clientTaskNameWorklogsEdit.trim().length < 50 &&
      quantityWorklogsEdit > 0 &&
      quantityWorklogsEdit < 10000 &&
      !quantityWorklogsEditErr &&
      !quantityWorklogsEdit.toString().includes(".")
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
      clientTaskNameWorklogsEdit.trim().length < 50 &&
      quantityWorklogsEdit > 0 &&
      quantityWorklogsEdit < 10000 &&
      !quantityWorklogsEditErr &&
      !quantityWorklogsEdit.toString().includes(".")
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
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setEditDataWorklogs(ResponseData);
        setClientNameWorklogs(ResponseData.ClientId);
        setTypeOfWorkWorklogs(ResponseData.WorkTypeId);
        setProjectNameWorklogs(
          ResponseData.ProjectId === null ? "" : ResponseData.ProjectId
        );
        setProcessNameWorklogs(
          ResponseData.ProcessId === null ? "" : ResponseData.ProcessId
        );
        setSubProcessWorklogs(
          ResponseData.SubProcessId === null ? "" : ResponseData.SubProcessId
        );
        setClientTaskNameWorklogs(
          ResponseData.TaskName === null ? "" : ResponseData.TaskName
        );
        setStatusWorklogs(ResponseData.StatusId);
        setAllInfoDateWorklogs(
          ResponseData.AllInfoDate === null ? "" : ResponseData.AllInfoDate
        );
        !ResponseData.ErrorlogSignedOffPending
          ? setStatusWorklogsDropdownDataUse(
              statusWorklogsDropdownData.filter(
                (item: any) =>
                  item.Type === "PendingFromAccounting" ||
                  item.Type === "Assigned" ||
                  item.Type === "OnHoldFromClient" ||
                  item.Type === "WithDraw" ||
                  item.Type === "WithdrawnbyClient" ||
                  item.Type === "NotStarted" ||
                  item.Type === "InProgress" ||
                  item.Type === "Stop" ||
                  item.Type === "Rework" ||
                  item.value == ResponseData.StatusId
              )
            )
          : setStatusWorklogsDropdownDataUse(
              statusWorklogsDropdownData.filter(
                (item: any) =>
                  item.Type === "PendingFromAccounting" ||
                  item.Type === "Assigned" ||
                  item.Type === "OnHoldFromClient" ||
                  item.Type === "WithDraw" ||
                  item.Type === "WithdrawnbyClient" ||
                  item.Type === "Rework" ||
                  item.Type === "ReworkInProgress" ||
                  item.Type === "ReworkPrepCompleted" ||
                  item.value === ResponseData.StatusId
              )
            );
        setPriorityWorklogs(
          ResponseData.Priority === null ? 0 : ResponseData.Priority
        );
        setQuantityWorklogs(ResponseData.Quantity);
        setDescriptionWorklogs(
          ResponseData.Description === null ? "" : ResponseData.Description
        );
        setReceiverDateWorklogs(ResponseData.ReceiverDate);
        setDueDateWorklogs(ResponseData.DueDate);
        setDateOfReviewWorklogs(ResponseData.ReviewerDate);
        setDateOfPreperationWorklogs(ResponseData.PreparationDate);
        setAssigneeWorklogs(ResponseData.AssignedId);
        setReviewerWorklogs(ResponseData.ReviewerId);
        setManagerWorklogs(
          ResponseData.ManagerId === null ? 0 : ResponseData.ManagerId
        );
        setReturnYearWorklogs(
          ResponseData.TypeOfReturnId === 0
            ? null
            : ResponseData.TaxCustomFields.ReturnYear
        );
        setNoOfPagesWorklogs(
          ResponseData.TypeOfReturnId === 0
            ? null
            : ResponseData.TaxCustomFields.NoOfPages
        );
        setChecklistWorkpaperWorklogs(
          ResponseData.ChecklistWorkpaper === true
            ? 1
            : ResponseData.ChecklistWorkpaper === false
            ? 2
            : 0
        );
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const getData = async () => {
      const statusData = await getStatusDropdownData();
      onOpen &&
        statusWorklogsDropdownData.length === 0 &&
        (await setStatusWorklogsDropdownData(statusData));
      onOpen &&
        statusWorklogsDropdownData.length === 0 &&
        (await setStatusWorklogsDropdownDataUse(
          statusData.filter(
            (item: any) =>
              item.Type === "PendingFromAccounting" ||
              item.Type === "Assigned" ||
              item.Type === "NotStarted" ||
              item.Type === "InProgress" ||
              item.Type === "Stop" ||
              item.Type === "OnHoldFromClient" ||
              item.Type === "WithDraw" ||
              item.Type === "WithdrawnbyClient" ||
              (onEdit > 0 &&
                (item.Type === "Rework" ||
                  item.Type === "ReworkInProgress" ||
                  item.Type === "ReworkPrepCompleted"))
          )
        ));
      onOpen &&
        onEdit === 0 &&
        setStatusWorklogs(
          statusWorklogsDropdownData
            .map((i: any) => (i.Type === "NotStarted" ? i.value : undefined))
            .filter((i: any) => i !== undefined)[0]
        );
      statusWorklogsDropdownData.length > 0 && (await getEditDataWorklogs());
    };
    getData();
  }, [onEdit, onOpen, statusWorklogsDropdownData]);

  useEffect(() => {
    const getData = async () => {
      getUserDetails();
      setClientWorklogsDropdownData(await getClientDropdownData());
      setManagerWorklogsDropdownData(await getManagerDropdownData());
      const workTypeData: any =
        clientNameWorklogs > 0 &&
        (await getTypeOfWorkDropdownData(clientNameWorklogs));
      workTypeData.length > 0 &&
        setTypeOfWorkWorklogsDropdownData(workTypeData);
      workTypeData.length > 0 &&
        onEdit === 0 &&
        setTypeOfWorkWorklogs(
          workTypeData.map((i: any) => i.value).includes(3)
            ? 3
            : workTypeData.map((i: any) => i.value).includes(1)
            ? 1
            : workTypeData.map((i: any) => i.value).includes(2)
            ? 2
            : 0
        );
      const projectData: any =
        clientNameWorklogs > 0 &&
        (await getProjectDropdownData(clientNameWorklogs));
      projectData.length > 0 && setProjectWorklogsDropdownData(projectData);
      projectData.length > 0 &&
        projectData.length === 1 &&
        onEdit === 0 &&
        setProjectNameWorklogs(projectData.map((i: any) => i.value)[0]);
      const processData: any =
        clientNameWorklogs > 0 &&
        (await getProcessDropdownData(clientNameWorklogs));
      setProcessWorklogsDropdownData(
        processData.map((i: any) => new Object({ label: i.Name, value: i.Id }))
      );
    };

    onOpen && getData();
  }, [clientNameWorklogs, onOpen]);

  useEffect(() => {
    const getData = async () => {
      const data: any =
        processNameWorklogs !== 0 &&
        (await getSubProcessDropdownData(
          clientNameWorklogs,
          processNameWorklogs
        ));
      data.length > 0 && setEstTimeDataWorklogs(data);
      data.length > 0 &&
        setSubProcessWorklogsDropdownData(
          data.map((i: any) => new Object({ label: i.Name, value: i.Id }))
        );
    };

    getData();
  }, [processNameWorklogs]);

  useEffect(() => {
    const getData = async () => {
      const assigneeData = await getAssigneeDropdownData(
        [clientNameWorklogs],
        typeOfWorkWorklogs
      );
      assigneeData.length > 0 && setAssigneeWorklogsDropdownData(assigneeData);

      const reviewerData = await getReviewerDropdownData(
        [clientNameWorklogs],
        typeOfWorkWorklogs
      );
      reviewerData.length > 0 && setReviewerWorklogsDropdownData(reviewerData);
    };

    typeOfWorkWorklogs !== 0 && getData();
  }, [typeOfWorkWorklogs, clientNameWorklogs]);

  // Edit dropdown
  useEffect(() => {
    const getData = async () => {
      const workTypeData: any =
        clientNameWorklogsEdit > 0 &&
        (await getTypeOfWorkDropdownData(clientNameWorklogsEdit));
      workTypeData.length > 0 &&
        setTypeOfWorkWorklogsDropdownDataEdit(workTypeData);
      const projectData: any =
        clientNameWorklogsEdit > 0 &&
        (await getProjectDropdownData(clientNameWorklogsEdit));
      projectData.length > 0 && setProjectWorklogsDropdownDataEdit(projectData);
      const processData: any =
        clientNameWorklogsEdit > 0 &&
        (await getProcessDropdownData(clientNameWorklogsEdit));
      setProcessWorklogsDropdownDataEdit(
        processData.map((i: any) => new Object({ label: i.Name, value: i.Id }))
      );
    };

    onOpen && getData();
  }, [clientNameWorklogsEdit, onOpen]);

  useEffect(() => {
    const getData = async () => {
      const data: any =
        processNameWorklogsEdit !== 0 &&
        (await getSubProcessDropdownData(
          clientNameWorklogsEdit,
          processNameWorklogsEdit
        ));
      data.length > 0 && setEstTimeDataWorklogsEdit(data);
      data.length > 0 &&
        setSubProcessWorklogsDropdownDataEdit(
          data.map((i: any) => new Object({ label: i.Name, value: i.Id }))
        );
    };

    getData();
  }, [processNameWorklogsEdit]);

  useEffect(() => {
    const getData = async () => {
      const assigneeData = await getAssigneeDropdownData(
        [clientNameWorklogsEdit],
        typeOfWorkWorklogsEdit
      );
      assigneeData.length > 0 &&
        setAssigneeWorklogsDropdownDataEdit(assigneeData);

      const reviewerData = await getReviewerDropdownData(
        [clientNameWorklogsEdit],
        typeOfWorkWorklogsEdit
      );
      reviewerData.length > 0 &&
        setReviewerWorklogsDropdownDataEdit(reviewerData);
    };

    typeOfWorkWorklogs !== 0 && getData();
  }, [typeOfWorkWorklogsEdit, clientNameWorklogsEdit]);

  const getUserDetails = async () => {
    const params = {};
    const url = `${process.env.api_url}/auth/getuserdetails`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
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
    setEditDataWorklogs([]);

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
    setDateOfReviewWorklogs("");
    setDateOfPreperationWorklogs("");
    setEstTimeDataWorklogs([]);
    setReturnYearWorklogs(0);
    setNoOfPagesWorklogs(0);
    setChecklistWorkpaperWorklogs(0);

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
    setEstTimeDataWorklogsEdit([]);
    setReturnYearWorklogsEdit(0);
    setReturnYearWorklogsEditErr(false);
    setNoOfPagesWorklogsEdit(0);
    setChecklistWorkpaperWorklogsEdit(0);
    setChecklistWorkpaperWorklogsEditErr(false);

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

    onDataFetch();

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
                    <span>Created By : {editDataWorklogs?.CreatedByName}</span>
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
                          (i: any) => i.value === clientNameWorklogs
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
                          (i: any, index: number) => (
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
                          (i: any) => i.value === projectNameWorklogs
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
                          (i: any) => i.value === statusWorklogs
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
                      options={processWorklogsDropdownData}
                      value={
                        processWorklogsDropdownData.find(
                          (i: any) => i.value === processNameWorklogs
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
                          (i: any) => i.value === subProcessWorklogs
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
                      label="Description"
                      fullWidth
                      className="pt-1"
                      value={
                        descriptionWorklogs?.trim().length <= 0
                          ? ""
                          : descriptionWorklogs
                      }
                      disabled
                      margin="normal"
                      variant="standard"
                      sx={{ mx: 0.75, width: 300, mt: -0.5 }}
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
                  <Grid item xs={3} className="pt-4">
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      options={assigneeWorklogsDropdownData}
                      disabled
                      value={
                        assigneeWorklogsDropdownData.find(
                          (i: any) => i.value === assigneeWorklogs
                        ) || null
                      }
                      sx={{ width: 300, mt: -1, mx: 0.75 }}
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
                          (i: any) => i.value === reviewerWorklogs
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
                          (i: any) => i.value === managerWorklogs
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
                              (i: any, index: number) => (
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
                          sx={{ width: 300, mt: -0.8, mx: 0.75 }}
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
                          onBlur={(e: any) => {
                            setInputTypePreperationWorklogsDrawer("text");
                          }}
                          margin="normal"
                          variant="standard"
                          sx={{
                            width: 300,
                            mt: typeOfWorkWorklogs === 3 ? -0.4 : -1,
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
                          onBlur={(e: any) => {
                            setInputTypeReviewWorklogsDrawer("text");
                          }}
                          margin="normal"
                          variant="standard"
                          sx={{
                            width: 300,
                            mt: typeOfWorkWorklogs === 3 ? -0.4 : -1,
                            mx: 0.75,
                          }}
                        />
                      </Grid>
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
                            (i: any) => i.value === clientNameWorklogsEdit
                          ) || null
                        }
                        onChange={(e, value: any) => {
                          value && setClientNameWorklogsEdit(value.value);
                          setTypeOfWorkWorklogsEditErr(false);
                          setProjectNameWorklogsEdit(0);
                          setProjectNameWorklogsEditErr(false);
                          setProcessNameWorklogsEdit(0);
                          setProcessNameWorklogsEditErr(false);
                          setSubProcessWorklogsEdit(0);
                          setSubProcessWorklogsEditErr(false);
                          setDescriptionWorklogsEdit("");
                          setManagerWorklogsEdit(0);
                          setManagerWorklogsEditErr(false);
                          setPriorityWorklogsEdit(0);
                          setQuantityWorklogsEdit(1);
                          setQuantityWorklogsEditErr(false);
                          setReceiverDateWorklogsEdit("");
                          setReceiverDateWorklogsEditErr(false);
                          setDueDateWorklogsEdit("");
                          assigneeWorklogsDisable && setAssigneeWorklogsEdit(0);
                          assigneeWorklogsDisable &&
                            setAssigneeWorklogsEditErr(false);
                          setReviewerWorklogsEdit(0);
                          setReviewerWorklogsEditErr(false);
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
                            onBlur={(e) => {
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
                            setTypeOfWorkWorklogsEdit(e.target.value);
                          }}
                          onBlur={(e: any) => {
                            if (e.target.value > 0) {
                              setTypeOfWorkWorklogsEditErr(false);
                            }
                          }}
                        >
                          {typeOfWorkWorklogsDropdownDataEdit.map(
                            (i: any, index: number) => (
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
                            (i: any) => i.value === projectNameWorklogsEdit
                          ) || null
                        }
                        onChange={(e, value: any) => {
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
                            onBlur={(e) => {
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
                        options={statusWorklogsDropdownDataUse}
                        value={
                          statusWorklogsDropdownDataUse.find(
                            (i: any) => i.value === statusWorklogsEdit
                          ) || null
                        }
                        onChange={(e, value: any) => {
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
                            onBlur={(e) => {
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
                        options={processWorklogsDropdownDataEdit}
                        value={
                          processWorklogsDropdownDataEdit.find(
                            (i: any) => i.value === processNameWorklogsEdit
                          ) || null
                        }
                        onChange={(e, value: any) => {
                          value && setProcessNameWorklogsEdit(value.value);
                          value && setSubProcessWorklogsEdit(0);
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
                            onBlur={(e) => {
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
                            (i: any) => i.value === subProcessWorklogsEdit
                          ) || null
                        }
                        onChange={(e, value: any) => {
                          value && setSubProcessWorklogsEdit(value.value);
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
                            onBlur={(e) => {
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
                        onBlur={(e: any) => {
                          if (e.target.value.trim().length > 4) {
                            setClientTaskNameWorklogsEditErr(false);
                          }
                          if (
                            e.target.value.trim().length > 4 &&
                            e.target.value.trim().length < 50
                          ) {
                            setClientTaskNameWorklogsEditErr(false);
                          }
                        }}
                        error={clientTaskNameWorklogsEditErr}
                        helperText={
                          clientTaskNameWorklogsEditErr &&
                          clientTaskNameWorklogsEdit?.trim().length > 0 &&
                          clientTaskNameWorklogsEdit?.trim().length < 4
                            ? "Minimum 4 characters required."
                            : clientTaskNameWorklogsEditErr &&
                              clientTaskNameWorklogsEdit?.trim().length > 50
                            ? "Maximum 50 characters allowed."
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
                        label="Description"
                        fullWidth
                        className="pt-1"
                        value={
                          descriptionWorklogsEdit?.trim().length <= 0
                            ? ""
                            : descriptionWorklogsEdit
                        }
                        onChange={(e) =>
                          setDescriptionWorklogsEdit(e.target.value)
                        }
                        margin="normal"
                        variant="standard"
                        sx={{ mx: 0.75, width: 300, mt: -0.5 }}
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
                          setQuantityWorklogsEdit(e.target.value);
                          setQuantityWorklogsEditErr(false);
                        }}
                        onBlur={(e: any) => {
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
                              quantityWorklogsEdit === ""
                            ? "This is a required field."
                            : quantityWorklogsEditErr &&
                              quantityWorklogsEdit <= 0
                            ? "Enter valid number."
                            : quantityWorklogsEditErr &&
                              quantityWorklogsEdit.length > 4
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
                            shouldDisableDate={isWeekend}
                            maxDate={dayjs(Date.now())}
                            onChange={(newDate: any) => {
                              setReceiverDateWorklogsEdit(newDate.$d);
                              setReceiverDateWorklogsEditErr(false);
                              const selectedDate = dayjs(newDate.$d);
                              let nextDate: any = selectedDate;
                              if (
                                selectedDate.day() === 4 ||
                                selectedDate.day() === 5
                              ) {
                                nextDate = nextDate.add(4, "day");
                              } else {
                                nextDate = dayjs(newDate.$d)
                                  .add(2, "day")
                                  .toDate();
                              }
                              setDueDateWorklogsEdit(nextDate);
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
                            disabled
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
                    <Grid item xs={3} className="pt-4">
                      <div
                        className={`inline-flex -mt-[11px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]`}
                      >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="All Info Date"
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
                    <Grid item xs={3} className="pt-4">
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={assigneeWorklogsDropdownDataEdit}
                        value={
                          assigneeWorklogsDropdownDataEdit.find(
                            (i: any) => i.value === assigneeWorklogsEdit
                          ) || null
                        }
                        onChange={(e, value: any) => {
                          value && setAssigneeWorklogsEdit(value.value);
                        }}
                        sx={{ width: 300, mt: -1, mx: 0.75 }}
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
                            onBlur={(e) => {
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
                            (i: any) => i.value === reviewerWorklogsEdit
                          ) || null
                        }
                        onChange={(e, value: any) => {
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
                            onBlur={(e) => {
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
                        options={managerWorklogsDropdownData}
                        value={
                          managerWorklogsDropdownData.find(
                            (i: any) => i.value === managerWorklogsEdit
                          ) || null
                        }
                        onChange={(e, value: any) => {
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
                            onBlur={(e) => {
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
                                setReturnYearWorklogsEdit(e.target.value)
                              }
                              onBlur={(e: any) => {
                                if (e.target.value > 0) {
                                  setReturnYearWorklogsEditErr(false);
                                }
                              }}
                            >
                              {yearWorklogsDrawerDropdown.map(
                                (i: any, index: number) => (
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
                              setNoOfPagesWorklogsEdit(e.target.value)
                            }
                            margin="normal"
                            variant="standard"
                            sx={{ width: 300, mt: 0, mx: 0.75 }}
                          />
                        </Grid>
                        <Grid item xs={3} className="pt-4">
                          <FormControl
                            variant="standard"
                            sx={{ width: 300, mt: -0.8, mx: 0.75 }}
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
                                  e.target.value
                                )
                              }
                              onBlur={(e: any) => {
                                if (e.target.value > 0) {
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
