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
