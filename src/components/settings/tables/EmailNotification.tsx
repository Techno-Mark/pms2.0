import { callAPI } from "@/utils/API/callAPI";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import TableActionIcon from "@/assets/icons/TableActionIcon";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import {
  generateCommonBodyRender,
  generateCustomHeaderName,
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import ReportLoader from "@/components/common/ReportLoader";
import {
  Button,
  InputBase,
  Switch,
  TablePagination,
  ThemeProvider,
} from "@mui/material";
import MUIDataTable from "mui-datatables";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { SettingAction, SLAProps } from "@/utils/Types/settingTypes";
import DrawerOverlay from "../drawer/DrawerOverlay";
import SearchIcon from "@/assets/icons/SearchIcon";
import SLADrawer from "../drawer/content/SLADrawer";
import SwitchModal from "@/components/common/SwitchModal";

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  GlobalSearch: "",
  Module: 0,
  Type: 1,
  SortColumn: null,
  IsDesc: true,
  PageNo: pageNo,
  PageSize: pageSize,
  Status: true,
};

const EmailNotification = ({
  getOrgDetailsFunction,
  canView,
  canEdit,
}: SLAProps) => {
  const [loader, setLoader] = useState(true);
  const [selectedTab, setSelectedTab] = useState(1);
  const [data, setData] = useState<any>([]);
  const [selectedRowId, setSelectedRowId] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredObject, setFilteredOject] = useState(initialFilter);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [clone, setClone] = useState(false);
  const [search, setSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isOpenSwitchModal, setIsOpenSwitchModal] = useState(false);
  const [switchId, setSwitchId] = useState(0);
  const [switchActive, setSwitchActive] = useState(false);

  useEffect(() => {
    if (searchValue.trim().length >= 0) {
      setFilteredOject({
        ...filteredObject,
        GlobalSearch: searchValue.trim(),
        PageNo: 1,
      });
      setPage(0);
    }
  }, [searchValue]);

  useEffect(() => {
    const fetchData = async () => {
      const Org_Token = await localStorage.getItem("Org_Token");
      if (Org_Token !== null) {
        getAll();
      } else {
        setTimeout(fetchData, 1000);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [filteredObject, selectedTab]);

  const getAll = async () => {
    setLoader(true);
    const params = { ...filteredObject, Type: selectedTab };
    const url = `${process.env.pms_api_url}/emailnotification/getall`;
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

  const closeSwitchModal = async () => {
    await setIsOpenSwitchModal(false);
  };

  const handleToggleEmailNotification = async () => {
    const params = {
      IsActive: switchActive,
      Id: switchId,
    };
    const url = `${process.env.pms_api_url}/emailnotification/activeinactive`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setIsOpenSwitchModal(false);
        toast.success("Status Updated Successfully.");
        setSearch("");
        setSearchValue("");
        setFilteredOject({
          ...filteredObject,
          GlobalSearch: "",
          PageNo: 1,
        });
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleDrawerClose = () => {
    setOpenDrawer(false);
    setSelectedRowId(0);
    setClone(false);
  };

  useEffect(() => {
    setSelectedRowId(0);
    setPage(0);
    setRowsPerPage(10);
    setSearch("");
    setSearchValue("");
  }, [selectedTab]);

  const handleActionValue = async (actionId: string, id: number) => {
    setSelectedRowId(id);
    if (actionId.toLowerCase() === "edit") {
      setOpenDrawer(true);
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
      (action: string) => action.toLowerCase() === "edit" && canEdit
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
                <Switch
                  checked={value === 1 ? true : false}
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
            return <Actions actions={["Edit"]} id={value} />;
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
      name: "ModuleName",
      label: "Module Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "TemplateName",
      label: "Email Notification Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Description",
      label: "Description",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Subject",
      label: "Subject",
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

  const followupColumn = [
    {
      name: "ModuleName",
      label: "Module Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "TemplateName",
      label: "Email Notification Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Description",
      label: "Description",
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

  const columns = (selectedTab === 4 ? followupColumn : column).map(
    (col: any) => {
      return generateConditionalColumn(col, 10);
    }
  );

  const handleSearchChange = (e: string) => {
    setSearch(e);
    const timer = setTimeout(() => {
      setSearchValue(e.trim());
    }, 500);
    return () => clearTimeout(timer);
  };

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
      {canView && (
        <div className="flex justify-between py-2 pr-2">
          <div className="py-2">
            <label
              onClick={() => {
                setSelectedTab(1);
              }}
              className={`py-[10px] text-[16px] px-4 cursor-pointer select-none ${
                selectedTab === 1
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              Assignee Notification
            </label>
            <span className="text-lightSilver">|</span>
            <label
              onClick={() => {
                setSelectedTab(2);
              }}
              className={`py-[10px] text-[16px] px-4 cursor-pointer select-none ${
                selectedTab === 2
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              Customer Notification
            </label>
            <span className="text-lightSilver">|</span>
            <label
              onClick={() => {
                setSelectedTab(3);
              }}
              className={`py-[10px] text-[16px] px-4 cursor-pointer select-none ${
                selectedTab === 3
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              CC Notification
            </label>
            <span className="text-lightSilver">|</span>
            <label
              onClick={() => {
                setSelectedTab(4);
              }}
              className={`py-[10px] text-[16px] px-4 cursor-pointer select-none ${
                selectedTab === 4
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              Follow-Up
            </label>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <InputBase
                className="pl-1 pr-7 border-b border-b-lightSilver w-48"
                placeholder="Search"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <span className="absolute top-2 right-2 text-slatyGrey">
                <SearchIcon />
              </span>
            </div>
          </div>
        </div>
      )}
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
                  columns={columns}
                  title={undefined}
                  options={{
                    ...options,
                    textLabels: {
                      body: {
                        noMatch: (
                          <div className="flex items-start">
                            <span>
                              No&nbsp;
                              {selectedTab === 1
                                ? "Assignee Notification"
                                : selectedTab === 2
                                ? "Customer Notification"
                                : selectedTab === 3
                                ? "CC Notification"
                                : "Follow-Up "}
                              &nbsp;available.
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

            <SLADrawer
              onOpen={openDrawer}
              onClose={handleDrawerClose}
              clone={clone}
              tab={
                selectedTab === 1
                  ? "Assignee Notification"
                  : selectedTab === 2
                  ? "Customer Notification"
                  : selectedTab === 3
                  ? "CC Notification"
                  : "Follow-Up "
              }
              onEdit={selectedRowId}
              onDataFetch={getAll}
            />

            {isOpenSwitchModal && (
              <SwitchModal
                isOpen={isOpenSwitchModal}
                onClose={closeSwitchModal}
                title={`${switchActive === true ? "Active" : "InActive"} ${
                  selectedTab === 1
                    ? "Assignee Notification"
                    : selectedTab === 2
                    ? "Customer Notification"
                    : selectedTab === 3
                    ? "CC Notification"
                    : "Follow-Up "
                }`}
                actionText="Yes"
                onActionClick={handleToggleEmailNotification}
                firstContent={`Are you sure you want to ${
                  switchActive === true ? "Active" : "InActive"
                } ${
                  selectedTab === 1
                    ? "Assignee Notification"
                    : selectedTab === 2
                    ? "Customer Notification"
                    : selectedTab === 3
                    ? "CC Notification"
                    : "Follow-Up "
                }?`}
              />
            )}

            <DrawerOverlay isOpen={openDrawer} onClose={handleDrawerClose} />
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

export default EmailNotification;
