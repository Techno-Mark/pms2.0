import dayjs from "dayjs";
import { toast } from "react-toastify";
import MUIDataTable from "mui-datatables";
import {
  generateCustomHeaderName,
  generateCommonBodyRender,
  generateInitialTimer,
  generateDateWithTime,
  generateDateWithoutTime,
} from "@/utils/datatable/CommonFunction";
import { useEffect, useState } from "react";
import { callAPI } from "@/utils/API/callAPI";
import { toSeconds } from "@/utils/timerFunctions";
import { options } from "@/utils/datatable/TableOptions";
import ReportLoader from "@/components/common/ReportLoader";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { BillingReportFieldsType } from "../types/FieldsType";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, TimeField } from "@mui/x-date-pickers";
import { billingreport_InitialFilter } from "@/utils/reports/getFilters";
import { TablePagination, TextField, ThemeProvider } from "@mui/material";

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

interface List {
  WorkItemId: number;
  TaskName: string;
  ClientId: number;
  ClientName: string;
  ProjectId: number;
  ProjectName: string;
  TaskCreatedDate: string;
  ProcessId: number;
  ProcessName: string;
  SubProcessId: number;
  SubProcessName: string;
  Description: string | null;
  AssigneeId: number;
  AssigneeName: string;
  ReviewerId: number;
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
  NoOfPages: number;
  ReturnYear: string;
  PreparationDate: string;
  ReviewerDate: string;
  IsBTC: number;
}

interface Response {
  BillingReportFilters: any | null;
  List: List[] | [];
  TotalCount: number;
}

interface IsBTCBtcValue {
  workItemId: number;
  btcValue: number;
  IsBTC: boolean;
}

const BTCField = ({
  billingReportData,
  setBiliingReportData,
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
      {!billingReportData[tableMeta.rowIndex].IsBTC ? (
        <TimeField
          label="BTC Time"
          value={
            billingReportData[tableMeta.rowIndex].BTC === null ||
            billingReportData[tableMeta.rowIndex].BTC === 0
              ? dayjs("0000-00-00T00:00:00")
              : dayjs(`0000-00-00T${value}`)
          }
          onChange={(newValue: any) => {
            setBiliingReportData((prevData: any) =>
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
              billingReportData[tableMeta.rowIndex].WorkItemId
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
  hasBTCData,
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
  const [btcData, setBTCData] = useState<IsBTCBtcValue[] | []>([]);
  const [finalBTCData, setFinalBTCData] = useState<IsBTCBtcValue[] | []>([]);
  const [isBTCSaved, setBTCSaved] = useState<boolean>(false);
  const [raisedInvoice, setRaisedInvoice] = useState<IsBTCBtcValue[] | []>([]);
  const [selectedIndex, setSelectedIndex] = useState<number[] | []>([]);
  const [billingReportData, setBiliingReportData] = useState<List[] | []>([]);
  const [billingCurrentPage, setBiliingCurrentPage] = useState<number>(0);
  const [billingRowsPerPage, setBillingRowsPerPage] = useState<number>(10);

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

  const saveBTCData = async (arg1: IsBTCBtcValue[] | []) => {
    const params = { selectedArray: arg1 };
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
        getData(
          filteredData !== null ? filteredData : billingreport_InitialFilter
        );
        toast.success("BTC Data saved successfully!");
        setTimeout(() => setBTCSaved(false), 100);
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

  const handleBTCData = (newValue: any, workItemId: number) => {
    if (newValue !== null) {
      setBTCData((prevData: any) => {
        const existingIndex = prevData.findIndex(
          (obj: any) => obj.workItemId === workItemId
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
              workItemId: workItemId,
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

  const mergeBTCDataAndRaisedInvoiceArrays = (
    array1: IsBTCBtcValue[] | [],
    array2: IsBTCBtcValue[] | []
  ) => {
    const map = new Map();

    array1.forEach((item: IsBTCBtcValue) => {
      map.set(item.workItemId, new Object({ ...item, IsBTC: false }));
    });

    array2.forEach((item: IsBTCBtcValue) => {
      const existingItem = map.get(item.workItemId);

      if (existingItem) {
        existingItem.btcValue = existingItem.btcValue || item.btcValue;
        existingItem.IsBTC = true;
      } else {
        map.set(item.workItemId, item);
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
    () => hasBTCData(btcData.length > 0 && raisedInvoice.length === 0),
    [btcData, raisedInvoice]
  );

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

  const generateBTCFieldBodyRender = (bodyValue: string, TableMeta: any) => {
    return (
      <BTCField
        billingReportData={billingReportData}
        setBiliingReportData={setBiliingReportData}
        handleBTCData={handleBTCData}
        value={bodyValue}
        tableMeta={TableMeta}
      />
    );
  };

  const columns = [
    {
      name: "WorkItemId",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Task ID"),
        customBodyRender: (value: number) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "ClientName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Client Name"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "ProjectName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Project Name"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "TaskName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Task Name"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "ProcessName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Process Name"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "SubProcessName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Sub-Process Name"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "AssigneeName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Prepared/Assignee"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "ReviewerName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Reviewer"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "TaskCreatedDate",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Date Created"),
        customBodyRender: (value: string) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "PreparationDate",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Date of Preparation"),
        customBodyRender: (value: string) => {
          return generateDateWithTime(value);
        },
      },
    },
    {
      name: "ReviewerDate",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Date of Review"),
        customBodyRender: (value: string) => {
          return generateDateWithTime(value);
        },
      },
    },
    {
      name: "NoOfPages",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("No. of Pages"),
        customBodyRender: (value: string | number) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "EstimatedHour",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Est. Time"),
        customBodyRender: (value: string | number) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "Quantity",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Qty."),
        customBodyRender: (value: string | number) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "StandardTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Std. Time"),
        customBodyRender: (value: string) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "ReturnYear",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Return Year"),
        customBodyRender: (value: string | number) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "PreparationTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Preparation Time"),
        customBodyRender: (value: string) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "ReviewerTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Reviewer Time"),
        customBodyRender: (value: string) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "TotalTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Total Time"),
        customBodyRender: (value: string) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "EditedHours",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Edited Time"),
        customBodyRender: (value: string) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "IsBTC",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Invoice Status"),
        customBodyRender: (value: string | number) => {
          return value === 0 ? "Invoice Pending" : "Invoice Raised";
        },
      },
    },
    {
      name: "BTC",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("BTC Time"),
        customBodyRender: (value: string, tableMeta: any) => {
          return generateBTCFieldBodyRender(value, tableMeta);
        },
      },
    },
  ];

  return billingReportFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        columns={columns}
        data={billingReportData}
        title={undefined}
        options={{
          ...options,
          tableBodyHeight: "73vh",
          selectableRows:
            filteredData !== null && filteredData?.IsBTC ? "none" : "multiple",
          rowsSelected: isBTCSaved ? [] : selectedIndex,
          onRowSelectionChange: (
            i: null,
            j: null,
            selectedRowsIndex: number[] | []
          ) => {
            if (selectedRowsIndex.length > 0) {
              const data = selectedRowsIndex.map((d: number) => ({
                workItemId: billingReportData[d]?.WorkItemId,
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
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default BillingReport;
