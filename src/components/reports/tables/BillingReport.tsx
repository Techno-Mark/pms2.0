import dayjs from "dayjs";
import { toast } from "react-toastify";
import MUIDataTable from "mui-datatables";
import {
  generateCustomHeaderName,
  generateCommonBodyRender,
  generateInitialTimer,
  generateDateWithTime,
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
  const [btcData, setBTCData] = useState<any>([]);
  const [finalBTCData, setFinalBTCData] = useState<any>([]);
  const [isBTCSaved, setBTCSaved] = useState<boolean>(false);
  const [raisedInvoice, setRaisedInvoice] = useState<any>([]);
  const [selectedIndex, setSelectedIndex] = useState([]);
  const [billingReportData, setBiliingReportData] = useState<any>([]);
  const [billingCurrentPage, setBiliingCurrentPage] = useState<number>(0);
  const [billingRowsPerPage, setBillingRowsPerPage] = useState<any>(10);

  const getData = async (arg1: any) => {
    setBillingReportFields({
      ...billingReportFields,
      loaded: false,
    });
    const url = `${process.env.report_api_url}/report/billing`;

    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0);
        setBiliingReportData(ResponseData.List);

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

  const saveBTCData = async (arg1: any) => {
    const params = { selectedArray: arg1 };
    const url = `${process.env.report_api_url}/report/billing/savebtc`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
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

  const handleClearSelection = () => {
    setSelectedIndex([]);
    setRaisedInvoice([]);
    setBTCData([]);
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setBiliingCurrentPage(newPage);

    getData({
      ...filteredData,
      pageNo: newPage + 1,
      pageSize: billingRowsPerPage,
    });
    handleClearSelection();
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setBiliingCurrentPage(0);
    setBillingRowsPerPage(parseInt(event.target.value));

    getData({
      ...filteredData,
      pageNo: 1,
      pageSize: event.target.value,
    });
    handleClearSelection();
  };

  const handleBTCData = (newValue: any, workItemId: any) => {
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

  const mergeBTCDataAndRaisedInvoiceArrays = (array1: any, array2: any) => {
    const map = new Map();

    array1.forEach((item: any) => {
      map.set(item.workItemId, new Object({ ...item, IsBTC: false }));
    });

    array2.forEach((item: any) => {
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

  const generateBTCFieldBodyRender = (bodyValue: any, TableMeta: any) => {
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

  const columns: any[] = [
    {
      name: "WorkItemId",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Task ID"),
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any, tableMeta: any) => {
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
        customBodyRender: (value: any, tableMeta: any) => {
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
          selectableRows: "multiple",
          rowsSelected: isBTCSaved ? [] : selectedIndex,
          onRowSelectionChange: (i: any, j: any, selectedRowsIndex: any) => {
            if (selectedRowsIndex.length > 0) {
              const data = selectedRowsIndex.map(
                (d: any) =>
                  new Object({
                    workItemId: billingReportData[d].WorkItemId,
                    btcValue:
                      billingReportData[d].BTC !== null
                        ? toSeconds(billingReportData[d].BTC)
                        : billingReportData[d].BTC,
                    IsBTC: true,
                  })
              );
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
          // billingReportFields.dataCount <= 10
          //   ?
          [10, 25, 50, 100, 500]
          // : billingReportFields.dataCount <= 20
          // ? [10, billingReportFields.dataCount]
          // : billingReportFields.dataCount <= 30
          // ? [10, 20, billingReportFields.dataCount]
          // : billingReportFields.dataCount <= 50
          // ? [10, 25, billingReportFields.dataCount]
          // : [10, 25, 50, billingReportFields.dataCount]
        }
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default BillingReport;
