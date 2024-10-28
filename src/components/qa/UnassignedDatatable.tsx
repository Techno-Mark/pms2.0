import { callAPI } from "@/utils/API/callAPI";
import {
  AppliedFilterQAPage,
  FilterQAPage,
  QAList,
  Response,
} from "@/utils/Types/qaTypes";
import React, { useEffect, useState } from "react";
import ReportLoader from "../common/ReportLoader";
import MUIDataTable from "mui-datatables";
import TablePagination from "@mui/material/TablePagination";
import { ThemeProvider } from "@emotion/react";
import { ColorToolTip, getMuiTheme } from "@/utils/datatable/CommonStyle";
import { worklogs_Options } from "@/utils/datatable/TableOptions";
import {
  generateCommonBodyRender,
  generateCustomFormatDate,
  generatePriorityWithColor,
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import UnassignedQAActionBar from "./actionBar/UnassignedQAActionBar";

interface DatatableProps {
  onDataFetch: (getData: () => void) => void;
  onCurrentFilterId: number;
  currentFilterData: AppliedFilterQAPage | [];
  searchValue: string;
}

interface InitialFilter {
  PageNo: number;
  PageSize: number;
  SortColumn: string;
  IsDesc: boolean;
  GlobalSearch: string;
  ClientId: number | null;
  TypeOfWork: number | null;
  ProjectId: number | null;
  AssignedTo: number | null;
  AssignedBy: number | null;
  StartDate: string | null;
  EndDate: string | null;
}

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  PageNo: pageNo,
  PageSize: pageSize,
  SortColumn: "",
  IsDesc: true,
  GlobalSearch: "",
  ClientId: null,
  TypeOfWork: null,
  ProjectId: null,
  AssignedTo: null,
  AssignedBy: null,
  StartDate: null,
  EndDate: null,
};

const UnassignedDatatable = ({
  onDataFetch,
  onCurrentFilterId,
  currentFilterData,
  searchValue,
}: DatatableProps) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [filteredObject, setFilteredOject] =
    useState<InitialFilter>(initialFilter);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [tableDataCount, setTableDataCount] = useState(0);
  const [workItemData, setWorkItemData] = useState<QAList[] | []>([]);
  const [selectedRows, setSelectedRows] = useState<number[] | []>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<number[] | []>([]);
  const [selectedRowsCount, setSelectedRowsCount] = useState<number>(0);

  const getFilterList = async (filterId: number) => {
    if (filterId === 0) {
      setFilteredOject(initialFilter);
    } else {
      const params = {
        type: 21,
      };
      const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
      const successCallback = (
        ResponseData: FilterQAPage[] | [],
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          const filteredData = ResponseData.filter(
            (filter: FilterQAPage) => filter.FilterId === filterId
          );

          if (filteredData.length > 0) {
            const appliedFilterData = filteredData[0].AppliedFilter;
            setFilteredOject({
              ...filteredObject,
              ClientId:
                appliedFilterData.ClientId === 0 ||
                appliedFilterData.ClientId === null
                  ? null
                  : appliedFilterData.ClientId,
              TypeOfWork:
                appliedFilterData.TypeOfWork === 0 ||
                appliedFilterData.TypeOfWork === null
                  ? null
                  : appliedFilterData.TypeOfWork,
              ProjectId:
                appliedFilterData.ProjectId === 0 ||
                appliedFilterData.ProjectId === null
                  ? null
                  : appliedFilterData.ProjectId,
              AssignedTo:
                appliedFilterData.AssignedTo === 0 ||
                appliedFilterData.AssignedTo === null
                  ? null
                  : appliedFilterData.AssignedTo,
              AssignedBy:
                appliedFilterData.AssignedBy === 0 ||
                appliedFilterData.AssignedBy === null
                  ? null
                  : appliedFilterData.AssignedBy,
              StartDate:
                appliedFilterData.StartDate === "" ||
                appliedFilterData.StartDate === null
                  ? null
                  : appliedFilterData.StartDate,
              EndDate:
                appliedFilterData.EndDate === "" ||
                appliedFilterData.EndDate === null
                  ? null
                  : appliedFilterData.EndDate,
            });
          }
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  const getQaList = async () => {
    setLoaded(false);
    const params = filteredObject;
    const url = `${process.env.worklog_api_url}/workitem/quality/getmaster`;
    const successCallback = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setLoaded(true);
        setWorkItemData(ResponseData.List);
        setTableDataCount(ResponseData.TotalCount);
      } else {
        setLoaded(true);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    getFilterList(onCurrentFilterId);
  }, [onCurrentFilterId]);

  useEffect(() => {
    if (searchValue.trim().length > 0) {
      setFilteredOject({
        ...filteredObject,
        ...currentFilterData,
        GlobalSearch: searchValue,
        PageNo: pageNo,
        PageSize: pageSize,
      });
      setPage(0);
      setRowsPerPage(pageSize);
    } else {
      setFilteredOject({
        ...filteredObject,
        ...currentFilterData,
        GlobalSearch: searchValue,
      });
    }
  }, [currentFilterData, searchValue]);

  useEffect(() => {
    const fetchData = async () => {
      await getQaList();
      onDataFetch(() => fetchData());
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [onCurrentFilterId, filteredObject, currentFilterData, searchValue]);

  const handleClearSelection = () => {
    setSelectedRowId(null);
    setSelectedRowsCount(0);
    setSelectedRows([]);
    setSelectedRowIds([]);
  };

  const handleRowSelect = (
    currentRowsSelected: { index: number; dataIndex: number }[] | [],
    allRowsSelected: { index: number; dataIndex: number }[] | [],
    rowsSelected: number[] | []
  ) => {
    setSelectedRowsCount(rowsSelected?.length);

    const selectedData: QAList[] | [] = allRowsSelected.map(
      (row: { index: number; dataIndex: number }) => workItemData[row.dataIndex]
    );
    setSelectedRows(rowsSelected);

    const selectedWorkItemIds =
      selectedData.length > 0
        ? selectedData.map((selectedRow: QAList) => selectedRow?.TaskId)
        : [];

    setSelectedRowIds(selectedWorkItemIds);
  };

  const generateCustomTaskNameBody = (
    bodyValue: null | undefined | string,
    tableMeta: any
  ) => {
    const shortProcessName =
      bodyValue !== null && bodyValue !== undefined && bodyValue.length > 20
        ? bodyValue.slice(0, 20)
        : bodyValue;
    return (
      <div className="flex items-center gap-2">
        {!bodyValue ||
        bodyValue === "0" ||
        bodyValue === null ||
        bodyValue === "null" ? (
          "-"
        ) : bodyValue.length > 20 ? (
          <>
            <ColorToolTip title={bodyValue} placement="top">
              <span>{shortProcessName}</span>
            </ColorToolTip>
            <span>...</span>
          </>
        ) : (
          <>{shortProcessName}</>
        )}
      </div>
    );
  };

  const columnConfig = [
    {
      name: "TaskId",
      label: "Task ID",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ClientName",
      label: "Client",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ProjectName",
      label: "Project",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "TaskName",
      label: "Task",
      bodyRenderer: generateCustomTaskNameBody,
    },
    {
      name: "ProcessName",
      label: "Process",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "SubProcessName",
      label: "Sub-Process",
      bodyRenderer: generateCommonBodyRender,
    },
    // {
    //   name: "IsManual",
    //   options: {
    //     display: false,
    //     viewColumns: false,
    //     filter: false,
    //   },
    // },
    // {
    //   name: "Timer",
    //   label: "Timer",
    //   bodyRenderer: generateCommonBodyRender,
    // },
    {
      name: "AssignedToName",
      label: "Assigned To",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "PriorityName",
      label: "Priority",
      bodyRenderer: generatePriorityWithColor,
    },
    // {
    //   name: "StatusColorCode",
    //   options: {
    //     filter: false,
    //     sort: false,
    //     display: false,
    //     viewColumns: false,
    //   },
    // },
    // {
    //   name: "StatusName",
    //   label: "Status",
    //   bodyRenderer: (value: string, tableMeta: any) =>
    //     generateStatusWithColor(value, tableMeta.rowData[10]),
    // },
    {
      name: "EstimateTime",
      label: "Est. Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Quantity",
      label: "Qty.",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "STDTime",
      label: "Std. Time",
      bodyRenderer: generateCommonBodyRender,
    },
    // {
    //   name: "PreparorTime",
    //   label: "Preparation Time",
    //   bodyRenderer: generateCommonBodyRender,
    // },
    {
      name: "StartDate",
      label: "Start Date",
      bodyRenderer: generateCustomFormatDate,
    },
    {
      name: "EndDate",
      label: "End Date",
      bodyRenderer: generateCustomFormatDate,
    },
    // {
    //   name: "ReworkReceivedDate",
    //   label: "Rework Received Date",
    //   bodyRenderer: generateCustomFormatDate,
    // },
    // {
    //   name: "ReworkDueDate",
    //   label: "Rework Due Date",
    //   bodyRenderer: generateCustomFormatDate,
    // },
    {
      name: "AssignedByName",
      label: "Assigned By",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Description",
      label: "Description",
      bodyRenderer: generateCommonBodyRender,
    },
    // {
    //   name: "WorkTypeId",
    //   options: {
    //     display: false,
    //     viewColumns: false,
    //   },
    // },
    // {
    //   name: "TaskType",
    //   options: {
    //     display: false,
    //     viewColumns: false,
    //   },
    // },
    // {
    //   name: "IsHasErrorlog",
    //   options: {
    //     display: false,
    //     viewColumns: false,
    //   },
    // },
    // {
    //   name: "IsRecurring",
    //   options: {
    //     display: false,
    //     viewColumns: false,
    //   },
    // },
    // {
    //   name: "AssignedToId",
    //   options: {
    //     display: false,
    //     viewColumns: false,
    //   },
    // },
    // {
    //   name: "StatusType",
    //   options: {
    //     display: false,
    //     viewColumns: false,
    //   },
    // },
    // {
    //   name: "State",
    //   options: {
    //     display: false,
    //     viewColumns: false,
    //   },
    // },
    // {
    //   name: "TaskId",
    //   options: {
    //     display: false,
    //     viewColumns: false,
    //   },
    // },
  ];

  const generateConditionalColumn = (column: {
    name: string;
    label: string;
    bodyRenderer: (arg0: any) => any;
  }) => {
    // if (column.name === "TaskId") {
    //   return {
    //     name: "TaskId",
    //     options: {
    //       display: false,
    //       viewColumns: false,
    //     },
    //   };
    // } else {
    return generateCustomColumn(column.name, column.label, column.bodyRenderer);
    // }
  };

  const QAColumns = columnConfig.map((col: any) => {
    return generateConditionalColumn(col);
  });

  return (
    <div>
      {loaded ? (
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            data={workItemData}
            columns={QAColumns}
            title={undefined}
            options={{
              ...worklogs_Options,
              tableBodyHeight: "71vh",
              // viewColumns: false,
              selectAllRows: selectedRowsCount === 0,
              rowsSelected: selectedRows,
              textLabels: {
                body: {
                  noMatch: (
                    <div className="flex items-start">
                      <span>Currently there is no record.</span>
                    </div>
                  ),
                  toolTip: "",
                },
              },
              onRowSelectionChange: (
                currentRowsSelected:
                  | { index: number; dataIndex: number }[]
                  | [],
                allRowsSelected: { index: number; dataIndex: number }[] | [],
                rowsSelected: number[] | []
              ) =>
                handleRowSelect(
                  currentRowsSelected,
                  allRowsSelected,
                  rowsSelected
                ),
            }}
            data-tableid="Datatable"
          />
          <TablePagination
            component="div"
            count={tableDataCount}
            page={page}
            onPageChange={(
              event: React.MouseEvent<HTMLButtonElement> | null,
              newPage: number
            ) => {
              handlePageChangeWithFilter(newPage, setPage, setFilteredOject);
              handleClearSelection();
            }}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
              handleChangeRowsPerPageWithFilter(
                event,
                setRowsPerPage,
                setPage,
                setFilteredOject
              );
              handleClearSelection();
            }}
          />
        </ThemeProvider>
      ) : (
        <ReportLoader />
      )}

      {/* Action Bar */}
      <UnassignedQAActionBar
        getQaList={getQaList}
        selectedRowIds={selectedRowIds}
        selectedRowsCount={selectedRowsCount}
        handleClearSelection={handleClearSelection}
        // getOverLay={(e: boolean) => setIsLoadingQADatatable(e)}
      />
      {/* {isLoadingQADatatable ? <OverLay /> : ""} */}
    </div>
  );
};

export default UnassignedDatatable;
