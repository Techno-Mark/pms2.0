import MUIDataTable from "mui-datatables";
import { useEffect, useState } from "react";
import { callAPI } from "@/utils/API/callAPI";
import { FieldsType } from "../types/FieldsType";
import { options } from "@/utils/datatable/TableOptions";
import ReportLoader from "@/components/common/ReportLoader";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { TablePagination, ThemeProvider } from "@mui/material";
import { client_project_InitialFilter } from "@/utils/reports/getFilters";
import { reportsProjectsCols } from "@/utils/datatable/columns/ReportsDatatableColumns";
import { ReportProps } from "@/utils/Types/reports";

interface FilteredData {
  pageNo: number;
  pageSize: number;
  sortColumn: string;
  isDesc: boolean;
  globalSearch: string;
  typeOfWork: string | null;
  billType: string | null;
  clients: any[] | [];
  projects: any[] | [];
  department: string | null;
  isActive: boolean;
  showSubProject: boolean | null;
  isClientReport: boolean | null;
  isDownload: boolean;
  startDate: string | null;
  endDate: string | null;
}

interface Response {
  ProjectReportFilters: any | null;
  List:
    | {
        ProjectId: number;
        ProjectName: string;
        SubProjectId: number | null;
        SubProjectName: string | null;
        ClientId: number;
        ClientName: string;
        BillingType: string | null;
        WorkType: string;
        InternalHours: string | null;
        WorkItemId: number | null;
        StandardTime: string | null;
        TotalTime: string | null;
        EditHours: string | null;
        DifferenceTime: string | null;
      }[]
    | [];
  TotalCount: number;
}

const project_InitialFilter = {
  ...client_project_InitialFilter,
  isClientReport: false,
};

const ProjectReport = ({
  filteredData,
  searchValue,
  onHandleExport,
}: ReportProps) => {
  const [projectFields, setProjectFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [projectCurrentPage, setProjectCurrentPage] = useState<number>(0);
  const [projectRowsPerPage, setProjectRowsPerPage] = useState<number>(10);

  const getData = async (arg1: FilteredData) => {
    setProjectFields({
      ...projectFields,
      loaded: false,
    });
    const url = `${process.env.report_api_url}/report/project`;

    const successCallback = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0);
        setProjectFields({
          ...projectFields,
          loaded: true,
          data: ResponseData.List,
          dataCount: ResponseData.TotalCount,
        });
      } else {
        setProjectFields({ ...projectFields, loaded: true });
      }
    };

    callAPI(url, arg1, successCallback, "post");
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setProjectCurrentPage(newPage);
    if (filteredData !== null) {
      getData({
        ...filteredData,
        pageNo: newPage + 1,
        pageSize: projectRowsPerPage,
      });
    } else {
      getData({
        ...project_InitialFilter,
        pageNo: newPage + 1,
        pageSize: projectRowsPerPage,
      });
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProjectCurrentPage(0);
    setProjectRowsPerPage(parseInt(event.target.value));

    if (filteredData !== null) {
      getData({
        ...filteredData,
        pageNo: 1,
        pageSize: projectRowsPerPage,
      });
    } else {
      getData({
        ...project_InitialFilter,
        pageNo: 1,
        pageSize: event.target.value,
      });
    }
  };

  useEffect(() => {
    if (filteredData !== null) {
      const timer = setTimeout(() => {
        getData({ ...filteredData, globalSearch: searchValue });
        setProjectCurrentPage(0);
        setProjectRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...project_InitialFilter, globalSearch: searchValue });
        setProjectCurrentPage(0);
        setProjectRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  return projectFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        columns={reportsProjectsCols}
        data={projectFields.data}
        title={undefined}
        options={{ ...options, tableBodyHeight: "73vh" }}
      />
      <TablePagination
        component="div"
        count={projectFields.dataCount}
        page={projectCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={projectRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default ProjectReport;
