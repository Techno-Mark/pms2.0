import React, { useEffect, useState } from "react";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";
import TaskIcon from "@/assets/icons/TaskIcon";
import HistoryIcon from "@/assets/icons/HistoryIcon";
import BellIcon from "@/assets/icons/BellIcon";
import ClockIcon from "@/assets/icons/ClockIcon";
import CheckListIcon from "../../assets/icons/CheckListIcon";
import CommentsIcon from "../../assets/icons/CommentsIcon";
import SendIcon from "../../assets/icons/worklogs/SendIcon";
import AddIcon from "../../assets/icons/worklogs/AddIcon";
import RemoveIcon from "../../assets/icons/worklogs/RemoveIcon";
import { toast } from "react-toastify";
import {
  Autocomplete,
  Avatar,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
} from "@mui/material";
import { Close, Download, Save } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import { useRouter } from "next/navigation";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { MentionsInput, Mention } from "react-mentions";
import mentionsInputStyle from "../../utils/worklog/mentionsInputStyle";
import {
  extractText,
  getYears,
  hasPermissionWorklog,
  isWeekend,
} from "@/utils/commonFunction";
import {
  days,
  getAssigneeDropdownData,
  getCCDropdownData,
  getClientDropdownData,
  getCommentUserDropdownData,
  getDepartmentDataByClient,
  getManagerDropdownData,
  getNatureOfErrorDropdownData,
  getProcessDropdownData,
  getProjectDropdownData,
  getReviewerDropdownData,
  getStatusDropdownData,
  getSubProcessDropdownData,
  getTypeOfWorkDropdownData,
  hours,
  months,
} from "@/utils/commonDropdownApiCall";
import ImageUploader from "../common/ImageUploader";
import { getFileFromBlob } from "@/utils/downloadFile";
import { ColorToolTip, getMuiTheme } from "@/utils/datatable/CommonStyle";
import { callAPI } from "@/utils/API/callAPI";
import MUIDataTable from "mui-datatables";
import { generateCommonBodyRender } from "@/utils/datatable/CommonFunction";
import OverLay from "../common/OverLay";
import {
  AuditlogGetByWorkitem,
  CommentAttachment,
  CommentGetByWorkitem,
  ErrorlogGetByWorkitem,
  GetManualLogByWorkitem,
  GetReviewerNoteList,
  ManualFieldsWorklogs,
  RecurringGetByWorkitem,
  ReminderGetByWorkitem,
  ReviewerNoteDetails,
  SubtaskGetByWorkitem,
  WorkitemGetbyid,
} from "@/utils/Types/worklogsTypes";
import {
  IdNameEstimatedHour,
  LabelValue,
  LabelValueProfileImage,
  LabelValueType,
  User,
} from "@/utils/Types/types";
import {
  errorTypeOptions,
  impactOptions,
  priorityOptions,
  resolutionStatusOptions,
  rootCauseOptions,
} from "@/utils/staticDropdownData";

interface EditDrawer {
  onOpen: boolean;
  onClose: () => void;
  onEdit: number;
  submissionId?: number;
  onDataFetch: (() => void) | null;
  onRecurring?: boolean;
  onComment?: boolean;
  isUnassigneeClicked?: boolean;
  isTaskDisabled?: boolean;
  onErrorLog?: boolean;
}

const EditDrawer = ({
  onOpen,
  onClose,
  onEdit,
  submissionId = 0,
  onDataFetch,
  onRecurring = false,
  onComment = false,
  isUnassigneeClicked = false,
  isTaskDisabled = false,
  onErrorLog = false,
}: EditDrawer) => {
  const router = useRouter();
  const yearWorklogsDrawerDropdown = getYears();
  const [isLoadingWorklogs, setIsLoadingWorklogs] = useState(false);
  const [inputTypeReviewWorklogsDrawer, setInputTypeReviewWorklogsDrawer] =
    useState("text");
  const [
    inputTypePreperationWorklogsDrawer,
    setInputTypePreperationWorklogsDrawer,
  ] = useState("text");
  const [isCreatedByClientWorklogsDrawer, setIsCreatedByClientWorklogsDrawer] =
    useState(false);
  const [editDataWorklogs, setEditDataWorklogs] = useState<any>([]);
  const [isIdDisabled, setIsIdDisabled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(isTaskDisabled);

  let reviewerDate = new Date();
  reviewerDate.setDate(reviewerDate.getDate() - 1);

  useEffect(() => {
    onRecurring && scrollToPanel(4);
    onComment && scrollToPanel(3);
    onErrorLog && scrollToPanel(7);
  }, [onOpen, onComment, onRecurring, onErrorLog]);

  let Task;
  {
    onEdit > 0 && isDisabled
      ? (Task = [
          "Task",
          "Sub-Task",
          "Checklist",
          "Comments",
          "Recurring",
          hasPermissionWorklog("", "Approve", "QA") && "Manual Time",
          "Reminder",
          hasPermissionWorklog("", "ErrorLog", "QA") && "Error Logs",
          "Reviewer's Note",
          "Logs",
        ])
      : onEdit > 0 && !isDisabled
      ? (Task = [
          hasPermissionWorklog("Task/SubTask", "View", "WorkLogs") && "Task",
          hasPermissionWorklog("Task/SubTask", "View", "WorkLogs") &&
            "Sub-Task",
          hasPermissionWorklog("CheckList", "View", "WorkLogs") && "Checklist",
          hasPermissionWorklog("Comment", "View", "WorkLogs") && "Comments",
          hasPermissionWorklog("Reccuring", "View", "WorkLogs") && "Recurring",
          "Manual Time",
          hasPermissionWorklog("Reminder", "View", "WorkLogs") && "Reminder",
          hasPermissionWorklog("ErrorLog", "View", "WorkLogs") && "Error Logs",
          "Reviewer's Note",
          "Logs",
        ])
      : (Task = [
          hasPermissionWorklog("Task/SubTask", "View", "WorkLogs") && "Task",
          hasPermissionWorklog("Task/SubTask", "View", "WorkLogs") &&
            "Sub-Task",
          hasPermissionWorklog("Reccuring", "View", "WorkLogs") && "Recurring",
          "Manual Time",
          hasPermissionWorklog("Reminder", "View", "WorkLogs") && "Reminder",
        ]);
  }

  const handleTabClick = (index: number) => {
    scrollToPanel(index);
  };

  const scrollToPanel = (index: number) => {
    const panel = document.getElementById(`tabpanel-${index}`);
    if (panel) {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleMultiSelect = (e: React.SyntheticEvent, value: LabelValue[]) => {
    if (value !== undefined) {
      setReminderNotification(value);
    } else {
      setReminderNotification([]);
    }
  };

  const handleMultiSelectMonth = (
    e: React.SyntheticEvent,
    value: LabelValue[]
  ) => {
    if (value !== undefined) {
      setRecurringMonth(value);
    } else {
      setRecurringMonth([]);
    }
  };

  // Task
  const [taskWorklogsDrawer, setTaskWorklogsDrawer] = useState(true);
  const [clientWorklogsDropdownData, setClientWorklogsDropdownData] = useState<
    LabelValue[] | []
  >([]);
  const [clientNameWorklogs, setClientNameWorklogs] = useState<number>(0);
  const [clientNameWorklogsErr, setClientNameWorklogsErr] = useState(false);
  const [typeOfWorkWorklogsDropdownData, setTypeOfWorkWorklogsDropdownData] =
    useState<LabelValue[] | []>([]);
  const [typeOfWorkWorklogs, setTypeOfWorkWorklogs] = useState<number>(0);
  const [typeOfWorkWorklogsErr, setTypeOfWorkWorklogsErr] = useState(false);
  const [projectWorklogsDropdownData, setProjectWorklogsDropdownData] =
    useState<LabelValue[] | []>([]);
  const [projectNameWorklogs, setProjectNameWorklogs] = useState<number>(0);
  const [projectNameWorklogsErr, setProjectNameWorklogsErr] = useState(false);
  const [processWorklogsDropdownData, setProcessWorklogsDropdownData] =
    useState<LabelValue[] | []>([]);
  const [processNameWorklogs, setProcessNameWorklogs] = useState<number>(0);
  const [processNameWorklogsErr, setProcessNameWorklogsErr] = useState(false);
  const [subProcessWorklogsDropdownData, setSubProcessWorklogsDropdownData] =
    useState([]);
  const [subProcessWorklogs, setSubProcessWorklogs] = useState<number>(0);
  const [subProcessWorklogsErr, setSubProcessWorklogsErr] = useState(false);
  const [clientTaskNameWorklogs, setClientTaskNameWorklogs] =
    useState<string>("");
  const [clientTaskNameWorklogsErr, setClientTaskNameWorklogsErr] =
    useState(false);
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
  const [qaQuantityWorklogs, setQAQuantityWorklogs] = useState<number | null>(
    null
  );
  const [qaQuantityWorklogsErr, setQAQuantityWorklogsErr] = useState(false);
  const [managerWorklogsErr, setManagerWorklogsErr] = useState(false);
  const [statusWorklogsDropdownData, setStatusWorklogsDropdownData] = useState(
    []
  );
  const [statusWorklogsDropdownDataUse, setStatusWorklogsDropdownDataUse] =
    useState([]);
  const [errorlogSignedOffPending, setErrorlogSignOffPending] = useState(false);
  const [statusWorklogs, setStatusWorklogs] = useState<number>(0);
  const [statusWorklogsType, setStatusWorklogsType] = useState<string | null>(
    null
  );
  const [editStatusWorklogs, setEditStatusWorklogs] = useState<number>(0);
  const [statusWorklogsErr, setStatusWorklogsErr] = useState(false);
  const [descriptionWorklogs, setDescriptionWorklogs] = useState<string>("");
  const [descriptionWorklogsErr, setDescriptionWorklogsErr] =
    useState<boolean>(false);
  const [priorityWorklogs, setPriorityWorklogs] = useState<string | number>(0);
  const [quantityWorklogs, setQuantityWorklogs] = useState<number>(1);
  const [quantityWorklogsErr, setQuantityWorklogsErr] = useState(false);
  const [receiverDateWorklogs, setReceiverDateWorklogs] = useState<string>("");
  const [receiverDateWorklogsErr, setReceiverDateWorklogsErr] = useState(false);
  const [dueDateWorklogs, setDueDateWorklogs] = useState<string>("");
  const [allInfoDateWorklogs, setAllInfoDateWorklogs] = useState<string>("");
  const [assigneeWorklogsDropdownData, setAssigneeWorklogsDropdownData] =
    useState<LabelValue[] | []>([]);
  const [assigneeWorklogs, setAssigneeWorklogs] = useState<number>(0);
  const [assigneeWorklogsErr, setAssigneeWorklogsErr] = useState(false);
  const [assigneeWorklogsDisable, setAssigneeWorklogsDisable] =
    useState<boolean>(true);
  const [reviewerWorklogsDropdownData, setReviewerWorklogsDropdownData] =
    useState([]);
  const [reviewerWorklogs, setReviewerWorklogs] = useState<number>(0);
  const [reviewerWorklogsErr, setReviewerWorklogsErr] = useState(false);
  const [departmentWorklogsDropdownData, setDepartmentWorklogsDropdownData] =
    useState([]);
  const [departmentWorklogs, setDepartmentWorklogs] = useState<number>(0);
  const [departmentWorklogsType, setDepartmentWorklogsType] =
    useState<string>("");
  const [departmentWorklogsErr, setDepartmentWorklogsErr] = useState(false);
  const [dateOfReviewWorklogs, setDateOfReviewWorklogs] = useState<string>("");
  const [dateOfPreperationWorklogs, setDateOfPreperationWorklogs] =
    useState<string>("");
  const [estTimeDataWorklogs, setEstTimeDataWorklogs] = useState([]);
  const [userId, setUserId] = useState(0);
  const [returnYearWorklogs, setReturnYearWorklogs] = useState<number>(0);
  const [returnYearWorklogsErr, setReturnYearWorklogsErr] = useState(false);
  const [noOfPagesWorklogs, setNoOfPagesWorklogs] = useState<number>(0);
  const [checklistWorkpaperWorklogs, setChecklistWorkpaperWorklogs] =
    useState<number>(0);
  const [checklistWorkpaperWorklogsErr, setChecklistWorkpaperWorklogsErr] =
    useState(false);
  const [valueMonthYearFrom, setValueMonthYearFrom] = useState<any>(null);
  const [valueMonthYearTo, setValueMonthYearTo] = useState<any>(null);
  const [reworkReceiverDateWorklogs, setReworkReceiverDateWorklogs] =
    useState("");
  const [reworkReceiverDateWorklogsErr, setReworkReceiverDateWorklogsErr] =
    useState(false);
  const [reworkDueDateWorklogs, setReworkDueDateWorklogs] = useState("");
  const [missingInfoWorklogs, setMissingInfoWorklogs] = useState<string | null>(
    null
  );
  const [missingInfoWorklogsErr, setMissingInfoWorklogsErr] =
    useState<boolean>(false);

  const previousYearStartDate = dayjs()
    .subtract(1, "year")
    .startOf("year")
    .toDate();
  const currentYearEndDate = dayjs().endOf("year").toDate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      let adminStatus = localStorage.getItem("isAdmin") === "true";
      let departmentId: any = localStorage.getItem("departmentId");
      setIsAdmin(adminStatus);
      adminStatus === false &&
        onEdit <= 0 &&
        setDepartmentWorklogs(
          Number(departmentId) > 0 ? Number(departmentId) : 0
        );
    }
  }, [onOpen]);

  // Sub-Task
  const [subTaskWorklogsDrawer, setSubTaskWorklogsDrawer] = useState(true);
  const [subTaskSwitchWorklogs, setSubTaskSwitchWorklogs] = useState(false);
  const [subTaskFieldsWorklogs, setSubTaskFieldsWorklogs] = useState([
    {
      SubtaskId: 0,
      Title: "",
      Description: "",
    },
  ]);
  const [taskNameWorklogsErr, setTaskNameWorklogsErr] = useState([false]);
  const [subTaskDescriptionWorklogsErr, setSubTaskDescriptionWorklogsErr] =
    useState([false]);
  const [deletedSubTaskWorklogs, setDeletedSubTaskWorklogs] = useState<
    number[] | []
  >([]);

  const addTaskFieldWorklogs = () => {
    setSubTaskFieldsWorklogs([
      ...subTaskFieldsWorklogs,
      {
        SubtaskId: 0,
        Title: "",
        Description: "",
      },
    ]);
    setTaskNameWorklogsErr([...taskNameWorklogsErr, false]);
    setSubTaskDescriptionWorklogsErr([...subTaskDescriptionWorklogsErr, false]);
  };

  const removeTaskFieldWorklogs = (index: number) => {
    setDeletedSubTaskWorklogs([
      ...deletedSubTaskWorklogs,
      subTaskFieldsWorklogs[index].SubtaskId,
    ]);

    const newTaskWorklogsFields = [...subTaskFieldsWorklogs];
    newTaskWorklogsFields.splice(index, 1);
    setSubTaskFieldsWorklogs(newTaskWorklogsFields);

    const newTaskWorklogsErrors = [...taskNameWorklogsErr];
    newTaskWorklogsErrors.splice(index, 1);
    setTaskNameWorklogsErr(newTaskWorklogsErrors);

    const newSubTaskDescriptionWorklogsErrors = [
      ...subTaskDescriptionWorklogsErr,
    ];
    newSubTaskDescriptionWorklogsErrors.splice(index, 1);
    setSubTaskDescriptionWorklogsErr(newSubTaskDescriptionWorklogsErrors);
  };

  const handleSubTaskChangeWorklogs = (e: string, index: number) => {
    const newTaskWorklogsFields = [...subTaskFieldsWorklogs];
    newTaskWorklogsFields[index].Title = e;
    setSubTaskFieldsWorklogs(newTaskWorklogsFields);

    const newTaskWorklogsErrors = [...taskNameWorklogsErr];
    newTaskWorklogsErrors[index] = e.trim().length < 5 || e.trim().length > 50;
    setTaskNameWorklogsErr(newTaskWorklogsErrors);
  };

  const handleSubTaskDescriptionChangeWorklogs = (e: string, index: number) => {
    const newTaskWorklogsFields = [...subTaskFieldsWorklogs];
    newTaskWorklogsFields[index].Description = e;
    setSubTaskFieldsWorklogs(newTaskWorklogsFields);

    const newSubTaskDescWorklogsErrors = [...subTaskDescriptionWorklogsErr];
    newSubTaskDescWorklogsErrors[index] =
      e.trim().length === 0 || e.trim().length > 500;
    setSubTaskDescriptionWorklogsErr(newSubTaskDescWorklogsErrors);
  };

  const getSubTaskDataWorklogs = async () => {
    const params = {
      WorkitemId: onEdit,
    };
    const url = `${process.env.worklog_api_url}/workitem/subtask/getbyworkitem`;
    const successCallback = (
      ResponseData: SubtaskGetByWorkitem[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (
        ResponseStatus === "Success" &&
        ResponseData.length > 0 &&
        error === false
      ) {
        setSubTaskSwitchWorklogs(
          hasPermissionWorklog("Task/SubTask", "save", "WorkLogs")
        );
        setSubTaskFieldsWorklogs(ResponseData);
      } else {
        setSubTaskSwitchWorklogs(false);
        setSubTaskFieldsWorklogs([
          {
            SubtaskId: 0,
            Title: "",
            Description: "",
          },
        ]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSubmitSubTaskWorklogs = async () => {
    let hasSubErrors = false;
    const newTaskErrors = subTaskFieldsWorklogs.map(
      (field) =>
        (subTaskSwitchWorklogs && field.Title.trim().length < 5) ||
        (subTaskSwitchWorklogs && field.Title.trim().length > 50)
    );
    subTaskSwitchWorklogs && setTaskNameWorklogsErr(newTaskErrors);
    const newSubTaskDescErrors = subTaskFieldsWorklogs.map(
      (field) =>
        (subTaskSwitchWorklogs && field.Description.trim().length <= 0) ||
        (subTaskSwitchWorklogs && field.Description.trim().length > 500)
    );
    subTaskSwitchWorklogs &&
      setSubTaskDescriptionWorklogsErr(newSubTaskDescErrors);
    hasSubErrors =
      newTaskErrors.some((error) => error) ||
      newSubTaskDescErrors.some((error) => error);

    if (hasPermissionWorklog("Task/SubTask", "save", "WorkLogs")) {
      if (!hasSubErrors) {
        setIsLoadingWorklogs(true);
        const params = {
          workitemId: onEdit,
          subtasks: subTaskSwitchWorklogs
            ? subTaskFieldsWorklogs.map(
                (i: SubtaskGetByWorkitem) =>
                  new Object({
                    SubtaskId: i.SubtaskId,
                    Title: i.Title.trim(),
                    Description: i.Description.trim(),
                  })
              )
            : null,
          deletedWorkitemSubtaskIds: deletedSubTaskWorklogs,
        };
        const url = `${process.env.worklog_api_url}/workitem/subtask/savebyworkitem`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Sub Task Updated successfully.`);
            setDeletedSubTaskWorklogs([]);
            setSubTaskFieldsWorklogs([
              {
                SubtaskId: 0,
                Title: "",
                Description: "",
              },
            ]);
            setIsLoadingWorklogs(false);
            getSubTaskDataWorklogs();
          }
          setIsLoadingWorklogs(false);
        };
        callAPI(url, params, successCallback, "POST");
      }
    } else {
      toast.error("User don't have permission to Update Sub-Task.");
      getSubTaskDataWorklogs();
    }
  };

  // Recurring
  const [recurringWorklogsDrawer, setRecurringWorklogsDrawer] = useState(true);
  const [recurringSwitch, setRecurringSwitch] = useState(false);
  const [recurringStartDate, setRecurringStartDate] = useState("");
  const [recurringStartDateErr, setRecurringStartDateErr] = useState(false);
  const [recurringEndDate, setRecurringEndDate] = useState("");
  const [recurringEndDateErr, setRecurringEndDateErr] = useState(false);
  const [recurringTime, setRecurringTime] = useState<number>(1);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [recurringMonth, setRecurringMonth] = useState<any>(0);
  const [recurringMonthErr, setRecurringMonthErr] = useState(false);
  const [recurringWeekErr, setRecurringWeekErr] = useState(false);

  const toggleColor = (index: number) => {
    if (selectedDays?.includes(index)) {
      setSelectedDays(
        selectedDays.filter((dayIndex: number) => dayIndex !== index)
      );
    } else {
      setSelectedDays([...selectedDays, index]);
    }
  };

  const getRecurringDataWorklogs = async () => {
    const params = {
      WorkitemId: onEdit,
    };
    const url = `${process.env.worklog_api_url}/workitem/recurring/getbyworkitem`;
    const successCallback = (
      ResponseData: RecurringGetByWorkitem | null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (
        ResponseStatus === "Success" &&
        ResponseData !== null &&
        error === false
      ) {
        setRecurringSwitch(
          hasPermissionWorklog("Reccuring", "save", "WorkLogs")
        );
        setRecurringStartDate(ResponseData.StartDate);
        setRecurringEndDate(ResponseData.EndDate);
        setRecurringTime(ResponseData.Type);
        ResponseData.Type === 2 && setSelectedDays(ResponseData.Triggers);
        ResponseData.Type === 3 &&
          setRecurringMonth(
            ResponseData.Triggers.map((trigger: number) =>
              months.find((month) => month.value === trigger)
            ).filter(Boolean)
          );
      } else {
        setRecurringSwitch(false);
        setRecurringStartDate("");
        setRecurringEndDate("");
        setRecurringTime(0);
        setSelectedDays([]);
        setRecurringMonth(0);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSubmitRecurringWorklogs = async () => {
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

    const fieldValidations = {
      recurringStartDate: recurringSwitch && validateField(recurringStartDate),
      recurringEndDate: recurringSwitch && validateField(recurringEndDate),
      recurringMonth:
        recurringSwitch && recurringTime === 3 && validateField(recurringMonth),
      selectedDays:
        recurringSwitch && recurringTime === 2 && validateField(selectedDays),
    };

    recurringSwitch &&
      setRecurringStartDateErr(fieldValidations.recurringStartDate);
    recurringSwitch &&
      setRecurringEndDateErr(fieldValidations.recurringEndDate);
    recurringSwitch &&
      recurringTime === 3 &&
      setRecurringMonthErr(fieldValidations.recurringMonth);
    recurringSwitch &&
      recurringTime === 2 &&
      setRecurringWeekErr(fieldValidations.selectedDays);

    const hasErrors = Object.values(fieldValidations).some((error) => error);

    if (hasPermissionWorklog("Reccuring", "save", "WorkLogs")) {
      if (!hasErrors) {
        setIsLoadingWorklogs(true);
        const params = {
          WorkitemId: onEdit,
          Type: recurringTime,
          StartDate: dayjs(recurringStartDate).format("YYYY/MM/DD"),
          EndDate: dayjs(recurringEndDate).format("YYYY/MM/DD"),
          Triggers:
            recurringTime === 1
              ? []
              : recurringTime === 2
              ? selectedDays
              : recurringMonth.map((i: LabelValue) => i.value),
        };
        const url = `${process.env.worklog_api_url}/workitem/recurring/savebyworkitem`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Recurring Updated successfully.`);
            setDeletedSubTaskWorklogs([]);
            setIsLoadingWorklogs(false);
            getRecurringDataWorklogs();
          }
          setIsLoadingWorklogs(false);
        };
        callAPI(url, params, successCallback, "POST");
      }
    } else {
      toast.error("User don't have permission to Update Recurring.");
      setDeletedSubTaskWorklogs([]);
      getRecurringDataWorklogs();
    }
  };

  // Manula
  const [manualTimeWorklogsDrawer, setManualTimeWorklogsDrawer] =
    useState(true);
  const [manualSwitchWorklogs, setManualSwitchWorklogs] = useState(false);
  const [deletedManualTimeWorklogs, setDeletedManualTimeWorklogs] = useState<
    number[] | []
  >([]);
  const [manualFieldsWorklogs, setManualFieldsWorklogs] = useState<
    ManualFieldsWorklogs[]
  >([
    {
      AssigneeId: 0,
      Id: 0,
      inputDate: "",
      startTime: 0,
      manualDesc: "",
      IsApproved: false,
    },
  ]);
  const [inputDateWorklogsErrors, setInputDateWorklogsErrors] = useState([
    false,
  ]);
  const [startTimeWorklogsErrors, setStartTimeWorklogsErrors] = useState([
    false,
  ]);
  const [manualDescWorklogsErrors, setManualDescWorklogsErrors] = useState([
    false,
  ]);
  const [inputTypeWorklogsDate, setInputTypeWorklogsDate] = useState(["text"]);
  const [inputTypeStartWorklogsTime, setInputTypeStartWorklogsTime] = useState([
    "text",
  ]);
  const [inputTypeEndWorklogsTime, setInputTypeEndWorklogsTime] = useState([
    "text",
  ]);
  const [manualSubmitWorklogsDisable, setManualSubmitWorklogsDisable] =
    useState(true);

  const setManualDisableData = (manualField: ManualFieldsWorklogs[]) => {
    setManualSubmitWorklogsDisable(
      manualField
        .map((i: ManualFieldsWorklogs) =>
          i.IsApproved === false ? false : true
        )
        .includes(false) || deletedManualTimeWorklogs.length > 0
        ? false
        : true
    );
  };

  useEffect(() => {
    deletedManualTimeWorklogs.length > 0 &&
      setManualDisableData(manualFieldsWorklogs);
  }, [deletedManualTimeWorklogs]);

  const addManulaFieldWorklogs = async () => {
    await setManualFieldsWorklogs([
      ...manualFieldsWorklogs,
      {
        AssigneeId: 0,
        Id: 0,
        inputDate: "",
        startTime: 0,
        manualDesc: "",
        IsApproved: false,
      },
    ]);
    setInputDateWorklogsErrors([...inputDateWorklogsErrors, false]);
    setStartTimeWorklogsErrors([...startTimeWorklogsErrors, false]);
    setManualDescWorklogsErrors([...manualDescWorklogsErrors, false]);
    setInputTypeWorklogsDate([...inputTypeWorklogsDate, "text"]);
    setInputTypeStartWorklogsTime([...inputTypeStartWorklogsTime, "text"]);
    setInputTypeEndWorklogsTime([...inputTypeEndWorklogsTime, "text"]);
    setManualDisableData([
      ...manualFieldsWorklogs,
      {
        AssigneeId: 0,
        Id: 0,
        inputDate: "",
        startTime: 0,
        manualDesc: "",
        IsApproved: false,
      },
    ]);
  };

  const removePhoneFieldWorklogs = (index: number) => {
    setDeletedManualTimeWorklogs([
      ...deletedManualTimeWorklogs,
      manualFieldsWorklogs[index].Id,
    ]);

    const newManualWorklogsFields = [...manualFieldsWorklogs];
    newManualWorklogsFields.splice(index, 1);
    setManualFieldsWorklogs(
      manualFieldsWorklogs.length === 1 &&
        index === 0 &&
        manualFieldsWorklogs[index].Id > 0
        ? [
            {
              AssigneeId: 0,
              Id: 0,
              inputDate: "",
              startTime: 0,
              manualDesc: "",
              IsApproved: false,
            },
          ]
        : newManualWorklogsFields
    );

    const newInputDateWorklogsErrors = [...inputDateWorklogsErrors];
    newInputDateWorklogsErrors.splice(index, 1);
    setInputDateWorklogsErrors(newInputDateWorklogsErrors);

    const newStartTimeWorklogsErrors = [...startTimeWorklogsErrors];
    newStartTimeWorklogsErrors.splice(index, 1);
    setStartTimeWorklogsErrors(newStartTimeWorklogsErrors);

    const newManualDescWorklogsErrors = [...manualDescWorklogsErrors];
    newManualDescWorklogsErrors.splice(index, 1);
    setManualDescWorklogsErrors(newManualDescWorklogsErrors);

    const newManualWorklogsDate = [...inputTypeWorklogsDate];
    newManualWorklogsDate.splice(index, 1);
    setInputTypeWorklogsDate(newManualWorklogsDate);

    manualFieldsWorklogs.length > 1 &&
      // index > 0 &&
      // manualFieldsWorklogs[index].Id <= 0 &&
      setManualDisableData(newManualWorklogsFields);
    manualFieldsWorklogs.length === 1 &&
      index === 0 &&
      manualFieldsWorklogs[index].Id > 0 &&
      handleSubmitManualWorklogsRemove(manualFieldsWorklogs[index].Id);
  };

  const handleInputDateChangeWorklogs = (e: string, index: number) => {
    const newManualWorklogsFields = [...manualFieldsWorklogs];
    newManualWorklogsFields[index].inputDate = e;
    setManualFieldsWorklogs(newManualWorklogsFields);

    const newInputDateWorklogsErrors = [...inputDateWorklogsErrors];
    newInputDateWorklogsErrors[index] = e.length === 0;
    setInputDateWorklogsErrors(newInputDateWorklogsErrors);
  };

  const handleStartTimeChangeWorklogs = (e: string, index: number) => {
    if (e.length === 0) {
      const newManualWorklogsFields: ManualFieldsWorklogs[] = [
        ...manualFieldsWorklogs,
      ];
      newManualWorklogsFields[index].startTime = 0;
      setManualFieldsWorklogs(newManualWorklogsFields);
      return;
    }

    if (e.length > 1 && !/^[0-9]+$/.test(e)) {
      return;
    }

    if (e.length > 3) {
      return;
    }

    const newManualWorklogsFields: ManualFieldsWorklogs[] = [
      ...manualFieldsWorklogs,
    ];
    newManualWorklogsFields[index].startTime = Number(e) || 0;
    setManualFieldsWorklogs(newManualWorklogsFields);
  };

  const handleManualDescChangeWorklogs = (e: string, index: number) => {
    const newManualWorklogsFields = [...manualFieldsWorklogs];
    newManualWorklogsFields[index].manualDesc = e;
    setManualFieldsWorklogs(newManualWorklogsFields);

    const newManualDescWorklogsErrors = [...manualDescWorklogsErrors];
    newManualDescWorklogsErrors[index] =
      e.trim().length === 0 || e.trim().length > 500;
    setManualDescWorklogsErrors(newManualDescWorklogsErrors);
  };

  const getManualDataWorklogs = async () => {
    const params = {
      WorkitemId: onEdit,
    };
    const url = `${process.env.worklog_api_url}/workitem/${
      isTaskDisabled
        ? "quality/getmanuallogbyworkitem"
        : "timelog/getManuallogByWorkitem"
    }`;
    const successCallback = (
      ResponseData: GetManualLogByWorkitem[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (
        ResponseStatus === "Success" &&
        ResponseData.length > 0 &&
        error === false
      ) {
        setManualSwitchWorklogs(true);
        setManualSubmitWorklogsDisable(
          ResponseData.map(
            (i: GetManualLogByWorkitem) =>
              i.IsApproved === false && i.AssigneeId !== Number(userId)
          ).includes(true)
            ? false
            : true
        );
        setManualFieldsWorklogs(
          ResponseData.map((i: GetManualLogByWorkitem) => ({
            AssigneeId: i.AssigneeId,
            Id: i.Id,
            inputDate: i.Date,
            startTime: i.Time,
            manualDesc: i.Comment,
            IsApproved: i.IsApproved,
          }))
        );
      } else {
        setManualSwitchWorklogs(false);
        setManualSubmitWorklogsDisable(true);
        setManualFieldsWorklogs([
          {
            AssigneeId: 0,
            Id: 0,
            inputDate: "",
            startTime: 0,
            manualDesc: "",
            IsApproved: false,
          },
        ]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSubmitManualWorklogs = async () => {
    const localString: string | null = localStorage.getItem("UserId");
    const localNumber: number = localString ? parseInt(localString) : 0;

    if (
      assigneeWorklogs === localNumber ||
      hasPermissionWorklog("", "Approve", "QA")
    ) {
      let hasManualErrors = false;
      const newInputDateWorklogsErrors = manualFieldsWorklogs.map(
        (field) => manualSwitchWorklogs && field.inputDate === ""
      );
      manualSwitchWorklogs &&
        setInputDateWorklogsErrors(newInputDateWorklogsErrors);
      const newStartTimeWorklogsErrors = manualFieldsWorklogs.map(
        (field) =>
          manualSwitchWorklogs &&
          (field.startTime.toString().trim().length === 0 ||
            field.startTime.toString().trim().length > 3 ||
            field.startTime.toString() == "0" ||
            field.startTime.toString() == "00" ||
            field.startTime.toString() == "000" ||
            field.startTime > 480)
      );
      manualSwitchWorklogs &&
        setStartTimeWorklogsErrors(newStartTimeWorklogsErrors);
      const newManualDescWorklogsErrors = manualFieldsWorklogs.map(
        (field) =>
          (manualSwitchWorklogs && field.manualDesc.trim().length < 1) ||
          (manualSwitchWorklogs && field.manualDesc.trim().length > 500)
      );
      manualSwitchWorklogs &&
        setManualDescWorklogsErrors(newManualDescWorklogsErrors);
      hasManualErrors =
        newInputDateWorklogsErrors.some((error) => error) ||
        newStartTimeWorklogsErrors.some((error) => error) ||
        newManualDescWorklogsErrors.some((error) => error);

      if (!hasManualErrors) {
        setIsLoadingWorklogs(true);
        const params = {
          timelogs: manualFieldsWorklogs.map(
            (i: ManualFieldsWorklogs) =>
              new Object({
                id: i.Id,
                Date: dayjs(i.inputDate).format("YYYY/MM/DD"),
                Time: i.startTime,
                assigneeId:
                  i.AssigneeId === 0 ? assigneeWorklogs : i.AssigneeId,
                comment: i.manualDesc,
              })
          ),
          deletedTimelogIds: deletedManualTimeWorklogs,
        };
        const url = `${process.env.worklog_api_url}/workitem/${
          isTaskDisabled
            ? "quality/saveqamanualtimelog"
            : "timelog/saveManuallogByworkitem"
        }`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Manual Time Updated successfully.`);
            setDeletedManualTimeWorklogs([]);
            getEditDataWorklogs();
            getManualDataWorklogs();
            setIsLoadingWorklogs(false);
          } else {
            getManualDataWorklogs();
            getEditDataWorklogs();
            setIsLoadingWorklogs(false);
          }
        };
        callAPI(
          url,
          isTaskDisabled
            ? {
                submissionId: submissionId,
                ...params,
              }
            : {
                workItemId: onEdit,
                ...params,
              },
          successCallback,
          "POST"
        );
      }
    } else {
      toast.warning("Only Assingnee can Edit Manual time.");
      getManualDataWorklogs();
    }
  };

  const handleSubmitManualWorklogsRemove = async (id: number) => {
    const localString: string | null = localStorage.getItem("UserId");
    const localNumber: number = localString ? parseInt(localString) : 0;

    if (
      assigneeWorklogs === localNumber ||
      hasPermissionWorklog("", "Approve", "QA")
    ) {
      setIsLoadingWorklogs(true);
      const params = {
        timelogs: [],
        deletedTimelogIds: [...deletedManualTimeWorklogs, id],
      };
      const url = `${process.env.worklog_api_url}/workitem/${
        isTaskDisabled
          ? "quality/saveqamanualtimelog"
          : "timelog/saveManuallogByworkitem"
      }`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success(`Manual Time Updated successfully.`);
          setDeletedManualTimeWorklogs([]);
          getEditDataWorklogs();
          getManualDataWorklogs();
          setIsLoadingWorklogs(false);
        } else {
          getManualDataWorklogs();
          getEditDataWorklogs();
          setIsLoadingWorklogs(false);
        }
      };
      callAPI(
        url,
        isTaskDisabled
          ? {
              submissionId: submissionId,
              ...params,
            }
          : {
              workItemId: onEdit,
              ...params,
            },
        successCallback,
        "POST"
      );
    } else {
      toast.warning("Only Assingnee can Edit Manual time.");
      getManualDataWorklogs();
    }
  };

  // Reminder
  const [reminderWorklogsDrawer, setReminderWorklogsDrawer] = useState(true);
  const [reminderSwitch, setReminderSwitch] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderDateErr, setReminderDateErr] = useState(false);
  const [reminderTime, setReminderTime] = useState<number>(0);
  const [reminderTimeErr, setReminderTimeErr] = useState(false);
  const [reminderNotification, setReminderNotification] = useState<any>([]);
  const [reminderNotificationErr, setReminderNotificationErr] = useState(false);
  const [reminderCheckboxValue, setReminderCheckboxValue] = useState<number>(1);
  const [reminderId, setReminderId] = useState(0);

  const getReminderDataWorklogs = async () => {
    const params = {
      WorkitemId: onEdit,
    };
    const url = `${process.env.worklog_api_url}/workitem/reminder/getbyworkitem`;
    const successCallback = (
      ResponseData: ReminderGetByWorkitem | null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (
        ResponseStatus === "Success" &&
        ResponseData !== null &&
        error === false
      ) {
        setReminderId(ResponseData.ReminderId);
        setReminderSwitch(hasPermissionWorklog("Reminder", "save", "WorkLogs"));
        setReminderCheckboxValue(ResponseData.ReminderType);
        setReminderDate(
          ResponseData.ReminderDate === null ? "" : ResponseData.ReminderDate
        );
        setReminderTime(ResponseData.ReminderTime);
        setReminderNotification(
          ResponseData.ReminderUserIds.map((reminderUserId: number) =>
            assigneeWorklogsDropdownData.find(
              (assignee: { value: number }) => assignee.value === reminderUserId
            )
          ).filter(Boolean)
        );
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSubmitReminderWorklogs = async () => {
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

    const fieldValidations = {
      reminderTime: reminderSwitch && validateField(reminderTime),
      reminderNotification:
        reminderSwitch && validateField(reminderNotification),
      reminderDate:
        reminderSwitch &&
        reminderCheckboxValue === 2 &&
        validateField(reminderDate),
    };

    reminderSwitch && setReminderTimeErr(fieldValidations.reminderTime);
    reminderSwitch &&
      setReminderNotificationErr(fieldValidations.reminderNotification);
    reminderSwitch &&
      reminderCheckboxValue === 2 &&
      setReminderDateErr(fieldValidations.reminderDate);

    const hasErrors = Object.values(fieldValidations).some((error) => error);

    if (hasPermissionWorklog("Reminder", "save", "WorkLogs")) {
      if (!hasErrors) {
        setIsLoadingWorklogs(true);
        const params = {
          ReminderId: reminderId,
          ReminderType: reminderCheckboxValue,
          WorkitemId: onEdit,
          ReminderDate:
            reminderCheckboxValue === 2
              ? dayjs(reminderDate).format("YYYY/MM/DD")
              : null,
          ReminderTime: reminderTime,
          ReminderUserIds: reminderNotification.map((i: LabelValue) => i.value),
        };
        const url = `${process.env.worklog_api_url}/workitem/reminder/savebyworkitem`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Reminder Updated successfully.`);
            getReminderDataWorklogs();
            setReminderId(0);
            setIsLoadingWorklogs(false);
          }
          setIsLoadingWorklogs(false);
        };
        callAPI(url, params, successCallback, "POST");
      }
    } else {
      toast.error("User don't have permission to Update Recurring.");
      getRecurringDataWorklogs();
    }
  };

  // CheclkList
  const [checkListWorklogsDrawer, setCheckListWorklogsDrawer] = useState(true);
  const [checkListNameWorklogs, setCheckListNameWorklogs] = useState("");
  const [checkListNameWorklogsError, setCheckListNameWorklogsError] =
    useState(false);
  const [checkListDataWorklogs, setCheckListDataWorklogs] = useState([]);
  const [itemStatesWorklogs, setItemStatesWorklogs] = useState<any>({});

  const toggleGeneralOpen = (index: number) => {
    setItemStatesWorklogs((prevStates: any) => ({
      ...prevStates,
      [index]: !prevStates[index],
    }));
  };

  const toggleAddChecklistField = (index: number) => {
    setItemStatesWorklogs((prevStates: any) => ({
      ...prevStates,
      [`addChecklistField_${index}`]: !prevStates[`addChecklistField_${index}`],
    }));
  };

  const handleSaveCheckListNameWorklogs = async (
    Category: any,
    index: number
  ) => {
    if (hasPermissionWorklog("CheckList", "save", "WorkLogs")) {
      setCheckListNameWorklogsError(
        checkListNameWorklogs.trim().length < 5 ||
          checkListNameWorklogs.trim().length > 500
      );

      if (
        !checkListNameWorklogsError &&
        checkListNameWorklogs.trim().length > 4 &&
        checkListNameWorklogs.trim().length < 500
      ) {
        setIsLoadingWorklogs(true);
        const params = {
          workItemId: onEdit,
          category: Category,
          title: checkListNameWorklogs,
          isCheck: true,
        };
        const url = `${process.env.worklog_api_url}/workitem/checklist/createbyworkitem`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Checklist created successfully.`);
            setCheckListNameWorklogs("");
            getCheckListDataWorklogs();
            toggleAddChecklistField(index);
            setIsLoadingWorklogs(false);
          }
          setIsLoadingWorklogs(false);
        };
        callAPI(url, params, successCallback, "POST");
      }
    } else {
      toast.error("User don't have permission to Add Checklist.");
      getCheckListDataWorklogs();
    }
  };

  const getCheckListDataWorklogs = async () => {
    const params = {
      WorkitemId: onEdit,
    };
    const url = `${process.env.worklog_api_url}/workitem/checklist/getbyworkitem`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (
        ResponseStatus === "Success" &&
        ResponseData !== null &&
        ResponseData.length >= 0 &&
        error === false
      ) {
        setCheckListDataWorklogs(ResponseData);
      } else {
        setCheckListDataWorklogs([]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleChangeChecklistWorklogs = async (
    Category: any,
    IsCheck: any,
    Title: any
  ) => {
    if (hasPermissionWorklog("CheckList", "save", "WorkLogs")) {
      const params = {
        workItemId: onEdit,
        category: Category,
        title: Title,
        isCheck: IsCheck,
      };
      setIsLoadingWorklogs(true);
      const url = `${process.env.worklog_api_url}/workitem/checklist/savebyworkitem`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success(`CheckList Updated successfully.`);
          getCheckListDataWorklogs();
          setIsLoadingWorklogs(false);
        }
        setIsLoadingWorklogs(false);
      };
      callAPI(url, params, successCallback, "POST");
    } else {
      toast.error("User don't have permission to Add Checklist.");
      getCheckListDataWorklogs();
    }
  };

  // Comments
  const [commentsWorklogsDrawer, setCommentsWorklogsDrawer] = useState(true);
  const [commentSelectWorklogs, setCommentSelectWorklogs] = useState<number>(1);
  const [commentDataWorklogs, setCommentDataWorklogs] = useState<
    CommentGetByWorkitem[] | []
  >([]);
  const [valueWorklogs, setValueWorklogs] = useState("");
  const [valueWorklogsError, setValueWorklogsError] = useState(false);
  const [fileHasError, setFileHasError] = useState(false);
  const [valueEditWorklogs, setValueEditWorklogs] = useState("");
  const [valueEditWorklogsError, setValueEditWorklogsError] = useState(false);
  const [fileEditHasError, setFileEditHasError] = useState(false);
  const [mentionWorklogs, setMentionWorklogs] = useState<any>([]);
  const [editingCommentIndexWorklogs, setEditingCommentIndexWorklogs] =
    useState(-1);
  const [commentAttachmentWorklogs, setCommentAttachmentWorklogs] = useState<
    CommentAttachment[]
  >([
    {
      AttachmentId: 0,
      UserFileName: "",
      SystemFileName: "",
      AttachmentPath: process.env.attachment || "",
    },
  ]);
  const [commentWorklogsUserData, setCommentWorklogsUserData] = useState([]);

  const usersWorklogs: { id: number; display: string }[] =
    commentWorklogsUserData?.length > 0
      ? commentWorklogsUserData.map((i: LabelValue) => ({
          id: i.value,
          display: i.label,
        }))
      : [];

  const handleEditClickWorklogs = (index: number, message: string) => {
    setEditingCommentIndexWorklogs(index);
    setValueEditWorklogs(message);
  };

  const handleSaveClickWorklogs = async (
    e: any,
    i: CommentGetByWorkitem,
    type: number
  ) => {
    e.preventDefault();
    setValueEditWorklogsError(valueEditWorklogs.trim().length < 1);

    if (hasPermissionWorklog("Comment", "Save", "WorkLogs") || isDisabled) {
      if (
        valueEditWorklogs.trim().length >= 1 &&
        !valueEditWorklogsError &&
        !fileEditHasError
      ) {
        setIsLoadingWorklogs(true);
        const params = {
          workitemId: onEdit,
          CommentId: i.CommentId,
          Message: valueEditWorklogs,
          TaggedUsers: mentionWorklogs,
          Attachment:
            commentAttachmentWorklogs[0].SystemFileName.length > 0
              ? commentAttachmentWorklogs
              : null,
          type: type,
        };
        const url = `${process.env.worklog_api_url}/workitem/comment/saveByworkitem`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Comment updated successfully.`);
            setMentionWorklogs([]);
            setCommentAttachmentWorklogs([
              {
                AttachmentId: 0,
                UserFileName: "",
                SystemFileName: "",
                AttachmentPath: process.env.attachment || "",
              },
            ]);
            setValueEditWorklogsError(false);
            setValueEditWorklogs("");
            getCommentDataWorklogs(1);
            setEditingCommentIndexWorklogs(-1);
            setIsLoadingWorklogs(false);
          }
          setIsLoadingWorklogs(false);
        };
        callAPI(url, params, successCallback, "POST");
      }
    } else {
      toast.error("User don't have permission to Update Task.");
      setCommentSelectWorklogs(1);
      getCommentDataWorklogs(1);
    }
  };

  const handleCommentChangeWorklogs = (e: string) => {
    setMentionWorklogs(
      e
        .split("(")
        .map((i: string) => {
          if (i.includes(")")) {
            const parsedValue = parseInt(i.split(")")[0]);
            return isNaN(parsedValue) ? null : parsedValue;
          }
        })
        .filter((i: any) => i !== undefined && i !== null)
    );
    setValueWorklogsError(false);
  };

  const handleCommentAttachmentsChangeWorklogs = (
    data1: string,
    data2: string,
    commentAttachment: CommentAttachment[]
  ) => {
    const Attachment =
      data1 === null || data2 === null
        ? [
            {
              AttachmentId: 0,
              UserFileName: "",
              SystemFileName: "",
              AttachmentPath: process.env.attachment || "",
            },
          ]
        : [
            {
              AttachmentId: commentAttachment[0].AttachmentId,
              UserFileName: data1,
              SystemFileName: data2,
              AttachmentPath: process.env.attachment || "",
            },
          ];
    setCommentAttachmentWorklogs(Attachment);
  };

  const getCommentDataWorklogs = async (type: number) => {
    const params = {
      WorkitemId: onEdit,
      type: type,
    };
    const url = `${process.env.worklog_api_url}/workitem/comment/getByWorkitem`;
    const successCallback = (
      ResponseData: CommentGetByWorkitem[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (
        ResponseStatus === "Success" &&
        ResponseData !== null &&
        ResponseData.length >= 0 &&
        error === false
      ) {
        setCommentDataWorklogs(ResponseData);
      } else {
        setCommentDataWorklogs([]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSubmitCommentWorklogs = async (
    e: { preventDefault: () => void },
    type: number
  ) => {
    e.preventDefault();
    setValueWorklogsError(valueWorklogs.trim().length < 5);

    if (hasPermissionWorklog("Comment", "Save", "WorkLogs") || isDisabled) {
      if (
        valueWorklogs.trim().length >= 5 &&
        !valueWorklogsError &&
        !fileHasError
      ) {
        setIsLoadingWorklogs(true);
        const params = {
          workitemId: onEdit,
          CommentId: 0,
          Message: valueWorklogs,
          TaggedUsers: mentionWorklogs,
          Attachment:
            commentAttachmentWorklogs[0].SystemFileName.length > 0
              ? commentAttachmentWorklogs
              : null,
          type: type,
        };
        const url = `${process.env.worklog_api_url}/workitem/comment/saveByworkitem`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Comment sent successfully.`);
            setMentionWorklogs([]);
            setCommentAttachmentWorklogs([
              {
                AttachmentId: 0,
                UserFileName: "",
                SystemFileName: "",
                AttachmentPath: process.env.attachment || "",
              },
            ]);
            setValueEditWorklogsError(false);
            setValueEditWorklogs("");
            setValueWorklogs("");
            getCommentDataWorklogs(commentSelectWorklogs);
            setIsLoadingWorklogs(false);
          }
          setIsLoadingWorklogs(false);
        };
        callAPI(url, params, successCallback, "POST");
      }
    } else {
      toast.error("User don't have permission to Update Task.");
      setCommentSelectWorklogs(1);
      getCommentDataWorklogs(1);
    }
  };

  // Error Logs
  const [cCDropdownDataWorklogs, setCCDropdownDataWorklogs] = useState<any>([]);
  const [reviewerErrWorklogsDrawer, setReviewerErrWorklogsDrawer] =
    useState(true);
  const [errorLogWorklogsDrawer, setErorLogWorklogsDrawer] = useState(true);
  const [errorLogFieldsWorklogs, setErrorLogFieldsWorklogs] = useState<
    ErrorlogGetByWorkitem[]
  >([
    {
      SubmitedBy: "",
      SubmitedOn: "",
      ErrorLogId: 0,
      ErrorType: 0,
      RootCause: 0,
      Impact: 0,
      Priority: 0,
      ErrorCount: 0,
      NatureOfError: 0,
      DocumentNumber: "",
      VendorName: "",
      RootCauseAnalysis: "",
      MitigationPlan: "",
      ContigencyPlan: "",
      CC: [],
      Remark: "",
      Attachments: [
        {
          AttachmentId: 0,
          UserFileName: "",
          SystemFileName: "",
          AttachmentPath: "",
        },
      ],
      Amount: 0,
      DateOfTransaction: "",
      ErrorIdentificationDate: "",
      ResolutionStatus: 0,
      IdentifiedBy: "",
      isSolved: false,
      DisableErrorLog: false,
      IsHasErrorlogAddedByClient: false,
    },
  ]);
  const [errorTypeWorklogsErr, setErrorTypeWorklogsErr] = useState([false]);
  const [rootCauseWorklogsErr, setRootCauseWorklogsErr] = useState([false]);
  const [impactWorklogsErr, setImpactWorklogsErr] = useState([false]);
  const [errorLogPriorityWorklogsErr, setErrorLogPriorityWorklogsErr] =
    useState([false]);
  const [errorCountWorklogsErr, setErrorCountWorklogsErr] = useState([false]);
  const [natureOfWorklogsErr, setNatureOfWorklogsErr] = useState([false]);
  const [documentNumberErrWorklogs, setDocumentNumberErrWorklogs] = useState([
    false,
  ]);
  const [vendorNameErrWorklogs, setVendorNameErrWorklogs] = useState([false]);
  const [rcaErrWorklogs, setRcaErrWorklogs] = useState([false]);
  const [recordedDateErrWorklogs, setRecordedDateErrWorklogs] = useState([
    false,
  ]);
  const [mitigationErrWorklogs, setMitigationErrWorklogs] = useState([false]);
  const [contigencyPlanErrWorklogs, setContigencyPlanErrWorklogs] = useState([
    false,
  ]);
  const [remarkErrWorklogs, setRemarkErrWorklogs] = useState([false]);
  const [imageErrWorklogs, setImageErrWorklogs] = useState([false]);
  const [errorIdentificationErrWorklogs, setErrorIdentificationErrWorklogs] =
    useState([false]);
  const [resolutionStatusErrWorklogs, setResolutionStatusErrWorklogs] =
    useState([false]);
  const [identifiedByErrWorklogs, setIdentifiedByErrWorklogs] = useState([
    false,
  ]);
  const [deletedErrorLogWorklogs, setDeletedErrorLogWorklogs] = useState<any>(
    []
  );
  const [natureOfErrorDropdown, setNatureOfErrorDropdown] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const data = await getNatureOfErrorDropdownData();
      data.length > 0 && setNatureOfErrorDropdown(data);
    };

    onOpen && getData();
  }, [onOpen]);

  const addErrorLogFieldWorklogs = () => {
    setErrorLogFieldsWorklogs([
      ...errorLogFieldsWorklogs,
      {
        SubmitedBy: "",
        SubmitedOn: "",
        ErrorLogId: 0,
        ErrorType: 0,
        RootCause: 0,
        Impact: 0,
        Priority: 0,
        ErrorCount: 0,
        NatureOfError: 0,
        CC: [],
        DocumentNumber: "",
        VendorName: "",
        RootCauseAnalysis: "",
        MitigationPlan: "",
        ContigencyPlan: "",
        Remark: "",
        Attachments: [
          {
            AttachmentId: 0,
            UserFileName: "",
            SystemFileName: "",
            AttachmentPath: process.env.attachment || "",
          },
        ],
        Amount: 0,
        DateOfTransaction: "",
        ErrorIdentificationDate: "",
        ResolutionStatus: 0,
        IdentifiedBy: "",
        isSolved: false,
        DisableErrorLog: false,
      },
    ]);
    setErrorTypeWorklogsErr([...errorTypeWorklogsErr, false]);
    setRootCauseWorklogsErr([...rootCauseWorklogsErr, false]);
    setImpactWorklogsErr([...impactWorklogsErr, false]);
    setErrorLogPriorityWorklogsErr([...errorLogPriorityWorklogsErr, false]);
    setErrorCountWorklogsErr([...errorCountWorklogsErr, false]);
    setNatureOfWorklogsErr([...natureOfWorklogsErr, false]);
    setDocumentNumberErrWorklogs([...documentNumberErrWorklogs, false]);
    setVendorNameErrWorklogs([...vendorNameErrWorklogs, false]);
    setRcaErrWorklogs([...rcaErrWorklogs, false]);
    setRecordedDateErrWorklogs([...recordedDateErrWorklogs, false]);
    setMitigationErrWorklogs([...mitigationErrWorklogs, false]);
    setContigencyPlanErrWorklogs([...contigencyPlanErrWorklogs, false]);
    setRemarkErrWorklogs([...remarkErrWorklogs, false]);
    setImageErrWorklogs([...imageErrWorklogs, false]);
    setErrorIdentificationErrWorklogs([
      ...errorIdentificationErrWorklogs,
      false,
    ]);
    setResolutionStatusErrWorklogs([...resolutionStatusErrWorklogs, false]);
    setIdentifiedByErrWorklogs([...identifiedByErrWorklogs, false]);
  };

  const removeErrorLogFieldWorklogs = (index: number) => {
    setDeletedErrorLogWorklogs(
      errorLogFieldsWorklogs[index].ErrorLogId !== 0
        ? [...deletedErrorLogWorklogs, errorLogFieldsWorklogs[index].ErrorLogId]
        : [...deletedErrorLogWorklogs]
    );

    const newErrorLogFields = [...errorLogFieldsWorklogs];
    newErrorLogFields.splice(index, 1);
    setErrorLogFieldsWorklogs(newErrorLogFields);

    const newErrorTypeErrors = [...errorTypeWorklogsErr];
    newErrorTypeErrors.splice(index, 1);
    setErrorTypeWorklogsErr(newErrorTypeErrors);

    const newRootCauseErrors = [...rootCauseWorklogsErr];
    newRootCauseErrors.splice(index, 1);
    setRootCauseWorklogsErr(newRootCauseErrors);

    const newImpactErrors = [...impactWorklogsErr];
    newImpactErrors.splice(index, 1);
    setImpactWorklogsErr(newImpactErrors);

    const newPriorityErrors = [...errorLogPriorityWorklogsErr];
    newPriorityErrors.splice(index, 1);
    setErrorLogPriorityWorklogsErr(newPriorityErrors);

    const newErrorCountErrors = [...errorCountWorklogsErr];
    newErrorCountErrors.splice(index, 1);
    setErrorCountWorklogsErr(newErrorCountErrors);

    const newNatureOfErrErrors = [...natureOfWorklogsErr];
    newNatureOfErrErrors.splice(index, 1);
    setNatureOfWorklogsErr(newNatureOfErrErrors);

    const newDocumentNumberErrors = [...documentNumberErrWorklogs];
    newDocumentNumberErrors.splice(index, 1);
    setDocumentNumberErrWorklogs(newDocumentNumberErrors);

    const newVendorNameErrors = [...vendorNameErrWorklogs];
    newVendorNameErrors.splice(index, 1);
    setVendorNameErrWorklogs(newVendorNameErrors);

    const newRcaErrors = [...rcaErrWorklogs];
    newRcaErrors.splice(index, 1);
    setRcaErrWorklogs(newRcaErrors);

    const newRecordedDateErrors = [...recordedDateErrWorklogs];
    newRecordedDateErrors.splice(index, 1);
    setRecordedDateErrWorklogs(newRecordedDateErrors);

    const newMitigationErrors = [...mitigationErrWorklogs];
    newMitigationErrors.splice(index, 1);
    setMitigationErrWorklogs(newMitigationErrors);

    const newContigencyPlanErrors = [...contigencyPlanErrWorklogs];
    newContigencyPlanErrors.splice(index, 1);
    setContigencyPlanErrWorklogs(newContigencyPlanErrors);

    const newRemarkErrors = [...remarkErrWorklogs];
    newRemarkErrors.splice(index, 1);
    setRemarkErrWorklogs(newRemarkErrors);

    const newImageErrors = [...imageErrWorklogs];
    newImageErrors.splice(index, 1);
    setImageErrWorklogs(newImageErrors);

    const newErrorIdentificationErrors = [...errorIdentificationErrWorklogs];
    newErrorIdentificationErrors.splice(index, 1);
    setErrorIdentificationErrWorklogs(newErrorIdentificationErrors);

    const newResolutionStatusErrors = [...resolutionStatusErrWorklogs];
    newResolutionStatusErrors.splice(index, 1);
    setResolutionStatusErrWorklogs(newResolutionStatusErrors);

    const newIdentifiedByErrors = [...identifiedByErrWorklogs];
    newIdentifiedByErrors.splice(index, 1);
    setIdentifiedByErrWorklogs(newIdentifiedByErrors);
  };

  const handleErrorTypeChangeWorklogs = (e: number, index: number) => {
    const newFields = [...errorLogFieldsWorklogs];
    newFields[index].ErrorType = e;
    setErrorLogFieldsWorklogs(newFields);

    const newErrors = [...errorTypeWorklogsErr];
    newErrors[index] = e === 0;
    setErrorTypeWorklogsErr(newErrors);
  };

  const handleRootCauseChangeWorklogs = (e: number, index: number) => {
    const newFieldsWorklogs = [...errorLogFieldsWorklogs];
    newFieldsWorklogs[index].RootCause = e;
    setErrorLogFieldsWorklogs(newFieldsWorklogs);

    const newErrorsWorklogs = [...rootCauseWorklogsErr];
    newErrorsWorklogs[index] = e === 0;
    setRootCauseWorklogsErr(newErrorsWorklogs);
  };

  const handleImpactChangeWorklogs = (e: number, index: number) => {
    const newFieldsWorklogs = [...errorLogFieldsWorklogs];
    newFieldsWorklogs[index].Impact = e;
    setErrorLogFieldsWorklogs(newFieldsWorklogs);

    const newErrorsWorklogs = [...impactWorklogsErr];
    newErrorsWorklogs[index] = e === 0;
    setImpactWorklogsErr(newErrorsWorklogs);
  };

  const handleNatureOfErrorChangeWorklogs = (e: number, index: number) => {
    const newFieldsWorklogs = [...errorLogFieldsWorklogs];
    newFieldsWorklogs[index].NatureOfError = e;
    setErrorLogFieldsWorklogs(newFieldsWorklogs);

    const newErrorsWorklogs = [...natureOfWorklogsErr];
    newErrorsWorklogs[index] = e === 0;
    setNatureOfWorklogsErr(newErrorsWorklogs);
  };

  const handlePriorityChangeWorklogs = (e: number, index: number) => {
    const newFieldsWorklogs = [...errorLogFieldsWorklogs];
    newFieldsWorklogs[index].Priority = e;
    setErrorLogFieldsWorklogs(newFieldsWorklogs);

    const newErrorsWorklogs = [...errorLogPriorityWorklogsErr];
    newErrorsWorklogs[index] = e === 0;
    setErrorLogPriorityWorklogsErr(newErrorsWorklogs);
  };

  const handleErrorCountChangeWorklogs = (e: string, index: number) => {
    const newFieldsWorklogs = [...errorLogFieldsWorklogs];
    newFieldsWorklogs[index].ErrorCount = Number(e) || 0;
    setErrorLogFieldsWorklogs(newFieldsWorklogs);

    const newErrorsWorklogs = [...errorCountWorklogsErr];
    newErrorsWorklogs[index] = Number(e) < 0 || e.toString().length > 4;
    setErrorCountWorklogsErr(newErrorsWorklogs);
  };

  const handleCCChangeWorklogs = (
    newValue: LabelValueProfileImage[] | [],
    index: number
  ) => {
    const newFieldsWorklogs = [...errorLogFieldsWorklogs];
    newFieldsWorklogs[index].CC = newValue;
    setErrorLogFieldsWorklogs(newFieldsWorklogs);
  };

  const handleDocumentNumberChangeWorklogs = (e: string, index: number) => {
    const newFields = [...errorLogFieldsWorklogs];
    newFields[index].DocumentNumber = e;
    setErrorLogFieldsWorklogs(newFields);

    const newErrors = [...documentNumberErrWorklogs];
    newErrors[index] = e.trim().length > 50;
    setDocumentNumberErrWorklogs(newErrors);
  };

  const handleVendorNameChangeWorklogs = (e: string, index: number) => {
    const newFields = [...errorLogFieldsWorklogs];
    newFields[index].VendorName = e;
    setErrorLogFieldsWorklogs(newFields);

    const newErrors = [...vendorNameErrWorklogs];
    newErrors[index] = e.trim().length > 250;
    setVendorNameErrWorklogs(newErrors);
  };

  const handleRcaChangeWorklogs = (e: string, index: number) => {
    const newFields = [...errorLogFieldsWorklogs];
    newFields[index].RootCauseAnalysis = e;
    setErrorLogFieldsWorklogs(newFields);

    const newErrors = [...rcaErrWorklogs];
    newErrors[index] = e.trim().length <= 0 || e.trim().length > 250;
    setRcaErrWorklogs(newErrors);
  };

  const handleMitigationChangeWorklogs = (e: string, index: number) => {
    const newFields = [...errorLogFieldsWorklogs];
    newFields[index].MitigationPlan = e;
    setErrorLogFieldsWorklogs(newFields);

    const newErrors = [...mitigationErrWorklogs];
    newErrors[index] = e.trim().length > 250;
    setMitigationErrWorklogs(newErrors);
  };

  const handleContigencyPlanChangeWorklogs = (e: string, index: number) => {
    const newFields = [...errorLogFieldsWorklogs];
    newFields[index].ContigencyPlan = e;
    setErrorLogFieldsWorklogs(newFields);

    const newErrors = [...contigencyPlanErrWorklogs];
    newErrors[index] = e.trim().length > 250;
    setContigencyPlanErrWorklogs(newErrors);
  };

  const handleRemarksChangeWorklogs = (e: string, index: number) => {
    const newFields = [...errorLogFieldsWorklogs];
    newFields[index].Remark = e;
    setErrorLogFieldsWorklogs(newFields);

    const newErrors = [...remarkErrWorklogs];
    newErrors[index] = e.trim().length <= 0;
    setRemarkErrWorklogs(newErrors);
  };

  const handleAmountChangeWorklogs = (e: string, index: number) => {
    const newFieldsWorklogs = [...errorLogFieldsWorklogs];
    newFieldsWorklogs[index].Amount = Number(e) || 0;
    setErrorLogFieldsWorklogs(newFieldsWorklogs);
  };

  const handleDateOfTransactionChange = (e: any, index: number) => {
    const newFieldsWorklogs = [...errorLogFieldsWorklogs];
    newFieldsWorklogs[index].DateOfTransaction = e;
    setErrorLogFieldsWorklogs(newFieldsWorklogs);

    const newErrors = [...recordedDateErrWorklogs];
    newErrors[index] = typeof e != "object";
    setRecordedDateErrWorklogs(newErrors);
  };

  const handleErrorIdentificationDateChange = (e: any, index: number) => {
    const newFields = [...errorLogFieldsWorklogs];
    newFields[index].ErrorIdentificationDate = e;
    setErrorLogFieldsWorklogs(newFields);

    const newErrors = [...errorIdentificationErrWorklogs];
    newErrors[index] = typeof e != "object";
    setErrorIdentificationErrWorklogs(newErrors);
  };

  const handleResolutionStatusChange = (e: number, index: number) => {
    const newFields = [...errorLogFieldsWorklogs];
    newFields[index].ResolutionStatus = e;
    setErrorLogFieldsWorklogs(newFields);

    const newErrors = [...resolutionStatusErrWorklogs];
    newErrors[index] = e === 0;
    setResolutionStatusErrWorklogs(newErrors);
  };

  const handleIdentifiedByChange = (
    e: string,
    index: number,
    ErrorType: number
  ) => {
    const newFields = [...errorLogFieldsWorklogs];
    newFields[index].IdentifiedBy = e;
    setErrorLogFieldsWorklogs(newFields);

    const newErrors = [...identifiedByErrWorklogs];
    newErrors[index] =
      ErrorType > 0 ? false : e.trim().length <= 0 || e.trim().length > 50;
    setIdentifiedByErrWorklogs(newErrors);
  };

  const handleAttachmentsChangeWorklogs = (
    data1: string,
    data2: string,
    Attachments: CommentAttachment[],
    index: number
  ) => {
    const newFields = [...errorLogFieldsWorklogs];
    newFields[index].Attachments =
      data1 === null || data2 === null
        ? [
            {
              AttachmentId: 0,
              UserFileName: "",
              SystemFileName: "",
              AttachmentPath: process.env.attachment || "",
            },
          ]
        : [
            {
              AttachmentId: Attachments[0].AttachmentId,
              UserFileName: data1,
              SystemFileName: data2,
              AttachmentPath: process.env.attachment || "",
            },
          ];
    setErrorLogFieldsWorklogs(newFields);
  };

  const getErrorLogDataWorklogs = async () => {
    const params = {
      WorkitemId: onEdit,
    };
    const url = `${process.env.worklog_api_url}/workitem/errorlog/getByWorkitem`;
    const successCallback = (
      ResponseData: ErrorlogGetByWorkitem[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (
        ResponseStatus === "Success" &&
        ResponseData !== null &&
        ResponseData.length > 0 &&
        error === false
      ) {
        setErrorLogFieldsWorklogs(
          ResponseData.map((i: ErrorlogGetByWorkitem) => ({
            SubmitedBy: i.SubmitedBy,
            SubmitedOn: i.SubmitedOn,
            ErrorLogId: i.ErrorLogId,
            ErrorType: i.ErrorType,
            RootCause: i.RootCause,
            Impact: i.Impact,
            Priority: i.Priority,
            ErrorCount: i.ErrorCount,
            NatureOfError: i.NatureOfError,
            CC: i.CC.map((cc: number) =>
              cCDropdownDataWorklogs.find(
                (j: { value: number }) => j.value === cc
              )
            ).filter(Boolean),
            DocumentNumber: !!i.DocumentNumber ? i.DocumentNumber : "",
            VendorName: !!i.VendorName ? i.VendorName : "",
            RootCauseAnalysis: i.RootCauseAnalysis ? i.RootCauseAnalysis : "",
            MitigationPlan: !!i.MitigationPlan ? i.MitigationPlan : "",
            ContigencyPlan: !!i.ContigencyPlan ? i.ContigencyPlan : "",
            Remark: i.Remark,
            Attachments: i.Attachment?.length
              ? i.Attachment
              : [
                  {
                    AttachmentId: 0,
                    UserFileName: "",
                    SystemFileName: "",
                    AttachmentPath: process.env.attachment || "",
                  },
                ],
            Amount: i.Amount === null ? 0 : i.Amount,
            DateOfTransaction:
              i.DateOfTransaction === null ? "" : i.DateOfTransaction,
            ErrorIdentificationDate:
              i.ErrorIdentificationDate === null
                ? ""
                : i.ErrorIdentificationDate,
            ResolutionStatus:
              i.ResolutionStatus === null ? 0 : i.ResolutionStatus,
            IdentifiedBy: i.IdentifiedBy === null ? "" : i.IdentifiedBy,
            isSolved: i.IsSolved,
            DisableErrorLog: i.DisableErrorLog,
            IsHasErrorlogAddedByClient: i.IsHasErrorlogAddedByClient,
          }))
        );
      } else {
        setErrorLogFieldsWorklogs([
          {
            SubmitedBy: "",
            SubmitedOn: "",
            ErrorLogId: 0,
            ErrorType: 0,
            RootCause: 0,
            Impact: 0,
            Priority: 0,
            ErrorCount: 0,
            NatureOfError: 0,
            CC: [],
            DocumentNumber: "",
            VendorName: "",
            RootCauseAnalysis: "",
            MitigationPlan: "",
            ContigencyPlan: "",
            Remark: "",
            Attachments: [
              {
                AttachmentId: 0,
                UserFileName: "",
                SystemFileName: "",
                AttachmentPath: "",
              },
            ],
            Amount: 0,
            DateOfTransaction: "",
            ErrorIdentificationDate: "",
            ResolutionStatus: 0,
            IdentifiedBy: "",
            isSolved: false,
            DisableErrorLog: false,
            IsHasErrorlogAddedByClient: false,
          },
        ]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleCheckboxChange = async (
    onEdit: number,
    errorLogId: number,
    checked: boolean,
    index: number
  ) => {
    if (
      !!editDataWorklogs &&
      editDataWorklogs.AssignedId != Number(localStorage.getItem("UserId"))
    ) {
      toast.warning("Only assignee can solve errorlog.");
    } else {
      let hasErrorLogErrors = false;
      const newErrorTypeWorklogsErrors = errorLogFieldsWorklogs.map(
        (field, i) => field.ErrorType === 0 && i === index
      );
      setErrorTypeWorklogsErr(newErrorTypeWorklogsErrors);
      const newRootCauseWorklogsErrors = errorLogFieldsWorklogs.map(
        (field, i) => field.RootCause === 0 && i === index
      );
      setRootCauseWorklogsErr(newRootCauseWorklogsErrors);
      const newImpactWorklogsErrors = errorLogFieldsWorklogs.map(
        (field, i) => field.Impact === 0 && i === index
      );
      setImpactWorklogsErr(newImpactWorklogsErrors);
      const newNatureOfWorklogsErrors = errorLogFieldsWorklogs.map(
        (field, i) => field.NatureOfError === 0 && i === index
      );
      setNatureOfWorklogsErr(newNatureOfWorklogsErrors);
      const newPriorityErrors = errorLogFieldsWorklogs.map(
        (field, i) => field.Priority === 0 && i === index
      );
      setErrorLogPriorityWorklogsErr(newPriorityErrors);
      const newDocumentNumberErrors = errorLogFieldsWorklogs.map(
        (field) => field.DocumentNumber.trim().length > 50
      );
      setDocumentNumberErrWorklogs(newDocumentNumberErrors);
      const newVendorNameErrors = errorLogFieldsWorklogs.map(
        (field) => field.VendorName.trim().length > 250
      );
      setVendorNameErrWorklogs(newVendorNameErrors);
      const newRcaErrors = errorLogFieldsWorklogs.map(
        (field) =>
          field.RootCauseAnalysis.trim().length <= 0 ||
          field.RootCauseAnalysis.trim().length > 250
      );
      setRcaErrWorklogs(newRcaErrors);
      const newErrorIdentificationDateErrors = errorLogFieldsWorklogs.map(
        (field) =>
          field.ErrorIdentificationDate === null ||
          field.ErrorIdentificationDate?.toString().trim().length <= 0
      );
      setErrorIdentificationErrWorklogs(newErrorIdentificationDateErrors);
      const newResolutionStatusErrors = errorLogFieldsWorklogs.map(
        (field) => field.ResolutionStatus === 0
      );
      setResolutionStatusErrWorklogs(newResolutionStatusErrors);
      const newIdentifiedByErrors = errorLogFieldsWorklogs.map(
        (field) =>
          field.ErrorType === 2 &&
          field.IdentifiedBy !== null &&
          (field.IdentifiedBy.trim().length <= 0 ||
            field.IdentifiedBy.trim().length > 50)
      );
      setIdentifiedByErrWorklogs(newIdentifiedByErrors);
      const newRecordedDateErrors = errorLogFieldsWorklogs.map(
        (field) =>
          field.DateOfTransaction === null ||
          field.DateOfTransaction.toString().trim().length <= 0
      );
      setRecordedDateErrWorklogs(newRecordedDateErrors);
      const newMitigationErrors = errorLogFieldsWorklogs.map(
        (field) => field.MitigationPlan.trim().length > 250
      );
      setMitigationErrWorklogs(newMitigationErrors);
      const newContigencyPlanErrors = errorLogFieldsWorklogs.map(
        (field) => field.ContigencyPlan.trim().length > 250
      );
      setContigencyPlanErrWorklogs(newContigencyPlanErrors);
      const newErrorCountWorklogsErrors = errorLogFieldsWorklogs.map(
        (field, i) =>
          (field.ErrorCount <= 0 || field.ErrorCount > 9999) && i === index
      );
      setErrorCountWorklogsErr(newErrorCountWorklogsErrors);

      hasErrorLogErrors =
        newErrorTypeWorklogsErrors.some((error) => error) ||
        newRootCauseWorklogsErrors.some((error) => error) ||
        newImpactWorklogsErrors.some((error) => error) ||
        newNatureOfWorklogsErrors.some((error) => error) ||
        newPriorityErrors.some((error) => error) ||
        newDocumentNumberErrors.some((error) => error) ||
        newVendorNameErrors.some((error) => error) ||
        newRcaErrors.some((error) => error) ||
        newErrorIdentificationDateErrors.some((error) => error) ||
        newResolutionStatusErrors.some((error) => error) ||
        newIdentifiedByErrors.some((error) => error) ||
        newRecordedDateErrors.some((error) => error) ||
        newMitigationErrors.some((error) => error) ||
        newContigencyPlanErrors.some((error) => error) ||
        newErrorCountWorklogsErrors.some((error) => error);

      if (hasPermissionWorklog("ErrorLog", "Save", "WorkLogs")) {
        if (hasErrorLogErrors === false) {
          setIsLoadingWorklogs(true);
          const params = {
            WorkItemId: onEdit,
            Errors: errorLogFieldsWorklogs.map(
              (i: ErrorlogGetByWorkitem) =>
                new Object({
                  ErrorLogId: i.ErrorLogId,
                  ErrorType: i.ErrorType,
                  RootCause: i.RootCause,
                  Impact: i.Impact,
                  Priority: i.Priority,
                  ErrorCount: i.ErrorCount,
                  NatureOfError: i.NatureOfError,
                  CC: i.CC.map((j: LabelValueProfileImage) => j.value),
                  DocumentNumber: !!i.DocumentNumber ? i.DocumentNumber : null,
                  VendorName: !!i.VendorName ? i.VendorName : null,
                  RootCauseAnalysis: !!i.RootCauseAnalysis
                    ? i.RootCauseAnalysis
                    : null,
                  MitigationPlan: !!i.MitigationPlan ? i.MitigationPlan : null,
                  ContigencyPlan: !!i.ContigencyPlan ? i.ContigencyPlan : null,
                  Remark: i.Remark,
                  Attachments:
                    i.Attachments?.[0]?.UserFileName?.length ?? 0 > 0
                      ? i.Attachments
                      : null,
                  Amount: i.Amount === 0 ? null : i.Amount,
                  DateOfTransaction:
                    i.DateOfTransaction === ""
                      ? null
                      : dayjs(i.DateOfTransaction).format("YYYY/MM/DD"),
                  ErrorIdentificationDate:
                    i.ErrorIdentificationDate === ""
                      ? null
                      : dayjs(i.ErrorIdentificationDate).format("YYYY/MM/DD"),
                  ResolutionStatus: i.ResolutionStatus,
                  IdentifiedBy:
                    i.ErrorType === 2
                      ? i.IdentifiedBy?.toString().trim()
                      : null,
                })
            ),
            IsClientWorklog: 0,
            SubmissionId: null,
            DeletedErrorlogIds: [],
          };
          const url = `${process.env.worklog_api_url}/workitem/errorlog/saveByworkitem`;
          const successCallback = (
            ResponseData: null,
            error: boolean,
            ResponseStatus: string
          ) => {
            if (ResponseStatus === "Success" && error === false) {
              const params = {
                WorkItemId: onEdit,
                ErrorLogId: errorLogId,
                IsSolved: checked,
              };
              const url = `${process.env.worklog_api_url}/workitem/errorlog/SolveByworkitem`;
              const successCallback = (
                ResponseData: null,
                error: boolean,
                ResponseStatus: string
              ) => {
                if (ResponseStatus === "Success" && error === false) {
                  toast.success(
                    `${checked ? "Error log Resolved." : "Error log changed."}`
                  );
                  getErrorLogDataWorklogs();
                  onDataFetch?.();
                  setIsLoadingWorklogs(false);
                }
                setIsLoadingWorklogs(false);
              };
              callAPI(url, params, successCallback, "POST");
            }
            setIsLoadingWorklogs(false);
          };
          callAPI(url, params, successCallback, "POST");
        }
      } else {
        toast.error("User don't have permission to Update Task.");
        getErrorLogDataWorklogs();
      }
    }
  };

  const handleSubmitErrorLog = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    let hasErrorLogErrors = false;
    const newErrorTypeErrors = errorLogFieldsWorklogs.map(
      (field) => field.ErrorType === 0
    );
    setErrorTypeWorklogsErr(newErrorTypeErrors);
    const newRootCauseErrors = errorLogFieldsWorklogs.map(
      (field) => field.RootCause === 0
    );
    setRootCauseWorklogsErr(newRootCauseErrors);
    const newImpactErrors = errorLogFieldsWorklogs.map(
      (field) => field.Impact === 0
    );
    setImpactWorklogsErr(newImpactErrors);
    const newNatureOfErrors = errorLogFieldsWorklogs.map(
      (field) => field.NatureOfError === 0
    );
    setNatureOfWorklogsErr(newNatureOfErrors);
    const newPriorityErrors = errorLogFieldsWorklogs.map(
      (field) => field.Priority === 0
    );
    setErrorLogPriorityWorklogsErr(newPriorityErrors);
    const newErrorCountErrors = errorLogFieldsWorklogs.map(
      (field) => field.ErrorCount <= 0 || field.ErrorCount > 9999
    );
    setErrorCountWorklogsErr(newErrorCountErrors);
    const newDocumentNumberErrors = errorLogFieldsWorklogs.map(
      (field) => field.DocumentNumber.trim().length > 50
    );
    setDocumentNumberErrWorklogs(newDocumentNumberErrors);
    const newVendorNameErrors = errorLogFieldsWorklogs.map(
      (field) => field.VendorName.trim().length > 250
    );
    setVendorNameErrWorklogs(newVendorNameErrors);
    const newRcaErrors = errorLogFieldsWorklogs.map(
      (field) =>
        field.RootCauseAnalysis.trim().length <= 0 ||
        field.RootCauseAnalysis.trim().length > 250
    );
    setRcaErrWorklogs(newRcaErrors);
    const newErrorIdentificationDateErrors = errorLogFieldsWorklogs.map(
      (field) =>
        field.ErrorIdentificationDate === null ||
        field.ErrorIdentificationDate.toString().trim().length <= 0
    );
    setErrorIdentificationErrWorklogs(newErrorIdentificationDateErrors);
    const newResolutionStatusErrors = errorLogFieldsWorklogs.map(
      (field) => field.ResolutionStatus === 0
    );
    setResolutionStatusErrWorklogs(newResolutionStatusErrors);
    const newIdentifiedByErrors = errorLogFieldsWorklogs.map(
      (field) =>
        field.ErrorType === 2 &&
        field.IdentifiedBy !== null &&
        (field.IdentifiedBy.trim().length <= 0 ||
          field.IdentifiedBy.trim().length > 50)
    );
    setIdentifiedByErrWorklogs(newIdentifiedByErrors);
    const newRecordedDateErrors = errorLogFieldsWorklogs.map(
      (field) =>
        field.DateOfTransaction === null ||
        field.DateOfTransaction.toString().trim().length <= 0
    );
    setRecordedDateErrWorklogs(newRecordedDateErrors);
    const newMitigationErrors = errorLogFieldsWorklogs.map(
      (field) => field.MitigationPlan.trim().length > 250
    );
    setMitigationErrWorklogs(newMitigationErrors);
    const newContigencyPlanErrors = errorLogFieldsWorklogs.map(
      (field) => field.ContigencyPlan.trim().length > 250
    );
    setContigencyPlanErrWorklogs(newContigencyPlanErrors);
    // const newRemarkErrors = errorLogFieldsWorklogs.map(
    //   (field) =>
    //     field.Remark.trim().length < 5 || field.Remark.trim().length > 500
    // );
    // setRemarkErrWorklogs(newRemarkErrors);

    hasErrorLogErrors =
      newErrorTypeErrors.some((error) => error) ||
      newRootCauseErrors.some((error) => error) ||
      newImpactErrors.some((error) => error) ||
      newNatureOfErrors.some((error) => error) ||
      newPriorityErrors.some((error) => error) ||
      newErrorCountErrors.some((error) => error) ||
      newDocumentNumberErrors.some((error) => error) ||
      newVendorNameErrors.some((error) => error) ||
      newRcaErrors.some((error) => error) ||
      newErrorIdentificationDateErrors.some((error) => error) ||
      newResolutionStatusErrors.some((error) => error) ||
      newIdentifiedByErrors.some((error) => error) ||
      newRecordedDateErrors.some((error) => error) ||
      newMitigationErrors.some((error) => error) ||
      newContigencyPlanErrors.some((error) => error) ||
      // newRemarkErrors.some((error) => error) ||
      imageErrWorklogs.includes(true);

    if (hasPermissionWorklog("", "ErrorLog", "QA")) {
      if (hasErrorLogErrors === false) {
        setIsLoadingWorklogs(true);
        const params = {
          WorkItemId: onEdit,
          Errors: errorLogFieldsWorklogs.map(
            (i: ErrorlogGetByWorkitem) =>
              new Object({
                ErrorLogId: i.ErrorLogId,
                ErrorType: i.ErrorType,
                RootCause: i.RootCause,
                Impact: i.Impact,
                Priority: i.Priority,
                ErrorCount: i.ErrorCount,
                NatureOfError: i.NatureOfError,
                CC: i.CC.map((j: LabelValueProfileImage) => j.value),
                DocumentNumber: !!i.DocumentNumber ? i.DocumentNumber : null,
                VendorName: !!i.VendorName ? i.VendorName : null,
                RootCauseAnalysis: !!i.RootCauseAnalysis
                  ? i.RootCauseAnalysis
                  : null,
                MitigationPlan: !!i.MitigationPlan ? i.MitigationPlan : null,
                ContigencyPlan: !!i.ContigencyPlan ? i.ContigencyPlan : null,
                Remark: i.Remark,
                Attachments:
                  i.Attachments?.[0]?.SystemFileName?.length ?? 0 > 0
                    ? i.Attachments
                    : null,
                Amount: i.Amount === 0 ? null : i.Amount,
                DateOfTransaction:
                  i.DateOfTransaction === ""
                    ? null
                    : dayjs(i.DateOfTransaction).format("YYYY/MM/DD"),
                ErrorIdentificationDate:
                  i.ErrorIdentificationDate === ""
                    ? null
                    : dayjs(i.ErrorIdentificationDate).format("YYYY/MM/DD"),
                ResolutionStatus: i.ResolutionStatus,
                IdentifiedBy:
                  i.ErrorType === 2 ? i.IdentifiedBy?.toString().trim() : null,
              })
          ),
          IsClientWorklog: 2,
          SubmissionId: submissionId,
          DeletedErrorlogIds: deletedErrorLogWorklogs,
        };

        const url = `${process.env.worklog_api_url}/workitem/errorlog/saveByworkitem`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Error logged successfully.`);
            setDeletedErrorLogWorklogs([]);
            getEditDataWorklogs();
            getErrorLogDataWorklogs();
            onDataFetch?.();
            setIsLoadingWorklogs(false);
          }
          setIsLoadingWorklogs(false);
          setDeletedErrorLogWorklogs([]);
        };
        callAPI(url, params, successCallback, "POST");
      }
    } else {
      toast.error("User don't have permission to Update Task.");
      setDeletedErrorLogWorklogs([]);
      getErrorLogDataWorklogs();
    }
  };

  // Reviewer note
  const [reasonWorklogsDrawer, setReasonWorklogsDrawer] = useState(true);
  const [reviewerNoteWorklogs, setReviewerNoteDataWorklogs] = useState<
    GetReviewerNoteList[] | []
  >([]);

  const getReviewerNoteDataWorklogs = async () => {
    const params = {
      WorkitemId: onEdit,
    };
    const url = `${process.env.worklog_api_url}/workitem/approval/getreviewernotelist`;
    const successCallback = (
      ResponseData: GetReviewerNoteList[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (
        ResponseStatus === "Success" &&
        ResponseData !== null &&
        ResponseData.length >= 0 &&
        error === false
      ) {
        setReviewerNoteDataWorklogs(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  // Logs
  const [logsWorklogsDrawer, setLogsWorklogsDrawer] = useState(true);
  const [logsDataWorklogs, setLogsDateWorklogs] = useState<
    AuditlogGetByWorkitem[] | []
  >([]);

  const logsDatatableTaskCols = [
    {
      name: "Filed",
      label: "Filed Name",
      options: {
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "OldValue",
      label: "Old Value",
      options: {
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "NewValue",
      label: "New Value",
      options: {
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
  ];

  const getLogsDataWorklogs = async () => {
    const params = {
      WorkitemId: onEdit,
    };
    const url = `${process.env.report_api_url}/auditlog/getbyworkitem`;
    const successCallback = (
      ResponseData: { List: AuditlogGetByWorkitem[] | []; TotalCount: number },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (
        ResponseStatus === "Success" &&
        ResponseData !== null &&
        ResponseData.List.length >= 0 &&
        error === false
      ) {
        setLogsDateWorklogs(ResponseData.List);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

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

    const fieldValidations = {
      clientName: validateField(clientNameWorklogs),
      typeOfWork: validateField(typeOfWorkWorklogs),
      projectName: validateField(projectNameWorklogs),
      status: validateField(statusWorklogs),
      processName: validateField(processNameWorklogs),
      subProcess: validateField(subProcessWorklogs),
      clientTaskName: validateField(clientTaskNameWorklogs),
      descriptionWorklogs:
        departmentWorklogsType !== "WhitelabelTaxation" &&
        validateField(descriptionWorklogs),
      quantity: validateField(quantityWorklogs),
      receiverDate: validateField(receiverDateWorklogs),
      assignee: assigneeWorklogsDisable && validateField(assigneeWorklogs),
      reviewer: validateField(reviewerWorklogs),
      department: validateField(departmentWorklogs),
      manager: validateField(managerWorklogs),
      returnYear: typeOfWorkWorklogs === 3 && validateField(returnYearWorklogs),
      checklistWorkpaper:
        typeOfWorkWorklogs === 3 && validateField(checklistWorkpaperWorklogs),
      recurringStartDate: recurringSwitch && validateField(recurringStartDate),
      recurringEndDate: recurringSwitch && validateField(recurringEndDate),
      recurringMonth:
        recurringSwitch && recurringTime === 3 && validateField(recurringMonth),
      selectedDays:
        recurringSwitch && recurringTime === 2 && validateField(selectedDays),
      reminderTime: reminderSwitch && validateField(reminderTime),
      reminderNotification:
        reminderSwitch && validateField(reminderNotification),
      reminderDate:
        reminderSwitch &&
        reminderCheckboxValue === 2 &&
        validateField(reminderDate),
      missingInfoWorklogs:
        departmentWorklogsType === "WhitelabelTaxation" &&
        statusWorklogsType === "OnHoldFromClient" &&
        validateField(missingInfoWorklogs),
    };

    setClientNameWorklogsErr(fieldValidations.clientName);
    setTypeOfWorkWorklogsErr(fieldValidations.typeOfWork);
    setProjectNameWorklogsErr(fieldValidations.projectName);
    setStatusWorklogsErr(fieldValidations.status);
    setProcessNameWorklogsErr(fieldValidations.processName);
    setSubProcessWorklogsErr(fieldValidations.subProcess);
    setClientTaskNameWorklogsErr(fieldValidations.clientTaskName);
    departmentWorklogsType !== "WhitelabelTaxation" &&
      setDescriptionWorklogsErr(fieldValidations.descriptionWorklogs);
    setQuantityWorklogsErr(fieldValidations.quantity);
    setReceiverDateWorklogsErr(fieldValidations.receiverDate);
    assigneeWorklogsDisable &&
      setAssigneeWorklogsErr(fieldValidations.assignee);
    setReviewerWorklogsErr(fieldValidations.reviewer);
    setDepartmentWorklogsErr(fieldValidations.department);
    setManagerWorklogsErr(fieldValidations.manager);
    typeOfWorkWorklogs === 3 &&
      setReturnYearWorklogsErr(fieldValidations.returnYear);
    typeOfWorkWorklogs === 3 &&
      setChecklistWorkpaperWorklogsErr(fieldValidations.checklistWorkpaper);
    onEdit === 0 &&
      recurringSwitch &&
      setRecurringStartDateErr(fieldValidations.recurringStartDate);
    onEdit === 0 &&
      recurringSwitch &&
      setRecurringEndDateErr(fieldValidations.recurringEndDate);
    onEdit === 0 &&
      recurringSwitch &&
      recurringTime === 3 &&
      setRecurringMonthErr(fieldValidations.recurringMonth);
    onEdit === 0 &&
      recurringSwitch &&
      recurringTime === 2 &&
      setRecurringWeekErr(fieldValidations.selectedDays);
    onEdit === 0 &&
      reminderSwitch &&
      setReminderTimeErr(fieldValidations.reminderTime);
    onEdit === 0 &&
      reminderSwitch &&
      setReminderNotificationErr(fieldValidations.reminderNotification);
    onEdit === 0 &&
      reminderSwitch &&
      reminderCheckboxValue === 2 &&
      setReminderDateErr(fieldValidations.reminderDate);
    departmentWorklogsType === "WhitelabelTaxation" &&
      statusWorklogsType === "OnHoldFromClient" &&
      setMissingInfoWorklogsErr(fieldValidations.missingInfoWorklogs);

    setClientTaskNameWorklogsErr(
      clientTaskNameWorklogs.trim().length < 4 ||
        clientTaskNameWorklogs.trim().length > 100
    );
    setQuantityWorklogsErr(
      quantityWorklogs.toString().length <= 0 ||
        quantityWorklogs.toString().length > 4 ||
        quantityWorklogs <= 0 ||
        quantityWorklogs.toString().includes(".")
    );
    setQAQuantityWorklogsErr(
      qaQuantityWorklogs !== null &&
        (qaQuantityWorklogs.toString().length <= 0 ||
          qaQuantityWorklogs.toString().length > 4 ||
          qaQuantityWorklogs < 0 ||
          qaQuantityWorklogs.toString().includes("."))
    );

    const hasErrors = Object.values(fieldValidations).some((error) => error);

    const fieldValidationsEdit = {
      clientName: validateField(clientNameWorklogs),
      typeOfWork: validateField(typeOfWorkWorklogs),
      projectName: validateField(projectNameWorklogs),
      status: validateField(statusWorklogs),
      processName: validateField(processNameWorklogs),
      subProcess: validateField(subProcessWorklogs),
      clientTaskName: validateField(clientTaskNameWorklogs),
      descriptionWorklogs:
        departmentWorklogsType !== "WhitelabelTaxation" &&
        validateField(descriptionWorklogs),
      quantity: validateField(quantityWorklogs),
      receiverDate: validateField(receiverDateWorklogs),
      dueDate: validateField(dueDateWorklogs),
      assignee: validateField(assigneeWorklogs),
      reviewer: validateField(reviewerWorklogs),
      department: validateField(departmentWorklogs),
      manager: validateField(managerWorklogs),
      returnYear: typeOfWorkWorklogs === 3 && validateField(returnYearWorklogs),
      checklistWorkpaper:
        typeOfWorkWorklogs === 3 && validateField(checklistWorkpaperWorklogs),
      missingInfoWorklogs:
        departmentWorklogsType === "WhitelabelTaxation" &&
        statusWorklogsType === "OnHoldFromClient" &&
        validateField(missingInfoWorklogs),
    };
    const hasEditErrors = Object.values(fieldValidationsEdit).some(
      (error) => error
    );

    // Sub-Task
    let hasSubErrors = false;
    const newTaskErrors = subTaskFieldsWorklogs.map(
      (field) =>
        (onEdit === 0 &&
          subTaskSwitchWorklogs &&
          field.Title.trim().length < 5) ||
        (onEdit === 0 &&
          subTaskSwitchWorklogs &&
          field.Title.trim().length > 50)
    );
    subTaskSwitchWorklogs && setTaskNameWorklogsErr(newTaskErrors);
    const newSubTaskDescErrors = subTaskFieldsWorklogs.map(
      (field) =>
        (onEdit === 0 &&
          subTaskSwitchWorklogs &&
          field.Description.trim().length <= 0) ||
        (onEdit === 0 &&
          subTaskSwitchWorklogs &&
          field.Description.trim().length > 500)
    );
    subTaskSwitchWorklogs &&
      setSubTaskDescriptionWorklogsErr(newSubTaskDescErrors);
    hasSubErrors =
      newTaskErrors.some((error) => error) ||
      newSubTaskDescErrors.some((error) => error);

    // Maual
    let hasManualErrors = false;
    const newInputDateWorklogsErrors = manualFieldsWorklogs.map(
      (field) => onEdit === 0 && manualSwitchWorklogs && field.inputDate === ""
    );
    manualSwitchWorklogs &&
      setInputDateWorklogsErrors(newInputDateWorklogsErrors);
    const newStartTimeWorklogsErrors = manualFieldsWorklogs.map(
      (field) =>
        onEdit === 0 &&
        manualSwitchWorklogs &&
        (field.startTime.toString().trim().length === 0 ||
          field.startTime.toString().trim().length > 3 ||
          field.startTime.toString() == "0" ||
          field.startTime.toString() == "00" ||
          field.startTime.toString() == "000" ||
          field.startTime > 480)
    );
    manualSwitchWorklogs &&
      setStartTimeWorklogsErrors(newStartTimeWorklogsErrors);
    const newManualDescWorklogsErrors = manualFieldsWorklogs.map(
      (field) =>
        (onEdit === 0 &&
          manualSwitchWorklogs &&
          field.manualDesc.trim().length < 1) ||
        (onEdit === 0 &&
          manualSwitchWorklogs &&
          field.manualDesc.trim().length > 500)
    );
    manualSwitchWorklogs &&
      setManualDescWorklogsErrors(newManualDescWorklogsErrors);
    hasManualErrors =
      newInputDateWorklogsErrors.some((error) => error) ||
      newStartTimeWorklogsErrors.some((error) => error) ||
      newManualDescWorklogsErrors.some((error) => error);

    const data = {
      WorkItemId: onEdit > 0 ? onEdit : 0,
      ClientId: clientNameWorklogs,
      WorkTypeId: typeOfWorkWorklogs,
      taskName: clientTaskNameWorklogs,
      ProjectId: projectNameWorklogs === 0 ? null : projectNameWorklogs,
      ProcessId: processNameWorklogs === 0 ? null : processNameWorklogs,
      SubProcessId: subProcessWorklogs === 0 ? null : subProcessWorklogs,
      StatusId: statusWorklogs,
      Priority: priorityWorklogs === 0 ? null : priorityWorklogs,
      Quantity: quantityWorklogs <= 0 ? null : quantityWorklogs,
      Description:
        descriptionWorklogs.toString().length <= 0
          ? null
          : descriptionWorklogs.toString().trim(),
      ReceiverDate: dayjs(receiverDateWorklogs).format("YYYY/MM/DD"),
      DueDate: dayjs(dueDateWorklogs).format("YYYY/MM/DD"),
      allInfoDate:
        allInfoDateWorklogs === ""
          ? null
          : dayjs(allInfoDateWorklogs).format("YYYY/MM/DD"),
      AssignedId: assigneeWorklogs,
      ReviewerId: reviewerWorklogs,
      DepartmentId: departmentWorklogs,
      managerId: managerWorklogs,
      TaxReturnType: null,
      TaxCustomFields:
        typeOfWorkWorklogs !== 3
          ? null
          : {
              ReturnYear: returnYearWorklogs,
              Complexity: null,
              CountYear: null,
              NoOfPages: noOfPagesWorklogs,
            },
      checklistWorkpaper:
        checklistWorkpaperWorklogs === 1
          ? true
          : checklistWorkpaperWorklogs === 2
          ? false
          : null,
      ReworkReceivedDate: !!reworkReceiverDateWorklogs
        ? dayjs(reworkReceiverDateWorklogs).format("YYYY/MM/DD")
        : null,
      ReworkDueDate: !!reworkDueDateWorklogs
        ? dayjs(reworkDueDateWorklogs).format("YYYY/MM/DD")
        : null,
      PeriodFrom:
        valueMonthYearFrom === null || valueMonthYearFrom === ""
          ? null
          : dayjs(valueMonthYearFrom).format("YYYY/MM/DD"),
      PeriodTo:
        valueMonthYearTo === null || valueMonthYearTo === ""
          ? null
          : dayjs(valueMonthYearTo).format("YYYY/MM/DD"),
      IsQARequired: departmentWorklogsType == "SMB" ? isQaWorklogs : null,
      QAQuantity: departmentWorklogsType == "SMB" ? qaQuantityWorklogs : null,
      MissingInfo:
        departmentWorklogsType === "WhitelabelTaxation" &&
        !!missingInfoWorklogs &&
        statusWorklogsType === "OnHoldFromClient"
          ? missingInfoWorklogs.toString().trim()
          : null,
      ManualTimeList:
        onEdit > 0
          ? null
          : manualSwitchWorklogs
          ? manualFieldsWorklogs.map(
              (i: ManualFieldsWorklogs) =>
                new Object({
                  Date: dayjs(i.inputDate).format("YYYY/MM/DD"),
                  Time: i.startTime,
                  comment: i.manualDesc,
                })
            )
          : null,
      SubTaskList:
        onEdit > 0
          ? null
          : subTaskSwitchWorklogs
          ? subTaskFieldsWorklogs.map(
              (i: SubtaskGetByWorkitem) =>
                new Object({
                  SubtaskId: i.SubtaskId,
                  Title: i.Title.trim(),
                  Description: i.Description.trim(),
                })
            )
          : null,
      RecurringObj:
        onEdit > 0
          ? null
          : recurringSwitch
          ? {
              Type: recurringTime,
              IsActive: true,
              StartDate: dayjs(recurringStartDate).format("YYYY/MM/DD"),
              EndDate: dayjs(recurringEndDate).format("YYYY/MM/DD"),
              triggerIdList:
                recurringTime === 1
                  ? []
                  : recurringTime === 2
                  ? selectedDays
                  : recurringMonth.map((i: LabelValue) => i.value),
            }
          : null,
      ReminderObj:
        onEdit > 0
          ? null
          : reminderSwitch
          ? {
              Type: reminderCheckboxValue,
              IsActive: true,
              ReminderDate: reminderDate.length > 0 ? reminderDate : null,
              ReminderTime: reminderTime,
              ReminderUserList: reminderNotification.map(
                (i: LabelValue) => i.value
              ),
            }
          : null,
    };

    const saveWorklog = async () => {
      setIsLoadingWorklogs(true);
      const params = data;
      const url = `${process.env.worklog_api_url}/workitem/saveworkitem`;
      const successCallback = (
        ResponseData: number | string,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success(
            `Worklog ${onEdit > 0 ? "Updated" : "created"} successfully.`
          );
          onEdit > 0 && getEditDataWorklogs();
          onEdit > 0 && typeOfWorkWorklogs === 3 && getCheckListDataWorklogs();
          onEdit > 0 && getLogsDataWorklogs();
          onEdit === 0 && onClose();
          onEdit === 0 && handleClose();
          setIsLoadingWorklogs(false);
        } else if (ResponseStatus === "Warning" && error === false) {
          toast.warning(ResponseData);
          setIsLoadingWorklogs(false);
          onEdit > 0 && getEditDataWorklogs();
        } else {
          setIsLoadingWorklogs(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    };

    const qaError =
      qaQuantityWorklogs !== null
        ? qaQuantityWorklogs < 0 &&
          qaQuantityWorklogs > 10000 &&
          qaQuantityWorklogs.toString().includes(".")
        : false;

    if (
      onEdit === 0 &&
      typeOfWorkWorklogs !== 3 &&
      !hasErrors &&
      !hasSubErrors &&
      !hasManualErrors &&
      clientTaskNameWorklogs.trim().length > 3 &&
      clientTaskNameWorklogs.trim().length <= 100 &&
      !quantityWorklogsErr &&
      quantityWorklogs > 0 &&
      quantityWorklogs < 10000 &&
      !quantityWorklogs.toString().includes(".") &&
      !qaQuantityWorklogsErr &&
      !qaError &&
      !reworkReceiverDateWorklogsErr
    ) {
      if (hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs")) {
        saveWorklog();
      } else {
        toast.error("User don't have permission to Create Task.");
      }
    }

    if (
      onEdit === 0 &&
      typeOfWorkWorklogs === 3 &&
      !hasErrors &&
      !hasSubErrors &&
      !hasManualErrors &&
      clientTaskNameWorklogs.trim().length > 3 &&
      clientTaskNameWorklogs.trim().length <= 100 &&
      !quantityWorklogsErr &&
      quantityWorklogs > 0 &&
      quantityWorklogs < 10000 &&
      !quantityWorklogs.toString().includes(".") &&
      !qaQuantityWorklogsErr &&
      !qaError &&
      !reworkReceiverDateWorklogsErr
    ) {
      if (hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs")) {
        saveWorklog();
      } else {
        toast.error("User don't have permission to Create Task.");
      }
    }

    if (
      onEdit > 0 &&
      isDisabled &&
      !hasEditErrors &&
      clientTaskNameWorklogs.trim().length > 3 &&
      clientTaskNameWorklogs.trim().length <= 100 &&
      quantityWorklogs > 0 &&
      quantityWorklogs < 10000 &&
      !quantityWorklogsErr &&
      !quantityWorklogs.toString().includes(".") &&
      !qaQuantityWorklogsErr &&
      !reworkReceiverDateWorklogsErr
    ) {
      if (qaQuantityWorklogs === null) {
        saveWorklog();
      } else if (
        qaQuantityWorklogs >= 0 &&
        qaQuantityWorklogs < 10000 &&
        !qaQuantityWorklogs.toString().includes(".") &&
        !qaQuantityWorklogsErr
      ) {
        saveWorklog();
      }
    } else if (
      onEdit > 0 &&
      !isDisabled &&
      !hasEditErrors &&
      clientTaskNameWorklogs.trim().length > 3 &&
      clientTaskNameWorklogs.trim().length <= 100 &&
      quantityWorklogs > 0 &&
      quantityWorklogs < 10000 &&
      !quantityWorklogsErr &&
      !quantityWorklogs.toString().includes(".") &&
      !reworkReceiverDateWorklogsErr
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
        if (window.location.href.includes("id=")) {
          if (
            ResponseData.AssignedId == Number(localStorage.getItem("UserId")) ||
            ResponseData.ReviewerId == Number(localStorage.getItem("UserId"))
          ) {
            setIsIdDisabled(false);
          } else {
            setIsIdDisabled(true);
          }
        }
        setEditDataWorklogs(ResponseData);
        setIsCreatedByClientWorklogsDrawer(ResponseData.IsCreatedByClient);
        setErrorlogSignOffPending(ResponseData.ErrorlogSignedOffPending);
        setClientNameWorklogs(ResponseData.ClientId);
        setTypeOfWorkWorklogs(ResponseData.WorkTypeId);
        let departmentId: any = localStorage.getItem("departmentId");
        setDepartmentWorklogs(
          ResponseData.DepartmentId !== null
            ? ResponseData.DepartmentId
            : departmentId
        );
        setProjectNameWorklogs(
          ResponseData.ProjectId === null ? 0 : ResponseData.ProjectId
        );
        setProcessNameWorklogs(
          ResponseData.ProcessId === null ? 0 : ResponseData.ProcessId
        );
        setSubProcessWorklogs(
          ResponseData.SubProcessId === null ? 0 : ResponseData.SubProcessId
        );
        setClientTaskNameWorklogs(
          ResponseData.TaskName === null ? "" : ResponseData.TaskName
        );
        setEditStatusWorklogs(ResponseData.StatusId);
        setStatusWorklogs(ResponseData.StatusId);
        setAllInfoDateWorklogs(
          ResponseData.AllInfoDate === null ? "" : ResponseData.AllInfoDate
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
        setDateOfReviewWorklogs(
          ResponseData.ReviewerDate === null ? "" : ResponseData.ReviewerDate
        );
        setDateOfPreperationWorklogs(
          ResponseData.PreparationDate === null
            ? ""
            : ResponseData.PreparationDate
        );
        setAssigneeWorklogs(ResponseData.AssignedId);
        setReviewerWorklogs(ResponseData.ReviewerId);
        setManagerWorklogs(
          ResponseData.ManagerId === null ? 0 : ResponseData.ManagerId
        );
        setReturnYearWorklogs(
          ResponseData.TaxCustomFields === null
            ? 0
            : ResponseData.TypeOfReturnId === 0
            ? 0
            : ResponseData.TaxCustomFields.ReturnYear
        );
        setNoOfPagesWorklogs(
          ResponseData.TaxCustomFields === null
            ? 0
            : ResponseData.TypeOfReturnId === 0
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
        setValueMonthYearFrom(
          ResponseData.PeriodFrom === null
            ? null
            : dayjs(ResponseData.PeriodFrom)
        );
        setValueMonthYearTo(
          ResponseData.PeriodTo === null ? null : dayjs(ResponseData.PeriodTo)
        );
        setReworkReceiverDateWorklogs(
          !!ResponseData.ReworkReceivedDate
            ? ResponseData.ReworkReceivedDate
            : ""
        );
        setReworkDueDateWorklogs(
          !!ResponseData.ReworkDueDate ? ResponseData.ReworkDueDate : ""
        );
        setIsQaWorklogs(
          !!ResponseData.IsQARequired ? ResponseData.IsQARequired : 0
        );
        setQAQuantityWorklogs(
          ResponseData.QAQuantity !== null
            ? Number(ResponseData.QAQuantity)
            : null
        );
        setMissingInfoWorklogs(
          !!ResponseData.MissingInfo ? ResponseData.MissingInfo : null
        );
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const onEditDataWorklogs = () => {
    const pathname = window.location.href.includes("comment=");
    if (onEdit > 0) {
      getEditDataWorklogs();
      getSubTaskDataWorklogs();
      getRecurringDataWorklogs();
      getManualDataWorklogs();
      getCheckListDataWorklogs();
      setCommentSelectWorklogs(pathname ? 2 : 1);
      getCommentDataWorklogs(pathname ? 2 : 1);
      getReviewerNoteDataWorklogs();
      getLogsDataWorklogs();
    }
  };

  useEffect(() => {
    onEdit > 0 &&
      assigneeWorklogsDropdownData.length > 0 &&
      getErrorLogDataWorklogs();
    onEdit > 0 &&
      assigneeWorklogsDropdownData.length > 0 &&
      getReminderDataWorklogs();
  }, [assigneeWorklogsDropdownData]);

  useEffect(() => {
    const getCCData = async () => {
      await setCCDropdownDataWorklogs(await getCCDropdownData());
    };
    cCDropdownDataWorklogs.length <= 0 && getCCData();
  }, []);

  useEffect(() => {
    const getData = async () => {
      await onEditDataWorklogs();
    };
    onOpen && onEdit > 0 && getData();
  }, [onEdit, onOpen]);

  useEffect(() => {
    const getData = async () => {
      const statusData =
        typeOfWorkWorklogs > 0 &&
        (await getStatusDropdownData(typeOfWorkWorklogs));
      statusWorklogsDropdownData.length === 0 &&
        (await setStatusWorklogsDropdownData(statusData));
      onOpen &&
        (onEdit === 0 || isUnassigneeClicked) &&
        !!statusData &&
        (await setStatusWorklogsDropdownDataUse(
          statusData.filter(
            (item: LabelValueType) =>
              item.Type === "PendingFromAccounting" ||
              item.Type === "Assigned" ||
              item.Type === "NotStarted" ||
              item.Type === "InProgress" ||
              // item.Type === "Stop" ||
              // item.Type === "OnHoldFromClient" ||
              item.Type === "WithDraw" ||
              item.Type === "WithdrawnbyClient" ||
              // (typeOfWorkWorklogs !== 3 && item.Type === "PartialSubmitted") ||
              (onEdit > 0 &&
                (item.Type === "Rework" ||
                  item.Type === "ReworkInProgress" ||
                  item.Type === "ReworkPrepCompleted"))
          )
        ));

      onOpen &&
        onEdit > 0 &&
        !isUnassigneeClicked &&
        !!statusData &&
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
              // item.Type === "Submitted" ||
              item.value === editStatusWorklogs
          )
        );
      onOpen &&
        onEdit > 0 &&
        !isUnassigneeClicked &&
        !!statusData &&
        errorlogSignedOffPending &&
        setStatusWorklogsDropdownDataUse(
          statusData.filter(
            (item: LabelValueType) =>
              item.Type === "PendingFromAccounting" ||
              item.Type === "Assigned" ||
              item.Type === "OnHoldFromClient" ||
              item.Type === "WithDraw" ||
              item.Type === "WithdrawnbyClient" ||
              item.Type === "Rework" ||
              item.Type === "ReworkInProgress" ||
              item.Type === "ReworkPrepCompleted" ||
              // item.Type === "ReworkSubmitted" ||
              item.value === editStatusWorklogs
          )
        );
      onOpen &&
        onEdit === 0 &&
        setStatusWorklogs(
          statusData
            .map((i: LabelValueType) =>
              i.Type === "NotStarted" ? i.value : undefined
            )
            .filter((i: LabelValueType | undefined) => i !== undefined)[0]
        );
      onOpen &&
        onEdit === 0 &&
        setStatusWorklogsType(
          statusData
            .map((i: LabelValueType) =>
              i.Type === "NotStarted" ? i.Type : undefined
            )
            .filter((i: LabelValueType | undefined) => i !== undefined)[0]
        );
      onOpen &&
        onEdit > 0 &&
        setStatusWorklogsType(
          statusData
            .map((i: LabelValueType) =>
              i.value === editStatusWorklogs ? i.Type : undefined
            )
            .filter((i: LabelValueType | undefined) => i !== undefined)[0]
        );
    };
    getData();
  }, [typeOfWorkWorklogs, onOpen]);

  useEffect(() => {
    const getData = async () => {
      getUserDetails();
      setClientWorklogsDropdownData(await getClientDropdownData());
      const workTypeData =
        clientNameWorklogs > 0 &&
        (await getTypeOfWorkDropdownData(clientNameWorklogs));
      workTypeData.length > 0
        ? setTypeOfWorkWorklogsDropdownData(workTypeData)
        : setTypeOfWorkWorklogsDropdownData([]);
      const workTypeId = localStorage.getItem("workTypeId");
      workTypeData.length > 0 &&
        onEdit === 0 &&
        setTypeOfWorkWorklogs(
          workTypeData
            .map((i: LabelValue) => i.value)
            .includes(Number(workTypeId))
            ? Number(workTypeId)
            : workTypeData.map((i: LabelValue) => i.value).includes(3)
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
      onEdit > 0 &&
        clientNameWorklogs > 0 &&
        setCommentWorklogsUserData(
          await getCommentUserDropdownData({
            ClientId: clientNameWorklogs,
            GetClientUser: commentSelectWorklogs === 2 ? true : false,
          })
        );
    };

    onOpen && getData();
  }, [clientNameWorklogs, commentSelectWorklogs]);

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
    };

    getData();
  }, [typeOfWorkWorklogs, clientNameWorklogs]);

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
              (i: IdNameEstimatedHour) =>
                new Object({ label: i.Name, value: i.Id })
            )
          )
        : setProcessWorklogsDropdownData([]);
    };

    getData();
  }, [
    processNameWorklogs,
    typeOfWorkWorklogs,
    departmentWorklogs,
    clientNameWorklogs,
  ]);

  useEffect(() => {
    const getData = async () => {
      const data =
        processNameWorklogs !== 0 &&
        (await getSubProcessDropdownData(
          clientNameWorklogs,
          typeOfWorkWorklogs,
          processNameWorklogs
        ));
      data.length > 0
        ? setEstTimeDataWorklogs(data)
        : setEstTimeDataWorklogs([]);
      data.length > 0
        ? setSubProcessWorklogsDropdownData(
            data.map(
              (i: IdNameEstimatedHour) =>
                new Object({ label: i.Name, value: i.Id })
            )
          )
        : setSubProcessWorklogsDropdownData([]);
    };

    getData();
  }, [processNameWorklogs, typeOfWorkWorklogs, clientNameWorklogs]);

  useEffect(() => {
    const getData = async () => {
      const managerData = await getManagerDropdownData(typeOfWorkWorklogs);
      setManagerWorklogsDropdownData(managerData);
      const managerID: any = localStorage.getItem("managerId");
      const managerId: any =
        onEdit === 0 &&
        managerData.length > 0 &&
        managerData
          .map((i: LabelValue) => (i.value == managerID ? i.value : false))
          .filter((j: number | boolean) => j !== false)[0];
      onEdit === 0 &&
        managerData.length > 0 &&
        setManagerWorklogs(managerId !== undefined ? managerId : 0);

      const reviewerData = await getReviewerDropdownData(
        [clientNameWorklogs],
        typeOfWorkWorklogs
      );
      reviewerData.length > 0
        ? setReviewerWorklogsDropdownData(reviewerData)
        : setReviewerWorklogsDropdownData([]);
      const userId: any = localStorage.getItem("UserId");
      const reportingManagerId: any = localStorage.getItem("reviewerId");
      const reviewerId: any =
        onEdit === 0 &&
        reviewerData.length > 0 &&
        reviewerData
          .map((i: LabelValue) =>
            i.value == userId && typeOfWorkWorklogs === 3
              ? i.value
              : i.value == reportingManagerId && typeOfWorkWorklogs !== 3
              ? i.value
              : false
          )
          .filter((j: number | boolean) => j !== false)[0];

      onEdit === 0 &&
        reviewerData.length > 0 &&
        setReviewerWorklogs(reviewerId !== undefined ? reviewerId : 0);

      const assigneeData = await getAssigneeDropdownData(
        [clientNameWorklogs],
        typeOfWorkWorklogs
      );
      assigneeData.length > 0
        ? setAssigneeWorklogsDropdownData(assigneeData)
        : setAssigneeWorklogsDropdownData([]);
      const assigneeId =
        onEdit === 0 &&
        assigneeData.length > 0 &&
        assigneeData
          .map((i: LabelValue) => (i.value == userId ? i.value : false))
          .filter((j: number | boolean) => j !== false)[0];
      onEdit === 0 &&
        assigneeData.length > 0 &&
        setAssigneeWorklogs(assigneeId !== undefined ? assigneeId : 0);

      typeOfWorkWorklogs === 3 && onEdit === 0 && setReturnYearWorklogs(2023);
    };

    typeOfWorkWorklogs !== 0 && getData();
  }, [typeOfWorkWorklogs]);

  useEffect(() => {
    const getData = async () => {
      const departmentData = await getDepartmentDataByClient(
        clientNameWorklogs
      );
      departmentData.length > 0
        ? setDepartmentWorklogsDropdownData(departmentData)
        : setDepartmentWorklogsDropdownData([]);
      const departmentID: any = localStorage.getItem("departmentId");
      const departmentId =
        onEdit === 0 &&
        departmentData.length > 0 &&
        departmentData
          .map((i: LabelValueType) =>
            i.value == departmentID ? i.value : false
          )
          .filter((j: number | boolean) => j !== false)[0];
      const departmentType =
        departmentData.length > 0 &&
        departmentData
          .map((i: LabelValueType) =>
            i.value == departmentID || i.value == departmentWorklogs
              ? i.Type
              : false
          )
          .filter((j: number | boolean) => j !== false)[0];
      onEdit === 0 &&
        departmentData.length > 0 &&
        setDepartmentWorklogs(departmentId !== undefined ? departmentId : 0);
      setDepartmentWorklogsType(departmentType);
    };

    clientNameWorklogs > 0 && getData();
  }, [clientNameWorklogs, typeOfWorkWorklogs]);

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
        setUserId(ResponseData.UserId);
        !ResponseData.IsHaveManageAssignee &&
          setAssigneeWorklogs(ResponseData.UserId);
      }
    };
    callAPI(url, params, successCallback, "GET");
  };

  const handleClose = () => {
    setIsLoadingWorklogs(false);
    setIsIdDisabled(false);
    setEditDataWorklogs([]);
    setIsCreatedByClientWorklogsDrawer(false);
    setUserId(0);
    setClientNameWorklogs(0);
    setClientNameWorklogsErr(false);
    setTypeOfWorkWorklogs(0);
    setTypeOfWorkWorklogsErr(false);
    setProjectNameWorklogs(0);
    setProjectNameWorklogsErr(false);
    setClientTaskNameWorklogs("");
    setClientTaskNameWorklogsErr(false);
    setProcessNameWorklogs(0);
    setProcessNameWorklogsErr(false);
    setSubProcessWorklogs(0);
    setSubProcessWorklogsErr(false);
    setManagerWorklogs(0);
    setManagerWorklogsErr(false);
    setErrorlogSignOffPending(false);
    setEditStatusWorklogs(0);
    setStatusWorklogs(0);
    setStatusWorklogsType(null);
    setStatusWorklogsErr(false);
    setDescriptionWorklogs("");
    setDescriptionWorklogsErr(false);
    setPriorityWorklogs(0);
    setQuantityWorklogs(1);
    setQuantityWorklogsErr(false);
    setReceiverDateWorklogs("");
    setReceiverDateWorklogsErr(false);
    setDueDateWorklogs("");
    setAllInfoDateWorklogs("");
    setAssigneeWorklogs(0);
    setAssigneeWorklogsErr(false);
    setAssigneeWorklogsDisable(true);
    setReviewerWorklogs(0);
    setReviewerWorklogsErr(false);
    setDepartmentWorklogs(0);
    setDepartmentWorklogsErr(false);
    setDepartmentWorklogsType("");
    setDateOfReviewWorklogs("");
    setDateOfPreperationWorklogs("");
    setEstTimeDataWorklogs([]);
    setReturnYearWorklogs(0);
    setReturnYearWorklogsErr(false);
    setNoOfPagesWorklogs(0);
    setChecklistWorkpaperWorklogs(0);
    setChecklistWorkpaperWorklogsErr(false);
    setValueMonthYearFrom(null);
    setValueMonthYearTo(null);
    setIsQaWorklogs(0);
    setQAQuantityWorklogs(null);
    setQAQuantityWorklogsErr(false);
    setMissingInfoWorklogs(null);
    setMissingInfoWorklogsErr(false);

    // Sub-Task
    setSubTaskSwitchWorklogs(false);
    setSubTaskFieldsWorklogs([
      {
        SubtaskId: 0,
        Title: "",
        Description: "",
      },
    ]);
    setTaskNameWorklogsErr([false]);
    setSubTaskDescriptionWorklogsErr([false]);

    // Recurring
    setRecurringSwitch(false);
    setRecurringStartDate("");
    setRecurringStartDateErr(false);
    setRecurringEndDate("");
    setRecurringEndDateErr(false);
    setRecurringTime(1);
    setRecurringMonth(0);
    setRecurringMonthErr(false);

    // Manual
    setManualSwitchWorklogs(false);
    setManualFieldsWorklogs([
      {
        AssigneeId: 0,
        Id: 0,
        inputDate: "",
        startTime: 0,
        manualDesc: "",
        IsApproved: false,
      },
    ]);
    setInputDateWorklogsErrors([false]);
    setStartTimeWorklogsErrors([false]);
    setManualDescWorklogsErrors([false]);
    setDeletedManualTimeWorklogs([]);
    setManualSubmitWorklogsDisable(true);

    // Reminder
    setReminderSwitch(false);
    setReminderCheckboxValue(1);
    setReminderDate("");
    setReminderDateErr(false);
    setReminderTime(0);
    setReminderTimeErr(false);
    setReminderNotification(0);
    setReminderNotificationErr(false);
    setReminderId(0);

    // checklist
    setCheckListNameWorklogs("");
    setCheckListNameWorklogsError(false);
    setCheckListDataWorklogs([]);
    setItemStatesWorklogs({});

    // Error Logs
    setErrorLogFieldsWorklogs([
      {
        SubmitedBy: "",
        SubmitedOn: "",
        ErrorLogId: 0,
        ErrorType: 0,
        RootCause: 0,
        Impact: 0,
        Priority: 0,
        ErrorCount: 0,
        NatureOfError: 0,
        CC: [],
        Remark: "",
        DocumentNumber: "",
        VendorName: "",
        RootCauseAnalysis: "",
        MitigationPlan: "",
        ContigencyPlan: "",
        Attachments: [
          {
            AttachmentId: 0,
            UserFileName: "",
            SystemFileName: "",
            AttachmentPath: "",
          },
        ],
        Amount: 0,
        DateOfTransaction: "",
        ErrorIdentificationDate: "",
        ResolutionStatus: 0,
        IdentifiedBy: "",
        isSolved: false,
        DisableErrorLog: false,
        IsHasErrorlogAddedByClient: false,
      },
    ]);
    setErrorTypeWorklogsErr([false]);
    setRootCauseWorklogsErr([false]);
    setImpactWorklogsErr([false]);
    setErrorLogPriorityWorklogsErr([false]);
    setErrorCountWorklogsErr([false]);
    setNatureOfWorklogsErr([false]);
    setDocumentNumberErrWorklogs([false]);
    setVendorNameErrWorklogs([false]);
    setRcaErrWorklogs([false]);
    setRecordedDateErrWorklogs([false]);
    setMitigationErrWorklogs([false]);
    setContigencyPlanErrWorklogs([false]);
    setRemarkErrWorklogs([false]);
    setImageErrWorklogs([false]);
    setDeletedErrorLogWorklogs([]);
    setErorLogWorklogsDrawer(true);
    setErrorIdentificationErrWorklogs([false]);
    setResolutionStatusErrWorklogs([false]);
    setIdentifiedByErrWorklogs([false]);

    // Comments
    setCommentDataWorklogs([]);
    setValueWorklogs("");
    setValueWorklogsError(false);
    setFileHasError(false);
    setValueEditWorklogs("");
    setValueEditWorklogsError(false);
    setFileEditHasError(false);
    setMentionWorklogs([]);
    setEditingCommentIndexWorklogs(-1);
    setCommentSelectWorklogs(1);
    setCommentAttachmentWorklogs([
      {
        AttachmentId: 0,
        UserFileName: "",
        SystemFileName: "",
        AttachmentPath: process.env.attachment || "",
      },
    ]);
    setCommentWorklogsUserData([]);

    // Reviewer note
    setReviewerNoteDataWorklogs([]);

    // Log
    setLogsDateWorklogs([]);

    // Dropdown
    setClientWorklogsDropdownData([]);
    setTypeOfWorkWorklogsDropdownData([]);
    setProjectWorklogsDropdownData([]);
    setProcessWorklogsDropdownData([]);
    setSubProcessWorklogsDropdownData([]);
    setStatusWorklogsDropdownData([]);
    setStatusWorklogsDropdownDataUse([]);
    setAssigneeWorklogsDropdownData([]);
    setReviewerWorklogsDropdownData([]);
    setDepartmentWorklogsDropdownData([]);

    // Others
    scrollToPanel(0);
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

  useEffect(() => {
    if (onEdit === 0) {
      if (typeOfWorkWorklogs > 0 && typeOfWorkWorklogs !== 3) {
        const reviewerDate = dayjs();
        setReceiverDateWorklogs(reviewerDate.toISOString());
        setReceiverDateWorklogsErr(false);
        let nextDate: any = reviewerDate;
        if (reviewerDate.day() === 4) {
          nextDate = nextDate.add(4, "day");
        } else if (reviewerDate.day() === 5) {
          nextDate = nextDate.add(4, "day");
        } else if (reviewerDate.day() === 6) {
          nextDate = nextDate.add(4, "day");
        } else {
          nextDate = dayjs(reviewerDate).add(3, "day").toDate();
        }
        setDueDateWorklogs(nextDate);
      } else {
        setReceiverDateWorklogs("");
        setDueDateWorklogs("");
      }
    }
  }, [typeOfWorkWorklogs]);

  return (
    <>
      <div
        className={`fixed top-0 right-0 z-30 h-screen w-[1300px] border border-lightSilver bg-pureWhite transform  ${
          onOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="sticky top-0 !h-[9%] bg-whiteSmoke border-b z-30 border-lightSilver">
          <div className="flex p-[6px] justify-between items-center">
            <div className="flex items-center py-[6.5px] pl-[5px]">
              {Task.map((task: string) => task)
                .filter((i: string | boolean) => i !== false)
                .map((task: string, index: number) => (
                  <div
                    key={index}
                    className={`my-2 px-3 text-[14px] ${
                      index !== Task.length - 1 &&
                      "border-r border-r-lightSilver"
                    } cursor-pointer font-bold hover:text-[#0592C6] text-slatyGrey`}
                    onClick={() => handleTabClick(index)}
                  >
                    {task}
                  </div>
                ))}
            </div>
            <Tooltip title="Close" placement="left" arrow>
              <IconButton className="mr-[10px]" onClick={handleClose}>
                <Close />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <div className="overflow-y-scroll !h-[91%]">
          <form onSubmit={handleSubmit}>
            {(hasPermissionWorklog("Task/SubTask", "View", "WorkLogs") ||
              isDisabled) && (
              <div className="pt-1" id="tabpanel-0">
                <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                  <span className="flex items-center">
                    <TaskIcon />
                    <span className="ml-[21px]">Task</span>
                  </span>
                  <div className="flex gap-4">
                    {onEdit > 0 && editDataWorklogs?.length > 0 && (
                      <span>
                        Created By : {editDataWorklogs?.CreatedByName}
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
                        onChange={(e, value: LabelValue | null) => {
                          value && setClientNameWorklogs(value.value);
                          setClientNameWorklogsErr(false);
                          setTypeOfWorkWorklogs(0);
                          setTypeOfWorkWorklogsErr(false);
                          setProjectNameWorklogs(0);
                          setProjectNameWorklogsErr(false);
                          onEdit > 0 && setStatusWorklogs(0);
                          onEdit > 0 && setStatusWorklogsErr(false);
                          onEdit > 0 && setStatusWorklogsType(null);
                          setProcessNameWorklogs(0);
                          setProcessNameWorklogsErr(false);
                          setSubProcessWorklogs(0);
                          setSubProcessWorklogsErr(false);
                          setDescriptionWorklogs("");
                          setDescriptionWorklogsErr(false);
                          setManagerWorklogs(0);
                          setManagerWorklogsErr(false);
                          setPriorityWorklogs(0);
                          setQuantityWorklogs(1);
                          setQuantityWorklogsErr(false);
                          setReceiverDateWorklogs("");
                          setReceiverDateWorklogsErr(false);
                          setDueDateWorklogs("");
                          assigneeWorklogsDisable && setAssigneeWorklogs(0);
                          assigneeWorklogsDisable &&
                            setAssigneeWorklogsErr(false);
                          setReviewerWorklogs(0);
                          setReviewerWorklogsErr(false);
                          isAdmin && setDepartmentWorklogs(0);
                          isAdmin && setDepartmentWorklogsErr(false);
                          isAdmin && setDepartmentWorklogsType("");
                          setChecklistWorkpaperWorklogs(0);
                          setChecklistWorkpaperWorklogsErr(false);
                          setValueMonthYearFrom(null);
                          setValueMonthYearTo(null);
                          setClientTaskNameWorklogsErr(false);
                          setStatusWorklogsErr(false);
                          setMissingInfoWorklogs(null);
                          setMissingInfoWorklogsErr(false);
                        }}
                        disabled={
                          (isCreatedByClientWorklogsDrawer &&
                            editDataWorklogs.ClientId > 0) ||
                          isIdDisabled ||
                          isDisabled
                        }
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
                            error={clientNameWorklogsErr}
                            onBlur={() => {
                              if (clientNameWorklogs > 0) {
                                setClientNameWorklogsErr(false);
                              }
                            }}
                            helperText={
                              clientNameWorklogsErr
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
                        error={typeOfWorkWorklogsErr}
                        disabled={
                          (isCreatedByClientWorklogsDrawer &&
                            editDataWorklogs.WorkTypeId > 0) ||
                          isIdDisabled ||
                          isDisabled
                        }
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
                          onChange={(e) => {
                            setProjectNameWorklogs(0);
                            setProjectNameWorklogsErr(false);
                            onEdit > 0 && setStatusWorklogs(0);
                            onEdit > 0 && setStatusWorklogsType(null);
                            onEdit > 0 && setStatusWorklogsErr(false);
                            setProcessNameWorklogs(0);
                            setProcessNameWorklogsErr(false);
                            setSubProcessWorklogs(0);
                            setSubProcessWorklogsErr(false);
                            assigneeWorklogsDisable && setAssigneeWorklogs(0);
                            setReviewerWorklogs(0);
                            setTypeOfWorkWorklogs(Number(e.target.value));
                            onEdit === 0 && setDateOfReviewWorklogs("");
                            onEdit === 0 && setDateOfPreperationWorklogs("");
                            setReturnYearWorklogs(0);
                            setNoOfPagesWorklogs(0);
                            isAdmin && setDepartmentWorklogs(0);
                            isAdmin && setDepartmentWorklogsErr(false);
                            isAdmin && setDepartmentWorklogsType("");
                            setValueMonthYearFrom(null);
                            setValueMonthYearTo(null);
                            setManagerWorklogs(0);
                            setManagerWorklogsErr(false);
                            setMissingInfoWorklogs(null);
                            setMissingInfoWorklogsErr(false);
                          }}
                          onBlur={() => {
                            if (typeOfWorkWorklogs > 0) {
                              setTypeOfWorkWorklogsErr(false);
                            }
                          }}
                        >
                          {typeOfWorkWorklogsDropdownData.map(
                            (i: LabelValue, index: number) => (
                              <MenuItem value={i.value} key={index}>
                                {i.label}
                              </MenuItem>
                            )
                          )}
                        </Select>
                        {typeOfWorkWorklogsErr && (
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
                        options={projectWorklogsDropdownData}
                        value={
                          projectWorklogsDropdownData.find(
                            (i: LabelValue) => i.value === projectNameWorklogs
                          ) || null
                        }
                        disabled={
                          (isCreatedByClientWorklogsDrawer &&
                            editDataWorklogs.ProjectId > 0) ||
                          isIdDisabled ||
                          isDisabled
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setProjectNameWorklogs(value.value);
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
                            error={projectNameWorklogsErr}
                            onBlur={() => {
                              if (projectNameWorklogs > 0) {
                                setProjectNameWorklogsErr(false);
                              }
                            }}
                            helperText={
                              projectNameWorklogsErr
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
                            (i: LabelValueType) => i.value === statusWorklogs
                          ) || null
                        }
                        disabled={isIdDisabled || isDisabled}
                        onChange={(e, value: LabelValueType | null) => {
                          value && setStatusWorklogs(value.value);
                          value && setStatusWorklogsType(String(value.Type));
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
                            error={statusWorklogsErr}
                            onBlur={() => {
                              if (subProcessWorklogs > 0) {
                                setStatusWorklogsErr(false);
                              }
                            }}
                            helperText={
                              statusWorklogsErr
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
                        options={departmentWorklogsDropdownData}
                        disabled={
                          (isCreatedByClientWorklogsDrawer &&
                            editDataWorklogs.DepartmentId > 0) ||
                          isIdDisabled ||
                          isAdmin === false ||
                          isDisabled
                        }
                        value={
                          departmentWorklogsDropdownData.find(
                            (i: LabelValueType) => i.value == departmentWorklogs
                          ) || null
                        }
                        onChange={(e, value: LabelValueType | null) => {
                          value && setDepartmentWorklogs(value.value);
                          setProcessNameWorklogs(0);
                          setSubProcessWorklogs(0);
                          setValueMonthYearFrom(null);
                          setValueMonthYearTo(null);
                          setDescriptionWorklogs("");
                          setDescriptionWorklogsErr(false);
                          setAllInfoDateWorklogs("");
                          setMissingInfoWorklogsErr(false);
                        }}
                        sx={{ mx: 0.75, width: 300 }}
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
                            error={departmentWorklogsErr}
                            onBlur={() => {
                              if (departmentWorklogs > 0) {
                                setDepartmentWorklogsErr(false);
                              }
                            }}
                            helperText={
                              departmentWorklogsErr
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
                        options={processWorklogsDropdownData}
                        value={
                          processWorklogsDropdownData.find(
                            (i: LabelValue) => i.value === processNameWorklogs
                          ) || null
                        }
                        disabled={
                          (isCreatedByClientWorklogsDrawer &&
                            editDataWorklogs.ProcessId > 0) ||
                          isIdDisabled ||
                          isDisabled
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setProcessNameWorklogs(value.value);
                          setProcessNameWorklogsErr(false);
                          value && setSubProcessWorklogs(0);
                          setSubProcessWorklogsErr(false);
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
                            error={processNameWorklogsErr}
                            onBlur={() => {
                              if (processNameWorklogs > 0) {
                                setProcessNameWorklogsErr(false);
                              }
                            }}
                            helperText={
                              processNameWorklogsErr
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
                        options={subProcessWorklogsDropdownData}
                        value={
                          subProcessWorklogsDropdownData.find(
                            (i: LabelValue) => i.value === subProcessWorklogs
                          ) || null
                        }
                        disabled={
                          (isCreatedByClientWorklogsDrawer &&
                            editDataWorklogs.SubProcessId > 0) ||
                          isIdDisabled ||
                          isDisabled
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setSubProcessWorklogs(value.value);
                          setSubProcessWorklogsErr(false);
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
                            error={subProcessWorklogsErr}
                            onBlur={() => {
                              if (subProcessWorklogs > 0) {
                                setSubProcessWorklogsErr(false);
                              }
                            }}
                            helperText={
                              subProcessWorklogsErr
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
                        disabled={isIdDisabled || isDisabled}
                        value={
                          clientTaskNameWorklogs?.trim().length <= 0
                            ? ""
                            : clientTaskNameWorklogs
                        }
                        onChange={(e) => {
                          setClientTaskNameWorklogs(e.target.value);
                          setClientTaskNameWorklogsErr(false);
                        }}
                        onBlur={(e) => {
                          if (
                            e.target.value.trim().length < 4 ||
                            e.target.value.trim().length > 100
                          ) {
                            setClientTaskNameWorklogsErr(true);
                          }
                        }}
                        error={clientTaskNameWorklogsErr}
                        helperText={
                          clientTaskNameWorklogsErr &&
                          clientTaskNameWorklogs?.trim().length > 0 &&
                          clientTaskNameWorklogs?.trim().length < 4
                            ? "Minimum 4 characters required."
                            : clientTaskNameWorklogsErr &&
                              clientTaskNameWorklogs?.trim().length > 100
                            ? "Maximum 100 characters allowed."
                            : clientTaskNameWorklogsErr
                            ? "This is a required field."
                            : ""
                        }
                        margin="normal"
                        variant="standard"
                        sx={{ mx: 0.75, width: 300, mt: -0.5 }}
                      />
                    </Grid>
                    <Grid item xs={3} className="pt-[14px]">
                      <TextField
                        label={
                          departmentWorklogsType === "WhitelabelTaxation" &&
                          typeOfWorkWorklogs === 3 ? (
                            "Missing Info/Description"
                          ) : departmentWorklogsType ===
                            "WhitelabelTaxation" ? (
                            "Description"
                          ) : (
                            <span>
                              Description
                              <span className="!text-defaultRed">&nbsp;*</span>
                            </span>
                          )
                        }
                        multiline={
                          departmentWorklogsType === "WhitelabelTaxation" &&
                          typeOfWorkWorklogs === 3
                        }
                        fullWidth
                        value={
                          descriptionWorklogs?.trim().length <= 0
                            ? ""
                            : descriptionWorklogs
                        }
                        disabled={isIdDisabled || isDisabled}
                        onChange={(e) => {
                          setDescriptionWorklogs(e.target.value);
                          setDescriptionWorklogsErr(false);
                        }}
                        onBlur={(e) => {
                          if (departmentWorklogsType === "WhitelabelTaxation") {
                            setDescriptionWorklogsErr(false);
                          } else if (
                            e.target.value.trim().length <= 0 ||
                            e.target.value.trim().length > 100
                          ) {
                            setDescriptionWorklogsErr(true);
                          }
                        }}
                        error={descriptionWorklogsErr}
                        helperText={
                          descriptionWorklogsErr &&
                          descriptionWorklogs?.trim().length > 100
                            ? "Maximum 100 characters allowed."
                            : descriptionWorklogsErr
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
                        disabled={isIdDisabled || isDisabled}
                        value={quantityWorklogs}
                        onChange={(e) => {
                          setQuantityWorklogs(Number(e.target.value));
                          setQuantityWorklogsErr(false);
                        }}
                        onBlur={(e) => {
                          if (
                            e.target.value.trim().length > 0 &&
                            e.target.value.trim().length < 5 &&
                            !e.target.value.trim().includes(".")
                          ) {
                            setQuantityWorklogsErr(false);
                          }
                        }}
                        error={quantityWorklogsErr}
                        helperText={
                          quantityWorklogsErr &&
                          quantityWorklogs.toString().includes(".")
                            ? "Only intiger value allowed."
                            : quantityWorklogsErr &&
                              quantityWorklogs.toString() === ""
                            ? "This is a required field."
                            : quantityWorklogsErr && quantityWorklogs <= 0
                            ? "Enter valid number."
                            : quantityWorklogsErr &&
                              quantityWorklogs.toString().length > 4
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
                      <FormControl
                        variant="standard"
                        sx={{ mx: 0.75, width: 300, mt: -1.2 }}
                        disabled={isIdDisabled || isDisabled}
                      >
                        <InputLabel id="demo-simple-select-standard-label">
                          Priority
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-standard-label"
                          id="demo-simple-select-standard"
                          value={priorityWorklogs === 0 ? "" : priorityWorklogs}
                          onChange={(e) => setPriorityWorklogs(e.target.value)}
                        >
                          <MenuItem value={1}>High</MenuItem>
                          <MenuItem value={2}>Medium</MenuItem>
                          <MenuItem value={3}>Low</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <div
                        className={`inline-flex -mt-[11px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px] ${
                          receiverDateWorklogsErr ? "datepickerError" : ""
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
                            onError={() => setReceiverDateWorklogsErr(false)}
                            disabled={isIdDisabled || isDisabled}
                            value={
                              receiverDateWorklogs === ""
                                ? null
                                : dayjs(receiverDateWorklogs)
                            }
                            // shouldDisableDate={isWeekend}
                            maxDate={dayjs(Date.now())}
                            onChange={(newDate: any) => {
                              setReceiverDateWorklogs(newDate.$d);
                              setReceiverDateWorklogsErr(false);
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
                              setDueDateWorklogs(nextDate);
                              !!reworkReceiverDateWorklogs &&
                              new Date(reworkReceiverDateWorklogs) <
                                new Date(newDate.$d)
                                ? setReworkReceiverDateWorklogsErr(true)
                                : setReworkReceiverDateWorklogsErr(false);
                            }}
                            slotProps={{
                              textField: {
                                helperText: receiverDateWorklogsErr
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
                              dueDateWorklogs === ""
                                ? null
                                : dayjs(dueDateWorklogs)
                            }
                            disabled={isIdDisabled || isDisabled}
                            minDate={dayjs(receiverDateWorklogs)}
                            shouldDisableDate={isWeekend}
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
                              disabled={isIdDisabled || isDisabled}
                              shouldDisableDate={isWeekend}
                              value={
                                allInfoDateWorklogs === ""
                                  ? null
                                  : dayjs(allInfoDateWorklogs)
                              }
                              onChange={(newDate: any) =>
                                setAllInfoDateWorklogs(newDate.$d)
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
                        disabled={
                          !assigneeWorklogsDisable || isIdDisabled || isDisabled
                        }
                        value={
                          assigneeWorklogsDropdownData.find(
                            (i: LabelValue) => i.value === assigneeWorklogs
                          ) || null
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setAssigneeWorklogs(value.value);
                        }}
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
                            error={assigneeWorklogsErr}
                            onBlur={() => {
                              if (assigneeWorklogs > 0) {
                                setAssigneeWorklogsErr(false);
                              }
                            }}
                            helperText={
                              assigneeWorklogsErr
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
                        typeOfWorkWorklogs === 3 ? "pt-4" : "pt-5"
                      }`}
                    >
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={reviewerWorklogsDropdownData}
                        disabled={isIdDisabled || isDisabled}
                        value={
                          reviewerWorklogsDropdownData?.find(
                            (i: LabelValue) => i.value === reviewerWorklogs
                          ) || null
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setReviewerWorklogs(value.value);
                        }}
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
                            error={reviewerWorklogsErr}
                            onBlur={() => {
                              if (reviewerWorklogs > 0) {
                                setReviewerWorklogsErr(false);
                              }
                            }}
                            helperText={
                              reviewerWorklogsErr
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
                        typeOfWorkWorklogs === 3 ? "pt-4" : "pt-5"
                      }`}
                    >
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={managerWorklogsDropdownData}
                        disabled={isIdDisabled || isDisabled}
                        value={
                          managerWorklogsDropdownData.find(
                            (i: LabelValue) => i.value === managerWorklogs
                          ) || null
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setManagerWorklogs(value.value);
                          setManagerWorklogsErr(false);
                        }}
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
                            error={managerWorklogsErr}
                            onBlur={() => {
                              if (managerWorklogs > 0) {
                                setManagerWorklogsErr(false);
                              }
                            }}
                            helperText={
                              managerWorklogsErr
                                ? "This is a required field."
                                : ""
                            }
                          />
                        )}
                      />
                    </Grid>
                    {departmentWorklogsType === "SMB" && (
                      <>
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
                            disabled={
                              isIdDisabled ||
                              isDisabled ||
                              !!editDataWorklogs.QAId
                            }
                            value={
                              isQaWorklogsDropdownData.find(
                                (i: LabelValue) => i.value === isQaWorklogs
                              ) || null
                            }
                            onChange={(e, value: LabelValue | null) => {
                              value && setIsQaWorklogs(value.value);
                            }}
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
                        {isDisabled && (
                          <Grid
                            item
                            xs={3}
                            className={`${
                              typeOfWorkWorklogs === 3 ? "pt-4" : "pt-5"
                            }`}
                          >
                            <TextField
                              label="QA Quantity"
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
                              disabled={isIdDisabled}
                              value={qaQuantityWorklogs}
                              onChange={(e) => {
                                e.target.value.length <= 0
                                  ? setQAQuantityWorklogs(null)
                                  : e.target.value.toString().trim().length <=
                                      4 &&
                                    setQAQuantityWorklogs(
                                      Number(e.target.value)
                                    );
                                setQAQuantityWorklogsErr(false);
                              }}
                              margin="normal"
                              variant="standard"
                              sx={{
                                width: 300,
                                mt: typeOfWorkWorklogs === 3 ? 0.2 : -1,
                                mx: 0.75,
                              }}
                              onBlur={(e) => {
                                if (
                                  Number(e.target.value) < 0 ||
                                  e.target.value.trim().length > 4 ||
                                  e.target.value.trim().includes(".")
                                ) {
                                  setQAQuantityWorklogsErr(true);
                                } else {
                                  setQAQuantityWorklogsErr(false);
                                }
                              }}
                              error={qaQuantityWorklogsErr}
                              helperText={
                                qaQuantityWorklogsErr &&
                                qaQuantityWorklogs !== null &&
                                qaQuantityWorklogs.toString().includes(".")
                                  ? "Only intiger value allowed."
                                  : qaQuantityWorklogsErr &&
                                    qaQuantityWorklogs !== null &&
                                    qaQuantityWorklogs < 0
                                  ? "Enter valid number."
                                  : qaQuantityWorklogsErr &&
                                    qaQuantityWorklogs !== null &&
                                    qaQuantityWorklogs.toString().length > 4
                                  ? "Maximum 4 numbers allowed."
                                  : ""
                              }
                            />
                          </Grid>
                        )}
                      </>
                    )}
                    {(departmentWorklogsType === "WhitelabelAccounting" ||
                      departmentWorklogsType === "WhitelabelAustralia" ||
                      departmentWorklogsType === "UK" ||
                      departmentWorklogsType === "Germany") && (
                      <Grid
                        item
                        xs={3}
                        className={`${
                          typeOfWorkWorklogs === 3 ? "pt-[14px]" : "pt-2"
                        }`}
                      >
                        <div
                          className={`inline-flex mx-[6px] muiDatepickerCustomizer muiDatepickerCustomizerMonth w-full max-w-[300px]`}
                        >
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              minDate={dayjs(previousYearStartDate)}
                              maxDate={dayjs(currentYearEndDate)}
                              views={["year", "month"]}
                              label="Period From"
                              disabled={isIdDisabled || isDisabled}
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
                          typeOfWorkWorklogs === 3 ? "pt-[14px]" : "pt-2"
                        }`}
                      >
                        <div
                          className={`inline-flex mx-[6px] muiDatepickerCustomizer muiDatepickerCustomizerMonth w-full max-w-[300px]`}
                        >
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              minDate={dayjs(previousYearStartDate)}
                              maxDate={dayjs(currentYearEndDate)}
                              views={["year", "month"]}
                              label="Period To"
                              disabled={isIdDisabled || isDisabled}
                              value={
                                valueMonthYearTo === ""
                                  ? null
                                  : valueMonthYearTo
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
                            error={returnYearWorklogsErr}
                            disabled={isIdDisabled || isDisabled}
                          >
                            <InputLabel id="demo-simple-select-standard-label">
                              Return Year
                              <span className="text-defaultRed">&nbsp;*</span>
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-standard-label"
                              id="demo-simple-select-standard"
                              value={
                                returnYearWorklogs === 0
                                  ? ""
                                  : returnYearWorklogs
                              }
                              onChange={(e) =>
                                setReturnYearWorklogs(Number(e.target.value))
                              }
                              onBlur={() => {
                                if (returnYearWorklogs > 0) {
                                  setReturnYearWorklogsErr(false);
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
                            {returnYearWorklogsErr && (
                              <FormHelperText>
                                This is a required field.
                              </FormHelperText>
                            )}
                          </FormControl>
                        </Grid>
                        <Grid item xs={3} className="pt-[16px]">
                          <TextField
                            label="No of Pages"
                            type="number"
                            fullWidth
                            disabled={isIdDisabled || isDisabled}
                            value={
                              noOfPagesWorklogs === 0 ? "" : noOfPagesWorklogs
                            }
                            onChange={(e) =>
                              setNoOfPagesWorklogs(Number(e.target.value))
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
                            margin="normal"
                            variant="standard"
                            sx={{ width: 300, mt: 0, mx: 0.75 }}
                          />
                        </Grid>
                        <Grid item xs={3} className="pt-5">
                          <FormControl
                            variant="standard"
                            sx={{ width: 300, mt: -0.8, mx: 0.75 }}
                            error={checklistWorkpaperWorklogsErr}
                            disabled={isIdDisabled || isDisabled}
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
                              onChange={(e) =>
                                setChecklistWorkpaperWorklogs(
                                  Number(e.target.value)
                                )
                              }
                              onBlur={() => {
                                if (checklistWorkpaperWorklogs > 0) {
                                  setChecklistWorkpaperWorklogsErr(false);
                                }
                              }}
                            >
                              <MenuItem value={1}>Yes</MenuItem>
                              <MenuItem value={2}>No</MenuItem>
                            </Select>
                            {checklistWorkpaperWorklogsErr && (
                              <FormHelperText>
                                This is a required field.
                              </FormHelperText>
                            )}
                          </FormControl>
                        </Grid>
                      </>
                    )}
                    {departmentWorklogsType === "WhitelabelTaxation" &&
                      statusWorklogs > 0 &&
                      statusWorklogsType === "OnHoldFromClient" && (
                        <Grid item xs={3} className="pt-4">
                          <TextField
                            label={
                              <span>
                                Missing Info
                                <span className="!text-defaultRed">
                                  &nbsp;*
                                </span>
                              </span>
                            }
                            fullWidth
                            value={
                              !missingInfoWorklogs ||
                              missingInfoWorklogs?.trim().length <= 0
                                ? ""
                                : missingInfoWorklogs
                            }
                            disabled={isIdDisabled || isDisabled}
                            onChange={(e) => {
                              setMissingInfoWorklogs(e.target.value);
                              setMissingInfoWorklogsErr(false);
                            }}
                            onBlur={(e) => {
                              if (
                                e.target.value.trim().length <= 0 ||
                                e.target.value.trim().length > 100
                              ) {
                                setMissingInfoWorklogsErr(true);
                              }
                            }}
                            error={missingInfoWorklogsErr}
                            helperText={
                              missingInfoWorklogsErr &&
                              !!missingInfoWorklogs &&
                              missingInfoWorklogs?.trim().length > 100
                                ? "Maximum 100 characters allowed."
                                : missingInfoWorklogsErr
                                ? "This is a required field."
                                : ""
                            }
                            margin="normal"
                            variant="standard"
                            sx={{
                              mx: 0.75,
                              width: 300,
                              mt:
                                departmentWorklogsType ===
                                  "WhitelabelTaxation" &&
                                statusWorklogs > 0 &&
                                statusWorklogsType === "OnHoldFromClient" &&
                                typeOfWorkWorklogs !== 3
                                  ? -0.5
                                  : 0,
                            }}
                          />
                        </Grid>
                      )}
                    {onEdit > 0 && (
                      <>
                        <Grid
                          item
                          xs={3}
                          className={`${
                            (departmentWorklogsType == "UK" ||
                              departmentWorklogsType ==
                                "WhitelabelAccounting" ||
                              departmentWorklogsType == "WhitelabelAustralia" ||
                              departmentWorklogsType === "Germany" ||
                              (departmentWorklogsType === "SMB" &&
                                isDisabled)) &&
                            typeOfWorkWorklogs !== 3
                              ? "pt-6"
                              : departmentWorklogsType ===
                                  "WhitelabelTaxation" &&
                                statusWorklogs > 0 &&
                                statusWorklogsType === "OnHoldFromClient" &&
                                typeOfWorkWorklogs !== 3
                              ? "pt-6"
                              : "pt-5"
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
                              mt: typeOfWorkWorklogs === 3 ? -0.4 : -1,
                              mx: 0.75,
                            }}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={3}
                          className={`${
                            (departmentWorklogsType == "UK" ||
                              departmentWorklogsType ==
                                "WhitelabelAccounting" ||
                              departmentWorklogsType == "WhitelabelAustralia" ||
                              departmentWorklogsType == "WhitelabelTaxation" ||
                              departmentWorklogsType === "Germany" ||
                              departmentWorklogsType === "SMB") &&
                            typeOfWorkWorklogs !== 3
                              ? "pt-6"
                              : "pt-5"
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
                              mt: typeOfWorkWorklogs === 3 ? -0.4 : -1,
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
                                  disabled={isIdDisabled || isDisabled}
                                  value={
                                    reworkReceiverDateWorklogs === ""
                                      ? null
                                      : dayjs(reworkReceiverDateWorklogs)
                                  }
                                  // shouldDisableDate={isWeekend}
                                  minDate={dayjs(receiverDateWorklogs)}
                                  maxDate={dayjs(Date.now())}
                                  onChange={(newDate: any) => {
                                    setReworkReceiverDateWorklogs(newDate.$d);
                                    const selectedDate = dayjs(newDate.$d);
                                    let nextDate: any = selectedDate;
                                    nextDate = dayjs(newDate.$d)
                                      .add(1, "day")
                                      .toDate();
                                    setReworkDueDateWorklogs(nextDate);
                                    !!receiverDateWorklogs &&
                                    new Date(receiverDateWorklogs) >
                                      new Date(newDate.$d)
                                      ? setReworkReceiverDateWorklogsErr(true)
                                      : setReworkReceiverDateWorklogsErr(false);
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
                        {!!reworkDueDateWorklogs && (
                          <Grid item xs={3} className="pt-5">
                            <div
                              className={`inline-flex -mt-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]`}
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
                                  disabled={isIdDisabled || isDisabled}
                                  minDate={dayjs(reworkReceiverDateWorklogs)}
                                  shouldDisableDate={isWeekend}
                                  onChange={(newDate: any) => {
                                    setReworkDueDateWorklogs(newDate.$d);
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
                        {!!editDataWorklogs &&
                          !!editDataWorklogs.PrevReviewerId && (
                            <Grid
                              item
                              xs={3}
                              className={`${
                                (departmentWorklogsType == "UK" ||
                                  departmentWorklogsType ==
                                    "WhitelabelAccounting" ||
                                  departmentWorklogsType ==
                                    "WhitelabelAustralia" ||
                                  departmentWorklogsType ==
                                    "WhitelabelTaxation" ||
                                  departmentWorklogsType === "Germany" ||
                                  departmentWorklogsType === "SMB") &&
                                typeOfWorkWorklogs !== 3
                                  ? "pt-6"
                                  : departmentWorklogsType === "SMB" &&
                                    typeOfWorkWorklogs === 3
                                  ? "pt-2"
                                  : "pt-4"
                              }`}
                            >
                              <Autocomplete
                                disablePortal
                                id="combo-box-demo"
                                options={reviewerWorklogsDropdownData}
                                disabled
                                value={
                                  reviewerWorklogsDropdownData?.find(
                                    (i: LabelValue) =>
                                      i.value ===
                                      editDataWorklogs.PrevReviewerId
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
                                    label="Prev. Reviewer"
                                  />
                                )}
                              />
                            </Grid>
                          )}
                      </>
                    )}
                  </Grid>
                )}
              </div>
            )}

            {(hasPermissionWorklog("Task/SubTask", "View", "WorkLogs") ||
              isDisabled) && (
              <div className="mt-14" id="tabpanel-1">
                <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                  <span className="flex items-center">
                    <TaskIcon />
                    <span className="ml-[21px]">Sub-Task</span>
                  </span>
                  <span className="flex items-center">
                    {onEdit > 0 &&
                      subTaskSwitchWorklogs &&
                      !isIdDisabled &&
                      !isDisabled && (
                        <Button
                          variant="contained"
                          className="rounded-[4px] !h-[36px] mr-6 !bg-secondary"
                          onClick={handleSubmitSubTaskWorklogs}
                        >
                          Update
                        </Button>
                      )}
                    {hasPermissionWorklog(
                      "Task/SubTask",
                      "Save",
                      "WorkLogs"
                    ) ? (
                      <Switch
                        checked={subTaskSwitchWorklogs}
                        disabled={isDisabled}
                        onChange={(e) => {
                          setSubTaskSwitchWorklogs(e.target.checked);
                          onEdit === 0 &&
                            setSubTaskFieldsWorklogs([
                              {
                                SubtaskId: 0,
                                Title: "",
                                Description: "",
                              },
                            ]);
                          onEdit === 0 && setTaskNameWorklogsErr([false]);
                          onEdit === 0 &&
                            setSubTaskDescriptionWorklogsErr([false]);
                          onEdit === 0 && setDeletedSubTaskWorklogs([]);
                        }}
                      />
                    ) : (
                      <></>
                    )}
                    <span
                      className={`cursor-pointer ${
                        subTaskWorklogsDrawer ? "rotate-180" : ""
                      }`}
                      onClick={() =>
                        setSubTaskWorklogsDrawer(!subTaskWorklogsDrawer)
                      }
                    >
                      <ChevronDownIcon />
                    </span>
                  </span>
                </div>
                {subTaskWorklogsDrawer && (
                  <div className="mt-3 pl-6">
                    {subTaskFieldsWorklogs.map((field, index) => (
                      <div className="w-[100%] flex" key={index}>
                        <TextField
                          label={
                            <span>
                              Task Name
                              <span className="!text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                          fullWidth
                          disabled={
                            !subTaskSwitchWorklogs || isIdDisabled || isDisabled
                          }
                          value={field.Title}
                          onChange={(e) =>
                            handleSubTaskChangeWorklogs(e.target.value, index)
                          }
                          onBlur={(e) => {
                            if (
                              e.target.value.trim().length > 5 &&
                              e.target.value.trim().length <= 50
                            ) {
                              const newTaskNameWorklogsErrors = [
                                ...taskNameWorklogsErr,
                              ];
                              newTaskNameWorklogsErrors[index] = false;
                              setTaskNameWorklogsErr(newTaskNameWorklogsErrors);
                            }
                          }}
                          error={taskNameWorklogsErr[index]}
                          helperText={
                            taskNameWorklogsErr[index] &&
                            field.Title.length > 0 &&
                            field.Title.length < 5
                              ? "Minumum 5 characters required."
                              : taskNameWorklogsErr[index] &&
                                field.Title.length > 50
                              ? "Maximum 50 characters allowed."
                              : taskNameWorklogsErr[index]
                              ? "This is a required field."
                              : ""
                          }
                          margin="normal"
                          variant="standard"
                          sx={{ mx: 0.75, maxWidth: 300, mt: 0 }}
                        />
                        <TextField
                          label={
                            <span>
                              Description
                              <span className="!text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                          fullWidth
                          disabled={
                            !subTaskSwitchWorklogs || isIdDisabled || isDisabled
                          }
                          value={field.Description}
                          onChange={(e) =>
                            handleSubTaskDescriptionChangeWorklogs(
                              e.target.value,
                              index
                            )
                          }
                          onBlur={(e) => {
                            if (
                              e.target.value.trim().length > 0 &&
                              e.target.value.trim().length <= 500
                            ) {
                              const newSubTaskDescErrors = [
                                ...subTaskDescriptionWorklogsErr,
                              ];
                              newSubTaskDescErrors[index] = false;
                              setSubTaskDescriptionWorklogsErr(
                                newSubTaskDescErrors
                              );
                            }
                          }}
                          error={subTaskDescriptionWorklogsErr[index]}
                          helperText={
                            subTaskDescriptionWorklogsErr[index] &&
                            field.Description.length > 500
                              ? "Maximum 500 characters allowed."
                              : subTaskDescriptionWorklogsErr[index]
                              ? "This is a required field."
                              : ""
                          }
                          margin="normal"
                          variant="standard"
                          sx={{ mx: 0.75, maxWidth: 300, mt: 0 }}
                        />
                        {index === 0
                          ? !isIdDisabled &&
                            !isDisabled &&
                            subTaskSwitchWorklogs && (
                              <span
                                className="cursor-pointer"
                                onClick={
                                  hasPermissionWorklog(
                                    "Task/SubTask",
                                    "Save",
                                    "WorkLogs"
                                  )
                                    ? () => addTaskFieldWorklogs()
                                    : undefined
                                }
                              >
                                <svg
                                  className="MuiSvgIcon-root !w-[24px] !h-[24px] !mt-[24px]  mx-[10px] MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root"
                                  focusable="false"
                                  aria-hidden="true"
                                  viewBox="0 0 24 24"
                                  data-testid="AddIcon"
                                >
                                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
                                </svg>
                              </span>
                            )
                          : !isIdDisabled &&
                            !isDisabled &&
                            subTaskSwitchWorklogs && (
                              <span
                                className="cursor-pointer"
                                onClick={
                                  hasPermissionWorklog(
                                    "Task/SubTask",
                                    "Delete",
                                    "WorkLogs"
                                  ) &&
                                  hasPermissionWorklog(
                                    "Task/SubTask",
                                    "Save",
                                    "WorkLogs"
                                  )
                                    ? () => removeTaskFieldWorklogs(index)
                                    : undefined
                                }
                              >
                                <svg
                                  className="MuiSvgIcon-root !w-[24px] !h-[24px] !mt-[24px]  mx-[10px] MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root"
                                  focusable="false"
                                  aria-hidden="true"
                                  viewBox="0 0 24 24"
                                  data-testid="RemoveIcon"
                                >
                                  <path d="M19 13H5v-2h14v2z"></path>
                                </svg>
                              </span>
                            )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {onEdit > 0 &&
              (hasPermissionWorklog("CheckList", "View", "WorkLogs") ||
                isDisabled) && (
                <div className="mt-14" id={`${onEdit > 0 && "tabpanel-2"}`}>
                  <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                    <span className="flex items-center">
                      <CheckListIcon />
                      <span className="ml-[21px]">Checklist</span>
                    </span>
                    <span
                      className={`cursor-pointer ${
                        checkListWorklogsDrawer ? "rotate-180" : ""
                      }`}
                      onClick={() =>
                        setCheckListWorklogsDrawer(!checkListWorklogsDrawer)
                      }
                    >
                      <ChevronDownIcon />
                    </span>
                  </div>
                  <div className="pl-12 mt-5">
                    {checkListWorklogsDrawer &&
                      checkListDataWorklogs?.length > 0 &&
                      checkListDataWorklogs.map((i: any, index: number) => (
                        <div className="mt-3" key={i.Category + index}>
                          <span className="flex items-center">
                            <span onClick={() => toggleGeneralOpen(index)}>
                              {itemStatesWorklogs[index] ? (
                                <RemoveIcon />
                              ) : (
                                <AddIcon />
                              )}
                            </span>
                            <span className="text-large font-semibold mr-6">
                              {i.Category}
                            </span>
                            {/* <ThreeDotIcon /> */}
                          </span>
                          {itemStatesWorklogs[index] && (
                            <FormGroup className="ml-8 mt-2">
                              {i.Activities.map((j: any, index: number) => (
                                <FormControlLabel
                                  key={j.IsCheck + index}
                                  disabled={
                                    isIdDisabled ||
                                    isUnassigneeClicked ||
                                    isDisabled
                                  }
                                  control={
                                    <Checkbox
                                      checked={j.IsCheck}
                                      onChange={(e) =>
                                        hasPermissionWorklog(
                                          "CheckList",
                                          "save",
                                          "WorkLogs"
                                        ) &&
                                        handleChangeChecklistWorklogs(
                                          i.Category,
                                          e.target.checked,
                                          j.Title
                                        )
                                      }
                                    />
                                  }
                                  label={j.Title}
                                />
                              ))}
                            </FormGroup>
                          )}
                          {hasPermissionWorklog(
                            "CheckList",
                            "save",
                            "WorkLogs"
                          ) &&
                            itemStatesWorklogs[index] &&
                            !itemStatesWorklogs[`addChecklistField_${index}`] &&
                            !isIdDisabled &&
                            !isDisabled &&
                            !isUnassigneeClicked && (
                              <span
                                className="flex items-center gap-3 ml-8 cursor-pointer text-[#6E6D7A]"
                                onClick={() => toggleAddChecklistField(index)}
                              >
                                <AddIcon /> Add new checklist item
                              </span>
                            )}
                          {itemStatesWorklogs[index] &&
                            itemStatesWorklogs[
                              `addChecklistField_${index}`
                            ] && (
                              <>
                                <TextField
                                  label={
                                    <span>
                                      Add Name
                                      <span className="text-defaultRed">
                                        &nbsp;*
                                      </span>
                                    </span>
                                  }
                                  fullWidth
                                  className="ml-8"
                                  value={
                                    checkListNameWorklogs?.trim().length <= 0
                                      ? ""
                                      : checkListNameWorklogs
                                  }
                                  disabled={isDisabled}
                                  onChange={(e) => {
                                    setCheckListNameWorklogs(e.target.value);
                                    setCheckListNameWorklogsError(false);
                                  }}
                                  onBlur={(e) => {
                                    if (e.target.value.trim().length > 5) {
                                      setCheckListNameWorklogsError(false);
                                    }
                                    if (
                                      e.target.value.trim().length > 5 &&
                                      e.target.value.trim().length < 500
                                    ) {
                                      setCheckListNameWorklogsError(false);
                                    }
                                  }}
                                  error={checkListNameWorklogsError}
                                  helperText={
                                    checkListNameWorklogsError &&
                                    checkListNameWorklogs.trim().length > 0 &&
                                    checkListNameWorklogs.trim().length < 5
                                      ? "Minimum 5 characters required."
                                      : checkListNameWorklogsError &&
                                        checkListNameWorklogs.trim().length >
                                          500
                                      ? "Maximum 500 characters allowed."
                                      : checkListNameWorklogsError
                                      ? "This is a required field."
                                      : ""
                                  }
                                  margin="normal"
                                  variant="standard"
                                  sx={{ mx: 0.75, maxWidth: 300, mt: 0 }}
                                />
                                <Button
                                  type="button"
                                  variant="contained"
                                  className="rounded-[4px] !h-[36px] mr-6 !bg-secondary mt-2"
                                  onClick={() =>
                                    !isDisabled &&
                                    handleSaveCheckListNameWorklogs(
                                      i.Category,
                                      index
                                    )
                                  }
                                >
                                  <span className="flex items-center justify-center gap-[10px] px-[5px]">
                                    Save
                                  </span>
                                </Button>
                              </>
                            )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {onEdit > 0 &&
              (hasPermissionWorklog("Comment", "View", "WorkLogs") ||
                isDisabled) && (
                <div className="mt-14" id={`${onEdit > 0 && "tabpanel-3"}`}>
                  <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                    <span className="flex items-center">
                      <CommentsIcon />
                      <span className="ml-[21px]">Comments</span>
                      <FormControl
                        variant="standard"
                        sx={{ mx: 0.75, minWidth: 100, ml: 5 }}
                      >
                        <Select
                          labelId="demo-simple-select-standard-label"
                          id="demo-simple-select-standard"
                          disabled={isUnassigneeClicked}
                          value={commentSelectWorklogs}
                          onChange={(e) => {
                            setCommentSelectWorklogs(Number(e.target.value));
                            getCommentDataWorklogs(Number(e.target.value));
                          }}
                        >
                          <MenuItem value={1}>Internal</MenuItem>
                          <MenuItem value={2}>External</MenuItem>
                        </Select>
                      </FormControl>
                    </span>
                    <span
                      className={`cursor-pointer ${
                        commentsWorklogsDrawer ? "rotate-180" : ""
                      }`}
                      onClick={() =>
                        setCommentsWorklogsDrawer(!commentsWorklogsDrawer)
                      }
                    >
                      <ChevronDownIcon />
                    </span>
                  </div>
                  <div className="my-5 px-16">
                    <div className="flex flex-col gap-4">
                      {commentsWorklogsDrawer &&
                        commentDataWorklogs.length > 0 &&
                        commentDataWorklogs.map(
                          (i: CommentGetByWorkitem, index: number) => (
                            <div
                              className="flex gap-4"
                              key={i.UserName + index}
                            >
                              {i.UserName.length > 0 ? (
                                <Avatar>
                                  {i.UserName.split(" ")
                                    .map((word: string) =>
                                      word.charAt(0).toUpperCase()
                                    )
                                    .join("")}
                                </Avatar>
                              ) : (
                                <Avatar sx={{ width: 32, height: 32 }} />
                              )}
                              <div>
                                <Typography>{i.UserName}</Typography>
                                <Typography>
                                  {i.SubmitedDate},&nbsp;
                                  {new Date(
                                    `1970-01-01T${i.SubmitedTime}:00Z`
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </Typography>
                                <div className="flex items-center gap-2">
                                  {editingCommentIndexWorklogs === index ? (
                                    <div className="flex items-start gap-8">
                                      <div className="flex flex-col">
                                        <div className="flex items-start justify-start">
                                          <MentionsInput
                                            style={mentionsInputStyle}
                                            className="!w-[100%] textareaOutlineNoneEdit max-w-[60vw]"
                                            value={valueEditWorklogs}
                                            onChange={(e) => {
                                              setValueEditWorklogs(
                                                e.target.value
                                              );
                                              setValueEditWorklogsError(false);
                                              handleCommentChangeWorklogs(
                                                e.target.value
                                              );
                                            }}
                                            placeholder="Type a next message OR type @ if you want to mention anyone in the message."
                                          >
                                            <Mention
                                              data={usersWorklogs}
                                              style={{
                                                backgroundColor: "#cee4e5",
                                              }}
                                              trigger="@"
                                            />
                                          </MentionsInput>
                                          <div className="flex flex-col">
                                            <div className="flex">
                                              <ImageUploader
                                                className="!mt-0"
                                                getData={(
                                                  data1: string,
                                                  data2: string
                                                ) =>
                                                  handleCommentAttachmentsChangeWorklogs(
                                                    data1,
                                                    data2,
                                                    commentAttachmentWorklogs
                                                  )
                                                }
                                                isDisable={false}
                                                fileHasError={(
                                                  error: boolean
                                                ) => setFileEditHasError(error)}
                                              />
                                            </div>
                                          </div>
                                          {commentAttachmentWorklogs[0]
                                            ?.SystemFileName.length > 0 && (
                                            <div className="flex items-start justify-center">
                                              <span className="ml-2 cursor-pointer">
                                                {
                                                  commentAttachmentWorklogs[0]
                                                    ?.UserFileName
                                                }
                                              </span>
                                              <span
                                                onClick={() =>
                                                  getFileFromBlob(
                                                    commentAttachmentWorklogs[0]
                                                      ?.SystemFileName,
                                                    commentAttachmentWorklogs[0]
                                                      ?.UserFileName
                                                  )
                                                }
                                              >
                                                <ColorToolTip
                                                  title="Download"
                                                  placement="top"
                                                  arrow
                                                >
                                                  <Download />
                                                </ColorToolTip>
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex flex-col">
                                          {valueEditWorklogsError && (
                                            <span className="text-defaultRed text-[14px]">
                                              This is a required field.
                                            </span>
                                          )}
                                          {!valueEditWorklogsError &&
                                            fileEditHasError && (
                                              <span className="text-defaultRed text-[14px]">
                                                File size shouldn&apos;t be more
                                                than 5MB.
                                              </span>
                                            )}
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        className="!bg-secondary text-white border rounded-md px-[4px]"
                                        onClick={(e) =>
                                          handleSaveClickWorklogs(
                                            e,
                                            i,
                                            commentSelectWorklogs
                                          )
                                        }
                                      >
                                        <Save className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-start justify-start gap-8">
                                      <span className="hidden"></span>
                                      <div className="max-w-[60vw]">
                                        {extractText(i.Message).map(
                                          (i: string) => {
                                            const assignee =
                                              commentWorklogsUserData.map(
                                                (j: LabelValue) => j.label
                                              );
                                            return assignee.includes(i) ? (
                                              <span
                                                className="text-secondary"
                                                key={index}
                                              >
                                                &nbsp; {i} &nbsp;
                                              </span>
                                            ) : (
                                              i
                                            );
                                          }
                                        )}
                                      </div>
                                      {i.Attachment[0]?.SystemFileName.length >
                                        0 && (
                                        <div className="flex items-start justify-center">
                                          <span className="ml-2 cursor-pointer">
                                            {i.Attachment[0]?.UserFileName}
                                          </span>
                                          <span
                                            onClick={() =>
                                              getFileFromBlob(
                                                i.Attachment[0]?.SystemFileName,
                                                i.Attachment[0]?.UserFileName
                                              )
                                            }
                                          >
                                            <ColorToolTip
                                              title="Download"
                                              placement="top"
                                              arrow
                                            >
                                              <Download />
                                            </ColorToolTip>
                                          </span>
                                        </div>
                                      )}
                                      {userId === i.UserId &&
                                        (hasPermissionWorklog(
                                          "Comment",
                                          "save",
                                          "WorkLogs"
                                        ) ||
                                          isDisabled) && (
                                          <button
                                            type="button"
                                            className="flex items-start !bg-secondary text-white border rounded-md p-[4px]"
                                            onClick={() => {
                                              handleEditClickWorklogs(
                                                index,
                                                i.Message
                                              );
                                              setCommentAttachmentWorklogs([
                                                {
                                                  AttachmentId:
                                                    i.Attachment[0]
                                                      .AttachmentId,
                                                  UserFileName:
                                                    i.Attachment[0]
                                                      .UserFileName,
                                                  SystemFileName:
                                                    i.Attachment[0]
                                                      .SystemFileName,
                                                  AttachmentPath:
                                                    process.env.attachment ||
                                                    "",
                                                },
                                              ]);
                                            }}
                                          >
                                            <EditIcon className="h-4 w-4" />
                                          </button>
                                        )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                  {commentsWorklogsDrawer &&
                    (hasPermissionWorklog("Comment", "save", "WorkLogs") ||
                      isDisabled) && (
                      <>
                        <div className="border border-slatyGrey gap-2 py-2 rounded-lg my-2 ml-16 mr-8 flex items-center justify-center">
                          <MentionsInput
                            style={mentionsInputStyle}
                            className="!w-[92%] textareaOutlineNone"
                            disabled={isUnassigneeClicked}
                            value={valueWorklogs}
                            onChange={(e) => {
                              setValueWorklogs(e.target.value);
                              setValueWorklogsError(false);
                              handleCommentChangeWorklogs(e.target.value);
                            }}
                            placeholder="Type a next message OR type @ if you want to mention anyone in the message."
                          >
                            <Mention
                              data={usersWorklogs}
                              style={{ backgroundColor: "#cee4e5" }}
                              trigger="@"
                            />
                          </MentionsInput>
                          <div className="flex flex-col">
                            <div className="flex">
                              <ImageUploader
                                className="!mt-0"
                                getData={(data1: string, data2: string) =>
                                  handleCommentAttachmentsChangeWorklogs(
                                    data1,
                                    data2,
                                    commentAttachmentWorklogs
                                  )
                                }
                                isDisable={isUnassigneeClicked}
                                fileHasError={(error: boolean) =>
                                  setFileHasError(error)
                                }
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            className={`${
                              isUnassigneeClicked
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            } !bg-secondary  text-white p-[6px] rounded-md mr-2`}
                            disabled={isUnassigneeClicked}
                            onClick={(e) =>
                              handleSubmitCommentWorklogs(
                                e,
                                commentSelectWorklogs
                              )
                            }
                          >
                            <SendIcon />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            {valueWorklogsError &&
                            valueWorklogs.trim().length > 1 &&
                            valueWorklogs.trim().length < 5 ? (
                              <span className="text-defaultRed text-[14px] ml-20">
                                Minimum 5 characters required.
                              </span>
                            ) : valueWorklogsError ? (
                              <span className="text-defaultRed text-[14px] ml-20">
                                This is a required field.
                              </span>
                            ) : !valueWorklogsError && fileHasError ? (
                              <span className="text-defaultRed text-[14px] ml-20">
                                File size shouldn&apos;t be more than 5MB.
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                          {commentAttachmentWorklogs[0].AttachmentId === 0 &&
                            commentAttachmentWorklogs[0]?.SystemFileName
                              .length > 0 && (
                              <div className="flex items-center justify-center gap-2 mr-6">
                                <span className="mt-6 ml-2 cursor-pointer">
                                  {commentAttachmentWorklogs[0]?.UserFileName}
                                </span>
                                <span
                                  className="mt-6"
                                  onClick={() =>
                                    getFileFromBlob(
                                      commentAttachmentWorklogs[0]
                                        ?.SystemFileName,
                                      commentAttachmentWorklogs[0]?.UserFileName
                                    )
                                  }
                                >
                                  <ColorToolTip
                                    title="Download"
                                    placement="top"
                                    arrow
                                  >
                                    <Download />
                                  </ColorToolTip>
                                </span>
                              </div>
                            )}
                        </div>
                      </>
                    )}
                </div>
              )}

            {(hasPermissionWorklog("Reccuring", "View", "WorkLogs") ||
              isDisabled) && (
              <div
                className="mt-14"
                id={`${onEdit > 0 ? "tabpanel-4" : "tabpanel-2"}`}
              >
                <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                  <span className="flex items-center">
                    <HistoryIcon />
                    <span className="ml-[21px]">Recurring</span>
                  </span>
                  <span className="flex items-center">
                    {onEdit > 0 &&
                      recurringSwitch &&
                      !isIdDisabled &&
                      !isDisabled &&
                      !isUnassigneeClicked && (
                        <Button
                          variant="contained"
                          className="rounded-[4px] !h-[36px] mr-6 !bg-secondary"
                          onClick={handleSubmitRecurringWorklogs}
                        >
                          Update
                        </Button>
                      )}
                    {hasPermissionWorklog("Reccuring", "Save", "WorkLogs") ? (
                      <Switch
                        checked={recurringSwitch}
                        disabled={isDisabled}
                        onChange={(e) => {
                          setRecurringSwitch(e.target.checked);
                          setRecurringStartDate("");
                          setRecurringStartDateErr(false);
                          setRecurringEndDate("");
                          setRecurringEndDateErr(false);
                          setRecurringTime(1);
                        }}
                      />
                    ) : (
                      <></>
                    )}
                    <span
                      className={`cursor-pointer ${
                        recurringWorklogsDrawer ? "rotate-180" : ""
                      }`}
                      onClick={() =>
                        setRecurringWorklogsDrawer(!recurringWorklogsDrawer)
                      }
                    >
                      <ChevronDownIcon />
                    </span>
                  </span>
                </div>
                {recurringWorklogsDrawer && (
                  <>
                    <div className="mt-0 pl-6">
                      <div
                        className={`inline-flex mt-[12px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px] ${
                          recurringStartDateErr ? "datepickerError" : ""
                        }`}
                      >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label={
                              <span>
                                Start Date
                                <span className="!text-defaultRed">
                                  &nbsp;*
                                </span>
                              </span>
                            }
                            disabled={
                              !recurringSwitch ||
                              isIdDisabled ||
                              isDisabled ||
                              isUnassigneeClicked
                            }
                            onError={() => setRecurringStartDateErr(false)}
                            minDate={dayjs(receiverDateWorklogs)}
                            maxDate={dayjs(recurringEndDate)}
                            value={
                              recurringStartDate === ""
                                ? null
                                : dayjs(recurringStartDate)
                            }
                            onChange={(newDate: any) => {
                              setRecurringStartDate(newDate.$d);
                              setRecurringStartDateErr(false);
                            }}
                            slotProps={{
                              textField: {
                                helperText: recurringStartDateErr
                                  ? "This is a required field."
                                  : "",
                                readOnly: true,
                              } as Record<string, any>,
                            }}
                          />
                        </LocalizationProvider>
                      </div>
                      <div
                        className={`inline-flex mt-[12px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px] ${
                          recurringEndDateErr ? "datepickerError" : ""
                        }`}
                      >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label={
                              <span>
                                End Date
                                <span className="!text-defaultRed">
                                  &nbsp;*
                                </span>
                              </span>
                            }
                            minDate={dayjs(receiverDateWorklogs)}
                            disabled={
                              !recurringSwitch ||
                              isIdDisabled ||
                              isDisabled ||
                              isUnassigneeClicked
                            }
                            onError={() => setRecurringEndDateErr(false)}
                            value={
                              recurringEndDate === ""
                                ? null
                                : dayjs(recurringEndDate)
                            }
                            onChange={(newDate: any) => {
                              setRecurringEndDate(newDate.$d);
                              setRecurringEndDateErr(false);
                            }}
                            slotProps={{
                              textField: {
                                helperText: recurringEndDateErr
                                  ? "This is a required field."
                                  : "",
                                readOnly: true,
                              } as Record<string, any>,
                            }}
                          />
                        </LocalizationProvider>
                      </div>
                    </div>
                    <div className="mt-0 pl-6">
                      <FormControl
                        variant="standard"
                        sx={{ mx: 0.75, minWidth: 145 }}
                        disabled={
                          !recurringSwitch ||
                          isIdDisabled ||
                          isDisabled ||
                          isUnassigneeClicked
                        }
                      >
                        <InputLabel id="demo-simple-select-standard-label">
                          {recurringTime === 1 ? (
                            <span>
                              Day
                              <span className="text-defaultRed">&nbsp;*</span>
                            </span>
                          ) : recurringTime === 2 ? (
                            <span>
                              Week
                              <span className="text-defaultRed">&nbsp;*</span>
                            </span>
                          ) : (
                            <span>
                              Month
                              <span className="text-defaultRed">&nbsp;*</span>
                            </span>
                          )}
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-standard-label"
                          id="demo-simple-select-standard"
                          value={recurringTime === 0 ? "" : recurringTime}
                          onChange={(e) => {
                            setRecurringTime(Number(e.target.value));
                            setRecurringMonth(0);
                            setSelectedDays([]);
                            setRecurringWeekErr(false);
                          }}
                        >
                          <MenuItem value={1}>Day</MenuItem>
                          <MenuItem value={2}>Week</MenuItem>
                          <MenuItem value={3}>Month</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                    {recurringTime === 2 && (
                      <div className="pl-4 m-2 flex">
                        {days.map((day, index) => (
                          <div
                            key={index}
                            className={`px-3 py-1 rounded-[50%] m-[5px] ${
                              selectedDays.includes(index)
                                ? "text-pureWhite bg-secondary"
                                : "text-slatyGrey"
                            }`}
                            onClick={() => toggleColor(index)}
                          >
                            {day[0]}
                          </div>
                        ))}
                      </div>
                    )}
                    {recurringTime === 3 && (
                      <div className="mt-[10px] pl-6">
                        <Autocomplete
                          multiple
                          limitTags={2}
                          id="checkboxes-tags-demo"
                          options={Array.isArray(months) ? months : []}
                          value={
                            Array.isArray(recurringMonth) ? recurringMonth : []
                          }
                          getOptionLabel={(option) => option.label}
                          disableCloseOnSelect
                          disabled={
                            isIdDisabled || isUnassigneeClicked || isDisabled
                          }
                          onChange={handleMultiSelectMonth}
                          style={{ width: 500 }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={
                                <span>
                                  Month
                                  <span className="text-defaultRed">
                                    &nbsp;*
                                  </span>
                                </span>
                              }
                              placeholder="Please Select..."
                              variant="standard"
                              error={recurringMonthErr}
                              onBlur={() => {
                                if (recurringMonth.length > 0) {
                                  setRecurringMonthErr(false);
                                }
                              }}
                              helperText={
                                recurringMonthErr
                                  ? "This is a required field."
                                  : ""
                              }
                            />
                          )}
                          sx={{ mx: 0.75, maxWidth: 350, mt: 2 }}
                        />
                      </div>
                    )}
                    <span
                      className={`flex flex-col items-start ${
                        recurringTime === 3 && "mt-2"
                      }`}
                    >
                      {recurringWeekErr && (
                        <span className="text-defaultRed ml-8 text-sm p-0">
                          Please Select day.
                        </span>
                      )}
                      <span className="text-darkCharcoal ml-8 text-[14px]">
                        {recurringTime === 1
                          ? "Occurs every day"
                          : recurringTime === 2
                          ? `Occurs every ${selectedDays
                              .sort()
                              .map(
                                (day: number) => " " + days[day]
                              )} starting from today`
                          : recurringTime === 3 &&
                            "Occurs every month starting from today"}
                      </span>
                    </span>
                  </>
                )}
              </div>
            )}

            {(hasPermissionWorklog("", "Approve", "QA") || !isDisabled) && (
              <div
                className="mt-14"
                id={`${onEdit > 0 ? "tabpanel-5" : "tabpanel-3"}`}
              >
                <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                  <span className="flex items-center">
                    <ClockIcon />
                    <span className="ml-[21px]">Manual Time</span>
                  </span>
                  <span className="flex items-center">
                    {onEdit > 0 &&
                      manualSwitchWorklogs &&
                      !isIdDisabled &&
                      !isUnassigneeClicked && (
                        <Button
                          variant="contained"
                          className={`rounded-[4px] !h-[36px] mr-6 ${
                            manualSubmitWorklogsDisable ? "" : "!bg-secondary"
                          }`}
                          disabled={manualSubmitWorklogsDisable}
                          onClick={
                            manualSubmitWorklogsDisable
                              ? undefined
                              : handleSubmitManualWorklogs
                          }
                        >
                          Update
                        </Button>
                      )}
                    <Switch
                      checked={manualSwitchWorklogs}
                      onChange={(e) => {
                        setManualSwitchWorklogs(e.target.checked);
                        setManualFieldsWorklogs([
                          {
                            AssigneeId: 0,
                            Id: 0,
                            inputDate: "",
                            startTime: 0,
                            manualDesc: "",
                            IsApproved: false,
                          },
                        ]);
                        setInputDateWorklogsErrors([false]);
                        setStartTimeWorklogsErrors([false]);
                        setManualDescWorklogsErrors([false]);
                        setInputTypeWorklogsDate(["text"]);
                        setManualDisableData([
                          {
                            AssigneeId: 0,
                            Id: 0,
                            inputDate: "",
                            startTime: 0,
                            manualDesc: "",
                            IsApproved: false,
                          },
                        ]);
                      }}
                    />
                    <span
                      className={`cursor-pointer ${
                        manualTimeWorklogsDrawer ? "rotate-180" : ""
                      }`}
                      onClick={() =>
                        setManualTimeWorklogsDrawer(!manualTimeWorklogsDrawer)
                      }
                    >
                      <ChevronDownIcon />
                    </span>
                  </span>
                </div>
                {manualTimeWorklogsDrawer && (
                  <>
                    <div className="-mt-2 pl-6">
                      {manualFieldsWorklogs.map((field, index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className={`inline-flex mt-[12px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[230px] ${
                              inputDateWorklogsErrors[index]
                                ? "datepickerError"
                                : ""
                            }`}
                          >
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DatePicker
                                label={
                                  <span>
                                    Date
                                    <span className="!text-defaultRed">
                                      &nbsp;*
                                    </span>
                                  </span>
                                }
                                minDate={
                                  !manualSwitchWorklogs ||
                                  field.IsApproved ||
                                  (field.AssigneeId !== 0 &&
                                    field.AssigneeId !== userId) ||
                                  isIdDisabled ||
                                  isUnassigneeClicked
                                    ? ""
                                    : dayjs(receiverDateWorklogs) >
                                      dayjs(reviewerDate)
                                    ? dayjs(new Date())
                                    : dayjs(reviewerDate)
                                }
                                maxDate={dayjs(new Date())}
                                disabled={
                                  !manualSwitchWorklogs ||
                                  field.IsApproved ||
                                  (field.AssigneeId !== 0 &&
                                    field.AssigneeId !== userId) ||
                                  isIdDisabled ||
                                  isUnassigneeClicked
                                }
                                onError={() => {
                                  if (
                                    field.inputDate[index]?.trim().length > 0
                                  ) {
                                    const newInputDateWorklogsErrors = [
                                      ...inputDateWorklogsErrors,
                                    ];
                                    newInputDateWorklogsErrors[index] = false;
                                    setInputDateWorklogsErrors(
                                      newInputDateWorklogsErrors
                                    );
                                  }
                                }}
                                value={
                                  field.inputDate === ""
                                    ? null
                                    : dayjs(field.inputDate)
                                }
                                onChange={(newDate: any) => {
                                  handleInputDateChangeWorklogs(
                                    newDate.$d,
                                    index
                                  );
                                }}
                                slotProps={{
                                  textField: {
                                    helperText: inputDateWorklogsErrors[index]
                                      ? "This is a required field."
                                      : "",
                                    readOnly: true,
                                  } as Record<string, any>,
                                }}
                              />
                            </LocalizationProvider>
                          </div>
                          <TextField
                            label={
                              <span>
                                Time in Minute
                                <span className="!text-defaultRed">
                                  &nbsp;*
                                </span>
                              </span>
                            }
                            placeholder="000"
                            disabled={
                              !manualSwitchWorklogs ||
                              field.IsApproved ||
                              (field.AssigneeId !== 0 &&
                                field.AssigneeId !== userId) ||
                              isIdDisabled ||
                              isUnassigneeClicked
                            }
                            fullWidth
                            value={field.startTime === 0 ? "" : field.startTime}
                            onChange={(e) =>
                              handleStartTimeChangeWorklogs(
                                e.target.value,
                                index
                              )
                            }
                            onBlur={(e) => {
                              if (
                                e.target.value.trim().length === 0 ||
                                e.target.value.trim().length > 3 ||
                                e.target.value.trim().toString() == "0" ||
                                e.target.value.trim().toString() == "00" ||
                                e.target.value.trim().toString() == "000" ||
                                Number(e.target.value.trim()) > 480
                              ) {
                                const newStartTimeWorklogsErrors = [
                                  ...startTimeWorklogsErrors,
                                ];
                                newStartTimeWorklogsErrors[index] = true;
                                setStartTimeWorklogsErrors(
                                  newStartTimeWorklogsErrors
                                );
                              } else {
                                const newStartTimeWorklogsErrors = [
                                  ...startTimeWorklogsErrors,
                                ];
                                newStartTimeWorklogsErrors[index] = false;
                                setStartTimeWorklogsErrors(
                                  newStartTimeWorklogsErrors
                                );
                              }
                            }}
                            error={startTimeWorklogsErrors[index]}
                            helperText={
                              field.startTime?.toString().trim().length > 3 &&
                              startTimeWorklogsErrors[index]
                                ? "Maximum 3 characters allowed."
                                : field.startTime > 480 &&
                                  startTimeWorklogsErrors[index]
                                ? "Maximum 480 minutes allowed."
                                : (field.startTime.toString() == "0" ||
                                    field.startTime.toString() == "00" ||
                                    field.startTime.toString() == "000") &&
                                  startTimeWorklogsErrors[index]
                                ? "Please enter valid number."
                                : field.startTime.toString().trim().length <=
                                    0 && startTimeWorklogsErrors[index]
                                ? "This is a required field"
                                : ""
                            }
                            margin="normal"
                            variant="standard"
                            sx={{ mx: 0.75, maxWidth: 225 }}
                          />
                          <TextField
                            label={
                              <span>
                                Description
                                <span className="!text-defaultRed">
                                  &nbsp;*
                                </span>
                              </span>
                            }
                            className="mt-4"
                            disabled={
                              !manualSwitchWorklogs ||
                              field.IsApproved ||
                              (field.AssigneeId !== 0 &&
                                field.AssigneeId !== userId) ||
                              isIdDisabled ||
                              isUnassigneeClicked
                            }
                            fullWidth
                            value={field.manualDesc}
                            onChange={(e) =>
                              handleManualDescChangeWorklogs(
                                e.target.value,
                                index
                              )
                            }
                            onBlur={(e) => {
                              if (
                                e.target.value.trim().length < 1 ||
                                e.target.value.trim().length > 500
                              ) {
                                const newManualDescWorklogsErrors = [
                                  ...manualDescWorklogsErrors,
                                ];
                                newManualDescWorklogsErrors[index] = true;
                                setManualDescWorklogsErrors(
                                  newManualDescWorklogsErrors
                                );
                              } else {
                                const newManualDescWorklogsErrors = [
                                  ...manualDescWorklogsErrors,
                                ];
                                newManualDescWorklogsErrors[index] = false;
                                setManualDescWorklogsErrors(
                                  newManualDescWorklogsErrors
                                );
                              }
                            }}
                            error={manualDescWorklogsErrors[index]}
                            helperText={
                              manualDescWorklogsErrors[index] &&
                              field.manualDesc.length > 500
                                ? "Maximum 500 characters allowed."
                                : manualDescWorklogsErrors[index]
                                ? "This is a required field."
                                : ""
                            }
                            margin="normal"
                            variant="standard"
                            sx={{ mx: 0.75, maxWidth: 230, mt: 2 }}
                          />
                          <div className="flex items-center justify-center w-[50px]">
                            {index === 0 &&
                              manualSwitchWorklogs &&
                              !isIdDisabled &&
                              !isUnassigneeClicked &&
                              !field.IsApproved &&
                              field.Id > 0 && (
                                <span
                                  className="cursor-pointer"
                                  onClick={() =>
                                    removePhoneFieldWorklogs(index)
                                  }
                                >
                                  <svg
                                    className="MuiSvgIcon-root !w-[24px] !h-[24px] !mt-[24px] mx-[10px] MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root"
                                    focusable="false"
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    data-testid="RemoveIcon"
                                  >
                                    <path d="M19 13H5v-2h14v2z"></path>
                                  </svg>
                                </span>
                              )}
                            {index === 0 &&
                              manualSwitchWorklogs &&
                              !isIdDisabled &&
                              !isUnassigneeClicked && (
                                <span
                                  className="cursor-pointer"
                                  onClick={addManulaFieldWorklogs}
                                >
                                  <svg
                                    className="MuiSvgIcon-root !w-[24px] !h-[24px] !mt-[24px]  mx-[10px] MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root"
                                    focusable="false"
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    data-testid="AddIcon"
                                  >
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
                                  </svg>
                                </span>
                              )}
                          </div>
                          <div className="w-[50px] ml-[-35px]">
                            {index > 0 &&
                              manualSwitchWorklogs &&
                              !isIdDisabled &&
                              !isUnassigneeClicked &&
                              !field.IsApproved && (
                                <span
                                  className="cursor-pointer"
                                  onClick={() =>
                                    removePhoneFieldWorklogs(index)
                                  }
                                >
                                  <svg
                                    className="MuiSvgIcon-root !w-[24px] !h-[24px] !mt-[24px] MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root"
                                    focusable="false"
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    data-testid="RemoveIcon"
                                  >
                                    <path d="M19 13H5v-2h14v2z"></path>
                                  </svg>
                                </span>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {(hasPermissionWorklog("Reminder", "View", "WorkLogs") ||
              isDisabled) && (
              <div
                className="my-14"
                id={`${onEdit > 0 ? "tabpanel-6" : "tabpanel-4"}`}
              >
                <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                  <span className="flex items-center">
                    <BellIcon />
                    <span className="ml-[21px]">Reminder</span>
                  </span>
                  <span className="flex items-center">
                    {onEdit > 0 &&
                      reminderSwitch &&
                      !isIdDisabled &&
                      !isDisabled &&
                      !isUnassigneeClicked && (
                        <Button
                          variant="contained"
                          className="rounded-[4px] !h-[36px] mr-6 !bg-secondary"
                          onClick={handleSubmitReminderWorklogs}
                        >
                          Update
                        </Button>
                      )}
                    {hasPermissionWorklog("Reminder", "Save", "WorkLogs") ? (
                      <Switch
                        checked={reminderSwitch}
                        disabled={isDisabled}
                        onChange={(e) => {
                          setReminderSwitch(e.target.checked);
                          setReminderDate("");
                          setReminderDateErr(false);
                          setReminderTime(0);
                          setReminderTimeErr(false);
                          setReminderNotification(0);
                          setReminderNotificationErr(false);
                        }}
                      />
                    ) : (
                      <></>
                    )}
                    <span
                      className={`cursor-pointer ${
                        reminderWorklogsDrawer ? "rotate-180" : ""
                      }`}
                      onClick={() =>
                        setReminderWorklogsDrawer(!reminderWorklogsDrawer)
                      }
                    >
                      <ChevronDownIcon />
                    </span>
                  </span>
                </div>
                {reminderWorklogsDrawer && (
                  <>
                    <div className="mt-2 pl-6">
                      <RadioGroup
                        aria-labelledby="demo-radio-buttons-group-label"
                        defaultValue={reminderCheckboxValue}
                        name="radio-buttons-group"
                        row={true}
                        className="ml-2 gap-10"
                        onChange={(e) => {
                          setReminderCheckboxValue(parseInt(e.target.value));
                          onEdit === 0 && setReminderDate("");
                          setReminderDateErr(false);
                          onEdit === 0 && setReminderTime(0);
                          setReminderTimeErr(false);
                          onEdit === 0 && setReminderNotification(0);
                          setReminderNotificationErr(false);
                        }}
                      >
                        <FormControlLabel
                          disabled={
                            !reminderSwitch ||
                            isIdDisabled ||
                            isDisabled ||
                            isUnassigneeClicked
                          }
                          value={1}
                          checked={reminderCheckboxValue == 1}
                          control={<Radio />}
                          label="Due Date"
                        />
                        <FormControlLabel
                          disabled={
                            !reminderSwitch ||
                            isIdDisabled ||
                            isDisabled ||
                            isUnassigneeClicked
                          }
                          value={2}
                          checked={reminderCheckboxValue == 2}
                          control={<Radio />}
                          label="Specific Date"
                        />
                        <FormControlLabel
                          disabled={
                            !reminderSwitch ||
                            isIdDisabled ||
                            isDisabled ||
                            isUnassigneeClicked
                          }
                          value={3}
                          checked={reminderCheckboxValue == 3}
                          control={<Radio />}
                          label="Daily"
                        />
                        <FormControlLabel
                          disabled={
                            !reminderSwitch ||
                            isIdDisabled ||
                            isDisabled ||
                            isUnassigneeClicked
                          }
                          value={4}
                          checked={reminderCheckboxValue == 4}
                          control={<Radio />}
                          label="Days Before Due Date"
                        />
                      </RadioGroup>
                    </div>
                    <div className="pl-6 flex">
                      {reminderCheckboxValue === 2 && onEdit === 0 && (
                        <div
                          className={`inline-flex mt-[0px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px] ${
                            reminderDateErr ? "datepickerError" : ""
                          }`}
                        >
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label={
                                <span>
                                  Date
                                  <span className="!text-defaultRed">
                                    &nbsp;*
                                  </span>
                                </span>
                              }
                              disabled={
                                !reminderSwitch ||
                                isIdDisabled ||
                                isDisabled ||
                                isUnassigneeClicked
                              }
                              onError={() => setReminderDateErr(false)}
                              value={
                                reminderDate === "" ? null : dayjs(reminderDate)
                              }
                              onChange={(newDate: any) => {
                                setReminderDate(newDate.$d);
                                setReminderDateErr(false);
                              }}
                              slotProps={{
                                textField: {
                                  helperText: reminderDateErr
                                    ? "This is a required field."
                                    : "",
                                  readOnly: true,
                                } as Record<string, any>,
                              }}
                            />
                          </LocalizationProvider>
                        </div>
                      )}

                      {reminderCheckboxValue === 2 && onEdit > 0 && (
                        <div
                          className={`inline-flex mt-[0px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px] ${
                            reminderDateErr ? "datepickerError" : ""
                          }`}
                        >
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label={
                                <span>
                                  Date
                                  <span className="!text-defaultRed">
                                    &nbsp;*
                                  </span>
                                </span>
                              }
                              disabled={
                                !reminderSwitch ||
                                isIdDisabled ||
                                isDisabled ||
                                isUnassigneeClicked
                              }
                              onError={() => setReminderDateErr(false)}
                              value={
                                reminderDate === "" ? null : dayjs(reminderDate)
                              }
                              onChange={(newDate: any) => {
                                setReminderDate(newDate.$d);
                                setReminderDateErr(false);
                              }}
                              slotProps={{
                                textField: {
                                  helperText: reminderDateErr
                                    ? "This is a required field."
                                    : "",
                                  readOnly: true,
                                } as Record<string, any>,
                              }}
                            />
                          </LocalizationProvider>
                        </div>
                      )}

                      <FormControl
                        variant="standard"
                        sx={{ mx: 0.75, minWidth: 100 }}
                        error={reminderTimeErr}
                        disabled={
                          !reminderSwitch ||
                          isIdDisabled ||
                          isDisabled ||
                          isUnassigneeClicked
                        }
                      >
                        <InputLabel id="demo-simple-select-standard-label">
                          Hour
                          <span className="text-defaultRed">&nbsp;*</span>
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-standard-label"
                          id="demo-simple-select-standard"
                          value={reminderTime === 0 ? "" : reminderTime}
                          onChange={(e) =>
                            setReminderTime(Number(e.target.value))
                          }
                          onBlur={() => {
                            if (reminderTime > 0) {
                              setReminderTimeErr(false);
                            }
                          }}
                        >
                          {hours.map((i: LabelValue, index: number) => (
                            <MenuItem value={i.value} key={index}>
                              {i.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {reminderTimeErr && (
                          <FormHelperText>
                            This is a required field.
                          </FormHelperText>
                        )}
                      </FormControl>
                      <Autocomplete
                        multiple
                        limitTags={2}
                        id="checkboxes-tags-demo"
                        disabled={
                          !reminderSwitch ||
                          isIdDisabled ||
                          isDisabled ||
                          isUnassigneeClicked
                        }
                        options={
                          Array.isArray(assigneeWorklogsDropdownData)
                            ? assigneeWorklogsDropdownData
                            : []
                        }
                        value={
                          Array.isArray(reminderNotification)
                            ? reminderNotification
                            : []
                        }
                        getOptionLabel={(option) => option.label}
                        disableCloseOnSelect
                        onChange={handleMultiSelect}
                        style={{ width: 500 }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={
                              <span>
                                Notify user Associated with the task
                                <span className="text-defaultRed">&nbsp;*</span>
                              </span>
                            }
                            variant="standard"
                            error={reminderNotificationErr}
                            onBlur={() => {
                              if (reminderNotification.length > 0) {
                                setReminderNotificationErr(false);
                              }
                            }}
                            helperText={
                              reminderNotificationErr
                                ? "This is a required field."
                                : ""
                            }
                          />
                        )}
                        sx={{ mx: 0.75, maxWidth: 380, mt: 0.3 }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {hasPermissionWorklog("ErrorLog", "View", "WorkLogs") &&
              !isDisabled &&
              onEdit > 0 && (
                <div className="mt-14" id="tabpanel-7">
                  <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                    <span className="flex items-center">
                      <TaskIcon />
                      <span className="ml-[21px]">Error Logs</span>
                    </span>
                    <span
                      className={`cursor-pointer ${
                        reviewerErrWorklogsDrawer ? "rotate-180" : ""
                      }`}
                      onClick={() =>
                        setReviewerErrWorklogsDrawer(!reviewerErrWorklogsDrawer)
                      }
                    >
                      <ChevronDownIcon />
                    </span>
                  </div>
                  {reviewerErrWorklogsDrawer && (
                    <div className="mt-3 pl-6">
                      {errorLogFieldsWorklogs.length > 0 &&
                        errorLogFieldsWorklogs[0].SubmitedBy.length > 0 &&
                        errorLogFieldsWorklogs.map(
                          (i: ErrorlogGetByWorkitem, index: number) => (
                            <>
                              <div className="ml-1 mt-8">
                                <span className="font-bold">Correction By</span>
                                <span className="ml-3 mr-10 text-[14px]">
                                  {i.SubmitedBy}
                                </span>
                                <span className="font-bold">Reviewer Date</span>
                                <span className="ml-3">
                                  {i.SubmitedOn.split("/")[1]}-
                                  {i.SubmitedOn.split("/")[0]}-
                                  {i.SubmitedOn.split("/")[2]}
                                </span>
                              </div>
                              <div
                                className="w-[100%] mt-2 text-[14px]"
                                key={index}
                              >
                                <div
                                  className={`inline-flex mt-[8px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[230px] ${
                                    errorIdentificationErrWorklogs[index]
                                      ? "datepickerError"
                                      : ""
                                  }`}
                                >
                                  <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                  >
                                    <DatePicker
                                      label={
                                        <span>
                                          Error Identification Date
                                          <span className="text-defaultRed">
                                            &nbsp;*
                                          </span>
                                        </span>
                                      }
                                      maxDate={dayjs(new Date())}
                                      disabled={
                                        isIdDisabled || isUnassigneeClicked
                                      }
                                      value={
                                        i.ErrorIdentificationDate === ""
                                          ? null
                                          : dayjs(i.ErrorIdentificationDate)
                                      }
                                      onChange={(newDate: any) => {
                                        handleErrorIdentificationDateChange(
                                          newDate.$d,
                                          index
                                        );
                                      }}
                                      slotProps={{
                                        textField: {
                                          helperText:
                                            errorIdentificationErrWorklogs[
                                              index
                                            ]
                                              ? "This is a required field."
                                              : "",
                                          readOnly: true,
                                        } as Record<string, any>,
                                      }}
                                      readOnly={
                                        (!!i.ErrorIdentificationDate &&
                                          i.ErrorIdentificationDate !== null &&
                                          i.ErrorIdentificationDate !== "" &&
                                          i.ErrorIdentificationDate.toString().trim()
                                            .length > 0 &&
                                          i.ErrorType == 1) ||
                                        !i.IsHasErrorlogAddedByClient ||
                                        // i.Remark.trim().length <= 0 ||
                                        i.DisableErrorLog
                                      }
                                    />
                                  </LocalizationProvider>
                                </div>
                                <div
                                  className={`inline-flex mt-[4px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[230px] ${
                                    recordedDateErrWorklogs[index]
                                      ? "datepickerError"
                                      : ""
                                  }`}
                                >
                                  <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                  >
                                    <DatePicker
                                      label={
                                        <span>
                                          Transaction Rec. Date
                                          <span className="text-defaultRed">
                                            &nbsp;*
                                          </span>
                                        </span>
                                      }
                                      maxDate={dayjs(new Date())}
                                      disabled={
                                        isIdDisabled || isUnassigneeClicked
                                      }
                                      value={
                                        i.DateOfTransaction === ""
                                          ? null
                                          : dayjs(i.DateOfTransaction)
                                      }
                                      onChange={(newDate: any) => {
                                        handleDateOfTransactionChange(
                                          newDate.$d,
                                          index
                                        );
                                      }}
                                      readOnly={
                                        (!!i.DateOfTransaction &&
                                          i.DateOfTransaction !== null &&
                                          i.DateOfTransaction !== "" &&
                                          i.DateOfTransaction.toString().trim()
                                            .length > 0 &&
                                          i.ErrorType == 1) ||
                                        !i.IsHasErrorlogAddedByClient ||
                                        // i.Remark.trim().length <= 0 ||
                                        i.DisableErrorLog
                                      }
                                      slotProps={{
                                        textField: {
                                          helperText: recordedDateErrWorklogs[
                                            index
                                          ]
                                            ? "This is a required field."
                                            : "",
                                          readOnly: true,
                                        } as Record<string, any>,
                                      }}
                                    />
                                  </LocalizationProvider>
                                </div>
                                <FormControl
                                  variant="standard"
                                  sx={{ mx: 0.75, minWidth: 230, mt: 1 }}
                                  error={errorTypeWorklogsErr[index]}
                                  disabled={isIdDisabled || isUnassigneeClicked}
                                >
                                  <InputLabel id="demo-simple-select-standard-label">
                                    Error Type
                                    <span className="text-defaultRed">
                                      &nbsp;*
                                    </span>
                                  </InputLabel>
                                  <Select
                                    labelId="demo-simple-select-standard-label"
                                    id="demo-simple-select-standard"
                                    value={i.ErrorType === 0 ? "" : i.ErrorType}
                                    readOnly={
                                      i.ErrorType > 0 ||
                                      !i.IsHasErrorlogAddedByClient ||
                                      // i.Remark.trim().length <= 0 ||
                                      i.DisableErrorLog
                                    }
                                  >
                                    {errorTypeOptions.map((e: LabelValue) => (
                                      <MenuItem value={e.value} key={e.value}>
                                        {e.label}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                  {errorTypeWorklogsErr[index] && (
                                    <FormHelperText>
                                      This is a required field.
                                    </FormHelperText>
                                  )}
                                </FormControl>
                                {i.ErrorType === 2 && (
                                  <TextField
                                    label={
                                      <span>
                                        Error Identified by
                                        <span className="text-defaultRed">
                                          &nbsp;*
                                        </span>
                                      </span>
                                    }
                                    fullWidth
                                    disabled={
                                      isIdDisabled || isUnassigneeClicked
                                    }
                                    value={
                                      i.IdentifiedBy !== null &&
                                      i.IdentifiedBy.trim().length === 0
                                        ? ""
                                        : i.IdentifiedBy
                                    }
                                    onChange={(e) =>
                                      handleIdentifiedByChange(
                                        e.target.value,
                                        index,
                                        0
                                      )
                                    }
                                    onBlur={(e) => {
                                      if (
                                        e.target.value.length <= 0 ||
                                        e.target.value.length > 50
                                      ) {
                                        const newIdentifiedByErrors = [
                                          ...identifiedByErrWorklogs,
                                        ];
                                        newIdentifiedByErrors[index] = true;
                                        setIdentifiedByErrWorklogs(
                                          newIdentifiedByErrors
                                        );
                                      } else {
                                        const newIdentifiedByErrors = [
                                          ...identifiedByErrWorklogs,
                                        ];
                                        newIdentifiedByErrors[index] = false;
                                        setIdentifiedByErrWorklogs(
                                          newIdentifiedByErrors
                                        );
                                      }
                                    }}
                                    error={identifiedByErrWorklogs[index]}
                                    helperText={
                                      identifiedByErrWorklogs[index] &&
                                      i.IdentifiedBy !== null &&
                                      i.IdentifiedBy.trim().length > 50
                                        ? "Maximum 50 characters allowed."
                                        : identifiedByErrWorklogs[index]
                                        ? "This is a required field."
                                        : ""
                                    }
                                    margin="normal"
                                    variant="standard"
                                    sx={{ mx: 0.75, maxWidth: 230, mt: 1.5 }}
                                    InputProps={{
                                      readOnly:
                                        !i.IsHasErrorlogAddedByClient ||
                                        // i.Remark.trim().length <= 0 ||
                                        i.DisableErrorLog,
                                    }}
                                  />
                                )}
                                <FormControl
                                  variant="standard"
                                  sx={{
                                    mx: 0.75,
                                    minWidth: 250,
                                    maxWidth: 250,
                                    mt: 1,
                                  }}
                                  error={natureOfWorklogsErr[index]}
                                  disabled={isIdDisabled || isUnassigneeClicked}
                                >
                                  <InputLabel id="demo-simple-select-standard-label">
                                    Error Details
                                    <span className="text-defaultRed">
                                      &nbsp;*
                                    </span>
                                  </InputLabel>
                                  <Select
                                    labelId="demo-simple-select-standard-label"
                                    id="demo-simple-select-standard"
                                    value={
                                      i.NatureOfError === 0
                                        ? ""
                                        : i.NatureOfError
                                    }
                                    onChange={(e) =>
                                      handleNatureOfErrorChangeWorklogs(
                                        Number(e.target.value),
                                        index
                                      )
                                    }
                                    onBlur={() => {
                                      if (i.NatureOfError > 0) {
                                        const newNatureOfErrorErrors = [
                                          ...natureOfWorklogsErr,
                                        ];
                                        newNatureOfErrorErrors[index] = false;
                                        setNatureOfWorklogsErr(
                                          newNatureOfErrorErrors
                                        );
                                      }
                                    }}
                                    readOnly={
                                      (i.NatureOfError > 0 &&
                                        i.ErrorType == 1) ||
                                      !i.IsHasErrorlogAddedByClient ||
                                      // i.Remark.trim().length <= 0 ||
                                      i.DisableErrorLog
                                    }
                                  >
                                    {natureOfErrorDropdown.map(
                                      (n: LabelValueType) => (
                                        <MenuItem value={n.value} key={n.value}>
                                          {n.label}
                                        </MenuItem>
                                      )
                                    )}
                                  </Select>
                                  {natureOfWorklogsErr[index] && (
                                    <FormHelperText>
                                      This is a required field.
                                    </FormHelperText>
                                  )}
                                </FormControl>
                                <FormControl
                                  variant="standard"
                                  sx={{ mx: 0.75, minWidth: 230, mt: 1 }}
                                  error={rootCauseWorklogsErr[index]}
                                  disabled={isIdDisabled || isUnassigneeClicked}
                                >
                                  <InputLabel id="demo-simple-select-standard-label">
                                    Error Category
                                    <span className="text-defaultRed">
                                      &nbsp;*
                                    </span>
                                  </InputLabel>
                                  <Select
                                    labelId="demo-simple-select-standard-label"
                                    id="demo-simple-select-standard"
                                    value={i.RootCause === 0 ? "" : i.RootCause}
                                    onChange={(e) =>
                                      handleRootCauseChangeWorklogs(
                                        Number(e.target.value),
                                        index
                                      )
                                    }
                                    onBlur={() => {
                                      if (i.RootCause > 0) {
                                        const newRootCauseWorklogsErrors = [
                                          ...rootCauseWorklogsErr,
                                        ];
                                        newRootCauseWorklogsErrors[index] =
                                          false;
                                        setRootCauseWorklogsErr(
                                          newRootCauseWorklogsErrors
                                        );
                                      }
                                    }}
                                    readOnly={
                                      (i.RootCause > 0 && i.ErrorType == 1) ||
                                      !i.IsHasErrorlogAddedByClient ||
                                      // i.Remark.trim().length <= 0 ||
                                      i.DisableErrorLog
                                    }
                                  >
                                    {rootCauseOptions.map((r: LabelValue) => (
                                      <MenuItem value={r.value} key={r.value}>
                                        {r.label}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                  {rootCauseWorklogsErr[index] && (
                                    <FormHelperText>
                                      This is a required field.
                                    </FormHelperText>
                                  )}
                                </FormControl>
                                <FormControl
                                  variant="standard"
                                  sx={{ mx: 0.75, minWidth: 230, mt: 1 }}
                                  error={impactWorklogsErr[index]}
                                  disabled={isIdDisabled || isUnassigneeClicked}
                                >
                                  <InputLabel id="demo-simple-select-standard-label">
                                    Impact
                                    <span className="text-defaultRed">
                                      &nbsp;*
                                    </span>
                                  </InputLabel>
                                  <Select
                                    labelId="demo-simple-select-standard-label"
                                    id="demo-simple-select-standard"
                                    value={i.Impact === 0 ? "" : i.Impact}
                                    onChange={(e) =>
                                      handleImpactChangeWorklogs(
                                        Number(e.target.value),
                                        index
                                      )
                                    }
                                    onBlur={() => {
                                      if (i.Impact > 0) {
                                        const newImpactWorklogsErrors = [
                                          ...impactWorklogsErr,
                                        ];
                                        newImpactWorklogsErrors[index] = false;
                                        setImpactWorklogsErr(
                                          newImpactWorklogsErrors
                                        );
                                      }
                                    }}
                                    readOnly={
                                      (i.Impact > 0 && i.ErrorType == 1) ||
                                      !i.IsHasErrorlogAddedByClient ||
                                      // i.Remark.trim().length <= 0 ||
                                      i.DisableErrorLog
                                    }
                                  >
                                    {impactOptions.map((i: LabelValue) => (
                                      <MenuItem value={i.value} key={i.value}>
                                        {i.label}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                  {impactWorklogsErr[index] && (
                                    <FormHelperText>
                                      This is a required field.
                                    </FormHelperText>
                                  )}
                                </FormControl>
                                <FormControl
                                  variant="standard"
                                  sx={{ mx: 0.75, minWidth: 230, mt: 1 }}
                                  error={errorLogPriorityWorklogsErr[index]}
                                  disabled={isIdDisabled || isUnassigneeClicked}
                                >
                                  <InputLabel id="demo-simple-select-standard-label">
                                    Criticality
                                    <span className="text-defaultRed">
                                      &nbsp;*
                                    </span>
                                  </InputLabel>
                                  <Select
                                    labelId="demo-simple-select-standard-label"
                                    id="demo-simple-select-standard"
                                    value={i.Priority === 0 ? "" : i.Priority}
                                    onChange={(e) =>
                                      handlePriorityChangeWorklogs(
                                        Number(e.target.value),
                                        index
                                      )
                                    }
                                    onBlur={() => {
                                      if (i.Priority > 0) {
                                        const newPriorityErrors = [
                                          ...errorLogPriorityWorklogsErr,
                                        ];
                                        newPriorityErrors[index] = false;
                                        setErrorLogPriorityWorklogsErr(
                                          newPriorityErrors
                                        );
                                      }
                                    }}
                                    readOnly={
                                      (i.Priority > 0 && i.ErrorType == 1) ||
                                      !i.IsHasErrorlogAddedByClient ||
                                      // i.Remark.trim().length <= 0 ||
                                      i.DisableErrorLog
                                    }
                                  >
                                    {priorityOptions.map((p: LabelValue) => (
                                      <MenuItem value={p.value} key={p.value}>
                                        {p.label}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                  {errorLogPriorityWorklogsErr[index] && (
                                    <FormHelperText>
                                      This is a required field.
                                    </FormHelperText>
                                  )}
                                </FormControl>
                                <TextField
                                  label={<span>Vendor Name</span>}
                                  fullWidth
                                  disabled={isIdDisabled || isUnassigneeClicked}
                                  value={
                                    i.VendorName.trim().length === 0
                                      ? ""
                                      : i.VendorName
                                  }
                                  onChange={(e) =>
                                    handleVendorNameChangeWorklogs(
                                      e.target.value,
                                      index
                                    )
                                  }
                                  onBlur={(e) => {
                                    if (e.target.value.length > 250) {
                                      const newVendorNameErrors = [
                                        ...vendorNameErrWorklogs,
                                      ];
                                      newVendorNameErrors[index] = true;
                                      setVendorNameErrWorklogs(
                                        newVendorNameErrors
                                      );
                                    } else {
                                      const newVendorNameErrors = [
                                        ...vendorNameErrWorklogs,
                                      ];
                                      newVendorNameErrors[index] = false;
                                      setVendorNameErrWorklogs(
                                        newVendorNameErrors
                                      );
                                    }
                                  }}
                                  error={vendorNameErrWorklogs[index]}
                                  helperText={
                                    vendorNameErrWorklogs[index] &&
                                    i.VendorName.trim().length > 250
                                      ? "Maximum 250 characters allowed."
                                      : ""
                                  }
                                  margin="normal"
                                  variant="standard"
                                  sx={{ mx: 0.75, maxWidth: 230, mt: 1.5 }}
                                  InputProps={{
                                    readOnly:
                                      (i.VendorName.trim().length > 0 &&
                                        i.ErrorType == 1) ||
                                      !i.IsHasErrorlogAddedByClient ||
                                      // i.Remark.trim().length <= 0 ||
                                      i.DisableErrorLog,
                                  }}
                                />
                                <TextField
                                  label={<span>Accounting Transaction ID</span>}
                                  fullWidth
                                  disabled={isIdDisabled || isUnassigneeClicked}
                                  value={
                                    i.DocumentNumber.trim().length === 0
                                      ? ""
                                      : i.DocumentNumber
                                  }
                                  onChange={(e) =>
                                    handleDocumentNumberChangeWorklogs(
                                      e.target.value,
                                      index
                                    )
                                  }
                                  onBlur={(e) => {
                                    if (e.target.value.length > 50) {
                                      const newDocumentNumberErrors = [
                                        ...documentNumberErrWorklogs,
                                      ];
                                      newDocumentNumberErrors[index] = true;
                                      setDocumentNumberErrWorklogs(
                                        newDocumentNumberErrors
                                      );
                                    } else {
                                      const newDocumentNumberErrors = [
                                        ...documentNumberErrWorklogs,
                                      ];
                                      newDocumentNumberErrors[index] = false;
                                      setDocumentNumberErrWorklogs(
                                        newDocumentNumberErrors
                                      );
                                    }
                                  }}
                                  error={documentNumberErrWorklogs[index]}
                                  helperText={
                                    documentNumberErrWorklogs[index] &&
                                    i.DocumentNumber.trim().length > 50
                                      ? "Maximum 50 characters allowed."
                                      : ""
                                  }
                                  margin="normal"
                                  variant="standard"
                                  sx={{ mx: 0.75, maxWidth: 230, mt: 1.5 }}
                                  InputProps={{
                                    readOnly:
                                      (i.DocumentNumber.trim().length > 0 &&
                                        i.ErrorType == 1) ||
                                      !i.IsHasErrorlogAddedByClient ||
                                      // i.Remark.trim().length <= 0 ||
                                      i.DisableErrorLog,
                                  }}
                                />
                                <TextField
                                  label="Amount of Impact (if any)"
                                  fullWidth
                                  disabled={isIdDisabled || isUnassigneeClicked}
                                  value={i.Amount === 0 ? "" : i.Amount}
                                  onChange={(e) =>
                                    e.target.value.length <= 7 &&
                                    handleAmountChangeWorklogs(
                                      e.target.value,
                                      index
                                    )
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
                                  margin="normal"
                                  variant="standard"
                                  sx={{ mx: 0.75, maxWidth: 230, mt: 1.2 }}
                                  InputProps={{
                                    readOnly:
                                      (!!i.Amount &&
                                        i.Amount.toString().trim().length > 0 &&
                                        i.ErrorType == 1) ||
                                      !i.IsHasErrorlogAddedByClient ||
                                      // i.Remark.trim().length <= 0 ||
                                      i.DisableErrorLog,
                                  }}
                                />
                                <TextField
                                  label={
                                    <span>
                                      Error Count
                                      <span className="text-defaultRed">
                                        &nbsp;*
                                      </span>
                                    </span>
                                  }
                                  disabled={isIdDisabled || isUnassigneeClicked}
                                  onFocus={(e) =>
                                    e.target.addEventListener(
                                      "wheel",
                                      function (e) {
                                        e.preventDefault();
                                      },
                                      { passive: false }
                                    )
                                  }
                                  fullWidth
                                  value={i.ErrorCount === 0 ? "" : i.ErrorCount}
                                  onChange={(e) =>
                                    handleErrorCountChangeWorklogs(
                                      e.target.value,
                                      index
                                    )
                                  }
                                  onBlur={() => {
                                    if (i.ErrorCount.toString().length > 0) {
                                      const newErrorCountWorklogsErrors = [
                                        ...errorCountWorklogsErr,
                                      ];
                                      newErrorCountWorklogsErrors[index] =
                                        false;
                                      setErrorCountWorklogsErr(
                                        newErrorCountWorklogsErrors
                                      );
                                    }
                                  }}
                                  error={errorCountWorklogsErr[index]}
                                  helperText={
                                    errorCountWorklogsErr[index] &&
                                    i.ErrorCount <= 0
                                      ? "Add valid number."
                                      : errorCountWorklogsErr[index] &&
                                        i.ErrorCount.toString().length > 4
                                      ? "Maximum 4 numbers allowed."
                                      : errorCountWorklogsErr[index]
                                      ? "This is a required field."
                                      : ""
                                  }
                                  margin="normal"
                                  variant="standard"
                                  sx={{ ml: 1.5, maxWidth: 230, mt: 1.3 }}
                                  InputProps={{
                                    readOnly:
                                      (i.ErrorCount > 0 && i.ErrorType == 1) ||
                                      !i.IsHasErrorlogAddedByClient ||
                                      // i.Remark.trim().length <= 0 ||
                                      i.DisableErrorLog,
                                  }}
                                />
                                <TextField
                                  label={
                                    <span>
                                      Root Cause Analysis (RCA)
                                      <span className="text-defaultRed">
                                        &nbsp;*
                                      </span>
                                    </span>
                                  }
                                  fullWidth
                                  disabled={isIdDisabled || isUnassigneeClicked}
                                  value={
                                    i.RootCauseAnalysis.trim().length === 0
                                      ? ""
                                      : i.RootCauseAnalysis
                                  }
                                  onChange={(e) =>
                                    handleRcaChangeWorklogs(
                                      e.target.value,
                                      index
                                    )
                                  }
                                  onBlur={(e) => {
                                    if (
                                      e.target.value.length <= 0 ||
                                      e.target.value.length > 250
                                    ) {
                                      const newRcaErrors = [...rcaErrWorklogs];
                                      newRcaErrors[index] = true;
                                      setRcaErrWorklogs(newRcaErrors);
                                    } else {
                                      const newRcaErrors = [...rcaErrWorklogs];
                                      newRcaErrors[index] = false;
                                      setRcaErrWorklogs(newRcaErrors);
                                    }
                                  }}
                                  error={rcaErrWorklogs[index]}
                                  helperText={
                                    rcaErrWorklogs[index] &&
                                    i.RootCauseAnalysis.trim().length > 250
                                      ? "Maximum 250 characters allowed."
                                      : rcaErrWorklogs[index]
                                      ? "This is a required field."
                                      : ""
                                  }
                                  margin="normal"
                                  variant="standard"
                                  sx={{ mx: 0.75, maxWidth: 230, mt: 1.5 }}
                                  InputProps={{
                                    readOnly:
                                      (!!i.RootCauseAnalysis &&
                                        i.RootCauseAnalysis.trim().length > 0 &&
                                        i.ErrorType == 1) ||
                                      !i.IsHasErrorlogAddedByClient ||
                                      // i.Remark.trim().length <= 0 ||
                                      i.DisableErrorLog,
                                  }}
                                />
                                <TextField
                                  label={<span>Corrective Action</span>}
                                  fullWidth
                                  disabled={isIdDisabled || isUnassigneeClicked}
                                  value={
                                    i.MitigationPlan.trim().length === 0
                                      ? ""
                                      : i.MitigationPlan
                                  }
                                  onChange={(e) =>
                                    handleMitigationChangeWorklogs(
                                      e.target.value,
                                      index
                                    )
                                  }
                                  onBlur={(e) => {
                                    if (e.target.value.length > 250) {
                                      const newMitigationErrors = [
                                        ...mitigationErrWorklogs,
                                      ];
                                      newMitigationErrors[index] = true;
                                      setMitigationErrWorklogs(
                                        newMitigationErrors
                                      );
                                    } else {
                                      const newMitigationErrors = [
                                        ...mitigationErrWorklogs,
                                      ];
                                      newMitigationErrors[index] = false;
                                      setMitigationErrWorklogs(
                                        newMitigationErrors
                                      );
                                    }
                                  }}
                                  error={mitigationErrWorklogs[index]}
                                  helperText={
                                    mitigationErrWorklogs[index] &&
                                    i.MitigationPlan.trim().length > 250
                                      ? "Maximum 250 characters allowed."
                                      : ""
                                  }
                                  margin="normal"
                                  variant="standard"
                                  sx={{ mx: 0.75, maxWidth: 230, mt: 1.5 }}
                                  InputProps={{
                                    readOnly:
                                      (!!i.MitigationPlan &&
                                        i.MitigationPlan.trim().length > 0 &&
                                        i.ErrorType == 1) ||
                                      !i.IsHasErrorlogAddedByClient ||
                                      // i.Remark.trim().length <= 0 ||
                                      i.DisableErrorLog,
                                  }}
                                />
                                <TextField
                                  label={<span>Preventative Action</span>}
                                  fullWidth
                                  disabled={isIdDisabled || isUnassigneeClicked}
                                  value={
                                    i.ContigencyPlan.trim().length === 0
                                      ? ""
                                      : i.ContigencyPlan
                                  }
                                  onChange={(e) =>
                                    handleContigencyPlanChangeWorklogs(
                                      e.target.value,
                                      index
                                    )
                                  }
                                  onBlur={(e) => {
                                    if (e.target.value.length > 250) {
                                      const newContigencyPlanErrors = [
                                        ...contigencyPlanErrWorklogs,
                                      ];
                                      newContigencyPlanErrors[index] = true;
                                      setContigencyPlanErrWorklogs(
                                        newContigencyPlanErrors
                                      );
                                    } else {
                                      const newContigencyPlanErrors = [
                                        ...contigencyPlanErrWorklogs,
                                      ];
                                      newContigencyPlanErrors[index] = false;
                                      setContigencyPlanErrWorklogs(
                                        newContigencyPlanErrors
                                      );
                                    }
                                  }}
                                  error={contigencyPlanErrWorklogs[index]}
                                  helperText={
                                    contigencyPlanErrWorklogs[index] &&
                                    i.ContigencyPlan.trim().length > 250
                                      ? "Maximum 250 characters allowed."
                                      : ""
                                  }
                                  margin="normal"
                                  variant="standard"
                                  sx={{ mx: 0.75, maxWidth: 230, mt: 1.5 }}
                                  InputProps={{
                                    readOnly:
                                      (!!i.ContigencyPlan &&
                                        i.ContigencyPlan.trim().length > 0 &&
                                        i.ErrorType == 1) ||
                                      !i.IsHasErrorlogAddedByClient ||
                                      // i.Remark.trim().length <= 0 ||
                                      i.DisableErrorLog,
                                  }}
                                />
                                {i.ErrorType === 1 && (
                                  <FormControl
                                    variant="standard"
                                    sx={{ mx: 0.75, minWidth: 230, mt: 1.1 }}
                                    error={resolutionStatusErrWorklogs[index]}
                                    disabled={
                                      isIdDisabled || isUnassigneeClicked
                                    }
                                  >
                                    <InputLabel id="demo-simple-select-standard-label">
                                      Resolution status
                                      <span className="text-defaultRed">
                                        &nbsp;*
                                      </span>
                                    </InputLabel>
                                    <Select
                                      labelId="demo-simple-select-standard-label"
                                      id="demo-simple-select-standard"
                                      disabled={
                                        isIdDisabled || isUnassigneeClicked
                                      }
                                      value={
                                        i.ResolutionStatus === 0
                                          ? ""
                                          : i.ResolutionStatus
                                      }
                                      onChange={(e) =>
                                        handleResolutionStatusChange(
                                          Number(e.target.value),
                                          index
                                        )
                                      }
                                      onBlur={() => {
                                        if (i.ResolutionStatus > 0) {
                                          const newResolutionStatusErrors = [
                                            ...resolutionStatusErrWorklogs,
                                          ];
                                          newResolutionStatusErrors[index] =
                                            false;
                                          setResolutionStatusErrWorklogs(
                                            newResolutionStatusErrors
                                          );
                                        }
                                      }}
                                      readOnly={
                                        (i.ResolutionStatus > 0 &&
                                          i.ErrorType == 1) ||
                                        !i.IsHasErrorlogAddedByClient ||
                                        // i.Remark.trim().length <= 0 ||
                                        i.DisableErrorLog
                                      }
                                    >
                                      {resolutionStatusOptions.map(
                                        (r: LabelValue) => (
                                          <MenuItem
                                            value={r.value}
                                            key={r.value}
                                          >
                                            {r.label}
                                          </MenuItem>
                                        )
                                      )}
                                    </Select>
                                    {resolutionStatusErrWorklogs[index] && (
                                      <FormHelperText>
                                        This is a required field.
                                      </FormHelperText>
                                    )}
                                  </FormControl>
                                )}
                                <div className="flex !ml-0">
                                  {i.ErrorType === 2 && (
                                    <FormControl
                                      variant="standard"
                                      sx={{ mx: 0.75, minWidth: 230 }}
                                      error={resolutionStatusErrWorklogs[index]}
                                      disabled={
                                        isIdDisabled || isUnassigneeClicked
                                      }
                                    >
                                      <InputLabel id="demo-simple-select-standard-label">
                                        Resolution status
                                        <span className="text-defaultRed">
                                          &nbsp;*
                                        </span>
                                      </InputLabel>
                                      <Select
                                        labelId="demo-simple-select-standard-label"
                                        id="demo-simple-select-standard"
                                        disabled={
                                          isIdDisabled || isUnassigneeClicked
                                        }
                                        value={
                                          i.ResolutionStatus === 0
                                            ? ""
                                            : i.ResolutionStatus
                                        }
                                        onChange={(e) =>
                                          handleResolutionStatusChange(
                                            Number(e.target.value),
                                            index
                                          )
                                        }
                                        onBlur={() => {
                                          if (i.ResolutionStatus > 0) {
                                            const newResolutionStatusErrors = [
                                              ...resolutionStatusErrWorklogs,
                                            ];
                                            newResolutionStatusErrors[index] =
                                              false;
                                            setResolutionStatusErrWorklogs(
                                              newResolutionStatusErrors
                                            );
                                          }
                                        }}
                                        readOnly={
                                          // (i.ResolutionStatus > 0 &&
                                          //   i.ErrorType == 1) ||
                                          !i.IsHasErrorlogAddedByClient ||
                                          // i.Remark.trim().length <= 0 ||
                                          i.DisableErrorLog
                                        }
                                      >
                                        {resolutionStatusOptions.map(
                                          (r: LabelValue) => (
                                            <MenuItem
                                              value={r.value}
                                              key={r.value}
                                            >
                                              {r.label}
                                            </MenuItem>
                                          )
                                        )}
                                      </Select>
                                      {resolutionStatusErrWorklogs[index] && (
                                        <FormHelperText>
                                          This is a required field.
                                        </FormHelperText>
                                      )}
                                    </FormControl>
                                  )}
                                  <TextField
                                    label={
                                      <span>Additional Remark (If any)</span>
                                    }
                                    disabled={
                                      isIdDisabled || isUnassigneeClicked
                                    }
                                    fullWidth
                                    value={i.Remark}
                                    margin="normal"
                                    variant="standard"
                                    sx={{
                                      mx: 0.75,
                                      maxWidth: 472,
                                      mt: 0.5,
                                      ml: 1.5,
                                    }}
                                    InputProps={{ readOnly: true }}
                                    inputProps={{ readOnly: true }}
                                  />
                                  <Autocomplete
                                    multiple
                                    limitTags={2}
                                    id="checkboxes-tags-demo"
                                    disabled={
                                      isIdDisabled || isUnassigneeClicked
                                    }
                                    readOnly={
                                      (i.CC.length > 0 && i.ErrorType == 1) ||
                                      !i.IsHasErrorlogAddedByClient ||
                                      // i.Remark.trim().length <= 0 ||
                                      i.DisableErrorLog
                                    }
                                    options={
                                      Array.isArray(cCDropdownDataWorklogs)
                                        ? cCDropdownDataWorklogs
                                        : []
                                    }
                                    value={i.CC}
                                    onChange={(e, newValue) =>
                                      handleCCChangeWorklogs(newValue, index)
                                    }
                                    getOptionLabel={(option) => option.label}
                                    disableCloseOnSelect
                                    style={{ width: 500 }}
                                    renderInput={(params) => (
                                      <TextField
                                        label="cc"
                                        {...params}
                                        variant="standard"
                                      />
                                    )}
                                    sx={{ ml: 1.5, maxWidth: 230, mt: 0.3 }}
                                  />
                                  <div className="flex flex-col mr-5">
                                    <div className="flex">
                                      <ImageUploader isDisable={true} />
                                      {i.Attachments &&
                                        i.Attachments.length > 0 &&
                                        i.Attachments[0]?.SystemFileName
                                          .length > 0 && (
                                          <div className="flex items-center justify-center gap-2">
                                            <span className="mt-6 ml-2">
                                              {i.Attachments[0]?.UserFileName}
                                            </span>
                                            <span
                                              className="mt-6 cursor-pointer"
                                              onClick={() =>
                                                i.Attachments
                                                  ? getFileFromBlob(
                                                      i.Attachments[0]
                                                        ?.SystemFileName,
                                                      i.Attachments[0]
                                                        ?.UserFileName
                                                    )
                                                  : undefined
                                              }
                                            >
                                              <ColorToolTip
                                                title="Download"
                                                placement="top"
                                                arrow
                                              >
                                                <Download />
                                              </ColorToolTip>
                                            </span>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                  <FormGroup>
                                    <FormControlLabel
                                      className="ml-2 mt-5"
                                      disabled={
                                        i.DisableErrorLog ||
                                        isIdDisabled ||
                                        isUnassigneeClicked
                                      }
                                      control={
                                        <Checkbox
                                          checked={
                                            i.isSolved === true ? true : false
                                          }
                                          onChange={(e) =>
                                            i.ErrorType > 0 &&
                                            handleCheckboxChange(
                                              onEdit,
                                              i.ErrorLogId,
                                              e.target.checked,
                                              index
                                            )
                                          }
                                        />
                                      }
                                      label="Is Resolved"
                                    />
                                  </FormGroup>
                                </div>
                              </div>
                            </>
                          )
                        )}
                    </div>
                  )}
                </div>
              )}

            {hasPermissionWorklog("", "ErrorLog", "QA") &&
              isDisabled &&
              onEdit > 0 && (
                <div className="mt-14" id="tabpanel-7">
                  <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                    <span className="flex items-center">
                      <TaskIcon />
                      <span className="ml-[21px]">Error Logs</span>
                    </span>
                    <span className="flex items-center">
                      {hasPermissionWorklog("", "ErrorLog", "QA") &&
                        onEdit > 0 && (
                          <Button
                            variant="contained"
                            className="rounded-[4px] !h-[36px] mr-6 !bg-secondary"
                            onClick={handleSubmitErrorLog}
                          >
                            Update
                          </Button>
                        )}
                      <span
                        className={`cursor-pointer ${
                          errorLogWorklogsDrawer ? "rotate-180" : ""
                        }`}
                        onClick={() =>
                          setErorLogWorklogsDrawer(!errorLogWorklogsDrawer)
                        }
                      >
                        <ChevronDownIcon />
                      </span>
                    </span>
                  </div>
                  {errorLogWorklogsDrawer && (
                    <>
                      <div className="mt-3 pl-6">
                        {errorLogFieldsWorklogs.map((field, index) => (
                          <div
                            className="w-[100%] mt-4"
                            key={field.SubmitedBy + index}
                          >
                            {field.SubmitedBy.length > 0 && (
                              <div className="ml-1 mt-8 mb-3">
                                <span className="font-bold">Correction By</span>
                                <span className="ml-3 mr-10 text-[14px]">
                                  {field.SubmitedBy}
                                </span>
                                <span className="font-bold">Reviewer Date</span>
                                <span className="ml-3">
                                  {field.SubmitedOn.split("/")[1]}-
                                  {field.SubmitedOn.split("/")[0]}-
                                  {field.SubmitedOn.split("/")[2]}
                                </span>
                              </div>
                            )}
                            <div
                              className={`inline-flex mt-[4px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[230px] ${
                                recordedDateErrWorklogs[index]
                                  ? "datepickerError"
                                  : ""
                              }`}
                            >
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                  label={
                                    <span>
                                      Transaction Rec. Date
                                      <span className="text-defaultRed">
                                        &nbsp;*
                                      </span>
                                    </span>
                                  }
                                  maxDate={dayjs(new Date())}
                                  disabled={field.isSolved}
                                  value={
                                    field.DateOfTransaction === ""
                                      ? null
                                      : dayjs(field.DateOfTransaction)
                                  }
                                  onChange={(newDate: any) => {
                                    handleDateOfTransactionChange(
                                      newDate.$d,
                                      index
                                    );
                                  }}
                                  slotProps={{
                                    textField: {
                                      helperText: recordedDateErrWorklogs[index]
                                        ? "This is a required field."
                                        : "",
                                      readOnly: true,
                                    } as Record<string, any>,
                                  }}
                                />
                              </LocalizationProvider>
                            </div>
                            <div
                              className={`inline-flex mt-[8px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[230px] ${
                                errorIdentificationErrWorklogs[index]
                                  ? "datepickerError"
                                  : ""
                              }`}
                            >
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                  label={
                                    <span>
                                      Error Identification Date
                                      <span className="text-defaultRed">
                                        &nbsp;*
                                      </span>
                                    </span>
                                  }
                                  maxDate={dayjs(new Date())}
                                  disabled={field.isSolved}
                                  value={
                                    field.ErrorIdentificationDate === ""
                                      ? null
                                      : dayjs(field.ErrorIdentificationDate)
                                  }
                                  onChange={(newDate: any) => {
                                    handleErrorIdentificationDateChange(
                                      newDate.$d,
                                      index
                                    );
                                  }}
                                  slotProps={{
                                    textField: {
                                      helperText:
                                        errorIdentificationErrWorklogs[index]
                                          ? "This is a required field."
                                          : "",
                                      readOnly: true,
                                    } as Record<string, any>,
                                  }}
                                />
                              </LocalizationProvider>
                            </div>
                            <FormControl
                              variant="standard"
                              sx={{ mx: 0.75, minWidth: 230, mt: 1 }}
                              error={errorTypeWorklogsErr[index]}
                            >
                              <InputLabel id="demo-simple-select-standard-label">
                                Error Type
                                <span className="text-defaultRed">&nbsp;*</span>
                              </InputLabel>
                              <Select
                                labelId="demo-simple-select-standard-label"
                                id="demo-simple-select-standard"
                                disabled={field.isSolved}
                                value={
                                  field.ErrorType === 0 ? "" : field.ErrorType
                                }
                                onChange={(e) => {
                                  handleErrorTypeChangeWorklogs(
                                    Number(e.target.value),
                                    index
                                  );
                                  handleIdentifiedByChange(
                                    "",
                                    index,
                                    Number(e.target.value)
                                  );
                                }}
                                onBlur={() => {
                                  if (field.ErrorType > 0) {
                                    const newErrorTypeErrors = [
                                      ...errorTypeWorklogsErr,
                                    ];
                                    newErrorTypeErrors[index] = false;
                                    setErrorTypeWorklogsErr(newErrorTypeErrors);
                                  }
                                }}
                              >
                                {errorTypeOptions.map((e: LabelValue) => (
                                  <MenuItem value={e.value} key={e.value}>
                                    {e.label}
                                  </MenuItem>
                                ))}
                              </Select>
                              {errorTypeWorklogsErr[index] && (
                                <FormHelperText>
                                  This is a required field.
                                </FormHelperText>
                              )}
                            </FormControl>
                            {field.ErrorType === 2 && (
                              <TextField
                                label={
                                  <span>
                                    Error Identified by
                                    <span className="text-defaultRed">
                                      &nbsp;*
                                    </span>
                                  </span>
                                }
                                fullWidth
                                disabled={field.isSolved}
                                value={
                                  field.IdentifiedBy !== null &&
                                  field?.IdentifiedBy.trim().length === 0
                                    ? ""
                                    : field?.IdentifiedBy
                                }
                                onChange={(e) =>
                                  handleIdentifiedByChange(
                                    e.target.value,
                                    index,
                                    0
                                  )
                                }
                                onBlur={(e) => {
                                  if (
                                    e.target.value.length <= 0 ||
                                    e.target.value.length > 50
                                  ) {
                                    const newIdentifiedByErrors = [
                                      ...identifiedByErrWorklogs,
                                    ];
                                    newIdentifiedByErrors[index] = true;
                                    setIdentifiedByErrWorklogs(
                                      newIdentifiedByErrors
                                    );
                                  } else {
                                    const newIdentifiedByErrors = [
                                      ...identifiedByErrWorklogs,
                                    ];
                                    newIdentifiedByErrors[index] = false;
                                    setIdentifiedByErrWorklogs(
                                      newIdentifiedByErrors
                                    );
                                  }
                                }}
                                error={identifiedByErrWorklogs[index]}
                                helperText={
                                  identifiedByErrWorklogs[index] &&
                                  field.IdentifiedBy !== null &&
                                  field.IdentifiedBy.trim().length > 50
                                    ? "Maximum 50 characters allowed."
                                    : identifiedByErrWorklogs[index]
                                    ? "This is a required field."
                                    : ""
                                }
                                margin="normal"
                                variant="standard"
                                sx={{ mx: 0.75, maxWidth: 230, mt: 1 }}
                              />
                            )}
                            <FormControl
                              variant="standard"
                              sx={{
                                mx: 0.75,
                                minWidth: 250,
                                maxWidth: 250,
                                mt: 1,
                              }}
                              error={natureOfWorklogsErr[index]}
                            >
                              <InputLabel id="demo-simple-select-standard-label">
                                Error Details
                                <span className="text-defaultRed">&nbsp;*</span>
                              </InputLabel>
                              <Select
                                labelId="demo-simple-select-standard-label"
                                id="demo-simple-select-standard"
                                disabled={field.isSolved}
                                value={
                                  field.NatureOfError === 0
                                    ? ""
                                    : field.NatureOfError
                                }
                                onChange={(e) =>
                                  handleNatureOfErrorChangeWorklogs(
                                    Number(e.target.value),
                                    index
                                  )
                                }
                                onBlur={() => {
                                  if (field.NatureOfError > 0) {
                                    const newNatureOfErrorErrors = [
                                      ...natureOfWorklogsErr,
                                    ];
                                    newNatureOfErrorErrors[index] = false;
                                    setNatureOfWorklogsErr(
                                      newNatureOfErrorErrors
                                    );
                                  }
                                }}
                              >
                                {natureOfErrorDropdown.map(
                                  (n: LabelValueType) => (
                                    <MenuItem value={n.value} key={n.value}>
                                      {n.label}
                                    </MenuItem>
                                  )
                                )}
                              </Select>
                              {natureOfWorklogsErr[index] && (
                                <FormHelperText>
                                  This is a required field.
                                </FormHelperText>
                              )}
                            </FormControl>
                            <FormControl
                              variant="standard"
                              sx={{ mx: 0.75, minWidth: 230, mt: 1 }}
                              error={rootCauseWorklogsErr[index]}
                            >
                              <InputLabel id="demo-simple-select-standard-label">
                                Error Category
                                <span className="text-defaultRed">&nbsp;*</span>
                              </InputLabel>
                              <Select
                                labelId="demo-simple-select-standard-label"
                                id="demo-simple-select-standard"
                                disabled={field.isSolved}
                                value={
                                  field.RootCause === 0 ? "" : field.RootCause
                                }
                                onChange={(e) =>
                                  handleRootCauseChangeWorklogs(
                                    Number(e.target.value),
                                    index
                                  )
                                }
                                onBlur={() => {
                                  if (field.RootCause > 0) {
                                    const newRootCauseErrors = [
                                      ...rootCauseWorklogsErr,
                                    ];
                                    newRootCauseErrors[index] = false;
                                    setRootCauseWorklogsErr(newRootCauseErrors);
                                  }
                                }}
                              >
                                {rootCauseOptions.map((r: LabelValue) => (
                                  <MenuItem value={r.value} key={r.value}>
                                    {r.label}
                                  </MenuItem>
                                ))}
                              </Select>
                              {rootCauseWorklogsErr[index] && (
                                <FormHelperText>
                                  This is a required field.
                                </FormHelperText>
                              )}
                            </FormControl>
                            <FormControl
                              variant="standard"
                              sx={{ mx: 0.75, minWidth: 230, mt: 1 }}
                              error={impactWorklogsErr[index]}
                            >
                              <InputLabel id="demo-simple-select-standard-label">
                                Impact
                                <span className="text-defaultRed">&nbsp;*</span>
                              </InputLabel>
                              <Select
                                labelId="demo-simple-select-standard-label"
                                id="demo-simple-select-standard"
                                disabled={field.isSolved}
                                value={field.Impact === 0 ? "" : field.Impact}
                                onChange={(e) =>
                                  handleImpactChangeWorklogs(
                                    Number(e.target.value),
                                    index
                                  )
                                }
                                onBlur={() => {
                                  if (field.Impact > 0) {
                                    const newImpactErrors = [
                                      ...impactWorklogsErr,
                                    ];
                                    newImpactErrors[index] = false;
                                    setImpactWorklogsErr(newImpactErrors);
                                  }
                                }}
                              >
                                {impactOptions.map((i: LabelValue) => (
                                  <MenuItem value={i.value} key={i.value}>
                                    {i.label}
                                  </MenuItem>
                                ))}
                              </Select>
                              {impactWorklogsErr[index] && (
                                <FormHelperText>
                                  This is a required field.
                                </FormHelperText>
                              )}
                            </FormControl>
                            <FormControl
                              variant="standard"
                              sx={{ mx: 0.75, minWidth: 230, mt: 1 }}
                              error={errorLogPriorityWorklogsErr[index]}
                            >
                              <InputLabel id="demo-simple-select-standard-label">
                                Criticality
                                <span className="text-defaultRed">&nbsp;*</span>
                              </InputLabel>
                              <Select
                                labelId="demo-simple-select-standard-label"
                                id="demo-simple-select-standard"
                                disabled={field.isSolved}
                                value={
                                  field.Priority === 0 ? "" : field.Priority
                                }
                                onChange={(e) =>
                                  handlePriorityChangeWorklogs(
                                    Number(e.target.value),
                                    index
                                  )
                                }
                                onBlur={() => {
                                  if (field.Priority > 0) {
                                    const newPriorityErrors = [
                                      ...errorLogPriorityWorklogsErr,
                                    ];
                                    newPriorityErrors[index] = false;
                                    setErrorLogPriorityWorklogsErr(
                                      newPriorityErrors
                                    );
                                  }
                                }}
                              >
                                {priorityOptions.map((p: LabelValue) => (
                                  <MenuItem value={p.value} key={p.value}>
                                    {p.label}
                                  </MenuItem>
                                ))}
                              </Select>
                              {errorLogPriorityWorklogsErr[index] && (
                                <FormHelperText>
                                  This is a required field.
                                </FormHelperText>
                              )}
                            </FormControl>
                            <TextField
                              label={<span>Vendor Name</span>}
                              fullWidth
                              disabled={field.isSolved}
                              value={
                                field.VendorName.trim().length === 0
                                  ? ""
                                  : field.VendorName
                              }
                              onChange={(e) =>
                                handleVendorNameChangeWorklogs(
                                  e.target.value,
                                  index
                                )
                              }
                              onBlur={(e) => {
                                if (e.target.value.length > 250) {
                                  const newVendorNameErrors = [
                                    ...vendorNameErrWorklogs,
                                  ];
                                  newVendorNameErrors[index] = true;
                                  setVendorNameErrWorklogs(newVendorNameErrors);
                                } else {
                                  const newVendorNameErrors = [
                                    ...vendorNameErrWorklogs,
                                  ];
                                  newVendorNameErrors[index] = false;
                                  setVendorNameErrWorklogs(newVendorNameErrors);
                                }
                              }}
                              error={vendorNameErrWorklogs[index]}
                              helperText={
                                vendorNameErrWorklogs[index] &&
                                field.VendorName.trim().length > 250
                                  ? "Maximum 250 characters allowed."
                                  : ""
                              }
                              margin="normal"
                              variant="standard"
                              sx={{ mx: 0.75, maxWidth: 230, mt: 1.5 }}
                            />
                            <TextField
                              label={<span>Accounting Transaction ID</span>}
                              fullWidth
                              disabled={field.isSolved}
                              value={
                                field.DocumentNumber.trim().length === 0
                                  ? ""
                                  : field.DocumentNumber
                              }
                              onChange={(e) =>
                                handleDocumentNumberChangeWorklogs(
                                  e.target.value,
                                  index
                                )
                              }
                              onBlur={(e) => {
                                if (e.target.value.length > 50) {
                                  const newDocumentNumberErrors = [
                                    ...documentNumberErrWorklogs,
                                  ];
                                  newDocumentNumberErrors[index] = true;
                                  setDocumentNumberErrWorklogs(
                                    newDocumentNumberErrors
                                  );
                                } else {
                                  const newDocumentNumberErrors = [
                                    ...documentNumberErrWorklogs,
                                  ];
                                  newDocumentNumberErrors[index] = false;
                                  setDocumentNumberErrWorklogs(
                                    newDocumentNumberErrors
                                  );
                                }
                              }}
                              error={documentNumberErrWorklogs[index]}
                              helperText={
                                documentNumberErrWorklogs[index] &&
                                field.DocumentNumber.trim().length > 50
                                  ? "Maximum 50 characters allowed."
                                  : ""
                              }
                              margin="normal"
                              variant="standard"
                              sx={{ mx: 0.75, maxWidth: 230, mt: 1.5 }}
                            />
                            <TextField
                              label="Amount of Impact (if any)"
                              fullWidth
                              disabled={field.isSolved}
                              value={field.Amount === 0 ? "" : field.Amount}
                              onChange={(e) =>
                                e.target.value.length <= 7 &&
                                handleAmountChangeWorklogs(
                                  e.target.value,
                                  index
                                )
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
                              margin="normal"
                              variant="standard"
                              sx={{ mx: 0.75, maxWidth: 230, mt: 1.5 }}
                            />
                            <TextField
                              label={
                                <span>
                                  Error Count
                                  <span className="!text-defaultRed">
                                    &nbsp;*
                                  </span>
                                </span>
                              }
                              fullWidth
                              disabled={field.isSolved}
                              value={
                                field.ErrorCount === 0 ? "" : field.ErrorCount
                              }
                              onChange={(e) =>
                                handleErrorCountChangeWorklogs(
                                  e.target.value,
                                  index
                                )
                              }
                              onBlur={(e) => {
                                if (e.target.value.length > 0) {
                                  const newErrorCountErrors = [
                                    ...errorCountWorklogsErr,
                                  ];
                                  newErrorCountErrors[index] = false;
                                  setErrorCountWorklogsErr(newErrorCountErrors);
                                }
                              }}
                              onFocus={(e) =>
                                e.target.addEventListener(
                                  "wheel",
                                  function (e) {
                                    e.preventDefault();
                                  },
                                  { passive: false }
                                )
                              }
                              error={errorCountWorklogsErr[index]}
                              helperText={
                                errorCountWorklogsErr[index] &&
                                field.ErrorCount <= 0
                                  ? "Add valid number."
                                  : errorCountWorklogsErr[index] &&
                                    field.ErrorCount.toString().length > 4
                                  ? "Maximum 4 numbers allowed."
                                  : errorCountWorklogsErr[index]
                                  ? "This is a required field."
                                  : ""
                              }
                              margin="normal"
                              variant="standard"
                              sx={{ mx: 0.75, maxWidth: 230, mt: 1.5 }}
                            />
                            <TextField
                              label={
                                <span>
                                  Root Cause Analysis (RCA)
                                  <span className="text-defaultRed">
                                    &nbsp;*
                                  </span>
                                </span>
                              }
                              fullWidth
                              disabled={field.isSolved}
                              value={
                                field.RootCauseAnalysis.trim().length === 0
                                  ? ""
                                  : field.RootCauseAnalysis
                              }
                              onChange={(e) =>
                                handleRcaChangeWorklogs(e.target.value, index)
                              }
                              onBlur={(e) => {
                                if (
                                  e.target.value.length <= 0 ||
                                  e.target.value.length > 250
                                ) {
                                  const newRcaErrors = [...rcaErrWorklogs];
                                  newRcaErrors[index] = true;
                                  setRcaErrWorklogs(newRcaErrors);
                                } else {
                                  const newRcaErrors = [...rcaErrWorklogs];
                                  newRcaErrors[index] = false;
                                  setRcaErrWorklogs(newRcaErrors);
                                }
                              }}
                              error={rcaErrWorklogs[index]}
                              helperText={
                                rcaErrWorklogs[index] &&
                                field.RootCauseAnalysis.trim().length > 250
                                  ? "Maximum 250 characters allowed."
                                  : rcaErrWorklogs[index]
                                  ? "This is a required field."
                                  : ""
                              }
                              margin="normal"
                              variant="standard"
                              sx={{ mx: 0.75, maxWidth: 230, mt: 1.5 }}
                            />
                            <TextField
                              label={<span>Corrective Action</span>}
                              fullWidth
                              disabled={field.isSolved}
                              value={
                                field.MitigationPlan.trim().length === 0
                                  ? ""
                                  : field.MitigationPlan
                              }
                              onChange={(e) =>
                                handleMitigationChangeWorklogs(
                                  e.target.value,
                                  index
                                )
                              }
                              onBlur={(e) => {
                                if (e.target.value.length > 250) {
                                  const newMitigationErrors = [
                                    ...mitigationErrWorklogs,
                                  ];
                                  newMitigationErrors[index] = true;
                                  setMitigationErrWorklogs(newMitigationErrors);
                                } else {
                                  const newMitigationErrors = [
                                    ...mitigationErrWorklogs,
                                  ];
                                  newMitigationErrors[index] = false;
                                  setMitigationErrWorklogs(newMitigationErrors);
                                }
                              }}
                              error={mitigationErrWorklogs[index]}
                              helperText={
                                mitigationErrWorklogs[index] &&
                                field.MitigationPlan.trim().length > 250
                                  ? "Maximum 250 characters allowed."
                                  : ""
                              }
                              margin="normal"
                              variant="standard"
                              sx={{ mx: 0.75, maxWidth: 230, mt: 1.5 }}
                            />
                            <TextField
                              label={<span>Preventative Action</span>}
                              fullWidth
                              disabled={field.isSolved}
                              value={
                                field.ContigencyPlan.trim().length === 0
                                  ? ""
                                  : field.ContigencyPlan
                              }
                              onChange={(e) =>
                                handleContigencyPlanChangeWorklogs(
                                  e.target.value,
                                  index
                                )
                              }
                              onBlur={(e) => {
                                if (e.target.value.length > 250) {
                                  const newContigencyPlanErrors = [
                                    ...contigencyPlanErrWorklogs,
                                  ];
                                  newContigencyPlanErrors[index] = true;
                                  setContigencyPlanErrWorklogs(
                                    newContigencyPlanErrors
                                  );
                                } else {
                                  const newContigencyPlanErrors = [
                                    ...contigencyPlanErrWorklogs,
                                  ];
                                  newContigencyPlanErrors[index] = false;
                                  setContigencyPlanErrWorklogs(
                                    newContigencyPlanErrors
                                  );
                                }
                              }}
                              error={contigencyPlanErrWorklogs[index]}
                              helperText={
                                contigencyPlanErrWorklogs[index] &&
                                field.ContigencyPlan.trim().length > 250
                                  ? "Maximum 250 characters allowed."
                                  : ""
                              }
                              margin="normal"
                              variant="standard"
                              sx={{ mx: 0.75, maxWidth: 230, mt: 1.5 }}
                            />
                            {field.ErrorType === 1 && (
                              <FormControl
                                variant="standard"
                                sx={{ mx: 0.75, minWidth: 230, mt: 1.1 }}
                                error={resolutionStatusErrWorklogs[index]}
                                disabled={field.isSolved}
                              >
                                <InputLabel id="demo-simple-select-standard-label">
                                  Resolution status
                                  <span className="text-defaultRed">
                                    &nbsp;*
                                  </span>
                                </InputLabel>
                                <Select
                                  labelId="demo-simple-select-standard-label"
                                  id="demo-simple-select-standard"
                                  disabled={isIdDisabled || isUnassigneeClicked}
                                  value={
                                    field.ResolutionStatus === 0
                                      ? ""
                                      : field.ResolutionStatus
                                  }
                                  onChange={(e) =>
                                    handleResolutionStatusChange(
                                      Number(e.target.value),
                                      index
                                    )
                                  }
                                  onBlur={() => {
                                    if (field.ResolutionStatus > 0) {
                                      const newResolutionStatusErrors = [
                                        ...resolutionStatusErrWorklogs,
                                      ];
                                      newResolutionStatusErrors[index] = false;
                                      setResolutionStatusErrWorklogs(
                                        newResolutionStatusErrors
                                      );
                                    }
                                  }}
                                >
                                  {resolutionStatusOptions.map(
                                    (r: LabelValue) => (
                                      <MenuItem value={r.value} key={r.value}>
                                        {r.label}
                                      </MenuItem>
                                    )
                                  )}
                                </Select>
                                {resolutionStatusErrWorklogs[index] && (
                                  <FormHelperText>
                                    This is a required field.
                                  </FormHelperText>
                                )}
                              </FormControl>
                            )}
                            <div className="flex !ml-0">
                              {field.ErrorType === 2 && (
                                <FormControl
                                  variant="standard"
                                  sx={{ mx: 0.75, minWidth: 230, mt: 1.1 }}
                                  error={resolutionStatusErrWorklogs[index]}
                                  disabled={field.isSolved}
                                >
                                  <InputLabel id="demo-simple-select-standard-label">
                                    Resolution status
                                    <span className="text-defaultRed">
                                      &nbsp;*
                                    </span>
                                  </InputLabel>
                                  <Select
                                    labelId="demo-simple-select-standard-label"
                                    id="demo-simple-select-standard"
                                    disabled={
                                      isIdDisabled || isUnassigneeClicked
                                    }
                                    value={
                                      field.ResolutionStatus === 0
                                        ? ""
                                        : field.ResolutionStatus
                                    }
                                    onChange={(e) =>
                                      handleResolutionStatusChange(
                                        Number(e.target.value),
                                        index
                                      )
                                    }
                                    onBlur={() => {
                                      if (field.ResolutionStatus > 0) {
                                        const newResolutionStatusErrors = [
                                          ...resolutionStatusErrWorklogs,
                                        ];
                                        newResolutionStatusErrors[index] =
                                          false;
                                        setResolutionStatusErrWorklogs(
                                          newResolutionStatusErrors
                                        );
                                      }
                                    }}
                                  >
                                    {resolutionStatusOptions.map(
                                      (r: LabelValue) => (
                                        <MenuItem value={r.value} key={r.value}>
                                          {r.label}
                                        </MenuItem>
                                      )
                                    )}
                                  </Select>
                                  {resolutionStatusErrWorklogs[index] && (
                                    <FormHelperText>
                                      This is a required field.
                                    </FormHelperText>
                                  )}
                                </FormControl>
                              )}
                              <TextField
                                label={<span>Additional Remark (If any)</span>}
                                fullWidth
                                disabled={field.isSolved}
                                value={
                                  field.Remark.trim().length === 0
                                    ? ""
                                    : field.Remark
                                }
                                onChange={(e) =>
                                  handleRemarksChangeWorklogs(
                                    e.target.value,
                                    index
                                  )
                                }
                                margin="normal"
                                variant="standard"
                                sx={{ mx: 0.75, maxWidth: 472, mt: 1.5 }}
                              />
                              <Autocomplete
                                multiple
                                limitTags={2}
                                id="checkboxes-tags-demo"
                                options={
                                  Array.isArray(cCDropdownDataWorklogs)
                                    ? cCDropdownDataWorklogs
                                    : []
                                }
                                disabled={field.isSolved}
                                value={field.CC}
                                onChange={(e, newValue) =>
                                  handleCCChangeWorklogs(newValue, index)
                                }
                                style={{ width: 500 }}
                                renderInput={(params) => (
                                  <TextField
                                    label="cc"
                                    {...params}
                                    variant="standard"
                                  />
                                )}
                                sx={{ mx: 0.75, maxWidth: 230, mt: 1.5 }}
                              />
                              <div className="flex flex-col ml-4">
                                <div className="flex flex-col items-start justify-start">
                                  <div className="flex mt-2">
                                    <ImageUploader
                                      getData={(data1: string, data2: string) =>
                                        field.Attachments
                                          ? handleAttachmentsChangeWorklogs(
                                              data1,
                                              data2,
                                              field.Attachments,
                                              index
                                            )
                                          : undefined
                                      }
                                      isDisable={field.isSolved}
                                      fileHasError={(error: boolean) => {
                                        const newErrors = [...imageErrWorklogs];
                                        newErrors[index] = error;
                                        setImageErrWorklogs(newErrors);
                                      }}
                                    />
                                    {field.Attachments &&
                                      field.Attachments.length > 0 &&
                                      field.Attachments[0]?.SystemFileName
                                        .length > 0 && (
                                        <div className="flex items-center justify-center gap-2">
                                          <span className="mt-6 ml-2">
                                            {field.Attachments[0]?.UserFileName}
                                          </span>
                                          <span
                                            className="mt-6 mr-4 cursor-pointer"
                                            onClick={() =>
                                              field.Attachments
                                                ? getFileFromBlob(
                                                    field.Attachments[0]
                                                      ?.SystemFileName,
                                                    field.Attachments[0]
                                                      ?.UserFileName
                                                  )
                                                : undefined
                                            }
                                          >
                                            <ColorToolTip
                                              title="Download"
                                              placement="top"
                                              arrow
                                            >
                                              <Download />
                                            </ColorToolTip>
                                          </span>
                                        </div>
                                      )}
                                  </div>
                                  {imageErrWorklogs[index] && (
                                    <span className="text-defaultRed text-[14px] mt-1">
                                      File size shouldn&apos;t be more than 5MB.
                                    </span>
                                  )}
                                </div>
                              </div>
                              {field.isSolved && (
                                <FormGroup>
                                  <FormControlLabel
                                    className="mt-5 ml-2"
                                    control={
                                      <Checkbox checked={field.isSolved} />
                                    }
                                    label="Is Resolved"
                                  />
                                </FormGroup>
                              )}
                              {index === 0 && (
                                <span
                                  className="cursor-pointer"
                                  onClick={
                                    hasPermissionWorklog("", "ErrorLog", "QA")
                                      ? addErrorLogFieldWorklogs
                                      : undefined
                                  }
                                >
                                  <svg
                                    className="MuiSvgIcon-root !w-[24px] !h-[24px] !mt-[24px] mx-[10px] MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root"
                                    focusable="false"
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    data-testid="AddIcon"
                                  >
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
                                  </svg>
                                </span>
                              )}
                              {index > 0 && !field.isSolved && (
                                <span
                                  className="cursor-pointer"
                                  onClick={
                                    hasPermissionWorklog("", "ErrorLog", "QA")
                                      ? () => removeErrorLogFieldWorklogs(index)
                                      : undefined
                                  }
                                >
                                  <svg
                                    className="MuiSvgIcon-root !w-[24px] !h-[24px] !mt-[24px] mx-[10px] MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root"
                                    focusable="false"
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    data-testid="RemoveIcon"
                                  >
                                    <path d="M19 13H5v-2h14v2z"></path>
                                  </svg>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

            {onEdit > 0 && (
              <div className="mt-14" id="tabpanel-8">
                <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                  <span className="flex items-center">
                    <HistoryIcon />
                    <span className="ml-[21px]">Reviewer&apos;s Note</span>
                  </span>
                  <span
                    className={`cursor-pointer ${
                      reasonWorklogsDrawer ? "rotate-180" : ""
                    }`}
                    onClick={() =>
                      setReasonWorklogsDrawer(!reasonWorklogsDrawer)
                    }
                  >
                    <ChevronDownIcon />
                  </span>
                </div>
                {reasonWorklogsDrawer &&
                  reviewerNoteWorklogs.length > 0 &&
                  reviewerNoteWorklogs.map(
                    (i: GetReviewerNoteList, index: number) => (
                      <div
                        className="mt-5 pl-[70px] text-sm"
                        key={i.ReviewedDate + index}
                      >
                        <span className="font-semibold">
                          {i.ReviewedDate.split("-")
                            .slice(1)
                            .concat(i.ReviewedDate.split("-")[0])
                            .join("-")}
                        </span>
                        {i.Details.map(
                          (j: ReviewerNoteDetails, index: number) => (
                            <div
                              className="flex gap-3 mt-4"
                              key={j.ReviewerName + index}
                            >
                              <span className="mt-2">{index + 1}</span>
                              {j.ReviewerName.length > 0 ? (
                                <Tooltip
                                  title={j.ReviewerName}
                                  placement="top"
                                  arrow
                                >
                                  <Avatar>
                                    {j.ReviewerName.split(" ")
                                      .map((word: string) =>
                                        word.charAt(0).toUpperCase()
                                      )
                                      .join("")}
                                  </Avatar>
                                </Tooltip>
                              ) : (
                                <Tooltip
                                  title={j.ReviewerName}
                                  placement="top"
                                  arrow
                                >
                                  <Avatar sx={{ width: 32, height: 32 }} />
                                </Tooltip>
                              )}
                              <div className="flex flex-col items-start">
                                <span>{j.Comment}</span>
                                <span>{j.Status}</span>
                                <span>
                                  at&nbsp;
                                  {new Date(
                                    j.ReviewedDateTime + "Z"
                                  ).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: true,
                                    timeZone: "Asia/Kolkata",
                                  })}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )
                  )}
              </div>
            )}

            {/* Logs */}
            {onEdit > 0 && (
              <div className="mt-14" id="tabpanel-9">
                <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                  <span className="flex items-center">
                    <HistoryIcon />
                    <span className="ml-[21px]">Logs</span>
                  </span>
                  <span
                    className={`cursor-pointer ${
                      logsWorklogsDrawer ? "rotate-180" : ""
                    }`}
                    onClick={() => setLogsWorklogsDrawer(!logsWorklogsDrawer)}
                  >
                    <ChevronDownIcon />
                  </span>
                </div>
                {logsWorklogsDrawer &&
                  logsDataWorklogs.length > 0 &&
                  logsDataWorklogs.map(
                    (i: AuditlogGetByWorkitem, index: number) => (
                      <div
                        className="mt-5 pl-[70px] text-sm"
                        key={i.UpdatedBy + index}
                      >
                        <div className="flex gap-3 mt-4">
                          <b className="mt-2">{index + 1}</b>
                          <div className="flex flex-col items-start">
                            <b>Modify By: {i.UpdatedBy}</b>
                            <b>
                              Date & Time:&nbsp;
                              {i.UpdatedOn.split("T")[0]
                                .split("-")
                                .slice(1)
                                .concat(i.UpdatedOn.split("T")[0].split("-")[0])
                                .join("-")}
                              &nbsp;&&nbsp;
                              {i.UpdatedOn.split("T")[1]}
                            </b>
                            <br />
                            <ThemeProvider theme={getMuiTheme()}>
                              <MUIDataTable
                                data={i.UpdatedFieldsList}
                                columns={logsDatatableTaskCols}
                                title={undefined}
                                options={{
                                  responsive: "standard",
                                  viewColumns: false,
                                  filter: false,
                                  print: false,
                                  download: false,
                                  search: false,
                                  selectToolbarPlacement: "none",
                                  selectableRows: "none",
                                  elevation: 0,
                                  pagination: false,
                                }}
                                data-tableid="task_Report_Datatable"
                              />
                            </ThemeProvider>
                            <br />
                          </div>
                        </div>
                      </div>
                    )
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

export default EditDrawer;
