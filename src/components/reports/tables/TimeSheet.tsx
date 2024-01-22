import dayjs from "dayjs";
import { makeStyles } from "@mui/styles";
import {
  generateCustomHeaderName,
  generateCommonBodyRender,
  generateDateWithoutTime,
  generateInitialTimer,
} from "@/utils/datatable/CommonFunction";
import MUIDataTable from "mui-datatables";
import { callAPI } from "@/utils/API/callAPI";
import { FieldsType } from "../types/FieldsType";
import { timesheetLegend } from "../Enum/Legend";
import Legends from "@/components/common/Legends";
import { useEffect, useRef, useState } from "react";
import { getColor } from "@/utils/reports/getColor";
import { options } from "@/utils/datatable/TableOptions";
import CloseIcon from "@/assets/icons/reports/CloseIcon";
import ReportLoader from "@/components/common/ReportLoader";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";
import { getDates, toSeconds } from "@/utils/timerFunctions";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { timeSheet_InitialFilter } from "@/utils/reports/getFilters";
import { Popover, TablePagination, ThemeProvider } from "@mui/material";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: "12px",
  },
  bar1: {
    backgroundColor: "#0CC6AA",
  },
  bar2: {
    backgroundColor: "#FDB663",
  },
  bar3: {
    backgroundColor: "#2323434D",
  },
}));

const CustomProgressBar = ({
  totalTimeSpentForDay,
  trackedTime,
  manualTime,
  breakTime,
}: any) => {
  const classes = useStyles();

  const trackedTimePercent = Math.round(
    ((toSeconds(trackedTime)?.valueOf() ?? 0) /
      (toSeconds(totalTimeSpentForDay)?.valueOf() ?? 1)) *
      100
  );
  const manualTimePercent = Math.round(
    ((toSeconds(manualTime)?.valueOf() ?? 0) /
      (toSeconds(totalTimeSpentForDay)?.valueOf() ?? 1)) *
      100
  );
  const breakTimePercent = Math.round(
    ((toSeconds(breakTime)?.valueOf() ?? 0) /
      (toSeconds(totalTimeSpentForDay)?.valueOf() ?? 1)) *
      100
  );

  return (
    <div className={classes.root}>
      <div
        style={{
          width: `${trackedTimePercent}%`,
        }}
        className={classes.bar1}
      ></div>
      <div
        style={{
          width: `${manualTimePercent}%`,
        }}
        className={classes.bar2}
      ></div>
      <div
        style={{
          width: `${breakTimePercent}%`,
        }}
        className={classes.bar3}
      ></div>
    </div>
  );
};

const DateWiseLogsContent = ({ data, date, tableMeta }: any) => {
  const dateWiseLogsTable = useRef<HTMLDivElement>(null);
  const [clickedColumnIndex, setClickedColumnIndex] = useState<number>(-1);
  const [showDateWiseLogs, setShowDateWiseLogs] = useState<boolean>(false);
  const [dateWiseLogsData, setDateWiseLogsData] = useState<any[]>([]);

  const anchorElFilter: HTMLButtonElement | null = null;
  const openFilter = Boolean(anchorElFilter);
  const idFilter = openFilter ? "simple-popover" : undefined;

  const generateIsManulaBodyRender = (bodyValue: any) => {
    return <span className="capitalize">{bodyValue ? "yes" : "no"}</span>;
  };

  const generateIsManualHeaderRender = (headerName: string) => {
    return (
      <div className="font-bold text-sm capitalize !w-[100px]">
        {headerName}
      </div>
    );
  };

  const datewiselogsColumn: any = [
    {
      name: "TaskName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Task"),
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
        customHeadLabelRender: () => generateCustomHeaderName("Client"),
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
        customHeadLabelRender: () => generateCustomHeaderName("Project"),
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
        customHeadLabelRender: () => generateCustomHeaderName("Task/Process"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "SubProcessName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Sub-Process"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    // {
    //   name: "IsManual",
    //   options: {
    //     filter: true,
    //     sort: true,
    //     customHeadLabelRender: () => generateCustomHeaderName("Is Manual"),
    //     customBodyRender: (value: any) => {
    //       return generateIsManulaBodyRender(value);
    //     },
    //   },
    // },
    {
      name: "Description",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Description"),
      },
    },
    {
      name: "EstimateTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Est. Time"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "Status",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Status"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "Quantity",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Qty."),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "StartTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Start Date"),
        customBodyRender: (value: any) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "EndTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("End Date"),
        customBodyRender: (value: any) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "TotalStandardTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Std. Time"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "TotalTimeSpent",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => {
          return generateIsManualHeaderRender("total time");
        },
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "ReviewerStatus",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Reviewer Status"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
  ];

  useEffect(() => {
    const handleOutsideClick = (event: any) => {
      if (
        dateWiseLogsTable.current &&
        !dateWiseLogsTable.current.contains(event.target)
      ) {
        setShowDateWiseLogs(false);
      }
    };

    window.addEventListener("click", handleOutsideClick);

    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <>
      <div
        ref={dateWiseLogsTable}
        style={{
          color: getColor(
            data.filter((v: any) => v.LogDate.split("T")[0] === date)[0]
              .AttendanceColor,
            false
          ),
        }}
        className={`relative flex flex-col gap-[5px] ${
          data.filter((v: any) => v.LogDate.split("T")[0] === date)[0]
            .AttendanceColor !== 5
            ? "cursor-pointer"
            : "cursor-default"
        }`}
        onClick={() => {
          setClickedColumnIndex(tableMeta.columnIndex);
          setShowDateWiseLogs(!showDateWiseLogs);
          setDateWiseLogsData(
            data.filter((v: any) => v.LogDate.split("T")[0] === date)
          );
        }}
      >
        <span>
          {
            data.filter((v: any) => v.LogDate.split("T")[0] === date)[0]
              .AttendanceStatus
          }
        </span>
        {(data.filter((v: any) => v.LogDate.split("T")[0] === date)[0]
          .AttendanceColor === 1 ||
          data.filter((v: any) => v.LogDate.split("T")[0] === date)[0]
            .AttendanceColor === 2 ||
          data.filter((v: any) => v.LogDate.split("T")[0] === date)[0]
            .AttendanceColor === 3 ||
          data.filter((v: any) => v.LogDate.split("T")[0] === date)[0]
            .AttendanceColor === 4) && (
          <>
            <CustomProgressBar
              totalTimeSpentForDay={
                data.filter((v: any) => v.LogDate.split("T")[0] === date)[0]
                  .TotalTimeSpentForDay
              }
              trackedTime={
                data.filter((v: any) => v.LogDate.split("T")[0] === date)[0]
                  .TotalTrackedTimeLogHrsForDay
              }
              manualTime={
                data.filter((v: any) => v.LogDate.split("T")[0] === date)[0]
                  .TotalManualTimeLogHrsForDay
              }
              breakTime={
                data.filter((v: any) => v.LogDate.split("T")[0] === date)[0]
                  .TotalBreakTime
              }
            />
            <div className="flex items-center justify-between">
              <span>
                {
                  data.filter((v: any) => v.LogDate.split("T")[0] === date)[0]
                    .TotalTimeSpentForDay
                }
              </span>
              <ChevronDownIcon />
            </div>
          </>
        )}
      </div>
      <Popover
        sx={{ width: "60%" }}
        id={idFilter}
        open={showDateWiseLogs && tableMeta.columnIndex === clickedColumnIndex}
        anchorEl={anchorElFilter}
        TransitionComponent={DialogTransition}
        onClose={() => setShowDateWiseLogs(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <div className="my-4 px-4 w-full flex items-center justify-end">
          <div
            className="cursor-pointer"
            onClick={() => setShowDateWiseLogs(false)}
          >
            <CloseIcon />
          </div>
        </div>
        <MUIDataTable
          title={undefined}
          columns={datewiselogsColumn}
          data={
            dateWiseLogsData.length > 0 ? dateWiseLogsData[0].LogsDetails : []
          }
          options={{ ...options, tableBodyHeight: "350px" }}
        />
      </Popover>
    </>
  );
};

const TimeSheet = ({ filteredData, searchValue, onHandleExport }: any) => {
  const [dates, setDates] = useState<any>([]);
  const [timesheetFields, setTimesheetFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [timesheetCurrentPage, setTimesheetCurrentPage] = useState<number>(0);
  const [timesheetRowsPerPage, setTimesheetRowsPerPage] = useState<number>(10);

  const getData = async (arg1: any) => {
    setTimesheetFields({
      ...timesheetFields,
      loaded: false,
    });
    const url = `${process.env.report_api_url}/report/timesheet`;

    const successCallback = (data: any, error: any) => {
      if (data !== null && error === false) {
        onHandleExport(data.List.length > 0);
        setTimesheetFields({
          ...timesheetFields,
          loaded: true,
          data: data.List,
          dataCount: data.TotalCount,
        });
      } else {
        setTimesheetFields({ ...timesheetFields, loaded: true });
      }
    };

    callAPI(url, arg1, successCallback, "post");
  };

  //functions for handling pagination
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setTimesheetCurrentPage(newPage);
    getData({
      ...filteredData,
      pageNo: newPage + 1,
      pageSize: timesheetRowsPerPage,
    });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTimesheetCurrentPage(0);
    setTimesheetRowsPerPage(parseInt(event.target.value));

    getData({
      ...filteredData,
      pageNo: 1,
      pageSize: event.target.value,
    });
  };

  useEffect(() => {
    setDates(getDates());
  }, []);

  useEffect(() => {
    if (filteredData !== null) {
      const timer = setTimeout(() => {
        getData({ ...filteredData, globalSearch: searchValue });
        setDates(
          getDates(
            filteredData.startDate === null ? "" : filteredData.startDate,
            filteredData.endDate === null ? "" : filteredData.endDate
          )
        );
        setTimesheetCurrentPage(0);
        setTimesheetRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...timeSheet_InitialFilter, globalSearch: searchValue });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  const isWeekend = (date: any) => {
    const day = dayjs(date).day();
    // return day === 6 || day === 0;
    return day === 0;
  };

  const generateUserNameHeaderRender = (headerValue: any) => {
    return (
      <div className="font-bold text-sm capitalize !w-[100px]">
        {headerValue}
      </div>
    );
  };

  const generateUserNameBodyRender = (bodyValue: any, TableMeta: any) => {
    return (
      <div className="flex flex-col">
        <span>{bodyValue}</span>
        <span>{timesheetFields.data[TableMeta.rowIndex].DepartmentName}</span>
      </div>
    );
  };

  const columns: any[] = [
    {
      name: "UserName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateUserNameHeaderRender("User Name"),
        customBodyRender: (value: any, tableMeta: any) => {
          return generateUserNameBodyRender(value, tableMeta);
        },
      },
    },
    {
      name: "RoleType",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("designation"),
      },
    },
    {
      name: "ReportingManager",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Reporting Manager"),
      },
    },
    {
      name: "StdShiftHours",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Std Shift Hours"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "PresentDays",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Present Days"),
      },
    },
    {
      name: "TotalTimeSpentByUser",
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
      name: "TotalStandardTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Std time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "AvgTotalTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Average Total Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "AvgBreakTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Average Break Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "AvgIdleTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Average Idle Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    ...dates.map(
      (date: any) =>
        new Object({
          name: "DateWiseLogs",
          options: {
            filter: true,
            sort: true,
            customHeadLabelRender: () => {
              const formattedDate = date.split("-");
              return (
                <span className={`font-bold text-sm`}>
                  <span className="font-bold text-sm">
                    {`${
                      formattedDate[1].length === 1
                        ? `0${formattedDate[1]}`
                        : formattedDate[1]
                    }/${formattedDate[2]}/${formattedDate[0]}`}
                  </span>
                </span>
              );
            },
            customBodyRender: (value: any, tableMeta: any) => {
              return isWeekend(date) ? (
                <span className="text-[#2323434D] text-xl">-</span>
              ) : (
                value !== undefined &&
                  (value.filter((v: any) => v.LogDate.split("T")[0] === date)
                    .length > 0 ? (
                    <DateWiseLogsContent
                      data={value}
                      date={date}
                      tableMeta={tableMeta}
                    />
                  ) : (
                    <span className="text-defaultRed">A</span>
                  ))
              );
            },
          },
        })
    ),
    {
      name: "TotalIdleTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Total Idle Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
  ];

  return timesheetFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        columns={columns}
        data={timesheetFields.data}
        title={undefined}
        options={{
          ...options,
          tableBodyHeight: "67vh",
        }}
      />
      <Legends legends={timesheetLegend} />
      <TablePagination
        component="div"
        count={timesheetFields.dataCount}
        page={timesheetCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={timesheetRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default TimeSheet;
