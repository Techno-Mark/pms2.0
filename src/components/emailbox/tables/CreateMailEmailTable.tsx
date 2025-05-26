import {
  EmailBoxFilterProps,
  EmailBoxListResponse,
  EmailBoxListResponseList,
  EmailBoxProps,
} from "@/utils/Types/emailboxTypes";
import React from "react";
import MUIDataTable from "mui-datatables";
import { useEffect, useState } from "react";
import { callAPI } from "@/utils/API/callAPI";
import { worklogs_Options } from "@/utils/datatable/TableOptions";
import ReportLoader from "@/components/common/ReportLoader";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { TablePagination, ThemeProvider } from "@mui/material";
import { FieldsType } from "@/components/reports/types/FieldsType";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import {
  generateCustomHeaderName,
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import { createMailColsConfig } from "@/utils/datatable/columns/EmailBoxDatatableColumns";
import SubjectPopup from "../SubjectPopup";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import UnProcessActionBar from "../actionBar/UnProcessActionBar";
import OverLay from "@/components/common/OverLay";

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  pageNo: pageNo,
  pageSize: pageSize,
  sortColumn: "",
  isDesc: true,
  GlobalSearch: "",
  ClientId: null,
  AssigneeId: null,
  TicketStatus: null,
  EmailTypeId: null,
  ReceivedFrom: null,
  ReceivedTo: null,
  Tags: null,
  TabType: 8,
};

const CreateMailEmailTable = ({
  filteredData,
  searchValue,
  onDataFetch,
  handleDrawerOpen,
  getId,
  getTabData,
}: EmailBoxProps) => {
  const [loading, setLoading] = useState(false);
  const [fileds, setFileds] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [filteredObject, setFilteredOject] =
    useState<EmailBoxFilterProps>(initialFilter);
  const [selectedRowsCount, setSelectedRowsCount] = useState<number>(0);
  const [isPopupOpen, setIsPopupOpen] = useState<
    { index: number; dataIndex: number }[] | []
  >([]);
  const [selectedRows, setSelectedRows] = useState<number[] | []>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<number[] | []>([]);
  const [selectedRowStatus, setSelectedRowStatus] = useState<number[] | []>([]);

  const getData = async () => {
    setFileds({
      ...fileds,
      loaded: false,
    });
    const url = `${process.env.emailbox_api_url}/emailbox/getNewTicketList`;

    const successCallback = (
      ResponseData: {
        List: {
          Id: number;
          Subject: string;
          Status: number;
          SentOn: string;
          StatusName: string;
        }[];
        TotalCount: 1;
      },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setFileds({
          ...fileds,
          loaded: true,
          data: ResponseData.List,
          dataCount: ResponseData.TotalCount,
        });
      } else {
        setFileds({ ...fileds, loaded: true });
      }
    };

    callAPI(
      url,
      {
        ...filteredObject,
        ClientId: null,
        AssigneeId: null,
        Tags: null,
        EmailTypeId: null,
        ReceivedFrom: null,
        ReceivedTo: null,
      },
      successCallback,
      "post"
    );
  };

  const handleRowSelect = (
    currentRowsSelected: { index: number; dataIndex: number }[] | [],
    allRowsSelected: { index: number; dataIndex: number }[] | [],
    rowsSelected: number[] | []
  ) => {
    const selectedData: any = allRowsSelected.map(
      (row: { index: number; dataIndex: number }) => fileds.data[row.dataIndex]
    );
    setSelectedRowsCount(rowsSelected?.length);
    setSelectedRows(rowsSelected);

    const selectedWorkItemIds =
      selectedData.length > 0
        ? selectedData.map(
            (selectedRow: EmailBoxListResponseList) => selectedRow?.Id
          )
        : [];

    setSelectedRowIds(selectedWorkItemIds);

    const selectedWorkItemStatus =
      selectedData.length > 0
        ? selectedData.map(
            (selectedRow: EmailBoxListResponseList) => selectedRow?.Status
          )
        : [];

    setSelectedRowStatus(selectedWorkItemStatus);

    setIsPopupOpen(allRowsSelected);
  };

  const handleClearSelection = () => {
    setSelectedRowsCount(0);
    setSelectedRows([]);
    setIsPopupOpen([]);
    setSelectedRowStatus([]);
  };

  useEffect(() => {
    if (searchValue.trim().length > 0) {
      setFilteredOject({
        ...filteredObject,
        ...filteredData,
        GlobalSearch: searchValue.trim(),
        PageNo: pageNo,
        PageSize: pageSize,
      });
      setPage(0);
      setRowsPerPage(pageSize);
    } else {
      setFilteredOject({
        ...filteredObject,
        ...filteredData,
        GlobalSearch: searchValue.trim(),
      });
    }
  }, [filteredData, searchValue]);

  useEffect(() => {
    const fetchData = async () => {
      await getData();
      onDataFetch(() => fetchData());
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [filteredObject, filteredData, searchValue]);

  const generateConditionalColumn = (column: {
    name: string;
    label: string;
    bodyRenderer: (arg0: any) => any;
  }) => {
    if (column.name === "Id") {
      return {
        name: "Id",
        options: {
          filter: true,
          sort: true,
          viewColumns: false,
          setCellProps: () => ({
            style: {
              width: "80px",
              minWidth: "80px",
              maxWidth: "80px",
              overflow: "hidden",
            },
          }),
          setCellHeaderProps: () => ({
            style: {
              width: "80px",
              minWidth: "80px",
              maxWidth: "80px",
              overflow: "hidden",
            },
          }),

          customHeadLabelRender: () => generateCustomHeaderName("Id"),
          customBodyRender: (value: string) => {
            return <span>{value}</span>;
          },
        },
      };
    } else if (column.name === "Subject") {
      return {
        name: "Subject",
        options: {
          filter: true,
          sort: true,
          viewColumns: false,
          customHeadLabelRender: () => generateCustomHeaderName("Subject"),
          customBodyRender: (value: string, tableMeta: any) => {
            const shortProcessName =
              value !== null &&
              value !== undefined &&
              value !== "" &&
              value !== "0" &&
              value.length > 20
                ? value.slice(0, 20)
                : value;

            return (
              <SubjectPopup
                value={value}
                shortProcessName={shortProcessName}
                tableMeta={tableMeta}
                handleDrawerOpen={handleDrawerOpen}
                getId={getId}
                isBold={true}
              />
            );
          },
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

  const inboxCols = createMailColsConfig.map((col: any) => {
    return generateConditionalColumn(col);
  });

  const propsForActionBar = {
    selectedRowsCount,
    selectedRows,
    selectedRowIds,
    getData,
    handleClearSelection,
    selectedRowStatus,
    getTabData,
  };

  return (
    <>
      {fileds.loaded ? (
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            columns={inboxCols}
            data={fileds.data}
            title={undefined}
            options={{
              ...worklogs_Options,
              tableBodyHeight: "73vh",
              selectAllRows: isPopupOpen && selectedRowsCount === 0,
              rowsSelected: selectedRows,
              selectableRows: hasPermissionWorklog(
                "Create Mail",
                "Save",
                "EmailBox"
              )
                ? "multiple"
                : "none",
              textLabels: {
                body: {
                  noMatch: (
                    <div className="flex items-start">
                      <span>No emails available.</span>
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
          />
          <TablePagination
            component="div"
            count={fileds.dataCount}
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
      <UnProcessActionBar
        {...propsForActionBar}
        tab="Create Mail"
        getOverLay={(e: boolean) => setLoading(e)}
      />
      {loading ? <OverLay /> : ""}
    </>
  );
};

export default CreateMailEmailTable;
