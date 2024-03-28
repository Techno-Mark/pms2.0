import { ThemeProvider } from "@emotion/react";
import MUIDataTable from "mui-datatables";
import React, { useEffect, useState } from "react";
import TablePagination from "@mui/material/TablePagination";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { callAPI } from "@/utils/API/callAPI";
import { report_Options } from "@/utils/datatable/TableOptions";
import { reportDatatableTaskCols } from "@/utils/datatable/columns/ReportsDatatableColumns";
import ReportLoader from "../common/ReportLoader";
import { ClientReportProps } from "@/utils/Types/reports";

interface List {
  WorkItemId: number;
  TaskName: string;
  ProjectId: number;
  ProjectName: string;
  ProcessId: number;
  ProcessName: string;
  workTypeId: number;
  Type: string;
  Priority: string | null;
  StatusId: number;
  Status: string;
  ColorCode: string;
  AssignedToId: number;
  AssignedTo: string;
  HoursLogged: string | null;
  StartDate: string;
  DueDate: string;
}

interface Response {
  List: List[];
  TotalCount: number;
}

const pageNoReportTask = 1;
const pageSizeReportTask = 10;

const initialReportTaskFilter = {
  PageNo: pageNoReportTask,
  PageSize: pageSizeReportTask,
  GlobalSearch: null,
  IsDesc: true,
  SortColumn: null,
  Priority: null,
  StatusFilter: null,
  OverDueBy: 1,
  WorkType: null,
  AssignedIdsForFilter: [],
  ProjectIdsForFilter: [],
  StartDate: null,
  EndDate: null,
  IsDownload: false,
};

const Datatable_Task = ({
  currentFilterData,
  searchValue,
  onHandleExport,
}: ClientReportProps) => {
  const [allReportTaskFields, setAllReportTaskFields] = useState<{
    loaded: boolean;
    taskData: List[] | [];
    page: number;
    rowsPerPage: number;
    tableDataCount: number;
  }>({
    loaded: true,
    taskData: [],
    page: 0,
    rowsPerPage: pageSizeReportTask,
    tableDataCount: 0,
  });
  const [filteredObjectReportTask, setFilteredOjectReportTask] = useState(
    initialReportTaskFilter
  );

  const handleChangePageReportTask = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setAllReportTaskFields({
      ...allReportTaskFields,
      page: newPage,
    });
    setFilteredOjectReportTask({
      ...filteredObjectReportTask,
      PageNo: newPage + 1,
    });
  };

  const handleChangeRowsPerPageReportTask = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAllReportTaskFields({
      ...allReportTaskFields,
      page: 0,
      rowsPerPage: parseInt(event.target.value),
    });
    setFilteredOjectReportTask({
      ...filteredObjectReportTask,
      PageNo: 1,
      PageSize: Number(event.target.value),
    });
  };

  const getReportTaskList = async () => {
    setAllReportTaskFields({
      ...allReportTaskFields,
      loaded: false,
    });
    const params = filteredObjectReportTask;
    const url = `${process.env.report_api_url}/report/client/task`;
    const successCallback = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0);
        setAllReportTaskFields({
          ...allReportTaskFields,
          loaded: true,
          taskData: ResponseData.List,
          tableDataCount: ResponseData.TotalCount,
        });
      } else {
        setAllReportTaskFields({
          ...allReportTaskFields,
          loaded: true,
        });
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    setFilteredOjectReportTask({
      ...filteredObjectReportTask,
      ...currentFilterData,
      GlobalSearch: searchValue,
    });
  }, [currentFilterData, searchValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      getReportTaskList();
    }, 500);
    return () => clearTimeout(timer);
  }, [filteredObjectReportTask]);

  return allReportTaskFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        data={allReportTaskFields.taskData}
        columns={reportDatatableTaskCols}
        title={undefined}
        options={{
          ...report_Options,
        }}
        data-tableid="task_Report_Datatable"
      />
      <TablePagination
        component="div"
        count={allReportTaskFields.tableDataCount}
        page={allReportTaskFields.page}
        onPageChange={handleChangePageReportTask}
        rowsPerPage={allReportTaskFields.rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPageReportTask}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default Datatable_Task;
