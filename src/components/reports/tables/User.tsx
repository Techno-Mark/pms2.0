import dayjs from "dayjs";
import {
  generateCustomHeaderName,
  generateCommonBodyRender,
  generateInitialTimer,
} from "@/utils/datatable/CommonFunction";
import MUIDataTable from "mui-datatables";
import { useEffect, useState } from "react";
import { userLegend } from "../Enum/Legend";
import { callAPI } from "@/utils/API/callAPI";
import { FieldsType } from "../types/FieldsType";
import { getDates } from "@/utils/timerFunctions";
import Legends from "@/components/common/Legends";
import { getColor } from "@/utils/reports/getColor";
import { options } from "@/utils/datatable/TableOptions";
import ReportLoader from "@/components/common/ReportLoader";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { TablePagination, ThemeProvider } from "@mui/material";
import { user_InitialFilter } from "@/utils/reports/getFilters";

const User = ({ filteredData, searchValue, onHandleExport }: any) => {
  const [userDates, setUserDates] = useState<any>([]);
  const [userFields, setUserFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [userCurrentPage, setUserCurrentPage] = useState<number>(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState<number>(10);

  const getData = async (arg1: any) => {
    setUserFields({
      ...userFields,
      loaded: false,
    });
    const url = `${process.env.report_api_url}/report/user`;

    const successCallBack = (data: any, error: any) => {
      if (data !== null && error === false) {
        onHandleExport(data.List.length > 0);
        setUserFields({
          ...userFields,
          loaded: true,
          data: data.List,
          dataCount: data.TotalCount,
        });
      } else {
        setUserFields({ ...userFields, loaded: true });
      }
    };

    callAPI(url, arg1, successCallBack, "post");
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setUserCurrentPage(newPage);
    getData({
      ...filteredData,
      pageNo: newPage + 1,
      pageSize: userRowsPerPage,
    });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setUserCurrentPage(0);
    setUserRowsPerPage(parseInt(event.target.value));

    getData({
      ...filteredData,
      pageNo: 1,
      pageSize: event.target.value,
    });
  };

  useEffect(() => {
    // getData(user_InitialFilter);
    setUserDates(getDates());
  }, []);

  useEffect(() => {
    if (filteredData !== null) {
      const timer = setTimeout(() => {
        getData({ ...filteredData, globalSearch: searchValue });
        setUserDates(
          getDates(
            filteredData.startDate === null ? "" : filteredData.startDate,
            filteredData.endDate === null ? "" : filteredData.endDate
          )
        );
        setUserCurrentPage(0);
        setUserRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...user_InitialFilter, globalSearch: searchValue });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  const isWeekend = (date: any) => {
    const day = dayjs(date).day();
    // return day === 6 || day === 0;
    return day === 0;
  };

  const generateUserNameBodyRender = (bodyValue: any, TableMeta: any) => {
    return (
      <div className="flex flex-col">
        {bodyValue === null || "" ? (
          "-"
        ) : (
          <>
            <span>{bodyValue}</span>
            <span>{userFields.data[TableMeta.rowIndex].DepartmentName}</span>
          </>
        )}
      </div>
    );
  };

  const columns: any[] = [
    {
      name: "UserName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("User Name"),
        customBodyRender: (value: any, tableMeta: any) => {
          return generateUserNameBodyRender(value, tableMeta);
        },
      },
    },
    {
      name: "ReportingManager",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Reporting To"),
      },
    },
    {
      name: "RoleType",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Designation"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    ...userDates.map(
      (date: any) =>
        new Object({
          name: "DateTimeLogs",
          options: {
            filter: true,
            sort: true,
            customHeadLabelRender: () => {
              const formattedDate = date.split("-");
              return (
                <span className="font-bold text-sm">
                  {`${
                    formattedDate[1].length === 1
                      ? `0${formattedDate[1]}`
                      : formattedDate[1]
                  }/${formattedDate[2]}/${formattedDate[0]}`}
                </span>
              );
            },
            customBodyRender: (value: any) => {
              return isWeekend(date) ? (
                <span className="text-[#2323434D] text-xl">-</span>
              ) : (
                value !== undefined &&
                  (value.filter((v: any) => v.LogDate.split("T")[0] === date)
                    .length > 0 ? (
                    <span
                      style={{
                        color: getColor(
                          value.filter(
                            (v: any) => v.LogDate.split("T")[0] === date
                          )[0].AttendanceColor,
                          true
                        ),
                      }}
                    >
                      {
                        value.filter(
                          (v: any) => v.LogDate.split("T")[0] === date
                        )[0].AttendanceStatus
                      }
                    </span>
                  ) : (
                    <span className="text-defaultRed">A</span>
                  ))
              );
            },
          },
        })
    ),
    {
      name: "PresentDays",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Present Day"),
      },
    },
    {
      name: "TotalStdTimeOfUser",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("STd. Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
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
      name: "TotalBreakTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Total Break Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
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

  return userFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        columns={columns}
        data={userFields.data}
        title={undefined}
        options={{
          ...options,
          tableBodyHeight: "67vh",
        }}
      />
      <Legends legends={userLegend} />
      <TablePagination
        component="div"
        count={userFields.dataCount}
        page={userCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={userRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default User;
