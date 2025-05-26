import {
  EmailBoxFilterProps,
  EmailBoxListResponse,
  EmailBoxProps,
} from "@/utils/Types/emailboxTypes";
import React from "react";
import MUIDataTable from "mui-datatables";
import { useEffect, useState } from "react";
import { callAPI } from "@/utils/API/callAPI";
import { worklogs_Options } from "@/utils/datatable/TableOptions";
import ReportLoader from "@/components/common/ReportLoader";
import { ColorToolTip, getMuiTheme } from "@/utils/datatable/CommonStyle";
import { TablePagination, ThemeProvider } from "@mui/material";
import { FieldsType } from "@/components/reports/types/FieldsType";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import {
  generateCommonBodyRender,
  generateCustomHeaderName,
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import { failedColsConfig } from "@/utils/datatable/columns/EmailBoxDatatableColumns";
import SubjectPopup from "../SubjectPopup";

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
  TabType: 7,
};

const FailedEmailTable = ({
  filteredData,
  searchValue,
  onDataFetch,
  getTabData,
  handleDrawerOpen,
  getId,
  hasFetched,
}: EmailBoxProps) => {
  const [fileds, setFileds] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [filteredObject, setFilteredOject] =
    useState<EmailBoxFilterProps>(initialFilter);

  const getData = async () => {
    setFileds({
      ...fileds,
      loaded: false,
    });
    const url = `${process.env.emailbox_api_url}/emailbox/getticketlist`;

    const successCallback = (
      ResponseData: EmailBoxListResponse,
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
        TicketStatus: null,
        SentFrom: null,
        SentTo: null,
      },
      successCallback,
      "post"
    );
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
      hasFetched.current = false;
    } else {
      setFilteredOject({
        ...filteredObject,
        ...filteredData,
        GlobalSearch: searchValue.trim(),
      });
      hasFetched.current = false;
    }
    // getTabData?.();
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
    } else if (column.name === "ExceptionMessage") {
      return {
        name: "ExceptionMessage",
        options: {
          filter: true,
          sort: true,
          viewColumns: false,
          customHeadLabelRender: () =>
            generateCustomHeaderName("Failure Reason"),
          customBodyRender: (value: string, tableMeta: any) => {
            const newValue = !!value
              ? value
              : tableMeta.rowData[tableMeta.rowData.length - 2];

            const shortName =
              newValue !== null &&
              newValue !== undefined &&
              newValue !== "" &&
              newValue !== "0" &&
              newValue.length > 20
                ? newValue.slice(0, 20)
                : newValue;

            return (
              <div className="text-defaultRed">
                {!newValue ||
                newValue === "0" ||
                newValue === null ||
                newValue === "null" ? (
                  "-"
                ) : newValue.length > 20 ? (
                  <>
                    <ColorToolTip title={newValue} placement="top">
                      <span>{shortName}</span>
                    </ColorToolTip>
                    <span>...</span>
                  </>
                ) : (
                  shortName
                )}
              </div>
            );
          },
        },
      };
    } else if (column.name === "SentErrorMessage") {
      return {
        name: "SentErrorMessage",
        options: {
          display: false,
          viewColumns: false,
        },
      };
    } else if (column.name === "ClientId") {
      return {
        name: "ClientId",
        options: {
          display: false,
          viewColumns: false,
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

  const inboxCols = failedColsConfig.map((col: any) => {
    return generateConditionalColumn(col);
  });

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
              selectableRows: "none",
              tableBodyHeight: "73vh",
              textLabels: {
                body: {
                  noMatch: (
                    <div className="flex items-start">
                      <span>No emails available for your group.</span>
                    </div>
                  ),
                  toolTip: "",
                },
              },
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
    </>
  );
};

export default FailedEmailTable;
