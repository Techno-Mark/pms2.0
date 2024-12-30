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
  TablePagination,
  ThemeProvider,
} from "@mui/material";
import MUIDataTable from "mui-datatables";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import { SettingAction, SLAProps } from "@/utils/Types/settingTypes";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import AddPlusIcon from "@/assets/icons/AddPlusIcon";
import DrawerOverlay from "../drawer/DrawerOverlay";
import SearchIcon from "@/assets/icons/SearchIcon";
import {
  getBusinessHoursDropdownData,
  getClientDropdownData,
} from "@/utils/commonDropdownApiCall";
import { LabelValue } from "@/utils/Types/types";
import SLADrawer from "../drawer/content/SLADrawer";

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

const SLA = ({
  // onOpen,
  // onDataFetch,
  getOrgDetailsFunction,
  canView,
  canEdit,
  canDelete,
}: // onSearchData,
// onSearchClear,
// onHandleExport,
SLAProps) => {
  const [loader, setLoader] = useState(true);
  const [selectedTab, setSelectedTab] = useState(1);
  const [data, setData] = useState<any>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredObject, setFilteredOject] = useState(initialFilter);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [clone, setClone] = useState(false);
  const [search, setSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [businessHoursDropdown, setBusinessHoursDropdown] = useState<
    LabelValue[]
  >([]);
  const [clientDropdown, setClientDropdown] = useState<LabelValue[]>([]);

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
    const params = filteredObject;
    const url = `${process.env.pms_api_url}/${
      selectedTab === 1 ? "sla/businesshrs/list" : "sla/customSLA/list"
    }`;
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

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };

  const handleDrawerClose = () => {
    setOpenDrawer(false);
    setSelectedRowId(0);
    setClone(false);
  };

  const getClientData = async () => {
    setBusinessHoursDropdown(await getBusinessHoursDropdownData());
    clientDropdown.length <= 0 &&
      setClientDropdown(await getClientDropdownData());
  };

  useEffect(() => {
    selectedTab === 2 && getClientData();
  }, [selectedTab]);

  useEffect(() => {
    setIsDeleteOpen(false);
    setSelectedRowId(0);
    setPage(0);
    setRowsPerPage(10);
    setSearch("");
    setSearchValue("");
  }, [selectedTab]);

  const handleDeleteRow = async () => {
    const params = {
      Id: selectedRowId,
    };
    const url = `${process.env.pms_api_url}/${
      selectedTab === 1 ? "sla/businesshrs/delete" : "sla/customSLA/delete"
    }`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success(
          `${
            selectedTab === 1 ? "Business Hours" : "Custom SLA"
          } has been deleted successfully!`
        );
        setIsDeleteOpen(false);
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
    setSelectedRowId(0);
    setPage(0);
    setRowsPerPage(10);
    setSearch("");
    setSearchValue("");
  };

  const handleActionValue = async (actionId: string, id: number) => {
    setSelectedRowId(id);
    if (actionId.toLowerCase() === "edit") {
      setOpenDrawer(true);
    }
    if (actionId.toLowerCase() === "delete") {
      setIsDeleteOpen(true);
    }
    if (actionId.toLowerCase() === "clone") {
      setOpenDrawer(true);
      setClone(true);
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
        (action.toLowerCase() === "clone" && canEdit)
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
    if (column.label === "Actions") {
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
                actions={
                  selectedTab === 1
                    ? ["Edit", "Delete", "Clone"]
                    : ["Edit", "Delete"]
                }
                id={value}
              />
            );
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

  const columnBusiness = [
    {
      name: "Name",
      label: "Template Name",
      bodyRenderer: generateCommonBodyRender,
    },
    // {
    //   name: "DepartmentNames",
    //   label: "Associated Client",
    //   bodyRenderer: generateCommonBodyRender,
    // },
    {
      name: "BusinessHoursType",
      label: "Hours",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "actions",
      label: "Actions",
      bodyRenderer: generateCommonBodyRender,
    },
  ];

  const columnSLA = [
    {
      name: "BusinessHourName",
      label: "Business Hours Template",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ClientNames",
      label: "Associated Client(s)",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "SLAName",
      label: "SLA Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Description",
      label: "Description",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "actions",
      label: "Actions",
      bodyRenderer: generateCommonBodyRender,
    },
  ];

  const businessHoursColumns = columnBusiness.map((col: any) => {
    return generateConditionalColumn(col, 10);
  });

  const customSLAColumns = columnSLA.map((col: any) => {
    return generateConditionalColumn(col, 10);
  });

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
              Business Hours
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
              Custom SLA
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
            <Button
              type="submit"
              variant="contained"
              color="info"
              className={`rounded-[4px] !h-[36px] text-sm ${
                // isLoaded &&
                hasPermissionWorklog("SLA", "save", "settings")
                  ? ""
                  : "cursor-not-allowed"
              } !bg-secondary`}
              onClick={
                hasPermissionWorklog("SLA", "save", "settings")
                  ? handleDrawerOpen
                  : undefined
              }
            >
              <span className={`flex items-center justify-center`}>
                <span className="mr-2">
                  <AddPlusIcon />
                </span>
                <span className="uppercase">
                  {selectedTab === 1 ? "Add Business Hours" : "Add SLA Policy"}
                </span>
              </span>
            </Button>
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
                  columns={
                    selectedTab === 1 ? businessHoursColumns : customSLAColumns
                  }
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
                                ? "Business Hours"
                                : "Custom SLA"}
                              &nbsp;available.&nbsp;
                              <a
                                className="text-secondary underline cursor-pointer"
                                onClick={
                                  hasPermissionWorklog(
                                    "SLA",
                                    "save",
                                    "settings"
                                  )
                                    ? handleDrawerOpen
                                    : undefined
                                }
                              >
                                Add a new
                              </a>
                              &nbsp;
                              {selectedTab === 1
                                ? "Business Hours"
                                : "Custom SLA"}
                              .
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
              tab={selectedTab === 1 ? "Business Hours" : "SLA Policy"}
              onEdit={selectedRowId}
              onDataFetch={getAll}
              businessHoursDropdown={businessHoursDropdown}
              clientDropdown={clientDropdown}
            />

            <DrawerOverlay isOpen={openDrawer} onClose={handleDrawerClose} />

            {/* Delete Modal  */}
            {isDeleteOpen && (
              <DeleteDialog
                isOpen={isDeleteOpen}
                onClose={closeModal}
                onActionClick={handleDeleteRow}
                Title={`Delete ${
                  selectedTab === 1 ? "Business Hours" : "Custom SLA"
                }`}
                firstContent={`Are you sure you want to delete ${
                  selectedTab === 1 ? "Business Hours" : "Custom SLA"
                }?`}
                secondContent={`If you delete ${
                  selectedTab === 1 ? "Business Hours" : "Custom SLA"
                }, you will permanently lose ${
                  selectedTab === 1 ? "Business Hours" : "Custom SLA"
                } and ${
                  selectedTab === 1 ? "Business Hours" : "Custom SLA"
                } related data.`}
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

export default SLA;
