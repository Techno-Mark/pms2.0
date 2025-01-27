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

const History = ({
  activeTab,
  ticketId,
}: {
  activeTab: number;
  ticketId: number;
}) => {
  const [historyData, setHistoryData] = useState<{
    loaded: boolean;
    data: any;
    tableDataCount: number;
  }>({
    loaded: true,
    data: [],
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
          data: ResponseData.TicketHistory,
          tableDataCount: ResponseData.TicketHistory.length,
        });
      } else {
        setHistoryData({
          ...historyData,
          loaded: true,
        });
      }
    };
    callAPI(
      url,
      {
        TicketId: ticketId,
        TabId: 4,
        AttachmentType: 0,
        FromDate:
          fromDate.toString().trim().length <= 0
            ? toDate.toString().trim().length <= 0
              ? null
              : getFormattedDate(toDate)
            : getFormattedDate(fromDate),
        ToDate:
          toDate.toString().trim().length <= 0
            ? fromDate.toString().trim().length <= 0
              ? null
              : getFormattedDate(fromDate)
            : getFormattedDate(toDate),
      },
      successCallback,
      "POST"
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      getReportTaskList();
    }, 500);
    return () => clearTimeout(timer);
  }, [fromDate, toDate]);

  const historyColConfig = [
    {
      name: "UpdatedOn",
      label: "Date & Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "UpdatedBy",
      label: "User",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Field",
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
              maxDate={!!toDate ? dayjs(toDate) : dayjs(Date.now())}
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
