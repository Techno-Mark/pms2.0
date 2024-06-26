"use client";

import React, { useEffect, useRef, useState } from "react";
import TableActionIcon from "@/assets/icons/TableActionIcon";
import "next-ts-lib/dist/index.css";
import ReportLoader from "@/components/common/ReportLoader";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  TableRow,
  ThemeProvider,
} from "@mui/material";
import {
  generateCommonBodyRender,
  generateCustomHeaderName,
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import MUIDataTable from "mui-datatables";
import {
  ProcessInitialFilter,
  ProcessList,
  SettingAction,
  SettingProps,
} from "@/utils/Types/settingTypes";

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  GlobalFilter: null,
  PageNo: pageNo,
  PageSize: pageSize,
  SortColumn: "",
  IsDesc: 0,
  IsBillable: null,
  IsProductive: null,
  WorkTypeFilter: null,
  DepartmentId: null,
  GlobalSearch: "",
};

function Process({
  onOpen,
  onEdit,
  onDataFetch,
  getOrgDetailsFunction,
  canView,
  canEdit,
  canDelete,
  onSearchData,
  onSearchClear,
  onHandleExport,
}: SettingProps) {
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState<ProcessList[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredObject, setFilteredOject] =
    useState<ProcessInitialFilter>(initialFilter);

  useEffect(() => {
    if (onSearchData.trim().length >= 0) {
      setFilteredOject({
        ...filteredObject,
        GlobalSearch: onSearchData.trim(),
        PageNo: 1,
      });
      setPage(0);
    }
  }, [onSearchData]);

  useEffect(() => {
    const fetchData = async () => {
      const Org_Token = await localStorage.getItem("Org_Token");
      if (Org_Token !== null) {
        getAll();
        onDataFetch(fetchData);
      } else {
        setTimeout(fetchData, 1000);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [filteredObject]);

  const getAll = async () => {
    setLoader(true);
    const params = filteredObject;
    const url = `${process.env.pms_api_url}/process/GetAll`;
    const successCallback = (
      ResponseData: { List: ProcessList[]; TotalCount: number },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0 ? true : false);
        setLoader(false);
        setData(ResponseData.List);
        setTotalCount(ResponseData.TotalCount);
        getOrgDetailsFunction?.();
      } else {
        setLoader(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleActionValue = async (actionId: string, id: number) => {
    setSelectedRowId(id);
    if (actionId.toLowerCase() === "edit") {
      onEdit(id);
    }
    if (actionId.toLowerCase() === "delete") {
      setIsDeleteOpen(true);
    }
  };

  const closeModal = () => {
    setIsDeleteOpen(false);
  };

  const handleDeleteRow = async () => {
    const params = {
      ProcessId: selectedRowId,
    };
    const url = `${process.env.pms_api_url}/process/Delete`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Process has been deleted successfully!");
        onSearchClear();
        setIsDeleteOpen(false);
        setFilteredOject({
          ...filteredObject,
          GlobalSearch: "",
          PageNo: 1,
        });
      }
    };
    callAPI(url, params, successCallback, "POST");
    setIsDeleteOpen(false);
    onSearchClear();
    setSelectedRowId(null);
    setPage(0);
    setRowsPerPage(10);
  };

  const Actions = ({ actions, id }: SettingAction) => {
    const actionsRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    useEffect(() => {
      window.addEventListener("click", handleOutsideClick);
      return () => {
        window.removeEventListener("click", handleOutsideClick);
      };
    }, []);

    const actionPermissions = actions.filter(
      (action: string) =>
        (action.toLowerCase() === "edit" && canEdit) ||
        (action.toLowerCase() === "delete" && canDelete)
    );

    return actionPermissions.length > 0 ? (
      <div>
        <span
          ref={actionsRef}
          className="w-5 h-5 cursor-pointer relative"
          onClick={() => setOpen(!open)}
        >
          <TableActionIcon />
        </span>
        {open && (
          <React.Fragment>
            <div className="absolute top-30 right-[1rem] z-10 flex justify-center items-center">
              <div className="py-2 border border-lightSilver rounded-md bg-pureWhite shadow-lg ">
                <ul className="w-28">
                  {actionPermissions.map((action: string, index: number) => (
                    <li
                      key={index}
                      onClick={() => handleActionValue(action, id)}
                      className="flex w-full h-9 px-3 hover:bg-lightGray !cursor-pointer"
                    >
                      <div className="flex justify-center items-center ml-2 cursor-pointer">
                        <label className="inline-block text-xs cursor-pointer">
                          {action}
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    ) : (
      <div className="w-5 h-5 relative opacity-50 pointer-events-none">
        <TableActionIcon />
      </div>
    );
  };

  const generateConditionalColumn = (
    column: {
      name: string;
      label: string;
      bodyRenderer: (arg0: any) => any;
    },
    rowDataIndex: number
  ) => {
    if (column.label === "Activity") {
      return {
        name: "ActivityList",
        options: {
          filter: true,
          viewColumns: false,
          sort: false,
          customHeadLabelRender: () => generateCustomHeaderName("Activity"),
          customBodyRender: (value: string[]) => {
            const modifiedList = value.map((activity, index) =>
              index === 0 ? activity : ","
            );
            const firstActivity = modifiedList[0];
            const remainingCount = modifiedList.filter(
              (item) => item === ","
            ).length;

            return (
              <div>
                {value.length > 0 ? (
                  <>
                    {firstActivity}
                    {remainingCount > 0 ? `, +${remainingCount}` : ""}
                  </>
                ) : (
                  "-"
                )}
              </div>
            );
          },
        },
      };
    } else if (column.label === "Productive/Non-Productive") {
      return {
        name: "IsProductive",
        options: {
          filter: true,
          viewColumns: false,
          sort: false,
          customHeadLabelRender: () =>
            generateCustomHeaderName("Productive/Non-Productive"),
          customBodyRender: (value: boolean) => {
            return <div>{value ? "Productive" : "Non-Productive"}</div>;
          },
        },
      };
    } else if (column.label === "Est. Time") {
      return {
        name: "EstimatedHour",
        options: {
          filter: true,
          viewColumns: false,
          sort: false,
          customHeadLabelRender: () => generateCustomHeaderName("Est. Time"),
          customBodyRender: (value: number) => {
            const hours = Math.floor(value / 3600);
            const remainingSeconds = value % 3600;
            const minutes = Math.floor(remainingSeconds / 60);
            const remainingSecondsFinal = remainingSeconds % 60;
            const formattedTime = `${hours
              .toString()
              .padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${remainingSecondsFinal
              .toString()
              .padStart(2, "0")}`;
            return <div>{formattedTime}</div>;
          },
        },
      };
    } else if (column.label === "Billable/Non-Billable") {
      return {
        name: "IsBillable",
        options: {
          filter: true,
          viewColumns: false,
          sort: false,
          customHeadLabelRender: () =>
            generateCustomHeaderName("Billable/Non-Billable"),
          customBodyRender: (value: boolean) => {
            return <div>{value ? "Billable" : "Non-Billable"}</div>;
          },
        },
      };
    } else if (column.label === "Actions") {
      return {
        name: "ProcessId",
        options: {
          filter: true,
          viewColumns: false,
          sort: false,
          customHeadLabelRender: () => generateCustomHeaderName("Actions"),
          customBodyRender: (value: number) => {
            return <Actions actions={["Edit", "Delete"]} id={value} />;
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

  const column = [
    {
      name: "ParentProcessName",
      label: "Process",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ChildProcessName",
      label: "Sub-Process",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "WorkTypeName",
      label: "Type Of Work",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "DepartmentName",
      label: "Department",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ReturnTypeName",
      label: "Return Type",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ActivityList",
      label: "Activity",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "EstimatedHour",
      label: "Est. Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "IsProductive",
      label: "Productive/Non-Productive",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "IsBillable",
      label: "Billable/Non-Billable",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ProcessId",
      label: "Actions",
      bodyRenderer: generateCommonBodyRender,
    },
  ];

  const projectColumns = column.map((col: any) => {
    return generateConditionalColumn(col, 10);
  });

  const options: any = {
    filterType: "checkbox",
    responsive: "standard",
    tableBodyHeight: "71.8vh",
    viewColumns: false,
    filter: false,
    print: false,
    download: false,
    search: false,
    pagination: false,
    selectToolbarPlacement: "none",
    draggableColumns: {
      enabled: true,
      transitionTime: 300,
    },
    expandableRows: true,
    renderExpandableRow: (rowData: null, rowMeta: any) => {
      return (
        <React.Fragment>
          <tr>
            <td colSpan={12}>
              <TableContainer component={Paper}>
                <Table style={{ maxWidth: "650" }} aria-label="simple table">
                  <TableBody>
                    <span className="ml-16">
                      {data[rowMeta.rowIndex].ActivityList.length > 0 ? (
                        data[rowMeta.rowIndex].ActivityList.map(
                          (i: string, index: number) => {
                            return (
                              <TableRow className="h-12" key={index}>
                                <span className="flex items-center justify-start pt-3">
                                  {index ===
                                  data[rowMeta.rowIndex].ActivityList.length - 1
                                    ? i
                                    : i + ", "}
                                </span>
                              </TableRow>
                            );
                          }
                        )
                      ) : (
                        <TableRow className="h-12">
                          <span className="flex items-center justify-start pt-3">
                            No data found.
                          </span>
                        </TableRow>
                      )}
                    </span>
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

  return (
    <>
      {canView ? (
        loader ? (
          <ReportLoader />
        ) : (
          <>
            <div className="muiTableActionProcess">
              <ThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                  data={data}
                  columns={projectColumns}
                  title={undefined}
                  options={{
                    ...options,
                    textLabels: {
                      body: {
                        noMatch: (
                          <div className="flex items-start">
                            <span>
                              Currently there is no record, you may&nbsp;
                              <a
                                className="text-secondary underline cursor-pointer"
                                onClick={onOpen}
                              >
                                create process
                              </a>
                              &nbsp;to continue.
                            </span>
                          </div>
                        ),
                        toolTip: "",
                      },
                    },
                  }}
                  data-tableid="Datatable"
                />
                <TablePagination
                  // className="mt-[10px]"
                  component="div"
                  count={totalCount}
                  page={page}
                  onPageChange={(
                    event: React.MouseEvent<HTMLButtonElement> | null,
                    newPage: number
                  ) => {
                    handlePageChangeWithFilter(
                      newPage,
                      setPage,
                      setFilteredOject
                    );
                  }}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(
                    event: React.ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >
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
            </div>

            {/* Delete Modal */}
            {isDeleteOpen && (
              <DeleteDialog
                isOpen={isDeleteOpen}
                onClose={closeModal}
                onActionClick={handleDeleteRow}
                Title={"Delete Project"}
                firstContent={"Are you sure you want to delete Process?"}
                secondContent={
                  "If you delete Process, you will permanently lose Process and Process related data."
                }
              />
            )}
          </>
        )
      ) : (
        <div className="flex justify-center items-center py-[17px] text-[14px] text-red-500">
          You don&apos;t have the privilege to view data.
        </div>
      )}
    </>
  );
}

export default Process;
