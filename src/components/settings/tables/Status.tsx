import ReportLoader from "@/components/common/ReportLoader";
import { callAPI } from "@/utils/API/callAPI";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  ThemeProvider,
} from "@mui/material";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import MUIDataTable from "mui-datatables";
import {
  generateCommonBodyRender,
  generateCustomHeaderName,
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import TableActionIcon from "@/assets/icons/TableActionIcon";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import {
  SettingAction,
  SettingProps,
  StatusDetail,
  StatusInitialFilter,
  StatusList,
} from "@/utils/Types/settingTypes";

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  PageNo: pageNo,
  PageSize: pageSize,
  SortColumn: "",
  IsDec: true,
  globalFilter: null,
  IsDefault: null,
  Type: "",
  Export: false,
  GlobalSearch: "",
  WorkTypeId: null,
};

const Status = ({
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
  currentFilterData,
}: SettingProps) => {
  const [loader, setLoader] = useState(true);
  const [statusList, setStatusList] = useState<StatusList[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredObject, setFilteredOject] =
    useState<StatusInitialFilter>(initialFilter);

  useEffect(() => {
    if (onSearchData.trim().length >= 0 || currentFilterData) {
      setFilteredOject({
        ...filteredObject,
        WorkTypeId: currentFilterData?.WorkTypeId || null,
        GlobalSearch: onSearchData.trim(),
        PageNo: 1,
      });
      setPage(0);
    }
  }, [onSearchData, currentFilterData]);

  useEffect(() => {
    const fetchData = async () => {
      const Org_Token = await localStorage.getItem("Org_Token");
      if (Org_Token !== null) {
        getStatusList();
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

  const getStatusList = async () => {
    const params = filteredObject;
    const url = `${process.env.pms_api_url}/status/GetAll`;
    const successCallback = (
      ResponseData: { List: StatusList[]; TotalCount: number },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0 ? true : false);
        setLoader(false);
        setStatusList(ResponseData.List);
        setTotalCount(ResponseData.TotalCount);
        getOrgDetailsFunction?.();
      } else {
        setLoader(false);
        setStatusList([]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const closeModal = () => {
    setIsDeleteOpen(false);
  };

  const handleDeleteRow = async () => {
    const params = {
      statusId: selectedRowId,
    };
    const url = `${process.env.pms_api_url}/status/delete`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Status has been deleted successfully!");
        onSearchClear();
        setFilteredOject({
          ...filteredObject,
          GlobalSearch: "",
          PageNo: 1,
        });
        setIsDeleteOpen(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
    setIsDeleteOpen(false);
    onSearchClear();
    setSelectedRowId(null);
    setPage(0);
    setRowsPerPage(10);
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
          className="w-5 h-5 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <TableActionIcon />
        </span>
        {open && (
          <React.Fragment>
            <div className="absolute top-30 right-[14rem] z-10 flex justify-center items-center">
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
    if (column.label === "Actions") {
      return {
        name: "StatusId",
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
    } else if (column.name === "Color") {
      return {
        name: "ColorCode",
        options: {
          filter: true,
          viewColumns: false,
          sort: false,
          customHeadLabelRender: () => generateCustomHeaderName("Color"),
          customBodyRender: (value: string) => {
            return (
              <div
                style={{
                  backgroundColor: value,
                  width: "30px",
                  height: "30px",
                  border: `2px solid ${value}`,
                  borderRadius: "5px",
                  margin: "10px 10px 10px 10px",
                }}
              ></div>
            );
          },
        },
      };
    } else if (column.name === "Name") {
      return {
        name: "Name",
        options: {
          filter: true,
          viewColumns: false,
          sort: false,
          customHeadLabelRender: () => generateCustomHeaderName("Name"),
          customBodyRender: (value: string) => {
            return <div>{value}</div>;
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
      name: "Name",
      label: "Status Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Color",
      label: "Color",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "actions",
      label: "Actions",
      bodyRenderer: generateCommonBodyRender,
    },
  ];

  const statusColumns = column.map((col: any) => {
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
                <Table style={{ minWidth: "650" }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell className="!pl-[4.5rem] font-semibold">
                        Type Of Work
                      </TableCell>
                      <TableCell className="font-semibold">
                        Display Name
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statusList[rowMeta.rowIndex].WorkTypeDetails.length > 0 ? (
                      statusList[rowMeta.rowIndex].WorkTypeDetails.map(
                        (i: StatusDetail, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="!pl-[4.5rem]">
                              {i.WorkTypeName}
                            </TableCell>
                            <TableCell>{i.DisplayName}</TableCell>
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
  return (
    <>
      {canView ? (
        loader ? (
          <ReportLoader />
        ) : (
          <>
            <div className="">
              <ThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                  data={statusList}
                  columns={statusColumns}
                  title={undefined}
                  options={{
                    ...options,
                    textLabels: {
                      body: {
                        noMatch: (
                          <div className="flex items-start">
                            <span>
                              Currently there is no record, you may{" "}
                              <a
                                className="text-secondary underline cursor-pointer"
                                onClick={onOpen}
                              >
                                create status
                              </a>{" "}
                              to continue.
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

            {/* Delete Modal  */}
            {isDeleteOpen && (
              <DeleteDialog
                isOpen={isDeleteOpen}
                onClose={closeModal}
                onActionClick={handleDeleteRow}
                Title={"Delete Status"}
                firstContent={"Are you sure you want to delete status?"}
                secondContent={
                  "If you delete status, you will permanently lose status and status related data."
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
};

export default Status;
