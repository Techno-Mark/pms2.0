import { callAPI } from "@/utils/API/callAPI";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import TableActionIcon from "@/assets/icons/TableActionIcon";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import {
  generateCommonBodyRender,
  generateCustomHeaderName,
  generateDateWithTime,
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import ReportLoader from "@/components/common/ReportLoader";
import { Switch, TablePagination, ThemeProvider } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import { GroupProps, SettingAction } from "@/utils/Types/settingTypes";
import SwitchModal from "@/components/common/SwitchModal";

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  GlobalSearch: "",
  SortColumn: null,
  IsDesc: true,
  PageNo: pageNo,
  PageSize: pageSize,
  Status: true,
};

const EmailTemplate = ({
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
}: GroupProps) => {
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState<any>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredObject, setFilteredOject] = useState(initialFilter);
  const [isOpenSwitchModal, setIsOpenSwitchModal] = useState(false);
  const [switchId, setSwitchId] = useState(0);
  const [switchActive, setSwitchActive] = useState(false);

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
    const url = `${process.env.pms_api_url}/emailtemplate/getall`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        // onHandleExport(ResponseData.List.length > 0 ? true : false);
        setLoader(false);
        setData(ResponseData.List);
        setTotalCount(ResponseData.TotalCount);
        getOrgDetailsFunction?.();
      } else {
        setLoader(false);
        setData([]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const closeModal = () => {
    setIsDeleteOpen(false);
  };

  const closeSwitchModal = async () => {
    await setIsOpenSwitchModal(false);
  };

  const handleToggleEmailTemplate = async () => {
    const params = {
      IsActive: switchActive,
      Id: switchId,
    };
    const url = `${process.env.pms_api_url}/emailtemplate/activeinactive`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setIsOpenSwitchModal(false);
        toast.success("Status Updated Successfully.");
        onSearchClear();
        setFilteredOject({
          ...filteredObject,
          GlobalSearch: onSearchData.trim(),
          PageNo: 1,
        });
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleDeleteRow = async () => {
    const params = {
      Id: selectedRowId,
    };
    const url = `${process.env.pms_api_url}/emailtemplate/delete`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Email Template has been deleted successfully!");
        setIsDeleteOpen(false);
        onSearchClear();
        setFilteredOject({
          ...filteredObject,
          GlobalSearch: "",
          PageNo: 1,
        });
      }
    };
    canDelete
      ? callAPI(url, params, successCallback, "POST")
      : toast.warning("You don't have required permission.");
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
            <div className="absolute top-30 right-3 z-10 flex justify-center items-center">
              <div className="py-2 border border-lightSilver rounded-md bg-pureWhite shadow-lg">
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
    if (column.label === "Status") {
      return {
        name: "Status",
        options: {
          filter: true,
          viewColumns: false,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName("Status"),
          customBodyRender: (value: number, tableMeta: any) => {
            const activeUser = async () => {
              await setIsOpenSwitchModal(true);
              await setSwitchId(
                tableMeta.rowData[tableMeta.rowData.length - 1]
              );
              await setSwitchActive(value === 1 ? false : true);
            };
            return (
              <div>
                <Switch checked={value === 1 ? true : false} onChange={() => activeUser()} />
              </div>
            );
          },
        },
      };
    } else if (column.label === "Actions") {
      return {
        name: "Id",
        options: {
          filter: true,
          viewColumns: false,
          sort: true,
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
      name: "TemplateName",
      label: "Template Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "DateAdded",
      label: "Date Added",
      bodyRenderer: generateDateWithTime,
    },
    {
      name: "LastUpdatedOn",
      label: "Last Updated On",
      bodyRenderer: generateDateWithTime,
    },
    {
      name: "EmailTypeName",
      label: "Email Type",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "DepartmentName",
      label: "Department",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Status",
      label: "Status",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "actions",
      label: "Actions",
      bodyRenderer: generateCommonBodyRender,
    },
  ];

  const emailTemplateColumns = column.map((col: any) => {
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
            <div
              className={`${
                data.length > 0 ? "muiTableActionHeight" : "muiTableAction"
              }`}
            >
              <ThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                  data={data}
                  columns={emailTemplateColumns}
                  title={undefined}
                  options={{
                    ...options,
                    textLabels: {
                      body: {
                        noMatch: (
                          <div className="flex items-start">
                            <span>
                              No Email Templates available.&nbsp;
                              <a
                                className="text-secondary underline cursor-pointer"
                                onClick={onOpen}
                              >
                                Add a new
                              </a>
                              &nbsp;Email Template.
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

            {isOpenSwitchModal && (
              <SwitchModal
                isOpen={isOpenSwitchModal}
                onClose={closeSwitchModal}
                title={`${
                  switchActive === true ? "Active" : "InActive"
                } Email Template`}
                actionText="Yes"
                onActionClick={handleToggleEmailTemplate}
                firstContent={`Are you sure you want to ${
                  switchActive === true ? "Active" : "InActive"
                } Email Template?`}
              />
            )}

            {/* Delete Modal  */}
            {isDeleteOpen && (
              <DeleteDialog
                isOpen={isDeleteOpen}
                onClose={closeModal}
                onActionClick={handleDeleteRow}
                Title={"Delete Error Type"}
                firstContent={"Are you sure you want to delete Email Template?"}
                secondContent={
                  "If you delete Email Template, you will permanently lose Email Template and Email Template related data."
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

export default EmailTemplate;
