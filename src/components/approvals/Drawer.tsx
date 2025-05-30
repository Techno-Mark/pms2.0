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
import { useRouter } from "next/navigation";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  extractText,
  getYears,
  hasPermissionWorklog,
  isWeekend,
} from "@/utils/commonFunction";
import ImageUploader from "../common/ImageUploader";
import { Mention, MentionsInput } from "react-mentions";
import mentionsInputStyle from "../../utils/worklog/mentionsInputStyle";
import EditIcon from "@mui/icons-material/Edit";
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
  getSubTaskDropdownData,
  getTypeOfWorkDropdownData,
  hours,
  months,
} from "@/utils/commonDropdownApiCall";
import { getFileFromBlob } from "@/utils/downloadFile";
import { ColorToolTip, getMuiTheme } from "@/utils/datatable/CommonStyle";
import { callAPI } from "@/utils/API/callAPI";
import { generateCommonBodyRender } from "@/utils/datatable/CommonFunction";
import MUIDataTable from "mui-datatables";
import OverLay from "../common/OverLay";
import {
  AuditlogGetByWorkitem,
  CommentAttachment,
  CommentGetByWorkitem,
  ErrorlogGetByWorkitem,
  GetManualLogByWorkitem,
  GetManualLogByWorkitemReviewer,
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
import axios from "axios";
import ImportIcon from "@/assets/icons/ImportIcon";
import ImportDialogSubTask from "../worklogs/worklogs_Import/ImportDialogSubTask";

interface EditDrawer {
  onOpen: boolean;
  onClose: () => void;
  onEdit: number;
  onDataFetch: (() => void) | null;
  onHasId: number;
  onComment: boolean;
  onErrorLog: boolean;
  onManualTime: boolean;
  activeTab: number;
}

const EditDrawer = ({
  onOpen,
  onClose,
  onEdit,
  onDataFetch,
  onHasId,
  onComment,
  onErrorLog,
  onManualTime,
  activeTab,
}: EditDrawer) => {
  const router = useRouter();
  const yearDropdown = getYears();
  const [userId, setUserId] = useState(0);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false);
  const [inputTypeReview, setInputTypeReview] = useState("text");
  const [inputTypePreperation, setInputTypePreperation] = useState("text");
  const [editData, setEditData] = useState<any>([]);
  const [isCreatedByClient, setIsCreatedByClient] = useState(false);
  const [selectedDays, setSelectedDays] = useState<any>([]);
  const [inputDateErrors, setInputDateErrors] = useState([false]);
  const [startTimeErrors, setStartTimeErrors] = useState([false]);
  const [inputTypeDate, setInputTypeDate] = useState(["text"]);
  const [inputTypeStartTime, setInputTypeStartTime] = useState(["text"]);
  const [isAdmin, setIsAdmin] = useState(false);

  const toggleColor = (index: number) => {
    if (selectedDays.includes(index)) {
      setSelectedDays(
        selectedDays.filter((dayIndex: number) => dayIndex !== index)
      );
    } else {
      setSelectedDays([...selectedDays, index]);
    }
  };

  let Task = [
    hasPermissionWorklog("Task/SubTask", "View", "WorkLogs") && "Task",
    hasPermissionWorklog("Task/SubTask", "View", "WorkLogs") && "Sub-Task",
    hasPermissionWorklog("CheckList", "View", "WorkLogs") && "Checklist",
    hasPermissionWorklog("Comment", "View", "WorkLogs") && "Comments",
    hasPermissionWorklog("Reccuring", "View", "WorkLogs") && "Recurring",
    "Manual Time",
    "Reviewer Manual Time",
    hasPermissionWorklog("Reminder", "View", "WorkLogs") && "Reminder",
    hasPermissionWorklog("ErrorLog", "View", "WorkLogs") && "Error Logs",
    "Reviewer's Note",
    "Logs",
  ];

  useEffect(() => {
    onComment === true ? scrollToPanel(3) : scrollToPanel(0);
    onErrorLog === true ? scrollToPanel(8) : scrollToPanel(0);
    onManualTime === true ? scrollToPanel(6) : scrollToPanel(0);
  }, [onEdit, onComment, onErrorLog, onManualTime]);

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
      setReminderNotificationApprovals(value);
    } else {
      setReminderNotificationApprovals([]);
    }
  };

  const handleMultiSelectMonth = (
    e: React.SyntheticEvent,
    value: LabelValue[]
  ) => {
    if (value !== undefined) {
      setRecurringMonthApprovals(value);
    } else {
      setRecurringMonthApprovals([]);
    }
  };

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

  // Task
  const [taskApprovalsDrawer, setTaskApprovalsDrawer] = useState(true);
  const [clientApprovalsDropdownData, setClientApprovalsDropdownData] =
    useState([]);
  const [clientNameApprovals, setClientNameApprovals] = useState<any>(0);
  const [clientNameApprovalsErr, setClientNameApprovalsErr] = useState(false);
  const [workTypeApprovalsDropdownData, setWorkTypeApprovalsDropdownData] =
    useState([]);
  const [typeOfWorkApprovals, setTypeOfWorkApprovals] = useState<any>(0);
  const [typeOfWorkApprovalsErr, setTypeOfWorkApprovalsErr] = useState(false);
  const [projectApprovalsDropdownData, setProjectApprovalsDropdownData] =
    useState([]);
  const [projectNameApprovals, setProjectNameApprovals] = useState<any>(0);
  const [projectNameApprovalsErr, setProjectNameApprovalsErr] = useState(false);
  const [processApprovalsDropdownData, setProcessApprovalsDropdownData] =
    useState([]);
  const [processNameApprovals, setProcessNameApprovals] = useState<any>(0);
  const [processNameApprovalsErr, setProcessNameApprovalsErr] = useState(false);
  const [subProcessApprovalsDropdownData, setSubProcessApprovalsDropdownData] =
    useState([]);
  const [subProcessApprovals, setSubProcessApprovals] = useState<any>(0);
  const [subProcessApprovalsErr, setSubProcessApprovalsErr] = useState(false);
  const [statusApprovalsDropdownData, setStatusApprovalsDropdownData] =
    useState<any>([]);
  const [statusApprovalsDropdownDataUse, setStatusApprovalsDropdownDataUse] =
    useState<any>([]);
  const [
    statusApprovalsDropdownDataUseAllTask,
    setStatusApprovalsDropdownDataUseAllTask,
  ] = useState<any>([]);
  const [
    errorlogSignedOffPendingApprovals,
    setErrorlogSignOffPendingApprovals,
  ] = useState(false);
  const [editStatusApprovals, setEditStatusApprovals] = useState(0);
  const [statusApprovals, setStatusApprovals] = useState<any>(0);
  const [statusApprovalsErr, setStatusApprovalsErr] = useState(false);
  const [statusApprovalsType, setStatusApprovalsType] = useState<string | null>(
    null
  );
  const [assigneeApprovalsDropdownData, setAssigneeApprovalsDropdownData] =
    useState<any>([]);
  const [assigneeApprovals, setAssigneeApprovals] = useState<any>(0);
  const [assigneeApprovalsErr, setAssigneeApprovalsErr] = useState(false);
  const [reviewerApprovalsDropdownData, setReviewerApprovalsDropdownData] =
    useState([]);
  const [reviewerApprovals, setReviewerApprovals] = useState<any>(0);
  const [reviewerApprovalsErr, setReviewerApprovalsErr] = useState(false);
  const [departmentApprovalsDropdownData, setDepartmentApprovalsDropdownData] =
    useState([]);
  const [departmentApprovals, setDepartmentApprovals] = useState<number>(0);
  const [departmentApprovalsType, setDepartmentApprovalsType] =
    useState<string>("");
  const [departmentApprovalsErr, setDepartmentApprovalsErr] = useState(false);
  const [managerApprovalsDropdownData, setManagerApprovalsDropdownData] =
    useState<any>([]);
  const [managerApprovals, setManagerApprovals] = useState<any>(0);
  const [managerApprovalsErr, setManagerApprovalsErr] = useState(false);
  const isQaApprovalsDropdownData = [
    {
      label: "Yes",
      value: 1,
    },
    {
      label: "No",
      value: 0,
    },
  ];
  const [isQaApprovals, setIsQaApprovals] = useState<number>(0);
  const [qaQuantityApprovals, setQAQuantityApprovals] = useState<number | null>(
    null
  );
  const [clientTaskNameApprovals, setClientTaskNameApprovals] =
    useState<string>("");
  const [clientTaskNameApprovalsErr, setClientTaskNameApprovalsErr] =
    useState(false);
  const [descriptionApprovals, setDescriptionApprovals] = useState<string>("");
  const [descriptionApprovalsErr, setDescriptionApprovalsErr] =
    useState<boolean>(false);
  const [priorityApprovals, setPriorityApprovals] = useState<string | number>(
    0
  );
  const [quantityApprovals, setQuantityApprovals] = useState<any>(1);
  const [quantityApprovalsErr, setQuantityApprovalsErr] = useState(false);
  const [receiverDateApprovals, setReceiverDateApprovals] = useState<any>("");
  const [receiverDateApprovalsErr, setReceiverDateApprovalsErr] =
    useState(false);
  const [dueDateApprovals, setDueDateApprovals] = useState<any>("");
  const [allInfoDateApprovals, setAllInfoDateApprovals] = useState<any>("");
  const [dateOfReviewApprovals, setDateOfReviewApprovals] =
    useState<string>("");
  const [dateOfPreperationApprovals, setDateOfPreperationApprovals] =
    useState<string>("");
  const [assigneeDisableApprovals, setAssigneeDisableApprovals] =
    useState<any>(true);
  const [estTimeDataApprovals, setEstTimeDataApprovals] = useState([]);
  const [returnYearApprovals, setReturnYearApprovals] = useState<number>(0);
  const [returnYearApprovalsErr, setReturnYearApprovalsErr] = useState(false);
  const [noOfPagesApprovals, setNoOfPagesApprovals] = useState<any>(0);
  const [checklistWorkpaperApprovals, setChecklistWorkpaperApprovals] =
    useState<any>(0);
  const [checklistWorkpaperApprovalsErr, setChecklistWorkpaperApprovalsErr] =
    useState(false);
  const [valueMonthYearFrom, setValueMonthYearFrom] = useState<any>(null);
  const [valueMonthYearTo, setValueMonthYearTo] = useState<any>(null);
  const [reworkReceiverDateApprovals, setReworkReceiverDateApprovals] =
    useState("");
  const [reworkReceiverDateApprovalsErr, setReworkReceiverDateApprovalsErr] =
    useState(false);
  const [reworkDueDateApprovals, setReworkDueDateApprovals] = useState("");
  const [missingInfoApprovals, setMissingInfoApprovals] = useState<
    string | null
  >(null);
  const [missingInfoApprovalsErr, setMissingInfoApprovalsErr] =
    useState<boolean>(false);

  let reviewerDate = new Date();
  reviewerDate.setDate(reviewerDate.getDate() - 1);

  const previousYearStartDate = dayjs()
    .subtract(1, "year")
    .startOf("year")
    .toDate();
  const currentYearEndDate = dayjs().endOf("year").toDate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      let adminStatus = localStorage.getItem("isAdmin") === "true";
      setIsAdmin(adminStatus);
    }
  }, [onOpen]);

  // Sub-Task
  const [subTaskApprovalsDrawer, setSubTaskApprovalsDrawer] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<null | File>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [subTaskSwitchApprovals, setSubTaskSwitchApprovals] = useState(false);
  const [subTaskFieldsApprovals, setSubTaskFieldsApprovals] = useState([
    {
      SubtaskId: 0,
      Title: "",
      Description: "",
      CustomerName: "",
      InvoiceNumber: "",
      SubTaskDate: "",
      BillAmount: "",
      SubTaskErrorLogFlag: false,
    },
  ]);
  const [taskNameApprovalsErr, setTaskNameApprovalsErr] = useState([false]);
  const [vendorNameApprovalsErr, setVendorNameApprovalsErr] = useState([false]);
  const [invoiceNameApprovalsErr, setInvoiceNameApprovalsErr] = useState([
    false,
  ]);
  const [dateApprovalsErr, setDateApprovalsErr] = useState([false]);
  const [billAmountApprovalsErr, setBillAmountApprovalsErr] = useState([false]);
  const [deletedSubTaskApprovals, setDeletedSubTaskApprovals] = useState<any>(
    []
  );
  const [subTaskOptions, setSubTaskOptions] = useState<
    { value: number; label: string }[]
  >([]);

  const addTaskFieldApprovals = () => {
    setSubTaskFieldsApprovals([
      ...subTaskFieldsApprovals,
      {
        SubtaskId: 0,
        Title: "",
        Description: "",
        CustomerName: "",
        InvoiceNumber: "",
        SubTaskDate: "",
        BillAmount: "",
        SubTaskErrorLogFlag: false,
      },
    ]);
    setTaskNameApprovalsErr([...taskNameApprovalsErr, false]);
    setVendorNameApprovalsErr([...vendorNameApprovalsErr, false]);
    setInvoiceNameApprovalsErr([...invoiceNameApprovalsErr, false]);
    setDateApprovalsErr([...dateApprovalsErr, false]);
    setBillAmountApprovalsErr([...billAmountApprovalsErr, false]);
  };

  const removeTaskFieldApprovals = (index: number) => {
    setDeletedSubTaskApprovals([
      ...deletedSubTaskApprovals,
      subTaskFieldsApprovals[index].SubtaskId,
    ]);

    const newTaskFields = [...subTaskFieldsApprovals];
    newTaskFields.splice(index, 1);
    setSubTaskFieldsApprovals(newTaskFields);

    const newTaskErrors = [...taskNameApprovalsErr];
    newTaskErrors.splice(index, 1);
    setTaskNameApprovalsErr(newTaskErrors);

    const newVendorApprovalsErrors = [...vendorNameApprovalsErr];
    newVendorApprovalsErrors.splice(index, 1);
    setVendorNameApprovalsErr(newVendorApprovalsErrors);

    const newInvoiceApprovalsErrors = [...invoiceNameApprovalsErr];
    newInvoiceApprovalsErrors.splice(index, 1);
    setInvoiceNameApprovalsErr(newInvoiceApprovalsErrors);

    const newDateApprovalsErrors = [...dateApprovalsErr];
    newDateApprovalsErrors.splice(index, 1);
    setDateApprovalsErr(newDateApprovalsErrors);

    const newBillApprovalsErrors = [...billAmountApprovalsErr];
    newBillApprovalsErrors.splice(index, 1);
    setBillAmountApprovalsErr(newBillApprovalsErrors);

    subTaskFieldsApprovals.length === 1 &&
      subTaskFieldsApprovals[0].SubtaskId > 0 &&
      handleRemoveSubTaskApprovals(subTaskFieldsApprovals[0].SubtaskId);
  };

  useEffect(() => {
    subTaskFieldsApprovals.length <= 0 && addTaskFieldApprovals();
  }, [subTaskFieldsApprovals]);

  const handleSubTaskChangeApprovals = (e: string, index: number) => {
    const newTaskFields = [...subTaskFieldsApprovals];
    newTaskFields[index].Title = e;
    setSubTaskFieldsApprovals(newTaskFields);

    const newTaskErrors = [...taskNameApprovalsErr];
    const isDuplicate = newTaskFields
      .filter((_, idx) => idx !== index)
      .some(
        (task) => task.Title.trim().toLowerCase() === e.trim().toLowerCase()
      );
    newTaskErrors[index] =
      e.trim().length < 2 || e.trim().length > 50 || isDuplicate;
    setTaskNameApprovalsErr(newTaskErrors);
  };

  const handleSubTaskDescriptionChangeApprovals = (
    e: string,
    index: number
  ) => {
    const newTaskFields = [...subTaskFieldsApprovals];
    newTaskFields[index].Description = e;
    setSubTaskFieldsApprovals(newTaskFields);
  };

  const handleSubTaskVendorChangeApprovals = (e: string, index: number) => {
    const newVendorApprovalsFields = [...subTaskFieldsApprovals];
    newVendorApprovalsFields[index].CustomerName = e;
    setSubTaskFieldsApprovals(newVendorApprovalsFields);

    const newVendorApprovalsErrors = [...vendorNameApprovalsErr];
    newVendorApprovalsErrors[index] =
      e.trim().length < 2 || e.trim().length > 50;
    setVendorNameApprovalsErr(newVendorApprovalsErrors);
  };

  const handleSubTaskInvoiceChangeApprovals = (e: string, index: number) => {
    const sanitizedValue = e.replace(/[^a-zA-Z0-9]/g, "");

    const newInvoiceApprovalsFields = [...subTaskFieldsApprovals];
    newInvoiceApprovalsFields[index].InvoiceNumber = sanitizedValue;
    setSubTaskFieldsApprovals(newInvoiceApprovalsFields);

    const newInvoiceApprovalsErrors = [...invoiceNameApprovalsErr];
    newInvoiceApprovalsErrors[index] =
      e.trim().length < 1 || e.trim().length > 25;
    setInvoiceNameApprovalsErr(newInvoiceApprovalsErrors);
  };

  const handleSubTaskDateChangeApprovals = (e: string, index: number) => {
    const newDateApprovalsFields = [...subTaskFieldsApprovals];
    newDateApprovalsFields[index].SubTaskDate = e;
    setSubTaskFieldsApprovals(newDateApprovalsFields);

    const newDateApprovalsErrors = [...dateApprovalsErr];
    newDateApprovalsErrors[index] = e.trim().length <= 0;
    setDateApprovalsErr(newDateApprovalsErrors);
  };

  const handleSubTaskBillAmountChangeApprovals = (e: string, index: number) => {
    const regex = /^\d{0,8}(\.\d{0,2})?$/;

    if (regex.test(e)) {
      const newBillAmountApprovalsFields = [...subTaskFieldsApprovals];
      newBillAmountApprovalsFields[index].BillAmount = e;
      setSubTaskFieldsApprovals(newBillAmountApprovalsFields);

      const newBillAmountApprovalsErrors = [...billAmountApprovalsErr];
      newBillAmountApprovalsErrors[index] =
        e.trim().length < 1 || parseFloat(e) === 0;
      setBillAmountApprovalsErr(newBillAmountApprovalsErrors);
    }
  };

  const handleApplyImportExcel = async (taskId: number) => {
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");

    if (selectedFile) {
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("Files", selectedFile);
        formData.append(
          "WorkItemId",
          onEdit > 0 ? onEdit.toString() : taskId.toString()
        );

        const response = await axios.post(
          `${process.env.worklog_api_url}/workitem/importWorkSubItemexcel`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `bearer ${token}`,
              org_token: `${Org_Token}`,
            },
          }
        );

        if (response.status === 200) {
          if (response.data.ResponseStatus === "Success") {
            toast.success("Task has been imported successfully.");
            getSubTaskDataOption();
            getSubTaskDataApprovals();
            setIsUploading(false);
            setIsImportOpen(false);
            setSelectedFile(null);
            setFileInputKey((prevKey: any) => prevKey + 1);
            onEdit === 0 && handleClose();
          } else if (response.data.ResponseStatus === "Warning") {
            toast.warning(
              `Valid Task has been imported and an Excel file ${response.data.ResponseData.FileDownloadName} has been downloaded for invalid tasks.`
            );

            const byteCharacters = atob(
              response.data.ResponseData.FileContents
            );
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            const fileBlob = new Blob([byteArray], {
              type: `${response.data.ResponseData.ContentType}`,
            });

            const fileURL = URL.createObjectURL(fileBlob);
            const downloadLink = document.createElement("a");
            downloadLink.href = fileURL;
            downloadLink.setAttribute(
              "download",
              response.data.ResponseData.FileDownloadName
            );
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(fileURL);

            setIsUploading(false);
            getSubTaskDataOption();
            getSubTaskDataApprovals();
            setIsImportOpen(false);
            setSelectedFile(null);
            setFileInputKey((prevKey: any) => prevKey + 1);
            onEdit === 0 && handleClose();
          } else {
            toast.error(
              "The uploaded file is not in the format of the sample file."
            );
            setIsUploading(false);
            setIsImportOpen(false);
            setSelectedFile(null);
            setFileInputKey((prevKey: any) => prevKey + 1);
            onEdit === 0 && handleClose();
          }
        } else {
          toast.error("Please try again later.");
          setIsUploading(false);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getSubTaskDataApprovals = async () => {
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
        setSubTaskSwitchApprovals(
          hasPermissionWorklog("Task/SubTask", "save", "WorkLogs")
        );
        setSubTaskFieldsApprovals(
          ResponseData.map((i) => ({
            SubtaskId: i.SubtaskId,
            Title: i.Title,
            Description: i.Description,
            CustomerName: !!i.CustomerName ? i.CustomerName : "",
            InvoiceNumber: !!i.InvoiceNumber ? i.InvoiceNumber : "",
            SubTaskDate: !!i.SubTaskDate ? i.SubTaskDate : "",
            BillAmount: i.BillAmount !== null ? i.BillAmount : "",
            SubTaskErrorLogFlag: !!i.SubTaskErrorLogFlag
              ? i.SubTaskErrorLogFlag
              : false,
          }))
        );
      } else {
        setSubTaskSwitchApprovals(false);
        setSubTaskFieldsApprovals([
          {
            SubtaskId: 0,
            Title: "",
            Description: "",
            CustomerName: "",
            InvoiceNumber: "",
            SubTaskDate: "",
            BillAmount: "",
            SubTaskErrorLogFlag: false,
          },
        ]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSubmitSubTaskApprovals = async () => {
    let hasSubErrors = false;
    const newTaskErrors = subTaskFieldsApprovals.map(
      (field, index) =>
        (subTaskSwitchApprovals && field.Title.trim().length < 2) ||
        (subTaskSwitchApprovals && field.Title.trim().length > 50) ||
        (subTaskSwitchApprovals &&
          subTaskFieldsApprovals.some(
            (task, idx) =>
              idx !== index &&
              task.Title.trim().toLowerCase() ===
                field.Title.trim().toLowerCase()
          ))
    );
    subTaskSwitchApprovals && setTaskNameApprovalsErr(newTaskErrors);
    const newVendorErrors = subTaskFieldsApprovals.map(
      (field) =>
        (subTaskSwitchApprovals && field.CustomerName.trim().length < 2) ||
        (subTaskSwitchApprovals && field.CustomerName.trim().length > 50)
    );
    subTaskSwitchApprovals && setVendorNameApprovalsErr(newVendorErrors);
    const newInvoiceErrors = subTaskFieldsApprovals.map(
      (field) =>
        (subTaskSwitchApprovals &&
          field.InvoiceNumber.toString().trim().length < 1) ||
        (subTaskSwitchApprovals &&
          field.InvoiceNumber.toString().trim().length > 25)
    );
    subTaskSwitchApprovals && setInvoiceNameApprovalsErr(newInvoiceErrors);
    const newDateErrors = subTaskFieldsApprovals.map(
      (field) => subTaskSwitchApprovals && field.SubTaskDate.trim().length <= 0
    );
    subTaskSwitchApprovals && setDateApprovalsErr(newDateErrors);
    const newBillAmountErrors = subTaskFieldsApprovals.map(
      (field) =>
        subTaskSwitchApprovals &&
        (field.BillAmount.toString().trim().length <= 0 ||
          parseFloat(field.BillAmount.toString().trim()) === 0)
    );
    subTaskSwitchApprovals && setBillAmountApprovalsErr(newBillAmountErrors);
    hasSubErrors =
      newTaskErrors.some((error) => error) ||
      newVendorErrors.some((error) => error) ||
      newInvoiceErrors.some((error) => error) ||
      newDateErrors.some((error) => error) ||
      newBillAmountErrors.some((error) => error);

    if (hasPermissionWorklog("Task/SubTask", "save", "WorkLogs")) {
      if (!hasSubErrors) {
        setIsLoadingApprovals(true);
        const params = {
          workitemId: onEdit,
          subtasks: subTaskSwitchApprovals
            ? subTaskFieldsApprovals.map(
                (i: SubtaskGetByWorkitem) =>
                  new Object({
                    SubtaskId: i.SubtaskId,
                    Title: i.Title.trim(),
                    Description: i.Description.trim(),
                    CustomerName: !!i.CustomerName ? i.CustomerName.trim() : "",
                    InvoiceNumber: !!i.InvoiceNumber
                      ? i.InvoiceNumber.toString().trim()
                      : "",
                    SubTaskDate: !!i.SubTaskDate ? i.SubTaskDate.trim() : "",
                    BillAmount: !!i.BillAmount
                      ? i.BillAmount.toString().trim()
                      : "",
                  })
              )
            : null,
          deletedWorkitemSubtaskIds: deletedSubTaskApprovals,
        };
        const url = `${process.env.worklog_api_url}/workitem/subtask/savebyworkitem`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Sub Task Updated successfully.`);
            setDeletedSubTaskApprovals([]);
            setSubTaskFieldsApprovals([
              {
                SubtaskId: 0,
                Title: "",
                Description: "",
                CustomerName: "",
                InvoiceNumber: "",
                SubTaskDate: "",
                BillAmount: "",
                SubTaskErrorLogFlag: false,
              },
            ]);
            setIsLoadingApprovals(false);
            getSubTaskDataOption();
            getSubTaskDataApprovals();
          }
          setIsLoadingApprovals(false);
        };
        callAPI(url, params, successCallback, "POST");
      }
    } else {
      toast.error("User don't have permission to Update Sub-Task.");
      getSubTaskDataApprovals();
    }
  };

  const handleRemoveSubTaskApprovals = async (id: number) => {
    if (hasPermissionWorklog("Task/SubTask", "save", "WorkLogs")) {
      setIsLoadingApprovals(true);
      const params = {
        workitemId: onEdit,
        subtasks: null,
        deletedWorkitemSubtaskIds: [...deletedSubTaskApprovals, id],
      };
      const url = `${process.env.worklog_api_url}/workitem/subtask/savebyworkitem`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success(`Sub Task Updated successfully.`);
          setDeletedSubTaskApprovals([]);
          setSubTaskFieldsApprovals([
            {
              SubtaskId: 0,
              Title: "",
              Description: "",
              CustomerName: "",
              InvoiceNumber: "",
              SubTaskDate: "",
              BillAmount: "",
              SubTaskErrorLogFlag: false,
            },
          ]);
          setIsLoadingApprovals(false);
          getSubTaskDataOption();
          getSubTaskDataApprovals();
        }
        setIsLoadingApprovals(false);
      };
      callAPI(url, params, successCallback, "POST");
    } else {
      toast.error("User don't have permission to Update Sub-Task.");
      getSubTaskDataApprovals();
    }
  };

  // Recurring
  const [recurringApprovalsDrawer, setRecurringApprovalsDrawer] =
    useState(true);
  const [recurringStartDateApprovals, setRecurringStartDateApprovals] =
    useState("");
  const [recurringEndDateApprovals, setRecurringEndDateApprovals] =
    useState("");
  const [recurringTimeApprovals, setRecurringTimeApprovals] = useState<any>(1);
  const [recurringMonthApprovals, setRecurringMonthApprovals] =
    useState<any>(0);

  const getRecurringDataApprovals = async () => {
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
        setRecurringStartDateApprovals(ResponseData.StartDate);
        setRecurringEndDateApprovals(ResponseData.EndDate);
        setRecurringTimeApprovals(ResponseData.Type);
        ResponseData.Type === 2
          ? setSelectedDays(ResponseData.Triggers)
          : ResponseData.Type === 3
          ? setRecurringMonthApprovals(
              ResponseData.Triggers.map((trigger: number) =>
                months.find((month) => month.value === trigger)
              ).filter(Boolean)
            )
          : [];
      } else {
        setRecurringStartDateApprovals("");
        setRecurringEndDateApprovals("");
        setRecurringTimeApprovals(0);
        setSelectedDays([]);
        setRecurringMonthApprovals(0);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  // ManualTime
  const [manualFieldsApprovals, setManualFieldsApprovals] = useState<
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

  const getManualDataApprovals = async () => {
    const params = {
      WorkitemId: onEdit,
    };
    const url = `${process.env.worklog_api_url}/workitem/timelog/getManuallogByWorkitem`;
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
        setManualFieldsApprovals(
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
        setManualFieldsApprovals([
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

  // Reminder
  const [reminderApprovalsDrawer, setReminderApprovalsDrawer] = useState(true);
  const [reminderSwitchApprovals, setReminderSwitchApprovals] = useState(false);
  const [reminderDateApprovals, setReminderDateApprovals] = useState("");
  const [reminderDateApprovalsErr, setReminderDateApprovalsErr] =
    useState(false);
  const [reminderTimeApprovals, setReminderTimeApprovals] = useState<any>(0);
  const [reminderTimeApprovalsErr, setReminderTimeApprovalsErr] =
    useState(false);
  const [reminderNotificationApprovals, setReminderNotificationApprovals] =
    useState<any>([]);
  const [
    reminderNotificationApprovalsErr,
    setReminderNotificationApprovalsErr,
  ] = useState(false);
  const [reminderCheckboxValueApprovals, setReminderCheckboxValueApprovals] =
    useState<any>(1);
  const [reminderIdApprovals, setReminderIdApprovals] = useState(0);

  const getReminderDataApprovals = async () => {
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
        setReminderIdApprovals(ResponseData.ReminderId);
        setReminderSwitchApprovals(
          ResponseData === null &&
            !hasPermissionWorklog("Reminder", "save", "WorkLogs")
            ? false
            : true
        );
        setReminderCheckboxValueApprovals(ResponseData.ReminderType);
        setReminderDateApprovals(
          ResponseData.ReminderDate === null ? "" : ResponseData.ReminderDate
        );
        setReminderTimeApprovals(ResponseData.ReminderTime);
        setReminderNotificationApprovals(
          ResponseData.ReminderUserIds.map((reminderUserId: number) =>
            assigneeApprovalsDropdownData.find(
              (assignee: { value: number }) => assignee.value === reminderUserId
            )
          ).filter(Boolean)
        );
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSubmitReminderApprovals = async () => {
    const fieldValidations = {
      reminderTime:
        reminderSwitchApprovals && validateField(reminderTimeApprovals),
      reminderNotification:
        reminderSwitchApprovals && validateField(reminderNotificationApprovals),
      reminderDate:
        reminderSwitchApprovals &&
        reminderCheckboxValueApprovals === 2 &&
        validateField(reminderDateApprovals),
    };

    reminderSwitchApprovals &&
      setReminderTimeApprovalsErr(fieldValidations.reminderTime);
    reminderSwitchApprovals &&
      setReminderNotificationApprovalsErr(
        fieldValidations.reminderNotification
      );
    reminderSwitchApprovals &&
      reminderCheckboxValueApprovals === 2 &&
      setReminderDateApprovalsErr(fieldValidations.reminderDate);

    const hasErrors = Object.values(fieldValidations).some((error) => error);

    if (hasPermissionWorklog("Reminder", "save", "WorkLogs")) {
      if (!hasErrors) {
        setIsLoadingApprovals(true);
        const params = {
          ReminderId: reminderIdApprovals,
          ReminderType: reminderCheckboxValueApprovals,
          WorkitemId: onEdit,
          ReminderDate:
            reminderCheckboxValueApprovals === 2
              ? dayjs(reminderDateApprovals).format("YYYY/MM/DD")
              : null,
          ReminderTime: reminderTimeApprovals,
          ReminderUserIds: reminderNotificationApprovals.map(
            (i: LabelValue) => i.value
          ),
        };
        const url = `${process.env.worklog_api_url}/workitem/reminder/savebyworkitem`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Reminder Updated successfully.`);
            getReminderDataApprovals();
            setReminderIdApprovals(0);
            setIsLoadingApprovals(false);
          }
          setIsLoadingApprovals(false);
        };
        callAPI(url, params, successCallback, "POST");
      }
    } else {
      toast.error("User don't have permission to Update Recurring.");
      getRecurringDataApprovals();
    }
  };

  // Checklist
  const [checkListApprovalsDrawer, setCheckListApprovalsDrawer] =
    useState(true);
  const [checkListNameApprovals, setCheckListNameApprovals] = useState("");
  const [checkListNameApprovalsError, setCheckListNameApprovalsError] =
    useState(false);
  const [checkListDataApprovals, setCheckListDataApprovals] = useState([]);
  const [itemStatesApprovals, setItemStatesApprovals] = useState<any>({});

  const toggleGeneralOpen = (index: number) => {
    setItemStatesApprovals((prevStates: any) => ({
      ...prevStates,
      [index]: !prevStates[index],
    }));
  };

  const toggleAddChecklistField = (index: number) => {
    setItemStatesApprovals((prevStates: any) => ({
      ...prevStates,
      [`addChecklistField_${index}`]: !prevStates[`addChecklistField_${index}`],
    }));
  };

  const handleSaveCheckListNameApprovals = async (
    Category: any,
    index: number
  ) => {
    if (hasPermissionWorklog("CheckList", "save", "WorkLogs")) {
      setCheckListNameApprovalsError(
        checkListNameApprovals.trim().length < 5 ||
          checkListNameApprovals.trim().length > 500
      );

      if (
        !checkListNameApprovalsError &&
        checkListNameApprovals.trim().length > 4 &&
        checkListNameApprovals.trim().length < 500
      ) {
        setIsLoadingApprovals(true);
        const params = {
          workItemId: onEdit,
          category: Category,
          title: checkListNameApprovals,
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
            setCheckListNameApprovals("");
            getCheckListDataApprovals();
            toggleAddChecklistField(index);
            setIsLoadingApprovals(false);
          }
          setIsLoadingApprovals(false);
        };
        callAPI(url, params, successCallback, "POST");
      }
    } else {
      toast.error("User don't have permission to Add Checklist.");
      getCheckListDataApprovals();
    }
  };

  const getCheckListDataApprovals = async () => {
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
        setCheckListDataApprovals(ResponseData);
      } else {
        setCheckListDataApprovals([]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleChangeChecklistApprovals = async (
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
      setIsLoadingApprovals(true);
      const url = `${process.env.worklog_api_url}/workitem/checklist/savebyworkitem`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success(`CheckList Updated successfully.`);
          getCheckListDataApprovals();
          setIsLoadingApprovals(false);
        }
        setIsLoadingApprovals(false);
      };
      callAPI(url, params, successCallback, "POST");
    } else {
      toast.error("User don't have permission to Add Checklist.");
      getCheckListDataApprovals();
    }
  };

  // Comments
  const [commentsApprovalsDrawer, setCommentsApprovalsDrawer] = useState(true);
  const [commentSelectApprovals, setCommentSelectApprovals] =
    useState<number>(1);
  const [commentDataApprovals, setCommentDataApprovals] = useState<
    CommentGetByWorkitem[] | []
  >([]);
  const [value, setValue] = useState("");
  const [valueError, setValueError] = useState(false);
  const [fileHasError, setFileHasError] = useState(false);
  const [valueEdit, setValueEdit] = useState("");
  const [valueEditError, setValueEditError] = useState(false);
  const [fileEditHasError, setFileEditHasError] = useState(false);
  const [mention, setMention] = useState<any>([]);
  const [editingCommentIndexApprovals, setEditingCommentIndexApprovals] =
    useState(-1);
  const [commentAttachmentApprovals, setCommentAttachmentApprovals] = useState<
    CommentAttachment[]
  >([
    {
      AttachmentId: 0,
      UserFileName: "",
      SystemFileName: "",
      AttachmentPath: process.env.attachment || "",
    },
  ]);
  const [commentUserDataApprovals, setCommentUserDataApprovals] = useState([]);

  const users: { id: number; display: string }[] =
    commentUserDataApprovals?.length > 0
      ? commentUserDataApprovals.map((i: LabelValue) => ({
          id: i.value,
          display: i.label,
        }))
      : [];

  const handleEditClick = (index: number, message: string) => {
    setEditingCommentIndexApprovals(index);
    setValueEdit(message);
  };

  const handleSaveClickApprovals = async (
    e: any,
    i: CommentGetByWorkitem,
    type: number
  ) => {
    e.preventDefault();
    setValueEditError(valueEdit.trim().length < 1);

    if (hasPermissionWorklog("Comment", "Save", "WorkLogs")) {
      if (valueEdit.trim().length > 1 && !valueEditError && !fileEditHasError) {
        setIsLoadingApprovals(true);
        const params = {
          workitemId: onEdit,
          CommentId: i.CommentId,
          Message: valueEdit,
          TaggedUsers: mention,
          Attachment:
            commentAttachmentApprovals[0].SystemFileName.length > 0
              ? commentAttachmentApprovals
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
            setMention([]);
            setCommentAttachmentApprovals([
              {
                AttachmentId: 0,
                UserFileName: "",
                SystemFileName: "",
                AttachmentPath: process.env.attachment || "",
              },
            ]);
            setValueEditError(false);
            setValueEdit("");
            getCommentDataApprovals(1);
            setEditingCommentIndexApprovals(-1);
            setIsLoadingApprovals(false);
          }
          setIsLoadingApprovals(false);
        };
        callAPI(url, params, successCallback, "POST");
      }
    } else {
      toast.error("User don't have permission to Update Task.");
      setCommentSelectApprovals(1);
      getCommentDataApprovals(1);
    }
  };

  const handleCommentChange = (e: string) => {
    setMention(
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
    setValueError(false);
  };

  const handleCommentAttachmentsChange = (
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
    setCommentAttachmentApprovals(Attachment);
  };

  const getCommentDataApprovals = async (type: number) => {
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
        setCommentDataApprovals(ResponseData);
      } else {
        setCommentDataApprovals([]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSubmitComment = async (
    e: { preventDefault: () => void },
    type: number
  ) => {
    e.preventDefault();
    setValueError(value.trim().length < 5);

    if (hasPermissionWorklog("Comment", "Save", "WorkLogs")) {
      if (value.trim().length >= 5 && !valueError && !fileHasError) {
        setIsLoadingApprovals(true);
        const params = {
          workitemId: onEdit,
          CommentId: 0,
          Message: value,
          TaggedUsers: mention,
          Attachment:
            commentAttachmentApprovals[0].SystemFileName.length > 0
              ? commentAttachmentApprovals
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
            setMention([]);
            setCommentAttachmentApprovals([
              {
                AttachmentId: 0,
                UserFileName: "",
                SystemFileName: "",
                AttachmentPath: process.env.attachment || "",
              },
            ]);
            setValueEditError(false);
            setValueEdit("");
            setValue("");
            getCommentDataApprovals(commentSelectApprovals);
            setIsLoadingApprovals(false);
          }
          setIsLoadingApprovals(false);
        };
        callAPI(url, params, successCallback, "POST");
      }
    } else {
      toast.error("User don't have permission to Update Task.");
      setCommentSelectApprovals(1);
      getCommentDataApprovals(1);
    }
  };

  // ErrorLogs
  const [errorLogApprovalsDrawer, setErorLogApprovalsDrawer] = useState(true);
  const [cCDropdownDataApprovals, setCCDropdownDataApprovals] = useState<any>(
    []
  );
  const [errorLogFieldsApprovals, setErrorLogFieldsApprovals] = useState<
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
      SubTaskId: 0,
    },
  ]);
  const [errorTypeErrApprovals, setErrorTypeErrApprovals] = useState([false]);
  const [impactErrApprovals, setImpactErrApprovals] = useState([false]);
  const [rootCauseErrApprovals, setRootCauseErrApprovals] = useState([false]);
  const [errorLogPriorityErrApprovals, setErrorLogPriorityErrApprovals] =
    useState([false]);
  const [errorCountErrApprovals, setErrorCountErrApprovals] = useState([false]);
  const [natureOfErrApprovals, setNatureOfErrApprovals] = useState([false]);
  const [documentNumberErrApprovals, setDocumentNumberErrApprovals] = useState([
    false,
  ]);
  const [vendorNameErrApprovals, setVendorNameErrApprovals] = useState([false]);
  const [rcaErrApprovals, setRcaErrApprovals] = useState([false]);
  const [recordedDateErrApprovals, setRecordedDateErrApprovals] = useState([
    false,
  ]);
  const [mitigationErrApprovals, setMitigationErrApprovals] = useState([false]);
  const [contigencyPlanErrApprovals, setContigencyPlanErrApprovals] = useState([
    false,
  ]);
  const [imageErrApprovals, setImageErrApprovals] = useState([false]);
  const [errorIdentificationErrApprovals, setErrorIdentificationErrApprovals] =
    useState([false]);
  const [resolutionStatusErrApprovals, setResolutionStatusErrApprovals] =
    useState([false]);
  const [identifiedByErrApprovals, setIdentifiedByErrApprovals] = useState([
    false,
  ]);
  const [deletedErrorLogApprovals, setDeletedErrorLogApprovals] = useState<any>(
    []
  );
  const [natureOfErrorDropdown, setNatureOfErrorDropdown] = useState([]);

  const getSubTaskDataOption = async () => {
    const data = await getSubTaskDropdownData(onEdit);
    data.length > 0 && setSubTaskOptions(data);
  };

  useEffect(() => {
    const getData = async () => {
      const data = await getNatureOfErrorDropdownData();
      data.length > 0 && setNatureOfErrorDropdown(data);
      getSubTaskDataOption();
    };

    onOpen && onEdit > 0 && getData();
  }, [onOpen]);

  const addErrorLogFieldApprovals = () => {
    setErrorLogFieldsApprovals([
      ...errorLogFieldsApprovals,
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
        SubTaskId: 0,
      },
    ]);
    setErrorTypeErrApprovals([...errorTypeErrApprovals, false]);
    setRootCauseErrApprovals([...rootCauseErrApprovals, false]);
    setImpactErrApprovals([...impactErrApprovals, false]);
    setErrorLogPriorityErrApprovals([...errorLogPriorityErrApprovals, false]);
    setErrorCountErrApprovals([...errorCountErrApprovals, false]);
    setNatureOfErrApprovals([...natureOfErrApprovals, false]);
    setDocumentNumberErrApprovals([...documentNumberErrApprovals, false]);
    setVendorNameErrApprovals([...vendorNameErrApprovals, false]);
    setRcaErrApprovals([...rcaErrApprovals, false]);
    setRecordedDateErrApprovals([...recordedDateErrApprovals, false]);
    setErrorIdentificationErrApprovals([
      ...errorIdentificationErrApprovals,
      false,
    ]);
    setResolutionStatusErrApprovals([...resolutionStatusErrApprovals, false]);
    setIdentifiedByErrApprovals([...identifiedByErrApprovals, false]);
    setMitigationErrApprovals([...mitigationErrApprovals, false]);
    setContigencyPlanErrApprovals([...contigencyPlanErrApprovals, false]);
    setImageErrApprovals([...imageErrApprovals, false]);
  };

  const removeErrorLogFieldApprovals = (index: number) => {
    setDeletedErrorLogApprovals(
      errorLogFieldsApprovals[index].ErrorLogId !== 0
        ? [
            ...deletedErrorLogApprovals,
            errorLogFieldsApprovals[index].ErrorLogId,
          ]
        : [...deletedErrorLogApprovals]
    );

    const newErrorLogFields = [...errorLogFieldsApprovals];
    newErrorLogFields.splice(index, 1);
    setErrorLogFieldsApprovals(newErrorLogFields);

    const newErrorTypeErrors = [...errorTypeErrApprovals];
    newErrorTypeErrors.splice(index, 1);
    setErrorTypeErrApprovals(newErrorTypeErrors);

    const newRootCauseErrors = [...rootCauseErrApprovals];
    newRootCauseErrors.splice(index, 1);
    setRootCauseErrApprovals(newRootCauseErrors);

    const newImpactErrors = [...impactErrApprovals];
    newImpactErrors.splice(index, 1);
    setImpactErrApprovals(newImpactErrors);

    const newPriorityErrors = [...errorLogPriorityErrApprovals];
    newPriorityErrors.splice(index, 1);
    setErrorLogPriorityErrApprovals(newPriorityErrors);

    const newErrorCountErrors = [...errorCountErrApprovals];
    newErrorCountErrors.splice(index, 1);
    setErrorCountErrApprovals(newErrorCountErrors);

    const newNatureOfErrErrors = [...natureOfErrApprovals];
    newNatureOfErrErrors.splice(index, 1);
    setNatureOfErrApprovals(newNatureOfErrErrors);

    const newDocumentNumberErrors = [...documentNumberErrApprovals];
    newDocumentNumberErrors.splice(index, 1);
    setDocumentNumberErrApprovals(newDocumentNumberErrors);

    const newVendorNameErrors = [...vendorNameErrApprovals];
    newVendorNameErrors.splice(index, 1);
    setVendorNameErrApprovals(newVendorNameErrors);

    const newRcaErrors = [...rcaErrApprovals];
    newRcaErrors.splice(index, 1);
    setRcaErrApprovals(newRcaErrors);

    const newRecordedDateErrors = [...recordedDateErrApprovals];
    newRecordedDateErrors.splice(index, 1);
    setRecordedDateErrApprovals(newRecordedDateErrors);

    const newErrorIdentificationErrors = [...errorIdentificationErrApprovals];
    newErrorIdentificationErrors.splice(index, 1);
    setErrorIdentificationErrApprovals(newErrorIdentificationErrors);

    const newResolutionStatusErrors = [...resolutionStatusErrApprovals];
    newResolutionStatusErrors.splice(index, 1);
    setResolutionStatusErrApprovals(newResolutionStatusErrors);

    const newIdentifiedByErrors = [...identifiedByErrApprovals];
    newIdentifiedByErrors.splice(index, 1);
    setIdentifiedByErrApprovals(newIdentifiedByErrors);

    const newMitigationErrors = [...mitigationErrApprovals];
    newMitigationErrors.splice(index, 1);
    setMitigationErrApprovals(newMitigationErrors);

    const newContigencyPlanErrors = [...contigencyPlanErrApprovals];
    newContigencyPlanErrors.splice(index, 1);
    setContigencyPlanErrApprovals(newContigencyPlanErrors);

    const newImageErrors = [...imageErrApprovals];
    newImageErrors.splice(index, 1);
    setImageErrApprovals(newImageErrors);
  };

  const handleErrorTypeChangeApprovals = (e: number, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].ErrorType = e;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...errorTypeErrApprovals];
    newErrors[index] = e === 0;
    setErrorTypeErrApprovals(newErrors);
  };

  const handleRootCauseChangeApprovals = (e: number, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].RootCause = e;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...rootCauseErrApprovals];
    newErrors[index] = e === 0;
    setRootCauseErrApprovals(newErrors);
  };

  const handleImpactChangeApprovals = (e: number, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].Impact = e;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...impactErrApprovals];
    newErrors[index] = e === 0;
    setImpactErrApprovals(newErrors);
  };

  const handleNatureOfErrorChangeApprovals = (e: number, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].NatureOfError = e;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...natureOfErrApprovals];
    newErrors[index] = e === 0;
    setNatureOfErrApprovals(newErrors);
  };

  const handlePriorityChangeApprovals = (e: number, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].Priority = e;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...errorLogPriorityErrApprovals];
    newErrors[index] = e === 0;
    setErrorLogPriorityErrApprovals(newErrors);
  };

  const handleErrorCountChangeApprovals = (e: string, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].ErrorCount = Number(e) || 0;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...errorCountErrApprovals];
    newErrors[index] = Number(e) < 0 || e.toString().length > 4;
    setErrorCountErrApprovals(newErrors);
  };

  const handleCCChangeApprovals = (
    newValue: LabelValueProfileImage[] | [],
    index: number
  ) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].CC = newValue;
    setErrorLogFieldsApprovals(newFields);
  };

  const handleDocumentNumberChangeApprovals = (e: string, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].DocumentNumber = e;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...documentNumberErrApprovals];
    newErrors[index] = e.trim().length > 50;
    setDocumentNumberErrApprovals(newErrors);
  };

  const handleVendorNameChangeApprovals = (e: string, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].VendorName = e;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...vendorNameErrApprovals];
    newErrors[index] = e.trim().length > 250;
    setVendorNameErrApprovals(newErrors);
  };

  const handleRcaChangeApprovals = (e: string, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].RootCauseAnalysis = e;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...rcaErrApprovals];
    newErrors[index] = e.trim().length <= 0 || e.trim().length > 250;
    setRcaErrApprovals(newErrors);
  };

  const handleMitigationChangeApprovals = (e: string, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].MitigationPlan = e;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...mitigationErrApprovals];
    newErrors[index] = e.trim().length > 250;
    setMitigationErrApprovals(newErrors);
  };

  const handleContigencyPlanChangeApprovals = (e: string, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].ContigencyPlan = e;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...contigencyPlanErrApprovals];
    newErrors[index] = e.trim().length > 250;
    setContigencyPlanErrApprovals(newErrors);
  };

  const handleRemarksChangeApprovals = (e: string, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].Remark = e;
    setErrorLogFieldsApprovals(newFields);
  };

  const handleAmountChangeApprovals = (e: string, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].Amount = Number(e) || 0;
    setErrorLogFieldsApprovals(newFields);
  };

  const handleDateOfTransactionChange = (e: any, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].DateOfTransaction = e;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...recordedDateErrApprovals];
    newErrors[index] = typeof e != "object";
    setRecordedDateErrApprovals(newErrors);
  };

  const handleErrorIdentificationDateChange = (e: any, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].ErrorIdentificationDate = e;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...errorIdentificationErrApprovals];
    newErrors[index] = typeof e != "object";
    setErrorIdentificationErrApprovals(newErrors);
  };

  const handleResolutionStatusChange = (e: number, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].ResolutionStatus = e;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...resolutionStatusErrApprovals];
    newErrors[index] = e === 0;
    setResolutionStatusErrApprovals(newErrors);
  };

  const handleSubTaskIDChange = (e: number, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].SubTaskId = e;
    setErrorLogFieldsApprovals(newFields);
  };

  const handleIdentifiedByChange = (
    e: string,
    index: number,
    ErrorType: number
  ) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].IdentifiedBy = e;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...identifiedByErrApprovals];
    newErrors[index] =
      ErrorType > 0 ? false : e.trim().length <= 0 || e.trim().length > 50;
    setIdentifiedByErrApprovals(newErrors);
  };

  const handleAttachmentsChangeApprovals = (
    data1: string,
    data2: string,
    Attachments: CommentAttachment[],
    index: number
  ) => {
    const newFields = [...errorLogFieldsApprovals];
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
    setErrorLogFieldsApprovals(newFields);
  };

  const getErrorLogDataApprpvals = async () => {
    const params = {
      WorkitemId: onEdit,
    };
    const url = `${process.env.worklog_api_url}/workitem/errorlog/getByWorkitem`;
    const successCallback = (
      ResponseData: ErrorlogGetByWorkitem[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        ResponseData.length <= 0
          ? setErrorLogFieldsApprovals([
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
                SubTaskId: 0,
              },
            ])
          : setErrorLogFieldsApprovals(
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
                  cCDropdownDataApprovals.find(
                    (j: { value: number }) => j.value === cc
                  )
                ).filter(Boolean),
                DocumentNumber: !!i.DocumentNumber ? i.DocumentNumber : "",
                VendorName: !!i.VendorName ? i.VendorName : "",
                RootCauseAnalysis: i.RootCauseAnalysis
                  ? i.RootCauseAnalysis
                  : "",
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
                SubTaskId: !!i.SubTaskId && i.SubTaskId > 0 ? i.SubTaskId : 0,
              }))
            );
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSubmitErrorLog = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    let hasErrorLogErrors = false;
    const newErrorTypeErrors = errorLogFieldsApprovals.map(
      (field) => field.ErrorType === 0
    );
    setErrorTypeErrApprovals(newErrorTypeErrors);
    const newRootCauseErrors = errorLogFieldsApprovals.map(
      (field) => field.RootCause === 0
    );
    setRootCauseErrApprovals(newRootCauseErrors);
    const newImpactErrors = errorLogFieldsApprovals.map(
      (field) => field.Impact === 0
    );
    setImpactErrApprovals(newImpactErrors);
    const newNatureOfErrors = errorLogFieldsApprovals.map(
      (field) => field.NatureOfError === 0
    );
    setNatureOfErrApprovals(newNatureOfErrors);
    const newPriorityErrors = errorLogFieldsApprovals.map(
      (field) => field.Priority === 0
    );
    setErrorLogPriorityErrApprovals(newPriorityErrors);
    const newErrorCountErrors = errorLogFieldsApprovals.map(
      (field) => field.ErrorCount <= 0 || field.ErrorCount > 9999
    );
    setErrorCountErrApprovals(newErrorCountErrors);
    const newDocumentNumberErrors = errorLogFieldsApprovals.map(
      (field) => field.DocumentNumber.trim().length > 50
    );
    setDocumentNumberErrApprovals(newDocumentNumberErrors);
    const newVendorNameErrors = errorLogFieldsApprovals.map(
      (field) => field.VendorName.trim().length > 250
    );
    setVendorNameErrApprovals(newVendorNameErrors);
    const newRcaErrors = errorLogFieldsApprovals.map(
      (field) =>
        field.RootCauseAnalysis.trim().length <= 0 ||
        field.RootCauseAnalysis.trim().length > 250
    );
    setRcaErrApprovals(newRcaErrors);
    const newRecordedDateErrors = errorLogFieldsApprovals.map(
      (field) =>
        field.DateOfTransaction === null ||
        field.DateOfTransaction.toString().trim().length <= 0
    );
    setRecordedDateErrApprovals(newRecordedDateErrors);
    const newErrorIdentificationDateErrors = errorLogFieldsApprovals.map(
      (field) =>
        field.ErrorIdentificationDate === null ||
        field.ErrorIdentificationDate?.toString().trim().length <= 0
    );
    setErrorIdentificationErrApprovals(newErrorIdentificationDateErrors);
    const newResolutionStatusErrors = errorLogFieldsApprovals.map(
      (field) => field.ResolutionStatus === 0
    );
    setResolutionStatusErrApprovals(newResolutionStatusErrors);
    const newIdentifiedByErrors = errorLogFieldsApprovals.map(
      (field) =>
        field.ErrorType === 2 &&
        field.IdentifiedBy != null &&
        (field.IdentifiedBy.trim().length <= 0 ||
          field.IdentifiedBy.trim().length > 50)
    );
    setIdentifiedByErrApprovals(newIdentifiedByErrors);
    const newMitigationErrors = errorLogFieldsApprovals.map(
      (field) => field.MitigationPlan.trim().length > 250
    );
    setMitigationErrApprovals(newMitigationErrors);
    const newContigencyPlanErrors = errorLogFieldsApprovals.map(
      (field) => field.ContigencyPlan.trim().length > 250
    );
    setContigencyPlanErrApprovals(newContigencyPlanErrors);

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
      newRecordedDateErrors.some((error) => error) ||
      newErrorIdentificationDateErrors.some((error) => error) ||
      newResolutionStatusErrors.some((error) => error) ||
      newIdentifiedByErrors.some((error) => error) ||
      newMitigationErrors.some((error) => error) ||
      newContigencyPlanErrors.some((error) => error) ||
      imageErrApprovals.includes(true);

    if (hasPermissionWorklog("ErrorLog", "Save", "WorkLogs")) {
      if (hasErrorLogErrors === false) {
        setIsLoadingApprovals(true);
        const params = {
          WorkItemId: onEdit,
          Errors: errorLogFieldsApprovals.map(
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
                ErrorIdentificationDate:
                  i.ErrorIdentificationDate === ""
                    ? null
                    : dayjs(i.ErrorIdentificationDate).format("YYYY/MM/DD"),
                ResolutionStatus: i.ResolutionStatus,
                IdentifiedBy:
                  i.ErrorType === 2 ? i.IdentifiedBy?.toString().trim() : null,
                DateOfTransaction:
                  i.DateOfTransaction === ""
                    ? null
                    : dayjs(i.DateOfTransaction).format("YYYY/MM/DD"),
                SubTaskId: i.SubTaskId > 0 ? i.SubTaskId : null,
              })
          ),
          IsClientWorklog: 0,
          SubmissionId: onHasId,
          DeletedErrorlogIds: deletedErrorLogApprovals,
        };

        const isUsedSubTask =
          errorLogFieldsApprovals.filter((i) => i.SubTaskId > 0).length > 0;

        const url = `${process.env.worklog_api_url}/workitem/errorlog/saveByworkitem`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Error logged successfully.`);
            setDeletedErrorLogApprovals([]);
            isUsedSubTask && getSubTaskDataApprovals();
            getEditData();
            getErrorLogDataApprpvals();
            onDataFetch?.();
            setIsLoadingApprovals(false);
          }
          setIsLoadingApprovals(false);
          setDeletedErrorLogApprovals([]);
        };
        callAPI(url, params, successCallback, "POST");
      }
    } else {
      toast.error("User don't have permission to Update Task.");
      setDeletedErrorLogApprovals([]);
      getErrorLogDataApprpvals();
    }
  };

  // Logs
  const [logsApprovalsDrawer, setLogsApprovalsDrawer] = useState(true);
  const [logsDataApprovals, setLogsDateApprovals] = useState<any>([]);

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

  const getLogsDataApprovals = async () => {
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
        setLogsDateApprovals(ResponseData.List);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  // Reviewer's Note
  const [reasonDrawerApprovals, setReasonDrawerApprovals] = useState(true);
  const [reviewerNoteDataApprovals, setReviewerNoteDataApprovals] = useState<
    GetReviewerNoteList[] | []
  >([]);

  const getReviewerNoteDataApprovals = async () => {
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
        setReviewerNoteDataApprovals(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  // Manuals
  const [deletedManualTime, setDeletedManualTime] = useState<any>([]);
  const [reviewermanualFields, setReviewerManualFields] = useState<
    ManualFieldsWorklogs[]
  >([
    {
      AssigneeId: 0,
      Id: 0,
      inputDate: "",
      startTime: 0,
      manualDesc: "",
      IsApproved: false,
      IsCurrentReviewer: true,
    },
  ]);
  const [manualSwitch, setManualSwitch] = useState(false);
  const [manualTimeDrawer, setManualTimeDrawer] = useState(true);
  const [manualSubmitDisable, setManualSubmitDisable] = useState(true);
  const [manualDescErrors, setManualDescErrors] = useState([false]);

  const saveReviewerManualTimelog = async () => {
    const local: any = await localStorage.getItem("UserId");
    if (reviewerApprovals === parseInt(local)) {
      let hasManualErrors = false;
      const newInputDateErrors = reviewermanualFields.map(
        (field) =>
          manualSwitch &&
          (field.inputDate === "" ||
            checkDate(
              field.inputDate,
              field.IsCurrentReviewer,
              field.IsApproved
            ))
      );
      manualSwitch && setInputDateErrors(newInputDateErrors);
      const newStartTimeErrors = reviewermanualFields.map(
        (field) =>
          manualSwitch &&
          (field.startTime.toString().trim().length === 0 ||
            field.startTime.toString().trim().length > 3 ||
            field.startTime.toString() == "0" ||
            field.startTime.toString() == "00" ||
            field.startTime.toString() == "000" ||
            field.startTime > 480)
      );
      manualSwitch && setStartTimeErrors(newStartTimeErrors);
      const newManualDescErrors = reviewermanualFields.map(
        (field) =>
          (manualSwitch && field.manualDesc.trim().length < 1) ||
          (manualSwitch && field.manualDesc.trim().length > 500)
      );
      manualSwitch && setManualDescErrors(newManualDescErrors);
      hasManualErrors =
        newInputDateErrors.some((error) => error) ||
        newStartTimeErrors.some((error) => error) ||
        newManualDescErrors.some((error) => error);

      if (!hasManualErrors) {
        setIsLoadingApprovals(true);
        const params = {
          submissionId: onHasId,
          timelogs: reviewermanualFields.map(
            (i: ManualFieldsWorklogs) =>
              new Object({
                id: i.Id,
                Date: dayjs(i.inputDate).format("YYYY/MM/DD"),
                Time: i.startTime,
                assigneeId:
                  i.AssigneeId === 0 ? assigneeApprovals : i.AssigneeId,
                comment: i.manualDesc,
              })
          ),
          deletedTimelogIds: deletedManualTime,
        };
        const url = `${process.env.worklog_api_url}/workitem/approval/savereviewermanualtimelog`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus.toLowerCase() === "success" && error === false) {
            toast.success(`Manual Time Updated successfully.`);
            setReviewerManualFields([
              {
                AssigneeId: 0,
                Id: 0,
                inputDate: "",
                startTime: 0,
                manualDesc: "",
                IsApproved: false,
                IsCurrentReviewer: true,
              },
            ]);
            setInputDateErrors([false]);
            setStartTimeErrors([false]);
            setManualDescErrors([false]);
            setDeletedManualTime([]);
            getManualTimeLogForReviewer(onEdit);
            getEditData();
            setIsLoadingApprovals(false);
          } else {
            setIsLoadingApprovals(false);
          }
        };
        callAPI(url, params, successCallback, "POST");
      }
    } else {
      toast.warning("Only Reviewer can Edit Manual time.");
      getManualDataApprovals();
    }
  };

  const handleSubmitManualApprovalsRemove = async (id: number) => {
    const localString: string | null = localStorage.getItem("UserId");
    const localNumber: number = localString ? parseInt(localString) : 0;

    if (reviewerApprovals === localNumber) {
      setIsLoadingApprovals(true);
      const params = {
        submissionId: onHasId,
        timelogs: [],
        deletedTimelogIds: [...deletedManualTime, id],
      };
      const url = `${process.env.worklog_api_url}/workitem/approval/savereviewermanualtimelog`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success(`Manual Time Updated successfully.`);
          setDeletedManualTime([]);
          getManualTimeLogForReviewer(onEdit);
          getEditData();
          setIsLoadingApprovals(false);
        } else {
          getManualTimeLogForReviewer(onEdit);
          getEditData();
          setIsLoadingApprovals(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    } else {
      toast.warning("Only Reviewer can Edit Manual time.");
      getManualTimeLogForReviewer(onEdit);
    }
  };

  const getManualTimeLogForReviewer = async (workItemId: number) => {
    const params = { workItemId: workItemId };
    const url = `${process.env.worklog_api_url}/workitem/approval/getmanuallogbyworkitem`;
    const successCallback = (
      ResponseData: GetManualLogByWorkitemReviewer[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setManualSwitch(ResponseData.length <= 0 ? false : true);
        setManualSubmitDisable(
          ResponseData.map(
            (i: GetManualLogByWorkitemReviewer) =>
              i.IsApproved === false && i.IsCurrentReviewer === true
          ).includes(true)
            ? false
            : true
        );
        setReviewerManualFields(
          ResponseData.length <= 0
            ? [
                {
                  AssigneeId: 0,
                  Id: 0,
                  inputDate: "",
                  startTime: 0,
                  manualDesc: "",
                  IsApproved: false,
                  IsCurrentReviewer: true,
                },
              ]
            : ResponseData.map((i: GetManualLogByWorkitemReviewer) => ({
                AssigneeId: i.AssigneeId,
                Id: i.TimeId,
                inputDate: i.Date,
                startTime: i.Time,
                manualDesc: i.Comment,
                IsApproved: i.IsApproved,
                IsCurrentReviewer: i.IsCurrentReviewer,
              }))
        );
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    if (onEdit > 0) {
      getManualTimeLogForReviewer(onEdit);
    }
  }, [onEdit]);

  const removePhoneField = (index: number) => {
    setDeletedManualTime([
      ...deletedManualTime,
      reviewermanualFields[index].Id,
    ]);

    const newManualFields = [...reviewermanualFields];
    newManualFields.splice(index, 1);
    setReviewerManualFields(
      reviewermanualFields.length === 1 &&
        index === 0 &&
        reviewermanualFields[index].Id > 0
        ? [
            {
              AssigneeId: 0,
              Id: 0,
              inputDate: "",
              startTime: 0,
              manualDesc: "",
              IsApproved: false,
              IsCurrentReviewer: true,
            },
          ]
        : newManualFields
    );

    const newInputDateErrors = [...inputDateErrors];
    newInputDateErrors.splice(index, 1);
    setInputDateErrors(newInputDateErrors);

    const newStartTimeErrors = [...startTimeErrors];
    newStartTimeErrors.splice(index, 1);
    setStartTimeErrors(newStartTimeErrors);

    const newManualDescErrors = [...manualDescErrors];
    newManualDescErrors.splice(index, 1);
    setManualDescErrors(newManualDescErrors);

    const newManualDate = [...inputTypeDate];
    newManualDate.splice(index, 1);
    setInputTypeDate(newManualDate);

    reviewermanualFields.length > 1 && setManualDisableData(newManualFields);
    reviewermanualFields.length === 1 &&
      index === 0 &&
      reviewermanualFields[index].Id > 0 &&
      handleSubmitManualApprovalsRemove(reviewermanualFields[index].Id);
  };

  const addManualField = async () => {
    await setReviewerManualFields([
      ...reviewermanualFields,
      {
        AssigneeId: 0,
        Id: 0,
        inputDate: "",
        startTime: 0,
        manualDesc: "",
        IsApproved: false,
        IsCurrentReviewer: true,
      },
    ]);
    setInputDateErrors([...inputDateErrors, false]);
    setStartTimeErrors([...startTimeErrors, false]);
    setManualDescErrors([...manualDescErrors, false]);
    setInputTypeDate([...inputTypeDate, "text"]);
    setInputTypeStartTime([...inputTypeStartTime, "text"]);
    setManualDisableData([
      ...reviewermanualFields,
      {
        AssigneeId: 0,
        Id: 0,
        inputDate: "",
        startTime: 0,
        manualDesc: "",
        IsApproved: false,
        IsCurrentReviewer: true,
      },
    ]);
  };

  const handleStartTimeChange = (e: string, index: number) => {
    if (e.length === 0) {
      const newManualApprovalsFields: ManualFieldsWorklogs[] = [
        ...reviewermanualFields,
      ];
      newManualApprovalsFields[index].startTime = 0;
      setReviewerManualFields(newManualApprovalsFields);
      return;
    }

    if (e.length > 1 && !/^[0-9]+$/.test(e)) {
      return;
    }

    if (e.length > 3) {
      return;
    }

    const newManualApprovalsFields: ManualFieldsWorklogs[] = [
      ...reviewermanualFields,
    ];
    newManualApprovalsFields[index].startTime = Number(e) || 0;
    setReviewerManualFields(newManualApprovalsFields);
  };

  const handleManualDescChange = (e: string, index: number) => {
    const newManualFields = [...reviewermanualFields];
    newManualFields[index].manualDesc = e;
    setReviewerManualFields(newManualFields);

    const newManualDescErrors = [...manualDescErrors];
    newManualDescErrors[index] = e.trim().length === 0 || e.trim().length > 500;
    setManualDescErrors(newManualDescErrors);
  };

  const handleInputDateChange = (e: any, index: number) => {
    const newManualFields = [...reviewermanualFields];
    newManualFields[index].inputDate = e;
    setReviewerManualFields(newManualFields);

    const newInputDateErrors = [...inputDateErrors];
    newInputDateErrors[index] = e.length === 0 || checkDate(e);
    setInputDateErrors(newInputDateErrors);
  };

  const setManualDisableData = (manualField: ManualFieldsWorklogs[]) => {
    setManualSubmitDisable(
      manualField
        .map((i: ManualFieldsWorklogs) =>
          i.IsApproved === false && i.IsCurrentReviewer === true ? false : true
        )
        .includes(false) || deletedManualTime.length > 0
        ? false
        : true
    );
  };

  useEffect(() => {
    deletedManualTime.length > 0 && setManualDisableData(deletedManualTime);
  }, [deletedManualTime]);

  // Submit task
  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const fieldValidations = {
      clientName: validateField(clientNameApprovals),
      typeOfWork: validateField(typeOfWorkApprovals),
      projectName: validateField(projectNameApprovals),
      status: validateField(statusApprovals),
      processName: validateField(processNameApprovals),
      subProcess: validateField(subProcessApprovals),
      clientTaskName: validateField(clientTaskNameApprovals),
      descriptionApprovals:
        departmentApprovalsType !== "WhitelabelTaxation" &&
        validateField(descriptionApprovals),
      quantity: validateField(quantityApprovals),
      receiverDate: validateField(receiverDateApprovals),
      dueDate: validateField(dueDateApprovals),
      assignee: assigneeDisableApprovals && validateField(assigneeApprovals),
      reviewer: validateField(reviewerApprovals),
      department: validateField(departmentApprovals),
      manager: validateField(managerApprovals),
      returnYear:
        typeOfWorkApprovals === 3 && validateField(returnYearApprovals),
      checklistWorkpaper:
        typeOfWorkApprovals === 3 && validateField(checklistWorkpaperApprovals),
      reminderTime:
        reminderSwitchApprovals && validateField(reminderTimeApprovals),
      reminderNotification:
        reminderSwitchApprovals && validateField(reminderNotificationApprovals),
      reminderDate:
        reminderSwitchApprovals &&
        reminderCheckboxValueApprovals === 2 &&
        validateField(reminderDateApprovals),
      missingInfo:
        departmentApprovalsType === "WhitelabelTaxation" &&
        statusApprovalsType === "OnHoldFromClient" &&
        validateField(
          !!missingInfoApprovals
            ? missingInfoApprovals?.trim()
            : missingInfoApprovals
        ),
    };

    setClientNameApprovalsErr(fieldValidations.clientName);
    setTypeOfWorkApprovalsErr(fieldValidations.typeOfWork);
    setProjectNameApprovalsErr(fieldValidations.projectName);
    setStatusApprovalsErr(fieldValidations.status);
    setProcessNameApprovalsErr(fieldValidations.processName);
    setSubProcessApprovalsErr(fieldValidations.subProcess);
    setClientTaskNameApprovalsErr(fieldValidations.clientTaskName);
    departmentApprovalsType !== "WhitelabelTaxation" &&
      setDescriptionApprovalsErr(fieldValidations.descriptionApprovals);
    setQuantityApprovalsErr(fieldValidations.quantity);
    setReceiverDateApprovalsErr(fieldValidations.receiverDate);
    assigneeDisableApprovals &&
      setAssigneeApprovalsErr(fieldValidations.assignee);
    setReviewerApprovalsErr(fieldValidations.reviewer);
    setDepartmentApprovalsErr(fieldValidations.department);
    setManagerApprovalsErr(fieldValidations.manager);
    typeOfWorkApprovals === 3 &&
      setReturnYearApprovalsErr(fieldValidations.returnYear);
    typeOfWorkApprovals === 3 &&
      setChecklistWorkpaperApprovalsErr(fieldValidations.checklistWorkpaper);
    onEdit === 0 &&
      reminderSwitchApprovals &&
      setReminderTimeApprovalsErr(fieldValidations.reminderTime);
    onEdit === 0 &&
      reminderSwitchApprovals &&
      setReminderNotificationApprovalsErr(
        fieldValidations.reminderNotification
      );
    onEdit === 0 &&
      reminderSwitchApprovals &&
      reminderCheckboxValueApprovals === 2 &&
      setReminderDateApprovalsErr(fieldValidations.reminderDate);
    departmentApprovalsType === "WhitelabelTaxation" &&
      statusApprovalsType === "OnHoldFromClient" &&
      setMissingInfoApprovalsErr(fieldValidations.missingInfo);

    setClientTaskNameApprovalsErr(
      clientTaskNameApprovals.trim().length < 4 ||
        clientTaskNameApprovals.trim().length > 100
    );
    setQuantityApprovalsErr(
      quantityApprovals.length <= 0 ||
        quantityApprovals.length > 4 ||
        quantityApprovals <= 0 ||
        quantityApprovals.toString().includes(".")
    );

    const fieldValidationsEdit = {
      clientName: validateField(clientNameApprovals),
      typeOfWork: validateField(typeOfWorkApprovals),
      projectName: validateField(projectNameApprovals),
      processName: validateField(processNameApprovals),
      subProcess: validateField(subProcessApprovals),
      clientTaskName: validateField(clientTaskNameApprovals),
      descriptionApprovals:
        departmentApprovalsType !== "WhitelabelTaxation" &&
        validateField(descriptionApprovals),
      status: validateField(statusApprovals),
      quantity: validateField(quantityApprovals),
      receiverDate: validateField(receiverDateApprovals),
      assignee: validateField(assigneeApprovals),
      reviewer: validateField(reviewerApprovals),
      separtment: validateField(departmentApprovals),
      manager: validateField(managerApprovals),
      returnYear:
        typeOfWorkApprovals === 3 && validateField(returnYearApprovals),
      checklistWorkpaper:
        typeOfWorkApprovals === 3 && validateField(checklistWorkpaperApprovals),
      missingInfo:
        departmentApprovalsType === "WhitelabelTaxation" &&
        statusApprovalsType === "OnHoldFromClient" &&
        validateField(
          !!missingInfoApprovals
            ? missingInfoApprovals?.trim()
            : missingInfoApprovals
        ),
    };

    const hasEditErrors = Object.values(fieldValidationsEdit).some(
      (error) => error
    );

    const data = {
      WorkItemId: onEdit > 0 ? onEdit : 0,
      ClientId: clientNameApprovals,
      WorkTypeId: typeOfWorkApprovals,
      taskName: clientTaskNameApprovals,
      ProjectId: projectNameApprovals === 0 ? null : projectNameApprovals,
      ProcessId: processNameApprovals === 0 ? null : processNameApprovals,
      SubProcessId: subProcessApprovals === 0 ? null : subProcessApprovals,
      StatusId: statusApprovals,
      Priority: priorityApprovals === 0 ? null : priorityApprovals,
      Quantity: quantityApprovals <= 0 ? null : quantityApprovals,
      Description:
        descriptionApprovals.toString().length <= 0
          ? null
          : descriptionApprovals.toString().trim(),
      ReceiverDate: dayjs(receiverDateApprovals).format("YYYY/MM/DD"),
      DueDate: dayjs(dueDateApprovals).format("YYYY/MM/DD"),
      allInfoDate:
        allInfoDateApprovals === ""
          ? null
          : dayjs(allInfoDateApprovals).format("YYYY/MM/DD"),
      AssignedId: assigneeApprovals,
      ReviewerId: reviewerApprovals,
      DepartmentId: departmentApprovals,
      managerId: managerApprovals,
      TaxReturnType: null,
      TaxCustomFields:
        typeOfWorkApprovals !== 3
          ? null
          : {
              ReturnYear: returnYearApprovals,
              Complexity: null,
              CountYear: null,
              NoOfPages: noOfPagesApprovals,
            },
      checklistWorkpaper:
        checklistWorkpaperApprovals === 1
          ? true
          : checklistWorkpaperApprovals === 2
          ? false
          : null,
      ReworkReceivedDate: !!reworkReceiverDateApprovals
        ? dayjs(reworkReceiverDateApprovals).format("YYYY/MM/DD")
        : null,
      ReworkDueDate: !!reworkDueDateApprovals
        ? dayjs(reworkDueDateApprovals).format("YYYY/MM/DD")
        : null,
      PeriodFrom:
        valueMonthYearFrom === null || valueMonthYearFrom === ""
          ? null
          : dayjs(valueMonthYearFrom).format("YYYY/MM/DD"),
      PeriodTo:
        valueMonthYearTo === null || valueMonthYearTo === ""
          ? null
          : dayjs(valueMonthYearTo).format("YYYY/MM/DD"),
      IsQARequired: departmentApprovalsType == "SMB" ? isQaApprovals : null,
      QAQuantity: departmentApprovalsType == "SMB" ? qaQuantityApprovals : null,
      MissingInfo:
        departmentApprovalsType === "WhitelabelTaxation" &&
        !!missingInfoApprovals &&
        statusApprovalsType === "OnHoldFromClient"
          ? missingInfoApprovals.toString().trim()
          : null,
      ManualTimeList: null,
      SubTaskList: null,
      RecurringObj: null,
      ReminderObj: null,
    };

    const saveWorklog = async () => {
      setIsLoadingApprovals(true);
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
          onEdit > 0 && getEditData();
          onEdit > 0 &&
            typeOfWorkApprovals === 3 &&
            getCheckListDataApprovals();
          onEdit === 0 && onClose();
          onEdit === 0 && handleClose();
          setIsLoadingApprovals(false);
        } else if (ResponseStatus === "Warning" && error === false) {
          toast.warning(ResponseData);
          setIsLoadingApprovals(false);
          onEdit > 0 && getEditData();
        } else {
          setIsLoadingApprovals(false);
          onEdit > 0 && getEditData();
        }
      };
      callAPI(url, params, successCallback, "POST");
    };

    if (
      onEdit > 0 &&
      !hasEditErrors &&
      clientTaskNameApprovals.trim().length > 3 &&
      clientTaskNameApprovals.trim().length <= 100 &&
      quantityApprovals > 0 &&
      quantityApprovals < 10000 &&
      !quantityApprovalsErr &&
      !quantityApprovals.toString().includes(".") &&
      !reworkReceiverDateApprovalsErr
    ) {
      if (hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs")) {
        saveWorklog();
      } else {
        toast.error("User don't have permission to Update Task.");
        getEditData();
      }
    }
  };

  // Get Data
  const getEditData = async () => {
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
        setErrorlogSignOffPendingApprovals(
          ResponseData.ErrorlogSignedOffPending
        );
        setEditData(ResponseData);
        setIsCreatedByClient(ResponseData.IsCreatedByClient);
        setClientNameApprovals(ResponseData.ClientId);
        setTypeOfWorkApprovals(ResponseData.WorkTypeId);
        setProjectNameApprovals(ResponseData.ProjectId);
        setProcessNameApprovals(ResponseData.ProcessId);
        setSubProcessApprovals(ResponseData.SubProcessId);
        setClientTaskNameApprovals(
          ResponseData.TaskName === null ? "" : ResponseData.TaskName
        );
        setStatusApprovals(ResponseData.StatusId);
        setEditStatusApprovals(ResponseData.StatusId);
        setAllInfoDateApprovals(
          ResponseData.AllInfoDate === null ? "" : ResponseData.AllInfoDate
        );
        setPriorityApprovals(
          ResponseData.Priority === null ? 0 : ResponseData.Priority
        );
        setQuantityApprovals(ResponseData.Quantity);
        setDescriptionApprovals(
          ResponseData.Description === null ? "" : ResponseData.Description
        );
        setReceiverDateApprovals(ResponseData.ReceiverDate);
        setDueDateApprovals(ResponseData.DueDate);
        setDateOfReviewApprovals(
          ResponseData.ReviewerDate === null ? "" : ResponseData.ReviewerDate
        );
        setDateOfPreperationApprovals(
          ResponseData.PreparationDate === null
            ? ""
            : ResponseData.PreparationDate
        );
        setAssigneeApprovals(ResponseData.AssignedId);
        setReviewerApprovals(ResponseData.ReviewerId);
        setDepartmentApprovals(ResponseData.DepartmentId);
        setManagerApprovals(
          ResponseData.ManagerId === null ? 0 : ResponseData.ManagerId
        );
        setReturnYearApprovals(
          ResponseData.TaxCustomFields === null
            ? 0
            : ResponseData.TypeOfReturnId === 0
            ? 0
            : ResponseData.TaxCustomFields.ReturnYear
        );
        setNoOfPagesApprovals(
          ResponseData.TaxCustomFields === null
            ? 0
            : ResponseData.TypeOfReturnId === 0
            ? 0
            : ResponseData.TaxCustomFields.NoOfPages
        );
        setChecklistWorkpaperApprovals(
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
        setReworkReceiverDateApprovals(
          !!ResponseData.ReworkReceivedDate
            ? ResponseData.ReworkReceivedDate
            : ""
        );
        setReworkDueDateApprovals(
          !!ResponseData.ReworkDueDate ? ResponseData.ReworkDueDate : ""
        );
        setIsQaApprovals(
          !!ResponseData.IsQARequired ? ResponseData.IsQARequired : 0
        );
        setQAQuantityApprovals(
          !!ResponseData.QAQuantity ? Number(ResponseData.QAQuantity) : null
        );
        setMissingInfoApprovals(
          !!ResponseData.MissingInfo ? ResponseData.MissingInfo : null
        );
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const getData = async () => {
      const statusData = await getStatusDropdownData(typeOfWorkApprovals);

      await setStatusApprovalsDropdownData(statusData);

      const getType = statusData.filter(
        (item: LabelValueType) => item.value === editStatusApprovals
      )[0].Type;
      setStatusApprovalsType(getType);

      !errorlogSignedOffPendingApprovals &&
        setStatusApprovalsDropdownDataUse(
          statusData.filter(
            (item: LabelValueType) =>
              item.Type === "InReviewWithClients" ||
              item.Type === "Rework" ||
              item.Type === "OnHoldFromClient" ||
              item.Type === "WithDraw" ||
              item.Type === "WithdrawnbyClient" ||
              (getType !== "PartialSubmitted" && item.Type === "InReview") ||
              item.value === editStatusApprovals
          )
        );

      errorlogSignedOffPendingApprovals &&
        setStatusApprovalsDropdownDataUse(
          statusData.filter(
            (item: LabelValueType) =>
              item.Type === "InReviewWithClients" ||
              item.Type === "OnHoldFromClient" ||
              item.Type === "WithDraw" ||
              item.Type === "WithdrawnbyClient" ||
              (getType !== "PartialSubmitted" &&
                item.Type === "ReworkInReview") ||
              item.value === editStatusApprovals
          )
        );

      activeTab === 2 &&
        getType === "Reject" &&
        setStatusApprovalsDropdownDataUse(
          statusData.filter(
            (item: LabelValueType) =>
              item.Type === "InReviewWithClients" ||
              item.Type === "Rework" ||
              item.Type === "OnHoldFromClient" ||
              item.Type === "WithDraw" ||
              item.Type === "WithdrawnbyClient" ||
              item.value === editStatusApprovals
          )
        );

      const getTypeAllTask = statusData.filter(
        (item: LabelValueType) => item.value === editStatusApprovals
      )[0].Type;

      const validTaskTypes = [
        "Assigned",
        "InProgress",
        "NotStarted",
        "OnHoldFromClient",
        "PendingFromAccounting",
        "Stop",
        "WithDraw",
        "WithdrawnbyClient",
      ];

      if (
        validTaskTypes.includes(getTypeAllTask) &&
        !errorlogSignedOffPendingApprovals
      ) {
        setStatusApprovalsDropdownDataUseAllTask(
          statusData.filter(
            (item: { Type: string; label: string; value: number }) =>
              validTaskTypes.includes(item.Type) ||
              item.value === editStatusApprovals
          )
        );
      }

      const validTaskTypes1 = [
        "Rework",
        "ReworkInProgress",
        "ReworkPrepCompleted",
        "OnHoldFromClient",
        "WithDraw",
        "WithdrawnbyClient",
      ];

      if (
        validTaskTypes1.includes(getTypeAllTask) &&
        errorlogSignedOffPendingApprovals
      ) {
        setStatusApprovalsDropdownDataUseAllTask(
          statusData.filter(
            (item: { Type: string; label: string; value: number }) =>
              validTaskTypes1.includes(item.Type) ||
              item.value === editStatusApprovals
          )
        );
      }

      const validTaskTypes2 = [
        "InReview",
        "Rework",
        "OnHoldFromClient",
        "WithDraw",
        "WithdrawnbyClient",
      ];

      if (
        validTaskTypes2.includes(getTypeAllTask) &&
        !errorlogSignedOffPendingApprovals
      ) {
        setStatusApprovalsDropdownDataUseAllTask(
          statusData.filter(
            (item: { Type: string; label: string; value: number }) =>
              validTaskTypes2.includes(item.Type) ||
              item.value === editStatusApprovals
          )
        );
      }

      const validTaskTypes3 = [
        "ReworkInReview",
        "Rework",
        "OnHoldFromClient",
        "WithDraw",
        "WithdrawnbyClient",
      ];

      if (
        validTaskTypes3.includes(getTypeAllTask) &&
        errorlogSignedOffPendingApprovals
      ) {
        setStatusApprovalsDropdownDataUseAllTask(
          statusData.filter(
            (item: { Type: string; label: string; value: number }) =>
              validTaskTypes3.includes(item.Type) ||
              item.value === editStatusApprovals
          )
        );
      }

      if (
        getTypeAllTask === "Errorlogs" ||
        getTypeAllTask === "InQA" ||
        getTypeAllTask === "QACompleted" ||
        getTypeAllTask === "QAInProgress" ||
        getTypeAllTask === "QASubmitted" ||
        getTypeAllTask === "Reject" ||
        getTypeAllTask === "Accept" ||
        getTypeAllTask === "AcceptWithNotes" ||
        getTypeAllTask === "ReworkAccept" ||
        getTypeAllTask === "ReworkAcceptWithNotes" ||
        getTypeAllTask === "ReworkSubmitted" ||
        getTypeAllTask === "SecondManagerReview" ||
        getTypeAllTask === "SignedOff" ||
        getTypeAllTask === "PartialSubmitted" ||
        getTypeAllTask === "Submitted"
      ) {
        setStatusApprovalsDropdownDataUseAllTask(
          statusData.filter(
            (item: { Type: string; label: string; value: number }) =>
              item.value === editStatusApprovals ||
              item.Type === "OnHoldFromClient" ||
              item.Type === "WithDraw" ||
              item.Type === "WithdrawnbyClient"
          )
        );
      }

      if (
        (getTypeAllTask === "OnHoldFromClient" ||
          getTypeAllTask === "WithDraw" ||
          getTypeAllTask === "WithdrawnbyClient") &&
        !errorlogSignedOffPendingApprovals
      ) {
        setStatusApprovalsDropdownDataUseAllTask(
          statusData.filter(
            (item: { Type: string; label: string; value: number }) =>
              item.value === editStatusApprovals ||
              item.Type === "InProgress" ||
              item.Type === "OnHoldFromClient" ||
              item.Type === "WithDraw" ||
              item.Type === "WithdrawnbyClient"
          )
        );
      }

      if (
        (getTypeAllTask === "OnHoldFromClient" ||
          getTypeAllTask === "WithDraw" ||
          getTypeAllTask === "WithdrawnbyClient") &&
        errorlogSignedOffPendingApprovals
      ) {
        setStatusApprovalsDropdownDataUseAllTask(
          statusData.filter(
            (item: { Type: string; label: string; value: number }) =>
              item.value === editStatusApprovals ||
              item.Type === "ReworkInProgress" ||
              item.Type === "OnHoldFromClient" ||
              item.Type === "WithDraw" ||
              item.Type === "WithdrawnbyClient"
          )
        );
      }

      if (getTypeAllTask === "SignedOff") {
        setStatusApprovalsDropdownDataUseAllTask(
          statusData.filter(
            (item: { Type: string; label: string; value: number }) =>
              item.Type === "SignedOff"
          )
        );
      }
    };

    onOpen &&
      statusApprovalsDropdownData?.length === 0 &&
      typeOfWorkApprovals > 0 &&
      getData();
  }, [onEdit, statusApprovalsDropdownData, typeOfWorkApprovals]);

  useEffect(() => {
    const getData = async () => {
      await setCCDropdownDataApprovals(await getCCDropdownData());
    };

    cCDropdownDataApprovals.length <= 0 && getData();
  }, []);

  useEffect(() => {
    if (onEdit > 0) {
      getEditData();
      getSubTaskDataApprovals();
      getRecurringDataApprovals();
      getManualDataApprovals();
      getCheckListDataApprovals();
      getCommentDataApprovals(1);
      getReviewerNoteDataApprovals();
      getLogsDataApprovals();
    }
  }, [onEdit]);

  useEffect(() => {
    if (onEdit > 0 && assigneeApprovalsDropdownData.length > 0) {
      getReminderDataApprovals();
    }
  }, [onEdit, assigneeApprovalsDropdownData]);

  useEffect(() => {
    onEdit > 0 &&
      assigneeApprovalsDropdownData.length > 0 &&
      getErrorLogDataApprpvals();
  }, [assigneeApprovalsDropdownData]);

  // API CALLS dropdown data
  const getUserDetails = async () => {
    const params = {};
    const url = `${process.env.api_url}/auth/getuserdetails`;
    const successCallback = (
      ResponseData: User,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setAssigneeDisableApprovals(ResponseData.IsHaveManageAssignee);
        setUserId(ResponseData.UserId);
      }
    };
    callAPI(url, params, successCallback, "GET");
  };

  useEffect(() => {
    const getData = async () => {
      getUserDetails();
      setClientApprovalsDropdownData(await getClientDropdownData());
      clientNameApprovals > 0 &&
        setWorkTypeApprovalsDropdownData(
          await getTypeOfWorkDropdownData(clientNameApprovals)
        );
    };

    onOpen && getData();
  }, [clientNameApprovals, onOpen]);

  useEffect(() => {
    const getData = async () => {
      onEdit > 0 &&
        setCommentUserDataApprovals(
          await getCommentUserDropdownData({
            ClientId: clientNameApprovals,
            GetClientUser: commentSelectApprovals === 2 ? true : false,
          })
        );
    };

    onOpen && getData();
  }, [clientNameApprovals, commentSelectApprovals, commentSelectApprovals]);

  useEffect(() => {
    const getData = async () => {
      clientNameApprovals > 0 &&
        typeOfWorkApprovals > 0 &&
        setProjectApprovalsDropdownData(
          await getProjectDropdownData(clientNameApprovals, typeOfWorkApprovals)
        );
    };

    getData();
  }, [clientNameApprovals, typeOfWorkApprovals]);

  useEffect(() => {
    const getData = async () => {
      const processData =
        clientNameApprovals > 0 &&
        typeOfWorkApprovals > 0 &&
        departmentApprovals > 0 &&
        (await getProcessDropdownData(
          clientNameApprovals,
          typeOfWorkApprovals,
          departmentApprovals
        ));
      processData.length > 0
        ? setProcessApprovalsDropdownData(
            processData?.map(
              (i: IdNameEstimatedHour) =>
                new Object({ label: i.Name, value: i.Id })
            )
          )
        : setProcessApprovalsDropdownData([]);
    };

    getData();
  }, [clientNameApprovals, typeOfWorkApprovals, departmentApprovals]);

  useEffect(() => {
    const getData = async () => {
      const data =
        processNameApprovals !== 0 &&
        (await getSubProcessDropdownData(
          clientNameApprovals,
          typeOfWorkApprovals,
          processNameApprovals
        ));
      data.length > 0 && setEstTimeDataApprovals(data);
      data.length > 0
        ? setSubProcessApprovalsDropdownData(
            data.map(
              (i: IdNameEstimatedHour) =>
                new Object({ label: i.Name, value: i.Id })
            )
          )
        : setSubProcessApprovalsDropdownData([]);
    };

    getData();
  }, [processNameApprovals]);

  useEffect(() => {
    const getData = async () => {
      setManagerApprovalsDropdownData(
        await getManagerDropdownData(typeOfWorkApprovals)
      );
      setAssigneeApprovalsDropdownData(
        await getAssigneeDropdownData(
          [clientNameApprovals],
          typeOfWorkApprovals
        )
      );
      setReviewerApprovalsDropdownData(
        await getReviewerDropdownData(
          [clientNameApprovals],
          typeOfWorkApprovals
        )
      );
    };

    typeOfWorkApprovals > 0 && getData();
  }, [typeOfWorkApprovals, clientNameApprovals]);

  useEffect(() => {
    const getData = async () => {
      const departmentData = await getDepartmentDataByClient(
        clientNameApprovals
      );
      departmentData.length > 0
        ? setDepartmentApprovalsDropdownData(departmentData)
        : setDepartmentApprovalsDropdownData([]);
      const departmentType =
        departmentData.length > 0 &&
        departmentData
          .map((i: LabelValueType) =>
            i.value == departmentApprovals ? i.Type : false
          )
          .filter((j: number | boolean) => j !== false)[0];
      setDepartmentApprovalsType(departmentType);
    };

    clientNameApprovals && getData();
  }, [clientNameApprovals]);

  useEffect(() => {
    const deptType = departmentApprovalsDropdownData
      ?.map((i: LabelValueType) =>
        i.value === departmentApprovals ? i.Type : false
      )
      .filter((j: any) => j != false)[0];
    setDepartmentApprovalsType(!!deptType ? deptType.toString() : "");
  }, [departmentApprovals, departmentApprovalsDropdownData]);

  const handleClose = () => {
    // Common
    setIsLoadingApprovals(false);
    setEditData([]);
    setIsCreatedByClient(false);
    setUserId(0);
    scrollToPanel(0);
    onDataFetch?.();

    // Task
    setClientApprovalsDropdownData([]);
    setClientNameApprovals(0);
    setClientNameApprovalsErr(false);
    setWorkTypeApprovalsDropdownData([]);
    setTypeOfWorkApprovals(0);
    setTypeOfWorkApprovalsErr(false);
    setProjectApprovalsDropdownData([]);
    setProjectNameApprovals(0);
    setProjectNameApprovalsErr(false);
    setClientTaskNameApprovals("");
    setClientTaskNameApprovalsErr(false);
    setProcessApprovalsDropdownData([]);
    setProcessNameApprovals(0);
    setProcessNameApprovalsErr(false);
    setSubProcessApprovalsDropdownData([]);
    setSubProcessApprovals(0);
    setSubProcessApprovalsErr(false);
    setManagerApprovals(0);
    setManagerApprovalsErr(false);
    setErrorlogSignOffPendingApprovals(false);
    setEditStatusApprovals(0);
    setStatusApprovals(0);
    setStatusApprovalsErr(false);
    setStatusApprovalsType(null);
    setStatusApprovalsDropdownData([]);
    setStatusApprovalsDropdownDataUse([]);
    setStatusApprovalsDropdownDataUseAllTask([]);
    setDescriptionApprovals("");
    setDescriptionApprovalsErr(false);
    setPriorityApprovals(0);
    setQuantityApprovals(1);
    setQuantityApprovalsErr(false);
    setReceiverDateApprovals("");
    setReceiverDateApprovalsErr(false);
    setDueDateApprovals("");
    setAllInfoDateApprovals("");
    setAssigneeApprovalsDropdownData([]);
    setAssigneeApprovals(0);
    setAssigneeApprovalsErr(false);
    setAssigneeDisableApprovals(true);
    setReviewerApprovalsDropdownData([]);
    setReviewerApprovals(0);
    setReviewerApprovalsErr(false);
    setDepartmentApprovalsDropdownData([]);
    setDepartmentApprovals(0);
    setDepartmentApprovalsType("");
    setDepartmentApprovalsErr(false);
    setDateOfReviewApprovals("");
    setDateOfPreperationApprovals("");
    setEstTimeDataApprovals([]);
    setReturnYearApprovals(0);
    setReturnYearApprovalsErr(false);
    setNoOfPagesApprovals(0);
    setChecklistWorkpaperApprovals(0);
    setChecklistWorkpaperApprovalsErr(false);
    setValueMonthYearFrom(null);
    setValueMonthYearTo(null);
    setIsQaApprovals(0);
    setQAQuantityApprovals(null);
    setMissingInfoApprovals(null);
    setMissingInfoApprovalsErr(false);

    // Sub-Task
    setSubTaskSwitchApprovals(false);
    setSubTaskFieldsApprovals([
      {
        SubtaskId: 0,
        Title: "",
        Description: "",
        CustomerName: "",
        InvoiceNumber: "",
        SubTaskDate: "",
        BillAmount: "",
        SubTaskErrorLogFlag: false,
      },
    ]);
    setTaskNameApprovalsErr([false]);
    setVendorNameApprovalsErr([false]);
    setInvoiceNameApprovalsErr([false]);
    setDateApprovalsErr([false]);
    setBillAmountApprovalsErr([false]);
    setSubTaskOptions([]);
    setDeletedSubTaskApprovals([]);

    // Recurring
    setRecurringStartDateApprovals("");
    setRecurringEndDateApprovals("");
    setRecurringTimeApprovals(1);
    setRecurringMonthApprovals(0);

    // Manual
    setManualFieldsApprovals([
      {
        AssigneeId: 0,
        Id: 0,
        inputDate: "",
        startTime: 0,
        manualDesc: "",
        IsApproved: false,
      },
    ]);

    // Reminder
    setReminderSwitchApprovals(false);
    setReminderCheckboxValueApprovals(1);
    setReminderDateApprovals("");
    setReminderDateApprovalsErr(false);
    setReminderTimeApprovals(0);
    setReminderTimeApprovalsErr(false);
    setReminderNotificationApprovals(0);
    setReminderNotificationApprovalsErr(false);
    setReminderIdApprovals(0);

    // Checklist
    setCheckListNameApprovals("");
    setCheckListNameApprovalsError(false);
    setCheckListDataApprovals([]);
    setItemStatesApprovals({});

    //Reviewer Manual Time
    setReviewerManualFields([
      {
        AssigneeId: 0,
        Id: 0,
        inputDate: "",
        startTime: 0,
        manualDesc: "",
        IsApproved: false,
        IsCurrentReviewer: true,
      },
    ]);
    setInputDateErrors([false]);
    setStartTimeErrors([false]);
    setManualDescErrors([false]);
    setDeletedManualTime([]);

    // Comments
    setCommentDataApprovals([]);
    setValue("");
    setValueError(false);
    setFileHasError(false);
    setValueEdit("");
    setValueEditError(false);
    setFileEditHasError(false);
    setMention([]);
    setEditingCommentIndexApprovals(-1);
    setCommentSelectApprovals(1);
    setCommentAttachmentApprovals([
      {
        AttachmentId: 0,
        UserFileName: "",
        SystemFileName: "",
        AttachmentPath: process.env.attachment || "",
      },
    ]);
    setCommentUserDataApprovals([]);

    // Reviewer note
    setReviewerNoteDataApprovals([]);

    // Error Logs
    setErrorLogFieldsApprovals([
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
        SubTaskId: 0,
      },
    ]);
    setErrorTypeErrApprovals([false]);
    setRootCauseErrApprovals([false]);
    setImpactErrApprovals([false]);
    setErrorLogPriorityErrApprovals([false]);
    setErrorCountErrApprovals([false]);
    setNatureOfErrApprovals([false]);
    setImageErrApprovals([false]);
    setRcaErrApprovals([false]);
    setRecordedDateErrApprovals([false]);
    setErrorIdentificationErrApprovals([false]);
    setResolutionStatusErrApprovals([false]);
    setIdentifiedByErrApprovals([false]);
    setDocumentNumberErrApprovals([false]);
    setVendorNameErrApprovals([false]);
    setDeletedErrorLogApprovals([]);

    // Logs
    setLogsDateApprovals([]);

    if (typeof window !== "undefined") {
      const pathname = window.location.href.includes("id=");
      if (pathname) {
        onClose();
        router.push("/worklogs");
      } else {
        onClose();
      }
    }
    onClose();
  };

  // useEffect(() => {
  //   if (typeOfWorkApprovals > 0 && typeOfWorkApprovals !== 3) {
  //     const reviewerDate = dayjs();
  //     setReceiverDateApprovals(reviewerDate.toISOString());
  //     setReceiverDateApprovalsErr(false);
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
  //     setDueDateApprovals(nextDate);
  //   } else {
  //     setReceiverDateApprovals("");
  //     setDueDateApprovals("");
  //   }
  // }, [typeOfWorkApprovals]);

  const checkDate = (
    date: string,
    isCurrentReviewer: boolean = false,
    isApproved: boolean = false
  ) => {
    if (isApproved || !isCurrentReviewer) {
      return false;
    } else {
      const date1 = new Date(receiverDateApprovals);
      const date2 = new Date(date);

      // Zero out the time portion
      date1.setHours(0, 0, 0, 0);
      date2.setHours(0, 0, 0, 0);

      return date1 > date2 ? true : false;
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
          <div className="flex p-[6px] justify-between items-center">
            <div className="flex items-center py-[6.5px] pl-[5px]">
              {Task.map((task: string) => task)
                .filter((i: string | boolean) => i !== false)
                .map((task: string, index: number) => (
                  <div
                    key={task + index}
                    className={`my-2 px-3 text-[14px] ${
                      index !== Task.length - 1 &&
                      "border-r border-r-lightSilver"
                    } cursor-pointer font-semibold hover:text-[#0592C6] text-slatyGrey`}
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
            {hasPermissionWorklog("Task/SubTask", "View", "WorkLogs") && (
              <div className="pt-1" id="tabpanel-0">
                <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                  <span className="flex items-center">
                    <TaskIcon />
                    <span className="ml-[21px]">Task</span>
                  </span>
                  <div className="flex gap-4">
                    {onEdit > 0 && (
                      <span>Created By : {editData.CreatedByName}</span>
                    )}
                    <span
                      className={`cursor-pointer ${
                        taskApprovalsDrawer ? "rotate-180" : ""
                      }`}
                      onClick={() =>
                        setTaskApprovalsDrawer(!taskApprovalsDrawer)
                      }
                    >
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                {taskApprovalsDrawer && (
                  <Grid container className="px-8">
                    <Grid item xs={3} className="pt-4">
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={clientApprovalsDropdownData}
                        value={
                          clientApprovalsDropdownData.find(
                            (i: LabelValue) => i.value === clientNameApprovals
                          ) || null
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setClientNameApprovals(value.value);
                          setTypeOfWorkApprovals(0);
                          setTypeOfWorkApprovalsErr(false);
                          setProjectNameApprovals(0);
                          setProjectNameApprovalsErr(false);
                          setStatusApprovals(0);
                          setStatusApprovalsErr(false);
                          setStatusApprovalsType(null);
                          setProcessNameApprovals(0);
                          setProcessNameApprovalsErr(false);
                          setSubProcessApprovals(0);
                          setSubProcessApprovalsErr(false);
                          setDescriptionApprovals("");
                          setManagerApprovals(0);
                          setManagerApprovalsErr(false);
                          setPriorityApprovals(0);
                          setQuantityApprovals(1);
                          setQuantityApprovalsErr(false);
                          setReceiverDateApprovals("");
                          setReceiverDateApprovalsErr(false);
                          setDueDateApprovals("");
                          assigneeDisableApprovals && setAssigneeApprovals(0);
                          assigneeDisableApprovals &&
                            setAssigneeApprovalsErr(false);
                          setReviewerApprovals(0);
                          setReviewerApprovalsErr(false);
                          isAdmin && setDepartmentApprovals(0);
                          isAdmin && setDepartmentApprovalsErr(false);
                          setReturnYearApprovals(0);
                          setNoOfPagesApprovals(0);
                          setChecklistWorkpaperApprovals(0);
                          setCheckListNameApprovalsError(false);
                          setValueMonthYearFrom(null);
                          setValueMonthYearTo(null);
                          setMissingInfoApprovals(null);
                          setMissingInfoApprovalsErr(false);
                        }}
                        disabled={
                          (activeTab !== 2 &&
                            isCreatedByClient &&
                            editData.ClientId > 0) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) == 3 &&
                            localStorage.getItem("UserId") !=
                              editData.ReviewerId) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) != 3)
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
                            error={clientNameApprovalsErr}
                            onBlur={() => {
                              if (clientNameApprovals > 0) {
                                setClientNameApprovalsErr(false);
                              }
                            }}
                            helperText={
                              clientNameApprovalsErr
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
                        error={typeOfWorkApprovalsErr}
                        disabled={
                          (activeTab !== 2 &&
                            isCreatedByClient &&
                            editData.WorkTypeId > 0) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) == 3 &&
                            localStorage.getItem("UserId") !=
                              editData.ReviewerId) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) != 3)
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
                            typeOfWorkApprovals === 0 ? "" : typeOfWorkApprovals
                          }
                          onChange={(e) => {
                            assigneeDisableApprovals && setAssigneeApprovals(0);
                            assigneeDisableApprovals &&
                              setAssigneeApprovalsErr(false);
                            setReviewerApprovals(0);
                            setReviewerApprovalsErr(false);
                            setTypeOfWorkApprovals(e.target.value);
                            setReturnYearApprovals(0);
                            setNoOfPagesApprovals(0);
                            setChecklistWorkpaperApprovals(0);
                            setProjectNameApprovals(0);
                            setProjectNameApprovalsErr(false);
                            setStatusApprovals(0);
                            setStatusApprovalsErr(false);
                            setStatusApprovalsType(null);
                            setProcessNameApprovals(0);
                            setProcessNameApprovalsErr(false);
                            setSubProcessApprovals(0);
                            setSubProcessApprovalsErr(false);
                            isAdmin && setDepartmentApprovals(0);
                            isAdmin && setDepartmentApprovalsErr(false);
                            setValueMonthYearFrom(null);
                            setValueMonthYearTo(null);
                            setManagerApprovals(0);
                            setManagerApprovalsErr(false);
                            setMissingInfoApprovals(null);
                            setMissingInfoApprovalsErr(false);
                          }}
                          onBlur={() => {
                            if (typeOfWorkApprovals > 0) {
                              setTypeOfWorkApprovalsErr(false);
                            }
                          }}
                        >
                          {workTypeApprovalsDropdownData.map(
                            (i: LabelValue, index: number) => (
                              <MenuItem value={i.value} key={i.value}>
                                {i.label}
                              </MenuItem>
                            )
                          )}
                        </Select>
                        {typeOfWorkApprovalsErr && (
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
                        options={projectApprovalsDropdownData}
                        value={
                          projectApprovalsDropdownData.find(
                            (i: LabelValue) => i.value === projectNameApprovals
                          ) || null
                        }
                        disabled={
                          (activeTab !== 2 &&
                            isCreatedByClient &&
                            editData.ProjectId > 0) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) == 3 &&
                            localStorage.getItem("UserId") !=
                              editData.ReviewerId) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) != 3)
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setProjectNameApprovals(value.value);
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
                            error={projectNameApprovalsErr}
                            onBlur={() => {
                              if (projectNameApprovals > 0) {
                                setProjectNameApprovalsErr(false);
                              }
                            }}
                            helperText={
                              projectNameApprovalsErr
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
                        options={
                          activeTab === 2 &&
                          statusApprovalsType === "NotStarted"
                            ? statusApprovalsDropdownDataUseAllTask.filter(
                                (i: any) => i.Type !== "OnHoldFromClient"
                              )
                            : activeTab === 2 &&
                              statusApprovalsType !== "NotStarted"
                            ? statusApprovalsDropdownDataUseAllTask
                            : statusApprovalsDropdownDataUse
                        }
                        value={
                          activeTab === 2
                            ? statusApprovalsDropdownDataUseAllTask.find(
                                (i: LabelValueType) =>
                                  i.value === statusApprovals
                              ) || null
                            : statusApprovalsDropdownDataUse.find(
                                (i: LabelValueType) =>
                                  i.value === statusApprovals
                              ) || null
                        }
                        onChange={(e, value: LabelValueType | null) => {
                          value && setStatusApprovals(value.value);
                          value && setStatusApprovalsType(String(value.Type));
                        }}
                        disabled={
                          (activeTab !== 2 &&
                            isCreatedByClient &&
                            editData.ProjectId > 0) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) == 3 &&
                            localStorage.getItem("UserId") !=
                              editData.ReviewerId) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) != 3)
                        }
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
                            error={statusApprovalsErr}
                            onBlur={() => {
                              if (subProcessApprovals > 0) {
                                setStatusApprovalsErr(false);
                              }
                            }}
                            helperText={
                              statusApprovalsErr
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
                        options={departmentApprovalsDropdownData}
                        value={
                          departmentApprovalsDropdownData.find(
                            (i: LabelValueType) =>
                              i.value === departmentApprovals
                          ) || null
                        }
                        disabled={
                          (activeTab !== 2 &&
                            isCreatedByClient &&
                            editData.ProjectId > 0) ||
                          isAdmin === false ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) == 3 &&
                            localStorage.getItem("UserId") !=
                              editData.ReviewerId) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) != 3)
                        }
                        onChange={(e, value: LabelValueType | null) => {
                          value && setDepartmentApprovals(value.value);
                          setDepartmentApprovalsErr(false);
                          setProcessNameApprovals(0);
                          setProcessNameApprovalsErr(false);
                          setSubProcessApprovals(0);
                          setSubProcessApprovalsErr(false);
                          setDescriptionApprovals("");
                          setDescriptionApprovalsErr(false);
                          setAllInfoDateApprovals("");
                          setValueMonthYearFrom(null);
                          setValueMonthYearTo(null);
                          setMissingInfoApprovalsErr(false);
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
                            error={departmentApprovalsErr}
                            onBlur={() => {
                              if (departmentApprovals > 0) {
                                setDepartmentApprovalsErr(false);
                              }
                            }}
                            helperText={
                              departmentApprovalsErr
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
                        options={processApprovalsDropdownData}
                        value={
                          processApprovalsDropdownData.find(
                            (i: LabelValue) => i.value === processNameApprovals
                          ) || null
                        }
                        disabled={
                          (activeTab !== 2 &&
                            isCreatedByClient &&
                            editData.ProcessId > 0) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) == 3 &&
                            localStorage.getItem("UserId") !=
                              editData.ReviewerId) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) != 3)
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setProcessNameApprovals(value.value);
                          value && setSubProcessApprovals(0);
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
                            error={processNameApprovalsErr}
                            onBlur={() => {
                              if (processNameApprovals > 0) {
                                setProcessNameApprovalsErr(false);
                              }
                            }}
                            helperText={
                              processNameApprovalsErr
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
                        options={subProcessApprovalsDropdownData}
                        value={
                          subProcessApprovalsDropdownData.find(
                            (i: LabelValue) => i.value === subProcessApprovals
                          ) || null
                        }
                        disabled={
                          (activeTab !== 2 &&
                            isCreatedByClient &&
                            editData.SubProcessId > 0) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) == 3 &&
                            localStorage.getItem("UserId") !=
                              editData.ReviewerId) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) != 3)
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setSubProcessApprovals(value.value);
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
                            error={subProcessApprovalsErr}
                            onBlur={() => {
                              if (subProcessApprovals > 0) {
                                setSubProcessApprovalsErr(false);
                              }
                            }}
                            helperText={
                              subProcessApprovalsErr
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
                        disabled={
                          (activeTab !== 2 &&
                            isCreatedByClient &&
                            editData.SubProcessId > 0) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) == 3 &&
                            localStorage.getItem("UserId") !=
                              editData.ReviewerId) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) != 3)
                        }
                        fullWidth
                        className="pt-1"
                        value={
                          clientTaskNameApprovals?.trim().length <= 0
                            ? ""
                            : clientTaskNameApprovals
                        }
                        onChange={(e) => {
                          setClientTaskNameApprovals(e.target.value);
                          setClientTaskNameApprovalsErr(false);
                        }}
                        onBlur={(e) => {
                          if (
                            e.target.value.trim().length < 4 ||
                            e.target.value.trim().length > 100
                          ) {
                            setClientTaskNameApprovalsErr(true);
                          }
                        }}
                        error={clientTaskNameApprovalsErr}
                        helperText={
                          clientTaskNameApprovalsErr &&
                          clientTaskNameApprovals?.trim().length > 0 &&
                          clientTaskNameApprovals?.trim().length < 4
                            ? "Minimum 4 characters required."
                            : clientTaskNameApprovalsErr &&
                              clientTaskNameApprovals?.trim().length > 100
                            ? "Maximum 100 characters allowed."
                            : clientTaskNameApprovalsErr
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
                          departmentApprovalsType === "WhitelabelTaxation" &&
                          typeOfWorkApprovals === 3 ? (
                            "Description"
                          ) : departmentApprovalsType ===
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
                          departmentApprovalsType === "WhitelabelTaxation" &&
                          typeOfWorkApprovals === 3
                        }
                        fullWidth
                        className="pt-1"
                        value={
                          descriptionApprovals?.trim().length <= 0
                            ? ""
                            : descriptionApprovals
                        }
                        onChange={(e) => {
                          setDescriptionApprovals(e.target.value);
                          setDescriptionApprovalsErr(false);
                        }}
                        onBlur={(e) => {
                          if (
                            departmentApprovalsType === "WhitelabelTaxation"
                          ) {
                            setDescriptionApprovalsErr(false);
                          } else if (
                            e.target.value.trim().length <= 0 ||
                            e.target.value.trim().length > 100
                          ) {
                            setDescriptionApprovalsErr(true);
                          }
                        }}
                        error={descriptionApprovalsErr}
                        helperText={
                          descriptionApprovalsErr &&
                          descriptionApprovals?.trim().length > 100
                            ? "Maximum 100 characters allowed."
                            : descriptionApprovalsErr
                            ? "This is a required field."
                            : ""
                        }
                        margin="normal"
                        variant="standard"
                        sx={{ mx: 0.75, width: 300, mt: -1.5 }}
                        disabled={
                          (activeTab !== 2 &&
                            isCreatedByClient &&
                            editData.SubProcessId > 0) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) == 3 &&
                            localStorage.getItem("UserId") !=
                              editData.ReviewerId) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) != 3)
                        }
                      />
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <FormControl
                        variant="standard"
                        sx={{ mx: 0.75, width: 300, mt: -1.2 }}
                        disabled={
                          (activeTab !== 2 &&
                            isCreatedByClient &&
                            editData.SubProcessId > 0) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) == 3 &&
                            localStorage.getItem("UserId") !=
                              editData.ReviewerId) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) != 3)
                        }
                      >
                        <InputLabel id="demo-simple-select-standard-label">
                          Priority
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-standard-label"
                          id="demo-simple-select-standard"
                          value={
                            priorityApprovals === 0 ? "" : priorityApprovals
                          }
                          onChange={(e) => setPriorityApprovals(e.target.value)}
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
                          subProcessApprovals > 0
                            ? (estTimeDataApprovals as any[])
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
                                  return subProcessApprovals === i.Id
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
                        value={quantityApprovals}
                        onChange={(e) => {
                          setQuantityApprovals(e.target.value);
                          setQuantityApprovalsErr(false);
                        }}
                        onBlur={(e) => {
                          if (
                            e.target.value.trim().length > 0 &&
                            e.target.value.trim().length < 5 &&
                            !e.target.value.trim().includes(".")
                          ) {
                            setQuantityApprovalsErr(false);
                          }
                        }}
                        error={quantityApprovalsErr}
                        helperText={
                          quantityApprovalsErr &&
                          quantityApprovals.toString().includes(".")
                            ? "Only intiger value allowed."
                            : quantityApprovalsErr && quantityApprovals === ""
                            ? "This is a required field."
                            : quantityApprovalsErr && quantityApprovals <= 0
                            ? "Enter valid number."
                            : quantityApprovalsErr &&
                              quantityApprovals.length > 4
                            ? "Maximum 4 numbers allowed."
                            : ""
                        }
                        margin="normal"
                        variant="standard"
                        sx={{ mx: 0.75, width: 300, mt: -0.8 }}
                        disabled={
                          (activeTab !== 2 &&
                            isCreatedByClient &&
                            editData.SubProcessId > 0) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) == 3 &&
                            localStorage.getItem("UserId") !=
                              editData.ReviewerId) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) != 3)
                        }
                      />
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <TextField
                        label="Standard Time"
                        fullWidth
                        value={
                          subProcessApprovals > 0
                            ? (estTimeDataApprovals as any[])
                                .map((i) => {
                                  const hours = Math.floor(
                                    (i.EstimatedHour * quantityApprovals) / 3600
                                  );
                                  const minutes = Math.floor(
                                    ((i.EstimatedHour * quantityApprovals) %
                                      3600) /
                                      60
                                  );
                                  const remainingSeconds =
                                    (i.EstimatedHour * quantityApprovals) % 60;
                                  const formattedHours = hours
                                    .toString()
                                    .padStart(2, "0");
                                  const formattedMinutes = minutes
                                    .toString()
                                    .padStart(2, "0");
                                  const formattedSeconds = remainingSeconds
                                    .toString()
                                    .padStart(2, "0");
                                  return subProcessApprovals === i.Id
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
                          mt: typeOfWorkApprovals === 3 ? -0.9 : -0.8,
                        }}
                      />
                    </Grid>
                    <Grid item xs={3} className="pt-4">
                      <div
                        className={`inline-flex -mt-[11px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px] ${
                          receiverDateApprovalsErr ? "datepickerError" : ""
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
                            onError={() => setReceiverDateApprovalsErr(false)}
                            value={
                              receiverDateApprovals === ""
                                ? null
                                : dayjs(receiverDateApprovals)
                            }
                            // shouldDisableDate={isWeekend}
                            disabled={
                              (activeTab !== 2 &&
                                isCreatedByClient &&
                                editData.SubProcessId > 0) ||
                              (activeTab === 2 &&
                                Number(localStorage.getItem("workTypeId")) ==
                                  3 &&
                                localStorage.getItem("UserId") !=
                                  editData.ReviewerId) ||
                              (activeTab === 2 &&
                                Number(localStorage.getItem("workTypeId")) != 3)
                            }
                            maxDate={dayjs(Date.now())}
                            onChange={(newDate: any) => {
                              setReceiverDateApprovals(newDate.$d);
                              setReceiverDateApprovalsErr(false);
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
                              setDueDateApprovals(nextDate);
                              !!reworkReceiverDateApprovals &&
                              new Date(reworkReceiverDateApprovals) <
                                new Date(newDate.$d)
                                ? setReworkReceiverDateApprovalsErr(true)
                                : setReworkReceiverDateApprovalsErr(false);
                            }}
                            slotProps={{
                              textField: {
                                helperText: receiverDateApprovalsErr
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
                      <div className="inline-flex -mt-[11px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]">
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
                              dueDateApprovals === ""
                                ? null
                                : dayjs(dueDateApprovals)
                            }
                            // shouldDisableDate={isWeekend}
                            disabled={
                              (activeTab !== 2 &&
                                isCreatedByClient &&
                                editData.SubProcessId > 0) ||
                              (activeTab === 2 &&
                                Number(localStorage.getItem("workTypeId")) ==
                                  3 &&
                                localStorage.getItem("UserId") !=
                                  editData.ReviewerId) ||
                              (activeTab === 2 &&
                                Number(localStorage.getItem("workTypeId")) != 3)
                            }
                            onChange={(newDate: any) => {
                              setDueDateApprovals(newDate.$d);
                            }}
                            minDate={dayjs(receiverDateApprovals)}
                            slotProps={{
                              textField: {
                                readOnly: true,
                              } as Record<string, any>,
                            }}
                          />
                        </LocalizationProvider>
                      </div>
                    </Grid>
                    {departmentApprovalsType === "WhitelabelTaxation" && (
                      <Grid item xs={3} className="pt-4">
                        <div
                          className={`inline-flex -mt-[11px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]`}
                        >
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label="All Info Date"
                              // shouldDisableDate={isWeekend}
                              disabled={
                                (activeTab !== 2 &&
                                  isCreatedByClient &&
                                  editData.SubProcessId > 0) ||
                                (activeTab === 2 &&
                                  Number(localStorage.getItem("workTypeId")) ==
                                    3 &&
                                  localStorage.getItem("UserId") !=
                                    editData.ReviewerId) ||
                                (activeTab === 2 &&
                                  Number(localStorage.getItem("workTypeId")) !=
                                    3)
                              }
                              value={
                                allInfoDateApprovals === ""
                                  ? null
                                  : dayjs(allInfoDateApprovals)
                              }
                              onChange={(newDate: any) =>
                                setAllInfoDateApprovals(newDate.$d)
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
                        typeOfWorkApprovals === 3
                          ? "pt-2"
                          : departmentApprovalsType !== "WhitelabelTaxation"
                          ? "pt-[17px]"
                          : "pt-5"
                      }`}
                    >
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={assigneeApprovalsDropdownData}
                        disabled={
                          !assigneeDisableApprovals ||
                          (activeTab !== 2 &&
                            isCreatedByClient &&
                            editData.SubProcessId > 0) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) == 3 &&
                            localStorage.getItem("UserId") !=
                              editData.ReviewerId) ||
                          (activeTab === 2 &&
                            Number(localStorage.getItem("workTypeId")) != 3)
                        }
                        value={
                          assigneeApprovalsDropdownData.find(
                            (i: LabelValue) => i.value === assigneeApprovals
                          ) || null
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setAssigneeApprovals(value.value);
                        }}
                        sx={{
                          width: 300,
                          mt: typeOfWorkApprovals === 3 ? 0.2 : -1,
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
                            error={assigneeApprovalsErr}
                            onBlur={() => {
                              if (assigneeApprovals > 0) {
                                setAssigneeApprovalsErr(false);
                              }
                            }}
                            helperText={
                              assigneeApprovalsErr
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
                        typeOfWorkApprovals === 3 ? "pt-2" : "pt-5"
                      }`}
                    >
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={reviewerApprovalsDropdownData}
                        value={
                          reviewerApprovalsDropdownData.find(
                            (i: LabelValue) => i.value === reviewerApprovals
                          ) || null
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setReviewerApprovals(value.value);
                        }}
                        sx={{
                          width: 300,
                          mt: typeOfWorkApprovals === 3 ? 0.2 : -1,
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
                            error={reviewerApprovalsErr}
                            onBlur={() => {
                              if (reviewerApprovals > 0) {
                                setReviewerApprovalsErr(false);
                              }
                            }}
                            helperText={
                              reviewerApprovalsErr
                                ? "This is a required field."
                                : ""
                            }
                            disabled={
                              (activeTab !== 2 &&
                                isCreatedByClient &&
                                editData.SubProcessId > 0) ||
                              (activeTab === 2 &&
                                Number(localStorage.getItem("workTypeId")) ==
                                  3 &&
                                localStorage.getItem("UserId") !=
                                  editData.ReviewerId) ||
                              (activeTab === 2 &&
                                Number(localStorage.getItem("workTypeId")) != 3)
                            }
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={3}
                      className={`${
                        typeOfWorkApprovals === 3 ? "pt-2" : "pt-5"
                      }`}
                    >
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={managerApprovalsDropdownData}
                        value={
                          managerApprovalsDropdownData.find(
                            (i: LabelValue) => i.value === managerApprovals
                          ) || null
                        }
                        onChange={(e, value: LabelValue | null) => {
                          value && setManagerApprovals(value.value);
                        }}
                        sx={{
                          width: 300,
                          mt: typeOfWorkApprovals === 3 ? 0.2 : -1,
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
                            error={managerApprovalsErr}
                            onBlur={() => {
                              if (managerApprovals > 0) {
                                setManagerApprovalsErr(false);
                              }
                            }}
                            helperText={
                              managerApprovalsErr
                                ? "This is a required field."
                                : ""
                            }
                            disabled={
                              (activeTab !== 2 &&
                                isCreatedByClient &&
                                editData.SubProcessId > 0) ||
                              (activeTab === 2 &&
                                Number(localStorage.getItem("workTypeId")) ==
                                  3 &&
                                localStorage.getItem("UserId") !=
                                  editData.ReviewerId) ||
                              (activeTab === 2 &&
                                Number(localStorage.getItem("workTypeId")) != 3)
                            }
                          />
                        )}
                      />
                    </Grid>
                    {departmentApprovalsType === "SMB" && (
                      <Grid
                        item
                        xs={3}
                        className={`${
                          typeOfWorkApprovals === 3 ? "pt-2" : "pt-5"
                        }`}
                      >
                        <Autocomplete
                          disablePortal
                          id="combo-box-demo"
                          options={isQaApprovalsDropdownData}
                          disabled={
                            (activeTab !== 2 &&
                              isCreatedByClient &&
                              editData.SubProcessId > 0) ||
                            (activeTab === 2 &&
                              Number(localStorage.getItem("workTypeId")) == 3 &&
                              localStorage.getItem("UserId") !=
                                editData.ReviewerId) ||
                            (activeTab === 2 &&
                              Number(localStorage.getItem("workTypeId")) !=
                                3) ||
                            !!editData.QAId
                          }
                          value={
                            isQaApprovalsDropdownData.find(
                              (i: LabelValue) => i.value === isQaApprovals
                            ) || null
                          }
                          onChange={(e, value: LabelValue | null) => {
                            value && setIsQaApprovals(value.value);
                          }}
                          sx={{
                            width: 300,
                            mt: typeOfWorkApprovals === 3 ? 0.2 : -1,
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
                    {(departmentApprovalsType === "WhitelabelAccounting" ||
                      departmentApprovalsType === "WhitelabelAustralia" ||
                      departmentApprovalsType === "UK" ||
                      departmentApprovalsType === "Germany") && (
                      <Grid
                        item
                        xs={3}
                        className={`${
                          typeOfWorkApprovals === 3 ? "pt-4" : "pt-5"
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
                                valueMonthYearFrom === ""
                                  ? null
                                  : valueMonthYearFrom
                              }
                              onChange={(newDate: any) =>
                                setValueMonthYearFrom(newDate.$d)
                              }
                              disabled={
                                (activeTab !== 2 &&
                                  isCreatedByClient &&
                                  editData.SubProcessId > 0) ||
                                (activeTab === 2 &&
                                  Number(localStorage.getItem("workTypeId")) ==
                                    3 &&
                                  localStorage.getItem("UserId") !=
                                    editData.ReviewerId) ||
                                (activeTab === 2 &&
                                  Number(localStorage.getItem("workTypeId")) !=
                                    3)
                              }
                            />
                          </LocalizationProvider>
                        </div>
                      </Grid>
                    )}
                    {(departmentApprovalsType === "WhitelabelAccounting" ||
                      departmentApprovalsType === "WhitelabelAustralia" ||
                      departmentApprovalsType === "UK" ||
                      departmentApprovalsType === "Germany") && (
                      <Grid
                        item
                        xs={3}
                        className={`${
                          typeOfWorkApprovals === 3 ? "pt-4" : "pt-5"
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
                                valueMonthYearTo === ""
                                  ? null
                                  : valueMonthYearTo
                              }
                              onChange={(newDate: any) =>
                                setValueMonthYearTo(newDate.$d)
                              }
                              disabled={
                                (activeTab !== 2 &&
                                  isCreatedByClient &&
                                  editData.SubProcessId > 0) ||
                                (activeTab === 2 &&
                                  Number(localStorage.getItem("workTypeId")) ==
                                    3 &&
                                  localStorage.getItem("UserId") !=
                                    editData.ReviewerId) ||
                                (activeTab === 2 &&
                                  Number(localStorage.getItem("workTypeId")) !=
                                    3)
                              }
                            />
                          </LocalizationProvider>
                        </div>
                      </Grid>
                    )}
                    {typeOfWorkApprovals === 3 && (
                      <>
                        <Grid
                          item
                          xs={3}
                          className={`${
                            departmentApprovalsType ===
                              "WhitelabelAccounting" ||
                            departmentApprovalsType === "WhitelabelAustralia" ||
                            departmentApprovalsType === "UK" ||
                            departmentApprovalsType === "Germany"
                              ? "pt-4"
                              : "pt-2"
                          }`}
                        >
                          <FormControl
                            variant="standard"
                            sx={{ width: 300, mt: -0.3, mx: 0.75 }}
                            error={returnYearApprovalsErr}
                            disabled={
                              (activeTab !== 2 &&
                                isCreatedByClient &&
                                editData.SubProcessId > 0) ||
                              (activeTab === 2 &&
                                Number(localStorage.getItem("workTypeId")) ==
                                  3 &&
                                localStorage.getItem("UserId") !=
                                  editData.ReviewerId) ||
                              (activeTab === 2 &&
                                Number(localStorage.getItem("workTypeId")) != 3)
                            }
                          >
                            <InputLabel id="demo-simple-select-standard-label">
                              Return Year
                              <span className="text-defaultRed">&nbsp;*</span>
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-standard-label"
                              id="demo-simple-select-standard"
                              value={
                                returnYearApprovals === 0
                                  ? ""
                                  : returnYearApprovals
                              }
                              onChange={(e) =>
                                setReturnYearApprovals(Number(e.target.value))
                              }
                              onBlur={() => {
                                if (returnYearApprovals > 0) {
                                  setReturnYearApprovalsErr(false);
                                }
                              }}
                            >
                              {yearDropdown.map(
                                (i: LabelValue, index: number) => (
                                  <MenuItem value={i.value} key={i.value}>
                                    {i.label}
                                  </MenuItem>
                                )
                              )}
                            </Select>
                            {returnYearApprovalsErr && (
                              <FormHelperText>
                                This is a required field.
                              </FormHelperText>
                            )}
                          </FormControl>
                        </Grid>
                        <Grid
                          item
                          xs={3}
                          className={`${
                            departmentApprovalsType ===
                              "WhitelabelAccounting" ||
                            departmentApprovalsType === "WhitelabelAustralia" ||
                            departmentApprovalsType === "UK" ||
                            departmentApprovalsType === "Germany" ||
                            departmentApprovalsType === "SMB"
                              ? "pt-4"
                              : departmentApprovalsType === "WhitelabelTaxation"
                              ? "pt-4"
                              : "pt-2"
                          }`}
                        >
                          <TextField
                            label="No of Pages"
                            type="number"
                            fullWidth
                            value={
                              noOfPagesApprovals === 0 ? "" : noOfPagesApprovals
                            }
                            onChange={(e) =>
                              setNoOfPagesApprovals(e.target.value)
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
                            disabled={
                              (activeTab !== 2 &&
                                isCreatedByClient &&
                                editData.SubProcessId > 0) ||
                              (activeTab === 2 &&
                                Number(localStorage.getItem("workTypeId")) ==
                                  3 &&
                                localStorage.getItem("UserId") !=
                                  editData.ReviewerId) ||
                              (activeTab === 2 &&
                                Number(localStorage.getItem("workTypeId")) != 3)
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
                            error={checklistWorkpaperApprovalsErr}
                            disabled={
                              (activeTab !== 2 &&
                                isCreatedByClient &&
                                editData.SubProcessId > 0) ||
                              (activeTab === 2 &&
                                Number(localStorage.getItem("workTypeId")) ==
                                  3 &&
                                localStorage.getItem("UserId") !=
                                  editData.ReviewerId) ||
                              (activeTab === 2 &&
                                Number(localStorage.getItem("workTypeId")) != 3)
                            }
                          >
                            <InputLabel id="demo-simple-select-standard-label">
                              Checklist/Workpaper
                              <span className="text-defaultRed">&nbsp;*</span>
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-standard-label"
                              id="demo-simple-select-standard"
                              value={
                                checklistWorkpaperApprovals === 0
                                  ? ""
                                  : checklistWorkpaperApprovals
                              }
                              onChange={(e) =>
                                setChecklistWorkpaperApprovals(e.target.value)
                              }
                              onBlur={() => {
                                if (checklistWorkpaperApprovals > 0) {
                                  setChecklistWorkpaperApprovalsErr(false);
                                }
                              }}
                            >
                              <MenuItem value={1}>Yes</MenuItem>
                              <MenuItem value={2}>No</MenuItem>
                            </Select>
                            {checklistWorkpaperApprovalsErr && (
                              <FormHelperText>
                                This is a required field.
                              </FormHelperText>
                            )}
                          </FormControl>
                        </Grid>
                      </>
                    )}
                    {departmentApprovalsType === "WhitelabelTaxation" &&
                      statusApprovals > 0 &&
                      statusApprovalsType === "OnHoldFromClient" && (
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
                              !missingInfoApprovals ||
                              missingInfoApprovals?.trim().length <= 0
                                ? ""
                                : missingInfoApprovals
                            }
                            disabled={
                              (activeTab !== 2 &&
                                isCreatedByClient &&
                                editData.SubProcessId > 0) ||
                              (activeTab === 2 &&
                                Number(localStorage.getItem("workTypeId")) ==
                                  3 &&
                                localStorage.getItem("UserId") !=
                                  editData.ReviewerId) ||
                              (activeTab === 2 &&
                                Number(localStorage.getItem("workTypeId")) != 3)
                            }
                            onChange={(e) => {
                              setMissingInfoApprovals(e.target.value);
                              setMissingInfoApprovalsErr(false);
                            }}
                            onBlur={(e) => {
                              if (
                                e.target.value.trim().length <= 0 ||
                                e.target.value.trim().length > 100
                              ) {
                                setMissingInfoApprovalsErr(true);
                              }
                            }}
                            error={missingInfoApprovalsErr}
                            helperText={
                              missingInfoApprovalsErr &&
                              !!missingInfoApprovals &&
                              missingInfoApprovals?.trim().length > 100
                                ? "Maximum 100 characters allowed."
                                : missingInfoApprovalsErr
                                ? "This is a required field."
                                : ""
                            }
                            margin="normal"
                            variant="standard"
                            sx={{
                              mx: 0.75,
                              width: 300,
                              mt:
                                departmentApprovalsType ===
                                  "WhitelabelTaxation" &&
                                statusApprovals > 0 &&
                                statusApprovalsType === "OnHoldFromClient" &&
                                typeOfWorkApprovals !== 3
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
                            (departmentApprovalsType == "UK" ||
                              departmentApprovalsType ==
                                "WhitelabelAccounting" ||
                              departmentApprovalsType ==
                                "WhitelabelAustralia" ||
                              departmentApprovalsType === "Germany") &&
                            typeOfWorkApprovals !== 3
                              ? "pt-6"
                              : departmentApprovalsType ===
                                  "WhitelabelTaxation" &&
                                statusApprovals > 0 &&
                                statusApprovalsType === "OnHoldFromClient" &&
                                typeOfWorkApprovals !== 3
                              ? "pt-6"
                              : "pt-5"
                          }`}
                        >
                          <TextField
                            label="Date of Preperation"
                            type={inputTypePreperation}
                            disabled
                            fullWidth
                            value={dateOfPreperationApprovals}
                            onChange={(e) =>
                              setDateOfPreperationApprovals(e.target.value)
                            }
                            onFocus={() => setInputTypePreperation("date")}
                            onBlur={() => {
                              setInputTypePreperation("text");
                            }}
                            margin="normal"
                            variant="standard"
                            sx={{
                              width: 300,
                              mt: typeOfWorkApprovals === 3 ? -0.4 : -1,
                              mx: 0.75,
                            }}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={3}
                          className={`${
                            (departmentApprovalsType == "UK" ||
                              departmentApprovalsType ==
                                "WhitelabelAccounting" ||
                              departmentApprovalsType ==
                                "WhitelabelAustralia" ||
                              departmentApprovalsType == "WhitelabelTaxation" ||
                              departmentApprovalsType === "Germany" ||
                              departmentApprovalsType === "SMB") &&
                            typeOfWorkApprovals !== 3
                              ? "pt-6"
                              : "pt-5"
                          }`}
                        >
                          <TextField
                            label="Date of Review"
                            disabled
                            type={inputTypeReview}
                            fullWidth
                            value={dateOfReviewApprovals}
                            onChange={(e) =>
                              setDateOfReviewApprovals(e.target.value)
                            }
                            onFocus={() => setInputTypeReview("date")}
                            onBlur={() => {
                              setInputTypeReview("text");
                            }}
                            margin="normal"
                            variant="standard"
                            sx={{
                              width: 300,
                              mt: typeOfWorkApprovals === 3 ? -0.4 : -1,
                              mx: 0.75,
                            }}
                          />
                        </Grid>
                        {!!reworkReceiverDateApprovals && (
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
                                  disabled={
                                    (activeTab !== 2 &&
                                      isCreatedByClient &&
                                      editData.SubProcessId > 0) ||
                                    (activeTab === 2 &&
                                      Number(
                                        localStorage.getItem("workTypeId")
                                      ) == 3 &&
                                      localStorage.getItem("UserId") !=
                                        editData.ReviewerId) ||
                                    (activeTab === 2 &&
                                      Number(
                                        localStorage.getItem("workTypeId")
                                      ) != 3)
                                  }
                                  value={
                                    reworkReceiverDateApprovals === ""
                                      ? null
                                      : dayjs(reworkReceiverDateApprovals)
                                  }
                                  // shouldDisableDate={isWeekend}
                                  minDate={dayjs(receiverDateApprovals)}
                                  maxDate={dayjs(Date.now())}
                                  onChange={(newDate: any) => {
                                    setReworkReceiverDateApprovals(newDate.$d);
                                    const selectedDate = dayjs(newDate.$d);
                                    let nextDate: any = selectedDate;
                                    nextDate = dayjs(newDate.$d)
                                      .add(1, "day")
                                      .toDate();
                                    setReworkDueDateApprovals(nextDate);
                                    !!receiverDateApprovals &&
                                    new Date(receiverDateApprovals) >
                                      new Date(newDate.$d)
                                      ? setReworkReceiverDateApprovalsErr(true)
                                      : setReworkReceiverDateApprovalsErr(
                                          false
                                        );
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
                        {!!reworkDueDateApprovals && (
                          <Grid item xs={3} className="pt-5">
                            <div
                              className={`inline-flex ${
                                typeOfWorkApprovals === 3
                                  ? "-mt-[11px]"
                                  : "-mt-[8px]"
                              } mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]`}
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
                                    reworkDueDateApprovals === ""
                                      ? null
                                      : dayjs(reworkDueDateApprovals)
                                  }
                                  disabled={
                                    (activeTab !== 2 &&
                                      isCreatedByClient &&
                                      editData.SubProcessId > 0) ||
                                    (activeTab === 2 &&
                                      Number(
                                        localStorage.getItem("workTypeId")
                                      ) == 3 &&
                                      localStorage.getItem("UserId") !=
                                        editData.ReviewerId) ||
                                    (activeTab === 2 &&
                                      Number(
                                        localStorage.getItem("workTypeId")
                                      ) != 3)
                                  }
                                  minDate={dayjs(reworkReceiverDateApprovals)}
                                  shouldDisableDate={isWeekend}
                                  onChange={(newDate: any) => {
                                    setReworkDueDateApprovals(newDate.$d);
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
                        {!!editData && !!editData.PrevReviewerId && (
                          <Grid
                            item
                            xs={3}
                            className={`${
                              (departmentApprovalsType == "UK" ||
                                departmentApprovalsType ==
                                  "WhitelabelAccounting" ||
                                departmentApprovalsType ==
                                  "WhitelabelAustralia" ||
                                departmentApprovalsType ==
                                  "WhitelabelTaxation" ||
                                departmentApprovalsType === "Germany" ||
                                departmentApprovalsType === "SMB") &&
                              typeOfWorkApprovals !== 3
                                ? "pt-6"
                                : departmentApprovalsType === "SMB" &&
                                  typeOfWorkApprovals === 3
                                ? "pt-2"
                                : "pt-4"
                            }`}
                          >
                            <Autocomplete
                              disablePortal
                              id="combo-box-demo"
                              options={reviewerApprovalsDropdownData}
                              disabled
                              value={
                                reviewerApprovalsDropdownData?.find(
                                  (i: LabelValue) =>
                                    i.value === editData.PrevReviewerId
                                ) || null
                              }
                              onChange={(e, value: LabelValue | null) => {}}
                              sx={{
                                width: 300,
                                mt: typeOfWorkApprovals === 3 ? 0.2 : -1,
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

            {hasPermissionWorklog("Task/SubTask", "View", "WorkLogs") && (
              <div className="mt-14" id="tabpanel-1">
                <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                  <span className="flex items-center">
                    <TaskIcon />
                    <span className="ml-[21px]">Sub-Task</span>
                  </span>
                  <span className="flex items-center">
                    {subTaskSwitchApprovals && activeTab === 1 && (
                      <ColorToolTip title="Import" placement="top" arrow>
                        <span
                          className="cursor-pointer"
                          onClick={() => {
                            setIsImportOpen(true);
                          }}
                        >
                          <ImportIcon />
                        </span>
                      </ColorToolTip>
                    )}
                    {onEdit > 0 &&
                      subTaskSwitchApprovals &&
                      activeTab === 1 && (
                        <Button
                          variant="contained"
                          className="rounded-[4px] !h-[36px] mx-6 !bg-secondary"
                          onClick={handleSubmitSubTaskApprovals}
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
                        checked={subTaskSwitchApprovals}
                        onChange={(e) => {
                          setSubTaskSwitchApprovals(e.target.checked);
                        }}
                        disabled={activeTab === 2}
                      />
                    ) : (
                      <></>
                    )}
                    <span
                      className={`cursor-pointer ${
                        subTaskApprovalsDrawer ? "rotate-180" : ""
                      }`}
                      onClick={() =>
                        setSubTaskApprovalsDrawer(!subTaskApprovalsDrawer)
                      }
                    >
                      <ChevronDownIcon />
                    </span>
                  </span>
                </div>
                {subTaskApprovalsDrawer && (
                  <div className="mt-3 pl-6 flex flex-col gap-5">
                    {subTaskFieldsApprovals.map((field, index) => (
                      <div
                        className="w-[100%] flex"
                        key={`${field.SubtaskId}${index}`}
                      >
                        <TextField
                          label={<span>Id</span>}
                          fullWidth
                          value={field.SubtaskId > 0 ? field.SubtaskId : ""}
                          disabled
                          margin="normal"
                          variant="standard"
                          sx={{ mx: 0.75, maxWidth: 50, mt: 0 }}
                        />
                        <div className="w-[90%] flex flex-col">
                          <div>
                            <TextField
                              label={
                                <span>
                                  Task Name
                                  <span className="!text-defaultRed">
                                    &nbsp;*
                                  </span>
                                </span>
                              }
                              fullWidth
                              disabled={
                                !subTaskSwitchApprovals || activeTab === 2
                              }
                              value={field.Title}
                              onChange={(e) =>
                                handleSubTaskChangeApprovals(
                                  e.target.value,
                                  index
                                )
                              }
                              onBlur={(e) => {
                                const isDuplicate = subTaskFieldsApprovals
                                  .filter((_, idx) => idx !== index)
                                  .some(
                                    (task) =>
                                      task.Title.trim().toLowerCase() ===
                                      e.target.value.trim().toLowerCase()
                                  );
                                if (
                                  e.target.value.trim().length > 2 &&
                                  e.target.value.trim().length <= 50 &&
                                  !isDuplicate
                                ) {
                                  const newTaskNameErrors = [
                                    ...taskNameApprovalsErr,
                                  ];
                                  newTaskNameErrors[index] = false;
                                  setTaskNameApprovalsErr(newTaskNameErrors);
                                }
                              }}
                              error={taskNameApprovalsErr[index]}
                              helperText={
                                taskNameApprovalsErr[index] &&
                                field.Title.length > 0 &&
                                field.Title.length < 2
                                  ? "Minumum 2 characters required."
                                  : taskNameApprovalsErr[index] &&
                                    field.Title.length > 50
                                  ? "Maximum 50 characters allowed."
                                  : subTaskFieldsApprovals.some(
                                      (task, idx) =>
                                        idx !== index &&
                                        task.Title.trim().toLowerCase() ===
                                          field.Title.trim().toLowerCase()
                                    )
                                  ? "Task name must be unique."
                                  : taskNameApprovalsErr[index]
                                  ? "This is a required field."
                                  : ""
                              }
                              margin="normal"
                              variant="standard"
                              sx={{ mx: 0.75, maxWidth: 300, mt: 0 }}
                            />
                            <TextField
                              label={<span>Description</span>}
                              fullWidth
                              disabled={
                                !subTaskSwitchApprovals || activeTab === 2
                              }
                              value={field.Description}
                              onChange={(e) =>
                                handleSubTaskDescriptionChangeApprovals(
                                  e.target.value,
                                  index
                                )
                              }
                              margin="normal"
                              variant="standard"
                              sx={{ mx: 0.75, maxWidth: 300, mt: 0 }}
                            />
                            <TextField
                              label={
                                <span>
                                  Vendor/Customer Name
                                  <span className="!text-defaultRed">
                                    &nbsp;*
                                  </span>
                                </span>
                              }
                              fullWidth
                              disabled={
                                !subTaskSwitchApprovals || activeTab === 2
                              }
                              value={field.CustomerName}
                              onChange={(e) =>
                                handleSubTaskVendorChangeApprovals(
                                  e.target.value,
                                  index
                                )
                              }
                              onBlur={(e) => {
                                if (
                                  e.target.value.trim().length > 2 &&
                                  e.target.value.trim().length <= 50
                                ) {
                                  const newVendorNameApprovalsErrors = [
                                    ...vendorNameApprovalsErr,
                                  ];
                                  newVendorNameApprovalsErrors[index] = false;
                                  setVendorNameApprovalsErr(
                                    newVendorNameApprovalsErrors
                                  );
                                }
                              }}
                              error={vendorNameApprovalsErr[index]}
                              helperText={
                                vendorNameApprovalsErr[index] &&
                                field.CustomerName.length > 0 &&
                                field.CustomerName.length < 2
                                  ? "Minumum 2 characters required."
                                  : vendorNameApprovalsErr[index] &&
                                    field.CustomerName.length > 50
                                  ? "Maximum 50 characters allowed."
                                  : vendorNameApprovalsErr[index]
                                  ? "This is a required field."
                                  : ""
                              }
                              margin="normal"
                              variant="standard"
                              sx={{ mx: 0.75, maxWidth: 300, mt: 0 }}
                            />
                          </div>
                          <div className="flex">
                            <TextField
                              label={
                                <span>
                                  Bill/Invoice Number
                                  <span className="!text-defaultRed">
                                    &nbsp;*
                                  </span>
                                </span>
                              }
                              fullWidth
                              disabled={
                                !subTaskSwitchApprovals || activeTab === 2
                              }
                              value={field.InvoiceNumber}
                              onChange={(e) =>
                                handleSubTaskInvoiceChangeApprovals(
                                  e.target.value,
                                  index
                                )
                              }
                              onBlur={(e) => {
                                if (
                                  e.target.value.trim().length > 1 &&
                                  e.target.value.trim().length <= 25
                                ) {
                                  const newInvoiceNameApprovalsErrors = [
                                    ...invoiceNameApprovalsErr,
                                  ];
                                  newInvoiceNameApprovalsErrors[index] = false;
                                  setInvoiceNameApprovalsErr(
                                    newInvoiceNameApprovalsErrors
                                  );
                                }
                              }}
                              error={invoiceNameApprovalsErr[index]}
                              helperText={
                                invoiceNameApprovalsErr[index] &&
                                field.InvoiceNumber.length > 25
                                  ? "Maximum 25 characters allowed."
                                  : invoiceNameApprovalsErr[index]
                                  ? "This is a required field."
                                  : ""
                              }
                              margin="normal"
                              variant="standard"
                              sx={{ mx: 0.75, maxWidth: 300, mt: 0 }}
                            />
                            <div
                              className={`inline-flex -mt-[4px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px] ${
                                dateApprovalsErr[index] ? "datepickerError" : ""
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
                                  onError={() => {
                                    const newDateApprovalsErrors = [
                                      ...dateApprovalsErr,
                                    ];
                                    newDateApprovalsErrors[index] = false;
                                    setDateApprovalsErr(newDateApprovalsErrors);
                                  }}
                                  disabled={
                                    !subTaskSwitchApprovals || activeTab === 2
                                  }
                                  value={
                                    field.SubTaskDate === ""
                                      ? null
                                      : dayjs(field.SubTaskDate)
                                  }
                                  // minDate={dayjs(receiverDateApprovals)}
                                  maxDate={dayjs(new Date())}
                                  onChange={(newDate: any) =>
                                    handleSubTaskDateChangeApprovals(
                                      dayjs(newDate.$d).format("YYYY/MM/DD"),
                                      index
                                    )
                                  }
                                  slotProps={{
                                    textField: {
                                      helperText:
                                        dateApprovalsErr[index] &&
                                        field.SubTaskDate.length <= 0
                                          ? "This is a required field."
                                          : // : dateApprovalsErr[index] &&
                                            //   field.SubTaskDate.length > 1
                                            // ? "Enter a valid date."
                                            "",
                                      readOnly: true,
                                    } as Record<string, any>,
                                  }}
                                />
                              </LocalizationProvider>
                            </div>
                            <TextField
                              label={
                                <span>
                                  Bill Amount
                                  <span className="!text-defaultRed">
                                    &nbsp;*
                                  </span>
                                </span>
                              }
                              fullWidth
                              disabled={
                                !subTaskSwitchApprovals || activeTab === 2
                              }
                              value={field.BillAmount}
                              onChange={(e) =>
                                handleSubTaskBillAmountChangeApprovals(
                                  e.target.value,
                                  index
                                )
                              }
                              onBlur={(e) => {
                                if (
                                  e.target.value.trim().length > 1 &&
                                  parseFloat(e.target.value.trim()) > 0
                                ) {
                                  const newBillAmountApprovalsErrors = [
                                    ...billAmountApprovalsErr,
                                  ];
                                  newBillAmountApprovalsErrors[index] = false;
                                  setBillAmountApprovalsErr(
                                    newBillAmountApprovalsErrors
                                  );
                                }
                              }}
                              error={billAmountApprovalsErr[index]}
                              helperText={
                                billAmountApprovalsErr[index]
                                  ? "This is a required field."
                                  : ""
                              }
                              margin="normal"
                              variant="standard"
                              sx={{ mx: 0.75, maxWidth: 300, mt: 0 }}
                            />
                            {subTaskSwitchApprovals &&
                              activeTab === 1 &&
                              !field.SubTaskErrorLogFlag && (
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
                                      ? () => removeTaskFieldApprovals(index)
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
                            {subTaskSwitchApprovals &&
                              activeTab === 1 &&
                              index === 0 && (
                                <span
                                  className="cursor-pointer"
                                  onClick={addTaskFieldApprovals}
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {hasPermissionWorklog("CheckList", "View", "WorkLogs") && (
              <div className="mt-14" id="tabpanel-2">
                <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                  <span className="flex items-center">
                    <CheckListIcon />
                    <span className="ml-[21px]">Checklist</span>
                  </span>
                  <span
                    className={`cursor-pointer ${
                      checkListApprovalsDrawer ? "rotate-180" : ""
                    }`}
                    onClick={() =>
                      setCheckListApprovalsDrawer(!checkListApprovalsDrawer)
                    }
                  >
                    <ChevronDownIcon />
                  </span>
                </div>
                <div className="pl-12 mt-5">
                  {checkListApprovalsDrawer &&
                    checkListDataApprovals?.length > 0 &&
                    checkListDataApprovals.map((i: any, index: number) => (
                      <div className="mt-3" key={i.Category + index}>
                        <span className="flex items-center">
                          <span
                            className="cursor-pointer"
                            onClick={() => toggleGeneralOpen(index)}
                          >
                            {itemStatesApprovals[index] ? (
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
                        {itemStatesApprovals[index] && (
                          <FormGroup className="ml-8 mt-2">
                            {i.Activities.map((j: any, index: number) => (
                              <p key={j.IsCheck + index}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={j.IsCheck}
                                      onChange={(e) =>
                                        hasPermissionWorklog(
                                          "CheckList",
                                          "save",
                                          "WorkLogs"
                                        ) &&
                                        handleChangeChecklistApprovals(
                                          i.Category,
                                          e.target.checked,
                                          j.Title
                                        )
                                      }
                                      disabled={activeTab === 2}
                                    />
                                  }
                                  label={j.Title}
                                />
                              </p>
                            ))}
                          </FormGroup>
                        )}
                        {hasPermissionWorklog(
                          "CheckList",
                          "save",
                          "WorkLogs"
                        ) &&
                          itemStatesApprovals[index] &&
                          !itemStatesApprovals[`addChecklistField_${index}`] &&
                          activeTab === 1 && (
                            <span
                              className="flex items-center gap-3 ml-8 cursor-pointer text-[#6E6D7A]"
                              onClick={() => toggleAddChecklistField(index)}
                            >
                              <AddIcon /> Add new checklist item
                            </span>
                          )}
                        {itemStatesApprovals[index] &&
                          itemStatesApprovals[`addChecklistField_${index}`] &&
                          activeTab === 1 && (
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
                                  checkListNameApprovals?.trim().length <= 0
                                    ? ""
                                    : checkListNameApprovals
                                }
                                onChange={(e) => {
                                  setCheckListNameApprovals(e.target.value);
                                  setCheckListNameApprovalsError(false);
                                }}
                                onBlur={(e) => {
                                  if (e.target.value.trim().length > 5) {
                                    setCheckListNameApprovalsError(false);
                                  }
                                  if (
                                    e.target.value.trim().length > 5 &&
                                    e.target.value.trim().length < 500
                                  ) {
                                    setCheckListNameApprovalsError(false);
                                  }
                                }}
                                error={checkListNameApprovalsError}
                                helperText={
                                  checkListNameApprovalsError &&
                                  checkListNameApprovals.trim().length > 0 &&
                                  checkListNameApprovals.trim().length < 5
                                    ? "Minimum 5 characters required."
                                    : checkListNameApprovalsError &&
                                      checkListNameApprovals.trim().length > 500
                                    ? "Maximum 500 characters allowed."
                                    : checkListNameApprovalsError
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
                                  handleSaveCheckListNameApprovals(
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

            {hasPermissionWorklog("Comment", "View", "WorkLogs") && (
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
                        value={commentSelectApprovals}
                        onChange={(e) => {
                          setCommentSelectApprovals(Number(e.target.value));
                          getCommentDataApprovals(Number(e.target.value));
                        }}
                      >
                        <MenuItem value={1}>Internal</MenuItem>
                        <MenuItem value={2}>External</MenuItem>
                      </Select>
                    </FormControl>
                  </span>
                  <span
                    className={`cursor-pointer ${
                      commentsApprovalsDrawer ? "rotate-180" : ""
                    }`}
                    onClick={() =>
                      setCommentsApprovalsDrawer(!commentsApprovalsDrawer)
                    }
                  >
                    <ChevronDownIcon />
                  </span>
                </div>
                <div className="my-5 px-16">
                  <div className="flex flex-col gap-4">
                    {commentsApprovalsDrawer &&
                      commentDataApprovals.length > 0 &&
                      commentDataApprovals.map(
                        (i: CommentGetByWorkitem, index: number) => (
                          <div className="flex gap-4" key={i.UserName + index}>
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
                                {editingCommentIndexApprovals === index ? (
                                  <div className="flex items-start justify-center gap-8">
                                    <div className="flex flex-col">
                                      <div className="flex items-start justify-start">
                                        <MentionsInput
                                          style={mentionsInputStyle}
                                          className="!w-[100%] textareaOutlineNoneEdit max-w-[60vw]"
                                          value={valueEdit}
                                          onChange={(e) => {
                                            setValueEdit(e.target.value);
                                            setValueEditError(false);
                                            handleCommentChange(e.target.value);
                                          }}
                                          placeholder="Type a next message OR type @ if you want to mention anyone in the message."
                                        >
                                          <Mention
                                            data={users}
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
                                                handleCommentAttachmentsChange(
                                                  data1,
                                                  data2,
                                                  commentAttachmentApprovals
                                                )
                                              }
                                              isDisable={false}
                                              fileHasError={(error: boolean) =>
                                                setFileEditHasError(error)
                                              }
                                            />
                                          </div>
                                        </div>
                                        {commentAttachmentApprovals[0]
                                          ?.SystemFileName.length > 0 && (
                                          <div className="flex items-start justify-center">
                                            <span className="cursor-pointer">
                                              {
                                                commentAttachmentApprovals[0]
                                                  ?.UserFileName
                                              }
                                            </span>
                                            <span
                                              onClick={() =>
                                                getFileFromBlob(
                                                  commentAttachmentApprovals[0]
                                                    ?.SystemFileName,
                                                  commentAttachmentApprovals[0]
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
                                        {valueEditError && (
                                          <span className="text-defaultRed text-[14px]">
                                            This is a required field.
                                          </span>
                                        )}
                                        {!valueEditError &&
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
                                        handleSaveClickApprovals(
                                          e,
                                          i,
                                          commentSelectApprovals
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
                                            commentUserDataApprovals.map(
                                              (j: LabelValue) => j.label
                                            );
                                          return assignee.includes(i) ? (
                                            <span
                                              className="text-secondary"
                                              key={i + index}
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
                                        <span className="cursor-pointer">
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
                                      hasPermissionWorklog(
                                        "Comment",
                                        "save",
                                        "WorkLogs"
                                      ) && (
                                        <button
                                          type="button"
                                          className="flex items-start !bg-secondary text-white border rounded-md p-[4px]"
                                          onClick={() => {
                                            handleEditClick(index, i.Message);
                                            setCommentAttachmentApprovals([
                                              {
                                                AttachmentId:
                                                  i.Attachment[0].AttachmentId,
                                                UserFileName:
                                                  i.Attachment[0].UserFileName,
                                                SystemFileName:
                                                  i.Attachment[0]
                                                    .SystemFileName,
                                                AttachmentPath:
                                                  process.env.attachment || "",
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
                {commentsApprovalsDrawer &&
                  hasPermissionWorklog("Comment", "save", "WorkLogs") && (
                    <>
                      <div className="border border-slatyGrey gap-2 py-2 rounded-lg my-2 ml-16 mr-8 flex items-center justify-center">
                        <MentionsInput
                          style={mentionsInputStyle}
                          className="!w-[92%] textareaOutlineNone"
                          value={value}
                          onChange={(e) => {
                            setValue(e.target.value);
                            setValueError(false);
                            handleCommentChange(e.target.value);
                          }}
                          placeholder="Type a next message OR type @ if you want to mention anyone in the message."
                        >
                          <Mention
                            data={users}
                            style={{ backgroundColor: "#cee4e5" }}
                            trigger="@"
                          />
                        </MentionsInput>
                        <div className="flex flex-col">
                          <div className="flex">
                            <ImageUploader
                              className="!mt-0"
                              getData={(data1: string, data2: string) =>
                                handleCommentAttachmentsChange(
                                  data1,
                                  data2,
                                  commentAttachmentApprovals
                                )
                              }
                              isDisable={false}
                              fileHasError={(error: boolean) =>
                                setFileHasError(error)
                              }
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          className="!bg-secondary text-white p-[6px] rounded-md cursor-pointer mr-2"
                          onClick={(e) =>
                            handleSubmitComment(e, commentSelectApprovals)
                          }
                        >
                          <SendIcon />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          {valueError &&
                          value.trim().length > 1 &&
                          value.trim().length < 5 ? (
                            <span className="text-defaultRed text-[14px] ml-20">
                              Minimum 5 characters required.
                            </span>
                          ) : valueError ? (
                            <span className="text-defaultRed text-[14px] ml-20">
                              This is a required field.
                            </span>
                          ) : !valueError && fileHasError ? (
                            <span className="text-defaultRed text-[14px] ml-20">
                              File size shouldn&apos;t be more than 5MB.
                            </span>
                          ) : (
                            ""
                          )}
                        </div>
                        {commentAttachmentApprovals[0].AttachmentId === 0 &&
                          commentAttachmentApprovals[0]?.SystemFileName.length >
                            0 && (
                            <div className="flex items-center justify-center gap-2 mr-6">
                              <span className="ml-2 cursor-pointer">
                                {commentAttachmentApprovals[0]?.UserFileName}
                              </span>
                              <span
                                onClick={() =>
                                  getFileFromBlob(
                                    commentAttachmentApprovals[0]
                                      ?.SystemFileName,
                                    commentAttachmentApprovals[0]?.UserFileName
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

            {hasPermissionWorklog("Reccuring", "View", "WorkLogs") && (
              <div className="mt-14" id="tabpanel-4">
                <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                  <span className="flex items-center">
                    <HistoryIcon />
                    <span className="ml-[21px]">Recurring</span>
                  </span>

                  <span
                    className={`cursor-pointer ${
                      recurringApprovalsDrawer ? "rotate-180" : ""
                    }`}
                    onClick={() =>
                      setRecurringApprovalsDrawer(!recurringApprovalsDrawer)
                    }
                  >
                    <ChevronDownIcon />
                  </span>
                </div>
                {recurringApprovalsDrawer && (
                  <>
                    <div className="mt-0 pl-6">
                      <div
                        className={`inline-flex mt-[12px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]`}
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
                            maxDate={dayjs(recurringEndDateApprovals)}
                            value={
                              recurringStartDateApprovals === ""
                                ? null
                                : dayjs(recurringStartDateApprovals)
                            }
                            readOnly
                            disabled={activeTab === 2}
                          />
                        </LocalizationProvider>
                      </div>
                      <div
                        className={`inline-flex mt-[12px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]`}
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
                            minDate={dayjs(recurringStartDateApprovals)}
                            value={
                              recurringEndDateApprovals === ""
                                ? null
                                : dayjs(recurringEndDateApprovals)
                            }
                            readOnly
                            disabled={activeTab === 2}
                          />
                        </LocalizationProvider>
                      </div>
                    </div>
                    <div className="mt-0 pl-6">
                      <FormControl
                        variant="standard"
                        sx={{ mx: 0.75, minWidth: 145 }}
                        disabled={activeTab === 2}
                      >
                        <InputLabel id="demo-simple-select-standard-label">
                          {recurringTimeApprovals === 1 ? (
                            <span>
                              Day
                              <span className="text-defaultRed">&nbsp;*</span>
                            </span>
                          ) : recurringTimeApprovals === 2 ? (
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
                          value={
                            recurringTimeApprovals === 0
                              ? ""
                              : recurringTimeApprovals
                          }
                          readOnly
                        >
                          <MenuItem value={1}>Day</MenuItem>
                          <MenuItem value={2}>Week</MenuItem>
                          <MenuItem value={3}>Month</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                    {recurringTimeApprovals === 2 && (
                      <div className="pl-4 m-2 flex">
                        {days.map((day, index) => (
                          <div
                            key={day[0] + index}
                            className={`px-3 py-1 rounded-[50%] m-[5px] ${
                              selectedDays.includes(index)
                                ? "text-pureWhite bg-secondary"
                                : "text-slatyGrey"
                            }`}
                            onClick={() =>
                              activeTab === 1 && toggleColor(index)
                            }
                          >
                            {day[0]}
                          </div>
                        ))}
                      </div>
                    )}
                    {recurringTimeApprovals === 3 && (
                      <div className="mt-[10px] pl-6">
                        <Autocomplete
                          multiple
                          limitTags={2}
                          id="checkboxes-tags-demo"
                          options={Array.isArray(months) ? months : []}
                          value={
                            Array.isArray(recurringMonthApprovals)
                              ? recurringMonthApprovals
                              : []
                          }
                          disabled={activeTab === 2}
                          getOptionLabel={(option) => option.label}
                          disableCloseOnSelect
                          onChange={handleMultiSelectMonth}
                          style={{ width: 500 }}
                          readOnly
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
                            />
                          )}
                          sx={{ mx: 0.75, maxWidth: 350, mt: 2 }}
                        />
                      </div>
                    )}
                    <span
                      className={`flex flex-col items-start ${
                        recurringTimeApprovals === 3 && "mt-2"
                      }`}
                    >
                      <span className="text-darkCharcoal ml-8 text-[14px]">
                        {recurringTimeApprovals === 1
                          ? "Occurs every day"
                          : recurringTimeApprovals === 2
                          ? `Occurs every ${selectedDays
                              .sort()
                              .map(
                                (day: number) => " " + days[day]
                              )} starting from today`
                          : recurringTimeApprovals === 3 &&
                            "Occurs every month starting from today"}
                      </span>
                    </span>
                  </>
                )}
              </div>
            )}

            <div className="mt-14" id="tabpanel-5">
              <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                <span className="flex items-center">
                  <ClockIcon />
                  <span className="ml-[21px]">Manual Time</span>
                </span>
                <span
                  className={`cursor-pointer ${
                    manualTimeDrawer ? "rotate-180" : ""
                  }`}
                  onClick={() => setManualTimeDrawer(!manualTimeDrawer)}
                >
                  <ChevronDownIcon />
                </span>
              </div>
              {manualTimeDrawer && (
                <>
                  <div className="-mt-2 pl-6">
                    {manualFieldsApprovals.map((field) => (
                      <div key={field.Id}>
                        <div
                          className={`inline-flex mt-[12px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]`}
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
                              value={
                                field.inputDate === ""
                                  ? null
                                  : dayjs(field.inputDate)
                              }
                              readOnly
                              disabled={activeTab === 2}
                            />
                          </LocalizationProvider>
                        </div>
                        <TextField
                          label={
                            <span>
                              Time in Minute
                              <span className="!text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                          placeholder="000"
                          fullWidth
                          value={field.startTime}
                          InputProps={{ readOnly: true }}
                          inputProps={{ readOnly: true }}
                          margin="normal"
                          variant="standard"
                          sx={{ mx: 0.75, maxWidth: 300 }}
                          disabled={activeTab === 2}
                        />
                        <TextField
                          label={
                            <span>
                              Description
                              <span className="!text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                          className="mt-4"
                          fullWidth
                          value={field.manualDesc}
                          InputProps={{ readOnly: true }}
                          inputProps={{ readOnly: true }}
                          margin="normal"
                          variant="standard"
                          sx={{ mx: 0.75, maxWidth: 300, mt: 2 }}
                          disabled={activeTab === 2}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="mt-14" id="tabpanel-6">
              <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                <span className="flex items-center">
                  <ClockIcon />
                  <span className="ml-[21px]">Reviewer Manual Time</span>
                </span>
                <span className="flex items-center">
                  {onEdit > 0 && manualSwitch && activeTab === 1 && (
                    <Button
                      variant="contained"
                      className={`rounded-[4px] !h-[36px] mr-6 ${
                        manualSubmitDisable ? "" : "!bg-secondary"
                      }`}
                      disabled={manualSubmitDisable}
                      onClick={
                        manualSubmitDisable
                          ? undefined
                          : saveReviewerManualTimelog
                      }
                    >
                      Update
                    </Button>
                  )}
                  <Switch
                    checked={manualSwitch}
                    onChange={(e) => {
                      setManualSwitch(e.target.checked);
                      setReviewerManualFields([
                        {
                          AssigneeId: 0,
                          Id: 0,
                          inputDate: "",
                          startTime: 0,
                          manualDesc: "",
                          IsApproved: false,
                          IsCurrentReviewer: true,
                        },
                      ]);
                      setInputDateErrors([false]);
                      setStartTimeErrors([false]);
                      setManualDescErrors([false]);
                      setInputTypeDate(["text"]);
                      setManualDisableData([
                        {
                          AssigneeId: 0,
                          Id: 0,
                          inputDate: "",
                          startTime: 0,
                          manualDesc: "",
                          IsApproved: false,
                          IsCurrentReviewer: true,
                        },
                      ]);
                    }}
                    disabled={activeTab === 2}
                  />
                  <span
                    className={`cursor-pointer ${
                      manualTimeDrawer ? "rotate-180" : ""
                    }`}
                    onClick={() => setManualTimeDrawer(!manualTimeDrawer)}
                  >
                    <ChevronDownIcon />
                  </span>
                </span>
              </div>
              {manualTimeDrawer && (
                <>
                  <div className="-mt-2 pl-6">
                    {reviewermanualFields.map((field, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className={`inline-flex mt-[12px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px] ${
                            inputDateErrors[index] ||
                            checkDate(
                              field.inputDate,
                              field.IsCurrentReviewer,
                              field.IsApproved
                            )
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
                                !manualSwitch ||
                                field.IsApproved ||
                                (field.AssigneeId !== 0 &&
                                  field.AssigneeId !== userId)
                                  ? ""
                                  : dayjs(receiverDateApprovals) >
                                    dayjs(reviewerDate)
                                  ? dayjs(new Date())
                                  : dayjs(reviewerDate)
                              }
                              maxDate={dayjs(new Date())}
                              disabled={
                                !manualSwitch ||
                                field.IsApproved ||
                                (field.AssigneeId !== 0 &&
                                  field.AssigneeId !== userId) ||
                                activeTab === 2
                              }
                              onError={() => {
                                if (field.inputDate[index]?.trim().length > 0) {
                                  const newInputDateErrors = [
                                    ...inputDateErrors,
                                  ];
                                  newInputDateErrors[index] = false;
                                  setInputDateErrors(newInputDateErrors);
                                }
                              }}
                              value={
                                field.inputDate === ""
                                  ? null
                                  : dayjs(field.inputDate)
                              }
                              onChange={(newDate: any) => {
                                handleInputDateChange(newDate.$d, index);
                              }}
                              slotProps={{
                                textField: {
                                  helperText:
                                    !!field.inputDate &&
                                    (inputDateErrors[index] ||
                                      checkDate(
                                        field.inputDate,
                                        field.IsCurrentReviewer,
                                        field.IsApproved
                                      ))
                                      ? "Date Must be grater than Received Date"
                                      : inputDateErrors[index]
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
                              <span className="!text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                          placeholder="000"
                          disabled={
                            !manualSwitch ||
                            field.IsApproved ||
                            (field.AssigneeId !== 0 &&
                              field.AssigneeId !== userId) ||
                            activeTab === 2
                          }
                          fullWidth
                          value={field.startTime == 0 ? "" : field.startTime}
                          onChange={(e) =>
                            handleStartTimeChange(e.target.value, index)
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
                              const newStartTimeApprovalsErrors = [
                                ...startTimeErrors,
                              ];
                              newStartTimeApprovalsErrors[index] = true;
                              setStartTimeErrors(newStartTimeApprovalsErrors);
                            } else {
                              const newStartTimeApprovalsErrors = [
                                ...startTimeErrors,
                              ];
                              newStartTimeApprovalsErrors[index] = false;
                              setStartTimeErrors(newStartTimeApprovalsErrors);
                            }
                          }}
                          error={startTimeErrors[index]}
                          helperText={
                            field.startTime.toString().trim().length > 3 &&
                            startTimeErrors[index]
                              ? "Maximum 3 characters allowed."
                              : field.startTime > 480 && startTimeErrors[index]
                              ? "Maximum 480 minutes allowed."
                              : (field.startTime.toString() == "0" ||
                                  field.startTime.toString() == "00" ||
                                  field.startTime.toString() == "000") &&
                                startTimeErrors[index]
                              ? "Please enter valid number."
                              : field.startTime.toString().trim().length <= 0 &&
                                startTimeErrors[index]
                              ? "This is a required field"
                              : ""
                          }
                          margin="normal"
                          variant="standard"
                          sx={{ mx: 0.75, maxWidth: 300 }}
                        />
                        <TextField
                          label={
                            <span>
                              Description
                              <span className="!text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                          className="mt-4"
                          disabled={
                            !manualSwitch ||
                            field.IsApproved ||
                            (field.AssigneeId !== 0 &&
                              field.AssigneeId !== userId) ||
                            activeTab === 2
                          }
                          fullWidth
                          value={field.manualDesc}
                          onChange={(e) =>
                            handleManualDescChange(e.target.value, index)
                          }
                          onBlur={(e) => {
                            if (
                              e.target.value.trim().length < 1 ||
                              e.target.value.trim().length > 500
                            ) {
                              const newManualDescErrors = [...manualDescErrors];
                              newManualDescErrors[index] = true;
                              setManualDescErrors(newManualDescErrors);
                            }
                          }}
                          error={manualDescErrors[index]}
                          helperText={
                            manualDescErrors[index] &&
                            field.manualDesc.length > 500
                              ? "Maximum 500 characters allowed."
                              : manualDescErrors[index]
                              ? "This is a required field."
                              : ""
                          }
                          margin="normal"
                          variant="standard"
                          sx={{ mx: 0.75, maxWidth: 300, mt: 2 }}
                        />
                        {index === 0 &&
                          manualSwitch &&
                          !field.IsApproved &&
                          field.IsCurrentReviewer &&
                          field.Id > 0 &&
                          activeTab === 1 && (
                            <span
                              className="cursor-pointer"
                              onClick={() => removePhoneField(index)}
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
                        {index === 0 && manualSwitch && activeTab === 1 && (
                          <span
                            className="cursor-pointer"
                            onClick={addManualField}
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
                        {index > 0 &&
                          manualSwitch &&
                          !field.IsApproved &&
                          field.IsCurrentReviewer &&
                          activeTab === 1 && (
                            <span
                              className="cursor-pointer"
                              onClick={() => removePhoneField(index)}
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
                    ))}
                  </div>
                </>
              )}
            </div>

            {hasPermissionWorklog("Reminder", "View", "WorkLogs") && (
              <div className="my-14" id="tabpanel-7">
                <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                  <span className="flex items-center">
                    <BellIcon />
                    <span className="ml-[21px]">Reminder</span>
                  </span>
                  <span className="flex items-center">
                    {onEdit > 0 &&
                      reminderSwitchApprovals &&
                      activeTab === 1 && (
                        <Button
                          variant="contained"
                          className="rounded-[4px] !h-[36px] mr-6 !bg-secondary"
                          onClick={handleSubmitReminderApprovals}
                        >
                          Update
                        </Button>
                      )}
                    {hasPermissionWorklog("Reminder", "Save", "WorkLogs") ? (
                      <Switch
                        checked={reminderSwitchApprovals}
                        onChange={(e) => {
                          setReminderSwitchApprovals(e.target.checked);
                          setReminderDateApprovals("");
                          setReminderDateApprovalsErr(false);
                          setReminderTimeApprovals(0);
                          setReminderTimeApprovalsErr(false);
                          setReminderNotificationApprovals(0);
                          setReminderNotificationApprovalsErr(false);
                        }}
                        disabled={activeTab === 2}
                      />
                    ) : (
                      <></>
                    )}
                    <span
                      className={`cursor-pointer ${
                        reminderApprovalsDrawer ? "rotate-180" : ""
                      }`}
                      onClick={() =>
                        setReminderApprovalsDrawer(!reminderApprovalsDrawer)
                      }
                    >
                      <ChevronDownIcon />
                    </span>
                  </span>
                </div>
                {reminderApprovalsDrawer && (
                  <>
                    <div className="mt-2 pl-6">
                      <RadioGroup
                        aria-labelledby="demo-radio-buttons-group-label"
                        defaultValue={reminderCheckboxValueApprovals}
                        name="radio-buttons-group"
                        row={true}
                        className="ml-2 gap-10"
                        onChange={(e) => {
                          setReminderCheckboxValueApprovals(
                            parseInt(e.target.value)
                          );
                          onEdit === 0 && setReminderDateApprovals("");
                          setReminderDateApprovalsErr(false);
                          onEdit === 0 && setReminderTimeApprovals(0);
                          setReminderTimeApprovalsErr(false);
                          onEdit === 0 && setReminderNotificationApprovals(0);
                          setReminderNotificationApprovalsErr(false);
                        }}
                      >
                        <FormControlLabel
                          disabled={!reminderSwitchApprovals || activeTab === 2}
                          value={1}
                          control={<Radio />}
                          label="Due Date"
                        />
                        <FormControlLabel
                          disabled={!reminderSwitchApprovals || activeTab === 2}
                          value={2}
                          control={<Radio />}
                          label="Specific Date"
                        />
                        <FormControlLabel
                          disabled={!reminderSwitchApprovals || activeTab === 2}
                          value={3}
                          control={<Radio />}
                          label="Daily"
                        />
                        <FormControlLabel
                          disabled={!reminderSwitchApprovals || activeTab === 2}
                          value={4}
                          control={<Radio />}
                          label="Days Before Due Date"
                        />
                      </RadioGroup>
                    </div>
                    <div className="pl-6 flex">
                      {reminderCheckboxValueApprovals === 2 && onEdit === 0 && (
                        <div
                          className={`inline-flex mt-[0px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px] ${
                            reminderDateApprovalsErr ? "datepickerError" : ""
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
                                !reminderSwitchApprovals || activeTab === 2
                              }
                              onError={() => setReminderDateApprovalsErr(false)}
                              value={
                                reminderDateApprovals === ""
                                  ? null
                                  : dayjs(reminderDateApprovals)
                              }
                              onChange={(newDate: any) => {
                                setReminderDateApprovals(newDate.$d);
                                setReminderDateApprovalsErr(false);
                              }}
                              slotProps={{
                                textField: {
                                  helperText: reminderDateApprovalsErr
                                    ? "This is a required field."
                                    : "",
                                  readOnly: true,
                                } as Record<string, any>,
                              }}
                            />
                          </LocalizationProvider>
                        </div>
                      )}

                      {reminderCheckboxValueApprovals === 2 && onEdit > 0 && (
                        <div
                          className={`inline-flex mt-[0px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px] ${
                            reminderDateApprovalsErr ? "datepickerError" : ""
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
                                !reminderSwitchApprovals || activeTab === 2
                              }
                              onError={() => setReminderDateApprovalsErr(false)}
                              value={
                                reminderDateApprovals === ""
                                  ? null
                                  : dayjs(reminderDateApprovals)
                              }
                              onChange={(newDate: any) => {
                                setReminderDateApprovals(newDate.$d);
                                setReminderDateApprovalsErr(false);
                              }}
                              slotProps={{
                                textField: {
                                  helperText: reminderDateApprovalsErr
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
                        error={reminderTimeApprovalsErr}
                      >
                        <InputLabel id="demo-simple-select-standard-label">
                          Hour
                          <span className="text-defaultRed">&nbsp;*</span>
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-standard-label"
                          id="demo-simple-select-standard"
                          disabled={!reminderSwitchApprovals || activeTab === 2}
                          value={
                            reminderTimeApprovals === 0
                              ? ""
                              : reminderTimeApprovals
                          }
                          onChange={(e) =>
                            setReminderTimeApprovals(e.target.value)
                          }
                          onBlur={() => {
                            if (reminderTimeApprovals > 0) {
                              setReminderTimeApprovalsErr(false);
                            }
                          }}
                        >
                          {hours.map((i: LabelValue) => (
                            <MenuItem value={i.value} key={i.value}>
                              {i.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {reminderTimeApprovalsErr && (
                          <FormHelperText>
                            This is a required field.
                          </FormHelperText>
                        )}
                      </FormControl>
                      <Autocomplete
                        multiple
                        limitTags={2}
                        id="checkboxes-tags-demo"
                        disabled={!reminderSwitchApprovals || activeTab === 2}
                        options={
                          Array.isArray(assigneeApprovalsDropdownData)
                            ? assigneeApprovalsDropdownData
                            : []
                        }
                        value={
                          Array.isArray(reminderNotificationApprovals)
                            ? reminderNotificationApprovals
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
                            error={reminderNotificationApprovalsErr}
                            onBlur={() => {
                              if (reminderNotificationApprovals.length > 0) {
                                setReminderNotificationApprovalsErr(false);
                              }
                            }}
                            helperText={
                              reminderNotificationApprovalsErr
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

            {hasPermissionWorklog("ErrorLog", "View", "WorkLogs") && (
              <div className="mt-14" id="tabpanel-8">
                <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                  <span className="flex items-center">
                    <TaskIcon />
                    <span className="ml-[21px]">Error Logs</span>
                  </span>
                  <span className="flex items-center">
                    {hasPermissionWorklog("ErrorLog", "Save", "WorkLogs") &&
                      onEdit > 0 &&
                      activeTab === 1 && (
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
                        errorLogApprovalsDrawer ? "rotate-180" : ""
                      }`}
                      onClick={() =>
                        setErorLogApprovalsDrawer(!errorLogApprovalsDrawer)
                      }
                    >
                      <ChevronDownIcon />
                    </span>
                  </span>
                </div>
                {errorLogApprovalsDrawer && (
                  <>
                    <div className="mt-3 pl-6">
                      {errorLogFieldsApprovals.map((field, index) => (
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
                            className={`inline-flex mt-[8px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[230px] ${
                              errorIdentificationErrApprovals[index]
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
                                disabled={
                                  (!hasPermissionWorklog(
                                    "ErrorLog",
                                    "Save",
                                    "WorkLogs"
                                  ) &&
                                    hasPermissionWorklog(
                                      "ErrorLog",
                                      "Delete",
                                      "WorkLogs"
                                    )) ||
                                  field.isSolved ||
                                  activeTab === 2
                                }
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
                                    helperText: errorIdentificationErrApprovals[
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
                          <div
                            className={`inline-flex mt-[8px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[230px] ${
                              recordedDateErrApprovals[index]
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
                                disabled={
                                  (!hasPermissionWorklog(
                                    "ErrorLog",
                                    "Save",
                                    "WorkLogs"
                                  ) &&
                                    hasPermissionWorklog(
                                      "ErrorLog",
                                      "Delete",
                                      "WorkLogs"
                                    )) ||
                                  field.isSolved ||
                                  activeTab === 2
                                }
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
                                    helperText: recordedDateErrApprovals[index]
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
                            error={errorTypeErrApprovals[index]}
                          >
                            <InputLabel id="demo-simple-select-standard-label">
                              Error Type
                              <span className="text-defaultRed">&nbsp;*</span>
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-standard-label"
                              id="demo-simple-select-standard"
                              disabled={
                                (!hasPermissionWorklog(
                                  "ErrorLog",
                                  "Save",
                                  "WorkLogs"
                                ) &&
                                  hasPermissionWorklog(
                                    "ErrorLog",
                                    "Delete",
                                    "WorkLogs"
                                  )) ||
                                field.isSolved ||
                                activeTab === 2
                              }
                              value={
                                field.ErrorType === 0 ? "" : field.ErrorType
                              }
                              onChange={(e) => {
                                handleErrorTypeChangeApprovals(
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
                                    ...errorTypeErrApprovals,
                                  ];
                                  newErrorTypeErrors[index] = false;
                                  setErrorTypeErrApprovals(newErrorTypeErrors);
                                }
                              }}
                            >
                              {errorTypeOptions.map((e: LabelValue) => (
                                <MenuItem value={e.value} key={e.value}>
                                  {e.label}
                                </MenuItem>
                              ))}
                            </Select>
                            {errorTypeErrApprovals[index] && (
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
                              disabled={
                                (!hasPermissionWorklog(
                                  "ErrorLog",
                                  "Save",
                                  "WorkLogs"
                                ) &&
                                  hasPermissionWorklog(
                                    "ErrorLog",
                                    "Delete",
                                    "WorkLogs"
                                  )) ||
                                field.isSolved ||
                                activeTab === 2
                              }
                              value={
                                field.IdentifiedBy !== null &&
                                field.IdentifiedBy.trim().length === 0
                                  ? ""
                                  : field.IdentifiedBy
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
                                    ...identifiedByErrApprovals,
                                  ];
                                  newIdentifiedByErrors[index] = true;
                                  setIdentifiedByErrApprovals(
                                    newIdentifiedByErrors
                                  );
                                } else {
                                  const newIdentifiedByErrors = [
                                    ...identifiedByErrApprovals,
                                  ];
                                  newIdentifiedByErrors[index] = false;
                                  setIdentifiedByErrApprovals(
                                    newIdentifiedByErrors
                                  );
                                }
                              }}
                              error={identifiedByErrApprovals[index]}
                              helperText={
                                identifiedByErrApprovals[index] &&
                                field.IdentifiedBy !== null &&
                                field.IdentifiedBy.trim().length > 50
                                  ? "Maximum 50 characters allowed."
                                  : identifiedByErrApprovals[index]
                                  ? "This is a required field."
                                  : ""
                              }
                              margin="normal"
                              variant="standard"
                              sx={{ mx: 0.75, maxWidth: 230, mt: 1.5 }}
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
                            error={natureOfErrApprovals[index]}
                          >
                            <InputLabel id="demo-simple-select-standard-label">
                              Error Details
                              <span className="text-defaultRed">&nbsp;*</span>
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-standard-label"
                              id="demo-simple-select-standard"
                              disabled={
                                (!hasPermissionWorklog(
                                  "ErrorLog",
                                  "Save",
                                  "WorkLogs"
                                ) &&
                                  hasPermissionWorklog(
                                    "ErrorLog",
                                    "Delete",
                                    "WorkLogs"
                                  )) ||
                                field.isSolved ||
                                activeTab === 2
                              }
                              value={
                                field.NatureOfError === 0
                                  ? ""
                                  : field.NatureOfError
                              }
                              onChange={(e) =>
                                handleNatureOfErrorChangeApprovals(
                                  Number(e.target.value),
                                  index
                                )
                              }
                              onBlur={() => {
                                if (field.NatureOfError > 0) {
                                  const newNatureOfErrorErrors = [
                                    ...natureOfErrApprovals,
                                  ];
                                  newNatureOfErrorErrors[index] = false;
                                  setNatureOfErrApprovals(
                                    newNatureOfErrorErrors
                                  );
                                }
                              }}
                            >
                              {natureOfErrorDropdown.map((n: LabelValue) => (
                                <MenuItem value={n.value} key={n.value}>
                                  {n.label}
                                </MenuItem>
                              ))}
                            </Select>
                            {natureOfErrApprovals[index] && (
                              <FormHelperText>
                                This is a required field.
                              </FormHelperText>
                            )}
                          </FormControl>
                          <FormControl
                            variant="standard"
                            sx={{ mx: 0.75, minWidth: 230, mt: 1 }}
                            error={rootCauseErrApprovals[index]}
                          >
                            <InputLabel id="demo-simple-select-standard-label">
                              Error Category
                              <span className="text-defaultRed">&nbsp;*</span>
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-standard-label"
                              id="demo-simple-select-standard"
                              disabled={
                                (!hasPermissionWorklog(
                                  "ErrorLog",
                                  "Save",
                                  "WorkLogs"
                                ) &&
                                  hasPermissionWorklog(
                                    "ErrorLog",
                                    "Delete",
                                    "WorkLogs"
                                  )) ||
                                field.isSolved ||
                                activeTab === 2
                              }
                              value={
                                field.RootCause === 0 ? "" : field.RootCause
                              }
                              onChange={(e) =>
                                handleRootCauseChangeApprovals(
                                  Number(e.target.value),
                                  index
                                )
                              }
                              onBlur={() => {
                                if (field.RootCause > 0) {
                                  const newRootCauseErrors = [
                                    ...rootCauseErrApprovals,
                                  ];
                                  newRootCauseErrors[index] = false;
                                  setRootCauseErrApprovals(newRootCauseErrors);
                                }
                              }}
                            >
                              {rootCauseOptions.map((r: LabelValue) => (
                                <MenuItem value={r.value} key={r.value}>
                                  {r.label}
                                </MenuItem>
                              ))}
                            </Select>
                            {rootCauseErrApprovals[index] && (
                              <FormHelperText>
                                This is a required field.
                              </FormHelperText>
                            )}
                          </FormControl>
                          <FormControl
                            variant="standard"
                            sx={{ mx: 0.75, minWidth: 230, mt: 1 }}
                            error={impactErrApprovals[index]}
                          >
                            <InputLabel id="demo-simple-select-standard-label">
                              Impact
                              <span className="text-defaultRed">&nbsp;*</span>
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-standard-label"
                              id="demo-simple-select-standard"
                              disabled={
                                (!hasPermissionWorklog(
                                  "ErrorLog",
                                  "Save",
                                  "WorkLogs"
                                ) &&
                                  hasPermissionWorklog(
                                    "ErrorLog",
                                    "Delete",
                                    "WorkLogs"
                                  )) ||
                                field.isSolved ||
                                activeTab === 2
                              }
                              value={field.Impact === 0 ? "" : field.Impact}
                              onChange={(e) =>
                                handleImpactChangeApprovals(
                                  Number(e.target.value),
                                  index
                                )
                              }
                              onBlur={() => {
                                if (field.Impact > 0) {
                                  const newImpactErrors = [
                                    ...impactErrApprovals,
                                  ];
                                  newImpactErrors[index] = false;
                                  setImpactErrApprovals(newImpactErrors);
                                }
                              }}
                            >
                              {impactOptions.map((i: LabelValue) => (
                                <MenuItem value={i.value} key={i.value}>
                                  {i.label}
                                </MenuItem>
                              ))}
                            </Select>
                            {impactErrApprovals[index] && (
                              <FormHelperText>
                                This is a required field.
                              </FormHelperText>
                            )}
                          </FormControl>
                          <FormControl
                            variant="standard"
                            sx={{ mx: 0.75, minWidth: 230, mt: 1 }}
                            error={errorLogPriorityErrApprovals[index]}
                          >
                            <InputLabel id="demo-simple-select-standard-label">
                              Criticality
                              <span className="text-defaultRed">&nbsp;*</span>
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-standard-label"
                              id="demo-simple-select-standard"
                              disabled={
                                (!hasPermissionWorklog(
                                  "ErrorLog",
                                  "Save",
                                  "WorkLogs"
                                ) &&
                                  hasPermissionWorklog(
                                    "ErrorLog",
                                    "Delete",
                                    "WorkLogs"
                                  )) ||
                                field.isSolved ||
                                activeTab === 2
                              }
                              value={field.Priority === 0 ? "" : field.Priority}
                              onChange={(e) =>
                                handlePriorityChangeApprovals(
                                  Number(e.target.value),
                                  index
                                )
                              }
                              onBlur={() => {
                                if (field.Priority > 0) {
                                  const newPriorityErrors = [
                                    ...errorLogPriorityErrApprovals,
                                  ];
                                  newPriorityErrors[index] = false;
                                  setErrorLogPriorityErrApprovals(
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
                            {errorLogPriorityErrApprovals[index] && (
                              <FormHelperText>
                                This is a required field.
                              </FormHelperText>
                            )}
                          </FormControl>
                          <TextField
                            label={<span>Vendor Name</span>}
                            fullWidth
                            disabled={
                              (!hasPermissionWorklog(
                                "ErrorLog",
                                "Save",
                                "WorkLogs"
                              ) &&
                                hasPermissionWorklog(
                                  "ErrorLog",
                                  "Delete",
                                  "WorkLogs"
                                )) ||
                              field.isSolved ||
                              activeTab === 2
                            }
                            value={
                              field.VendorName.trim().length === 0
                                ? ""
                                : field.VendorName
                            }
                            onChange={(e) =>
                              handleVendorNameChangeApprovals(
                                e.target.value,
                                index
                              )
                            }
                            onBlur={(e) => {
                              if (e.target.value.length > 250) {
                                const newVendorNameErrors = [
                                  ...vendorNameErrApprovals,
                                ];
                                newVendorNameErrors[index] = true;
                                setVendorNameErrApprovals(newVendorNameErrors);
                              } else {
                                const newVendorNameErrors = [
                                  ...vendorNameErrApprovals,
                                ];
                                newVendorNameErrors[index] = false;
                                setVendorNameErrApprovals(newVendorNameErrors);
                              }
                            }}
                            error={vendorNameErrApprovals[index]}
                            helperText={
                              vendorNameErrApprovals[index] &&
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
                            disabled={
                              (!hasPermissionWorklog(
                                "ErrorLog",
                                "Save",
                                "WorkLogs"
                              ) &&
                                hasPermissionWorklog(
                                  "ErrorLog",
                                  "Delete",
                                  "WorkLogs"
                                )) ||
                              field.isSolved ||
                              activeTab === 2
                            }
                            value={
                              field.DocumentNumber.trim().length === 0
                                ? ""
                                : field.DocumentNumber
                            }
                            onChange={(e) =>
                              handleDocumentNumberChangeApprovals(
                                e.target.value,
                                index
                              )
                            }
                            onBlur={(e) => {
                              if (e.target.value.length > 50) {
                                const newDocumentNumberErrors = [
                                  ...documentNumberErrApprovals,
                                ];
                                newDocumentNumberErrors[index] = true;
                                setDocumentNumberErrApprovals(
                                  newDocumentNumberErrors
                                );
                              } else {
                                const newDocumentNumberErrors = [
                                  ...documentNumberErrApprovals,
                                ];
                                newDocumentNumberErrors[index] = false;
                                setDocumentNumberErrApprovals(
                                  newDocumentNumberErrors
                                );
                              }
                            }}
                            error={documentNumberErrApprovals[index]}
                            helperText={
                              documentNumberErrApprovals[index] &&
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
                            disabled={
                              (!hasPermissionWorklog(
                                "ErrorLog",
                                "Save",
                                "WorkLogs"
                              ) &&
                                hasPermissionWorklog(
                                  "ErrorLog",
                                  "Delete",
                                  "WorkLogs"
                                )) ||
                              field.isSolved ||
                              activeTab === 2
                            }
                            value={field.Amount === 0 ? "" : field.Amount}
                            onChange={(e) =>
                              e.target.value.length <= 7 &&
                              handleAmountChangeApprovals(e.target.value, index)
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
                            disabled={
                              (!hasPermissionWorklog(
                                "ErrorLog",
                                "Save",
                                "WorkLogs"
                              ) &&
                                hasPermissionWorklog(
                                  "ErrorLog",
                                  "Delete",
                                  "WorkLogs"
                                )) ||
                              field.isSolved ||
                              activeTab === 2
                            }
                            value={
                              field.ErrorCount === 0 ? "" : field.ErrorCount
                            }
                            onChange={(e) =>
                              handleErrorCountChangeApprovals(
                                e.target.value,
                                index
                              )
                            }
                            onBlur={(e) => {
                              if (e.target.value.length > 0) {
                                const newErrorCountErrors = [
                                  ...errorCountErrApprovals,
                                ];
                                newErrorCountErrors[index] = false;
                                setErrorCountErrApprovals(newErrorCountErrors);
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
                            error={errorCountErrApprovals[index]}
                            helperText={
                              errorCountErrApprovals[index] &&
                              field.ErrorCount <= 0
                                ? "Add valid number."
                                : errorCountErrApprovals[index] &&
                                  field.ErrorCount.toString().length > 4
                                ? "Maximum 4 numbers allowed."
                                : errorCountErrApprovals[index]
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
                                <span className="text-defaultRed">&nbsp;*</span>
                              </span>
                            }
                            fullWidth
                            disabled={
                              (!hasPermissionWorklog(
                                "ErrorLog",
                                "Save",
                                "WorkLogs"
                              ) &&
                                hasPermissionWorklog(
                                  "ErrorLog",
                                  "Delete",
                                  "WorkLogs"
                                )) ||
                              field.isSolved ||
                              activeTab === 2
                            }
                            value={
                              field.RootCauseAnalysis.trim().length === 0
                                ? ""
                                : field.RootCauseAnalysis
                            }
                            onChange={(e) =>
                              handleRcaChangeApprovals(e.target.value, index)
                            }
                            onBlur={(e) => {
                              if (
                                e.target.value.length <= 0 ||
                                e.target.value.length > 250
                              ) {
                                const newRcaErrors = [...rcaErrApprovals];
                                newRcaErrors[index] = true;
                                setRcaErrApprovals(newRcaErrors);
                              } else {
                                const newRcaErrors = [...rcaErrApprovals];
                                newRcaErrors[index] = false;
                                setRcaErrApprovals(newRcaErrors);
                              }
                            }}
                            error={rcaErrApprovals[index]}
                            helperText={
                              rcaErrApprovals[index] &&
                              field.RootCauseAnalysis.trim().length > 250
                                ? "Maximum 250 characters allowed."
                                : rcaErrApprovals[index]
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
                            disabled={
                              (!hasPermissionWorklog(
                                "ErrorLog",
                                "Save",
                                "WorkLogs"
                              ) &&
                                hasPermissionWorklog(
                                  "ErrorLog",
                                  "Delete",
                                  "WorkLogs"
                                )) ||
                              field.isSolved ||
                              activeTab === 2
                            }
                            value={
                              field.MitigationPlan.trim().length === 0
                                ? ""
                                : field.MitigationPlan
                            }
                            onChange={(e) =>
                              handleMitigationChangeApprovals(
                                e.target.value,
                                index
                              )
                            }
                            onBlur={(e) => {
                              if (e.target.value.length > 250) {
                                const newMitigationErrors = [
                                  ...mitigationErrApprovals,
                                ];
                                newMitigationErrors[index] = true;
                                setMitigationErrApprovals(newMitigationErrors);
                              } else {
                                const newMitigationErrors = [
                                  ...mitigationErrApprovals,
                                ];
                                newMitigationErrors[index] = false;
                                setMitigationErrApprovals(newMitigationErrors);
                              }
                            }}
                            error={mitigationErrApprovals[index]}
                            helperText={
                              mitigationErrApprovals[index] &&
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
                            disabled={
                              (!hasPermissionWorklog(
                                "ErrorLog",
                                "Save",
                                "WorkLogs"
                              ) &&
                                hasPermissionWorklog(
                                  "ErrorLog",
                                  "Delete",
                                  "WorkLogs"
                                )) ||
                              field.isSolved ||
                              activeTab === 2
                            }
                            value={
                              field.ContigencyPlan.trim().length === 0
                                ? ""
                                : field.ContigencyPlan
                            }
                            onChange={(e) =>
                              handleContigencyPlanChangeApprovals(
                                e.target.value,
                                index
                              )
                            }
                            onBlur={(e) => {
                              if (e.target.value.length > 250) {
                                const newContigencyPlanErrors = [
                                  ...contigencyPlanErrApprovals,
                                ];
                                newContigencyPlanErrors[index] = true;
                                setContigencyPlanErrApprovals(
                                  newContigencyPlanErrors
                                );
                              } else {
                                const newContigencyPlanErrors = [
                                  ...contigencyPlanErrApprovals,
                                ];
                                newContigencyPlanErrors[index] = false;
                                setContigencyPlanErrApprovals(
                                  newContigencyPlanErrors
                                );
                              }
                            }}
                            error={contigencyPlanErrApprovals[index]}
                            helperText={
                              contigencyPlanErrApprovals[index] &&
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
                              error={resolutionStatusErrApprovals[index]}
                            >
                              <InputLabel id="demo-simple-select-standard-label">
                                Resolution status
                                <span className="text-defaultRed">&nbsp;*</span>
                              </InputLabel>
                              <Select
                                labelId="demo-simple-select-standard-label"
                                id="demo-simple-select-standard"
                                disabled={
                                  (!hasPermissionWorklog(
                                    "ErrorLog",
                                    "Save",
                                    "WorkLogs"
                                  ) &&
                                    hasPermissionWorklog(
                                      "ErrorLog",
                                      "Delete",
                                      "WorkLogs"
                                    )) ||
                                  field.isSolved ||
                                  activeTab === 2
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
                                      ...resolutionStatusErrApprovals,
                                    ];
                                    newResolutionStatusErrors[index] = false;
                                    setResolutionStatusErrApprovals(
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
                              {resolutionStatusErrApprovals[index] && (
                                <FormHelperText>
                                  This is a required field.
                                </FormHelperText>
                              )}
                            </FormControl>
                          )}
                          <div className="flex items-center justify-start mt-2">
                            {field.ErrorType === 2 && (
                              <FormControl
                                variant="standard"
                                sx={{ mx: 0.75, minWidth: 230, mt: -0.5 }}
                                error={resolutionStatusErrApprovals[index]}
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
                                    (!hasPermissionWorklog(
                                      "ErrorLog",
                                      "Save",
                                      "WorkLogs"
                                    ) &&
                                      hasPermissionWorklog(
                                        "ErrorLog",
                                        "Delete",
                                        "WorkLogs"
                                      )) ||
                                    field.isSolved ||
                                    activeTab === 2
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
                                        ...resolutionStatusErrApprovals,
                                      ];
                                      newResolutionStatusErrors[index] = false;
                                      setResolutionStatusErrApprovals(
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
                                {resolutionStatusErrApprovals[index] && (
                                  <FormHelperText>
                                    This is a required field.
                                  </FormHelperText>
                                )}
                              </FormControl>
                            )}
                            <TextField
                              label={<span>Additional Remark (If any)</span>}
                              fullWidth
                              disabled={
                                (!hasPermissionWorklog(
                                  "ErrorLog",
                                  "Save",
                                  "WorkLogs"
                                ) &&
                                  hasPermissionWorklog(
                                    "ErrorLog",
                                    "Delete",
                                    "WorkLogs"
                                  )) ||
                                field.isSolved ||
                                activeTab === 2
                              }
                              value={
                                field.Remark.trim().length === 0
                                  ? ""
                                  : field.Remark
                              }
                              onChange={(e) =>
                                handleRemarksChangeApprovals(
                                  e.target.value,
                                  index
                                )
                              }
                              margin="normal"
                              variant="standard"
                              sx={{ mx: 0.75, maxWidth: 230, mt: 1 }}
                            />
                            <FormControl
                              variant="standard"
                              sx={{ mx: 0.75, minWidth: 230, mt: -0.5 }}
                              disabled={
                                (!hasPermissionWorklog(
                                  "ErrorLog",
                                  "Save",
                                  "WorkLogs"
                                ) &&
                                  hasPermissionWorklog(
                                    "ErrorLog",
                                    "Delete",
                                    "WorkLogs"
                                  )) ||
                                field.isSolved ||
                                activeTab === 2
                              }
                            >
                              <InputLabel id="demo-simple-select-standard-label">
                                Sub-Task ID
                              </InputLabel>
                              <Select
                                labelId="demo-simple-select-standard-label"
                                id="demo-simple-select-standard"
                                disabled={
                                  (!hasPermissionWorklog(
                                    "ErrorLog",
                                    "Save",
                                    "WorkLogs"
                                  ) &&
                                    hasPermissionWorklog(
                                      "ErrorLog",
                                      "Delete",
                                      "WorkLogs"
                                    )) ||
                                  field.isSolved ||
                                  activeTab === 2
                                }
                                value={
                                  field.SubTaskId === 0 ? "" : field.SubTaskId
                                }
                                onChange={(e) =>
                                  handleSubTaskIDChange(
                                    Number(e.target.value),
                                    index
                                  )
                                }
                              >
                                {subTaskOptions.map((r: LabelValue) => (
                                  <MenuItem value={r.value} key={r.value}>
                                    {r.value}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Autocomplete
                              multiple
                              limitTags={2}
                              id="checkboxes-tags-demo"
                              options={
                                Array.isArray(cCDropdownDataApprovals)
                                  ? cCDropdownDataApprovals
                                  : []
                              }
                              disabled={
                                (!hasPermissionWorklog(
                                  "ErrorLog",
                                  "Save",
                                  "WorkLogs"
                                ) &&
                                  hasPermissionWorklog(
                                    "ErrorLog",
                                    "Delete",
                                    "WorkLogs"
                                  )) ||
                                field.isSolved ||
                                activeTab === 2
                              }
                              value={field.CC}
                              onChange={(e, newValue) =>
                                handleCCChangeApprovals(newValue, index)
                              }
                              style={{ width: 500 }}
                              renderInput={(params) => (
                                <TextField
                                  label="cc"
                                  {...params}
                                  variant="standard"
                                />
                              )}
                              sx={{ mx: 0.75, maxWidth: 230 }}
                            />
                            <div className="flex flex-col ml-4">
                              <div className="flex flex-col items-start justify-start">
                                <div className="flex mt-2">
                                  <ImageUploader
                                    getData={(data1: string, data2: string) =>
                                      field.Attachments
                                        ? handleAttachmentsChangeApprovals(
                                            data1,
                                            data2,
                                            field.Attachments,
                                            index
                                          )
                                        : undefined
                                    }
                                    isDisable={
                                      field.isSolved || activeTab === 2
                                    }
                                    fileHasError={(error: boolean) => {
                                      const newErrors = [...imageErrApprovals];
                                      newErrors[index] = error;
                                      setImageErrApprovals(newErrors);
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
                                {imageErrApprovals[index] && (
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
                            {index === 0 && activeTab === 1 && (
                              <span
                                className="cursor-pointer"
                                onClick={
                                  hasPermissionWorklog(
                                    "ErrorLog",
                                    "Save",
                                    "WorkLogs"
                                  )
                                    ? addErrorLogFieldApprovals
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
                            {index > 0 &&
                              !field.isSolved &&
                              activeTab === 1 && (
                                <span
                                  className="cursor-pointer"
                                  onClick={
                                    hasPermissionWorklog(
                                      "ErrorLog",
                                      "Delete",
                                      "WorkLogs"
                                    ) ||
                                    hasPermissionWorklog(
                                      "ErrorLog",
                                      "Save",
                                      "WorkLogs"
                                    )
                                      ? () =>
                                          removeErrorLogFieldApprovals(index)
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

            <div className="my-14" id="tabpanel-9">
              <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                <span className="flex items-center">
                  <HistoryIcon />
                  <span className="ml-[21px]">Reviewer&apos;s Note</span>
                </span>
                <span
                  className={`cursor-pointer ${
                    reasonDrawerApprovals ? "rotate-180" : ""
                  }`}
                  onClick={() =>
                    setReasonDrawerApprovals(!reasonDrawerApprovals)
                  }
                >
                  <ChevronDownIcon />
                </span>
              </div>
              {reasonDrawerApprovals &&
                reviewerNoteDataApprovals.length > 0 &&
                reviewerNoteDataApprovals.map(
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

            {/* Logs */}
            {onEdit > 0 && (
              <div className="mt-14" id="tabpanel-10">
                <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                  <span className="flex items-center">
                    <HistoryIcon />
                    <span className="ml-[21px]">Logs</span>
                  </span>
                  <span
                    className={`cursor-pointer ${
                      logsApprovalsDrawer ? "rotate-180" : ""
                    }`}
                    onClick={() => setLogsApprovalsDrawer(!logsApprovalsDrawer)}
                  >
                    <ChevronDownIcon />
                  </span>
                </div>
                {logsApprovalsDrawer &&
                  logsDataApprovals.length > 0 &&
                  logsDataApprovals.map(
                    (i: AuditlogGetByWorkitem, index: number) => (
                      <div
                        className="mt-5 pl-[70px] text-sm"
                        key={i.UpdatedBy + Math.random()}
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
                {(activeTab === 1 ||
                  (activeTab === 2 &&
                    Number(localStorage.getItem("workTypeId")) == 3 &&
                    localStorage.getItem("UserId") == editData.ReviewerId)) && (
                  <Button
                    type="submit"
                    variant="contained"
                    className="rounded-[4px] !h-[36px] !mx-6 !bg-secondary"
                  >
                    <span className="flex items-center justify-center gap-[10px] px-[5px]">
                      {onEdit > 0 ? "Save Task" : "Create Task"}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </form>
          <ImportDialogSubTask
            onOpen={isImportOpen}
            onClose={() => setIsImportOpen(false)}
            taskId={onEdit}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            fileInputKey={fileInputKey}
            setFileInputKey={setFileInputKey}
            isUploading={isUploading}
            handleApplyImportExcel={handleApplyImportExcel}
          />
        </div>
      </div>
      {isLoadingApprovals ? <OverLay /> : ""}
    </>
  );
};

export default EditDrawer;
