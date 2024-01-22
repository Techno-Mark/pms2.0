import { toast } from "react-toastify";
import {
  generateCustomHeaderName,
  generateCommonBodyRender,
  generateInitialTimer,
  generateDateWithoutTime,
} from "@/utils/datatable/CommonFunction";
import MUIDataTable from "mui-datatables";
import { callAPI } from "@/utils/API/callAPI";
import { FieldsType } from "../types/FieldsType";
import React, { useEffect, useState } from "react";
import LineIcon from "@/assets/icons/reports/LineIcon";
import { options } from "@/utils/datatable/TableOptions";
import CloseIcon from "@/assets/icons/reports/CloseIcon";
import ReportLoader from "@/components/common/ReportLoader";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { workLoad_InitialFilter } from "@/utils/reports/getFilters";
import { Popover, TablePagination, ThemeProvider } from "@mui/material";

const Workload = ({ filteredData, searchValue, onHandleExport }: any) => {
  const workloadAnchorElFilter: HTMLButtonElement | null = null;
  const openWorkloadFilter = Boolean(workloadAnchorElFilter);
  const workloadIdFilter = openWorkloadFilter ? "simple-popover" : undefined;

  const [isWorkloadExpanded, setIsWorkloadExpanded] = useState<boolean>(false);
  const [clickedWorkloadRowId, setClickedWorkloadRowId] = useState<number>(-1);

  const [workloadCurrentPage, setWorkloadCurrentPage] = useState<number>(0);
  const [workloadRowsPerPage, setWorkloadRowsPerPage] = useState<number>(10);
  const [workloadFields, setWorkloadFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });

  const getData = async (arg1: any) => {
    setWorkloadFields({
      ...workloadFields,
      loaded: false,
    });
    const url = `${process.env.report_api_url}/report/workLoad`;

    const successCallBack = (data: any, error: any) => {
      if (data !== null && error === false) {
        onHandleExport(data.List.length > 0);
        setWorkloadFields({
          ...workloadFields,
          loaded: true,
          data: data.List,
          dataCount: data.TotalCount,
        });
      } else {
        setWorkloadFields({ ...workloadFields, loaded: true });
      }
    };

    callAPI(url, arg1, successCallBack, "post");
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setWorkloadCurrentPage(newPage);
    getData({
      ...filteredData,
      pageNo: newPage + 1,
      pageSize: workloadRowsPerPage,
    });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setWorkloadCurrentPage(0);
    setWorkloadRowsPerPage(parseInt(event.target.value));

    getData({
      ...filteredData,
      pageNo: 1,
      pageSize: event.target.value,
    });
  };

  useEffect(() => {
    if (filteredData !== null) {
      const timer = setTimeout(() => {
        getData({ ...filteredData, globalSearch: searchValue });
        setWorkloadCurrentPage(0);
        setWorkloadRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...workLoad_InitialFilter, globalSearch: searchValue });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  const generateUserNameBodyRender = (bodyValue: any, TableMeta: any) => {
    return (
      <div
        className="flex flex-col cursor-pointer"
        onClick={
          workloadFields.data[TableMeta.rowIndex].workLoadWorkItemData.length >
          0
            ? () => {
                setIsWorkloadExpanded(true);
                setClickedWorkloadRowId(TableMeta.rowIndex);
              }
            : () => {
                toast.error("There is no workitem data available!");
              }
        }
      >
        {bodyValue === null || "" ? (
          "-"
        ) : (
          <>
            <span>{bodyValue}</span>
            <span>
              {workloadFields.data[TableMeta.rowIndex].DepartmentName}
            </span>
          </>
        )}
      </div>
    );
  };

  const columns: any[] = [
    {
      name: "UserName",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("User Name"),
        customBodyRender: (value: any, tableMeta: any) => {
          return generateUserNameBodyRender(value, tableMeta);
        },
      },
    },
    {
      name: "ReportingManager",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Reporting To"),
      },
    },
    {
      name: "RoleType",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Designation"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "TotalStandardTime",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Std. Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "TotalTime",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Total Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "TotalCount",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Qty."),
      },
    },
  ];

  const expandableColumns: any[] = [
    {
      name: "CreatedDate",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Created Date"),
        customBodyRender: (value: any) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "ClientName",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Client Name"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "ProjectName",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Project"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "ProcessName",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Task/Process"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "EstimateTime",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Est. Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
  ];

  return workloadFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        title={undefined}
        columns={columns}
        data={workloadFields.data}
        options={options}
      />
      <TablePagination
        component="div"
        count={workloadFields.dataCount}
        page={workloadCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={workloadRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Popover
        id={workloadIdFilter}
        open={isWorkloadExpanded}
        anchorEl={workloadAnchorElFilter}
        TransitionComponent={DialogTransition}
        onClose={() => setIsWorkloadExpanded(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <div className="px-5 w-full flex items-center justify-between">
          <div className="my-5 flex items-center">
            <div className="mr-[10px]">
              <label className="text-sm font-normal font-proxima text-slatyGrey capitalize mr-[5px]">
                username:
              </label>
              <label className="text-sm font-bold font-proxima capitalize">
                {workloadFields.data[clickedWorkloadRowId]?.UserName}
              </label>
            </div>
            <LineIcon />
            <div className="mx-[10px]">
              <label className="text-sm font-normal font-proxima text-slatyGrey capitalize mr-[5px]">
                Designation:
              </label>
              <label className="text-sm font-normal font-proxima text-slatyGrey capitalize">
                {workloadFields.data[clickedWorkloadRowId]?.DepartmentName}
              </label>
            </div>
            <LineIcon />
            <div className="mx-[10px]">
              <label className="text-sm font-normal font-proxima text-slatyGrey capitalize mr-[5px]">
                Standard Time:
              </label>
              <label className="text-sm font-normal font-proxima text-slatyGrey capitalize">
                {workloadFields.data[clickedWorkloadRowId]?.TotalStandardTime}
              </label>
            </div>
            <LineIcon />
            <div className="mx-[10px]">
              <label className="text-sm font-normal font-proxima text-slatyGrey capitalize mr-[5px]">
                total time:
              </label>
              <label className="text-sm font-normal font-proxima text-slatyGrey capitalize">
                {workloadFields.data[clickedWorkloadRowId]?.TotalTime}
              </label>
            </div>
          </div>
          <div
            className="cursor-pointer"
            onClick={() => setIsWorkloadExpanded(false)}
          >
            <CloseIcon />
          </div>
        </div>
        <MUIDataTable
          title={undefined}
          columns={expandableColumns}
          data={
            workloadFields.data.length > 0 && clickedWorkloadRowId !== -1
              ? workloadFields.data[clickedWorkloadRowId].workLoadWorkItemData
              : []
          }
          options={{ ...options, tableBodyHeight: "276px" }}
        />
      </Popover>
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default Workload;
