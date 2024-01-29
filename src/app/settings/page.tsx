/* eslint-disable react-hooks/rules-of-hooks */
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
import {
  CLIENT,
  GROUP,
  ORGANIZATION,
  PROCESS,
  PROJECT,
  STATUS,
  USER,
} from "@/components/settings/tables/Constants/Tabname";
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

type Tabs = { id: string; label: string; canView: boolean };

type Options = {
  label: string;
  value: string;
};

const filter = createFilterOptions<Options>();

const initialTabs = [
  { id: "Client", label: "Client", canView: false },
  { id: "Project", label: "Project", canView: false },
  { id: "User", label: "User", canView: false },
  { id: "Process", label: "Process", canView: false },
  { id: "Group", label: "Group", canView: false },
  { id: "Status", label: "Status", canView: false },
  { id: "Permission", label: "Permissions", canView: false },
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
  const [hasEditId, setHasEditId] = useState("");
  const [userData, setUserData] = useState([]);
  const [getUserDataFunction, setUserGetDataFunction] = useState<
    (() => void) | null
  >(null);
  const [groupData, setGroupData] = useState("");
  const [projectData, setProjectData] = useState([]);

  const [statusData, setStatusData] = useState("");
  const [processData, setProcessData] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [currentFilterData, setCurrentFilterData] = useState<any>([]);
  const [isFilterOpen, setisFilterOpen] = useState<boolean>(false);

  const getIdFromFilterDialog = (data: any) => {
    setCurrentFilterData(data);
  };

  const handleCloseFilter = () => {
    setisFilterOpen(false);
  };

  const handleGroupData = (data: any) => {
    setGroupData(data);
  };

  const handleProjectData = (data: any) => {
    setProjectData(data);
  };
  const handleStatusData = (data: any) => {
    setStatusData(data);
  };

  const handleUserDataFetch = (getData: () => void) => {
    setUserGetDataFunction(() => getData);
  };

  const handleProcessData = (data: any) => {
    setProcessData(data);
  };

  const handleUserData = (data: any) => {
    setUserData(data);
  };
  const [orgData, setOrgData] = useState([]);
  const [clientData, setClientData] = useState([]);
  const [getDataFunction, setGetDataFunction] = useState<(() => void) | null>(
    null
  );
  const [getOrgDetailsFunction, setGetOrgDetailsFunction] = useState<
    (() => void) | null
  >(null);
  const [permissionDropdownData, setPermissionDropdownData] = useState([]);
  const [isPermissionExpanded, setPermissionExpanded] =
    useState<boolean>(false);
  const [updatedPermissionsData, setUpdatedPermissionsData] = useState([]);

  const [projectValueError, setProjectValueError] = useState(false);
  const [projectValueErrText, setProjectValueErrText] = useState<string>(
    "This field is required."
  );
  const [projectValue, setProjectValue] = useState<any>(0);
  const [projectName, setProjectName] = useState("");
  const [projectNameError, setProjectNameError] = useState(false);
  const [projectNameErrText, setProjectNameErrText] = useState<string>(
    "This field is required."
  );
  const [hoveredItem, setHoveredItem] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [open, toggleOpen] = useState(false);

  const [isDeleteOpenProject, setIsDeleteOpenProject] = useState(false);
  const [selectedRowIdProject, setSelectedRowIdProject] = useState<
    number | null
  >(null);

  const [clientSearchValue, setClientSearchValue] = useState("");
  const [projectSearchValue, setProjectSearchValue] = useState("");
  const [userSearchValue, setUserSearchValue] = useState("");
  const [processSearchValue, setProcessSearchValue] = useState("");
  const [statusSearchValue, setStatusSearchValue] = useState("");
  const [groupSearchValue, setGroupSearchValue] = useState("");
  const [orgSearchValue, setOrgSearchValue] = useState("");
  const [canExport, setCanExport] = useState<boolean>(false);

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

  const handleOrgData = (data: any) => {
    setOrgData(data);
  };

  const handleClientData = (data: any) => {
    setClientData(data);
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
    setHasEditId("");
  };

  const handleEdit = (rowId: string) => {
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
        setClientSearchValue("");
        setProjectSearchValue("");
        setUserSearchValue("");
        setProcessSearchValue("");
        setGroupSearchValue("");
        setStatusSearchValue("");
        setOrgSearchValue("");
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
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setPermissionDropdownData(ResponseData);
      } else {
        setPermissionDropdownData([]);
      }
    };
    callAPI(url, params, successCallback, "GET");
  };

  useEffect(() => {
    tab === "Permission" && getPermissionDropdown();
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
      RoleId: projectValue !== 0 && projectValue,
      Permissions: updatedPermissionsData,
    };
    const url = `${process.env.pms_api_url}/Role/SavePermission`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
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
    arg5: any
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
    setVisibleTabs(updatedTabs.slice(0, 8));
    setDropdownTabs(updatedTabs.slice(8));
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
    searchValue: any
  ) => {
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");

    const data = {
      GlobalSearch: searchValue,
      SortColumn: null,
      IsDesc: false,
      IsDownload: true,
      PageNo: 1,
      PageSize: 50000,
    };

    const statusData = {
      ...currentFilterData,
      GlobalSearch: searchValue,
      SortColumn: null,
      IsDesc: false,
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

  const clearSearchValue = (tab: string) => {
    switch (tab) {
      case CLIENT:
        setClientSearchValue("");
        break;
      case PROJECT:
        setProjectSearchValue("");
        break;
      case USER:
        setUserSearchValue("");
        break;
      case PROCESS:
        setProcessSearchValue("");
        break;
      case GROUP:
        setGroupSearchValue("");
        break;
      case STATUS:
        setStatusSearchValue("");
        break;
      case ORGANIZATION:
        setOrgSearchValue("");
        break;
    }
  };

  const handleProjectName = (e: any) => {
    if (e.target.value === "" || e.target.value.trim().length <= 0) {
      setProjectName(e.target.value);
      setProjectNameError(true);
      setProjectNameErrText("This is required field.");
    } else {
      setProjectName(e.target.value);
      setProjectNameError(false);
      setProjectNameErrText("This field is required.");
    }
  };

  const handleProject = (e: React.SyntheticEvent, value: any) => {
    if (value !== null) {
      if (isNaN(parseInt(value.value))) {
        toggleOpen(true);
        setProjectName(value.value);
        setProjectValue(null);
      }
      if (value !== null && !isNaN(parseInt(value.value))) {
        const selectedValue = value.value;
        setProjectValue(selectedValue);
        setProjectValueError(false);
        setProjectValueErrText("");
      } else {
        setProjectValue(0);
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
        RoleId: projectValue,
        Name: projectName,
        Type: permissionDropdownData
          .map((i: any) => (i.value === projectValue ? i.Type : undefined))
          .filter((i: any) => i !== undefined)[0],
      };

      const url = `${process.env.pms_api_url}/Role/Save`;
      const successCallback = (
        ResponseData: any,
        error: any,
        ResponseStatus: any
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          getPermissionDropdown();
          toast.success(`Role saved successfully.`);
          handleClose();
        }
      };
      callAPI(url, params, successCallback, "POST");
    };

    if (projectName.trim().length > 0 && projectValue !== null) {
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
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        getPermissionDropdown();
        toast.success(`Role has been deleted successfully!`);
        setProjectValue(0);
      }
    };
    callAPI(url, params, successCallback, "POST");
    setIsDeleteOpenProject(false);
  };

  return (
    <Wrapper className="min-h-screen overflow-y-auto">
      <Navbar
        onUserDetailsFetch={handleUserDetailsFetch}
        onHandleModuleNames={handleModuleNames}
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
                .filter((i: any) => i.canView !== false)
                .map((tab, index, array) => (
                  <label
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id, index)}
                    className={`text-[16px] ${
                      array.length === 8 ? "px-2" : "px-4"
                    } cursor-pointer select-none flex items-center justify-center ${
                      selectedTabIndex === index
                        ? "text-[#0592C6] font-semibold"
                        : "text-slatyGrey"
                    } ${
                      index < array.length - 1
                        ? "border-r border-r-lightSilver h-3"
                        : `${array.length === 8 ? "px-2" : "px-4"}`
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
              {tab !== "Permission" ? (
                <>
                  {(tab === "Client" ||
                    tab === "Project" ||
                    tab === "User" ||
                    tab === "Process" ||
                    tab === "Group" ||
                    tab === "Status" ||
                    tab === "Organization") && (
                    <div className="relative">
                      <InputBase
                        className="pl-1 pr-7 border-b border-b-lightSilver w-48"
                        placeholder="Search"
                        value={
                          tab === "Client"
                            ? clientSearchValue
                            : tab === "Project"
                            ? projectSearchValue
                            : tab === "User"
                            ? userSearchValue
                            : tab === "Process"
                            ? processSearchValue
                            : tab === "Group"
                            ? groupSearchValue
                            : tab === "Status"
                            ? statusSearchValue
                            : tab === "Organization" && orgSearchValue
                        }
                        onChange={(e: any) =>
                          tab === "Client"
                            ? setClientSearchValue(e.target.value)
                            : tab === "Project"
                            ? setProjectSearchValue(e.target.value)
                            : tab === "User"
                            ? setUserSearchValue(e.target.value)
                            : tab === "Process"
                            ? setProcessSearchValue(e.target.value)
                            : tab === "Group"
                            ? setGroupSearchValue(e.target.value)
                            : tab === "Status"
                            ? setStatusSearchValue(e.target.value)
                            : tab === "Organization" &&
                              setOrgSearchValue(e.target.value)
                        }
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
                            ? ""
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
                                const tabMappings: any = {
                                  Client: "client",
                                  Group: "group",
                                  Process: "process",
                                  Project: "project",
                                  Status: "status",
                                  User: "user",
                                  Organization: "organization",
                                };

                                const searchData: any = {
                                  Client: clientSearchValue,
                                  Group: groupSearchValue,
                                  Process: processSearchValue,
                                  Project: projectSearchValue,
                                  Status: statusSearchValue,
                                  User: userSearchValue,
                                };

                                const selectedTab = tabMappings[tab];

                                if (selectedTab) {
                                  exportData(
                                    selectedTab,
                                    `${tab}_data`,
                                    searchData[tab]
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
              ) : (
                <div className="flex items-center justify-center gap-3 mr-4">
                  <Autocomplete
                    className={`${
                      projectValueError ? "errorAutocomplete" : ""
                    }`}
                    limitTags={2}
                    id="checkboxes-tags-demo"
                    options={permissionDropdownData}
                    value={
                      projectValue !== 0
                        ? permissionDropdownData.find(
                            (option: any) => option.value === projectValue
                          ) || null
                        : null
                    }
                    sx={{ width: "250px" }}
                    getOptionLabel={(option: any) => option.label}
                    onChange={handleProject}
                    filterOptions={(options: any, params: any) => {
                      const filtered = filter(options, params);
                      return filtered;
                    }}
                    renderOption={(props: any, option: any) => {
                      const isItemHovered = option === hoveredItem;

                      const handleEditClick = () => {
                        setProjectName(option.label);
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
                              <span
                                className="absolute right-3"
                                onClick={handleDeleteClick}
                              >
                                <Delete />
                              </span>
                              <span
                                className="absolute right-10 pt-1"
                                onClick={handleEditClick}
                              >
                                <Edit />
                              </span>
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
                  {projectValueError && (
                    <span className="text-[#D32F2F] text-[12px] -mt-3">
                      {projectValueErrText}
                    </span>
                  )}
                  <div className="w-[60px]">
                    <Button
                      variant="contained"
                      color="info"
                      className={`rounded-md !bg-secondary ${
                        projectValue === 0 ||
                        !hasPermissionWorklog(tab, "save", "settings")
                          ? "opacity-50 pointer-events-none uppercase"
                          : ""
                      } ${
                        projectValue === 0 ||
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
              <Button
                type="submit"
                variant="contained"
                color="info"
                className={`${
                  tab === "Permissions"
                    ? "rounded-[4px] !h-[45px] "
                    : "rounded-[4px] !h-[36px] text-sm"
                } ${
                  isLoaded &&
                  (hasPermissionWorklog(tab, "save", "settings") ||
                    tabs.filter(
                      (i: any) => i.label.toLowerCase() === "organization"
                    )[0].canView)
                    ? ""
                    : "cursor-not-allowed"
                } !bg-secondary`}
                onClick={
                  hasPermissionWorklog(tab, "save", "settings") ||
                  tabs.filter(
                    (i: any) => i.label.toLowerCase() === "organization"
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
                    Create {tab === "Permission" ? "Role" : tab}
                  </span>
                </span>
              </Button>
            </div>
          </div>
        )}

        {/*  Drawer */}
        <Drawer
          userData={userData}
          orgData={orgData}
          clientData={clientData}
          projectData={projectData}
          processData={processData}
          onEdit={hasEditId}
          groupData={groupData}
          statusData={statusData}
          onOpen={openDrawer}
          tab={tab}
          onClose={handleDrawerClose}
          onDataFetch={getDataFunction}
          onUserDataFetch={getUserDataFunction}
          onRefresh={handleRefresh}
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
            onHandleClientData={handleClientData}
            onDataFetch={handleDataFetch}
            getOrgDetailsFunction={getOrgDetailsFunction}
            canView={hasPermissionWorklog("client", "view", "settings")}
            canEdit={hasPermissionWorklog("client", "save", "settings")}
            canDelete={hasPermissionWorklog("client", "delete", "settings")}
            canProcess={hasPermissionWorklog("client", "save", "settings")}
            onSearchClientData={clientSearchValue}
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
            onHandleProjectData={handleProjectData}
            getOrgDetailsFunction={getOrgDetailsFunction}
            canView={hasPermissionWorklog("project", "view", "settings")}
            canEdit={hasPermissionWorklog("project", "save", "settings")}
            canDelete={hasPermissionWorklog("project", "delete", "settings")}
            onSearchProjectData={projectSearchValue}
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
            onHandleUserData={handleUserData}
            onUserDataFetch={handleUserDataFetch}
            getOrgDetailsFunction={getOrgDetailsFunction}
            canView={hasPermissionWorklog("user", "view", "settings")}
            canEdit={hasPermissionWorklog("user", "save", "settings")}
            canDelete={hasPermissionWorklog("user", "delete", "settings")}
            onSearchUserData={userSearchValue}
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
            onHandleGroupData={handleGroupData}
            getOrgDetailsFunction={getOrgDetailsFunction}
            canView={hasPermissionWorklog("group", "view", "settings")}
            canEdit={hasPermissionWorklog("group", "save", "settings")}
            canDelete={hasPermissionWorklog("group", "delete", "settings")}
            onSearchGroupData={groupSearchValue}
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
            onHandleProcessData={handleProcessData}
            getOrgDetailsFunction={getOrgDetailsFunction}
            canView={hasPermissionWorklog("process", "view", "settings")}
            canEdit={hasPermissionWorklog("process", "save", "settings")}
            canDelete={hasPermissionWorklog("process", "delete", "settings")}
            onSearchProcessData={processSearchValue}
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
            onHandleStatusData={handleStatusData}
            getOrgDetailsFunction={getOrgDetailsFunction}
            canView={hasPermissionWorklog("status", "view", "settings")}
            canEdit={hasPermissionWorklog("status", "save", "settings")}
            canDelete={hasPermissionWorklog("status", "delete", "settings")}
            onSearchStatusData={statusSearchValue}
            onSearchClear={clearSearchValue}
            onHandleExport={handleCanExport}
            currentFilterData={currentFilterData}
            onFilterOpen={isFilterOpen}
          />
        )}
        {tab === "Permission" && (
          <Permissions
            onOpen={
              hasPermissionWorklog(tab, "save", "settings")
                ? handleDrawerOpen
                : undefined
            }
            onEdit={handleEdit}
            expanded={isPermissionExpanded}
            permissionValue={projectValue}
            sendDataToParent={(data: any) => setUpdatedPermissionsData(data)}
            getOrgDetailsFunction={getOrgDetailsFunction}
            canView={hasPermissionWorklog("permission", "view", "settings")}
            canEdit={hasPermissionWorklog("permission", "save", "settings")}
            canDelete={hasPermissionWorklog("permission", "delete", "settings")}
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
            onHandleOrgData={handleOrgData}
            onDataFetch={handleDataFetch}
            getOrgDetailsFunction={getOrgDetailsFunction}
            onSearchOrgData={orgSearchValue}
            onSearchClear={clearSearchValue}
            onHandleExport={handleCanExport}
          />
        )}
      </div>

      <ImportDialog
        onOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onDataFetch={getDataFunction}
        tab={tab}
      />

      {tab === "Status" && (
        <FilterDialog_Status
          onOpen={isFilterOpen}
          onClose={handleCloseFilter}
          onDataFetch={() => {}}
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
            value={projectName}
            error={projectNameError}
            helperText={projectNameError && projectNameErrText}
            id="standard-basic"
            label="Role"
            placeholder={editDialogOpen ? "Edit a Role" : "Add new Role"}
            variant="standard"
            onChange={handleProjectName}
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
    </Wrapper>
  );
};

export default Page;
