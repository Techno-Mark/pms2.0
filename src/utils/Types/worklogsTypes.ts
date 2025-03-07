export interface WorkitemList {
  WorkitemId: number;
  TaskName: string;
  Description: string | null;
  ClientId: number;
  ClientName: string;
  ProjectId: number;
  ProjectName: string;
  ProcessId: number;
  ProcessName: string;
  SubProcessId: number;
  SubProcessName: string;
  TimelogId: number | null;
  State: number;
  Timer: number;
  AssignedToId: number;
  AssignedToName: string;
  PriorityId: number;
  PriorityName: string;
  StatusId: number;
  StatusType: string;
  StatusName: string;
  StatusColorCode: string;
  EstimateTime: string;
  EstimateTimeSec: number;
  Quantity: number;
  STDTime: string;
  ActualTime: string;
  ActualTimeSec: number;
  StdTimeSec: number;
  StartDate: string;
  EndDate: string;
  AssignedById: number;
  AssignedByName: string;
  IsManual: boolean | null;
  IsHasErrorlog: boolean;
  IsHasErrorlogAddedByClient: boolean;
  ErrorlogSignedOffPending: boolean;
  IsRecurring: boolean;
  WorkType: string;
  WorkTypeId: number;
  IsActive: boolean;
  AllInfoDate: string | null;
  IsCreatedByClient: boolean;
  ReceiverDate: string;
  ManagerId: number;
  ReviewerId: number;
  ReturnYear: number | null;
  PreparorTimeSec: number;
  PreparorTime: string;
  DepartmentId: number;
  DepartmentName: string;
  DepartmentType: string | null;
  TaskType: string | null;
  ReworkReceivedDate: string | null;
  ReworkDueDate: string | null;
}

export interface WorklogsActionBarProps {
  selectedRowsCount: number;
  selectedRowId: number | null;
  selectedRowsdata: WorkitemList[];
  selectedRowClientId: number[];
  selectedRowWorkTypeId: number[];
  selectedRowDepartmentId: number[];
  selectedRowDepartmentType: (string | null)[];
  selectedRowIds: number[];
  onEdit: (rowData: number) => void;
  handleClearSelection: () => void;
  onRecurring: (rowData: boolean, selectedId: number) => void;
  onComment: (rowData: boolean, selectedId: number) => void;
  workItemData: WorkitemList[];
  getWorkItemList: () => void;
  isUnassigneeClicked: boolean;
  getOverLay?: (e: boolean) => void;
}

export interface Response {
  worklogExportFilter: any | null;
  TotalTime: string;
  TodaysTime: string;
  BreakTime: string;
  List: WorkitemList[];
  TotalCount: number;
}

export interface AppliedFilter {
  ClientId: number[];
  TypeOfWork: number | null;
  ProjectId: number | null;
  StatusId: number[];
  Status: number[];
  AssignedTo: number | null;
  AssignedBy: number | null;
  DueDate: string | null;
  StartDate: string | null;
  EndDate: string | null;
  ReviewStatus: number | null;
}

export interface FilterData {
  FilterId: number;
  Name: string;
  AppliedFilter: AppliedFilter;
}

export interface AppliedFilterWorklogsPage {
  ClientId: number[] | null;
  TypeOfWork: number | null;
  ProjectId: number | null;
  StatusId?: number[] | null;
  Status?: number | null;
  AssignedTo: number | null;
  AssignedBy: number | null;
  DueDate: string | null;
  StartDate: string | null;
  EndDate: string | null;
  ReworkReceivedDate: string | null;
  ReworkDueDate: string | null;
  ReviewStatus: number | null;
}

export interface AppliedFilterHalfDayPage {
  ClientId: number | null;
  ProjectId: number | null;
  StartDate: string | null;
  EndDate: string | null;
}

export interface AppliedFilterHistoryPage {
  ClientId: number | null;
  ProjectId: number | null;
  ProcessId: number | null;
  Department: number | null;
  StartDate: string | null | undefined;
  EndDate: string | null | undefined;
}

export interface FilterWorklogsPage {
  FilterId: number;
  Name: string;
  AppliedFilter: AppliedFilterWorklogsPage;
}

export interface WorkitemGetbyid {
  TaskName: string;
  ClientId: number;
  WorkTypeId: number;
  ProjectId: number;
  ProcessId: number;
  DepartmentId: number;
  SubProcessId: number;
  StatusId: number;
  Priority: number | null;
  Quantity: number;
  Description: string | null;
  ReceiverDate: string;
  DueDate: string;
  ReviewerDate: string | null;
  PreparationDate: string | null;
  AssignedId: number;
  ReviewerId: number;
  TaxReturnType: string | null;
  TypeOfReturnId: number | null;
  TaxCustomFields: {
    ReturnYear: number;
    Complexity: null;
    CountYear: null;
    NoOfPages: number;
  } | null;
  IsManual: boolean | null;
  AllInfoDate: string | null;
  ChecklistWorkpaper: boolean | null;
  ManagerId: number;
  IsCreatedByClient: boolean;
  CreatedById: number | null;
  CreatedByName: string | null;
  IsHasErrorlog: boolean;
  IsHasErrorlogAddedByClient: boolean;
  ErrorlogSignedOffPending: boolean;
  WorkItemId: number;
  PeriodFrom: null | string;
  PeriodTo: null | string;
  ReworkReceivedDate: null | string;
  ReworkDueDate: null | string;
  IsQARequired: number | null;
  QAQuantity: number | null;
  QAId: number | null;
  PrevReviewerId: number | null;
  MissingInfo: string | null;
}

export interface SubtaskGetByWorkitem {
  SubtaskId: number;
  Title: string;
  Description: string;
}

export interface RecurringGetByWorkitem {
  WorkItemId: number;
  StartDate: string;
  EndDate: string;
  Type: number;
  Triggers: number[] | [];
  IsActive: boolean;
}

export interface GetManualLogByWorkitem {
  Id: number;
  Date: string;
  Time: number;
  EndTime: string;
  AssigneeId: number;
  Comment: string;
  IsApproved: boolean;
  totalTime?: string;
}

export interface GetManualLogByWorkitemReviewer {
  TimeId: number;
  Date: string;
  Time: number;
  AssigneeId: number;
  Comment: string;
  IsApproved: boolean;
  totalTime?: string;
  IsCurrentReviewer: boolean;
}

export interface ManualFieldsWorklogs {
  AssigneeId: number;
  Id: number;
  inputDate: string;
  startTime: number;
  manualDesc: string;
  IsApproved: boolean;
  IsCurrentReviewer?: boolean;
}

export interface ReminderGetByWorkitem {
  ReminderId: number;
  ReminderType: number;
  ReminderDate: string | null;
  ReminderTime: number;
  ReminderUserIds: number[];
  IsActive: boolean;
}

export interface CommentAttachment {
  AttachmentId: number;
  UserFileName: string;
  SystemFileName: string;
  AttachmentPath: string;
  IsRemoved?: boolean;
  uploading?: boolean;
}

export interface CommentGetByWorkitem {
  UserId: number;
  Message: string;
  Type: number;
  TaggedUsers: number[] | [];
  SubmitedDate: string;
  SubmitedTime: string;
  UserName: string;
  Attachment: CommentAttachment[] | [];
  CommentId: number;
}

export interface ErrorlogGetByWorkitem {
  ErrorLogId: number;
  SubmitedBy: string;
  SubmitedOn: string;
  ErrorType: number;
  RootCause: number;
  Impact: number;
  NatureOfError: number;
  Priority: number;
  ErrorCount: number;
  DocumentNumber: string;
  VendorName: string;
  RootCauseAnalysis: string;
  MitigationPlan: string;
  ContigencyPlan: string;
  CC: any;
  Remark: string;
  Attachment?: CommentAttachment[] | [];
  Attachments?: CommentAttachment[] | [];
  Amount: number | null;
  DateOfTransaction: string | null;
  IsSolved?: boolean;
  isSolved?: boolean;
  DisableErrorLog?: boolean;
  IsHasErrorlogAddedByClient?: boolean;
  ErrorIdentificationDate: string;
  ResolutionStatus: number;
  IdentifiedBy: string | null;
}

export interface ReviewerNoteDetails {
  ReviewerId: number;
  ReviewerName: string;
  ProfileImage: string;
  ReviewedDateTime: string;
  Comment: string;
  Status: string;
  ReviewedDate: string;
}

export interface GetReviewerNoteList {
  ReviewedDate: string;
  Details: ReviewerNoteDetails[];
}

export interface AuditlogGetByWorkitem {
  UpdatedFieldsList: {
    Field: string;
    NewValue: string;
    OldValue: string;
  }[];
  UpdatedOn: string;
  UpdatedById: number;
  UpdatedBy: string;
}
