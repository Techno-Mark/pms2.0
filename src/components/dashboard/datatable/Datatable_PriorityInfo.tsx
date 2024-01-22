import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import { ThemeProvider } from "@mui/material/styles";
import TablePagination from "@mui/material/TablePagination";
import {
  handleChangePage,
  handleChangeRowsPerPage,
} from "@/utils/datatable/CommonFunction";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { dashboard_Options } from "@/utils/datatable/TableOptions";
import { dashboardPriorityReturnTaskInfoCols } from "@/utils/datatable/columns/ClientDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";

interface PriorityInfoProps {
  onSelectedProjectIds: number[];
  onSelectedPriorityId: number;
}

const Datatable_PriorityInfo: React.FC<PriorityInfoProps> = ({
  onSelectedProjectIds,
  onSelectedPriorityId,
}) => {
  const [data, setData] = useState<any | any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);

  useEffect(() => {
    const getData = () => {
      const params = {
        PageNo: page + 1,
        PageSize: rowsPerPage,
        SortColumn: null,
        IsDesc: true,
        projectIds: onSelectedProjectIds,
        typeOfWork: null,
        priorityId: onSelectedPriorityId,
        statusId: null,
        ReturnTypeId: null,
      };
      const url = `${process.env.report_api_url}/clientdashboard/taskstatusandprioritylist`;
      const successCallback = (
        ResponseData: any,
        error: any,
        ResponseStatus: any
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setData(ResponseData.List);
          setTableDataCount(ResponseData.TotalCount);
        }
      };
      callAPI(url, params, successCallback, "POST");
    };

    getData();
  }, [onSelectedProjectIds, onSelectedPriorityId, page, rowsPerPage]);

  return (
    <div>
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={data}
          columns={dashboardPriorityReturnTaskInfoCols}
          title={undefined}
          options={dashboard_Options}
          data-tableid="priorityInfo_Datatable"
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

export default Datatable_PriorityInfo;
