import ReportLoader from "@/components/common/ReportLoader";
import { callAPI } from "@/utils/API/callAPI";
import {
  generateCommonBodyRender,
  generateCustomHeaderName,
  generatePriorityWithColor,
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import { ColorToolTip, getMuiTheme } from "@/utils/datatable/CommonStyle";
import { worklogs_Options } from "@/utils/datatable/TableOptions";
import { Save } from "@mui/icons-material";
import { TablePagination, TextField, ThemeProvider } from "@mui/material";
import MUIDataTable from "mui-datatables";
import React, { useEffect, useState } from "react";

interface Props {
  onDataFetch: (getData: () => void) => void;
  currentFilterData: any;
  searchValue: string;
}

interface List {
  WorkItemId: number;
  TaskName: string;
  ClientId: number | null;
  ClientName: string;
  ProjectId: number | null;
  ProjectName: string;
  ProcessId: number | null;
  ProcessName: string;
  SubProcessId: number | null;
  SubProcessName: string;
  EstimateTimeSec: number | null;
  EstimateTime: string;
  StartDate: string;
  EndDate: string;
  WorkTypeId: number | null;
  WorkType: string;
  ReceiverDate: string;
  CreatedOn: string;
  DepartmentId: number | number;
  DepartmentName: string;
  TaskType: string;
  AssignedById: number | null;
  AssignedByName: string;
  ReviewerId: number | null;
  ReviewerName: string;
  ManagerId: null;
  ManagerName: string;
  PriorityId: number | null;
  PriorityName: string | null;
  Description: any;
  Quantity: number | null;
}

interface Interface {
  PageNo: number;
  PageSize: number;
  SortColumn: string | null;
  IsDesc: boolean;
  GlobalSearch: string | null;
  ClientId: number | null;
  ProjectId: number | null;
  TypeOfWork: number | null;
  Department: number | null;
  ProcessId: number | null;
  StatusIds: number[];
  AssignedBy: number | null;
  ReviewerId: number | null;
  ManagerId: number | null;
  StartDate: string | null;
  EndDate: string | null;
}

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  PageNo: pageNo,
  PageSize: pageSize,
  SortColumn: "",
  IsDesc: false,
  GlobalSearch: "",
  ClientId: null,
  ProjectId: null,
  TypeOfWork: null,
  Department: null,
  ProcessId: null,
  StatusIds: [],
  AssignedBy: null,
  ReviewerId: null,
  ManagerId: null,
  StartDate: null,
  EndDate: null,
};

const QuantityField = ({ historyData, setHistoryData, tableMeta }: any) => {
  return (
    <TextField
      label="Quantity"
      placeholder="0"
      variant="standard"
      className="!w-[100px]"
      fullWidth
      value={
        historyData[tableMeta.rowIndex].Quantity === null ||
        historyData[tableMeta.rowIndex].Quantity === 0
          ? ""
          : historyData[tableMeta.rowIndex].Quantity
      }
      onChange={(e: any) => {
          Number(e.target.value) < 10000 &&
          setHistoryData((prevData: any) =>
            prevData.map((data: any, index: number) =>
              index === tableMeta.rowIndex
                ? {
                    ...data,
                    Quantity: Number(e.target.value),
                  }
                : { ...data }
            )
          );
      }}
    />
  );
};

const DescriptionField = ({ historyData, setHistoryData, tableMeta }: any) => {
  return (
    <TextField
      label="Description"
      placeholder=""
      variant="standard"
      className="!w-[200px]"
      fullWidth
      value={
        historyData[tableMeta.rowIndex].Description === null
          ? ""
          : historyData[tableMeta.rowIndex].Description
      }
      onChange={(e: any) => {
        setHistoryData((prevData: any) =>
          prevData.map((data: any, index: number) =>
            index === tableMeta.rowIndex && e.target.value.trimStart().length < 100
              ? {
                  ...data,
                  Description: e.target.value,
                }
              : { ...data }
          )
        );
      }}
    />
  );
};

const HistoryDatatable = ({
  onDataFetch,
  currentFilterData,
  searchValue,
}: Props) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [historyData, setHistoryData] = useState<List[] | []>([]);
  const [filteredObject, setFilteredOject] = useState<Interface>(initialFilter);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [tableDataCount, setTableDataCount] = useState(0);

  useEffect(() => {
    setFilteredOject({
      ...filteredObject,
      ...currentFilterData,
    });
  }, [currentFilterData]);

  useEffect(() => {
    if (searchValue.trim().length >= 0) {
      setFilteredOject({
        ...filteredObject,
        ...currentFilterData,
        GlobalSearch: searchValue,
        PageNo: pageNo,
        PageSize: pageSize,
      });
      setPage(0);
      setRowsPerPage(10);
    }
  }, [searchValue]);

  const getHistoryList = async () => {
    setLoaded(false);
    const params = filteredObject;
    const url = `${process.env.worklog_api_url}/workitem/history/getall`;
    const successCallback = (
      ResponseData: { List: List[]; TotalCount: number; TotalTime: string },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setLoaded(true);
        setHistoryData(ResponseData.List);
        setTableDataCount(ResponseData.TotalCount);
      } else {
        setLoaded(true);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const fetchData = async () => {
      await getHistoryList();
      setLoaded(true);
      onDataFetch(() => fetchData());
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [filteredObject]);

  const generateQuantityFieldBodyRender = (TableMeta: any) => {
    return (
      <QuantityField
        historyData={historyData}
        setHistoryData={setHistoryData}
        tableMeta={TableMeta}
      />
    );
  };

  const generateDescriptionFieldBodyRender = (TableMeta: any) => {
    return (
      <DescriptionField
        historyData={historyData}
        setHistoryData={setHistoryData}
        tableMeta={TableMeta}
      />
    );
  };

  const generateSaveTaskFieldBodyRender = (value: number, TableMeta: any) => {
    return (
      <ColorToolTip title="Save">
        <button
          type="button"
          className={`${
            historyData[TableMeta.rowIndex].Description !== null &&
            historyData[TableMeta.rowIndex].Description?.toString().trim()
              .length > 0 &&
            historyData[TableMeta.rowIndex].Quantity !== null
              ? "!bg-secondary cursor-pointer"
              : "!bg-gray-300 cursor-not-allowed"
          } text-white border rounded-md px-[4px]`}
          disabled={
            historyData[TableMeta.rowIndex].Description === null ||
            historyData[TableMeta.rowIndex].Description?.toString().trim()
              .length < 0 ||
            historyData[TableMeta.rowIndex].Quantity === null
          }
          onClick={() =>
            handleSaveTask(
              historyData[TableMeta.rowIndex].WorkItemId === value
                ? historyData[TableMeta.rowIndex]
                : false
            )
          }
        >
          <Save className="w-4 h-6" />
        </button>
      </ColorToolTip>
    );
  };

  const handleSaveTask = (data: any) => {
    setLoaded(true);
    const params = {
      WorkItemId: data.WorkItemId,
      Quantity: data.Quantity,
      Description: data.Description.trim(),
    };
    const url = `${process.env.worklog_api_url}/workitem/history/savebyworkitem`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        console.log(ResponseData);
        setLoaded(true);
        getHistoryList();
      } else {
        setLoaded(true);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const HistoryTaskColumns: any[] = [
    {
      name: "WorkItemId",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Task ID"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "ClientName",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Client"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "ProjectName",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Project"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "TaskName",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Task"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "ProcessName",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Process"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "SubProcessName",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Sub-Process"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "EstimateTime",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Est. Time"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "PriorityName",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Priority"),
        customBodyRender: (value: string) => {
          return generatePriorityWithColor(value);
        },
      },
    },
    {
      name: "StartDate",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Start Date"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "EndDate",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("End Date"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "Quantity",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Quantity"),
        customBodyRender: (value: number | null, tableMeta: any) => {
          return generateQuantityFieldBodyRender(tableMeta);
        },
      },
    },
    {
      name: "Description",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Description"),
        customBodyRender: (value: string | null, tableMeta: any) => {
          return generateDescriptionFieldBodyRender(tableMeta);
        },
      },
    },
    {
      name: "WorkItemId",
      options: {
        sort: false,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Action"),
        customBodyRender: (value: number, tableMeta: any) => {
          return generateSaveTaskFieldBodyRender(value, tableMeta);
        },
      },
    },
  ];

  return (
    <>
      {loaded ? (
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            data={historyData}
            columns={HistoryTaskColumns}
            title={undefined}
            options={{
              ...worklogs_Options,
              selectableRows: "none",
              textLabels: {
                body: {
                  noMatch: (
                    <div className="flex items-start">
                      <span>Currently there is no record found.</span>
                    </div>
                  ),
                  toolTip: "",
                },
              },
            }}
            data-tableid="unassignee_Datatable"
          />
          <TablePagination
            component="div"
            count={tableDataCount}
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

export default HistoryDatatable;
