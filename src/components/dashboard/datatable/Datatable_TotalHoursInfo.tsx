import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import { ThemeProvider } from "@mui/material/styles";
import TablePagination from "@mui/material/TablePagination";
import {
  generateCustomHeaderName,
  generateCommonBodyRender,
  handleChangePage,
  handleChangeRowsPerPage,
} from "@/utils/datatable/CommonFunction";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { dashboard_Options } from "@/utils/datatable/TableOptions";
import { callAPI } from "@/utils/API/callAPI";

interface TotalHoursInfoProps {
  onSelectedProjectIds: number[];
  onSelectedWorkType: number;
}

interface ClientDetail {
  ClientName: string;
  ContractedAccountingHrs: number;
  ContractedAuditHrs: number;
  ContractedTaxHrs: number;
  ContractedTotalHours: number;
  ActualAccountingHrs: number;
  ActualAuditHrs: number;
  ActualTaxHrs: number;
  ActualTotalHours: number;
}

interface List {
  ProjectName: string;
  TaskName: string;
  ActualAccountingHrs: number | null;
  ActualAuditHrs: number | null;
  ActualTaxHrs: number | null;
}

const Datatable_TotalHoursInfo = ({
  onSelectedProjectIds,
  onSelectedWorkType,
}: TotalHoursInfoProps) => {
  const [clientDetails, setClientDetails] = useState<ClientDetail | null>(null);
  const [clientProjectDetails, setClientProjectDetails] = useState<List[] | []>(
    []
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);

  useEffect(() => {
    const getData = () => {
      const params = {
        PageNo: page + 1,
        PageSize: rowsPerPage,
        SortColumn: "",
        IsDesc: true,
        projectIds: onSelectedProjectIds,
        typeOfWork: onSelectedWorkType === 0 ? null : onSelectedWorkType,
      };
      const url = `${process.env.report_api_url}/clientdashboard/clienttotalhoursinformationlist`;
      const successCallback = (
        ResponseData: {
          ClientDetail: ClientDetail;
          List: List[];
          TotalCount: number;
        },
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setClientDetails(ResponseData.ClientDetail);
          setClientProjectDetails(ResponseData.List);
          setTableDataCount(ResponseData.TotalCount);
        }
      };
      callAPI(url, params, successCallback, "POST");
    };

    const fetchData = async () => {
      getData();
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [onSelectedProjectIds, onSelectedWorkType, page, rowsPerPage]);

  const tableData = [];

  if (clientDetails !== null) {
    tableData.push({
      ProjectName: <span className="font-extrabold">Project List</span>,
      TaskName: <span className="font-extrabold">Task List</span>,
      ContractedTotalHours: clientDetails.ContractedTotalHours || "-",
      ContractedAccountingHrs: clientDetails.ContractedAccountingHrs || "-",
      ContractedAuditHrs: clientDetails.ContractedAuditHrs || "-",
      ContractedTaxHrs: clientDetails.ContractedTaxHrs || "-",
      ActualAccountingHrs: clientDetails.ActualAccountingHrs || null,
      ActualAuditHrs: clientDetails.ActualAuditHrs || null,
      ActualTaxHrs: clientDetails.ActualTaxHrs || null,
      ActualTotalHours: clientDetails.ActualTotalHours || "-",
    });
  }

  if (clientProjectDetails && clientProjectDetails.length > 0) {
    clientProjectDetails.forEach((project: any) => {
      tableData.push({
        ProjectName: project.ProjectName || null,
        TaskName: project.TaskName || null,
        ContractedTotalHours: project.ContractedTotalHours || null,
        ContractedAccountingHrs: project.ContractedAccountingHrs || null,
        ContractedAuditHrs: project.ContractedAccountingHrs || null,
        ContractedTaxHrs: project.ContractedTaxHrs || null,
        ActualAccountingHrs: project.ActualAccountingHrs || null,
        ActualTaxHrs: project.ActualTaxHrs || null,
        ActualAuditHrs: project.ActualAuditHrs || null,
      });
    });
  }

  const columnNames = [
    "ProjectName",
    "TaskName",
    "ContractedTotalHours",
    "ContractedAccountingHrs",
    "ContractedTaxHrs",
    "ContractedAuditHrs",
    "ActualAccountingHrs",
    "ActualTaxHrs",
    "ActualAuditHrs",
    "ActualTotalHours",
  ];

  const columns = columnNames.map((columnName) => {
    const displayCondition = (type: number) =>
      onSelectedWorkType === 0 || onSelectedWorkType === type;

    const options = {
      filter: true,
      sort: true,
      customBodyRender: (value: any) => generateCommonBodyRender(value),
    };

    switch (columnName) {
      case "ProjectName":
        return {
          name: columnName,
          options: {
            ...options,
            customHeadLabelRender: () =>
              generateCustomHeaderName("Project Name"),
          },
        };
      case "TaskName":
        return {
          name: columnName,
          options: {
            ...options,
            customHeadLabelRender: () => generateCustomHeaderName("Task Name"),
          },
        };
      case "ContractedTotalHours":
      case "ActualTotalHours":
        return {
          name: columnName,
          options: {
            ...options,
            customHeadLabelRender: () =>
              generateCustomHeaderName(
                `Total ${
                  columnName === "ContractedTotalHours" ? "Cont. " : ""
                }Hours`
              ),
          },
        };
      default:
        return {
          name: columnName,
          options: {
            ...options,
            display: displayCondition(
              columnName.includes("Accounting")
                ? 1
                : columnName.includes("Tax")
                ? 3
                : columnName.includes("Audit")
                ? 2
                : 0
            ),
            customHeadLabelRender: () =>
              generateCustomHeaderName(
                `${
                  columnName.includes("Contracted") ? "Cont. " : ""
                }${columnName.replace("Actual", "")}`
              ),
          },
        };
    }
  });

  return (
    <div>
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={tableData}
          columns={columns}
          title={undefined}
          options={{ ...dashboard_Options, tableBodyHeight: "55vh" }}
          data-tableid="totalHoursInfo_Datatable"
        />
        <TablePagination
          component="div"
          count={tableDataCount}
          page={page}
          onPageChange={(event: any, newPage) => {
            handleChangePage(event, newPage, setPage);
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => {
            handleChangeRowsPerPage(event, setRowsPerPage, setPage);
          }}
        />
      </ThemeProvider>
    </div>
  );
};

export default Datatable_TotalHoursInfo;
