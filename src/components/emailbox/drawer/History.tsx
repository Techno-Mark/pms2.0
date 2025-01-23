import { ThemeProvider } from "@emotion/react";
import MUIDataTable from "mui-datatables";
import React, { useEffect, useState } from "react";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { callAPI } from "@/utils/API/callAPI";
import { options } from "@/utils/datatable/TableOptions";
import ReportLoader from "@/components/common/ReportLoader";
import { generateCommonBodyRender } from "@/utils/datatable/CommonFunction";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { getFormattedDate } from "@/utils/timerFunctions";

const History = ({ activeTab }: { activeTab: number }) => {
  const [historyData, setHistoryData] = useState<{
    loaded: boolean;
    data: any;
    tableDataCount: number;
  }>({
    loaded: true,
    data: [
      {
        DateTime: "12-02-2024",
        User: "Godfray",
        Type: "Status Change",
        OldValue: "Open",
        NewValue: "In Progress",
      },
      {
        DateTime: "12-08-2024",
        User: "HLS",
        Type: "Status Change",
        OldValue: "Close",
        NewValue: "Open",
      },
    ],
    tableDataCount: 0,
  });
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    setFromDate("");
    setToDate("");
  }, [activeTab]);

  const getReportTaskList = async () => {
    setHistoryData({
      ...historyData,
      loaded: false,
    });
    const params = {};
    const url = `${process.env.emailbox_api_url}/emailbox/GetTicketDetails`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setHistoryData({
          ...historyData,
          loaded: true,
          data: ResponseData.List,
          tableDataCount: ResponseData.TotalCount,
        });
      } else {
        setHistoryData({
          ...historyData,
          loaded: true,
        });
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      getReportTaskList();
    }, 500);
    return () => clearTimeout(timer);
  }, [fromDate, toDate]);

  const historyColConfig = [
    {
      name: "DateTime",
      label: "Date & Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "User",
      label: "User",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Type",
      label: "Type",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "OldValue",
      label: "Old Value",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "NewValue",
      label: "New Value",
      bodyRenderer: generateCommonBodyRender,
    },
  ];

  const historyCols = historyColConfig.map((col: any) =>
    generateCustomColumn(col.name, col.label, col.bodyRenderer)
  );

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-4 mt-2">
        <div
          className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="From"
              // shouldDisableDate={isWeekend}
              maxDate={dayjs(toDate) || dayjs(Date.now())}
              value={fromDate === "" ? null : dayjs(fromDate)}
              onChange={(newValue: any) => setFromDate(newValue)}
              slotProps={{
                textField: {
                  readOnly: true,
                } as Record<string, any>,
              }}
            />
          </LocalizationProvider>
        </div>
        <div
          className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="To"
              // shouldDisableDate={isWeekend}
              minDate={dayjs(fromDate)}
              maxDate={dayjs(Date.now())}
              value={toDate === "" ? null : dayjs(toDate)}
              onChange={(newValue: any) => setToDate(newValue)}
              slotProps={{
                textField: {
                  readOnly: true,
                } as Record<string, any>,
              }}
            />
          </LocalizationProvider>
        </div>
      </div>
      {historyData.loaded ? (
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            data={historyData.data}
            columns={historyCols}
            title={undefined}
            options={{ ...options, tableBodyHeight: "65vh" }}
            data-tableid="task_Report_Datatable"
          />
        </ThemeProvider>
      ) : (
        <ReportLoader />
      )}
    </div>
  );
};

export default History;
