import {
  generateCommonBodyRender,
  generateCommonBodyRenderPercentage,
  generateDateWithoutTime,
  generateInitialTimer,
} from "@/utils/datatable/CommonFunction";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { TablePagination, ThemeProvider } from "@mui/material";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import MUIDataTable from "mui-datatables";
import React, { useEffect, useState } from "react";
import { FieldsType } from "../types/FieldsType";
import { options } from "@/utils/datatable/TableOptions";
import ReportLoader from "@/components/common/ReportLoader";
import { callAPI } from "@/utils/API/callAPI";
import { WLTRProjectInitialParmas } from "@/utils/Types/reportTypes";

type WorkItem = {
  WorkItemId: number;
  ClientId: number;
  ClientName: string;
  ProjectId: number;
  ProjectName: string;
  ProcessId: number;
  ProcessName: string;
  SubProcessId: number;
  SubProcessName: string;
  TaskDate: string;
  Description: string | null;
  AssignTo: string;
  ReportingTo: string;
  STDTime: string;
  TotalTime: string;
  AutoTime: string;
  ManualTime: string;
  Comment: string | null;
  Quantity: number;
  Difference: number;
};

type WorkItemSummary = {
  TotalQuantity: number;
  TotalTime: string;
  TotalSTDTime: string;
  List: WorkItem[] | [];
  TotalCount: number;
};

interface Props {
  searchValue: string;
  filteredData: null | WLTRProjectInitialParmas;
  getTotalQuanitiy: (e: string | number | null) => void;
  getTotalTime: (e: string | null) => void;
  getTotalSTDTime: (e: string | null) => void;
}

const InitialFilter = {
  pageNo: 1,
  pageSize: 10,
  sortColumn: "",
  isDesc: true,
  GlobalSearch: "",
  ProjectId: null,
  StartDate: null,
  EndDate: null,
};

const WltrProjectReport = ({
  searchValue,
  filteredData,
  getTotalQuanitiy,
  getTotalTime,
  getTotalSTDTime,
}: Props) => {
  const [wltrFields, setWltrFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [wltrCurrentPage, setWltrCurrentPage] = useState<number>(0);
  const [wltrRowsPerPage, setWltrRowsPerPage] = useState<number>(10);
  const [Id, setID] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.href.includes("id=");
      if (pathname) {
        const idMatch = window.location.href.match(/id=([^?&]+)/);
        const id: number = idMatch ? Number(idMatch[1]) : 0;
        setID(id);
      }
    }
  }, []);

  const getData = async (arg1: WLTRProjectInitialParmas) => {
    setWltrFields({
      ...wltrFields,
      loaded: false,
    });

    const url = `${process.env.report_api_url}/report/getwltrprojectdetails`;

    const successCallback = (
      ResponseData: WorkItemSummary,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setWltrFields({
          ...wltrFields,
          loaded: true,
          data: ResponseData.List,
          dataCount: ResponseData.TotalCount,
        });
        getTotalQuanitiy(ResponseData.TotalQuantity);
        getTotalTime(ResponseData.TotalTime);
        getTotalSTDTime(ResponseData.TotalSTDTime);
      } else {
        setWltrFields({ ...wltrFields, data: [], dataCount: 0, loaded: true });
      }
    };

    callAPI(url, arg1, successCallback, "post");
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setWltrCurrentPage(newPage);
    if (filteredData !== null) {
      getData({
        ...filteredData,
        pageNo: newPage + 1,
        pageSize: wltrRowsPerPage,
        ProjectId: Id,
      });
    } else {
      getData({
        ...InitialFilter,
        pageNo: newPage + 1,
        pageSize: wltrRowsPerPage,
        ProjectId: Id,
      });
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setWltrCurrentPage(0);
    setWltrRowsPerPage(parseInt(event.target.value));

    if (filteredData !== null) {
      getData({
        ...filteredData,
        pageNo: 1,
        pageSize: Number(event.target.value),
        ProjectId: Id,
      });
    } else {
      getData({
        ...InitialFilter,
        pageNo: 1,
        pageSize: Number(event.target.value),
        ProjectId: Id,
      });
    }
  };

  useEffect(() => {
    if (filteredData !== null && Id > 0) {
      const timer = setTimeout(() => {
        getData({ ...filteredData, GlobalSearch: searchValue, ProjectId: Id });
        setWltrCurrentPage(0);
        setWltrRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...InitialFilter, GlobalSearch: searchValue, ProjectId: Id });
        setWltrCurrentPage(0);
        setWltrRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue, Id]);

  const reportsWLTRColConfig = [
    {
      header: "ClientName",
      label: "Client Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "ProjectName",
      label: "Project Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "TaskDate",
      label: "Task Date",
      bodyRenderer: generateDateWithoutTime,
    },
    {
      header: "ProcessName",
      label: "Process",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "SubProcessName",
      label: "Sub-Process",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "Description",
      label: "Description",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "AssignTo",
      label: "Assign To",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "ReportingTo",
      label: "Reporting To",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "Quantity",
      label: "QTY.",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "STDTime",
      label: "STD Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      header: "AutoTime",
      label: "Auto Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      header: "ManualTime",
      label: "Manual Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      header: "TotalTime",
      label: "Total Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      header: "Difference",
      label: "Difference %",
      bodyRenderer: generateCommonBodyRenderPercentage,
    },
    {
      header: "Comment",
      label: "Comments",
      bodyRenderer: generateCommonBodyRender,
    },
  ];

  const reportsWLTRCols: any = reportsWLTRColConfig.map((col: any) =>
    generateCustomColumn(col.header, col.label, col.bodyRenderer)
  );

  return wltrFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        columns={reportsWLTRCols}
        data={wltrFields.data}
        title={undefined}
        options={{
          ...options,
          tableBodyHeight: "72vh",
        }}
      />
      <TablePagination
        component="div"
        count={wltrFields.dataCount}
        page={wltrCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={wltrRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default WltrProjectReport;
