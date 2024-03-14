export interface LabelValue {
  label: string;
  value: number;
}

export interface LabelValueType {
  Type: number | string;
  label: string;
  value: number;
}

export interface KeyValueColorCode {
  ColorCode: string;
  Key: string;
  Value: number;
}

export interface LabelValueTypeIsDefault {
  Type: number;
  IsDefault: boolean;
  label: string;
  value: number;
}

export interface AppliedFilterWorklogs {
  ClientId: number | null;
  TypeOfWork: number | null;
  ProjectId: number | null;
  StatusId: number | null;
  AssignedTo: number | null;
  AssignedBy: number | null;
  DueDate: string | null;
  StartDate: string | null;
  EndDate: string | null;
  ReviewStatus: number | null;
}

export interface FilterWorklogs {
  FilterId: number;
  Name: string;
  AppliedFilter: AppliedFilterWorklogs;
}

export interface AppliedFilterApprovals {
  ClientId: number | null;
  TypeOfWork: number | null;
  userId: number | null;
  ProjectId: number | null;
  ProcessId: number | null;
  StatusId: number | null;
  dueDate: string | null;
  startDate: string | null;
  endDate: string | null;
  DateFilter: string | null;
}

export interface AppliedFilterApprovalsPage {
  PageNo: number | null;
  PageSize: number | null;
}

export interface ActionList {
  PermisisonActionId: number;
  ActionId: number;
  ActionName: string;
  IsChecked: boolean;
}

export interface MenuItem {
  Childrens: MenuItem[];
  Id: number;
  Name: string;
  ParentId: number;
  Sequence: number;
  ActionList: ActionList[];
  Route: string;
  Icon: string;
}

export interface Organization {
  ClientModuleName: string;
  ProjectModuleName: string;
  ProcessModuleName: string;
  SubProcessModuleName: string;
  IsFavourite: boolean;
  OrganizationId: number;
  OrganizationName: string;
  Token: string;
}

export interface User {
  UserId: number;
  Email: string;
  FirstName: string;
  LastName: string;
  RoleId: number;
  ProfileImage: string;
  IsClientUser: boolean;
  IsAdmin: boolean;
  Organizations: Organization[];
  Menu: MenuItem[];
  IsHaveManageAssignee: boolean;
  RoleName: string;
  ClientId: number | null;
}
