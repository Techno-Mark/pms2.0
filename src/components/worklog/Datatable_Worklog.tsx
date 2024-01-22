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
import { datatableWorklogCols } from "@/utils/datatable/columns/ClientDatatableColumns";
import WorklogActionbar from "./actionBar/WorklogActionbar";
import ReportLoader from "../common/ReportLoader";
import OverLay from "../common/OverLay";
import { callAPI } from "@/utils/API/callAPI";

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  PageNo: pageNo,
  PageSize: pageSize,
  SortColumn: "",
  IsDesc: true,
  GlobalSearch: null,
  ProjectIds: null,
  OverdueBy: null,
  PriorityId: null,
  StatusId: null,
  WorkTypeId: null,
  AssignedTo: null,
  StartDate: null,
  EndDate: null,
  DueDate: null,
  IsCreatedByClient: null,
  IsCompletedTaskPage: false,
  IsSignedOff: false,
};

const Datatable_Worklog = ({
  onEdit,
  onDrawerOpen,
  onDataFetch,
  onComment,
  currentFilterData,
  onSearchWorkTypeData,
  onCloseDrawer,
}: any) => {
  const [isLoadingWorklogDatatable, setIsLoadingWorklogDatatable] =
    useState(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [tableDataCount, setTableDataCount] = useState(0);
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [workItemData, setWorkItemData] = useState<any | any[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<any | number[]>([]);
  const [selectedRowStatusId, setSelectedRowStatusId] = useState<
    any | number[]
  >([]);
  const [selectedRowId, setSelectedRowId] = useState<any | number>(null);
  const [isCreatedByClient, setIsCreatedByClient] = useState<any | number>(
    null
  );
  const [filteredObject, setFilteredOject] = useState<any>(initialFilter);

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

    // adding all selected Ids in an array
    const selectedWorkItemIds =
      selectedData.length > 0
        ? selectedData.map((selectedRow: any) => selectedRow.WorkitemId)
        : [];
    setSelectedRowIds(selectedWorkItemIds);

    // adding only one or last selected id
    const lastSelectedWorkItemId =
      selectedData.length > 0
        ? selectedData[selectedData.length - 1].WorkitemId
        : null;
    setSelectedRowId(lastSelectedWorkItemId);

    // adding only one or last selected id
    const IsCreatedByClient =
      selectedData.length > 0
        ? selectedData[selectedData.length - 1].IsCreatedByClient
        : null;
    setIsCreatedByClient(IsCreatedByClient);

    // adding all selected row's status Ids in an array
    const selectedWorkItemStatusIds =
      selectedData.length > 0
        ? selectedData.map((selectedRow: any) => selectedRow.StatusId)
        : [];
    setSelectedRowStatusId(selectedWorkItemStatusIds);

    setIsPopupOpen(allRowsSelected);
  };

  const handleClearSelection = () => {
    setSelectedRowsCount(0);
    setSelectedRows([]);
    setIsPopupOpen(false);
  };

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

  useEffect(() => {
    if (!onCloseDrawer || onCloseDrawer === false) {
      handleClearSelection();
    }
  }, [onCloseDrawer]);

  const getWorkItemList = () => {
    const params = filteredObject;
    const url = `${process.env.worklog_api_url}/ClientWorkitem/getworkitemlist`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
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
      pageSize: pageSize,
      GlobalSearch: onSearchWorkTypeData,
    });
    onSearchWorkTypeData.length > 0 && setPage(0);
  }, [onSearchWorkTypeData]);

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
    selectedRowStatusId,
    selectedRowId,
    selectedRowIds,
    onEdit,
    handleClearSelection,
    onComment,
    workItemData,
    getWorkItemList,
    isCreatedByClient,
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
              tableBodyHeight: "71vh",
              selectAllRows: isPopupOpen && selectedRowsCount === 0,
              rowsSelected: selectedRows,
              textLabels: {
                body: {
                  noMatch: (
                    <div className="flex items-center">
                      <span>
                        Currently no record found, you have to&nbsp;
                        <a
                          className="text-secondary underline cursor-pointer"
                          onClick={onDrawerOpen}
                        >
                          create
                        </a>{" "}
                        process/task.
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
            data-tableid="worklog_Datatable"
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
      ;{/* WorkLog's Action Bar */}
      <WorklogActionbar
        {...propsForActionBar}
        getOverLay={(e: any) => setIsLoadingWorklogDatatable(e)}
      />
      {isLoadingWorklogDatatable ? <OverLay /> : ""}
    </div>
  );
};

export default Datatable_Worklog;
