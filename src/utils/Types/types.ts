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

export interface KeyValueColorCodeSequence {
  ColorCode: string;
  Key: string;
  Value: number;
  Sequence: number;
}

export interface KeyValueColorCodeSequenceStatusId {
  ColorCode: string;
  Key: string;
  Value: number;
  Sequence: number;
  StatusId: number;
}

export interface LabelValueTypeIsDefault {
  Type: number;
  IsDefault: boolean;
  label: string;
  value: number;
}

export interface LabelValueProfileImage {
  ProfileImage: string;
  label: string;
  value: number;
}

export interface IdNameEstimatedHour {
  Id: number;
  Name: string;
  EstimatedHour: number | string;
}

export interface AppliedFilterApprovals {
  ClientId: number | null;
  TypeOfWork: number | null;
  userId: number | null;
  ProjectId: number | null;
  ProcessId: number | null;
  StatusId: number | null;
  DateFilter: string | null | undefined;
  dueDate: string | null | undefined;
  startDate: string | null | undefined;
  endDate: string | null | undefined;
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
