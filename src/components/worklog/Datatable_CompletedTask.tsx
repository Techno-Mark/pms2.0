import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import { ThemeProvider } from "@mui/material/styles";
import TablePagination from "@mui/material/TablePagination";
import {
  handlePageChangeWithFilter,
  handleChangeRowsPerPageWithFilter,
} from "@/utils/datatable/CommonFunction";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { worklogs_Options } from "@/utils/datatable/TableOptions";
import CompletedTaskActionBar from "./actionBar/CompletedTaskActionBar";
import ReportLoader from "../common/ReportLoader";
import OverLay from "../common/OverLay";
import { callAPI } from "@/utils/API/callAPI";
import {
  DatatableWorklog,
  DatatableWorklogProps,
  InitialFilter,
} from "@/utils/Types/clientWorklog";
import { datatableWorklogCols } from "@/utils/datatable/columns/ClientDatatableColumns";

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  PageNo: pageNo,
  PageSize: pageSize,
  SortColumn: "",
  IsDesc: true,
  GlobalSearch: "",
  ProjectIds: null,
  OverdueBy: null,
  PriorityId: null,
  StatusId: null,
  WorkTypeId: null,
  AssignedTo: null,
  StartDate: null,
  EndDate: null,
  ReworkReceivedDate: null,
  ReworkDueDate: null,
  DueDate: null,
  IsCreatedByClient: null,
  IsCompletedTaskPage: true,
  IsSignedOff: false,
};

const Datatable_CompletedTask = ({
  onEdit,
  onDrawerOpen,
  onDataFetch,
  onComment,
  onErrorLog,
  currentFilterData,
  searchValue,
  onCloseDrawer,
}: DatatableWorklogProps) => {
  const [
    isLoadingWorklogCompletedDatatable,
    setIsLoadingWorklogCompletedDatatable,
  ] = useState(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [tableDataCount, setTableDataCount] = useState(0);
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState<
    { index: number; dataIndex: number }[] | []
  >([]);
  const [selectedRows, setSelectedRows] = useState<number[] | []>([]);
  const [workItemData, setWorkItemData] = useState<DatatableWorklog[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<null | number>(null);
  const [filteredObject, setFilteredOject] =
    useState<InitialFilter>(initialFilter);

  useEffect(() => {
    if (!onCloseDrawer || !onCloseDrawer) {
      handleClearSelection();
    }
  }, [onCloseDrawer]);

  const handleRowSelect = (
    currentRowsSelected: { index: number; dataIndex: number }[] | [],
    allRowsSelected: { index: number; dataIndex: number }[] | [],
    rowsSelected: number[] | []
  ) => {
    const selectedData = allRowsSelected.map(
      (row: { index: number; dataIndex: number }) => workItemData[row.dataIndex]
    );
    setSelectedRowsCount(rowsSelected.length);
    setSelectedRows(rowsSelected);

    // adding all selected Ids in an array
    const selectedWorkItemIds =
      selectedData.length > 0
        ? selectedData.map(
            (selectedRow: DatatableWorklog) => selectedRow?.WorkitemId
          )
        : [];

    setSelectedRowIds(selectedWorkItemIds);

    // adding only one or last selected id
    const lastSelectedWorkItemId =
      selectedData.length > 0
        ? selectedData[selectedData.length - 1].WorkitemId
        : null;
    setSelectedRowId(lastSelectedWorkItemId);

    setIsPopupOpen(allRowsSelected);
  };

  const handleClearSelection = () => {
    setSelectedRowsCount(0);
    setSelectedRows([]);
    setIsPopupOpen([]);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.href.includes("id=");
      if (pathname) {
        const idMatch = window.location.href.match(/id=([^?&]+)/);
        const id = idMatch ? idMatch[1] : 0;
        onEdit(Number(id));
        onDrawerOpen();
      }
    }
  }, []);

  const getWorkItemList = () => {
    setLoaded(false);
    const params = filteredObject;
    const url = `${process.env.worklog_api_url}/ClientWorkitem/getworkitemlist`;
    const successCallback = (
      ResponseData: { List: DatatableWorklog[] | []; TotalCount: number },
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
    setFilteredOject({ ...filteredObject, ...currentFilterData });
  }, [currentFilterData]);

  useEffect(() => {
    setFilteredOject({
      ...filteredObject,
      PageNo: 1,
      PageSize: pageSize,
      GlobalSearch: searchValue,
    });
    searchValue.length > 0 && setPage(0);
  }, [searchValue]);

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

  const propsForActionBar = {
    selectedRowsCount,
    selectedRows,
    selectedRowId,
    handleClearSelection,
    onComment,
    onErrorLog,
    getWorkItemList,
    selectedRowIds,
    workItemData,
    onDataFetch,
  };

  return (
    <div>
      {loaded ? (
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            data={workItemData}
            columns={datatableWorklogCols}
            title={undefined}
            options={{
              ...worklogs_Options,
              selectableRows:
                currentFilterData.IsSignedOff === false ? "multiple" : "none",
              tableBodyHeight: "71vh",
              selectAllRows: isPopupOpen && selectedRowsCount === 0,
              rowsSelected: selectedRows,
              textLabels: {
                body: {
                  noMatch: (
                    <div className="flex items-start">
                      <span>
                        Currently there is no record, you may&nbsp;
                        <a
                          className="text-secondary underline cursor-pointer"
                          onClick={onDrawerOpen}
                        >
                          create task
                        </a>
                        &nbsp;to continue.
                      </span>
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
            data-tableid="completedTask_Datatable"
          />
          <TablePagination
            className="mt-[10px]"
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

      {/* Completed Task Action Bar */}
      <CompletedTaskActionBar {...propsForActionBar} />
      {isLoadingWorklogCompletedDatatable ? <OverLay /> : ""}
    </div>
  );
};

export default Datatable_CompletedTask;
