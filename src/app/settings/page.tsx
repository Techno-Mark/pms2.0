"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "next-ts-lib/dist/index.css";
import ExportIcon from "@/assets/icons/ExportIcon";
import AddPlusIcon from "@/assets/icons/AddPlusIcon";
import User from "@/components/settings/tables/User";
import Group from "@/components/settings/tables/Group";
import Client from "@/components/settings/tables/Client";
import Project from "@/components/settings/tables/Project";
import Process from "@/components/settings/tables/Process";
import Status from "@/components/settings/tables/Status";
import Permissions from "@/components/settings/tables/Permissions";
import Drawer from "@/components/settings/drawer/Drawer";
import DrawerOverlay from "@/components/settings/drawer/DrawerOverlay";
import Wrapper from "@/components/common/Wrapper";
import Navbar from "@/components/common/Navbar";
import Organization from "@/components/settings/tables/Organization";
import { hasNoToken, hasPermissionWorklog } from "@/utils/commonFunction";
import { useRouter } from "next/navigation";
import SearchIcon from "@/assets/icons/SearchIcon";
import Loading from "@/assets/icons/reports/Loading";
import { toast } from "react-toastify";
import ReportLoader from "@/components/common/ReportLoader";
import { callAPI } from "@/utils/API/callAPI";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import ImportIcon from "@/assets/icons/ImportIcon";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputBase,
  TextField,
  createFilterOptions,
} from "@mui/material";
import ImportDialog from "@/components/settings/settings_import/ImportDialog";
import FilterIcon from "@/assets/icons/FilterIcon";
import FilterDialog_Status from "@/components/settings/FilterDialog_Status";
import { Delete, Edit } from "@mui/icons-material";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import {
  LabelValue,
  LabelValueType,
  LabelValueTypeIsDefault,
  MenuItem,
} from "@/utils/Types/types";
import { getDepartmentDropdownData } from "@/utils/commonDropdownApiCall";
import Notification from "@/components/settings/tables/Notification";
import NotificationDrawer from "@/components/common/NotificationDrawer";
import NatureOfError from "@/components/settings/tables/NatureOfError";

interface Tabs {
  id: string;
  label: string;
  canView: boolean;
}

const filter = createFilterOptions<LabelValue>();

const initialTabs = [
  { id: "Group", label: "Group", canView: false },
  { id: "Client", label: "Client", canView: false },
  { id: "Project", label: "Project", canView: false },
  { id: "User", label: "User", canView: false },
  { id: "Process", label: "Process", canView: false },
  { id: "Status", label: "Status", canView: false },
  { id: "Permission", label: "Permissions", canView: false },
  { id: "Notification", label: "Notification", canView: false },
  { id: "NatureOfError", label: "Nature Of Error", canView: false },
  { id: "Organization", label: "Organization", canView: true },
];

const Page = () => {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [tabs, setTabs] = useState<Tabs[]>(initialTabs);
  const [tab, setTab] = useState<string>("Client");
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(-1);
  const [visibleTabs, setVisibleTabs] = useState(tabs.slice(0, 6));
  const [dropdownTabs, setDropdownTabs] = useState(tabs.slice(6));
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isLoaded, setLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasEditId, setHasEditId] = useState(0);
  const [getUserDataFunction, setUserGetDataFunction] = useState<
    (() => void) | null
  >(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [currentFilterData, setCurrentFilterData] = useState<any>([]);
  const [isFilterOpen, setisFilterOpen] = useState<boolean>(false);

  const handleUserDataFetch = (getData: () => void) => {
    setUserGetDataFunction(() => getData);
  };

  const handleCloseFilter = () => {
    setisFilterOpen(false);
  };

  interface FilterSettings {
    SortColumn: string;
    IsDec: boolean;
    globalFilter: string | null;
    IsDefault: boolean | null;
    Type: string;
    Export: boolean;
    GlobalSearch: string | null;
    WorkTypeId: number | null;
  }

  const getIdFromFilterDialog = (data: FilterSettings) => {
    setCurrentFilterData(data);
  };

  const [getDataFunction, setGetDataFunction] = useState<(() => void) | null>(
    null
  );
  const [getOrgDetailsFunction, setGetOrgDetailsFunction] = useState<
    (() => void) | null
  >(null);
  const [permissionDropdownData, setPermissionDropdownData] = useState<
    LabelValueTypeIsDefault[] | []
  >([]);
  const [isPermissionExpanded, setPermissionExpanded] =
    useState<boolean>(false);
  const [updatedPermissionsData, setUpdatedPermissionsData] = useState<
    MenuItem[] | []
  >([]);

  const [departmentValue, setDepartmentValue] = useState<number>(0);
  const [departmentDropdown, setDepartmentDropdown] = useState([]);
  const [saveDepartmentData, setSaveDepartmentData] = useState(false);

  const [permissionValueError, setPermissionValueError] = useState(false);
  const [permissionValueErrText, setPermissionValueErrText] = useState<string>(
    "This field is required."
  );
  const [permissionValueType, setPermissionValueType] = useState<number>(0);
  const [permissionValue, setPermissionValue] = useState<number>(0);
  const [permissionName, setPermissionName] = useState("");
  const [permissionNameError, setPermissionNameError] = useState(false);
  const [permissionNameErrText, setPermissionNameErrText] = useState<string>(
    "This field is required."
  );
  const [hoveredItem, setHoveredItem] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [open, toggleOpen] = useState(false);

  const [isDeleteOpenProject, setIsDeleteOpenProject] = useState(false);
  const [selectedRowIdProject, setSelectedRowIdProject] = useState<
    number | null
  >(null);

  const [search, setSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [canExport, setCanExport] = useState<boolean>(false);
  const [emailNotificationOpen, setEmailNotificationOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("isClient") === "false") {
      if (
        !hasPermissionWorklog("", "View", "Settings") &&
        (!hasPermissionWorklog("Client", "View", "Settings") ||
          !hasPermissionWorklog("Project", "View", "Settings") ||
          !hasPermissionWorklog("User", "View", "Settings") ||
          !hasPermissionWorklog("Process", "View", "Settings") ||
          !hasPermissionWorklog("Group", "View", "Settings") ||
          !hasPermissionWorklog("Permission", "View", "Settings") ||
          !hasPermissionWorklog("Notification", "View", "Settings") ||
          !hasPermissionWorklog("NatureOfError", "View", "Settings") ||
          !hasPermissionWorklog("Status", "View", "Settings"))
      ) {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDataFetch = (getData: () => void) => {
    setGetDataFunction(() => getData);
  };

  useEffect(() => {
    hasNoToken(router);
  }, [router]);

  const handleCanExport = (arg1: boolean) => {
    setCanExport(arg1);
  };

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };

  const handleDrawerClose = () => {
    setOpenDrawer(false);
    setHasEditId(0);
  };

  const handleEdit = (rowId: number) => {
    setHasEditId(rowId);
    setOpenDrawer(true);
  };

  const handleTabClick = (tabId: string, index: number) => {
    if (hasPermissionWorklog(tabId.toLowerCase(), "view", "settings")) {
      const clickedTab = dropdownTabs[index];
      const lastVisibleTab = visibleTabs[visibleTabs.length - 1];

      if (visibleTabs.some((tab) => tab.id === tabId)) {
        setTab(tabId);
        setSelectedTabIndex(index);
        setSearch("");
        setSearchValue("");
        setDepartmentValue(0);
        setPermissionValue(0);
        return;
      }

      const clickedTabIndexInDropdown = dropdownTabs.findIndex(
        (tab) => tab.id === tabId
      );

      const updatedVisibleTabs = [...visibleTabs];
      const updatedDropdownTabs = [...dropdownTabs];

      updatedVisibleTabs[visibleTabs.length - 1] = clickedTab;

      if (clickedTabIndexInDropdown !== -1) {
        updatedDropdownTabs[clickedTabIndexInDropdown] = lastVisibleTab;

        const newSelectedTabIndex = updatedVisibleTabs.findIndex(
          (tab) => tab.id === tabId
        );
        setSelectedTabIndex(newSelectedTabIndex);
      } else {
        updatedDropdownTabs.unshift(lastVisibleTab);
        setSelectedTabIndex(visibleTabs.length + clickedTabIndexInDropdown);
      }

      setTab(tabId);
      setVisibleTabs(updatedVisibleTabs);
      setDropdownTabs(updatedDropdownTabs);
    }
  };

  const getPermissionDropdown = async () => {
    const params = {};
    const url = `${process.env.pms_api_url}/Role/GetList`;
    const successCallback = (
      ResponseData: LabelValueTypeIsDefault[],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setPermissionDropdownData(ResponseData);
      } else {
        setPermissionDropdownData([]);
      }
    };
    callAPI(url, params, successCallback, "GET");
  };

  const getDepartmentData = async () => {
    const departmentData = await getDepartmentDropdownData();
    setDepartmentDropdown(departmentData.DepartmentList);
  };

  useEffect(() => {
    tab === "Permission" && getPermissionDropdown();
    tab === "Notification" && getDepartmentData();
  }, [tab]);

  const handleSavePermissionData = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (updatedPermissionsData.length > 0) {
      saveData();
      setPermissionExpanded(false);
    } else {
      toast.error("Please try again after sometime.");
    }
  };

  const saveData = async () => {
    const params = {
      RoleId: permissionValue !== 0 && permissionValue,
      Permissions: updatedPermissionsData,
    };
    const url = `${process.env.pms_api_url}/Role/SavePermission`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Data saved successfully.");
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleUserDetailsFetch = (getData: () => void) => {
    setGetOrgDetailsFunction(() => getData);
    setLoaded(true);
  };

  const handleModuleNames = (
    arg1: string,
    arg2: string,
    arg3: string,
    arg4: string,
    arg5: string
  ) => {
    const updatedTabs = tabs.map((tab) => {
      switch (tab.id.toLowerCase()) {
        case "client":
          return {
            ...tab,
            label: arg1,
            canView: hasPermissionWorklog(
              tab.id.toLowerCase(),
              "view",
              "settings"
            ),
          };
          break;
        case "project":
          return {
            ...tab,
            label: arg2,
            canView: hasPermissionWorklog(
              tab.id.toLowerCase(),
              "view",
              "settings"
            ),
          };
          break;
        case "user":
          return {
            ...tab,
            canView: hasPermissionWorklog(
              tab.id.toLowerCase(),
              "view",
              "settings"
            ),
          };
          break;
        case "process":
          return {
            ...tab,
            label: arg3,
            canView: hasPermissionWorklog(
              tab.id.toLowerCase(),
              "view",
              "settings"
            ),
          };
          break;
        case "group":
          return {
            ...tab,
            canView: hasPermissionWorklog(
              tab.id.toLowerCase(),
              "view",
              "settings"
            ),
          };
          break;
        case "status":
          return {
            ...tab,
            canView: hasPermissionWorklog(
              tab.id.toLowerCase(),
              "view",
              "settings"
            ),
          };
          break;
        case "permission":
          return {
            ...tab,
            canView: hasPermissionWorklog(
              tab.id.toLowerCase(),
              "view",
              "settings"
            ),
          };
          break;
        case "notification":
          return {
            ...tab,
            canView: hasPermissionWorklog(
              tab.id.toLowerCase(),
              "view",
              "settings"
            ),
          };
          break;
        case "natureoferror":
          return {
            ...tab,
            canView: hasPermissionWorklog(
              tab.id.toLowerCase(),
              "view",
              "settings"
            ),
          };
          break;
        case "organization":
          return {
            ...tab,
            canView: parseInt(arg5) === 1 ? true : false,
          };
          break;
        default:
          return { ...tab };
          break;
      }
    });

    setTabs(updatedTabs);
    setVisibleTabs(updatedTabs.slice(0, 10));
    setDropdownTabs(updatedTabs.slice(10));
  };

  useEffect(() => {
    hasPermissionWorklog(tab, "save", "settings");
    for (let i = 0; i < initialTabs.length; i++) {
      if (hasPermissionWorklog(initialTabs[i].id, "view", "settings")) {
        setTab(initialTabs[i].id);
        setIsLoading(false);
        setSelectedTabIndex(i);
        break;
      }
    }
  }, []);

  const exportData = async (
    endpoint: string,
    filename: string,
    searchValue: string
  ) => {
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");

    const data = {
      GlobalSearch: searchValue,
      SortColumn: null,
      IsDesc: true,
      IsDownload: true,
      PageNo: 1,
      PageSize: 50000,
    };

    const statusData = {
      ...currentFilterData,
      GlobalSearch: searchValue,
      SortColumn: null,
      IsDesc: true,
      IsDownload: true,
      PageNo: 1,
      PageSize: 50000,
    };

    try {
      setIsExporting(true);
      const response = await axios.post(
        `${
          endpoint === "user" ? process.env.api_url : process.env.pms_api_url
        }/${endpoint}/export`,
        tab === "Status" ? statusData : data,
        {
          headers: {
            Authorization: `bearer ${token}`,
            org_token: `${Org_Token}`,
          },
          responseType: "blob",
        }
      );

      if (response.status === 200) {
        if (response.data.ResponseStatus === "Failure") {
          setIsExporting(false);
          toast.error("Please try again later.");
        } else {
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${filename}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          toast.success("Data exported successfully.");
          setIsExporting(false);
        }
      } else {
        setIsExporting(false);
        toast.error("Please try again later.");
      }
    } catch (error) {
      setIsExporting(false);
      toast.error("Error exporting data.");
    }
  };

  const clearSearchValue = () => {
    setSearch("");
    setSearchValue("");
  };

  const handlePermissionName = (e: string) => {
    if (e === "" || e.trim().length <= 0) {
      setPermissionName(e);
      setPermissionNameError(true);
      setPermissionNameErrText("This is required field.");
    } else {
      setPermissionName(e);
      setPermissionNameError(false);
      setPermissionNameErrText("This field is required.");
    }
  };

  const handlePermission = (
    e: React.SyntheticEvent,
    value: LabelValueTypeIsDefault
  ) => {
    if (value !== null) {
      if (isNaN(Number(value.value))) {
        toggleOpen(true);
        setPermissionName(value.label);
        setPermissionValue(0);
        setPermissionValueType(0);
      }
      if (value !== null && !isNaN(Number(value.value))) {
        const selectedValue = value.value;
        setPermissionValue(selectedValue);
        setPermissionValueType(value.Type);
        setPermissionValueError(false);
        setPermissionValueErrText("");
      } else {
        setPermissionValue(0);
        setPermissionValueType(0);
      }
    }
  };

  const handleClose = () => {
    toggleOpen(false);
    setEditDialogOpen(false);
  };

  const handleAddProject = async () => {
    const saveRole = async () => {
      const params = {
        RoleId: permissionValue,
        Name: permissionName,
        Type: permissionDropdownData
          .map((i: LabelValueTypeIsDefault) =>
            i.value === permissionValue ? i.Type : undefined
          )
          .filter((i: number | undefined) => i !== undefined)[0],
      };

      const url = `${process.env.pms_api_url}/Role/Save`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          getPermissionDropdown();
          toast.success(`Role saved successfully.`);
          handleClose();
        }
      };
      callAPI(url, params, successCallback, "POST");
    };

    if (permissionName.trim().length > 0 && permissionValue !== null) {
      saveRole();
    }
  };

  const closeModalProject = () => {
    setIsDeleteOpenProject(false);
  };

  const handleValueChange = (
    childValue1: React.SetStateAction<number | null>,
    childValue2: boolean | ((prevState: boolean) => boolean)
  ) => {
    setSelectedRowIdProject(childValue1);
    setIsDeleteOpenProject(childValue2);
  };

  const handleDeleteRowProject = async () => {
    const params = {
      RoleId: selectedRowIdProject,
    };
    const url = `${process.env.pms_api_url}/Role/Delete`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        getPermissionDropdown();
        toast.success(`Role has been deleted successfully!`);
        setPermissionValue(0);
        setPermissionValueType(0);
      }
    };
    callAPI(url, params, successCallback, "POST");
    setIsDeleteOpenProject(false);
  };

  const handleSearchChange = (e: string) => {
    setSearch(e);
    const timer = setTimeout(() => {
      setSearchValue(e.trim());
    }, 500);
    return () => clearTimeout(timer);
  };

  return (
    <Wrapper className="min-h-screen overflow-y-auto">
      <Navbar
        onHandleModuleNames={handleModuleNames}
        setEmailNotificationOpen={setEmailNotificationOpen}
      />

      <div>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <ReportLoader />
          </div>
        ) : (
          <div className="bg-white flex justify-between items-center">
            <div className="flex items-center py-[16px]">
              {visibleTabs
                .filter((i: Tabs) => i.canView !== false)
                .map((tab, index, array) => (
                  <label
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id, index)}
                    className={`${
                      array.length === 10
                        ? "text-[15px] px-1"
                        : "text-[16px] px-[6px]"
                    } cursor-pointer select-none flex items-center justify-center ${
                      selectedTabIndex === index
                        ? "text-[#0592C6] font-semibold"
                        : "text-slatyGrey"
                    } ${
                      index < array.length - 1
                        ? "border-r border-r-lightSilver h-3"
                        : `${array.length === 9 ? "px-1" : "px-2"}`
                    }`}
                  >
                    {tab.label}
                  </label>
                ))}
            </div>

            <div
              className={`flex items-center px-[10px] ${
                tab === "Permissions" ? "gap-[5px]" : "gap-[10px]"
              }`}
            >
              {tab !== "Permission" && tab !== "Notification" ? (
                <>
                  {(tab === "Client" ||
                    tab === "Project" ||
                    tab === "User" ||
                    tab === "Process" ||
                    tab === "Group" ||
                    tab === "Status" ||
                    tab === "NatureOfError" ||
                    tab === "Organization") && (
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
                  )}

                  {tab === "Status" && (
                    <ColorToolTip title="Filter" placement="top" arrow>
                      <span
                        className="cursor-pointer"
                        onClick={() => setisFilterOpen(true)}
                      >
                        <FilterIcon />
                      </span>
                    </ColorToolTip>
                  )}

                  {(tab === "Client" ||
                    tab === "Project" ||
                    tab === "User") && (
                    <ColorToolTip title="Import" placement="top" arrow>
                      <div
                        className={`${
                          hasPermissionWorklog(tab, "import", "settings")
                            ? "cursor-pointer"
                            : "opacity-50 pointer-events-none"
                        }`}
                        onClick={() => {
                          setIsImportOpen(true);
                        }}
                      >
                        <ImportIcon />
                      </div>
                    </ColorToolTip>
                  )}

                  <ColorToolTip title="Export" placement="top" arrow>
                    <div
                      className={`${
                        hasPermissionWorklog(tab, "export", "settings")
                          ? ""
                          : "opacity-50 pointer-events-none"
                      }`}
                    >
                      <span
                        className={`${
                          canExport ? "" : "pointer-events-none opacity-50"
                        } ${isExporting ? "cursor-default" : "cursor-pointer"}`}
                        onClick={
                          canExport
                            ? () => {
                                const tabMappings: {
                                  [key: string]: string;
                                } = {
                                  Client: "client",
                                  Group: "group",
                                  Process: "process",
                                  Project: "project",
                                  Status: "status",
                                  User: "user",
                                  Organization: "organization",
                                  NatureOfError: "natureOfError",
                                };

                                const selectedTab = tabMappings[tab];

                                if (selectedTab) {
                                  exportData(
                                    selectedTab,
                                    `${tab}_data`,
                                    search.trim()
                                  );
                                }
                              }
                            : undefined
                        }
                      >
                        {isExporting ? <Loading /> : <ExportIcon />}
                      </span>
                    </div>
                  </ColorToolTip>
                </>
              ) : tab === "Notification" ? (
                <>
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    options={departmentDropdown}
                    value={
                      departmentDropdown.find(
                        (i: LabelValueType) => i.value == departmentValue
                      ) || null
                    }
                    onChange={(e, value: LabelValueType | null) => {
                      value && setDepartmentValue(value.value);
                    }}
                    sx={{ mx: 0.75, width: 300 }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label={
                          <span>
                            Department
                            <span className="text-defaultRed">&nbsp;*</span>
                          </span>
                        }
                      />
                    )}
                  />
                  <div className="w-[60px] mr-5">
                    <Button
                      variant="contained"
                      color="info"
                      className={`rounded-md !bg-secondary ${
                        departmentValue === 0 ||
                        !hasPermissionWorklog(tab, "save", "settings")
                          ? "opacity-50 pointer-events-none uppercase"
                          : ""
                      } ${
                        departmentValue === 0 ||
                        !hasPermissionWorklog(tab, "save", "settings")
                          ? "cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => setSaveDepartmentData(true)}
                    >
                      Save
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center gap-3 mr-4">
                  <Autocomplete
                    className={`${
                      permissionValueError ? "errorAutocomplete" : ""
                    }`}
                    limitTags={2}
                    id="checkboxes-tags-demo"
                    options={permissionDropdownData}
                    value={
                      permissionValue !== 0
                        ? permissionDropdownData.find(
                            (option: LabelValueTypeIsDefault) =>
                              option.value === permissionValue
                          ) || null
                        : null
                    }
                    sx={{ width: "250px" }}
                    getOptionLabel={(option: LabelValueTypeIsDefault) =>
                      option.label
                    }
                    onChange={handlePermission}
                    filterOptions={(
                      options: LabelValueTypeIsDefault[],
                      params: any
                    ) => {
                      const filtered = filter(options, params);
                      return filtered;
                    }}
                    renderOption={(props: any, option: any) => {
                      const isItemHovered = option === hoveredItem;

                      const handleEditClick = () => {
                        setPermissionName(option.label);
                        setEditDialogOpen(true);
                      };

                      const handleDeleteClick = () => {
                        handleValueChange(option.value, true);
                      };
                      return (
                        <li
                          {...props}
                          onMouseEnter={() => setHoveredItem(option)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          {option.label}
                          {isItemHovered && (
                            <div className="flex justify-center items-center">
                              {hasPermissionWorklog(
                                "permission",
                                "delete",
                                "settings"
                              ) && (
                                <span
                                  className="absolute right-3"
                                  onClick={handleDeleteClick}
                                >
                                  <Delete />
                                </span>
                              )}
                              {hasPermissionWorklog(
                                "permission",
                                "save",
                                "settings"
                              ) && (
                                <span
                                  className="absolute right-10 pt-1"
                                  onClick={handleEditClick}
                                >
                                  <Edit />
                                </span>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Role
                            <span className="text-defaultRed">&nbsp;*</span>
                          </span>
                        }
                        placeholder="Please Select..."
                        variant="standard"
                      />
                    )}
                  />
                  {permissionValueError && (
                    <span className="text-[#D32F2F] text-[12px] -mt-3">
                      {permissionValueErrText}
                    </span>
                  )}
                  <div className="w-[60px]">
                    <Button
                      variant="contained"
                      color="info"
                      className={`rounded-md !bg-secondary ${
                        permissionValue === 0 ||
                        !hasPermissionWorklog(tab, "save", "settings")
                          ? "opacity-50 pointer-events-none uppercase"
                          : ""
                      } ${
                        permissionValue === 0 ||
                        !hasPermissionWorklog(tab, "save", "settings")
                          ? "cursor-not-allowed"
                          : ""
                      }`}
                      onClick={handleSavePermissionData}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
              {tab !== "Notification" && (
                <Button
                  type="submit"
                  variant="contained"
                  color="info"
                  className={`${
                    tab === "Permissions"
                      ? "rounded-[4px] !h-[45px] "
                      : "rounded-[4px] !h-[36px] text-sm"
                  } ${
                    // isLoaded &&
                    (hasPermissionWorklog(tab, "save", "settings") ||
                      tabs.filter(
                        (i: Tabs) => i.label.toLowerCase() === "organization"
                      )[0].canView)
                      ? ""
                      : "cursor-not-allowed"
                  } !bg-secondary`}
                  onClick={
                    hasPermissionWorklog(tab, "save", "settings") ||
                    tabs.filter(
                      (i: Tabs) => i.label.toLowerCase() === "organization"
                    )[0].canView
                      ? handleDrawerOpen
                      : undefined
                  }
                >
                  <span
                    className={`flex items-center justify-center ${
                      tab === "Permissions" ? "text-sm" : ""
                    }`}
                  >
                    <span className="mr-2">
                      <AddPlusIcon />
                    </span>
                    <span className="uppercase">
                      Create{" "}
                      {tab === "Permission"
                        ? "Role"
                        : tab === "NatureOfError"
                        ? "Nature of Error"
                        : tab}
                    </span>
                  </span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/*  Drawer */}
        <Drawer
          onEdit={hasEditId}
          onOpen={openDrawer}
          tab={tab}
          onClose={handleDrawerClose}
          onDataFetch={getDataFunction}
          onUserDataFetch={getUserDataFunction}
          getPermissionDropdown={getPermissionDropdown}
          getOrgDetailsFunction={getOrgDetailsFunction}
        />

        {/* Drawer Overlay */}
        <DrawerOverlay isOpen={openDrawer} onClose={handleDrawerClose} />

        {tab === "Client" && (
          <Client
            onOpen={
              hasPermissionWorklog(tab, "save", "settings")
                ? handleDrawerOpen
                : undefined
            }
            onEdit={handleEdit}
            onDataFetch={handleDataFetch}
            getOrgDetailsFunction={getOrgDetailsFunction}
            canView={hasPermissionWorklog("client", "view", "settings")}
            canEdit={hasPermissionWorklog("client", "save", "settings")}
            canDelete={hasPermissionWorklog("client", "delete", "settings")}
            canProcess={hasPermissionWorklog("client", "save", "settings")}
            onSearchData={searchValue}
            onSearchClear={clearSearchValue}
            onHandleExport={handleCanExport}
          />
        )}
        {tab === "Project" && (
          <Project
            onOpen={
              hasPermissionWorklog(tab, "save", "settings")
                ? handleDrawerOpen
                : undefined
            }
            onEdit={handleEdit}
            onDataFetch={handleDataFetch}
            getOrgDetailsFunction={getOrgDetailsFunction}
            canView={hasPermissionWorklog("project", "view", "settings")}
            canEdit={hasPermissionWorklog("project", "save", "settings")}
            canDelete={hasPermissionWorklog("project", "delete", "settings")}
            onSearchData={searchValue}
            onSearchClear={clearSearchValue}
            onHandleExport={handleCanExport}
          />
        )}
        {tab === "User" && (
          <User
            onOpen={
              hasPermissionWorklog(tab, "save", "settings")
                ? handleDrawerOpen
                : undefined
            }
            onEdit={handleEdit}
            onDataFetch={handleUserDataFetch}
            getOrgDetailsFunction={getOrgDetailsFunction}
            canView={hasPermissionWorklog("user", "view", "settings")}
            canEdit={hasPermissionWorklog("user", "save", "settings")}
            canDelete={hasPermissionWorklog("user", "delete", "settings")}
            onSearchData={searchValue}
            canPermission={
              hasPermissionWorklog("permission", "view", "settings") &&
              hasPermissionWorklog("permission", "save", "settings")
            }
            onSearchClear={clearSearchValue}
            onHandleExport={handleCanExport}
          />
        )}
        {tab === "Group" && (
          <Group
            onOpen={
              hasPermissionWorklog(tab, "save", "settings")
                ? handleDrawerOpen
                : undefined
            }
            onEdit={handleEdit}
            onDataFetch={handleDataFetch}
            getOrgDetailsFunction={getOrgDetailsFunction}
            canView={hasPermissionWorklog("group", "view", "settings")}
            canEdit={hasPermissionWorklog("group", "save", "settings")}
            canDelete={hasPermissionWorklog("group", "delete", "settings")}
            onSearchData={searchValue}
            onSearchClear={clearSearchValue}
            onHandleExport={handleCanExport}
          />
        )}
        {tab === "Process" && (
          <Process
            onOpen={
              hasPermissionWorklog(tab, "save", "settings")
                ? handleDrawerOpen
                : undefined
            }
            onEdit={handleEdit}
            onDataFetch={handleDataFetch}
            getOrgDetailsFunction={getOrgDetailsFunction}
            canView={hasPermissionWorklog("process", "view", "settings")}
            canEdit={hasPermissionWorklog("process", "save", "settings")}
            canDelete={hasPermissionWorklog("process", "delete", "settings")}
            onSearchData={searchValue}
            onSearchClear={clearSearchValue}
            onHandleExport={handleCanExport}
          />
        )}
        {tab === "Status" && (
          <Status
            onOpen={
              hasPermissionWorklog(tab, "save", "settings")
                ? handleDrawerOpen
                : undefined
            }
            onEdit={handleEdit}
            onDataFetch={handleDataFetch}
            getOrgDetailsFunction={getOrgDetailsFunction}
            canView={hasPermissionWorklog("status", "view", "settings")}
            canEdit={hasPermissionWorklog("status", "save", "settings")}
            canDelete={hasPermissionWorklog("status", "delete", "settings")}
            onSearchData={searchValue}
            onSearchClear={clearSearchValue}
            onHandleExport={handleCanExport}
            currentFilterData={currentFilterData}
          />
        )}
        {tab === "Permission" && (
          <Permissions
            onOpen={
              hasPermissionWorklog(tab, "save", "settings")
                ? handleDrawerOpen
                : undefined
            }
            permissionValue={permissionValue}
            permissionValueType={permissionValueType}
            getOrgDetailsFunction={getOrgDetailsFunction}
            canView={hasPermissionWorklog("permission", "view", "settings")}
            canEdit={hasPermissionWorklog("permission", "save", "settings")}
            sendDataToParent={(data: MenuItem[]) =>
              setUpdatedPermissionsData(data)
            }
            expanded={isPermissionExpanded}
            loading={isLoading}
          />
        )}
        {tab === "Notification" && (
          <Notification
            onOpen={
              hasPermissionWorklog(tab, "save", "settings")
                ? handleDrawerOpen
                : undefined
            }
            departmentValue={departmentValue}
            saveDepartmentData={saveDepartmentData}
            canView={hasPermissionWorklog("notification", "view", "settings")}
            setSaveDepartmentData={setSaveDepartmentData}
          />
        )}

        {tab === "NatureOfError" && (
          <NatureOfError
            onOpen={
              hasPermissionWorklog(tab, "save", "settings")
                ? handleDrawerOpen
                : undefined
            }
            onEdit={handleEdit}
            onDataFetch={handleDataFetch}
            getOrgDetailsFunction={getOrgDetailsFunction}
            canView={hasPermissionWorklog("NatureOfError", "view", "settings")}
            canEdit={hasPermissionWorklog("NatureOfError", "save", "settings")}
            canDelete={hasPermissionWorklog(
              "NatureOfError",
              "delete",
              "settings"
            )}
            onSearchData={searchValue}
            onSearchClear={clearSearchValue}
            onHandleExport={handleCanExport}
          />
        )}
        {tab === "Organization" && (
          <Organization
            onOpen={
              hasPermissionWorklog(tab, "save", "settings")
                ? handleDrawerOpen
                : undefined
            }
            onEdit={handleEdit}
            onDataFetch={handleDataFetch}
            onSearchData={searchValue}
            onSearchClear={clearSearchValue}
            onHandleExport={handleCanExport}
          />
        )}
      </div>

      <ImportDialog
        onOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onDataFetch={
          tab.toLowerCase() === "user" ? getUserDataFunction : getDataFunction
        }
        tab={tab}
      />

      {tab === "Status" && (
        <FilterDialog_Status
          onOpen={isFilterOpen}
          onClose={handleCloseFilter}
          currentFilterData={getIdFromFilterDialog}
        />
      )}

      <DeleteDialog
        isOpen={isDeleteOpenProject}
        onClose={closeModalProject}
        onActionClick={handleDeleteRowProject}
        Title={"Delete Role"}
        firstContent={"Are you sure you want to delete Role?"}
        secondContent={
          "If you delete the Role, you will permanently lose Role and Role related data."
        }
      />

      <Dialog open={editDialogOpen || open} onClose={handleClose}>
        <DialogTitle>
          {editDialogOpen ? "Edit Role" : "Add a new Role"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {editDialogOpen
              ? "Are you sure you want to update this Role?."
              : "Are you sure you want to add this Role?."}
          </DialogContentText>
          <TextField
            className="w-full mt-2"
            value={permissionName}
            error={permissionNameError}
            helperText={permissionNameError && permissionNameErrText}
            id="standard-basic"
            label="Role"
            placeholder={editDialogOpen ? "Edit a Role" : "Add new Role"}
            variant="standard"
            onChange={(e) => handlePermissionName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            variant="outlined"
            className="rounded-[4px] !h-[36px]"
          >
            Close
          </Button>
          <Button
            variant="contained"
            className="rounded-[4px] !h-[36px] !bg-[#0592c6]"
            type="button"
            onClick={handleAddProject}
          >
            {editDialogOpen ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
      <NotificationDrawer
        emailNotificationOpen={emailNotificationOpen}
        setEmailNotificationOpen={setEmailNotificationOpen}
      />
      <DrawerOverlay isOpen={emailNotificationOpen} onClose={() => {}} />
    </Wrapper>
  );
};

export default Page;
