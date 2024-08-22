import { LabelValue, MenuItem } from "./types";

export interface SettingProps {
  onOpen: (() => void) | undefined;
  onEdit: (rowId: number) => void;
  onDataFetch: (getData: () => void) => void;
  getOrgDetailsFunction: (() => void) | null;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canProcess?: boolean;
  canPermission?: boolean;
  onSearchData: string;
  onSearchClear: () => void;
  onHandleExport: (arg1: boolean) => void;
  currentFilterData?: StatusInitialFilter;
}

export interface SettingAction {
  actions: string[];
  id: number;
}

// Client
export interface ClientInitialFilter {
  GlobalSearch: string;
  SortColumn: string | null;
  IsDesc: boolean;
  PageNo: number;
  PageSize: number;
}

export interface ClientList {
  Id: number;
  Name: string;
  Email: string;
  ContactNo: string;
  Address: string;
  Department: string;
  IsActive: boolean;
  StateName: string | null;
  WorkTypes: ClientWorkType[];
  OwnerAndCPAName: string | null;
  OwnerEmail: string | null;
  OwnerPhone: string | null;
  City: string | null;
  StateId: number | null;
  Zip: string | null;
  ClientPOCInformation: any[];
  ClientITPOCName: string | null;
  ClientITPOCEmail: string | null;
  PABSPOCName: string | null;
  PABSBDM: string | null;
  PABSManagerAssigned: string | null;
  GroupMail: string | null;
  SOPStatus: string | null;
  DateOfImplementation: string | null;
  AgreementStartDate: string | null;
  FTEAgreementTax: string | null;
  EstimatedWorkflow: string | null;
  VPNRequirement: string | null;
  RemoteSystemAccess: string | null;
  TaxPreparationSoftware: string | null;
  DocumentPortal: string | null;
  WorkflowTracker: string | null;
  CommunicationChannel: string | null;
  RecurringCall: string | null;
  SpecificAdditionalProcessSteps: string | null;
  ClientTimeZone: string | null;
  NoOfLogins: number | null;
}

export interface ClientWorkType {
  WorkTypeId: number;
  WorkTypeName: string;
  BillingTypeName: string;
  InternalHrs: number;
  ContractHrs: number;
}

//Project
export interface ProjectInitialFilter {
  GlobalSearch: string;
  PageNo: number;
  PageSize: number;
  ClientId: null;
  ProjectId: null;
  IsActive: null;
  SortColumn: null;
  IsDesc: boolean;
}

export interface ProjectList {
  ClientId: number;
  ClientName: string;
  ProjectName: string;
  WorkType: string;
  IsActive: boolean;
  SubProject: [];
  ProjectId: number;
}

//User
export interface UserInitialFilter {
  UserId: number;
  GlobalSearch: string;
  SortColumn: null;
  IsDesc: boolean;
  PageNo: number;
  PageSize: number;
  Status: number | null;
  WorkTypeId: number | null;
}

export interface UserList {
  UserId: number;
  FirstName: string;
  LastName: string;
  FullName: string;
  Email: string;
  UserType: string;
  RoleName: string;
  DepartmentName: string;
  WorkTypeName: string;
  ContactNo: string;
  IsActive: boolean;
  RMUserName: string;
  GroupNames: string[];
  RoleId: number;
  IsConfirmed: boolean;
}

//Process
export interface ProcessInitialFilter {
  GlobalFilter: null;
  GlobalSearch: string;
  PageNo: number;
  PageSize: number;
  SortColumn: string;
  IsDesc: number;
  IsBillable: null;
  IsProductive: null;
  WorkTypeFilter: null;
  DepartmentId: null;
}

export interface ProcessList {
  ParentProcessName: string;
  ChildProcessName: string;
  ActivityList: string[];
  EstimatedHour: number;
  IsProductive: boolean;
  IsBillable: boolean;
  ReturnType: number;
  ReturnTypeName: string | null;
  ParentId: number;
  WorkTypeId: number;
  WorkTypeName: string;
  DepartmentId: string;
  DepartmentName: string;
  ProcessId: number;
}

//Group
export interface GroupProps {
  onOpen: (() => void) | undefined;
  onEdit: (rowId: number) => void;
  onDataFetch: (getData: () => void) => void;
  getOrgDetailsFunction: (() => void) | null;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onSearchData: string;
  onSearchClear: () => void;
  onHandleExport: (arg1: boolean) => void;
}

export interface GroupInitialFilter {
  UserId: number;
  GlobalSearch: string;
  SortColumn: string | null;
  IsDesc: boolean;
  PageNo: number;
  PageSize: number;
  Status: boolean;
}

export interface GroupList {
  Id: number;
  Name: string;
  GroupListUsers: { Id: number; Name: string }[];
  Status: string;
}

//Status
export interface StatusInitialFilter {
  PageNo: number;
  PageSize: number;
  SortColumn: string | undefined;
  IsDec: boolean;
  globalFilter: null;
  IsDefault: null;
  Type: string | undefined;
  Export: boolean;
  GlobalSearch: string;
  WorkTypeId: number | null;
}

export interface StatusList {
  IsDefault: boolean;
  Name: string;
  ColorCode: string;
  Type: string;
  WorkTypeDetails: StatusDetail[];
  StatusId: number;
}

export interface StatusDetail {
  WorkTypeId: number;
  WorkTypeName: string;
  DisplayName: string;
}

//Permission
export interface PermissionsProps {
  onOpen: (() => void) | undefined;
  permissionValue: number;
  permissionValueType: number;
  getOrgDetailsFunction: (() => void) | null;
  canView: boolean;
  canEdit: boolean;
  sendDataToParent: (data: MenuItem[]) => void;
  expanded: boolean;
  loading: boolean;
}

export interface PermissionsAction {
  PermisisonActionId: number;
  ActionId: number;
  ActionName: string;
  IsChecked: boolean;
}

export interface PermissionsMenuItem {
  Children: MenuItem[];
  Id: number;
  Name: string;
  ParentId: number;
  Sequence: number;
  ActionList: PermissionsAction[];
}

//Notification
export interface NotificationProps {
  onOpen: (() => void) | undefined;
  departmentValue: number;
  canView: boolean;
  saveDepartmentData: boolean;
  setSaveDepartmentData: any;
}

//Org
export interface OrgProps {
  onOpen: (() => void) | undefined;
  onEdit: (rowId: number) => void;
  onDataFetch: (getData: () => void) => void;
  onSearchData: string;
  onSearchClear: () => void;
  onHandleExport: (arg1: boolean) => void;
}

export interface OrgList {
  OrganizationName: string;
  IsActive: boolean;
  OrganizationId: number;
}

//Drawer
export interface DrawerProps {
  onOpen: boolean;
  onClose: () => void;
  tab: string;
  onEdit: number;
  onUserDataFetch: (() => void) | null;
  onDataFetch: (() => void) | null;
  getPermissionDropdown: () => void;
  getOrgDetailsFunction: (() => void) | null;
}

export interface UserPermissionDrawer {
  onOpen: boolean;
  onClose: () => void;
  userId: number;
  roleId: number;
  userType: string | null;
}

//Client Drawer
export interface DepartmentDataObj {
  id: number;
  apiId: number;
  index: number;
  label: string;
  checkbox: boolean;
  isOpen: boolean;
  billingType: number;
  billingErr: boolean;
  group: LabelValue[];
  groupErr: boolean;
  selectGroupValue: number[];
  contHrs: number | string;
  contHrsErr: boolean;
  actHrs: number | string;
  actHrsErr: boolean;
  allFields: boolean;
}

//Project
export interface ProjectGetByIdList {
  ClientId: number;
  ClientName: string;
  ProjectName: string;
  SubProjectId: number;
  SubProjectName: string;
  WorkTypeIds: number[];
  IsActive: boolean;
  ProjectId: number;
  RequestedBy: number | null;
  DateOfCreation: string;
}

//Process
export interface ProcessGetByIdList {
  Name: string;
  ActivityList: string[];
  EstimatedHour: number;
  IsProductive: boolean;
  IsBillable: boolean;
  ReturnType: number;
  ReturnTypeName: string | null;
  ParentId: number;
  WorkTypeId: number;
  DepartmentId: number;
  ProcessId: number;
  RequestedBy: number | null;
  MapAllClients: boolean;
  DateOfCreation: string;
}

//Group
export interface GroupGetByIdList {
  Id: number;
  Name: string;
  GroupUserIds: number[];
  Status: number | string;
  DateOfCreation: string;
}

//Status
export interface StatusDisplayName {
  WorkTypeId: number;
  WorkTypeName: string;
  DisplayName: string;
}

export interface StatusGetById {
  IsDefault: boolean;
  Name: string;
  ColorCode: string;
  Type: string;
  WorkTypeDetails: StatusDisplayName[];
  StatusId: number;
  DateOfCreation: string;
}

//Org
export interface OrgGetByIdList {
  OrganizationId: number;
  OrganizationName: string;
  ClientModuleName: string;
  ProjectModuleName: string;
  ProcessModuleName: string;
  SubProcessModuleName: string;
  DateOfCreation: string;
}
