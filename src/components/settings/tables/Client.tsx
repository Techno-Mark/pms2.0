import {
  generateCommonBodyRender,
  generateCustomHeaderName,
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import { ColorToolTip, getMuiTheme } from "@/utils/datatable/CommonStyle";
import {
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  ThemeProvider,
} from "@mui/material";
import MUIDataTable from "mui-datatables";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ReportLoader from "@/components/common/ReportLoader";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import SwitchModal from "@/components/common/SwitchModal";
import DrawerOverlay from "../drawer/DrawerOverlay";
import ClientFieldsDrawer from "../drawer/ClientFieldDrawer";
import ClientProcessDrawer from "../drawer/ClientProcessDrawer";
import { callAPI } from "@/utils/API/callAPI";
import TableActionIcon from "@/assets/icons/TableActionIcon";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import {
  ClientInitialFilter,
  ClientList,
  ClientWorkType,
  SettingAction,
  SettingProps,
} from "@/utils/Types/settingTypes";
import ToggleSwitch from "../drawer/content/ToggleSwitch";
import LogDrawer from "../drawer/LogDrawer";
import ClientEmailboxDrawer from "../drawer/ClientEmailboxDrawer";

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  GlobalSearch: "",
  SortColumn: null,
  IsDesc: true,
  PageNo: pageNo,
  PageSize: pageSize,
};

const Client = ({
  onOpen,
  onEdit,
  onDataFetch,
  getOrgDetailsFunction,
  canView,
  canEdit,
  canDelete,
  canProcess,
  onSearchData,
  onSearchClear,
  onHandleExport,
}: SettingProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredObject, setFilteredOject] =
    useState<ClientInitialFilter>(initialFilter);
  const [clientData, setClientData] = useState<ClientList[]>([]);
  const [isOpenSwitchModal, setIsOpenSwitchModal] = useState(false);
  const [switchId, setSwitchId] = useState(0);
  const [switchActive, setSwitchActive] = useState(false);
  const [loader, setLoader] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [openProcessDrawer, setOpenProcessDrawer] = useState(false);
  const [openFieldsDrawer, setOpenFieldsDrawer] = useState(false);
  const [openEmailBoxDrawer, setOpenEmailBoxDrawer] = useState(false);
  const [openLogDrawer, setOpenLogDrawer] = useState(false);

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
        getData();
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

  const getData = async () => {
    setLoader(true);
    const params = filteredObject;
    const url = `${process.env.pms_api_url}/client/GetAll`;
    const successCallback = (
      ResponseData: { List: ClientList[]; TotalCount: number },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0 ? true : false);
        setLoader(false);
        setClientData(ResponseData.List);
        setTotalCount(ResponseData.TotalCount);
        getOrgDetailsFunction?.();
      } else {
        setLoader(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleDeleteRow = async () => {
    if (selectedRowId) {
      const params = {
        clientId: selectedRowId,
      };
      const url = `${process.env.pms_api_url}/client/delete`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success("Client has been deleted successfully!");
          onSearchClear();
          setFilteredOject({
            ...filteredObject,
            GlobalSearch: "",
            PageNo: 1,
          });
        }
      };
      callAPI(url, params, successCallback, "POST");
      setSelectedRowId(null);
      setIsDeleteOpen(false);
      onSearchClear();
      setPage(0);
      setRowsPerPage(10);
    }
  };

  const handleToggleClient = async (id: number) => {
    setIsOpenSwitchModal(false);
    const params = {
      clientId: switchId,
      isActive: switchActive,
      RequestedBy: id > 0 ? id : null,
    };
    const url = `${process.env.pms_api_url}/client/activeinactive`;
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

  const closeModal = () => {
    setIsDeleteOpen(false);
  };

  const closeSwitchModal = () => {
    setIsOpenSwitchModal(false);
  };

  const handleCloseProcessDrawer = () => {
    setOpenProcessDrawer(false);
  };

  const handleCloseFieldsDrawer = () => {
    setOpenFieldsDrawer(false);
  };

  const handleCloseEmailBoxDrawer = () => {
    setOpenEmailBoxDrawer(false);
  };

  const handleCloseLogDrawer = () => {
    setOpenLogDrawer(false);
    setSelectedRowId(null);
  };

  const handleActionValue = async (actionId: string, id: number) => {
    setSelectedRowId(id);
    if (actionId.toLowerCase() === "edit") {
      onEdit(id);
    }
    if (actionId.toLowerCase() === "delete") {
      setIsDeleteOpen(true);
    }
    if (actionId.toLowerCase() === "process") {
      setOpenProcessDrawer(true);
    }
    if (actionId.toLowerCase() === "emailbox") {
      setOpenEmailBoxDrawer(true);
    }
    if (actionId.toLowerCase() === "fields") {
      setOpenFieldsDrawer(true);
    }
    if (actionId.toLowerCase() === "log") {
      setOpenLogDrawer(true);
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
        (action.toLowerCase() === "delete" && canDelete) ||
        (action.toLowerCase() === "process" && canProcess) ||
        action.toLowerCase() === "emailbox" ||
        action.toLowerCase() === "fields" ||
        action.toLowerCase() === "log"
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
            <div className="absolute top-30 right-[0.5rem] z-10 flex justify-center items-center">
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
    if (column.label === "Status") {
      return {
        name: "IsActive",
        options: {
          filter: true,
          viewColumns: false,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName("Status"),
          customBodyRender: (value: boolean, tableMeta: any) => {
            const activeUser = async () => {
              await setIsOpenSwitchModal(true);
              await setSwitchId(
                tableMeta.rowData[tableMeta.rowData.length - 1]
              );
              await setSwitchActive(!value);
            };
            return (
              <div>
                <Switch
                  checked={value}
                  onChange={() => activeUser()}
                  disabled={!canEdit}
                />
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
            return (
              <Actions
                actions={[
                  "Edit",
                  "Process",
                  "EmailBox",
                  "Fields",
                  "Delete",
                  "Log",
                ]}
                id={value}
              />
            );
          },
        },
      };
    } else if (column.name === "Id") {
      return {
        name: "Id",
        options: {
          display: false,
          viewColumns: false,
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

  const generateShortProcessNameBody = (
    bodyValue: string | null | undefined
  ) => {
    if (bodyValue === null || bodyValue === undefined || bodyValue === "") {
      return "-";
    }

    const shortProcessName =
      bodyValue.length > 50 ? bodyValue.slice(0, 50) : bodyValue;

    return (
      <div>
        {bodyValue.length > 50 ? (
          <>
            <ColorToolTip title={bodyValue} placement="top">
              <span>{shortProcessName}</span>
            </ColorToolTip>
            <span>...</span>
          </>
        ) : (
          shortProcessName
        )}
      </div>
    );
  };

  const column = [
    {
      name: "Name",
      label: "Client Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Email",
      label: "Email ID",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Address",
      label: "Address",
      bodyRenderer: generateShortProcessNameBody,
    },
    {
      name: "Department",
      label: "Department",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ContactNo",
      label: "Mobile",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "DateOfCreation",
      label: "Date of Creation",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Category",
      label: "Client Category",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "IsActive",
      label: "Status",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "actions",
      label: "Actions",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Id",
      options: {
        display: false,
        viewColumns: false,
      },
    },
  ];

  const clientColumns = column.map((col: any) => {
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
                        Billing Type
                      </TableCell>
                      <TableCell className="font-semibold">
                        Client Potentiality
                      </TableCell>
                      <TableCell className="font-semibold">
                        Contracted Hrs.
                      </TableCell>
                      <TableCell className="font-semibold">
                        Internal Hrs.
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clientData[rowMeta.rowIndex].WorkTypes.length > 0 ? (
                      clientData[rowMeta.rowIndex].WorkTypes.map(
                        (i: ClientWorkType, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="!pl-[4.5rem] w-[15rem]">
                              {i.WorkTypeName}
                            </TableCell>
                            <TableCell className="w-[17.5rem]">
                              {i.BillingTypeName}
                            </TableCell>
                            <TableCell className="w-[17.5rem]">
                              {!!i.ClientPotentiality
                                ? i.ClientPotentiality
                                : "-"}
                            </TableCell>
                            <TableCell className="w-[18.5rem]">
                              {i.ContractHrs}
                            </TableCell>
                            <TableCell className="w-[18.5rem]">
                              {i.InternalHrs}
                            </TableCell>
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
            <div className="muiTableAction">
              <ThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                  data={clientData}
                  columns={clientColumns}
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
                                create client
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
                Title={"Delete Client"}
                firstContent={"Are you sure you want to delete client?"}
                secondContent={
                  "If you delete client, you will permanently lose client and client related data."
                }
              />
            )}

            {isOpenSwitchModal && (
              <ToggleSwitch
                isOpen={isOpenSwitchModal}
                onClose={closeSwitchModal}
                title={`${
                  switchActive === true ? "Active" : "InActive"
                } Client`}
                actionText="Yes"
                onActionClick={handleToggleClient}
                firstContent={`Are you sure you want to ${
                  switchActive === true ? "Active" : "InActive"
                } Client?`}
              />
            )}

            <ClientProcessDrawer
              onOpen={openProcessDrawer}
              onClose={handleCloseProcessDrawer}
              selectedRowId={selectedRowId}
              onDataFetch={getData}
            />

            <ClientFieldsDrawer
              onOpen={openFieldsDrawer}
              onClose={handleCloseFieldsDrawer}
              selectedRowId={selectedRowId}
            />

            <ClientEmailboxDrawer
              onOpen={openEmailBoxDrawer}
              onClose={handleCloseEmailBoxDrawer}
              selectedRowId={selectedRowId}
            />

            <LogDrawer
              onOpen={openLogDrawer}
              onClose={handleCloseLogDrawer}
              selectedRowId={selectedRowId}
              type="Client"
            />

            <DrawerOverlay
              isOpen={openProcessDrawer || openFieldsDrawer || openLogDrawer}
              onClose={handleCloseProcessDrawer}
            />
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

export default Client;
