import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";
import CommentsIcon from "@/assets/icons/CommentsIcon";
import TaskIcon from "@/assets/icons/TaskIcon";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@/assets/icons/worklogs/SendIcon";
import { Close, Download, Save } from "@mui/icons-material";
import {
  Autocomplete,
  Avatar,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Mention, MentionsInput } from "react-mentions";
import { toast } from "react-toastify";
import {
  extractText,
  getYears,
  hasPermissionWorklog,
  isWeekend,
} from "@/utils/commonFunction";
import {
  getCCDropdownData,
  getDepartmentDataByClient,
  getProcessDropdownData,
  getProjectDropdownData,
  getSubProcessDropdownData,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";
import ImageUploader from "../common/ImageUploader";
import { getFileFromBlob } from "@/utils/downloadFile";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import mentionsInputStyle from "@/utils/worklog/mentionsInputStyle";
import { callAPI } from "@/utils/API/callAPI";
import OverLay from "../common/OverLay";
import {
  CommentAttachment,
  CommentGetByWorkitem,
  ErrorlogGetByWorkitem,
  SubtaskGetByWorkitem,
} from "@/utils/Types/worklogsTypes";
import {
  IdNameEstimatedHour,
  LabelValue,
  LabelValueProfileImage,
  LabelValueType,
} from "@/utils/Types/types";
import { ClientWorkitemGetById, GetFields } from "@/utils/Types/clientWorklog";
import { priorityOptions } from "@/utils/staticDropdownData";

interface DrawerProps {
  onOpen: boolean;
  onClose: () => void;
  onEdit: number;
  onDataFetch: (() => void) | null;
  onComment: boolean;
  onErrorLog: boolean;
  errorLog: boolean;
  isCompletedTaskClicked: boolean;
}

const Drawer = ({
  onOpen,
  onClose,
  onEdit,
  onDataFetch,
  onComment,
  onErrorLog,
  errorLog,
  isCompletedTaskClicked,
}: DrawerProps) => {
  const router = useRouter();
  const yearDropdown = getYears();
  const [isLoadingClientWorklog, setIsLoadingClientWorklog] = useState(false);
  const [clientWorklogUserId, setClientWorklogUserId] = useState(0);
  const [isCreatedByClientWorklog, setIsCreatedByClientWorklog] =
    useState(true);
  const [clientWorklogFieldsData, setClientWorklogFieldsData] = useState<
    GetFields[] | []
  >([]);
  const [clientWorklogEditData, setClientWorklogEditData] = useState<
    ClientWorkitemGetById | { CreatedByName: string | undefined }
  >({ CreatedByName: "" });

  let Task;
  {
    onEdit > 0
      ? errorLog
        ? (Task = ["Task", "Sub-Task", "Comments", "Error Logs"])
        : (Task = ["Task", "Sub-Task", "Comments"])
      : (Task = ["Task", "Sub-Task"]);
  }

  const handleTabClickClientWorklog = (index: number) => {
    scrollToPanelClientWorklog(index);
  };

  const scrollToPanelClientWorklog = (index: number) => {
    const panel = document.getElementById(`tabpanel-${index}`);
    if (panel) {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    onComment && scrollToPanelClientWorklog(2);
    onErrorLog && scrollToPanelClientWorklog(3);
    const userIdLocal: any = localStorage.getItem("UserId");
    setClientWorklogUserId(parseInt(userIdLocal));
  }, [onOpen, onComment, onErrorLog]);

  // Task
  const [taskClientWorklogDrawer, setTaskClientWorklogDrawer] = useState(true);
  const [
    typeOfWorkClientWorklogDropdownData,
    setTypeOfWorkClientWorklogDropdownData,
  ] = useState([]);
  const [typeOfWorkClientWorklog, setTypeOfWorkClientWorklog] =
    useState<number>(0);
  const [
    projectClientWorklogDropdownData,
    setProjectClientWorklogDropdownData,
  ] = useState<LabelValue[] | []>([]);
  const [projectNameClientWorklog, setProjectNameClientWorklog] =
    useState<number>(0);
  const [
    departmentClientWorklogDropdownData,
    setDepartmentClientWorklogDropdownData,
  ] = useState<LabelValueType[] | []>([]);
  const [departmentNameClientWorklog, setDepartmentNameClientWorklog] =
    useState<number>(0);
  const [
    processClientWorklogDropdownData,
    setProcessClientWorklogDropdownData,
  ] = useState([]);
  const [processNameClientWorklog, setProcessNameClientWorklog] =
    useState<number>(0);
  const [
    subProcessClientWorklogDropdownData,
    setSubProcessClientWorklogDropdownData,
  ] = useState([]);
  const [subProcessNameClientWorklog, setSubProcessNameClientWorklog] =
    useState<number>(0);
  const [priorityClientWorklog, setPriorityClientWorklog] = useState<number>(0);
  const [quantityClientWorklog, setQuantityClientWorklog] = useState<number>(1);
  const [receiverDateClientWorklog, setReceiverDateClientWorklog] =
    useState<string>("");
  const [dueDateClientWorklog, setDueDateClientWorklog] = useState<string>("");
  const [clientTaskNameClientWorklog, setClientTaskNameClientWorklog] =
    useState<string>("");
  const [clientTaskNameClientWorklogErr, setClientTaskNameClientWorklogErr] =
    useState(false);
  const [returnYearClientWorklog, setReturnYearClientWorklog] = useState<
    number | null
  >(0);
  const [statusClientWorklog, setStatusClientWorklog] = useState<number>(0);

  const getFieldsByClientClientWorklog = async () => {
    const clientId = await localStorage.getItem("clientId");
    const params = {
      clientId: clientId || 0,
      WorkTypeId: typeOfWorkClientWorklog,
    };
    const url = `${process.env.pms_api_url}/client/GetFields`;
    const successCallback = (
      ResponseData: GetFields[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (
        ResponseStatus === "Success" &&
        ResponseData !== null &&
        ResponseData.length > 0 &&
        error === false
      ) {
        setClientWorklogFieldsData(ResponseData);
      } else {
        setClientWorklogFieldsData([]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    typeOfWorkClientWorklog > 0 && getFieldsByClientClientWorklog();
  }, [typeOfWorkClientWorklog]);

  // Sub-Task
  const [subTaskClientWorklogSwitch, setSubTaskClientWorklogSwitch] =
    useState(false);
  const [subTaskClientWorklogDrawer, setSubTaskClientWorklogDrawer] =
    useState(true);
  const [subTaskClientWorklogFields, setSubTaskClientWorklogFields] = useState([
    {
      SubtaskId: 0,
      Title: "",
      Description: "",
    },
  ]);
  const [taskNameClientWorklogErr, setTaskNameClientWorklogErr] = useState([
    false,
  ]);
  const [
    subTaskDescriptionClientWorklogErr,
    setSubTaskDescriptionClientWorklogErr,
  ] = useState([false]);
  const [deletedSubTaskClientWorklog, setDeletedSubTaskClientWorklog] =
    useState<number[] | []>([]);

  const addTaskFieldClientWorklog = () => {
    setSubTaskClientWorklogFields([
      ...subTaskClientWorklogFields,
      {
        SubtaskId: 0,
        Title: "",
        Description: "",
      },
    ]);
    setTaskNameClientWorklogErr([...taskNameClientWorklogErr, false]);
    setSubTaskDescriptionClientWorklogErr([
      ...subTaskDescriptionClientWorklogErr,
      false,
    ]);
  };

  const removeTaskFieldClientWorklog = (index: number) => {
    setDeletedSubTaskClientWorklog([
      ...deletedSubTaskClientWorklog,
      subTaskClientWorklogFields[index].SubtaskId,
    ]);

    const newTaskClientWorklogFields = [...subTaskClientWorklogFields];
    newTaskClientWorklogFields.splice(index, 1);
    setSubTaskClientWorklogFields(newTaskClientWorklogFields);

    const newTaskClientWorklogErrors = [...taskNameClientWorklogErr];
    newTaskClientWorklogErrors.splice(index, 1);
    setTaskNameClientWorklogErr(newTaskClientWorklogErrors);

    const newSubTaskDescriptionClientWorklogErrors = [
      ...subTaskDescriptionClientWorklogErr,
    ];
    newSubTaskDescriptionClientWorklogErrors.splice(index, 1);
    setSubTaskDescriptionClientWorklogErr(
      newSubTaskDescriptionClientWorklogErrors
    );
  };

  const handleSubTaskClientWorklogChange = (e: string, index: number) => {
    const newTaskClientWorklogFields = [...subTaskClientWorklogFields];
    newTaskClientWorklogFields[index].Title = e;
    setSubTaskClientWorklogFields(newTaskClientWorklogFields);

    const newTaskErrors = [...taskNameClientWorklogErr];
    newTaskErrors[index] = e.trim().length === 0;
    setTaskNameClientWorklogErr(newTaskErrors);
  };

  const handleSubTaskDescriptionClientWorklogChange = (
    e: string,
    index: number
  ) => {
    const newTaskClientWorklogFields = [...subTaskClientWorklogFields];
    newTaskClientWorklogFields[index].Description = e;
    setSubTaskClientWorklogFields(newTaskClientWorklogFields);

    const newSubTaskDescErrors = [...subTaskDescriptionClientWorklogErr];
    newSubTaskDescErrors[index] = e.trim().length === 0;
    setSubTaskDescriptionClientWorklogErr(newSubTaskDescErrors);
  };

  const getSubTaskDataClientWorklog = async () => {
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
        ResponseData !== null &&
        ResponseData.length > 0 &&
        error === false
      ) {
        setSubTaskClientWorklogSwitch(
          hasPermissionWorklog("Task/SubTask", "save", "WorkLogs")
        );
        setSubTaskClientWorklogFields(ResponseData);
      } else {
        setSubTaskClientWorklogSwitch(false);
        setSubTaskClientWorklogFields([
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

  const handleSubmitSubTaskClientWorklog = async () => {
    let hasSubErrors = false;
    const newTaskErrors = subTaskClientWorklogFields.map(
      (field) =>
        (subTaskClientWorklogSwitch && field.Title.trim().length < 5) ||
        (subTaskClientWorklogSwitch && field.Title.trim().length > 50)
    );
    subTaskClientWorklogSwitch && setTaskNameClientWorklogErr(newTaskErrors);
    const newSubTaskDescErrors = subTaskClientWorklogFields.map(
      (field) =>
        (subTaskClientWorklogSwitch && field.Description.trim().length < 5) ||
        (subTaskClientWorklogSwitch && field.Description.trim().length > 500)
    );
    subTaskClientWorklogSwitch &&
      setSubTaskDescriptionClientWorklogErr(newSubTaskDescErrors);
    hasSubErrors =
      newTaskErrors.some((error) => error) ||
      newSubTaskDescErrors.some((error) => error);

    if (hasPermissionWorklog("Task/SubTask", "save", "WorkLogs")) {
      if (!hasSubErrors) {
        setIsLoadingClientWorklog(true);
        const params = {
          workitemId: onEdit,
          subtasks: subTaskClientWorklogSwitch
            ? subTaskClientWorklogFields.map(
                (i: SubtaskGetByWorkitem) =>
                  new Object({
                    SubtaskId: i.SubtaskId,
                    Title: i.Title.trim(),
                    Description: i.Description.trim(),
                  })
              )
            : null,
          deletedWorkitemSubtaskIds: deletedSubTaskClientWorklog,
        };
        const url = `${process.env.worklog_api_url}/workitem/subtask/savebyworkitem`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Sub Task Updated successfully.`);
            setDeletedSubTaskClientWorklog([]);
            setSubTaskClientWorklogFields([
              {
                SubtaskId: 0,
                Title: "",
                Description: "",
              },
            ]);
            getSubTaskDataClientWorklog();
            setIsLoadingClientWorklog(false);
          }
          setIsLoadingClientWorklog(false);
        };
        callAPI(url, params, successCallback, "POST");
      }
    } else {
      toast.error("User don't have permission to Update Sub-Task.");
      getSubTaskDataClientWorklog();
    }
  };

  // Comments
  const [commentsClientWorklogDrawer, setCommentsClientWorklogDrawer] =
    useState(true);
  const [commentDataClientWorklog, setCommentDataClientWorklog] = useState<
    CommentGetByWorkitem[] | []
  >([]);
  const [commentValueClientWorklog, setCommentValueClientWorklog] =
    useState("");
  const [commentValueClientWorklogError, setCommentValueClientWorklogError] =
    useState(false);
  const [fileHasError, setFileHasError] = useState(false);
  const [commentValueClientWorklogEdit, setCommentValueClientWorklogEdit] =
    useState("");
  const [
    commentValueClientWorklogEditError,
    setCommentValueClientWorklogEditError,
  ] = useState(false);
  const [fileEditHasError, setFileEditHasError] = useState(false);
  const [mentionClientWorklog, setMentionClientWorklog] = useState<any>([]);
  const [commentAttachmentClientWorklog, setCommentAttachmentClientWorklog] =
    useState([
      {
        AttachmentId: 0,
        UserFileName: "",
        SystemFileName: "",
        AttachmentPath: process.env.attachment || "",
      },
    ]);
  const [
    editingCommentIndexClientWorklog,
    setEditingCommentIndexClientWorklog,
  ] = useState(-1);
  const [
    commentDropdownDataClientWorklog,
    setCommentDropdownDataClientWorklog,
  ] = useState<LabelValue[] | []>([]);

  const users: { id: number; display: string }[] =
    commentDropdownDataClientWorklog.map((i: LabelValue) => ({
      id: i.value,
      display: i.label,
    }));

  const handleCommentChangeClientWorklog = (e: string) => {
    setMentionClientWorklog(
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
    setCommentValueClientWorklogError(false);
  };

  const handleEditClickClientWorklog = (index: number, message: string) => {
    setEditingCommentIndexClientWorklog(index);
    setCommentValueClientWorklogEdit(message);
  };

  const handleSaveClickClientWorklog = async (
    e: any,
    i: CommentGetByWorkitem
  ) => {
    e.preventDefault();
    setCommentValueClientWorklogEditError(
      commentValueClientWorklogEdit.trim().length < 5
    );
    if (
      commentValueClientWorklogEdit.trim().length > 5 &&
      !commentValueClientWorklogEditError &&
      !fileEditHasError
    ) {
      if (hasPermissionWorklog("Comment", "Save", "WorkLogs")) {
        const params = {
          workitemId: onEdit,
          CommentId: i.CommentId,
          Message: commentValueClientWorklogEdit,
          TaggedUsers: mentionClientWorklog,
          Attachment: commentAttachmentClientWorklog,
          type: 2,
        };
        const url = `${process.env.worklog_api_url}/workitem/comment/saveByworkitem`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Comment updated successfully.`);
            setMentionClientWorklog([]);
            setCommentAttachmentClientWorklog([
              {
                AttachmentId: 0,
                UserFileName: "",
                SystemFileName: "",
                AttachmentPath: process.env.attachment || "",
              },
            ]);
            setCommentValueClientWorklogEditError(false);
            setCommentValueClientWorklogEdit("");
            setEditingCommentIndexClientWorklog(-1);
            getCommentDataClientWorklog();
          }
        };
        callAPI(url, params, successCallback, "POST");
      } else {
        toast.error("User don't have permission to Update Comment.");
        getCommentDataClientWorklog();
      }
    }
  };

  const handleCommentAttachmentsChangeClientWorklog = (
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
    setCommentAttachmentClientWorklog(Attachment);
  };

  const getCommentDataClientWorklog = async () => {
    const params = {
      WorkitemId: onEdit,
      type: 2,
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
        ResponseData.length > 0 &&
        error === false
      ) {
        setCommentDataClientWorklog(ResponseData);
      } else {
        setCommentDataClientWorklog([]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSubmitCommentClientWorklog = async (e: {
    preventDefault: () => void;
  }) => {
    e.preventDefault();
    setCommentValueClientWorklogError(
      commentValueClientWorklog.trim().length < 5
    );
    if (
      commentValueClientWorklog.trim().length >= 5 &&
      !commentValueClientWorklogError &&
      !fileHasError
    ) {
      if (hasPermissionWorklog("Comment", "Save", "WorkLogs")) {
        setIsLoadingClientWorklog(true);
        const params = {
          workitemId: onEdit,
          CommentId: 0,
          Message: commentValueClientWorklog,
          TaggedUsers: mentionClientWorklog,
          Attachment:
            commentAttachmentClientWorklog[0].SystemFileName.length > 0
              ? commentAttachmentClientWorklog
              : null,
          type: 2,
        };
        const url = `${process.env.worklog_api_url}/workitem/comment/saveByworkitem`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`Comment sent successfully.`);
            setMentionClientWorklog([]);
            setCommentAttachmentClientWorklog([
              {
                AttachmentId: 0,
                UserFileName: "",
                SystemFileName: "",
                AttachmentPath: process.env.attachment || "",
              },
            ]);
            setCommentValueClientWorklogEditError(false);
            setCommentValueClientWorklogEdit("");
            setCommentValueClientWorklog("");
            getCommentDataClientWorklog();
            setIsLoadingClientWorklog(false);
          }
          setIsLoadingClientWorklog(false);
        };
        callAPI(url, params, successCallback, "POST");
      } else {
        toast.error("User don't have permission to Update Comment.");
        getCommentDataClientWorklog();
      }
    }
  };

  // Error Logs
  const [errorLogClientWorklogDrawer, setErrorLogClientWorklogDrawer] =
    useState(true);
  const [cCDropdownClientWorklogData, setCCDropdownClientWorklogData] =
    useState<LabelValueProfileImage[] | []>([]);
  const [errorLogClientWorklogFields, setErrorLogClientWorklogFields] =
    useState<ErrorlogGetByWorkitem[]>([
      {
        SubmitedBy: "",
        SubmitedOn: "",
        ErrorLogId: 0,
        ErrorType: 1,
        RootCause: 0,
        Impact: 0,
        Priority: 0,
        ErrorCount: 0,
        CC: [],
        NatureOfError: 0,
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
      },
    ]);
  const [remarkClientWorklogErr, setRemarkClientWorklogErr] = useState([false]);
  const [imageErrApprovals, setImageErrApprovals] = useState([false]);
  const [deletedErrorLogClientWorklog, setDeletedErrorLogClientWorklog] =
    useState<number[] | []>([]);

  const addErrorLogFieldClientWorklog = () => {
    setErrorLogClientWorklogFields([
      ...errorLogClientWorklogFields,
      {
        SubmitedBy: "",
        SubmitedOn: "",
        ErrorLogId: 0,
        ErrorType: 2,
        RootCause: 0,
        Impact: 0,
        Priority: 0,
        ErrorCount: 0,
        CC: [],
        DocumentNumber: "",
        VendorName: "",
        RootCauseAnalysis: "",
        MitigationPlan: "",
        ContigencyPlan: "",
        NatureOfError: 0,
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
      },
    ]);
    setRemarkClientWorklogErr([...remarkClientWorklogErr, false]);
    setImageErrApprovals([...imageErrApprovals, false]);
  };

  const removeErrorLogFieldClientWorklog = (index: number) => {
    setDeletedErrorLogClientWorklog([
      ...deletedErrorLogClientWorklog,
      errorLogClientWorklogFields[index].ErrorLogId,
    ]);
    const newErrorLogClientWorklogFields = [...errorLogClientWorklogFields];
    newErrorLogClientWorklogFields.splice(index, 1);
    setErrorLogClientWorklogFields(newErrorLogClientWorklogFields);

    const newRemarkClientWorklogErrors = [...remarkClientWorklogErr];
    newRemarkClientWorklogErrors.splice(index, 1);
    setRemarkClientWorklogErr(newRemarkClientWorklogErrors);

    const newImageErrors = [...imageErrApprovals];
    newImageErrors.splice(index, 1);
    setImageErrApprovals(newImageErrors);
  };

  const handleRemarksChangeClientWorklog = (e: string, index: number) => {
    const newClientWorklogFields = [...errorLogClientWorklogFields];
    newClientWorklogFields[index].Remark = e;
    setErrorLogClientWorklogFields(newClientWorklogFields);
    const newClientWorklogErrors = [...remarkClientWorklogErr];
    newClientWorklogErrors[index] = e.trim().length <= 0;
    setRemarkClientWorklogErr(newClientWorklogErrors);
  };

  const handleAttachmentsChangeClientWorklog = (
    data1: string,
    data2: string,
    Attachments: CommentAttachment[],
    index: number
  ) => {
    const newFields = [...errorLogClientWorklogFields];
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
    setErrorLogClientWorklogFields(newFields);
  };
  // console.log(errorLogClientWorklogFields)

  const getErrorLogDataClientWorklog = async () => {
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
        ResponseData.length > 0 &&
        error === false
      ) {
        setErrorLogClientWorklogFields(
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
            CC: i.CC.map((i: number) =>
              cCDropdownClientWorklogData.find(
                (j: { value: number }) => j.value === i
              )
            ).filter(Boolean),
            Remark: i.Remark,
            DocumentNumber: !!i.DocumentNumber ? i.DocumentNumber : "",
            VendorName: !!i.VendorName ? i.VendorName : "",
            RootCauseAnalysis: i.RootCauseAnalysis ? i.RootCauseAnalysis : "",
            MitigationPlan: !!i.MitigationPlan ? i.MitigationPlan : "",
            ContigencyPlan: !!i.ContigencyPlan ? i.ContigencyPlan : "",
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
            ResolutionStatus: i.ResolutionStatus,
            IdentifiedBy:
              i.ErrorType === 2 && i.IdentifiedBy !== null
                ? i.IdentifiedBy?.toString().trim()
                : null,
            isSolved: i.IsSolved,
          }))
        );
      } else {
        setErrorLogClientWorklogFields([
          {
            SubmitedBy: "",
            SubmitedOn: "",
            ErrorLogId: 0,
            ErrorType: 0,
            RootCause: 0,
            Impact: 0,
            Priority: 0,
            ErrorCount: 0,
            CC: [],
            NatureOfError: 0,
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
          },
        ]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSubmitErrorLogClientWorklog = async (e: {
    preventDefault: () => void;
  }) => {
    e.preventDefault();
    let hasErrorLogErrors = false;
    const newRemarkClientWorklogErrors = errorLogClientWorklogFields.map(
      (field) =>
        field.Remark.trim().length < 5 || field.Remark.trim().length > 500
    );
    setRemarkClientWorklogErr(newRemarkClientWorklogErrors);

    hasErrorLogErrors =
      newRemarkClientWorklogErrors.some((error) => error) ||
      imageErrApprovals.includes(true);

    if (!hasErrorLogErrors) {
      if (hasPermissionWorklog("ErrorLog", "Save", "WorkLogs")) {
        setIsLoadingClientWorklog(true);
        const params = {
          WorkItemId: onEdit,
          Errors: errorLogClientWorklogFields.map(
            (i: ErrorlogGetByWorkitem) =>
              new Object({
                ErrorLogId: i.ErrorLogId,
                ErrorType: i.ErrorType > 0 ? i.ErrorType : 2,
                RootCause: i.RootCause,
                Impact: i.Impact,
                Priority: i.Priority,
                ErrorCount: i.ErrorCount,
                NatureOfError: i.NatureOfError,
                CC: i.CC.map((j: LabelValueProfileImage) => j.value),
                Remark: i.Remark.trim(),
                Attachments:
                  i.Attachments?.[0]?.SystemFileName?.length ?? 0 > 0
                    ? i.Attachments
                    : null,
                DocumentNumber: !!i.DocumentNumber ? i.DocumentNumber : null,
                VendorName: !!i.VendorName ? i.VendorName : null,
                RootCauseAnalysis: !!i.RootCauseAnalysis
                  ? i.RootCauseAnalysis
                  : null,
                MitigationPlan: !!i.MitigationPlan ? i.MitigationPlan : null,
                ContigencyPlan: !!i.ContigencyPlan ? i.ContigencyPlan : null,
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
                  i.ErrorType === 2 && !!i.IdentifiedBy
                    ? i.IdentifiedBy?.toString().trim()
                    : null,
              })
          ),
          IsClientWorklog: 1,
          SubmissionId: null,
          DeletedErrorlogIds: deletedErrorLogClientWorklog,
        };
        const url = `${process.env.worklog_api_url}/workitem/errorlog/saveByworkitem`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(`ErrorLog Updated successfully.`);
            setDeletedErrorLogClientWorklog([]);
            getErrorLogDataClientWorklog();
            setIsLoadingClientWorklog(false);
          } else {
            setDeletedErrorLogClientWorklog([]);
            setIsLoadingClientWorklog(false);
          }
        };
        callAPI(url, params, successCallback, "POST");
      } else {
        toast.error("User don't have permission to Update ErrorLog.");
        getErrorLogDataClientWorklog();
      }
    }
  };

  // Submit Task
  const handleSubmitClientWorklog = (e: { preventDefault: () => void }) => {
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

    const typeChecked = (type: string) => {
      return clientWorklogFieldsData
        .map((field: GetFields) => field.Type === type && field.IsChecked)
        .some((result: boolean) => result === true);
    };

    const fieldValidations = {
      clientTaskName:
        typeChecked("TaskName") && validateField(clientTaskNameClientWorklog),
    };

    clientWorklogFieldsData.map((field: GetFields) => {
      field.Type === "TaskName" &&
        field.IsChecked &&
        setClientTaskNameClientWorklogErr(fieldValidations.clientTaskName);
    });

    const hasErrors = Object.values(fieldValidations).some((error) => error);

    // Sub-Task
    let hasSubErrors = false;
    const newTaskErrors = subTaskClientWorklogFields.map(
      (field) =>
        (onEdit === 0 &&
          subTaskClientWorklogSwitch &&
          field.Title.trim().length < 5) ||
        (onEdit === 0 &&
          subTaskClientWorklogSwitch &&
          field.Title.trim().length > 500)
    );
    setTaskNameClientWorklogErr(newTaskErrors);
    const newSubTaskDescErrors = subTaskClientWorklogFields.map(
      (field) =>
        (onEdit === 0 &&
          subTaskClientWorklogSwitch &&
          field.Description.trim().length < 5) ||
        (onEdit === 0 &&
          subTaskClientWorklogSwitch &&
          field.Description.trim().length > 500)
    );
    setSubTaskDescriptionClientWorklogErr(newSubTaskDescErrors);
    hasSubErrors =
      newTaskErrors.some((error) => error) ||
      newSubTaskDescErrors.some((error) => error);

    const saveWorklog = async () => {
      setIsLoadingClientWorklog(true);
      const clientId = await localStorage.getItem("clientId");
      const params = {
        ClientId: clientId,
        WorkItemId: onEdit > 0 ? onEdit : 0,
        taskName:
          clientTaskNameClientWorklog.length <= 0
            ? null
            : clientTaskNameClientWorklog,
        WorkTypeId:
          typeOfWorkClientWorklog === 0 ? null : typeOfWorkClientWorklog,
        ProjectId:
          projectNameClientWorklog === 0 ? null : projectNameClientWorklog,
        DepartmentId:
          departmentNameClientWorklog === 0
            ? null
            : departmentNameClientWorklog,
        ProcessId:
          processNameClientWorklog === 0 ? null : processNameClientWorklog,
        SubProcessId:
          subProcessNameClientWorklog === 0
            ? null
            : subProcessNameClientWorklog,
        Priority: priorityClientWorklog === 0 ? null : priorityClientWorklog,
        Quantity: quantityClientWorklog <= 0 ? null : quantityClientWorklog,
        ReceiverDate:
          receiverDateClientWorklog.length === 0
            ? null
            : dayjs(receiverDateClientWorklog).format("YYYY/MM/DD"),
        DueDate:
          dueDateClientWorklog.length === 0
            ? null
            : dayjs(dueDateClientWorklog).format("YYYY/MM/DD"),
        TaxReturnType: null,
        TypeOfReturnId: null,
        TaxCustomFields:
          typeOfWorkClientWorklog !== 3
            ? null
            : {
                ReturnYear:
                  returnYearClientWorklog === 0
                    ? null
                    : returnYearClientWorklog,
                Complexity: null,
                CountYear: null,
                NoOfPages: null,
              },
        SubTaskList:
          onEdit > 0
            ? null
            : subTaskClientWorklogSwitch
            ? subTaskClientWorklogFields.map(
                (i: SubtaskGetByWorkitem) =>
                  new Object({
                    SubtaskId: i.SubtaskId,
                    Title: i.Title.trim(),
                    Description: i.Description.trim(),
                  })
              )
            : null,
      };
      const url = `${process.env.worklog_api_url}/ClientWorkitem/saveworkitem`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success(
            `Worklog ${onEdit > 0 ? "Updated" : "created"} successfully.`
          );
          onEdit === 0 && handleCloseClientWorklog();
          setIsLoadingClientWorklog(false);
          getEditDataClientWorklog();
        } else {
          getEditDataClientWorklog();
          setIsLoadingClientWorklog(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    };

    if (!hasErrors && !hasSubErrors) {
      if (hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs")) {
        saveWorklog();
      } else {
        toast.error("User don't have permission to Update Task.");
        onEdit > 0 && getEditDataClientWorklog();
      }
    }
  };

  const getEditDataClientWorklog = async () => {
    const params = {
      WorkitemId: onEdit,
    };
    const url = `${process.env.worklog_api_url}/ClientWorkitem/getbyid`;
    const successCallback = (
      ResponseData: ClientWorkitemGetById,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setClientWorklogEditData(ResponseData);
        setIsCreatedByClientWorklog(ResponseData.IsCreatedByClient);
        setTypeOfWorkClientWorklog(
          ResponseData.WorkTypeId === null ? 0 : ResponseData.WorkTypeId
        );
        setProjectNameClientWorklog(
          ResponseData.ProjectId === null ? 0 : ResponseData.ProjectId
        );
        setDepartmentNameClientWorklog(
          ResponseData.DepartmentId === null ? 0 : ResponseData.DepartmentId
        );
        setProcessNameClientWorklog(
          ResponseData.ProcessId === null ? 0 : ResponseData.ProcessId
        );
        setSubProcessNameClientWorklog(
          ResponseData.SubProcessId === null ? 0 : ResponseData.SubProcessId
        );
        setPriorityClientWorklog(
          ResponseData.Priority === null || ResponseData.Priority === 0
            ? 0
            : ResponseData.Priority
        );
        setQuantityClientWorklog(
          ResponseData.Quantity === null || ResponseData.Quantity === 0
            ? 0
            : ResponseData.Quantity
        );
        setReceiverDateClientWorklog(
          ResponseData.ReceiverDate === null ? "" : ResponseData.ReceiverDate
        );
        setDueDateClientWorklog(
          ResponseData.DueDate === null ? "" : ResponseData.DueDate
        );
        setClientTaskNameClientWorklog(
          ResponseData.TaskName === null ? "" : ResponseData.TaskName
        );
        setStatusClientWorklog(
          ResponseData.StatusId === null ? 0 : ResponseData.StatusId
        );
        setReturnYearClientWorklog(
          ResponseData.TaxCustomFields === null
            ? 0
            : ResponseData.TypeOfReturnId === 0
            ? 0
            : ResponseData.TaxCustomFields.ReturnYear
        );
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const getData = async () => {
      const clientId: any = await localStorage.getItem("clientId");
      const workTypeData =
        clientId > 0 && (await getTypeOfWorkDropdownData(clientId));
      workTypeData.length > 0 &&
        setTypeOfWorkClientWorklogDropdownData(workTypeData);
      workTypeData.length > 0 &&
        onEdit === 0 &&
        setTypeOfWorkClientWorklog(
          workTypeData.map((i: LabelValue) => i.value).includes(3)
            ? 3
            : workTypeData.map((i: LabelValue) => i.value).includes(1)
            ? 1
            : workTypeData.map((i: LabelValue) => i.value).includes(2)
            ? 2
            : 0
        );
      setCCDropdownClientWorklogData(await getCCDropdownData());
    };

    if (onEdit > 0) {
      getEditDataClientWorklog();
      getSubTaskDataClientWorklog();
      getCommentDataClientWorklog();
      getErrorLogDataClientWorklog();
      getData();
    }

    onOpen && getData();
  }, [onOpen, onEdit]);

  useEffect(() => {
    const getData = async () => {
      const clientId: any = await localStorage.getItem("clientId");
      clientId > 0 &&
        typeOfWorkClientWorklog > 0 &&
        setProjectClientWorklogDropdownData(
          await getProjectDropdownData(clientId, typeOfWorkClientWorklog)
        );
      clientId > 0 &&
        setDepartmentClientWorklogDropdownData(
          await getDepartmentDataByClient(clientId)
        );
      const processData =
        clientId > 0 &&
        typeOfWorkClientWorklog > 0 &&
        departmentNameClientWorklog > 0 &&
        (await getProcessDropdownData(
          clientId,
          typeOfWorkClientWorklog,
          departmentNameClientWorklog
        ));
      processData.length > 0
        ? setProcessClientWorklogDropdownData(
            processData?.map(
              (i: IdNameEstimatedHour) =>
                new Object({ label: i.Name, value: i.Id })
            )
          )
        : setProcessClientWorklogDropdownData([]);
      const subProcessData =
        clientId > 0 &&
        processNameClientWorklog !== 0 &&
        (await getSubProcessDropdownData(
          clientId,
          typeOfWorkClientWorklog,
          processNameClientWorklog
        ));
      subProcessData.length > 0
        ? setSubProcessClientWorklogDropdownData(
            subProcessData?.map(
              (i: IdNameEstimatedHour) =>
                new Object({ label: i.Name, value: i.Id })
            )
          )
        : setSubProcessClientWorklogDropdownData([]);
    };

    if (onEdit > 0) {
      getData();
    }

    onOpen && getData();
  }, [
    onOpen,
    onEdit,
    processNameClientWorklog,
    typeOfWorkClientWorklog,
    departmentNameClientWorklog,
  ]);

  useEffect(() => {
    const getCommentDropdownData = async () => {
      const clientId = await localStorage.getItem("clientId");
      const params = {
        clientId: clientId,
        WorktypeId: typeOfWorkClientWorklog,
      };
      const url = `${process.env.api_url}/user/GetClientCommentUserDropdown`;
      const successCallback = (
        ResponseData: LabelValue[] | [],
        error: boolean,
        ResponseStatus: string
      ) => {
        if (
          ResponseStatus === "Success" &&
          ResponseData !== null &&
          ResponseData.length > 0 &&
          error === false
        ) {
          setCommentDropdownDataClientWorklog(ResponseData);
        } else {
          setCommentDropdownDataClientWorklog([]);
        }
      };
      callAPI(url, params, successCallback, "POST");
    };

    typeOfWorkClientWorklog !== 0 && onEdit > 0 && getCommentDropdownData();
  }, [typeOfWorkClientWorklog]);

  const handleCloseClientWorklog = () => {
    setClientWorklogEditData({ CreatedByName: "" });
    setIsCreatedByClientWorklog(true);
    setClientWorklogUserId(0);
    setTaskClientWorklogDrawer(true);
    setTypeOfWorkClientWorklog(0);
    setProjectNameClientWorklog(0);
    setDepartmentNameClientWorklog(0);
    setProcessNameClientWorklog(0);
    setSubProcessNameClientWorklog(0);
    setPriorityClientWorklog(0);
    setQuantityClientWorklog(0);
    setReceiverDateClientWorklog("");
    setDueDateClientWorklog("");
    setClientTaskNameClientWorklog("");
    setClientTaskNameClientWorklogErr(false);
    setReturnYearClientWorklog(0);
    setStatusClientWorklog(0);
    setSubProcessClientWorklogDropdownData([]);

    // Sub-Task
    setSubTaskClientWorklogDrawer(true);
    setSubTaskClientWorklogSwitch(false);
    setSubTaskClientWorklogFields([
      {
        SubtaskId: 0,
        Title: "",
        Description: "",
      },
    ]);
    setTaskNameClientWorklogErr([false]);
    setSubTaskDescriptionClientWorklogErr([false]);

    // Comments
    setCommentsClientWorklogDrawer(true);
    setCommentDataClientWorklog([]);
    setCommentValueClientWorklog("");
    setCommentValueClientWorklogError(false);
    setFileHasError(false);
    setCommentValueClientWorklogEdit("");
    setCommentValueClientWorklogEditError(false);
    setFileEditHasError(false);
    setMentionClientWorklog([]);
    setCommentAttachmentClientWorklog([
      {
        AttachmentId: 0,
        UserFileName: "",
        SystemFileName: "",
        AttachmentPath: process.env.attachment || "",
      },
    ]);
    setEditingCommentIndexClientWorklog(-1);
    setCommentDropdownDataClientWorklog([]);

    // ErrorLogs
    setErrorLogClientWorklogDrawer(true);
    setErrorLogClientWorklogFields([
      {
        SubmitedBy: "",
        SubmitedOn: "",
        ErrorLogId: 0,
        ErrorType: 1,
        RootCause: 0,
        Impact: 0,
        Priority: 0,
        ErrorCount: 0,
        CC: [],
        NatureOfError: 0,
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
      },
    ]);
    setRemarkClientWorklogErr([false]);
    setImageErrApprovals([false]);
    setDeletedErrorLogClientWorklog([]);

    onDataFetch?.();

    if (typeof window !== "undefined") {
      const pathname = window.location.href.includes("id=");
      if (pathname) {
        onClose();
        router.push("/worklog");
      } else {
        onClose();
      }
    }
  };

  return (
    <>
      <div
        className={`fixed top-0 right-0 z-30 h-screen overflow-y-auto w-[1300px] border border-lightSilver bg-pureWhite transform  ${
          onOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="sticky top-0 !h-[9%] bg-whiteSmoke border-b z-30 border-lightSilver">
          <div className="flex p-[6px] justify-between items-center">
            <div className="flex items-center py-[6.5px] pl-[5px]">
              {Task.map((task) => task)
                .filter((i: string | boolean) => i !== false)
                .map((task: string, index: number) => (
                  <div
                    key={index}
                    className={`my-2 px-3 text-[14px] ${
                      index !== Task.length - 1 &&
                      "border-r border-r-lightSilver"
                    } cursor-pointer font-bold hover:text-[#0592C6] text-slatyGrey`}
                    onClick={() => handleTabClickClientWorklog(index)}
                  >
                    {task}
                  </div>
                ))}
            </div>
            <Tooltip title="Close" placement="left" arrow>
              <IconButton
                className="mr-[10px]"
                onClick={handleCloseClientWorklog}
              >
                <Close />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <div className={`${onEdit > 0 && "overflow-y-scroll"} !h-[91%]`}>
          <form
            onSubmit={handleSubmitClientWorklog}
            className="flex flex-col justify-between h-[100%]"
          >
            <div>
              <div className="pt-1" id="tabpanel-0">
                <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                  <span className="flex items-center">
                    <TaskIcon />
                    <span className="ml-[21px]">Task</span>
                  </span>
                  <div className="flex gap-4">
                    {onEdit > 0 && (
                      <span>
                        Created By : {clientWorklogEditData?.CreatedByName}
                      </span>
                    )}
                    <span
                      className={`cursor-pointer ${
                        taskClientWorklogDrawer ? "rotate-180" : ""
                      }`}
                      onClick={() =>
                        setTaskClientWorklogDrawer(!taskClientWorklogDrawer)
                      }
                    >
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                {taskClientWorklogDrawer && (
                  <Grid container className="px-8">
                    <Grid item xs={3} className="pt-4">
                      <FormControl
                        variant="standard"
                        sx={{ width: 300, mt: -0.3 }}
                        disabled={
                          !isCreatedByClientWorklog ||
                          (isCompletedTaskClicked &&
                            onEdit > 0 &&
                            !isCreatedByClientWorklog) ||
                          statusClientWorklog > 1
                        }
                      >
                        <InputLabel id="demo-simple-select-standard-label">
                          Type of Work
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-standard-label"
                          id="demo-simple-select-standard"
                          value={
                            typeOfWorkClientWorklog === 0
                              ? ""
                              : typeOfWorkClientWorklog
                          }
                          onChange={(e) => {
                            setTypeOfWorkClientWorklog(Number(e.target.value));
                            setProjectNameClientWorklog(0);
                            setProcessNameClientWorklog(0);
                            setSubProcessNameClientWorklog(0);
                            setReturnYearClientWorklog(0);
                          }}
                        >
                          {typeOfWorkClientWorklogDropdownData.map(
                            (i: LabelValue, index: number) => (
                              <MenuItem value={i.value} key={index}>
                                {i.label}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                    {clientWorklogFieldsData.map((type: GetFields) => (
                      <>
                        {type.Type === "ProjectName" && type.IsChecked && (
                          <Grid item xs={3} className="pt-4">
                            <Autocomplete
                              disablePortal
                              id="combo-box-demo"
                              disabled={
                                !isCreatedByClientWorklog ||
                                (isCompletedTaskClicked &&
                                  onEdit > 0 &&
                                  !isCreatedByClientWorklog) ||
                                statusClientWorklog > 1
                              }
                              options={projectClientWorklogDropdownData}
                              value={
                                projectClientWorklogDropdownData.find(
                                  (i: LabelValue) =>
                                    i.value === projectNameClientWorklog
                                ) || null
                              }
                              onChange={(e, value: LabelValue | null) => {
                                value &&
                                  setProjectNameClientWorklog(value.value);
                              }}
                              sx={{ width: 300 }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="standard"
                                  label="Project Name"
                                />
                              )}
                            />
                          </Grid>
                        )}
                        {type.Type === "Department" && type.IsChecked && (
                          <Grid item xs={3} className="pt-4">
                            <Autocomplete
                              disablePortal
                              id="combo-box-demo"
                              disabled={
                                !isCreatedByClientWorklog ||
                                (isCompletedTaskClicked &&
                                  onEdit > 0 &&
                                  !isCreatedByClientWorklog) ||
                                statusClientWorklog > 1
                              }
                              options={departmentClientWorklogDropdownData}
                              value={
                                departmentClientWorklogDropdownData.find(
                                  (i: LabelValueType) =>
                                    i.value === departmentNameClientWorklog
                                ) || null
                              }
                              onChange={(e, value: LabelValueType | null) => {
                                value &&
                                  setDepartmentNameClientWorklog(value.value);
                                setProcessNameClientWorklog(0);
                                setSubProcessNameClientWorklog(0);
                              }}
                              sx={{ width: 300 }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="standard"
                                  label="Department"
                                />
                              )}
                            />
                          </Grid>
                        )}
                        {type.Type === "ProcessName" && type.IsChecked && (
                          <Grid item xs={3} className="pt-4">
                            <Autocomplete
                              disablePortal
                              id="combo-box-demo"
                              disabled={
                                !isCreatedByClientWorklog ||
                                (isCompletedTaskClicked &&
                                  onEdit > 0 &&
                                  !isCreatedByClientWorklog) ||
                                statusClientWorklog > 1
                              }
                              options={processClientWorklogDropdownData}
                              value={
                                processClientWorklogDropdownData.find(
                                  (i: LabelValue) =>
                                    i.value === processNameClientWorklog
                                ) || null
                              }
                              onChange={(e, value: LabelValue | null) => {
                                value &&
                                  setProcessNameClientWorklog(value.value);
                                setSubProcessNameClientWorklog(0);
                              }}
                              sx={{ width: 300 }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="standard"
                                  label="Process Name"
                                />
                              )}
                            />
                          </Grid>
                        )}
                        {type.Type === "SubProcessName" && type.IsChecked && (
                          <Grid item xs={3} className="pt-4">
                            <Autocomplete
                              disablePortal
                              id="combo-box-demo"
                              disabled={
                                !isCreatedByClientWorklog ||
                                (isCompletedTaskClicked &&
                                  onEdit > 0 &&
                                  !isCreatedByClientWorklog) ||
                                statusClientWorklog > 1
                              }
                              options={subProcessClientWorklogDropdownData}
                              value={
                                subProcessClientWorklogDropdownData.find(
                                  (i: LabelValue) =>
                                    i.value === subProcessNameClientWorklog
                                ) || null
                              }
                              onChange={(e, value: LabelValue | null) => {
                                value &&
                                  setSubProcessNameClientWorklog(value.value);
                              }}
                              sx={{ width: 300 }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="standard"
                                  label="Sub-Process"
                                />
                              )}
                            />
                          </Grid>
                        )}
                        {type.Type === "TaskName" && type.IsChecked && (
                          <Grid item xs={3}>
                            <TextField
                              label={
                                <span>
                                  Task Name
                                  <span className="!text-defaultRed">
                                    &nbsp;*
                                  </span>
                                </span>
                              }
                              disabled={
                                !isCreatedByClientWorklog ||
                                (isCompletedTaskClicked &&
                                  onEdit > 0 &&
                                  !isCreatedByClientWorklog) ||
                                statusClientWorklog > 1
                              }
                              fullWidth
                              value={
                                clientTaskNameClientWorklog?.trim().length <= 0
                                  ? ""
                                  : clientTaskNameClientWorklog
                              }
                              onChange={(e) => {
                                setClientTaskNameClientWorklog(e.target.value);
                                setClientTaskNameClientWorklogErr(false);
                              }}
                              onBlur={(e) => {
                                if (e.target.value.trim().length > 4) {
                                  setClientTaskNameClientWorklogErr(false);
                                }
                                if (
                                  e.target.value.trim().length > 4 &&
                                  e.target.value.trim().length < 50
                                ) {
                                  setClientTaskNameClientWorklogErr(false);
                                }
                              }}
                              error={clientTaskNameClientWorklogErr}
                              helperText={
                                clientTaskNameClientWorklogErr &&
                                clientTaskNameClientWorklog?.trim().length >
                                  0 &&
                                clientTaskNameClientWorklog?.trim().length < 4
                                  ? "Minimum 4 characters required."
                                  : clientTaskNameClientWorklogErr &&
                                    clientTaskNameClientWorklog?.trim().length >
                                      50
                                  ? "Maximum 50 characters allowed."
                                  : clientTaskNameClientWorklogErr
                                  ? "This is a required field."
                                  : ""
                              }
                              margin="normal"
                              variant="standard"
                              sx={{ width: 300 }}
                            />
                          </Grid>
                        )}
                        {type.Type === "Priority" && type.IsChecked && (
                          <Grid item xs={3} className="pt-4">
                            <Autocomplete
                              disablePortal
                              id="combo-box-demo"
                              disabled={
                                !isCreatedByClientWorklog ||
                                (isCompletedTaskClicked &&
                                  onEdit > 0 &&
                                  !isCreatedByClientWorklog) ||
                                statusClientWorklog > 1
                              }
                              options={priorityOptions}
                              value={
                                priorityOptions.find(
                                  (i: LabelValue) =>
                                    i.value === priorityClientWorklog
                                ) || null
                              }
                              onChange={(e, value: LabelValue | null) => {
                                value && setPriorityClientWorklog(value.value);
                              }}
                              sx={{ width: 300 }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="standard"
                                  label="Priority"
                                />
                              )}
                            />
                          </Grid>
                        )}
                        {type.Type === "Quantity" && type.IsChecked && (
                          <Grid item xs={3} className="pt-4">
                            <TextField
                              label="Quantity"
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
                                !isCreatedByClientWorklog ||
                                (isCompletedTaskClicked &&
                                  onEdit > 0 &&
                                  !isCreatedByClientWorklog) ||
                                statusClientWorklog > 1
                              }
                              type="number"
                              fullWidth
                              value={quantityClientWorklog}
                              onChange={(e) =>
                                setQuantityClientWorklog(Number(e.target.value))
                              }
                              margin="normal"
                              variant="standard"
                              sx={{ width: 300, mt: 0 }}
                            />
                          </Grid>
                        )}
                        {type.Type === "StartDate" && type.IsChecked && (
                          <Grid item xs={3} className="pt-4">
                            <div
                              className={`inline-flex -mt-[4px] muiDatepickerCustomizer w-full max-w-[300px]`}
                            >
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                  label="Created Date"
                                  value={
                                    receiverDateClientWorklog === ""
                                      ? null
                                      : dayjs(receiverDateClientWorklog)
                                  }
                                  disabled={
                                    !isCreatedByClientWorklog ||
                                    (isCompletedTaskClicked &&
                                      onEdit > 0 &&
                                      !isCreatedByClientWorklog) ||
                                    statusClientWorklog > 1
                                  }
                                  // shouldDisableDate={isWeekend}
                                  maxDate={dayjs(Date.now())}
                                  onChange={(newDate: any) => {
                                    setReceiverDateClientWorklog(newDate.$d);
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
                                    setDueDateClientWorklog(nextDate);
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
                        {type.Type === "EndDate" && type.IsChecked && (
                          <Grid item xs={3} className="pt-4">
                            <div
                              className={`inline-flex -mt-[4px] muiDatepickerCustomizer w-full max-w-[300px]`}
                            >
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                  label="Due Date"
                                  value={
                                    dueDateClientWorklog === ""
                                      ? null
                                      : dayjs(dueDateClientWorklog)
                                  }
                                  disabled={
                                    !isCreatedByClientWorklog ||
                                    (isCompletedTaskClicked &&
                                      onEdit > 0 &&
                                      !isCreatedByClientWorklog) ||
                                    statusClientWorklog > 1
                                  }
                                  minDate={dayjs(receiverDateClientWorklog)}
                                  onChange={(newDate: any) => {
                                    setDueDateClientWorklog(newDate.$d);
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
                        {type.Type === "ReturnYear" &&
                          type.IsChecked &&
                          typeOfWorkClientWorklog === 3 && (
                            <Grid item xs={3} className="pt-4">
                              <FormControl
                                variant="standard"
                                sx={{ width: 300, mt: -0.4, mx: 0.75 }}
                                disabled={
                                  !isCreatedByClientWorklog ||
                                  (isCompletedTaskClicked &&
                                    onEdit > 0 &&
                                    !isCreatedByClientWorklog) ||
                                  statusClientWorklog > 1
                                }
                              >
                                <InputLabel id="demo-simple-select-standard-label">
                                  Return Year
                                </InputLabel>
                                <Select
                                  labelId="demo-simple-select-standard-label"
                                  id="demo-simple-select-standard"
                                  value={
                                    returnYearClientWorklog === 0
                                      ? ""
                                      : returnYearClientWorklog
                                  }
                                  onChange={(e) =>
                                    setReturnYearClientWorklog(
                                      Number(e.target.value)
                                    )
                                  }
                                >
                                  {yearDropdown.map(
                                    (i: LabelValue, index: number) => (
                                      <MenuItem value={i.value} key={index}>
                                        {i.label}
                                      </MenuItem>
                                    )
                                  )}
                                </Select>
                              </FormControl>
                            </Grid>
                          )}
                      </>
                    ))}
                  </Grid>
                )}
              </div>
              {clientWorklogFieldsData
                .map((field: GetFields) => field.IsChecked)
                .includes(true) && (
                <div className="mt-14" id="tabpanel-1">
                  <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                    <span className="flex items-center">
                      <TaskIcon />
                      <span className="ml-[21px]">Sub-Task</span>
                    </span>
                    <span className="flex items-center">
                      {onEdit > 0 &&
                        subTaskClientWorklogSwitch &&
                        isCreatedByClientWorklog && (
                          <Button
                            variant="contained"
                            className="rounded-[4px] !h-[36px] mr-6 !bg-secondary"
                            onClick={handleSubmitSubTaskClientWorklog}
                          >
                            Update
                          </Button>
                        )}
                      <Switch
                        checked={subTaskClientWorklogSwitch}
                        disabled={
                          !isCreatedByClientWorklog ||
                          (isCompletedTaskClicked &&
                            onEdit > 0 &&
                            !isCreatedByClientWorklog) ||
                          statusClientWorklog > 1
                        }
                        onChange={(e) => {
                          setSubTaskClientWorklogSwitch(e.target.checked);
                          onEdit === 0 &&
                            setSubTaskClientWorklogFields([
                              {
                                SubtaskId: 0,
                                Title: "",
                                Description: "",
                              },
                            ]);
                          onEdit === 0 && setTaskNameClientWorklogErr([false]);
                          onEdit === 0 &&
                            setSubTaskDescriptionClientWorklogErr([false]);
                          onEdit === 0 && setDeletedSubTaskClientWorklog([]);
                        }}
                      />
                      <span
                        className={`cursor-pointer ${
                          subTaskClientWorklogDrawer ? "rotate-180" : ""
                        }`}
                        onClick={() =>
                          setSubTaskClientWorklogDrawer(
                            !subTaskClientWorklogDrawer
                          )
                        }
                      >
                        <ChevronDownIcon />
                      </span>
                    </span>
                  </div>
                  {subTaskClientWorklogDrawer && (
                    <>
                      <div className="mt-3 pl-6">
                        {subTaskClientWorklogFields.map((field, index) => (
                          <div className="w-[100%] flex" key={index}>
                            <TextField
                              label={
                                <span>
                                  Task Name
                                  <span className="!text-defaultRed">
                                    &nbsp;*
                                  </span>
                                </span>
                              }
                              disabled={
                                !isCreatedByClientWorklog ||
                                (isCompletedTaskClicked &&
                                  onEdit > 0 &&
                                  !isCreatedByClientWorklog) ||
                                statusClientWorklog > 1
                              }
                              fullWidth
                              value={field.Title}
                              onChange={(e) =>
                                handleSubTaskClientWorklogChange(
                                  e.target.value,
                                  index
                                )
                              }
                              onBlur={(e) => {
                                if (e.target.value.trim().length > 0) {
                                  const newTaskNameClientWorklogErrors = [
                                    ...taskNameClientWorklogErr,
                                  ];
                                  newTaskNameClientWorklogErrors[index] = false;
                                  setTaskNameClientWorklogErr(
                                    newTaskNameClientWorklogErrors
                                  );
                                }
                              }}
                              error={taskNameClientWorklogErr[index]}
                              helperText={
                                taskNameClientWorklogErr[index] &&
                                field.Title.length > 0 &&
                                field.Title.length < 5
                                  ? "Minumum 5 characters required."
                                  : taskNameClientWorklogErr[index] &&
                                    field.Title.length > 50
                                  ? "Maximum 50 characters allowed."
                                  : taskNameClientWorklogErr[index]
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
                                  <span className="!text-defaultRed">
                                    &nbsp;*
                                  </span>
                                </span>
                              }
                              disabled={
                                !isCreatedByClientWorklog ||
                                (isCompletedTaskClicked &&
                                  onEdit > 0 &&
                                  !isCreatedByClientWorklog) ||
                                statusClientWorklog > 1
                              }
                              fullWidth
                              value={field.Description}
                              onChange={(e) =>
                                handleSubTaskDescriptionClientWorklogChange(
                                  e.target.value,
                                  index
                                )
                              }
                              onBlur={(e) => {
                                if (e.target.value.trim().length > 0) {
                                  const newSubTaskDescErrors = [
                                    ...subTaskDescriptionClientWorklogErr,
                                  ];
                                  newSubTaskDescErrors[index] = false;
                                  setSubTaskDescriptionClientWorklogErr(
                                    newSubTaskDescErrors
                                  );
                                }
                              }}
                              error={subTaskDescriptionClientWorklogErr[index]}
                              helperText={
                                subTaskDescriptionClientWorklogErr[index] &&
                                field.Description.length > 0 &&
                                field.Description.length < 5
                                  ? "Minumum 5 characters required."
                                  : subTaskDescriptionClientWorklogErr[index] &&
                                    field.Description.length > 500
                                  ? "Maximum 500 characters allowed."
                                  : subTaskDescriptionClientWorklogErr[index]
                                  ? "This is a required field."
                                  : ""
                              }
                              margin="normal"
                              variant="standard"
                              sx={{ mx: 0.75, maxWidth: 300, mt: 0 }}
                            />
                            {index === 0
                              ? (onEdit === 0 || !isCompletedTaskClicked) &&
                                isCreatedByClientWorklog && (
                                  <span
                                    className="cursor-pointer"
                                    onClick={addTaskFieldClientWorklog}
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
                              : (onEdit === 0 || !isCompletedTaskClicked) &&
                                isCreatedByClientWorklog && (
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
                                        ? () =>
                                            removeTaskFieldClientWorklog(index)
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
                    </>
                  )}
                </div>
              )}
              {onEdit > 0 && (
                <div className="mt-14" id="tabpanel-2">
                  <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                    <span className="flex items-center">
                      <CommentsIcon />
                      <span className="ml-[21px]">Comments</span>
                    </span>
                    <span
                      className={`cursor-pointer ${
                        commentsClientWorklogDrawer ? "rotate-180" : ""
                      }`}
                      onClick={() =>
                        setCommentsClientWorklogDrawer(
                          !commentsClientWorklogDrawer
                        )
                      }
                    >
                      <ChevronDownIcon />
                    </span>
                  </div>
                  <div className="my-5 px-16">
                    <div className="flex flex-col gap-4">
                      {commentsClientWorklogDrawer &&
                        commentDataClientWorklog.length > 0 &&
                        commentDataClientWorklog.map(
                          (i: CommentGetByWorkitem, index: number) => (
                            <div className="flex gap-4" key={index}>
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
                                  {editingCommentIndexClientWorklog ===
                                  index ? (
                                    <div className="flex items-start gap-2">
                                      <div className="flex flex-col">
                                        <div className="flex items-start justify-start w-[70vw]">
                                          <MentionsInput
                                            style={mentionsInputStyle}
                                            className="!w-[100%] textareaOutlineNoneEdit"
                                            value={
                                              commentValueClientWorklogEdit
                                            }
                                            onChange={(e) => {
                                              setCommentValueClientWorklogEdit(
                                                e.target.value
                                              );
                                              setCommentValueClientWorklogEditError(
                                                false
                                              );
                                              handleCommentChangeClientWorklog(
                                                e.target.value
                                              );
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
                                                  handleCommentAttachmentsChangeClientWorklog(
                                                    data1,
                                                    data2,
                                                    commentAttachmentClientWorklog
                                                  )
                                                }
                                                isDisable={false}
                                                fileHasError={(
                                                  error: boolean
                                                ) => setFileEditHasError(error)}
                                              />
                                            </div>
                                          </div>
                                          {commentAttachmentClientWorklog[0]
                                            ?.SystemFileName.length > 0 && (
                                            <div className="flex items-center justify-center gap-2">
                                              <span className="ml-2 cursor-pointer">
                                                {
                                                  commentAttachmentClientWorklog[0]
                                                    ?.UserFileName
                                                }
                                              </span>
                                              <span
                                                onClick={() =>
                                                  getFileFromBlob(
                                                    commentAttachmentClientWorklog[0]
                                                      ?.SystemFileName,
                                                    commentAttachmentClientWorklog[0]
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
                                          {commentValueClientWorklogEditError &&
                                          commentValueClientWorklogEdit.trim()
                                            .length > 1 &&
                                          commentValueClientWorklogEdit.trim()
                                            .length < 5 ? (
                                            <span className="text-defaultRed text-[14px]">
                                              Minimum 5 characters required.
                                            </span>
                                          ) : (
                                            commentValueClientWorklogEditError && (
                                              <span className="text-defaultRed text-[14px]">
                                                This is a required field.
                                              </span>
                                            )
                                          )}
                                          {!commentValueClientWorklogEditError &&
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
                                          handleSaveClickClientWorklog(e, i)
                                        }
                                      >
                                        <Save className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-start justify-start gap-8 w-[70vw]">
                                      <span className="hidden"></span>
                                      <div className="max-w-[60vw]">
                                        {extractText(i.Message).map(
                                          (i: string) => {
                                            const assignee =
                                              commentDropdownDataClientWorklog.map(
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
                                        <div className="flex items-center justify-center gap-2">
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
                                      {clientWorklogUserId === i.UserId &&
                                        hasPermissionWorklog(
                                          "Comment",
                                          "save",
                                          "WorkLogs"
                                        ) && (
                                          <button
                                            type="button"
                                            className="flex items-start !bg-secondary text-white border rounded-md p-[4px]"
                                            onClick={() => {
                                              handleEditClickClientWorklog(
                                                index,
                                                i.Message
                                              );
                                              setCommentAttachmentClientWorklog(
                                                [
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
                                                ]
                                              );
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
                  {commentsClientWorklogDrawer &&
                    hasPermissionWorklog("Comment", "save", "WorkLogs") && (
                      <>
                        <div className="border border-slatyGrey gap-2 py-2 rounded-lg my-2 ml-16 mr-8 flex items-center justify-center">
                          <MentionsInput
                            style={mentionsInputStyle}
                            className="!w-[92%] textareaOutlineNone"
                            value={commentValueClientWorklog}
                            onChange={(e) => {
                              setCommentValueClientWorklog(e.target.value);
                              setCommentValueClientWorklogError(false);
                              handleCommentChangeClientWorklog(e.target.value);
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
                                  handleCommentAttachmentsChangeClientWorklog(
                                    data1,
                                    data2,
                                    commentAttachmentClientWorklog
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
                            onClick={handleSubmitCommentClientWorklog}
                          >
                            <SendIcon />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            {commentValueClientWorklogError &&
                            commentValueClientWorklog.trim().length > 1 &&
                            commentValueClientWorklog.trim().length < 5 ? (
                              <span className="text-defaultRed text-[14px] ml-20">
                                Minimum 5 characters required.
                              </span>
                            ) : commentValueClientWorklogError ? (
                              <span className="text-defaultRed text-[14px] ml-20">
                                This is a required field.
                              </span>
                            ) : !commentValueClientWorklogError &&
                              fileHasError ? (
                              <span className="text-defaultRed text-[14px] ml-20">
                                File size shouldn&apos;t be more than 5MB.
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                          {commentAttachmentClientWorklog[0].AttachmentId ===
                            0 &&
                            commentAttachmentClientWorklog[0]?.SystemFileName
                              .length > 0 && (
                              <div className="flex items-center justify-center gap-2 mr-6">
                                <span className="ml-2 cursor-pointer">
                                  {
                                    commentAttachmentClientWorklog[0]
                                      ?.UserFileName
                                  }
                                </span>
                                <span
                                  onClick={() =>
                                    getFileFromBlob(
                                      commentAttachmentClientWorklog[0]
                                        ?.SystemFileName,
                                      commentAttachmentClientWorklog[0]
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
                      </>
                    )}
                </div>
              )}
              {onEdit > 0 && errorLog && (
                <div className="my-14" id="tabpanel-3">
                  <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
                    <span className="flex items-center">
                      <TaskIcon />
                      <span className="ml-[21px]">Error Logs</span>
                    </span>
                    <span className="flex items-center">
                      {onEdit > 0 && (
                        <Button
                          variant="contained"
                          className="rounded-[4px] !h-[36px] mr-6 !bg-secondary"
                          onClick={handleSubmitErrorLogClientWorklog}
                        >
                          Update
                        </Button>
                      )}
                      <span
                        className={`cursor-pointer ${
                          errorLogClientWorklogDrawer ? "rotate-180" : ""
                        }`}
                        onClick={() =>
                          setErrorLogClientWorklogDrawer(
                            !errorLogClientWorklogDrawer
                          )
                        }
                      >
                        <ChevronDownIcon />
                      </span>
                    </span>
                  </div>
                  {errorLogClientWorklogDrawer &&
                    hasPermissionWorklog("ErrorLog", "View", "WorkLogs") && (
                      <>
                        <div className="mt-3 pl-6">
                          {errorLogClientWorklogFields.map(
                            (field: ErrorlogGetByWorkitem, index: number) => (
                              <div className="w-[100%] mt-4" key={index}>
                                {field.SubmitedBy.length > 0 && (
                                  <div className="ml-1 mt-8 mb-3">
                                    <span className="font-bold">
                                      Correction By
                                    </span>
                                    <span className="ml-3 mr-10 text-[14px]">
                                      {field.SubmitedBy}
                                    </span>
                                    <span className="font-bold">
                                      Reviewer Date
                                    </span>
                                    <span className="ml-3">
                                      {field.SubmitedOn}
                                    </span>
                                  </div>
                                )}
                                <div className="flex !ml-0">
                                  <TextField
                                    label={
                                      <span>
                                        Additional Remark
                                        <span className="text-defaultRed">
                                          &nbsp;*
                                        </span>
                                      </span>
                                    }
                                    fullWidth
                                    value={
                                      field.Remark.trim().length === 0
                                        ? ""
                                        : field.Remark
                                    }
                                    disabled={field.isSolved}
                                    onChange={(e) =>
                                      handleRemarksChangeClientWorklog(
                                        e.target.value,
                                        index
                                      )
                                    }
                                    onBlur={(e) => {
                                      if (e.target.value.length > 0) {
                                        const newRemarkClientWorklogErrors = [
                                          ...remarkClientWorklogErr,
                                        ];
                                        newRemarkClientWorklogErrors[index] =
                                          false;
                                        setRemarkClientWorklogErr(
                                          newRemarkClientWorklogErrors
                                        );
                                      }
                                    }}
                                    error={remarkClientWorklogErr[index]}
                                    helperText={
                                      remarkClientWorklogErr[index] &&
                                      field.Remark.length > 0 &&
                                      field.Remark.length < 5
                                        ? "Minumum 5 characters required."
                                        : remarkClientWorklogErr[index] &&
                                          field.Remark.length > 500
                                        ? "Maximum 500 characters allowed."
                                        : remarkClientWorklogErr[index]
                                        ? "This is a required field."
                                        : ""
                                    }
                                    margin="normal"
                                    variant="standard"
                                    sx={{
                                      mx: 0.75,
                                      maxWidth: 492,
                                      mt: 1,
                                      mr: 2,
                                    }}
                                  />
                                  <div className="flex flex-col">
                                    <div className="flex">
                                      <ImageUploader
                                        getData={(
                                          data1: string,
                                          data2: string
                                        ) =>
                                          field?.Attachments
                                            ? handleAttachmentsChangeClientWorklog(
                                                data1,
                                                data2,
                                                field.Attachments,
                                                index
                                              )
                                            : undefined
                                        }
                                        isDisable={field.isSolved}
                                        fileHasError={(error: boolean) => {
                                          const newErrors = [
                                            ...imageErrApprovals,
                                          ];
                                          newErrors[index] = error;
                                          setImageErrApprovals(newErrors);
                                        }}
                                      />
                                      {field.Attachments &&
                                        field.Attachments.length > 0 &&
                                        field.Attachments[0]?.SystemFileName
                                          .length > 0 && (
                                          <div className="flex items-center justify-center gap-2">
                                            <span className="mt-6 ml-2 cursor-pointer">
                                              {
                                                field.Attachments[0]
                                                  ?.UserFileName
                                              }
                                            </span>
                                            <span
                                              className="mt-6"
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
                                        File size shouldn&apos;t be more than
                                        5MB.
                                      </span>
                                    )}
                                  </div>
                                  {field.isSolved && (
                                    <FormGroup>
                                      <FormControlLabel
                                        className="mt-4 ml-2"
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
                                          ? addErrorLogFieldClientWorklog
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
                                        ) &&
                                        hasPermissionWorklog(
                                          "ErrorLog",
                                          "Save",
                                          "WorkLogs"
                                        )
                                          ? () =>
                                              removeErrorLogFieldClientWorklog(
                                                index
                                              )
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
                            )
                          )}
                        </div>
                      </>
                    )}
                </div>
              )}
            </div>
            <div className="sticky bottom-0 !h-[9%] bg-whiteSmoke border-b z-30 border-lightSilver flex p-2 justify-end items-center">
              <div>
                <Button
                  variant="outlined"
                  className="rounded-[4px] !h-[36px] !text-secondary"
                  onClick={handleCloseClientWorklog}
                >
                  <span className="flex items-center justify-center gap-[10px] px-[5px]">
                    Close
                  </span>
                </Button>
                {isCreatedByClientWorklog &&
                  !isCompletedTaskClicked &&
                  clientWorklogFieldsData
                    .map((field: GetFields) => field.IsChecked)
                    .includes(true) && (
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
        </div>
      </div>

      {isLoadingClientWorklog ? <OverLay /> : ""}
    </>
  );
};

export default Drawer;
