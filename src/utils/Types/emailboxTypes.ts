export interface EmailBoxProps {
  filteredData: any;
  searchValue: string;
  onDataFetch: (getData: () => void) => void;
  handleDrawerOpen?: () => void;
  getId?: (id: number, id1: number) => void;
  getTabData?: () => void;
  tagDropdown?: { label: string; value: string }[];
  getTagDropdownData?: () => void;
  hasFetched?: any;
}

export interface EmailBoxFilterProps {
  pageNo: number;
  pageSize: number;
  sortColumn: string;
  isDesc: boolean;
  GlobalSearch: string;
  ClientId: number | null;
  AssigneeId: number | null;
  TicketStatus: number | null;
  EmailTypeId: number | null;
  ReceivedFrom: string | null;
  ReceivedTo: string | null;
  Tags: number[] | null;
  TabType: number;
}

export interface EmailBoxListResponseList {
  Id: number;
  Subject: string;
  From: string;
  EmailType: number | null;
  AssignTo: number | null;
  Priority: number | null;
  Status: number | null;
  TagList: string[];
  AssignByName: string | null;
  OpenDate: string | null;
  ReceivedOn: string;
  TATEndON: string | null;
  DepartmentNames: string | null;
  ClientName: string | null;
  ClientId: number | null;
  MarkAsRead: boolean;
  Tag: string | null;
  AssignToName: string | null;
  EmailTypeName: string | null;
  StatusName: string | null;
  PriorityName: string | null;
  EmailTypeTAT: number | null;
  TotalTimeSpent: number | null;
}

export interface EmailBoxListResponse {
  List: EmailBoxListResponseList[] | [];
  TotalCount: number;
}
