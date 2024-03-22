import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import { ThemeProvider } from "@mui/material/styles";
import TablePagination from "@mui/material/TablePagination";
import RecurringIcon from "@/assets/icons/worklogs/RecurringIcon";
import {
  generateCustomHeaderName,
  generateCommonBodyRender,
  generateCustomFormatDate,
  generatePriorityWithColor,
  generateStatusWithColor,
  handlePageChangeWithFilter,
  handleChangeRowsPerPageWithFilter,
} from "@/utils/datatable/CommonFunction";
import { getMuiTheme, ColorToolTip } from "@/utils/datatable/CommonStyle";
import { worklogs_Options } from "@/utils/datatable/TableOptions";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import WorklogsActionBar from "../actionBar/WorklogsActionBar";
import ReportLoader from "../../common/ReportLoader";
import OverLay from "../../common/OverLay";
import { callAPI } from "@/utils/API/callAPI";

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
  StartDate: null,
  EndDate: null,
  DueDate: null,
  Priority: null,
};

const UnassigneeDatatable = ({
  onEdit,
  onRecurring,
  onDrawerOpen,
  onDataFetch,
  onComment,
  currentFilterData,
  onDrawerClose,
  searchValue,
  isUnassigneeClicked,
}: any) => {
  const [
    isLoadingWorklogsUnassigneeDatatable,
    setIsLoadingWorklogsUnassigneeDatatable,
  ] = useState(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [workItemData, setWorkItemData] = useState<any | any[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<any | number[]>([]);
  const [selectedRowStatusId, setSelectedRowStatusId] = useState<
    any | number[]
  >([]);
  const [selectedRowClientId, setSelectedRowClientId] = useState<
    any | number[]
  >([]);
  const [selectedRowWorkTypeId, setSelectedRowWorkTypeId] = useState<
    any | number[]
  >([]);
  const [selectedRowId, setSelectedRowId] = useState<any | number>(null);
  const [filteredObject, setFilteredOject] = useState<any>(initialFilter);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [tableDataCount, setTableDataCount] = useState(0);

  useEffect(() => {
    handleClearSelection();
    // setRowsPerPage(10);
    // setPage(0);
  }, [onDrawerClose]);

  const handleRowSelect = (
    currentRowsSelected: any,
    allRowsSelected: any,
    rowsSelected: any
  ) => {
    const selectedData = allRowsSelected.map(
      (row: any) => workItemData[row.dataIndex]
    );
    setSelectedRowsCount(rowsSelected.length);
    setSelectedRows(rowsSelected);

    const selectedWorkItemIds =
      selectedData.length > 0
        ? selectedData.map((selectedRow: any) => selectedRow?.WorkitemId)
        : [];
    setSelectedRowIds(selectedWorkItemIds);

    const lastSelectedWorkItemId =
      selectedData.length > 0
        ? selectedData[selectedData.length - 1]?.WorkitemId
        : null;
    setSelectedRowId(lastSelectedWorkItemId);

    const selectedWorkItemStatusIds =
      selectedData.length > 0
        ? selectedData.map((selectedRow: any) => selectedRow?.StatusId)
        : [];
    setSelectedRowStatusId(selectedWorkItemStatusIds);

    const selectedWorkItemClientIds =
      selectedData.length > 0
        ? selectedData.map((selectedRow: any) => selectedRow?.ClientId)
        : [];
    setSelectedRowClientId(selectedWorkItemClientIds);

    const selectedWorkItemWorkTypeIds =
      selectedData.length > 0
        ? selectedData.map((selectedRow: any) => selectedRow?.WorkTypeId)
        : [];
    setSelectedRowWorkTypeId(selectedWorkItemWorkTypeIds);

    setIsPopupOpen(allRowsSelected);
  };

  const handleClearSelection = () => {
    setSelectedRowsCount(0);
    setSelectedRows([]);
    setIsPopupOpen(false);
  };

  useEffect(() => {
    setFilteredOject({
      ...filteredObject,
      ...currentFilterData,
      GlobalSearch: searchValue,
    });
  }, [currentFilterData, searchValue]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.href.includes("id=");
      if (pathname) {
        const idMatch = window.location.href.match(/id=([^?&]+)/);
        const id = idMatch ? idMatch[1] : null;
        onEdit(id);
        onDrawerOpen();
      }
    }
  }, []);

  const getWorkItemList = async () => {
    const params = filteredObject;
    const url = `${process.env.worklog_api_url}/workitem/getunassignedworkitemlist`;
    const successCallback = (
      ResponseData: any,
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
    const fetchData = async () => {
      await getWorkItemList();
      onDataFetch(() => fetchData());
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [filteredObject]);

  const generateCustomTaskNameBody = (bodyValue: any, tableMeta: any) => {
    const IsRecurring = tableMeta.rowData[tableMeta.rowData.length - 4];
    return (
      <div className="flex items-center gap-2">
        {bodyValue === null || bodyValue === "" ? (
          "-"
        ) : (
          <>
            {IsRecurring && (
              <span className="text-secondary font-semibold">
                <RecurringIcon />
              </span>
            )}
            {bodyValue}
          </>
        )}
      </div>
    );
  };

  const generateShortProcessNameBody = (bodyValue: any) => {
    const shortProcessName = bodyValue.split(" ");
    return (
      <div className="font-semibold">
        <ColorToolTip title={bodyValue} placement="top">
          {shortProcessName[0]}
        </ColorToolTip>
      </div>
    );
  };

  const columnConfig = [
    {
      name: "WorkitemId",
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
      bodyRenderer: generateShortProcessNameBody,
    },
    {
      name: "SubProcessName",
      label: "Sub-Process",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "IsManual",
      options: {
        display: false,
      },
    },
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
    {
      name: "StatusColorCode",
      options: {
        filter: false,
        sort: false,
        display: false,
        viewColumns: false,
      },
    },
    {
      name: "StatusName",
      label: "Status",
      bodyRenderer: (value: any, tableMeta: any) =>
        generateStatusWithColor(value, tableMeta.rowData[9]),
    },
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
    // {
    //   name: "ActualTime",
    //   label: "Actual Time",
    //   bodyRenderer: generateCommonBodyRender,
    // },
    {
      name: "STDTime",
      label: "Std. Time",
      bodyRenderer: generateCommonBodyRender,
    },
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
    {
      name: "AssignedByName",
      label: "Assigned By",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "IsHasErrorlog",
      options: {
        display: false,
      },
    },
    {
      name: "IsRecurring",
      options: {
        display: false,
      },
    },
    {
      name: "StatusId",
      options: {
        display: false,
      },
    },
    {
      name: "State",
      options: {
        display: false,
      },
    },
    {
      name: "WorkitemId",
      options: {
        display: false,
      },
    },
  ];

  const generateConditionalColumn = (
    column: {
      name: string;
      label: string;
      bodyRenderer: (arg0: any) => any;
    },
    rowDataIndex: number
  ) => {
    if (column.label === "Task ID") {
      return {
        name: "WorkitemId",
        options: {
          filter: true,
          viewColumns: false,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName("Task ID"),
          customBodyRender: (value: any, tableMeta: any) => {
            return generateCommonBodyRender(value);
          },
        },
      };
    } else if (column.name === "IsManual") {
      return {
        name: "IsManual",
        options: {
          display: false,
        },
      };
    } else if (column.name === "StatusColorCode") {
      return {
        name: "StatusColorCode",
        options: {
          filter: false,
          sort: false,
          display: false,
        },
      };
    } else if (column.name === "StatusName") {
      return {
        name: "StatusName",
        options: {
          filter: true,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName("Status"),
          customBodyRender: (value: any, tableMeta: any) =>
            generateStatusWithColor(value, tableMeta.rowData[rowDataIndex]),
        },
      };
    } else if (column.name === "TaskName") {
      return {
        name: "TaskName",
        options: {
          filter: true,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName("Task"),
          customBodyRender: (value: any, tableMeta: any) => {
            return generateCustomTaskNameBody(value, tableMeta);
          },
        },
      };
    } else if (column.name === "IsHasErrorlog") {
      return {
        name: "IsHasErrorlog",
        options: {
          display: false,
        },
      };
    } else if (column.name === "IsRecurring") {
      return {
        name: "IsRecurring",
        options: {
          display: false,
        },
      };
    } else if (column.name === "StatusId") {
      return {
        name: "StatusId",
        options: {
          display: false,
        },
      };
    } else if (column.name === "State") {
      return {
        name: "State",
        options: {
          display: false,
        },
      };
    } else if (column.name === "WorkitemId") {
      return {
        name: "WorkitemId",
        options: {
          display: false,
        },
      };
    } else {
      return generateCustomColumn(
        column.name,
        column.label,
        column.bodyRenderer
      );
    }
  };

  const UnassigneeTaskColumns: any = columnConfig.map((col: any) => {
    return generateConditionalColumn(col, 9);
  });

  const propsForActionBar = {
    selectedRowsCount,
    selectedRows,
    selectedRowStatusId,
    selectedRowId,
    selectedRowClientId,
    selectedRowWorkTypeId,
    selectedRowIds,
    onEdit,
    handleClearSelection,
    onRecurring,
    onComment,
    workItemData,
    getWorkItemList,
    isUnassigneeClicked,
  };

  return (
    <div>
      {loaded ? (
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            data={workItemData}
            columns={UnassigneeTaskColumns}
            title={undefined}
            options={{
              ...worklogs_Options,
              selectAllRows: isPopupOpen && selectedRowsCount === 0,
              rowsSelected: selectedRows,
              textLabels: {
                body: {
                  noMatch: (
                    <div className="flex items-start">
                      <span>
                        Currently there is no record, you may
                        <a
                          className="text-secondary underline cursor-pointer"
                          onClick={onDrawerOpen}
                        >
                          create task
                        </a>{" "}
                        to continue.
                      </span>
                    </div>
                  ),
                  toolTip: "",
                },
              },
              onRowSelectionChange: (
                currentRowsSelected: any,
                allRowsSelected: any,
                rowsSelected: any
              ) =>
                handleRowSelect(
                  currentRowsSelected,
                  allRowsSelected,
                  rowsSelected
                ),
            }}
            data-tableid="unassignee_Datatable"
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
            }}
          />
        </ThemeProvider>
      ) : (
        <ReportLoader />
      )}

      {/* Action Bar */}
      <WorklogsActionBar
        {...propsForActionBar}
        getOverLay={(e: any) => setIsLoadingWorklogsUnassigneeDatatable(e)}
      />
      {isLoadingWorklogsUnassigneeDatatable ? <OverLay /> : ""}
    </div>
  );
};

export default UnassigneeDatatable;
