export interface ReportProps {
  filteredData: any;
  searchValue: string;
  onHandleExport: (arg1: boolean) => void;
}

export interface ClientReportProps {
  currentFilterData: any;
  searchValue: string;
  onHandleExport: (arg1: boolean) => void;
}

export interface ClientFilterOptions {
  ProjectIdsForFilter: number[] | [];
  WorkType: number | null;
  Priority: number | null;
  DueDate: string | null;
  StartDate: string | null;
  EndDate: string | null;
}
