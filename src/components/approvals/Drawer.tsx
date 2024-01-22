/* eslint-disable react/jsx-key */
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
  getTimeDifference,
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
  getManagerDropdownData,
  getProcessDropdownData,
  getProjectDropdownData,
  getReviewerDropdownData,
  getStatusDropdownData,
  getSubProcessDropdownData,
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

const EditDrawer = ({
  onOpen,
  onClose,
  onEdit,
  onDataFetch,
  onHasId,
  hasIconIndex,
  onComment,
  onErrorLog,
  onManualTime,
}: any) => {
  const router = useRouter();
  const yearDropdown = getYears();
  const [userId, setUserId] = useState(0);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false);
  const [inputTypeReview, setInputTypeReview] = useState("text");
  const [inputTypePreperation, setInputTypePreperation] = useState("text");
  const [editData, setEditData] = useState<any>([]);
  const [isCreatedByClient, setIsCreatedByClient] = useState(false);
  const [isManual, setIsManual] = useState(null);
  const [selectedDays, setSelectedDays] = useState<any>([]);
  const [inputDateErrors, setInputDateErrors] = useState([false]);
  const [startTimeErrors, setStartTimeErrors] = useState([false]);
  const [endTimeErrors, setEndTimeErrors] = useState([false]);
  const [inputTypeDate, setInputTypeDate] = useState(["text"]);
  const [inputTypeStartTime, setInputTypeStartTime] = useState(["text"]);
  const [inputTypeEndTime, setInputTypeEndTime] = useState(["text"]);

  const toggleColor = (index: any) => {
    if (selectedDays.includes(index)) {
      setSelectedDays(
        selectedDays.filter((dayIndex: any) => dayIndex !== index)
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

  const handleMultiSelect = (e: React.SyntheticEvent, value: any) => {
    if (value !== undefined) {
      setReminderNotificationApprovals(value);
    } else {
      setReminderNotificationApprovals([]);
    }
  };

  const handleMultiSelectMonth = (e: React.SyntheticEvent, value: any) => {
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
  const [typeOfWorkApprovals, setTypeOfWorkApprovals] = useState<
    string | number
  >(0);
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
  const [statusApprovals, setStatusApprovals] = useState<any>(0);
  const [statusApprovalsErr, setStatusApprovalsErr] = useState(false);
  const [assigneeApprovalsDropdownData, setAssigneeApprovalsDropdownData] =
    useState<any>([]);
  const [assigneeApprovals, setAssigneeApprovals] = useState<any>([]);
  const [assigneeApprovalsErr, setAssigneeApprovalsErr] = useState(false);
  const [reviewerApprovalsDropdownData, setReviewerApprovalsDropdownData] =
    useState([]);
  const [reviewerApprovals, setReviewerApprovals] = useState<any>([]);
  const [reviewerApprovalsErr, setReviewerApprovalsErr] = useState(false);
  const [managerApprovalsDropdownData, setManagerApprovalsDropdownData] =
    useState<any>([]);
  const [managerApprovals, setManagerApprovals] = useState<any>(0);
  const [managerApprovalsErr, setManagerApprovalsErr] = useState(false);
  const [clientTaskNameApprovals, setClientTaskNameApprovals] =
    useState<string>("");
  const [clientTaskNameApprovalsErr, setClientTaskNameApprovalsErr] =
    useState(false);
  const [descriptionApprovals, setDescriptionApprovals] = useState<string>("");
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
  const [returnYearApprovals, setReturnYearApprovals] = useState<
    string | number
  >(0);
  const [returnYearApprovalsErr, setReturnYearApprovalsErr] = useState(false);
  const [noOfPagesApprovals, setNoOfPagesApprovals] = useState<any>(0);
  const [checklistWorkpaperApprovals, setChecklistWorkpaperApprovals] =
    useState<any>(0);
  const [checklistWorkpaperApprovalsErr, setChecklistWorkpaperApprovalsErr] =
    useState(false);

  // Sub-Task
  const [subTaskApprovalsDrawer, setSubTaskApprovalsDrawer] = useState(true);
  const [subTaskSwitchApprovals, setSubTaskSwitchApprovals] = useState(false);
  const [subTaskFieldsApprovals, setSubTaskFieldsApprovals] = useState([
    {
      SubtaskId: 0,
      Title: "",
      Description: "",
    },
  ]);
  const [taskNameApprovalsErr, setTaskNameApprovalsErr] = useState([false]);
  const [subTaskDescriptionApprovalsErr, setSubTaskDescriptionApprovalsErr] =
    useState([false]);
  const [deletedSubTaskApprovals, setDeletedSubTaskApprovals] = useState<any>(
    []
  );

  const addTaskFieldApprovals = () => {
    setSubTaskFieldsApprovals([
      ...subTaskFieldsApprovals,
      {
        SubtaskId: 0,
        Title: "",
        Description: "",
      },
    ]);
    setTaskNameApprovalsErr([...taskNameApprovalsErr, false]);
    setSubTaskDescriptionApprovalsErr([
      ...subTaskDescriptionApprovalsErr,
      false,
    ]);
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

    const newSubTaskDescriptionErrors = [...subTaskDescriptionApprovalsErr];
    newSubTaskDescriptionErrors.splice(index, 1);
    setSubTaskDescriptionApprovalsErr(newSubTaskDescriptionErrors);
  };

  const handleSubTaskChangeApprovals = (e: any, index: number) => {
    const newTaskFields = [...subTaskFieldsApprovals];
    newTaskFields[index].Title = e.target.value;
    setSubTaskFieldsApprovals(newTaskFields);

    const newTaskErrors = [...taskNameApprovalsErr];
    newTaskErrors[index] = e.target.value.trim().length === 0;
    setTaskNameApprovalsErr(newTaskErrors);
  };

  const handleSubTaskDescriptionChangeApprovals = (e: any, index: number) => {
    const newTaskFields = [...subTaskFieldsApprovals];
    newTaskFields[index].Description = e.target.value;
    setSubTaskFieldsApprovals(newTaskFields);

    const newSubTaskDescErrors = [...subTaskDescriptionApprovalsErr];
    newSubTaskDescErrors[index] = e.target.value.trim().length === 0;
    setSubTaskDescriptionApprovalsErr(newSubTaskDescErrors);
  };

  const getSubTaskDataApprovals = async () => {
    const params = {
      WorkitemId: onEdit,
    };
    const url = `${process.env.worklog_api_url}/workitem/subtask/getbyworkitem`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (
        ResponseStatus === "Success" &&
        ResponseData.length > 0 &&
        error === false
      ) {
        setSubTaskSwitchApprovals(
          hasPermissionWorklog("Task/SubTask", "save", "WorkLogs")
        );
        setSubTaskFieldsApprovals(ResponseData);
      } else {
        setSubTaskSwitchApprovals(false);
        setSubTaskFieldsApprovals([
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

  const handleSubmitSubTaskApprovals = async () => {
    let hasSubErrors = false;
    const newTaskErrors = subTaskFieldsApprovals.map(
      (field) =>
        (subTaskSwitchApprovals && field.Title.trim().length < 5) ||
        (subTaskSwitchApprovals && field.Title.trim().length > 500)
    );
    subTaskSwitchApprovals && setTaskNameApprovalsErr(newTaskErrors);
    const newSubTaskDescErrors = subTaskFieldsApprovals.map(
      (field) =>
        (subTaskSwitchApprovals && field.Description.trim().length < 5) ||
        (subTaskSwitchApprovals && field.Description.trim().length > 500)
    );
    subTaskSwitchApprovals &&
      setSubTaskDescriptionApprovalsErr(newSubTaskDescErrors);
    hasSubErrors =
      newTaskErrors.some((error) => error) ||
      newSubTaskDescErrors.some((error) => error);

    if (hasPermissionWorklog("Task/SubTask", "save", "WorkLogs")) {
      if (!hasSubErrors) {
        setIsLoadingApprovals(true);
        const params = {
          workitemId: onEdit,
          subtasks: subTaskSwitchApprovals
            ? subTaskFieldsApprovals.map(
                (i: any) =>
                  new Object({
                    SubtaskId: i.SubtaskId,
                    Title: i.Title.trim(),
                    Description: i.Description.trim(),
                  })
              )
            : null,
          deletedWorkitemSubtaskIds: deletedSubTaskApprovals,
        };
        const url = `${process.env.worklog_api_url}/workitem/subtask/savebyworkitem`;
        const successCallback = (
          ResponseData: any,
          error: any,
          ResponseStatus: any
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Sub Task Updated successfully.`);
            setDeletedSubTaskApprovals([]);
            setSubTaskFieldsApprovals([
              {
                SubtaskId: 0,
                Title: "",
                Description: "",
              },
            ]);
            setIsLoadingApprovals(false);
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
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (
        ResponseStatus === "Success" &&
        ResponseData !== null &&
        error === false
      ) {
        setRecurringStartDateApprovals(
          ResponseData.length <= 0 ? "" : ResponseData.StartDate
        );
        setRecurringEndDateApprovals(
          ResponseData.length <= 0 ? "" : ResponseData.EndDate
        );
        setRecurringTimeApprovals(
          ResponseData.length <= 0 ? 0 : ResponseData.Type
        );
        ResponseData.Type === 2
          ? setSelectedDays(ResponseData.Triggers)
          : ResponseData.Type === 3
          ? setRecurringMonthApprovals(
              ResponseData.Triggers.map((trigger: any) =>
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
  const [manualFieldsApprovals, setManualFieldsApprovals] = useState([
    {
      AssigneeId: 0,
      Id: 0,
      inputDate: "",
      startTime: "",
      endTime: "",
      totalTime: "",
      manualDesc: "",
    },
  ]);

  const getManualDataApprovals = async () => {
    const params = {
      WorkitemId: onEdit,
    };
    const url = `${process.env.worklog_api_url}/workitem/timelog/getManuallogByWorkitem`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (
        ResponseStatus === "Success" &&
        ResponseData.length > 0 &&
        error === false
      ) {
        setManualFieldsApprovals(
          ResponseData.map(
            (i: any) =>
              new Object({
                AssigneeId: i.AssigneeId,
                Id: i.Id,
                inputDate: i.Date,
                startTime: i.StartTime,
                endTime: i.EndTime,
                totalTime: getTimeDifference(i.StartTime, i.EndTime),
                manualDesc: i.Comment,
              })
          )
        );
      } else {
        setManualFieldsApprovals([
          {
            AssigneeId: 0,
            Id: 0,
            inputDate: "",
            startTime: "",
            endTime: "",
            totalTime: "",
            manualDesc: "",
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
      ResponseData: any,
      error: any,
      ResponseStatus: any
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
        setReminderDateApprovals(ResponseData.ReminderDate);
        setReminderTimeApprovals(ResponseData.ReminderTime);
        setReminderNotificationApprovals(
          ResponseData.ReminderUserIds.map((reminderUserId: any) =>
            assigneeApprovalsDropdownData.find(
              (assignee: { value: any }) => assignee.value === reminderUserId
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
            (i: any) => i.value
          ),
        };
        const url = `${process.env.worklog_api_url}/workitem/reminder/savebyworkitem`;
        const successCallback = (
          ResponseData: any,
          error: any,
          ResponseStatus: any
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

  const toggleGeneralOpen = (index: any) => {
    setItemStatesApprovals((prevStates: any) => ({
      ...prevStates,
      [index]: !prevStates[index],
    }));
  };

  const toggleAddChecklistField = (index: any) => {
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
          ResponseData: any,
          error: any,
          ResponseStatus: any
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
      error: any,
      ResponseStatus: any
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
        ResponseData: any,
        error: any,
        ResponseStatus: any
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
  const [commentSelectApprovals, setCommentSelectApprovals] = useState<
    number | string
  >(1);
  const [commentDataApprovals, setCommentDataApprovals] = useState([]);
  const [value, setValue] = useState("");
  const [valueError, setValueError] = useState(false);
  const [valueEdit, setValueEdit] = useState("");
  const [valueEditError, setValueEditError] = useState(false);
  const [mention, setMention] = useState<any>([]);
  const [editingCommentIndexApprovals, setEditingCommentIndexApprovals] =
    useState(-1);
  const [commentAttachmentApprovals, setCommentAttachmentApprovals] = useState([
    {
      AttachmentId: 0,
      UserFileName: "",
      SystemFileName: "",
      AttachmentPath: process.env.attachment,
    },
  ]);
  const [commentUserDataApprovals, setCommentUserDataApprovals] = useState([]);

  const users: any =
    commentUserDataApprovals?.length > 0 &&
    commentUserDataApprovals.map(
      (i: any) =>
        new Object({
          id: i.value,
          display: i.label,
        })
    );

  const handleEditClick = (index: any, message: any) => {
    setEditingCommentIndexApprovals(index);
    setValueEdit(message);
  };

  const handleSaveClickApprovals = async (e: any, i: any, type: any) => {
    e.preventDefault();
    setValueEditError(valueEdit.trim().length < 51);

    if (hasPermissionWorklog("Comment", "Save", "WorkLogs")) {
      if (valueEdit.trim().length > 51 && !valueEditError) {
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
          ResponseData: any,
          error: any,
          ResponseStatus: any
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Comment updated successfully.`);
            setMention([]);
            setCommentAttachmentApprovals([
              {
                AttachmentId: 0,
                UserFileName: "",
                SystemFileName: "",
                AttachmentPath: process.env.attachment,
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

  const handleCommentChange = (e: any) => {
    setMention(
      e
        .split("(")
        .map((i: any, index: number) => {
          if (i.includes(")")) {
            return parseInt(i.split(")")[0]);
          }
        })
        .filter((i: any) => i !== undefined)
    );
    setValueError(false);
  };

  const handleCommentAttachmentsChange = (
    data1: any,
    data2: any,
    commentAttachment: any
  ) => {
    const Attachment = [
      {
        AttachmentId: commentAttachment[0].AttachmentId,
        UserFileName: data1,
        SystemFileName: data2,
        AttachmentPath: process.env.attachment,
      },
    ];
    setCommentAttachmentApprovals(Attachment);
  };

  const getCommentDataApprovals = async (type: any) => {
    const params = {
      WorkitemId: onEdit,
      type: type,
    };
    const url = `${process.env.worklog_api_url}/workitem/comment/getByWorkitem`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
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
    type: any
  ) => {
    e.preventDefault();
    setValueError(value.trim().length < 5);

    if (hasPermissionWorklog("Comment", "Save", "WorkLogs")) {
      if (value.trim().length >= 5 && !valueError) {
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
          ResponseData: any,
          error: any,
          ResponseStatus: any
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Comment sent successfully.`);
            setMention([]);
            setCommentAttachmentApprovals([
              {
                AttachmentId: 0,
                UserFileName: "",
                SystemFileName: "",
                AttachmentPath: process.env.attachment,
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
  const [errorLogApprovalsDrawer, setErorLogApprovalsrDrawer] = useState(true);
  const [cCDropdownDataApprovals, setCCDropdownDataApprovals] = useState<any>(
    []
  );
  const [errorLogFieldsApprovals, setErrorLogFieldsApprovals] = useState([
    {
      SubmitedBy: "",
      SubmitedOn: "",
      ErrorLogId: 0,
      ErrorType: 0,
      RootCause: 0,
      Priority: 0,
      ErrorCount: 0,
      NatureOfError: 0,
      CC: [],
      Remark: "",
      Attachments: [
        {
          AttachmentId: 0,
          UserFileName: "",
          SystemFileName: "",
          AttachmentPath: process.env.attachment,
        },
      ],
      isSolved: false,
    },
  ]);
  const [errorTypeErrApprovals, setErrorTypeErrApprovals] = useState([false]);
  const [rootCauseErrApprovals, setRootCauseErrApprovals] = useState([false]);
  const [errorLogPriorityErrApprovals, setErrorLogPriorityErrApprovals] =
    useState([false]);
  const [errorCountErrApprovals, setErrorCountErrApprovals] = useState([false]);
  const [natureOfErrApprovals, setNatureOfErrApprovals] = useState([false]);
  const [remarkErrApprovals, setRemarkErrApprovals] = useState([false]);
  const [deletedErrorLogApprovals, setDeletedErrorLogApprovals] = useState<any>(
    []
  );

  const addErrorLogFieldApprovals = () => {
    setErrorLogFieldsApprovals([
      ...errorLogFieldsApprovals,
      {
        SubmitedBy: "",
        SubmitedOn: "",
        ErrorLogId: 0,
        ErrorType: 0,
        RootCause: 0,
        Priority: 0,
        ErrorCount: 0,
        NatureOfError: 0,
        CC: [],
        Remark: "",
        Attachments: [
          {
            AttachmentId: 0,
            UserFileName: "",
            SystemFileName: "",
            AttachmentPath: process.env.attachment,
          },
        ],
        isSolved: false,
      },
    ]);
    setErrorTypeErrApprovals([...errorTypeErrApprovals, false]);
    setRootCauseErrApprovals([...rootCauseErrApprovals, false]);
    setErrorLogPriorityErrApprovals([...errorLogPriorityErrApprovals, false]);
    setErrorCountErrApprovals([...errorCountErrApprovals, false]);
    setNatureOfErrApprovals([...natureOfErrApprovals, false]);
    setRemarkErrApprovals([...remarkErrApprovals, false]);
  };

  const removeErrorLogFieldApprovals = (index: number) => {
    setDeletedErrorLogApprovals([
      ...deletedErrorLogApprovals,
      errorLogFieldsApprovals[index].ErrorLogId,
    ]);

    const newErrorLogFields = [...errorLogFieldsApprovals];
    newErrorLogFields.splice(index, 1);
    setErrorLogFieldsApprovals(newErrorLogFields);

    const newErrorTypeErrors = [...errorTypeErrApprovals];
    newErrorTypeErrors.splice(index, 1);
    setErrorTypeErrApprovals(newErrorTypeErrors);

    const newRootCauseErrors = [...rootCauseErrApprovals];
    newRootCauseErrors.splice(index, 1);
    setRootCauseErrApprovals(newRootCauseErrors);

    const newPriorityErrors = [...errorLogPriorityErrApprovals];
    newPriorityErrors.splice(index, 1);
    setErrorLogPriorityErrApprovals(newPriorityErrors);

    const newErrorCountErrors = [...errorCountErrApprovals];
    newErrorCountErrors.splice(index, 1);
    setErrorCountErrApprovals(newErrorCountErrors);

    const newNatureOfErrErrors = [...natureOfErrApprovals];
    newNatureOfErrErrors.splice(index, 1);
    setNatureOfErrApprovals(newNatureOfErrErrors);

    const newRemarkErrors = [...remarkErrApprovals];
    newRemarkErrors.splice(index, 1);
    setRemarkErrApprovals(newRemarkErrors);
  };

  const handleErrorTypeChangeApprovals = (e: any, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].ErrorType = e.target.value;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...errorTypeErrApprovals];
    newErrors[index] = e.target.value === 0;
    setErrorTypeErrApprovals(newErrors);
  };

  const handleRootCauseChangeApprovals = (e: any, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].RootCause = e.target.value;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...rootCauseErrApprovals];
    newErrors[index] = e.target.value === 0;
    setRootCauseErrApprovals(newErrors);
  };

  const handleNatureOfErrorChangeApprovals = (e: any, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].NatureOfError = e.target.value;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...natureOfErrApprovals];
    newErrors[index] = e.target.value === 0;
    setNatureOfErrApprovals(newErrors);
  };

  const handlePriorityChangeApprovals = (e: any, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].Priority = e.target.value;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...errorLogPriorityErrApprovals];
    newErrors[index] = e.target.value === 0;
    setErrorLogPriorityErrApprovals(newErrors);
  };

  const handleErrorCountChangeApprovals = (e: any, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].ErrorCount = e.target.value;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...errorCountErrApprovals];
    newErrors[index] =
      e.target.value < 0 || e.target.value.toString().length > 4;
    setErrorCountErrApprovals(newErrors);
  };

  const handleCCChangeApprovals = (newValue: any, index: any) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].CC = newValue;
    setErrorLogFieldsApprovals(newFields);
  };

  const handleRemarksChangeApprovals = (e: any, index: number) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].Remark = e.target.value;
    setErrorLogFieldsApprovals(newFields);

    const newErrors = [...remarkErrApprovals];
    newErrors[index] = e.target.value.trim().length <= 0;
    setRemarkErrApprovals(newErrors);
  };

  const handleAttachmentsChangeApprovals = (
    data1: any,
    data2: any,
    Attachments: any,
    index: number
  ) => {
    const newFields = [...errorLogFieldsApprovals];
    newFields[index].Attachments = [
      {
        AttachmentId: Attachments[0].AttachmentId,
        UserFileName: data1,
        SystemFileName: data2,
        AttachmentPath: process.env.attachment,
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
      ResponseData: any,
      error: any,
      ResponseStatus: any
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
                Priority: 0,
                ErrorCount: 0,
                NatureOfError: 0,
                CC: [],
                Remark: "",
                Attachments: [
                  {
                    AttachmentId: 0,
                    UserFileName: "",
                    SystemFileName: "",
                    AttachmentPath: process.env.attachment,
                  },
                ],
                isSolved: false,
              },
            ])
          : setErrorLogFieldsApprovals(
              ResponseData.map(
                (i: any) =>
                  new Object({
                    SubmitedBy: i.SubmitedBy,
                    SubmitedOn: i.SubmitedOn,
                    ErrorLogId: i.ErrorLogId,
                    ErrorType: i.ErrorType,
                    RootCause: i.RootCause,
                    Priority: i.Priority,
                    ErrorCount: i.ErrorCount,
                    NatureOfError: i.NatureOfError,
                    CC: i.CC.map((i: any) =>
                      cCDropdownDataApprovals.find(
                        (j: { value: any }) => j.value === i
                      )
                    ).filter(Boolean),
                    Remark: i.Remark,
                    Attachments:
                      i.Attachment.length > 0 &&
                      i.Attachment[0].SystemFileName.length > 0
                        ? i.Attachment
                        : [
                            {
                              AttachmentId: 0,
                              UserFileName: "",
                              SystemFileName: "",
                              AttachmentPath: process.env.attachment,
                            },
                          ],
                    isSolved: i.IsSolved,
                  })
              )
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
    const newRemarkErrors = errorLogFieldsApprovals.map(
      (field) =>
        field.Remark.trim().length < 5 || field.Remark.trim().length > 500
    );
    setRemarkErrApprovals(newRemarkErrors);

    hasErrorLogErrors =
      newErrorTypeErrors.some((error) => error) ||
      newRootCauseErrors.some((error) => error) ||
      newNatureOfErrors.some((error) => error) ||
      newPriorityErrors.some((error) => error) ||
      newErrorCountErrors.some((error) => error) ||
      newRemarkErrors.some((error) => error);

    if (hasPermissionWorklog("ErrorLog", "Save", "WorkLogs")) {
      if (hasErrorLogErrors === false) {
        setIsLoadingApprovals(true);
        const params = {
          WorkItemId: onEdit,
          Errors: errorLogFieldsApprovals.map(
            (i: any) =>
              new Object({
                ErrorLogId: i.ErrorLogId,
                ErrorType: i.ErrorType,
                RootCause: i.RootCause,
                Priority: i.Priority,
                ErrorCount: i.ErrorCount,
                NatureOfError: i.NatureOfError,
                CC: i.CC.map((j: any) => j.value),
                Remark: i.Remark,
                Attachments:
                  i.Attachments[0].SystemFileName.length > 0
                    ? i.Attachments
                    : null,
              })
          ),
          IsClientWorklog: false,
          SubmissionId: onHasId,
          DeletedErrorlogIds: deletedErrorLogApprovals,
        };
        const url = `${process.env.worklog_api_url}/workitem/errorlog/saveByworkitem`;
        const successCallback = (
          ResponseData: any,
          error: any,
          ResponseStatus: any
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Error logged successfully.`);
            setDeletedErrorLogApprovals([]);
            getEditData();
            getErrorLogDataApprpvals();
            onDataFetch();
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
  const [logsWorklogsDrawer, setLogsWorklogsDrawer] = useState(true);
  const [logsDataWorklogs, setLogsDateWorklogs] = useState<any>([]);

  const logsDatatableTaskCols = [
    {
      name: "Filed",
      label: "Filed Name",
      options: {
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "OldValue",
      label: "Old Value",
      options: {
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "NewValue",
      label: "New Value",
      options: {
        customBodyRender: (value: any) => {
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
      ResponseData: any,
      error: any,
      ResponseStatus: any
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

  // Reviewer's Note
  const [reasonDrawerApprovals, setReasonDrawerApprovals] = useState(true);
  const [reviewerNoteDataApprovals, setReviewerNoteDataApprovals] = useState(
    []
  );

  const getReviewerNoteDataApprovals = async () => {
    const params = {
      WorkitemId: onEdit,
    };
    const url = `${process.env.worklog_api_url}/workitem/approval/getreviewernotelist`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
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
  const [reviewermanualFields, setReviewerManualFields] = useState([
    {
      AssigneeId: 0,
      Id: 0,
      inputDate: "",
      startTime: "",
      endTime: "",
      totalTime: "",
      manualDesc: "",
      IsApproved: false,
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
        (field) => manualSwitch && field.inputDate === ""
      );
      manualSwitch && setInputDateErrors(newInputDateErrors);
      const newStartTimeErrors = reviewermanualFields.map(
        (field) =>
          (manualSwitch && field.startTime.trim().length === 0) ||
          (manualSwitch && field.startTime.trim().length < 8)
      );
      manualSwitch && setStartTimeErrors(newStartTimeErrors);
      const newEndTimeErrors = reviewermanualFields.map(
        (field) =>
          (manualSwitch && field.endTime.trim().length === 0) ||
          (manualSwitch && field.endTime.trim().length < 8) ||
          (manualSwitch && field.endTime <= field.startTime) ||
          field.startTime
            .split(":")
            .reduce(
              (acc, timePart, index) =>
                acc + parseInt(timePart) * [3600, 60, 1][index],
              0
            ) +
            "07:59:59"
              .split(":")
              .reduce(
                (acc, timePart, index) =>
                  acc + parseInt(timePart) * [3600, 60, 1][index],
                0
              ) <
            field.endTime
              .split(":")
              .reduce(
                (acc, timePart, index) =>
                  acc + parseInt(timePart) * [3600, 60, 1][index],
                0
              )
      );
      manualSwitch && setEndTimeErrors(newEndTimeErrors);
      const newManualDescErrors = reviewermanualFields.map(
        (field) =>
          (manualSwitch && field.manualDesc.trim().length < 5) ||
          (manualSwitch && field.manualDesc.trim().length > 500)
      );
      manualSwitch && setManualDescErrors(newManualDescErrors);
      hasManualErrors =
        newInputDateErrors.some((error) => error) ||
        newStartTimeErrors.some((error) => error) ||
        newEndTimeErrors.some((error) => error) ||
        newManualDescErrors.some((error) => error);

      if (!hasManualErrors) {
        setIsLoadingApprovals(true);
        const params = {
          submissionId: onHasId,
          timelogs: reviewermanualFields.map(
            (i: any) =>
              new Object({
                id: i.Id,
                startTime:
                  dayjs(i.inputDate).format("YYYY/MM/DD") + " " + i.startTime,
                endTime:
                  dayjs(i.inputDate).format("YYYY/MM/DD") + " " + i.endTime,
                assigneeId:
                  i.AssigneeId === 0 ? assigneeApprovals : i.AssigneeId,
                comment: i.manualDesc,
              })
          ),
          deletedTimelogIds: deletedManualTime,
        };
        const url = `${process.env.worklog_api_url}/workitem/approval/savereviewermanualtimelog`;
        const successCallback = (
          ResponseData: any,
          error: any,
          ResponseStatus: any
        ) => {
          if (ResponseStatus.toLowerCase() === "success" && error === false) {
            toast.success(`Manual Time Updated successfully.`);
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

  const getManualTimeLogForReviewer = async (workItemId: any) => {
    const params = { workItemId: workItemId };
    const url = `${process.env.worklog_api_url}/workitem/approval/getmanuallogbyworkitem`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setManualSwitch(ResponseData.length <= 0 ? false : true);
        setManualSubmitDisable(
          ResponseData.map(
            (i: any) => i.IsApproved === false && i.assignee !== userId
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
                  startTime: "",
                  endTime: "",
                  totalTime: "",
                  manualDesc: "",
                  IsApproved: false,
                },
              ]
            : ResponseData.map(
                (i: any) =>
                  new Object({
                    AssigneeId: i.AssigneeId,
                    Id: i.TimeId,
                    inputDate: i.Date,
                    startTime: i.StartTime,
                    endTime: i.EndTime,
                    totalTime: getTimeDifference(i.StartTime, i.EndTime),
                    manualDesc: i.Comment,
                    IsApproved: i.IsApproved,
                  })
              )
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
    setReviewerManualFields(newManualFields);

    const newInputDateErrors = [...inputDateErrors];
    newInputDateErrors.splice(index, 1);
    setInputDateErrors(newInputDateErrors);

    const newStartTimeErrors = [...startTimeErrors];
    newStartTimeErrors.splice(index, 1);
    setStartTimeErrors(newStartTimeErrors);

    const newEndTimeErrors = [...endTimeErrors];
    newEndTimeErrors.splice(index, 1);
    setEndTimeErrors(newEndTimeErrors);

    const newManualDescErrors = [...manualDescErrors];
    newManualDescErrors.splice(index, 1);
    setManualDescErrors(newManualDescErrors);

    const newManualDate = [...inputTypeDate];
    newManualDate.splice(index, 1);
    setInputTypeDate(newManualDate);

    setManualDisableData(newManualFields);
  };

  const addManualField = async () => {
    await setReviewerManualFields([
      ...reviewermanualFields,
      {
        AssigneeId: 0,
        Id: 0,
        inputDate: "",
        startTime: "",
        endTime: "",
        totalTime: "",
        manualDesc: "",
        IsApproved: false,
      },
    ]);
    setInputDateErrors([...inputDateErrors, false]);
    setStartTimeErrors([...startTimeErrors, false]);
    setEndTimeErrors([...endTimeErrors, false]);
    setManualDescErrors([...manualDescErrors, false]);
    setInputTypeDate([...inputTypeDate, "text"]);
    setInputTypeStartTime([...inputTypeStartTime, "text"]);
    setInputTypeEndTime([...inputTypeEndTime, "text"]);
    setManualDisableData([
      ...reviewermanualFields,
      {
        AssigneeId: 0,
        Id: 0,
        inputDate: "",
        startTime: "",
        endTime: "",
        totalTime: "",
        manualDesc: "",
        IsApproved: false,
      },
    ]);
  };

  const handleEstTimeChange = (e: any) => {
    let newValue = e.target.value;
    newValue = newValue.replace(/\D/g, "");
    if (newValue.length > 8) {
      return;
    }

    let formattedValue = "";
    if (newValue.length >= 1) {
      const hours = parseInt(newValue.slice(0, 2));
      if (hours >= 0 && hours <= 23) {
        formattedValue = newValue.slice(0, 2);
      } else {
        formattedValue = "23";
      }
    }

    if (newValue.length >= 3) {
      const minutes = parseInt(newValue.slice(2, 4));
      if (minutes >= 0 && minutes <= 59) {
        formattedValue += ":" + newValue.slice(2, 4);
      } else {
        formattedValue += ":59";
      }
    }

    if (newValue.length >= 5) {
      const seconds = parseInt(newValue.slice(4, 6));
      if (seconds >= 0 && seconds <= 59) {
        formattedValue += ":" + newValue.slice(4, 6);
      } else {
        formattedValue += ":59";
      }
    }
    return formattedValue;
  };

  const handleStartTimeChange = (e: any, index: number) => {
    const newManualFields: any = [...reviewermanualFields];
    newManualFields[index].startTime = handleEstTimeChange(e);
    setReviewerManualFields(newManualFields);

    const startDate = newManualFields[index].startTime;
    const endDate = newManualFields[index].endTime;
    if (startDate && endDate) {
      const startTime = newManualFields[index].startTime;
      const endTime = newManualFields[index].endTime;
      if (startTime && endTime) {
        const startTimeArray = startTime.split(":");
        const endTimeArray = endTime.split(":");

        const startSeconds =
          parseInt(startTimeArray[0]) * 3600 +
          parseInt(startTimeArray[1]) * 60 +
          parseInt(startTimeArray[2]);
        const endSeconds =
          parseInt(endTimeArray[0]) * 3600 +
          parseInt(endTimeArray[1]) * 60 +
          parseInt(endTimeArray[2]);
        const totalSeconds = endSeconds - startSeconds;

        if (totalSeconds >= 0) {
          const totalHours = Math.floor(totalSeconds / 3600);
          const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
          const totalSecondsRemaining = totalSeconds % 60;
          const formattedTotalTime = `${totalHours
            .toString()
            .padStart(2, "0")}:${totalMinutes
            .toString()
            .padStart(2, "0")}:${totalSecondsRemaining
            .toString()
            .padStart(2, "0")}`;

          newManualFields[index].totalTime = formattedTotalTime;
          setReviewerManualFields(newManualFields);
        }
      }
    }
  };

  const handleEndTimeChange = (e: any, index: number) => {
    const newManualFields: any = [...reviewermanualFields];
    newManualFields[index].endTime = handleEstTimeChange(e);
    setReviewerManualFields(newManualFields);

    const startDate = newManualFields[index].startTime;
    const endDate = newManualFields[index].endTime;
    if (startDate && endDate) {
      const startTime = newManualFields[index].startTime;
      const endTime = newManualFields[index].endTime;
      if (startTime && endTime) {
        const startTimeArray = startTime.split(":");
        const endTimeArray = endTime.split(":");

        const startSeconds =
          parseInt(startTimeArray[0]) * 3600 +
          parseInt(startTimeArray[1]) * 60 +
          parseInt(startTimeArray[2]);
        const endSeconds =
          parseInt(endTimeArray[0]) * 3600 +
          parseInt(endTimeArray[1]) * 60 +
          parseInt(endTimeArray[2]);
        const totalSeconds = endSeconds - startSeconds;

        if (totalSeconds >= 0) {
          const totalHours = Math.floor(totalSeconds / 3600);
          const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
          const totalSecondsRemaining = totalSeconds % 60;
          const formattedTotalTime = `${totalHours
            .toString()
            .padStart(2, "0")}:${totalMinutes
            .toString()
            .padStart(2, "0")}:${totalSecondsRemaining
            .toString()
            .padStart(2, "0")}`;

          newManualFields[index].totalTime = formattedTotalTime;
          setReviewerManualFields(newManualFields);
        }
      }
    }
  };

  const handleManualDescChange = (e: any, index: number) => {
    const newManualFields = [...reviewermanualFields];
    newManualFields[index].manualDesc = e.target.value;
    setReviewerManualFields(newManualFields);

    const newManualDescErrors = [...manualDescErrors];
    newManualDescErrors[index] = e.target.value.trim().length === 0;
    setManualDescErrors(newManualDescErrors);
  };

  const handleInputDateChange = (e: any, index: number) => {
    const newManualFields = [...reviewermanualFields];
    newManualFields[index].inputDate = e;
    setReviewerManualFields(newManualFields);

    const newInputDateErrors = [...inputDateErrors];
    newInputDateErrors[index] = e.length === 0;
    setInputDateErrors(newInputDateErrors);
  };

  const setManualDisableData = (manualField: any) => {
    setManualSubmitDisable(
      manualField
        .map((i: any) => (i.IsApproved === false ? false : true))
        .includes(false)
        ? false
        : true
    );
  };

  // Submit task
  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const fieldValidations = {
      clientName: validateField(clientNameApprovals),
      typeOfWork: validateField(typeOfWorkApprovals),
      projectName: validateField(projectNameApprovals),
      processName: validateField(processNameApprovals),
      subProcess: validateField(subProcessApprovals),
      clientTaskName: validateField(clientTaskNameApprovals),
      quantity: validateField(quantityApprovals),
      receiverDate: validateField(receiverDateApprovals),
      dueDate: validateField(dueDateApprovals),
      assignee: assigneeDisableApprovals && validateField(assigneeApprovals),
      reviewer: validateField(reviewerApprovals),
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
    };

    setClientNameApprovalsErr(fieldValidations.clientName);
    setTypeOfWorkApprovalsErr(fieldValidations.typeOfWork);
    setProjectNameApprovalsErr(fieldValidations.projectName);
    setProcessNameApprovalsErr(fieldValidations.processName);
    setSubProcessApprovalsErr(fieldValidations.subProcess);
    setClientTaskNameApprovalsErr(fieldValidations.clientTaskName);
    setQuantityApprovalsErr(fieldValidations.quantity);
    setReceiverDateApprovalsErr(fieldValidations.receiverDate);
    assigneeDisableApprovals &&
      setAssigneeApprovalsErr(fieldValidations.assignee);
    setReviewerApprovalsErr(fieldValidations.reviewer);
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

    onEdit === 0 &&
      receiverDateApprovals.length > 0 &&
      setClientTaskNameApprovalsErr(
        clientTaskNameApprovals.trim().length < 4 ||
          clientTaskNameApprovals.trim().length > 50
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
      status: validateField(statusApprovals),
      quantity: validateField(quantityApprovals),
      receiverDate: validateField(receiverDateApprovals),
      assignee: validateField(assigneeApprovals),
      reviewer: validateField(reviewerApprovals),
      manager: validateField(managerApprovals),
      returnYear:
        typeOfWorkApprovals === 3 && validateField(returnYearApprovals),
      checklistWorkpaper:
        typeOfWorkApprovals === 3 && validateField(checklistWorkpaperApprovals),
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
      Priority: priorityApprovals === 0 ? 0 : priorityApprovals,
      Quantity: quantityApprovals,
      Description:
        descriptionApprovals.toString().length <= 0
          ? null
          : descriptionApprovals.toString().trim(),
      ReceiverDate: dayjs(receiverDateApprovals).format("YYYY/MM/DD"),
      DueDate: dayjs(dueDateApprovals).format("YYYY/MM/DD"),
      allInfoDate: allInfoDateApprovals === "" ? null : allInfoDateApprovals,
      AssignedId: assigneeApprovals,
      ReviewerId: reviewerApprovals,
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
        ResponseData: any,
        error: any,
        ResponseStatus: any
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
        } else {
          setIsLoadingApprovals(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    };

    if (
      onEdit > 0 &&
      !hasEditErrors &&
      clientTaskNameApprovals.trim().length > 3 &&
      clientTaskNameApprovals.trim().length < 50 &&
      quantityApprovals > 0 &&
      quantityApprovals < 10000 &&
      !quantityApprovalsErr &&
      !quantityApprovals.toString().includes(".")
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
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setEditData(ResponseData);
        setIsCreatedByClient(ResponseData.IsCreatedByClient);
        setIsManual(ResponseData.IsManual);
        setClientNameApprovals(ResponseData.ClientId);
        setTypeOfWorkApprovals(ResponseData.WorkTypeId);
        setProjectNameApprovals(ResponseData.ProjectId);
        setProcessNameApprovals(ResponseData.ProcessId);
        setSubProcessApprovals(ResponseData.SubProcessId);
        setClientTaskNameApprovals(
          ResponseData.TaskName === null ? "" : ResponseData.TaskName
        );
        setStatusApprovals(ResponseData.StatusId);
        setAllInfoDateApprovals(
          ResponseData.AllInfoDate === null ? "" : ResponseData.AllInfoDate
        );
        !ResponseData.ErrorlogSignedOffPending
          ? setStatusApprovalsDropdownDataUse(
              statusApprovalsDropdownData.filter(
                (item: any) =>
                  item.Type === "Rework" ||
                  item.Type === "InReview" ||
                  item.Type === "Submitted" ||
                  item.Type === "Accept" ||
                  item.Type === "AcceptWithNotes" ||
                  item.Type === "OnHoldFromClient" ||
                  item.Type === "WithDraw" ||
                  item.Type === "WithdrawnbyClient" ||
                  item.value == ResponseData.StatusId
              )
            )
          : setStatusApprovalsDropdownDataUse(
              statusApprovalsDropdownData.filter(
                (item: any) =>
                  item.Type === "Rework In Review" ||
                  item.Type === "ReworkSubmitted" ||
                  item.Type === "ReworkAccept" ||
                  item.Type === "ReworkAcceptWithNotes" ||
                  item.Type === "OnHoldFromClient" ||
                  item.Type === "WithDraw" ||
                  item.Type === "WithdrawnbyClient" ||
                  item.value == ResponseData.StatusId
              )
            );
        setPriorityApprovals(ResponseData.Priority);
        setQuantityApprovals(ResponseData.Quantity);
        setDescriptionApprovals(
          ResponseData.Description === null ? "" : ResponseData.Description
        );
        setReceiverDateApprovals(ResponseData.ReceiverDate);
        setDueDateApprovals(ResponseData.DueDate);
        setDateOfReviewApprovals(ResponseData.ReviewerDate);
        setDateOfPreperationApprovals(ResponseData.PreparationDate);
        setAssigneeApprovals(ResponseData.AssignedId);
        setReviewerApprovals(ResponseData.ReviewerId);
        setManagerApprovals(
          ResponseData.ManagerId === null ? 0 : ResponseData.ManagerId
        );
        setReturnYearApprovals(
          ResponseData.TypeOfReturnId === 0
            ? null
            : ResponseData.TaxCustomFields.ReturnYear
        );
        setNoOfPagesApprovals(
          ResponseData.TypeOfReturnId === 0
            ? null
            : ResponseData.TaxCustomFields.NoOfPages
        );
        setChecklistWorkpaperApprovals(
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

      await setStatusApprovalsDropdownData(statusData);
      await setCCDropdownDataApprovals(await getCCDropdownData());
    };

    onOpen && statusApprovalsDropdownData.length === 0 && getData();
    if (onEdit > 0 && statusApprovalsDropdownData.length > 0) {
      getEditData();
      getSubTaskDataApprovals();
      getRecurringDataApprovals();
      getManualDataApprovals();
      getCheckListDataApprovals();
      getCommentDataApprovals(1);
      getReviewerNoteDataApprovals();
      getLogsDataWorklogs();
    }
    if (onEdit > 0 && assigneeApprovalsDropdownData.length > 0) {
      getReminderDataApprovals();
    }
  }, [onEdit, statusApprovalsDropdownData, assigneeApprovalsDropdownData]);

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
      ResponseData: any,
      error: any,
      ResponseStatus: any
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
      setManagerApprovalsDropdownData(await getManagerDropdownData());
      clientNameApprovals > 0 &&
        setWorkTypeApprovalsDropdownData(
          await getTypeOfWorkDropdownData(clientNameApprovals)
        );
      clientNameApprovals > 0 &&
        setProjectApprovalsDropdownData(
          await getProjectDropdownData(clientNameApprovals)
        );
      const processData: any =
        clientNameApprovals > 0 &&
        (await getProcessDropdownData(clientNameApprovals));
      setProcessApprovalsDropdownData(
        processData.map((i: any) => new Object({ label: i.Name, value: i.Id }))
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
      const data: any =
        processNameApprovals !== 0 &&
        (await getSubProcessDropdownData(
          clientNameApprovals,
          processNameApprovals
        ));
      data.length > 0 && setEstTimeDataApprovals(data);
      data.length > 0 &&
        setSubProcessApprovalsDropdownData(
          data.map((i: any) => new Object({ label: i.Name, value: i.Id }))
        );
    };

    getData();
  }, [processNameApprovals]);

  useEffect(() => {
    const getData = async () => {
      const assigneeData = await getAssigneeDropdownData(
        [clientNameApprovals],
        typeOfWorkApprovals
      );
      assigneeData.length > 0 && setAssigneeApprovalsDropdownData(assigneeData);
      setReviewerApprovalsDropdownData(
        await getReviewerDropdownData(
          [clientNameApprovals],
          typeOfWorkApprovals
        )
      );
    };

    typeOfWorkApprovals !== 0 && getData();
  }, [typeOfWorkApprovals, clientNameApprovals]);

  const handleClose = () => {
    // Common
    setIsLoadingApprovals(false);
    setEditData([]);
    setIsCreatedByClient(false);
    setUserId(0);
    scrollToPanel(0);
    onDataFetch();

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
    setStatusApprovalsDropdownDataUse([]);
    setStatusApprovals(0);
    setStatusApprovalsErr(false);
    setDescriptionApprovals("");
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
    setDateOfReviewApprovals("");
    setDateOfPreperationApprovals("");
    setEstTimeDataApprovals([]);
    setReturnYearApprovals(0);
    setReturnYearApprovalsErr(false);
    setNoOfPagesApprovals(0);
    setChecklistWorkpaperApprovals(0);
    setChecklistWorkpaperApprovalsErr(false);

    // Sub-Task
    setSubTaskSwitchApprovals(false);
    setSubTaskFieldsApprovals([
      {
        SubtaskId: 0,
        Title: "",
        Description: "",
      },
    ]);
    setTaskNameApprovalsErr([false]);
    setSubTaskDescriptionApprovalsErr([false]);
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
        startTime: "",
        endTime: "",
        totalTime: "",
        manualDesc: "",
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
        startTime: "",
        endTime: "",
        totalTime: "",
        manualDesc: "",
        IsApproved: false,
      },
    ]);
    setInputDateErrors([false]);
    setStartTimeErrors([false]);
    setEndTimeErrors([false]);
    setManualDescErrors([false]);
    setDeletedManualTime([]);

    // Comments
    setCommentDataApprovals([]);
    setValue("");
    setValueError(false);
    setValueEdit("");
    setValueEditError(false);
    setMention([]);
    setEditingCommentIndexApprovals(-1);
    setCommentSelectApprovals(1);
    setCommentAttachmentApprovals([
      {
        AttachmentId: 0,
        UserFileName: "",
        SystemFileName: "",
        AttachmentPath: process.env.attachment,
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
        Priority: 0,
        ErrorCount: 0,
        NatureOfError: 0,
        CC: [],
        Remark: "",
        Attachments: [
          {
            AttachmentId: 0,
            UserFileName: "",
            SystemFileName: "",
            AttachmentPath: process.env.attachment,
          },
        ],
        isSolved: false,
      },
    ]);
    setErrorTypeErrApprovals([false]);
    setRootCauseErrApprovals([false]);
    setErrorLogPriorityErrApprovals([false]);
    setErrorCountErrApprovals([false]);
    setNatureOfErrApprovals([false]);
    setRemarkErrApprovals([false]);
    setDeletedErrorLogApprovals([]);

    // Logs
    setLogsDateWorklogs([]);

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
              {Task.map((task) => task)
                .filter((i: any) => i !== false)
                .map((task: any, index: number) => (
                  <div
                    key={index}
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
                            (i: any) => i.value === clientNameApprovals
                          ) || null
                        }
                        onChange={(e, value: any) => {
                          value && setClientNameApprovals(value.value);
                          setTypeOfWorkApprovals(0);
                          setTypeOfWorkApprovalsErr(false);
                          setProjectNameApprovals(0);
                          setProjectNameApprovalsErr(false);
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
                          setReturnYearApprovals(0);
                          setNoOfPagesApprovals(0);
                          setChecklistWorkpaperApprovals(0);
                        }}
                        disabled={isCreatedByClient && editData.ClientId > 0}
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
                            onBlur={(e) => {
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
                        disabled={isCreatedByClient && editData.WorkTypeId > 0}
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
                          }}
                          onBlur={(e: any) => {
                            if (e.target.value > 0) {
                              setTypeOfWorkApprovalsErr(false);
                            }
                          }}
                        >
                          {workTypeApprovalsDropdownData.map(
                            (i: any, index: number) => (
                              <MenuItem value={i.value} key={index}>
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
                            (i: any) => i.value === projectNameApprovals
                          ) || null
                        }
                        disabled={isCreatedByClient && editData.ProjectId > 0}
                        onChange={(e, value: any) => {
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
                            onBlur={(e) => {
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
                          onEdit === 0
                            ? statusApprovalsDropdownData
                            : statusApprovalsDropdownDataUse
                        }
                        value={
                          onEdit === 0
                            ? statusApprovalsDropdownData.find(
                                (i: any) => i.value === statusApprovals
                              ) || null
                            : statusApprovalsDropdownDataUse.find(
                                (i: any) => i.value === statusApprovals
                              ) || null
                        }
                        onChange={(e, value: any) => {
                          value && setStatusApprovals(value.value);
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
                            error={statusApprovalsErr}
                            onBlur={(e) => {
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
                        options={processApprovalsDropdownData}
                        value={
                          processApprovalsDropdownData.find(
                            (i: any) => i.value === processNameApprovals
                          ) || null
                        }
                        disabled={isCreatedByClient && editData.ProcessId > 0}
                        onChange={(e, value: any) => {
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
                            onBlur={(e) => {
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
                            (i: any) => i.value === subProcessApprovals
                          ) || null
                        }
                        disabled={
                          isCreatedByClient && editData.SubProcessId > 0
                        }
                        onChange={(e, value: any) => {
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
                            onBlur={(e) => {
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
                        onBlur={(e: any) => {
                          if (e.target.value.trim().length > 4) {
                            setClientTaskNameApprovalsErr(false);
                          }
                          if (
                            e.target.value.trim().length > 4 &&
                            e.target.value.trim().length < 50
                          ) {
                            setClientTaskNameApprovalsErr(false);
                          }
                        }}
                        error={clientTaskNameApprovalsErr}
                        helperText={
                          clientTaskNameApprovalsErr &&
                          clientTaskNameApprovals?.trim().length > 0 &&
                          clientTaskNameApprovals?.trim().length < 4
                            ? "Minimum 4 characters required."
                            : clientTaskNameApprovalsErr &&
                              clientTaskNameApprovals?.trim().length > 50
                            ? "Maximum 50 characters allowed."
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
                        label="Description"
                        fullWidth
                        className="pt-1"
                        value={
                          descriptionApprovals?.trim().length <= 0
                            ? ""
                            : descriptionApprovals
                        }
                        onChange={(e) =>
                          setDescriptionApprovals(e.target.value)
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
                        onBlur={(e: any) => {
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
                            shouldDisableDate={isWeekend}
                            maxDate={dayjs(Date.now())}
                            onChange={(newDate: any) => {
                              setReceiverDateApprovals(newDate.$d);
                              setReceiverDateApprovalsErr(false);
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
                              setDueDateApprovals(nextDate);
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
                            disabled
                            onChange={(newDate: any) => {
                              setDueDateApprovals(newDate.$d);
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
                    <Grid item xs={3} className="pt-4">
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={assigneeApprovalsDropdownData}
                        disabled={!assigneeDisableApprovals}
                        value={
                          assigneeApprovalsDropdownData.find(
                            (i: any) => i.value === assigneeApprovals
                          ) || null
                        }
                        onChange={(e, value: any) => {
                          value && setAssigneeApprovals(value.value);
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
                            error={assigneeApprovalsErr}
                            onBlur={(e) => {
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
                        typeOfWorkApprovals === 3 ? "pt-4" : "pt-5"
                      }`}
                    >
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={reviewerApprovalsDropdownData}
                        value={
                          reviewerApprovalsDropdownData.find(
                            (i: any) => i.value === reviewerApprovals
                          ) || null
                        }
                        onChange={(e, value: any) => {
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
                            onBlur={(e) => {
                              if (reviewerApprovals > 0) {
                                setReviewerApprovalsErr(false);
                              }
                            }}
                            helperText={
                              reviewerApprovalsErr
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
                        typeOfWorkApprovals === 3 ? "pt-4" : "pt-5"
                      }`}
                    >
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={managerApprovalsDropdownData}
                        value={
                          managerApprovalsDropdownData.find(
                            (i: any) => i.value === managerApprovals
                          ) || null
                        }
                        onChange={(e, value: any) => {
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
                            onBlur={(e) => {
                              if (managerApprovals > 0) {
                                setManagerApprovalsErr(false);
                              }
                            }}
                            helperText={
                              managerApprovalsErr
                                ? "This is a required field."
                                : ""
                            }
                          />
                        )}
                      />
                    </Grid>
                    {typeOfWorkApprovals === 3 && (
                      <>
                        <Grid item xs={3} className="pt-4">
                          <FormControl
                            variant="standard"
                            sx={{ width: 300, mt: -0.3, mx: 0.75 }}
                            error={returnYearApprovalsErr}
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
                                setReturnYearApprovals(e.target.value)
                              }
                              onBlur={(e: any) => {
                                if (e.target.value > 0) {
                                  setReturnYearApprovalsErr(false);
                                }
                              }}
                            >
                              {yearDropdown.map((i: any, index: number) => (
                                <MenuItem value={i.value} key={index}>
                                  {i.label}
                                </MenuItem>
                              ))}
                            </Select>
                            {returnYearApprovalsErr && (
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
                              noOfPagesApprovals === 0 ? "" : noOfPagesApprovals
                            }
                            onChange={(e) =>
                              setNoOfPagesApprovals(e.target.value)
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
                            error={checklistWorkpaperApprovalsErr}
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
                              onBlur={(e: any) => {
                                if (e.target.value > 0) {
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
                    {onEdit > 0 && (
                      <>
                        <Grid
                          item
                          xs={3}
                          className={`${
                            typeOfWorkApprovals === 3 ? "pt-4" : "pt-5"
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
                            onBlur={(e: any) => {
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
                            typeOfWorkApprovals === 3 ? "pt-4" : "pt-5"
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
                            onBlur={(e: any) => {
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
                    {onEdit > 0 && subTaskSwitchApprovals && (
                      <Button
                        variant="contained"
                        className="rounded-[4px] !h-[36px] mr-6 !bg-secondary"
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
                          onEdit === 0 &&
                            setSubTaskFieldsApprovals([
                              {
                                SubtaskId: 0,
                                Title: "",
                                Description: "",
                              },
                            ]);
                          onEdit === 0 && setTaskNameApprovalsErr([false]);
                          onEdit === 0 &&
                            setSubTaskDescriptionApprovalsErr([false]);
                          onEdit === 0 && setDeletedSubTaskApprovals([]);
                        }}
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
                  <div className="mt-3 pl-6">
                    {subTaskFieldsApprovals.map((field, index) => (
                      <div className="w-[100%] flex" key={field.SubtaskId}>
                        <TextField
                          label={
                            <span>
                              Task Name
                              <span className="!text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                          fullWidth
                          disabled={!subTaskSwitchApprovals}
                          value={field.Title}
                          onChange={(e) =>
                            handleSubTaskChangeApprovals(e, index)
                          }
                          onBlur={(e: any) => {
                            if (e.target.value.trim().length > 0) {
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
                            field.Title.length < 5
                              ? "Minumum 5 characters required."
                              : taskNameApprovalsErr[index] &&
                                field.Title.length > 500
                              ? "Maximum 500 characters allowed."
                              : taskNameApprovalsErr[index]
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
                          disabled={!subTaskSwitchApprovals}
                          value={field.Description}
                          onChange={(e) =>
                            handleSubTaskDescriptionChangeApprovals(e, index)
                          }
                          onBlur={(e: any) => {
                            if (e.target.value.trim().length > 0) {
                              const newSubTaskDescErrors = [
                                ...subTaskDescriptionApprovalsErr,
                              ];
                              newSubTaskDescErrors[index] = false;
                              setSubTaskDescriptionApprovalsErr(
                                newSubTaskDescErrors
                              );
                            }
                          }}
                          error={subTaskDescriptionApprovalsErr[index]}
                          helperText={
                            subTaskDescriptionApprovalsErr[index] &&
                            field.Description.length > 0 &&
                            field.Description.length < 5
                              ? "Minumum 5 characters required."
                              : subTaskDescriptionApprovalsErr[index] &&
                                field.Description.length > 500
                              ? "Maximum 500 characters allowed."
                              : subTaskDescriptionApprovalsErr[index]
                              ? "This is a required field."
                              : ""
                          }
                          margin="normal"
                          variant="standard"
                          sx={{ mx: 0.75, maxWidth: 300, mt: 0 }}
                        />
                        {subTaskSwitchApprovals &&
                          (index === 0 ? (
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
                          ) : (
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
                          ))}
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
                      <div className="mt-3">
                        <span className="flex items-center">
                          <span onClick={() => toggleGeneralOpen(index)}>
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
                          itemStatesApprovals[index] &&
                          !itemStatesApprovals[
                            `addChecklistField_${index}`
                          ] && (
                            <span
                              className="flex items-center gap-3 ml-8 cursor-pointer text-[#6E6D7A]"
                              onClick={() => toggleAddChecklistField(index)}
                            >
                              <AddIcon /> Add new checklist item
                            </span>
                          )}
                        {itemStatesApprovals[index] &&
                          itemStatesApprovals[`addChecklistField_${index}`] && (
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
                                onBlur={(e: any) => {
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
                          setCommentSelectApprovals(e.target.value);
                          getCommentDataApprovals(e.target.value);
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
                      commentDataApprovals.map((i: any, index: number) => (
                        <div className="flex gap-4">
                          {i.UserName.length > 0 ? (
                            <Avatar>
                              {i.UserName.split(" ")
                                .map((word: any) =>
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
                                    <div className="flex items-start justify-center">
                                      <MentionsInput
                                        style={mentionsInputStyle}
                                        className="!w-[100%] textareaOutlineNoneEdit max-w-[70%]"
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
                                            getData={(data1: any, data2: any) =>
                                              handleCommentAttachmentsChange(
                                                data1,
                                                data2,
                                                commentAttachmentApprovals
                                              )
                                            }
                                            isDisable={false}
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
                                <div className="flex items-start justify-center gap-8">
                                  <span className="hidden"></span>
                                  <div className="flex items-start max-w-[70%]">
                                    {extractText(i.Message).map((i: any) => {
                                      const assignee =
                                        commentUserDataApprovals.map(
                                          (j: any) => j.label
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
                                    })}
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
                                                i.Attachment[0].SystemFileName,
                                              AttachmentPath:
                                                process.env.attachment,
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
                      ))}
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
                              getData={(data1: any, data2: any) =>
                                handleCommentAttachmentsChange(
                                  data1,
                                  data2,
                                  commentAttachmentApprovals
                                )
                              }
                              isDisable={false}
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
                          ) : (
                            valueError && (
                              <span className="text-defaultRed text-[14px] ml-20">
                                This is a required field.
                              </span>
                            )
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
                          />
                        </LocalizationProvider>
                      </div>
                    </div>
                    <div className="mt-0 pl-6">
                      <FormControl
                        variant="standard"
                        sx={{ mx: 0.75, minWidth: 145 }}
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
                              .map((day: any) => " " + days[day])} ${
                              selectedDays.length <= 0 && "day"
                            } starting from today`
                          : recurringTimeApprovals === 3 &&
                            "Occurs every month starting from today"}
                      </span>
                    </span>
                  </>
                )}
              </div>
            )}

            {(isManual === true || isManual === null) && (
              <div
                className="mt-14"
                id={`${
                  isManual === true || isManual === null ? "tabpanel-5" : ""
                }`}
              >
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
                            className={`inline-flex mt-[12px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[230px]`}
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
                              />
                            </LocalizationProvider>
                          </div>
                          <TextField
                            label={
                              <span>
                                Start Time(24h)
                                <span className="!text-defaultRed">
                                  &nbsp;*
                                </span>
                              </span>
                            }
                            placeholder="00:00:00"
                            fullWidth
                            value={field.startTime}
                            InputProps={{ readOnly: true }}
                            inputProps={{ readOnly: true }}
                            margin="normal"
                            variant="standard"
                            sx={{ mx: 0.75, maxWidth: 230 }}
                          />
                          <TextField
                            label={
                              <span>
                                End Time(24h)
                                <span className="!text-defaultRed">
                                  &nbsp;*
                                </span>
                              </span>
                            }
                            placeholder="00:00:00"
                            fullWidth
                            value={field.endTime}
                            InputProps={{ readOnly: true }}
                            inputProps={{ readOnly: true }}
                            margin="normal"
                            variant="standard"
                            sx={{ mx: 0.75, maxWidth: 230 }}
                          />
                          {/* <TextField
                            label="Total Time"
                            disabled
                            fullWidth
                            type={
                              field.startTime && field.endTime !== ""
                                ? "time"
                                : "text"
                            }
                            value={field.totalTime}
                            margin="normal"
                            variant="standard"
                            sx={{ mx: 0.75, maxWidth: 225 }}
                            InputProps={{ readOnly: true }}
                            inputProps={{ readOnly: true }}
                          /> */}
                          <TextField
                            label="Total Time"
                            disabled
                            fullWidth
                            value={field.totalTime}
                            margin="normal"
                            variant="standard"
                            sx={{ mx: 0.75, maxWidth: 225 }}
                            InputProps={{ readOnly: true }}
                            inputProps={{ readOnly: true }}
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
                            fullWidth
                            value={field.manualDesc}
                            InputProps={{ readOnly: true }}
                            inputProps={{ readOnly: true }}
                            margin="normal"
                            variant="standard"
                            sx={{ mx: 0.75, maxWidth: 230, mt: 2 }}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="mt-14" id="tabpanel-6">
              <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                <span className="flex items-center">
                  <ClockIcon />
                  <span className="ml-[21px]">Reviewer Manual Time</span>
                </span>
                <span className="flex items-center">
                  {onEdit > 0 && manualSwitch && (
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
                          startTime: "",
                          endTime: "",
                          totalTime: "",
                          manualDesc: "",
                          IsApproved: false,
                        },
                      ]);
                      setInputDateErrors([false]);
                      setStartTimeErrors([false]);
                      setEndTimeErrors([false]);
                      setManualDescErrors([false]);
                      setInputTypeDate(["text"]);
                      setManualDisableData([
                        {
                          AssigneeId: 0,
                          Id: 0,
                          inputDate: "",
                          startTime: "",
                          endTime: "",
                          totalTime: "",
                          manualDesc: "",
                          IsApproved: false,
                        },
                      ]);
                    }}
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
                      <div key={field.Id} className="flex items-center">
                        <div
                          className={`inline-flex mt-[12px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[230px] ${
                            inputDateErrors[index] ? "datepickerError" : ""
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
                              minDate={dayjs(recurringStartDateApprovals)}
                              maxDate={dayjs(new Date())}
                              disabled={
                                !manualSwitch ||
                                field.IsApproved ||
                                (field.AssigneeId !== 0 &&
                                  field.AssigneeId !== userId)
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
                                  helperText: inputDateErrors[index]
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
                              Start Time(24h)
                              <span className="!text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                          placeholder="00:00:00"
                          disabled={
                            !manualSwitch ||
                            field.IsApproved ||
                            (field.AssigneeId !== 0 &&
                              field.AssigneeId !== userId)
                          }
                          fullWidth
                          value={field.startTime}
                          onChange={(e) => handleStartTimeChange(e, index)}
                          onBlur={(e: any) => {
                            if (e.target.value.trim().length > 7) {
                              const newStartTimeErrors = [...startTimeErrors];
                              newStartTimeErrors[index] = false;
                              setStartTimeErrors(newStartTimeErrors);
                            }
                          }}
                          error={startTimeErrors[index]}
                          helperText={
                            field.startTime.trim().length > 0 &&
                            field.startTime.trim().length < 8 &&
                            startTimeErrors[index]
                              ? "Start time must be in HH:MM:SS"
                              : field.startTime.trim().length <= 0 &&
                                startTimeErrors[index]
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
                              End Time(24h)
                              <span className="!text-defaultRed">&nbsp;*</span>
                            </span>
                          }
                          placeholder="00:00:00"
                          disabled={
                            !manualSwitch ||
                            field.IsApproved ||
                            (field.AssigneeId !== 0 &&
                              field.AssigneeId !== userId)
                          }
                          fullWidth
                          value={field.endTime}
                          onChange={(e) => handleEndTimeChange(e, index)}
                          onBlur={(e: any) => {
                            if (
                              e.target.value.trim().length > 7 &&
                              field.endTime > field.startTime &&
                              field.startTime
                                .split(":")
                                .reduce(
                                  (acc, timePart, index) =>
                                    acc +
                                    parseInt(timePart) * [3600, 60, 1][index],
                                  0
                                ) +
                                "07:59:59"
                                  .split(":")
                                  .reduce(
                                    (acc, timePart, index) =>
                                      acc +
                                      parseInt(timePart) * [3600, 60, 1][index],
                                    0
                                  ) <
                                field.endTime
                                  .split(":")
                                  .reduce(
                                    (acc, timePart, index) =>
                                      acc +
                                      parseInt(timePart) * [3600, 60, 1][index],
                                    0
                                  )
                            ) {
                              const newEndTimeErrors = [...endTimeErrors];
                              newEndTimeErrors[index] = false;
                              setEndTimeErrors(newEndTimeErrors);
                            }
                          }}
                          error={endTimeErrors[index]}
                          helperText={
                            field.startTime
                              .split(":")
                              .reduce(
                                (acc, timePart, index) =>
                                  acc +
                                  parseInt(timePart) * [3600, 60, 1][index],
                                0
                              ) +
                              "07:59:59"
                                .split(":")
                                .reduce(
                                  (acc, timePart, index) =>
                                    acc +
                                    parseInt(timePart) * [3600, 60, 1][index],
                                  0
                                ) <
                            field.endTime
                              .split(":")
                              .reduce(
                                (acc, timePart, index) =>
                                  acc +
                                  parseInt(timePart) * [3600, 60, 1][index],
                                0
                              )
                              ? "Time must be less than 07:59:59"
                              : field.endTime.trim().length > 0 &&
                                field.endTime.trim().length < 8 &&
                                endTimeErrors[index]
                              ? "Start time must be in HH:MM:SS"
                              : field.endTime.trim().length <= 0 &&
                                endTimeErrors[index]
                              ? "This is a required field"
                              : endTimeErrors[index] &&
                                field.endTime <= field.startTime
                              ? "End time must be grater than start time"
                              : ""
                          }
                          margin="normal"
                          variant="standard"
                          sx={{ mx: 0.75, maxWidth: 225 }}
                        />
                        <TextField
                          label="Total Time"
                          disabled
                          fullWidth
                          value={field.totalTime}
                          margin="normal"
                          variant="standard"
                          sx={{ mx: 0.75, maxWidth: 225 }}
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
                              field.AssigneeId !== userId)
                          }
                          fullWidth
                          value={field.manualDesc}
                          onChange={(e) => handleManualDescChange(e, index)}
                          onBlur={(e: any) => {
                            if (e.target.value.trim().length > 0) {
                              const newManualDescErrors = [...manualDescErrors];
                              newManualDescErrors[index] = false;
                              setManualDescErrors(newManualDescErrors);
                            }
                          }}
                          error={manualDescErrors[index]}
                          helperText={
                            manualDescErrors[index] &&
                            field.manualDesc.length > 0 &&
                            field.manualDesc.length < 5
                              ? "Minumum 5 characters required."
                              : manualDescErrors[index] &&
                                field.manualDesc.length > 500
                              ? "Maximum 500 characters allowed."
                              : manualDescErrors[index]
                              ? "This is a required field."
                              : ""
                          }
                          margin="normal"
                          variant="standard"
                          sx={{ mx: 0.75, maxWidth: 230, mt: 2 }}
                        />
                        {index === 0
                          ? manualSwitch && (
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
                            )
                          : manualSwitch &&
                            !field.IsApproved && (
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
                    {onEdit > 0 && reminderSwitchApprovals && (
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
                          disabled={!reminderSwitchApprovals}
                          value={1}
                          control={<Radio />}
                          label="Due Date"
                        />
                        <FormControlLabel
                          disabled={!reminderSwitchApprovals}
                          value={2}
                          control={<Radio />}
                          label="Specific Date"
                        />
                        <FormControlLabel
                          disabled={!reminderSwitchApprovals}
                          value={3}
                          control={<Radio />}
                          label="Daily"
                        />
                        <FormControlLabel
                          disabled={!reminderSwitchApprovals}
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
                              disabled={!reminderSwitchApprovals}
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
                              disabled={!reminderSwitchApprovals}
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
                          disabled={!reminderSwitchApprovals}
                          value={
                            reminderTimeApprovals === 0
                              ? ""
                              : reminderTimeApprovals
                          }
                          onChange={(e) =>
                            setReminderTimeApprovals(e.target.value)
                          }
                          onBlur={(e: any) => {
                            if (e.target.value > 0) {
                              setReminderTimeApprovalsErr(false);
                            }
                          }}
                        >
                          {hours.map((i: any, index: number) => (
                            <MenuItem value={i.value} key={index}>
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
                        disabled={!reminderSwitchApprovals}
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
                            onBlur={(e) => {
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
                        errorLogApprovalsDrawer ? "rotate-180" : ""
                      }`}
                      onClick={() =>
                        setErorLogApprovalsrDrawer(!errorLogApprovalsDrawer)
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
                        <div className="w-[100%] mt-4" key={index}>
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
                          <FormControl
                            variant="standard"
                            sx={{ mx: 0.75, minWidth: 230 }}
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
                                field.isSolved
                              }
                              value={
                                field.ErrorType === 0 ? "" : field.ErrorType
                              }
                              onChange={(e) =>
                                handleErrorTypeChangeApprovals(e, index)
                              }
                              onBlur={(e: any) => {
                                if (e.target.value > 0) {
                                  const newErrorTypeErrors = [
                                    ...errorTypeErrApprovals,
                                  ];
                                  newErrorTypeErrors[index] = false;
                                  setErrorTypeErrApprovals(newErrorTypeErrors);
                                }
                              }}
                            >
                              <MenuItem value={1}>Internal</MenuItem>
                              <MenuItem value={2}>External</MenuItem>
                            </Select>
                            {errorTypeErrApprovals[index] && (
                              <FormHelperText>
                                This is a required field.
                              </FormHelperText>
                            )}
                          </FormControl>
                          <FormControl
                            variant="standard"
                            sx={{ mx: 0.75, minWidth: 230 }}
                            error={rootCauseErrApprovals[index]}
                          >
                            <InputLabel id="demo-simple-select-standard-label">
                              Root Cause
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
                                field.isSolved
                              }
                              value={
                                field.RootCause === 0 ? "" : field.RootCause
                              }
                              onChange={(e) =>
                                handleRootCauseChangeApprovals(e, index)
                              }
                              onBlur={(e: any) => {
                                if (e.target.value > 0) {
                                  const newRootCauseErrors = [
                                    ...rootCauseErrApprovals,
                                  ];
                                  newRootCauseErrors[index] = false;
                                  setRootCauseErrApprovals(newRootCauseErrors);
                                }
                              }}
                            >
                              <MenuItem value={1}>Procedural</MenuItem>
                              <MenuItem value={2}>DataEntry</MenuItem>
                            </Select>
                            {rootCauseErrApprovals[index] && (
                              <FormHelperText>
                                This is a required field.
                              </FormHelperText>
                            )}
                          </FormControl>
                          <FormControl
                            variant="standard"
                            sx={{ mx: 0.75, minWidth: 250 }}
                            error={natureOfErrApprovals[index]}
                          >
                            <InputLabel id="demo-simple-select-standard-label">
                              Nature of Error
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
                                field.isSolved
                              }
                              value={
                                field.NatureOfError === 0
                                  ? ""
                                  : field.NatureOfError
                              }
                              onChange={(e) =>
                                handleNatureOfErrorChangeApprovals(e, index)
                              }
                              onBlur={(e: any) => {
                                if (e.target.value > 0) {
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
                              <MenuItem value={1}>
                                Memo/Decriprion Not Updated
                              </MenuItem>
                              <MenuItem value={2}>
                                Forget To Enter Vendor/PayeeName
                              </MenuItem>
                              <MenuItem value={3}>
                                Wrong Categorization Incorrect GST/Sales Tex
                              </MenuItem>
                              <MenuItem value={4}>
                                Deleted Reconciled Transaction
                              </MenuItem>
                              <MenuItem value={5}>
                                File/Report Not Updated Correctly
                              </MenuItem>
                              <MenuItem value={6}>TAT Missed</MenuItem>
                              <MenuItem value={7}>
                                ABC Not Prepared Correctly
                              </MenuItem>
                              <MenuItem value={8}>
                                OSI Not Prepared Correctly
                              </MenuItem>
                              <MenuItem value={9}>
                                Review Check List Not Prepared
                              </MenuItem>
                            </Select>
                            {natureOfErrApprovals[index] && (
                              <FormHelperText>
                                This is a required field.
                              </FormHelperText>
                            )}
                          </FormControl>
                          <FormControl
                            variant="standard"
                            sx={{ mx: 0.75, minWidth: 230 }}
                            error={errorLogPriorityErrApprovals[index]}
                          >
                            <InputLabel id="demo-simple-select-standard-label">
                              Priority
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
                                field.isSolved
                              }
                              value={field.Priority === 0 ? "" : field.Priority}
                              onChange={(e) =>
                                handlePriorityChangeApprovals(e, index)
                              }
                              onBlur={(e: any) => {
                                if (e.target.value > 0) {
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
                              <MenuItem value={1}>High</MenuItem>
                              <MenuItem value={2}>Medium</MenuItem>
                              <MenuItem value={3}>Low</MenuItem>
                            </Select>
                            {errorLogPriorityErrApprovals[index] && (
                              <FormHelperText>
                                This is a required field.
                              </FormHelperText>
                            )}
                          </FormControl>
                          <TextField
                            label={
                              <span>
                                Error Count
                                <span className="text-defaultRed">&nbsp;*</span>
                              </span>
                            }
                            type="number"
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
                              field.isSolved
                            }
                            value={
                              field.ErrorCount === 0 ? "" : field.ErrorCount
                            }
                            onChange={(e) =>
                              handleErrorCountChangeApprovals(e, index)
                            }
                            onBlur={(e: any) => {
                              if (e.target.value.length > 0) {
                                const newErrorCountErrors = [
                                  ...errorCountErrApprovals,
                                ];
                                newErrorCountErrors[index] = false;
                                setErrorCountErrApprovals(newErrorCountErrors);
                              }
                            }}
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
                            sx={{ mx: 0.75, maxWidth: 180, mt: 0 }}
                          />
                          <div className="flex !ml-0">
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
                                field.isSolved
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
                              sx={{ mx: 0.75, maxWidth: 230, mt: 1 }}
                            />
                            <TextField
                              label={
                                <span>
                                  Remarks
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
                                field.isSolved
                              }
                              value={
                                field.Remark.trim().length === 0
                                  ? ""
                                  : field.Remark
                              }
                              onChange={(e) =>
                                handleRemarksChangeApprovals(e, index)
                              }
                              onBlur={(e: any) => {
                                if (e.target.value.length > 0) {
                                  const newRemarkErrors = [
                                    ...remarkErrApprovals,
                                  ];
                                  newRemarkErrors[index] = false;
                                  setRemarkErrApprovals(newRemarkErrors);
                                }
                              }}
                              error={remarkErrApprovals[index]}
                              helperText={
                                remarkErrApprovals[index] &&
                                field.Remark.length > 0 &&
                                field.Remark.length < 5
                                  ? "Minumum 5 characters required."
                                  : remarkErrApprovals[index] &&
                                    field.Remark.length > 500
                                  ? "Maximum 500 characters allowed."
                                  : remarkErrApprovals[index]
                                  ? "This is a required field."
                                  : ""
                              }
                              margin="normal"
                              variant="standard"
                              sx={{ mx: 0.75, maxWidth: 492, mt: 1, mr: 2 }}
                            />
                            <div className="flex flex-col">
                              <div className="flex">
                                <ImageUploader
                                  getData={(data1: any, data2: any) =>
                                    handleAttachmentsChangeApprovals(
                                      data1,
                                      data2,
                                      field.Attachments,
                                      index
                                    )
                                  }
                                  isDisable={field.isSolved}
                                />
                                {field.Attachments[0]?.SystemFileName.length >
                                  0 && (
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="mt-6 ml-2 cursor-pointer">
                                      {field.Attachments[0]?.UserFileName}
                                    </span>
                                    <span
                                      className="mt-6"
                                      onClick={() =>
                                        getFileFromBlob(
                                          field.Attachments[0]?.SystemFileName,
                                          field.Attachments[0]?.UserFileName
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
                            {index === 0 ? (
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
                            ) : (
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
                                    ? () => removeErrorLogFieldApprovals(index)
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
                reviewerNoteDataApprovals.map((i: any, index: number) => (
                  <div className="mt-5 pl-[70px] text-sm">
                    <span className="font-semibold">
                      {i.ReviewedDate.split("-")
                        .slice(1)
                        .concat(i.ReviewedDate.split("-")[0])
                        .join("-")}
                    </span>
                    {i.Details.map((j: any, index: number) => (
                      <div className="flex gap-3 mt-4">
                        <span className="mt-2">{index + 1}</span>
                        {j.ReviewerName.length > 0 ? (
                          <Tooltip title={j.ReviewerName} placement="top" arrow>
                            <Avatar>
                              {j.ReviewerName.split(" ")
                                .map((word: any) =>
                                  word.charAt(0).toUpperCase()
                                )
                                .join("")}
                            </Avatar>
                          </Tooltip>
                        ) : (
                          <Tooltip title={j.ReviewerName} placement="top" arrow>
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
                    ))}
                  </div>
                ))}
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
                      logsWorklogsDrawer ? "rotate-180" : ""
                    }`}
                    onClick={() => setLogsWorklogsDrawer(!logsWorklogsDrawer)}
                  >
                    <ChevronDownIcon />
                  </span>
                </div>
                {logsWorklogsDrawer &&
                  logsDataWorklogs.length > 0 &&
                  logsDataWorklogs.map((i: any, index: number) => (
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
                  ))}
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
                  className="rounded-[4px] !h-[36px] !mx-6 !bg-secondary"
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
      {isLoadingApprovals ? <OverLay /> : ""}
    </>
  );
};

export default EditDrawer;
