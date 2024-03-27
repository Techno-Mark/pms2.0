import React, { useEffect, useRef, useState } from "react";
import DrawerOverlay from "../drawer/DrawerOverlay";
import UserPermissionDrawer from "../drawer/UserPermissionDrawer";
import SwitchModal from "@/components/common/SwitchModal";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import ReportLoader from "@/components/common/ReportLoader";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";
import {
  generateCommonBodyRender,
  generateCustomHeaderName,
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import {
  Avatar,
  AvatarGroup,
  Switch,
  TablePagination,
  ThemeProvider,
} from "@mui/material";
import MUIDataTable from "mui-datatables";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import TableActionIcon from "@/assets/icons/TableActionIcon";
import {
  SettingProps,
  UserInitialFilter,
  UserList,
} from "@/utils/Types/settingTypes";

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  UserId: 0,
  GlobalSearch: "",
  SortColumn: null,
  IsDesc: true,
  PageNo: pageNo,
  PageSize: pageSize,
  Status: null,
  WorkTypeId: null,
};

const User = ({
  onOpen,
  onEdit,
  onDataFetch,
  getOrgDetailsFunction,
  canView,
  canEdit,
  canDelete,
  canPermission,
  onSearchData,
  onSearchClear,
  onHandleExport,
}: SettingProps) => {
  const [loader, setLoader] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isOpenSwitchModal, setIsOpenSwitchModal] = useState(false);
  const [switchId, setSwitchId] = useState(0);
  const [switchActive, setSwitchActive] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [data, setData] = useState<UserList[]>([]);
  const [openProcessDrawer, setOpenProcessDrawer] = useState(false);
  const [roleId, setRoleId] = useState(0);
  const [userId, setUserId] = useState(0);
  const [userType, setUserType] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredObject, setFilteredOject] =
    useState<UserInitialFilter>(initialFilter);

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
        onDataFetch?.(fetchData);
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
    const params = filteredObject;
    const url = `${process.env.api_url}/user/getall`;
    const successCallback = (
      ResponseData: { List: UserList[]; TotalCount: number },
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
        setData([]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const closeModal = () => {
    setIsDeleteOpen(false);
  };

  const handleDeleteRow = async () => {
    const params = {
      UserId: selectedRowId,
    };
    const url = `${process.env.api_url}/user/delete`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("User has been deleted successfully!");
        setIsDeleteOpen(false);
        onSearchClear();
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

  const closeSwitchModal = async () => {
    await setIsOpenSwitchModal(false);
  };

  const handleToggleUser = async () => {
    const params = {
      UserId: switchId,
      ActiveStatus: switchActive,
    };
    const url = `${process.env.api_url}/user/activeinactive`;
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
          GlobalSearch: "",
          PageNo: 1,
        });
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleCloseProcessDrawer = () => {
    setOpenProcessDrawer(false);
    setRoleId(0);
    setUserId(0);
    setUserType(null);
  };

  const handleResendInvite = async (
    id: number,
    email: string,
    firstName: string,
    lastName: string
  ) => {
    const Org_Name: any = await localStorage.getItem("Org_Name");
    const params = {
      UserId: id,
      Email: email,
      FirstName: firstName,
      LastName: lastName,
      OrganizationName: Org_Name,
    };
    const url = `${process.env.api_url}/user/ResendLink`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Resend Link sent Successfully.");
        onSearchClear();
        setFilteredOject({
          ...filteredObject,
          GlobalSearch: "",
          PageNo: 1,
        });
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleActionValue = async (
    actionId: string,
    id: number,
    roleId: number,
    firstName: string,
    lastName: string,
    email: string,
    userType: string
  ) => {
    setSelectedRowId(id);
    if (actionId.toLowerCase() === "edit") {
      onEdit(id);
    }
    if (actionId.toLowerCase() === "delete") {
      setIsDeleteOpen(true);
    }
    if (actionId.toLowerCase() === "permissions") {
      setOpenProcessDrawer(true);
      setRoleId(roleId);
      setUserId(id);
      setUserType(userType);
    }
    if (actionId.toLowerCase() === "resend invite") {
      handleResendInvite(id, email, firstName, lastName);
    }
  };

  const Actions = ({
    actions,
    id,
    roleId,
    firstName,
    lastName,
    email,
    userType,
  }: {
    actions: string[];
    id: number;
    roleId: number;
    firstName: string;
    lastName: string;
    email: string;
    userType: string;
  }) => {
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
        (action.toLowerCase() === "permissions" && canPermission) ||
        action.toLowerCase() === "resend invite"
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
              <div className="py-2 border border-lightSilver rounded-md bg-pureWhite shadow-lg ">
                <ul className="w-28">
                  {actionPermissions.map((action: string, index: number) => (
                    <li
                      key={index}
                      onClick={() =>
                        handleActionValue(
                          action,
                          id,
                          roleId,
                          firstName,
                          lastName,
                          email,
                          userType
                        )
                      }
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
          viewColumns: true,
          sort: true,
          display: false,
          customHeadLabelRender: () => generateCustomHeaderName("Status"),
          customBodyRender: (value: boolean, tableMeta: any) => {
            const activeUser = async () => {
              await setIsOpenSwitchModal(true);
              await setSwitchId(
                tableMeta.rowData[tableMeta.rowData.length - 5]
              );
              await setSwitchActive(!value);
            };
            return (
              <div>
                <Switch checked={value} onChange={() => activeUser()} />
              </div>
            );
          },
        },
      };
    } else if (column.name === "GroupNames") {
      return {
        name: "GroupNames",
        options: {
          filter: true,
          viewColumns: true,
          sort: true,
          display: false,
          customHeadLabelRender: () => generateCustomHeaderName("Group"),
          customBodyRender: (value: string[]) => {
            const Red = ["A", "F", "K", "P", "U", "Z"];
            const Blue = ["B", "G", "L", "Q", "V"];
            const Green = ["C", "H", "M", "R", "W"];
            const SkyBlue = ["D", "I", "N", "S", "X"];
            const Yellow = ["E", "J", "O", "T", "Y"];
            return (
              <div className="flex items-start justify-start">
                <AvatarGroup max={3}>
                  {value.map((i: string) => (
                    <Avatar
                      alt=""
                      src=""
                      sx={{
                        bgcolor: Red.includes(i.toUpperCase().charAt(0))
                          ? "#DC3545"
                          : Blue.includes(i.charAt(0))
                          ? "#0A58CA"
                          : Green.includes(i.charAt(0))
                          ? "#02B89D"
                          : SkyBlue.includes(i.charAt(0))
                          ? "#333333"
                          : "#664D03",
                      }}
                      key={i}
                    >
                      {i.length <= 2
                        ? i.slice(0, 2)
                        : i.match(/\s/)
                        ? i
                            .split(" ")
                            .map((word: string) => word.charAt(0))
                            .join("")
                        : i.charAt(0)}
                    </Avatar>
                  ))}
                </AvatarGroup>
              </div>
            );
          },
        },
      };
    } else if (column.label === "Actions") {
      return {
        name: "UserId",
        options: {
          filter: true,
          viewColumns: false,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName("Actions"),
          customBodyRender: (value: number, tableMeta: any) => {
            return (
              <Actions
                actions={[
                  "Edit",
                  "Permissions",
                  "Delete",
                  tableMeta.rowData[tableMeta.rowData.length - 1]
                    ? ""
                    : "Resend Invite",
                ]}
                id={value}
                roleId={tableMeta.rowData[tableMeta.rowData.length - 2]}
                firstName={tableMeta.rowData[tableMeta.rowData.length - 4]}
                lastName={tableMeta.rowData[tableMeta.rowData.length - 3]}
                email={tableMeta.rowData[3]}
                userType={tableMeta.rowData[1]}
              />
            );
          },
        },
      };
    } else if (column.name === "UserId") {
      return {
        name: "UserId",
        options: {
          display: false,
          viewColumns: false,
        },
      };
    } else if (column.name === "FirstName") {
      return {
        name: "FirstName",
        options: {
          display: false,
          viewColumns: false,
        },
      };
    } else if (column.name === "LastName") {
      return {
        name: "LastName",
        options: {
          display: false,
          viewColumns: false,
        },
      };
    } else if (column.name === "RoleId") {
      return {
        name: "RoleId",
        options: {
          display: false,
          viewColumns: false,
        },
      };
    } else if (column.name === "IsConfirmed") {
      return {
        name: "IsConfirmed",
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

  const column = [
    {
      name: "FullName",
      label: "User Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "UserType",
      label: "User Type",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "WorkTypeName",
      label: "Type Of Work",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Email",
      label: "Email",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ContactNo",
      label: "Mobile",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "DepartmentName",
      label: "Department",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "RMUserName",
      label: "Reporting Manager",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "GroupNames",
      label: "Group",
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
      name: "UserId",
      options: {
        display: false,
        viewColumns: false,
      },
    },
    {
      name: "FirstName",
      options: {
        display: false,
        viewColumns: false,
      },
    },
    {
      name: "LastName",
      options: {
        display: false,
        viewColumns: false,
      },
    },
    {
      name: "RoleId",
      options: {
        display: false,
        viewColumns: false,
      },
    },
    {
      name: "IsConfirmed",
      options: {
        display: false,
        viewColumns: false,
      },
    },
  ];

  const userColumns = column.map((col: any) => {
    return generateConditionalColumn(col, 10);
  });

  const options: any = {
    filterType: "checkbox",
    responsive: "standard",
    tableBodyHeight: "63.5vh",
    viewColumns: true,
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
            <div className="muiTableAction">
              <ThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                  data={data}
                  columns={userColumns}
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
                                create user
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
                  className="mt-[10px]"
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
                Title={"Delete Group"}
                firstContent={"Are you sure you want to delete User?"}
                secondContent={
                  "If you delete User, you will permanently lose user and user related data."
                }
              />
            )}

            {isOpenSwitchModal && (
              <SwitchModal
                isOpen={isOpenSwitchModal}
                onClose={closeSwitchModal}
                title={`${switchActive === true ? "Active" : "InActive"} User`}
                actionText="Yes"
                onActionClick={handleToggleUser}
                firstContent={`Are you sure you want to ${
                  switchActive === true ? "Active" : "InActive"
                } User?`}
              />
            )}

            <UserPermissionDrawer
              onOpen={openProcessDrawer}
              onClose={handleCloseProcessDrawer}
              userId={userId}
              roleId={roleId}
              userType={userType}
            />
            <DrawerOverlay
              isOpen={openProcessDrawer}
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

export default User;
