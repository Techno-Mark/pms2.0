import { toast } from "react-toastify";
import MUIDataTable from "mui-datatables";
import {
  generateCustomHeaderName,
  generateCommonBodyRender,
  generateInitialTimer,
  generateDateWithoutTime,
  generateCommonBodyInvoice,
} from "@/utils/datatable/CommonFunction";
import React, { useEffect, useState } from "react";
import { toSeconds } from "@/utils/timerFunctions";
import { options } from "@/utils/datatable/TableOptions";
import ReportLoader from "@/components/common/ReportLoader";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { BillingReportFieldsType } from "../types/FieldsType";
import { billingreport_InitialFilter } from "@/utils/reports/getFilters";
import {
  Button,
  Paper,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  ThemeProvider,
} from "@mui/material";
import { callAPI } from "@/utils/API/callAPI";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import {
  ArrowDropDownIcon,
  LocalizationProvider,
  TimeField,
} from "@mui/x-date-pickers";
import { DialogTransition } from "@/utils/style/DialogTransition";
import CloseIcon from "@/assets/icons/reports/CloseIcon";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

interface Response {
  BillingReportFilters: any | null;
  List: List[] | [];
  TotalCount: number;
}

interface IsBTCBtcValue {
  WorkItemSubmissionIds: number[];
  btcValue: number;
  IsBTC: boolean;
}

interface FilteredData {
  pageNo: number;
  pageSize: number;
  sortColumn: string;
  isDesc: boolean;
  globalSearch: string;
  startDate: string | null;
  endDate: string | null;
  isDownload: boolean;
  clients: number[] | [];
  IsBTC: boolean;
  projects: any[] | number;
  returnTypeId: number | null;
  typeofReturnId: number | null;
  assigneeId: number | null;
  reviewerId: number | null;
  numberOfPages: number | null;
}

interface BillingLogsList {
  WorkItemSubmissionId: number;
  WorkItemId: number;
  UpdatedBy: string;
  UpdatedOn: string;
  NewValue: string;
  OldValue: string;
}

interface BillingDataList {
  WorkItemSubmissionId: number;
  WorkItemId: number;
  PreparationDate: string | null;
  ReviewerDate: string | null;
  PreparationTime: string | null;
  ReviewerTime: string | null;
  EditedHours: string | null;
  TotalTime: string | null;
  IsBTC: number | null;
  BTC: string;
  ReviewerEditedTime: string;
  BillingLogs: BillingLogsList[] | [];
}

interface List {
  TaskName: string;
  WorkItemId: number;
  WorkItemSubmissionIds: number[];
  ClientId: number | null;
  ClientName: string;
  ProjectId: number | null;
  ProjectName: string;
  TaskCreatedDate: string;
  ProcessId: number | null;
  ProcessName: string;
  SubProcessId: number | null;
  SubProcessName: string;
  Description: string | null;
  AssigneeId: number | null;
  AssigneeName: string;
  ReviewerId: number | null;
  ReviewerName: string;
  Quantity: number;
  EstimatedHour: string;
  TotalTime: string;
  PreparationTime: string;
  ReviewerTime: string;
  StandardTime: string;
  EditedHours: string | null;
  TaxReturnType: string | null;
  TypeOfReturn: string | null;
  BTC: string;
  NoOfPages: number | null;
  ReturnYear: string | null;
  PreparationDate: string | null;
  ReviewerDate: string | null;
  IsBTC: number | null;
  WorkItemSubmissionId: null;
  ReviewerEditedTime: string;
  BillingData: BillingDataList[];
}

interface Response {
  BillingReportFilters: any | null;
  List: List[] | [];
  TotalCount: number;
}

const BTCField = ({
  billingListInsideData,
  setBillingListInsideData,
  handleBTCData,
  value,
  tableMeta,
}: any) => {
  const getFormattedTime = (newValue: any) => {
    if (newValue !== null) {
      const hours = isNaN(newValue.$H) ? "00" : newValue.$H;
      const minutes = isNaN(newValue.$m) ? "00" : newValue.$m;
      const seconds = isNaN(newValue.$s) ? "00" : newValue.$s;

      return `${hours}:${minutes}:${seconds}`;
    }
    return "00:00:00";
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {!billingListInsideData[tableMeta.rowIndex].IsBTC ? (
        <TimeField
          label="BTC Time"
          value={
            billingListInsideData[tableMeta.rowIndex].BTC === null ||
            billingListInsideData[tableMeta.rowIndex].BTC === 0
              ? dayjs("0000-00-00T00:00:00")
              : dayjs(`0000-00-00T${value}`)
          }
          onChange={(newValue: any) => {
            setBillingListInsideData((prevData: any) =>
              prevData.map((data: any, index: number) =>
                index === tableMeta.rowIndex
                  ? {
                      ...data,
                      BTC: getFormattedTime(newValue),
                    }
                  : { ...data }
              )
            );
            handleBTCData(
              newValue,
              billingListInsideData[tableMeta.rowIndex].WorkItemSubmissionId
            );
          }}
          format="HH:mm:ss"
          variant="standard"
        />
      ) : (
        <TextField
          disabled
          label="BTC Time"
          placeholder="00:00:00"
          variant="standard"
          fullWidth
          value={value === null || value === 0 ? "00:00:00" : value}
        />
      )}
    </LocalizationProvider>
  );
};

const BillingReport = ({
  filteredData,
  hasRaisedInvoiceData,
  isSavingBTCData,
  onSaveBTCDataComplete,
  searchValue,
  onHandleExport,
}: any) => {
  const [billingReportFields, setBillingReportFields] =
    useState<BillingReportFieldsType>({
      loaded: false,
      dataCount: 0,
    });
  const [btcData, setBTCData] = useState<IsBTCBtcValue[]>([]);
  const [finalBTCData, setFinalBTCData] = useState<IsBTCBtcValue[]>([]);
  const [isBTCSaved, setBTCSaved] = useState<boolean>(false);
  const [raisedInvoice, setRaisedInvoice] = useState<IsBTCBtcValue[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number[]>([]);
  const [billingReportData, setBiliingReportData] = useState<List[]>([]);
  const [billingCurrentPage, setBiliingCurrentPage] = useState<number>(0);
  const [billingRowsPerPage, setBillingRowsPerPage] = useState<number>(10);
  const [isBillingExpanded, setIsBillingExpanded] = useState<boolean>(false);
  const [clickedBillingRowId, setClickedBillingRowId] = useState<number>(-1);
  const billingAnchorElFilter: HTMLButtonElement | null = null;
  const openBillingFilter = Boolean(billingAnchorElFilter);
  const billingIdFilter = openBillingFilter ? "simple-popover" : undefined;
  const [billingListInsideData, setBillingListInsideData] = useState<
    BillingDataList[]
  >([]);
  const [billingListInsideTaskName, setBillingListInsideTaskName] =
    useState("");
  const [isBTCSavedInside, setBTCSavedInside] = useState<boolean>(false);
  const [raisedInvoiceInside, setRaisedInvoiceInside] = useState<
    IsBTCBtcValue[]
  >([]);
  const [selectedIndexInside, setSelectedIndexInside] = useState<number[]>([]);
  const [btcDataInside, setBTCDataInside] = useState<IsBTCBtcValue[]>([]);
  const [finalBTCDataInside, setFinalBTCDataInside] = useState<IsBTCBtcValue[]>(
    []
  );

  const handleClearSelection = () => {
    setSelectedIndex([]);
    setRaisedInvoice([]);
    setBTCData([]);
  };

  const getData = async (arg1: FilteredData) => {
    setBillingReportFields({
      ...billingReportFields,
      loaded: false,
    });
    const url = `${process.env.report_api_url}/report/billing`;

    const successCallback = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0);
        setBiliingReportData(ResponseData.List);
        handleClearSelection();
        setBillingReportFields({
          ...billingReportFields,
          loaded: true,
          dataCount: ResponseData.TotalCount,
        });
      } else {
        setBillingReportFields({
          ...billingReportFields,
          loaded: true,
        });
      }
    };

    callAPI(url, arg1, successCallback, "post");
  };

  const saveBTCData = async (arg1: IsBTCBtcValue[] | [], arg2?: string) => {
    const params = {
      selectedArray:
        filteredData !== null && filteredData.IsBTC === true
          ? arg1.map((i: IsBTCBtcValue) => new Object({ ...i, IsBTC: null }))
          : arg1,
    };
    const url = `${process.env.report_api_url}/report/billing/savebtc`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setBTCSaved(true);
        onSaveBTCDataComplete(false);
        setBTCData([]);
        setRaisedInvoice([]);
        setFinalBTCData([]);
        setSelectedIndex([]);
        setBTCSavedInside(false);
        setBTCDataInside([]);
        setRaisedInvoiceInside([]);
        setFinalBTCDataInside([]);
        setSelectedIndexInside([]);
        setIsBillingExpanded(false);
        handleClearSelection();
        getData(
          filteredData !== null ? filteredData : billingreport_InitialFilter
        );
        toast.success(
          arg2 === "save"
            ? "BTC Data saved successfully."
            : filteredData !== null && filteredData.IsBTC === true
            ? "Invoice Unraised."
            : "Invoice Raised successfully."
        );
        setTimeout(() => {
          setBTCSaved(false);
          setBTCSavedInside(false);
        }, 100);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setBiliingCurrentPage(newPage);
    if (filteredData !== null) {
      getData({
        ...filteredData,
        globalSearch: searchValue,
        pageNo: newPage + 1,
        pageSize: billingRowsPerPage,
      });
    } else {
      getData({
        ...billingreport_InitialFilter,
        globalSearch: searchValue,
        pageNo: newPage + 1,
        pageSize: billingRowsPerPage,
      });
    }
    handleClearSelection();
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setBiliingCurrentPage(0);
    setBillingRowsPerPage(parseInt(event.target.value));

    if (filteredData !== null) {
      getData({
        ...filteredData,
        globalSearch: searchValue,
        pageNo: 1,
        pageSize: Number(event.target.value),
      });
    } else {
      getData({
        ...billingreport_InitialFilter,
        globalSearch: searchValue,
        pageNo: 1,
        pageSize: Number(event.target.value),
      });
    }
    handleClearSelection();
  };

  const mergeBTCDataAndRaisedInvoiceArrays = (
    array1: IsBTCBtcValue[] | [],
    array2: IsBTCBtcValue[] | []
  ) => {
    const map = new Map();

    array1.forEach((item: IsBTCBtcValue) => {
      map.set(
        item.WorkItemSubmissionIds[0],
        new Object({ ...item, IsBTC: false })
      );
    });

    array2.forEach((item: IsBTCBtcValue) => {
      const existingItem = map.get(item.WorkItemSubmissionIds[0]);

      if (existingItem) {
        existingItem.btcValue = existingItem.btcValue || item.btcValue;
        existingItem.IsBTC = true;
      } else {
        map.set(item.WorkItemSubmissionIds[0], item);
      }
    });

    const mergedArray = Array.from(map.values());
    return mergedArray;
  };

  useEffect(() => {
    if (filteredData !== null) {
      const timer = setTimeout(() => {
        getData({ ...filteredData, globalSearch: searchValue });
        setBiliingCurrentPage(0);
        setBillingRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...billingreport_InitialFilter, globalSearch: searchValue });
        setBiliingCurrentPage(0);
        setBillingRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  useEffect(
    () => hasRaisedInvoiceData(raisedInvoice.length > 0),
    [raisedInvoice]
  );

  useEffect(() => {
    if (isSavingBTCData) {
      saveBTCData(finalBTCData);
    }
  }, [isSavingBTCData]);

  useEffect(() => {
    setFinalBTCData(mergeBTCDataAndRaisedInvoiceArrays(btcData, raisedInvoice));
  }, [btcData, raisedInvoice]);

  useEffect(() => {
    setFinalBTCDataInside(
      mergeBTCDataAndRaisedInvoiceArrays(btcDataInside, raisedInvoiceInside)
    );
  }, [btcDataInside, raisedInvoiceInside]);

  const columns = [
    {
      name: "WorkItemId",
      label: "",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "WorkItemId",
      label: "Task ID",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ClientName",
      label: "Client Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ProjectName",
      label: "Project Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "TaskName",
      label: "Task Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ProcessName",
      label: "Process Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "SubProcessName",
      label: "Sub-Process Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "AssigneeName",
      label: "Prepared/Assignee",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ReviewerName",
      label: "Reviewer",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "TaskCreatedDate",
      label: "Date Created",
      bodyRenderer: generateDateWithoutTime,
    },
    // {
    //   name: "PreparationDate",
    //   label: "Date of Preparation",
    //   bodyRenderer: generateDateWithTime,
    // },
    // {
    //   name: "ReviewerDate",
    //   label: "Date of Review",
    //   bodyRenderer: generateDateWithTime,
    // },
    {
      name: "NoOfPages",
      label: "No. of Pages",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "EstimatedHour",
      label: "Est. Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      name: "Quantity",
      label: "Qty.",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "StandardTime",
      label: "Std. Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      name: "ReturnYear",
      label: "Return Year",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "PreparationTime",
      label: "Preparation Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      name: "ReviewerTime",
      label: "Reviewer Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      name: "TotalTime",
      label: "Total Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      name: "EditedHours",
      label: "Preparer Edited Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      name: "ReviewerEditedTime",
      label: "Reviewer Edited Time",
      bodyRenderer: generateInitialTimer,
    },
    // {
    //   name: "IsBTC",
    //   label: "Invoice Status",
    //   bodyRenderer: generateCommonBodyInvoice,
    // },
    {
      name: "BTC",
      label: "BTC Time",
      bodyRenderer: generateInitialTimer,
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
    if (column.label === "") {
      return {
        name: "WorkItemId",
        options: {
          filter: true,
          viewColumns: false,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName(""),
          customBodyRender: (value: number) => {
            return (
              <span
                className="flex flex-col cursor-pointer"
                onClick={() => {
                  setIsBillingExpanded(true);
                  setClickedBillingRowId(value);
                }}
              >
                <ArrowDropDownIcon />
              </span>
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

  const billingColumns = columns.map((col: any) => {
    return generateConditionalColumn(col, 9);
  });

  const getBillingListInside = () => {
    const data = billingReportData.filter(
      (i: List) => i.WorkItemId === clickedBillingRowId
    );
    setBillingListInsideTaskName(data[0].TaskName);
    setBillingListInsideData(data[0].BillingData);
  };

  const handleBTCData = (newValue: any, workItemId: number) => {
    if (newValue !== null) {
      setBTCDataInside((prevData: any) => {
        const existingIndex = prevData.findIndex(
          (obj: any) => obj.WorkItemSubmissionIds[0] === workItemId
        );

        if (existingIndex !== -1) {
          return prevData.map((obj: any, index: number) =>
            index === existingIndex
              ? {
                  ...obj,
                  btcValue: toSeconds(
                    `${newValue.$H}:${newValue.$m}:${newValue.$s}`
                  ),
                }
              : obj
          );
        } else {
          return [
            ...prevData,
            {
              WorkItemSubmissionIds: [workItemId],
              btcValue: toSeconds(
                `${newValue.$H}:${newValue.$m}:${newValue.$s}`
              ),
              IsBTC: false,
            },
          ];
        }
      });
    }
  };

  const generateBTCFieldBodyRender = (bodyValue: string, TableMeta: any) => {
    return (
      <BTCField
        billingListInsideData={billingListInsideData}
        setBillingListInsideData={setBillingListInsideData}
        handleBTCData={handleBTCData}
        value={bodyValue}
        tableMeta={TableMeta}
      />
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      await getBillingListInside();
    };
    isBillingExpanded && clickedBillingRowId > 0 && fetchData();
  }, [isBillingExpanded]);

  const expandableColumns: any[] = [
    {
      name: "PreparationDate",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Date Of Preparation"),
        customBodyRender: (value: string) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "ReviewerDate",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Date Of Review"),
        customBodyRender: (value: string) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "PreparationTime",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Preperer's Time"),
        customBodyRender: (value: string) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "ReviewerTime",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Reviewer's Time"),
        customBodyRender: (value: string) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "TotalTime",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Total Time"),
        customBodyRender: (value: string) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "EditedHours",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Preparer Edited Time"),
        customBodyRender: (value: string) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "ReviewerEditedTime",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Reviewer Edited Time"),
        customBodyRender: (value: string) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "IsBTC",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Invoice Status"),
        customBodyRender: (value: string) => {
          return generateCommonBodyInvoice(value);
        },
      },
    },
    {
      name: "BTC",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("BTC time"),
        customBodyRender: (value: string, tableMeta: any) => {
          return generateBTCFieldBodyRender(value, tableMeta);
        },
      },
    },
  ];

  const optionsExpand = {
    expandableRows: true,
    renderExpandableRow: (rowData: null, rowMeta: any) => {
      return (
        <React.Fragment>
          <tr>
            <td colSpan={12}>
              <TableContainer component={Paper}>
                <Table style={{ minWidth: "650" }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell className="font-semibold !pl-20">
                        Date & Time
                      </TableCell>
                      <TableCell className="font-semibold !pl-20">
                        Updated by
                      </TableCell>
                      <TableCell className="font-semibold !pl-20">
                        Old Value
                      </TableCell>
                      <TableCell className="font-semibold">New Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {billingListInsideData[rowMeta.rowIndex].BillingLogs
                      .length > 0 ? (
                      billingListInsideData[rowMeta.rowIndex].BillingLogs.map(
                        (i: BillingLogsList, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="w-[17.5rem] !pl-20">
                              {i.UpdatedOn === null
                                ? "00:00:00"
                                : `${i.UpdatedOn.split("T")[0]} ${
                                    i.UpdatedOn.split("T")[1]
                                  }`}
                            </TableCell>
                            <TableCell className="w-[18.5rem] !pl-20">
                              {i.UpdatedBy === null ? "-" : i.UpdatedBy}
                            </TableCell>
                            <TableCell className="w-[18.5rem] !pl-20">
                              {i.OldValue === null ? "-" : i.OldValue}
                            </TableCell>
                            <TableCell className="w-[13.5rem]">
                              {i.NewValue === null ? "-" : i.NewValue}
                            </TableCell>
                          </TableRow>
                        )
                      )
                    ) : (
                      <TableRow className="h-16">
                        <span className="flex items-center justify-start ml-16 pt-5">
                          No data found.
                        </span>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </td>
          </tr>
        </React.Fragment>
      );
    },
    elevation: 0,
    selectableRows: "none",
  };

  return billingReportFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        columns={billingColumns}
        data={billingReportData}
        title={undefined}
        options={{
          ...options,
          tableBodyHeight: "73vh",
          selectableRows: "multiple",
          // selectableRows:filteredData !== null && filteredData?.IsBTC ? "none" : "multiple",
          rowsSelected: isBTCSaved ? [] : selectedIndex,
          onRowSelectionChange: (
            i: null,
            j: null,
            selectedRowsIndex: number[] | []
          ) => {
            if (selectedRowsIndex.length > 0) {
              const data = selectedRowsIndex.map((d: number) => ({
                WorkItemSubmissionIds:
                  billingReportData[d]?.WorkItemSubmissionIds,
                btcValue:
                  billingReportData[d]?.BTC !== null
                    ? Number(toSeconds(billingReportData[d]?.BTC))
                    : 0,
                IsBTC: true,
              }));
              setSelectedIndex(selectedRowsIndex);
              setRaisedInvoice(data);
            } else {
              setRaisedInvoice([]);
              setSelectedIndex([]);
            }
          },
        }}
      />
      <TablePagination
        component="div"
        count={billingReportFields.dataCount}
        page={billingCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={billingRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={
          billingReportFields.dataCount > 100
            ? [10, 25, 50, 100, billingReportFields.dataCount]
            : [10, 25, 50, 100]
        }
      />
      <Popover
        id={billingIdFilter}
        open={isBillingExpanded}
        anchorEl={billingAnchorElFilter}
        TransitionComponent={DialogTransition}
        onClose={() => {
          setIsBillingExpanded(false);
          setClickedBillingRowId(-1);
          setBillingListInsideData([]);
          setBillingListInsideTaskName("");
          setRaisedInvoiceInside([]);
          setBTCDataInside([]);
          setSelectedIndexInside([]);
        }}
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
                Task Name:
              </label>
              <label className="text-sm font-bold font-proxima capitalize">
                {billingListInsideTaskName.length > 0
                  ? billingListInsideTaskName
                  : "-"}
              </label>
            </div>
          </div>
          <div className="flex items-center justify-center gap-5">
            <Button
              type="submit"
              variant="contained"
              color="info"
              disabled={raisedInvoiceInside.length <= 0}
              className={`whitespace-nowrap ${
                raisedInvoiceInside.length > 0 ? "!bg-secondary" : ""
              }`}
              onClick={() => saveBTCData(finalBTCDataInside)}
            >
              {filteredData !== null && filteredData?.IsBTC
                ? "Invoice UnRaise"
                : "Invoice Raise"}
            </Button>
            {(filteredData === null || !filteredData?.IsBTC) && (
              <Button
                type="submit"
                variant="contained"
                color="info"
                disabled={
                  btcDataInside.length <= 0 || raisedInvoiceInside.length > 0
                }
                className={`${
                  btcDataInside.length > 0 && raisedInvoiceInside.length === 0
                    ? "!bg-secondary"
                    : ""
                }`}
                onClick={() => saveBTCData(finalBTCDataInside, "save")}
              >
                Save
              </Button>
            )}
            <div
              className="cursor-pointer"
              onClick={() => {
                setIsBillingExpanded(false);
                setClickedBillingRowId(-1);
                setBillingListInsideData([]);
                setBillingListInsideTaskName("");
                setRaisedInvoiceInside([]);
                setBTCDataInside([]);
                setSelectedIndexInside([]);
              }}
            >
              <CloseIcon />
            </div>
          </div>
        </div>
        <MUIDataTable
          title={undefined}
          columns={expandableColumns}
          data={billingListInsideData}
          options={{
            ...options,
            ...optionsExpand,
            tableBodyHeight: "450px",
            selectableRows: "multiple",
            rowsSelected: isBTCSavedInside ? [] : selectedIndexInside,
            onRowSelectionChange: (
              i: null,
              j: null,
              selectedRowsIndex: number[] | []
            ) => {
              if (selectedRowsIndex.length > 0) {
                const data = selectedRowsIndex.map((d: number) => ({
                  WorkItemSubmissionIds: [
                    billingListInsideData[d]?.WorkItemSubmissionId,
                  ],
                  btcValue:
                    billingListInsideData[d]?.BTC !== null
                      ? Number(toSeconds(billingListInsideData[d]?.BTC))
                      : 0,
                  IsBTC: true,
                }));
                setSelectedIndexInside(selectedRowsIndex);
                setRaisedInvoiceInside(data);
              } else {
                setRaisedInvoiceInside([]);
                setSelectedIndexInside([]);
              }
            },
          }}
        />
      </Popover>
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default BillingReport;
