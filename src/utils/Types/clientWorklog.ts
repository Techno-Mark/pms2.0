export interface InitialFilter {
  PageNo: number;
  PageSize: number;
  SortColumn: string;
  IsDesc: boolean;
  GlobalSearch: string;
  ProjectIds: number[] | null;
  OverdueBy: string | number | null;
  PriorityId: number | null;
  StatusId: number | null;
  WorkTypeId: number | null;
  AssignedTo: number | null;
  StartDate: string | null;
  EndDate: string | null;
  DueDate: string | null;
  IsCreatedByClient: boolean | null;
  IsCompletedTaskPage: boolean;
  IsSignedOff: boolean;
}

export interface TaskFilter {
  ProjectIds: number[] | null;
  PriorityId: number | null;
  StatusId: number | null;
  WorkTypeId: number | null;
  StartDate: string | null;
  EndDate: string | null;
  DueDate: string | null;
  AssignedTo: number | null;
  OverdueBy: number | null;
  IsSignedOff: boolean;
}

export interface DatatableWorklogProps {
  onEdit: (rowData: number) => void;
  onDrawerOpen: () => void;
  onDataFetch: (getData: () => void) => void;
  onComment: (rowData: boolean, selectedId: number) => void;
  onErrorLog: (rowData: boolean, selectedId: number) => void;
  currentFilterData: TaskFilter | [];
  searchValue: string;
  onCloseDrawer: boolean;
}

export interface GetFields {
  FieldId: number;
  DisplayName: string;
  IsChecked: boolean;
  Type: string;
}

export interface DatatableWorklog {
  WorkitemId: number;
  ProjectId: number | null;
  ProjectName: string | null;
  TaskName: string;
  WorkTypeId: number;
  AssignedToId: number | null;
  AssignedToName: string | null;
  PriorityId: number | null;
  PriorityName: string | null;
  StatusId: number | null;
  StatusName: string | null;
  StatusColorCode: string | null;
  StartDate: string | null;
  EndDate: string | null;
  Quantity: number | null;
  IsCreatedByClient: boolean;
}

export interface ClientWorkitemGetById {
  TaskName: string;
  ClientId: number;
  WorkTypeId: number;
  ProjectId: number | null;
  ProcessId: number | null;
  SubProcessId: number | null;
  StatusId: number | null;
  Priority: number | null;
  Quantity: number | null;
  Description: string | null;
  ReceiverDate: string | null;
  DueDate: string | null;
  ReviewerDate: string | null;
  PreparationDate: string | null;
  AssignedId: number | null;
  ReviewerId: number | null;
  TaxReturnType: string | null;
  TypeOfReturnId: number | null;
  TaxCustomFields: {
    ReturnYear: number | null;
    Complexity: string | null;
    CountYear: number | null;
    NoOfPages: number | null;
  } | null;
  IsManual: boolean | null;
  AllInfoDate: string | null;
  ChecklistWorkpaper: string | null;
  ManagerId: number | null;
  DepartmentId: number | null;
  IsCreatedByClient: boolean;
  CreatedById: number;
  CreatedByName: string;
  IsHasErrorlog: boolean;
  IsHasErrorlogAddedByClient: boolean;
  ErrorlogSignedOffPending: boolean;
  WorkItemId: number;
}
