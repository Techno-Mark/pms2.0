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
import { inboxColsConfig } from "@/utils/datatable/columns/EmailBoxDatatableColumns";
import OverLay from "@/components/common/OverLay";
import InboxActionBar from "../actionBar/InboxActionBar";
import AddPlusIcon from "@/assets/icons/AddPlusIcon";
import { toast } from "react-toastify";
import RestartButton from "@/assets/icons/worklogs/RestartButton";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
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
  TabType: 1,
};

const InboxTable = ({
  filteredData,
  searchValue,
  getTabData,
  onDataFetch,
  handleDrawerOpen,
  getId,
  tagDropdown,
  getTagDropdownData,
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
  const [selectedRowClientId, setSelectedRowClientId] = useState<number[] | []>(
    []
  );
  const [selectedRowEmailType, setSelectedRowEmailType] = useState<
    number[] | []
  >([]);
  const [selectedRowAssignee, setSelectedRowAssignee] = useState<number[] | []>(
    []
  );
  const [selectedRowStatus, setSelectedRowStatus] = useState<number[] | []>([]);
  const [createTaskId, setCreateTaskId] = useState(0);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const getData = async (IsDelay = false) => {
    setFileds({
      ...fileds,
      loaded: false,
    });
    handleClearSelection();

    if (IsDelay) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

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
        // if (typeof window !== "undefined") {
        //   const pathname = window.location.href.includes("id=");
        //   if (pathname) {
        //     const idMatch = window.location.href.match(/id=([^?&]+)/);
        //     const id = idMatch ? idMatch[1] : 0;
        //     const clientId: any = ResponseData.List.filter(
        //       (i: EmailBoxListResponseList) => i.Id == Number(id)
        //     );
        //     if (clientId.length > 0) {
        //       handleDrawerOpen?.();
        //       getId?.(Number(id), clientId[0].ClientId);
        //     }
        //   }
        // }
        if (typeof window !== "undefined") {
          const pathname = window.location.href.includes("id=");
          const clientPathname = window.location.href.includes("clientId=");
          if (pathname && clientPathname) {
            const idMatch = window.location.href.match(/id=([^?&]+)/);
            const clientIdMatch =
              window.location.href.match(/clientId=([^?&]+)/);
            const id: number = idMatch ? Number(idMatch[1]) : 0;
            const clientId: number = clientIdMatch
              ? Number(clientIdMatch[1])
              : 0;
            if (id > 0 && clientId > 0) {
              handleDrawerOpen?.();
              getId?.(id, clientId);
            }
          }
        }
      } else {
        setFileds({ ...fileds, loaded: true });
      }
    };

    callAPI(url, filteredObject, successCallback, "post");
  };

  const getSyncTime = (ticketId: number) => {
    setLoading(true);
    const url = `${process.env.emailbox_api_url}/emailbox/calculateRemaningOrSpentSLATime`;

    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        const data = fileds.data.map((item: EmailBoxListResponseList) => {
          item.Id === ticketId &&
            (item.TotalTimeSpent = ResponseData.TotalTimeSpent);
          return item;
        });
        setFileds({
          ...fileds,
          data: data,
        });
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    callAPI(url, { TicketIds: [ticketId] }, successCallback, "post");
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

    const selectedWorkItemClientIds =
      selectedData.length > 0
        ? selectedData.map(
            (selectedRow: EmailBoxListResponseList) => selectedRow?.ClientId
          )
        : [];

    setSelectedRowClientId(selectedWorkItemClientIds);

    const selectedWorkItemEmailType =
      selectedData.length > 0
        ? selectedData.map((selectedRow: EmailBoxListResponseList) =>
            selectedRow?.EmailType === null ? 0 : selectedRow?.EmailType
          )
        : [];

    setSelectedRowEmailType(selectedWorkItemEmailType);

    const selectedWorkItemAssignTo =
      selectedData.length > 0
        ? selectedData.map((selectedRow: EmailBoxListResponseList) =>
            selectedRow?.AssignTo === null ? 0 : selectedRow?.AssignTo
          )
        : [];

    setSelectedRowAssignee(selectedWorkItemAssignTo);

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
    setSelectedRowClientId([]);
    setSelectedRowEmailType([]);
    setSelectedRowAssignee([]);
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
    getTabData?.();
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

  const handleDeleteTag = (tagName: string, ticketId: number) => {
    setLoading(true);
    const params = {
      TicketId: ticketId,
      Name: tagName,
    };
    const url = `${process.env.emailbox_api_url}/emailbox/deletetag`;
    const successCallback = (
      ResponseData: boolean | number | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Tag removed successfully.");
        getData();
        setLoading(false);
      } else if (ResponseStatus === "Warning" && error === false) {
        toast.warning(ResponseData || "Please try again later.");
        getData();
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const createTask = () => {
    setLoading(true);
    const params = {
      TicketIds: [createTaskId],
    };
    const url = `${process.env.emailbox_api_url}/emailbox/saveWorkItemFromTicket`;
    const successCallback = (
      ResponseData: {
        InvalidStatusCount: number;
        ValidTicketCount: number;
        InvalidTicketCount: number;
      },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        ResponseData.ValidTicketCount > 0 &&
          toast.success("Task created successfully.");
        (ResponseData.InvalidStatusCount > 0 ||
          ResponseData.InvalidTicketCount > 0) &&
          toast.error("Please try again later.");
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const generateConditionalColumn = (column: {
    name: string;
    label: string;
    bodyRenderer: (arg0: any) => any;
  }) => {
    if (column.name === "UpdatedBy") {
      return {
        name: "Id",
        options: {
          filter: true,
          sort: true,
          viewColumns: false,
          customHeadLabelRender: () =>
            generateCustomHeaderName("Create Task Icon"),
          customBodyRender: (value: number, tableMeta: any) => {
            const isAllowed =
              tableMeta.rowData[3] !== null &&
              tableMeta.rowData[4] !== null &&
              tableMeta.rowData[5] !== null &&
              tableMeta.rowData[tableMeta.rowData.length - 3] !== null &&
              (tableMeta.rowData[tableMeta.rowData.length - 2] === 2 ||
                tableMeta.rowData[tableMeta.rowData.length - 2] === 3 ||
                tableMeta.rowData[tableMeta.rowData.length - 2] === 5) &&
              !tableMeta.rowData[tableMeta.rowData.length - 6];
            return (
              <div className={`flex items-center justify-center`}>
                {isAllowed ? (
                  <ColorToolTip title="Create Task" placement="left">
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        if (isAllowed) {
                          setIsCreateTaskOpen(true);
                          setCreateTaskId(value);
                        }
                      }}
                    >
                      <AddPlusIcon color="black" />
                    </div>
                  </ColorToolTip>
                ) : (
                  <ColorToolTip
                    title="Task creation allowed for 'In Progress,' 'Waiting for Client,' and 'Closed' tickets."
                    placement="left"
                  >
                    <div className="cursor-not-allowed">
                      <AddPlusIcon color={"gray"} />
                    </div>
                  </ColorToolTip>
                )}
              </div>
            );
          },
        },
      };
    } else if (column.name === "EmailTypeTAT") {
      return {
        name: "EmailTypeTAT",
        options: {
          filter: true,
          sort: true,
          viewColumns: false,
          customHeadLabelRender: () => generateCustomHeaderName("SLA Time"),
          customBodyRender: (value: number) => {
            return (
              <>
                {!!value ? (
                  <div className={`flex items-center justify-center`}>
                    {`${value < 0 ? "-" : ""}${String(
                      Math.floor(Math.abs(value) / 3600)
                    ).padStart(2, "0")}:${String(
                      Math.floor((Math.abs(value) % 3600) / 60)
                    ).padStart(2, "0")}:${String(Math.abs(value) % 60).padStart(
                      2,
                      "0"
                    )}`}
                  </div>
                ) : (
                  "-"
                )}
              </>
            );
          },
        },
      };
    } else if (column.name === "TotalTimeSpent") {
      return {
        name: "TotalTimeSpent",
        options: {
          filter: true,
          sort: true,
          viewColumns: false,
          customHeadLabelRender: () => generateCustomHeaderName("Total Time"),
          customBodyRender: (value: number, tableMeta: any) => {
            return (
              <>
                {!!value ? (
                  <div className={`flex items-center justify-center`}>
                    {`${value < 0 ? "-" : ""}${String(
                      Math.floor(Math.abs(value) / 3600)
                    ).padStart(2, "0")}:${String(
                      Math.floor((Math.abs(value) % 3600) / 60)
                    ).padStart(2, "0")}:${String(Math.abs(value) % 60).padStart(
                      2,
                      "0"
                    )}`}
                    {tableMeta.rowData[tableMeta.rowData.length - 4] && (
                      <ColorToolTip title="Sync" placement="top" arrow>
                        <span
                          className="cursor-pointer"
                          onClick={() => {
                            getSyncTime(tableMeta.rowData[0]);
                          }}
                        >
                          <RestartButton />
                        </span>
                      </ColorToolTip>
                    )}
                  </div>
                ) : (
                  "-"
                )}
              </>
            );
          },
        },
      };
    } else if (column.name === "TagList") {
      return {
        name: "TagList",
        options: {
          filter: true,
          sort: true,
          viewColumns: false,
          customHeadLabelRender: () => generateCustomHeaderName("Tag"),
          customBodyRender: (value: string[], tableMeta: any) => {
            return value.length <= 0 ? (
              "-"
            ) : (
              <div className="flex items-center justify-start gap-2">
                {value.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      backgroundColor: "#e0e0e0",
                      borderRadius: "12px",
                      padding: "4px 8px",
                      fontSize: "14px",
                      cursor: "default",
                    }}
                  >
                    <span>{item}</span>
                    <span
                      onClick={() =>
                        handleDeleteTag(item, tableMeta.rowData[0])
                      }
                      style={{
                        marginLeft: "8px",
                        color: "#A5A5A5",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      ✕
                    </span>
                  </div>
                ))}
              </div>
            );
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
    } else if (column.name === "ClientId") {
      return {
        name: "ClientId",
        options: {
          display: false,
          viewColumns: false,
        },
      };
    } else if (column.name === "Status") {
      return {
        name: "Status",
        options: {
          display: false,
          viewColumns: false,
        },
      };
    } else if (column.name === "ApprovalId") {
      return {
        name: "ApprovalId",
        options: {
          display: false,
          viewColumns: false,
        },
      };
    } else if (column.name === "IsSyncOn") {
      return {
        name: "IsSyncOn",
        options: {
          display: false,
          viewColumns: false,
        },
      };
    } else if (column.name === "MarkAsRead") {
      return {
        name: "MarkAsRead",
        options: {
          display: false,
          viewColumns: false,
        },
      };
    } else if (column.name === "IsWorkItemCreated") {
      return {
        name: "IsWorkItemCreated",
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

  const inboxCols = [
    ...inboxColsConfig.slice(0, inboxColsConfig.length - 1),
    {
      name: "UpdatedBy",
      label: "Create Task Icon",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "IsWorkItemCreated",
      options: {
        display: false,
        viewColumns: false,
      },
    },
    {
      name: "MarkAsRead",
      options: {
        display: false,
        viewColumns: false,
      },
    },
    {
      name: "IsSyncOn",
      options: {
        display: false,
        viewColumns: false,
      },
    },
    {
      name: "ApprovalId",
      options: {
        display: false,
        viewColumns: false,
      },
    },
    {
      name: "Status",
      options: {
        display: false,
        viewColumns: false,
      },
    },
    ...inboxColsConfig.slice(inboxColsConfig.length - 1),
  ].map((col: any) => {
    return generateConditionalColumn(col);
  });

  const propsForActionBar = {
    selectedRowsCount,
    selectedRows,
    selectedRowIds,
    selectedRowClientId,
    selectedRowEmailType,
    selectedRowAssignee,
    selectedRowStatus,
    getData,
    handleClearSelection,
    tagDropdown,
    getTagDropdownData,
  };

  return (
    <>
      {fileds.loaded ? (
        <div>
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
                  "Inbox",
                  "Save",
                  "EmailBox"
                )
                  ? "multiple"
                  : "none",
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
        </div>
      ) : (
        <ReportLoader />
      )}
      {/* Action Bar */}
      <InboxActionBar
        tab={""}
        {...propsForActionBar}
        getOverLay={(e: boolean) => setLoading(e)}
      />

      <DeleteDialog
        isOpen={isCreateTaskOpen}
        onClose={() => {
          setIsCreateTaskOpen(false);
          setCreateTaskId(0);
        }}
        onActionClick={createTask}
        Title={"Create Task"}
        firstContent={"Are you sure you want to create task?"}
        secondContent={""}
        buttonContent={true}
      />
      {loading ? <OverLay /> : ""}
    </>
  );
};

export default InboxTable;
