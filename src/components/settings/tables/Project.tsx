import ReportLoader from "@/components/common/ReportLoader";
import SwitchModal from "@/components/common/SwitchModal";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import { callAPI } from "@/utils/API/callAPI";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  generateCommonBodyRender,
  generateCustomHeaderName,
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import TableActionIcon from "@/assets/icons/TableActionIcon";
import { Switch, TablePagination, ThemeProvider } from "@mui/material";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import MUIDataTable from "mui-datatables";
import {
  ProjectInitialFilter,
  ProjectList,
  SettingAction,
  SettingProps,
} from "@/utils/Types/settingTypes";

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  GlobalSearch: "",
  PageNo: pageNo,
  PageSize: pageSize,
  ClientId: null,
  ProjectId: null,
  IsActive: null,
  SortColumn: null,
  IsDesc: true,
};

const Project = ({
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
}: SettingProps) => {
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState<ProjectList[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isOpenSwitchModal, setIsOpenSwitchModal] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [switchId, setSwitchId] = useState(0);
  const [switchActive, setSwitchActive] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredObject, setFilteredOject] =
    useState<ProjectInitialFilter>(initialFilter);

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
    const params = filteredObject;
    const url = `${process.env.pms_api_url}/project/getall`;
    const successCallback = (
      ResponseData: { List: ProjectList[]; TotalCount: number },
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
      ProjectId: selectedRowId,
    };
    const url = `${process.env.pms_api_url}/Project/Delete`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Project has been deleted successfully!");
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

  const handleToggleProject = async () => {
    const params = {
      isActive: switchActive,
      ProjectId: switchId,
    };
    const url = `${process.env.pms_api_url}/project/activeinactive`;
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
          className="w-5 h-5 cursor-pointer relative"
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
                <Switch checked={value} onChange={() => activeUser()} />
              </div>
            );
          },
        },
      };
    } else if (column.label === "Actions") {
      return {
        name: "ProjectId",
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
      name: "ClientName",
      label: "Client Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "WorkType",
      label: "Type Of Work",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ProjectName",
      label: "Project Name",
      bodyRenderer: generateCommonBodyRender,
    },
    // {
    //   name: "SubProjectName",
    //   label: "Sub-Project Name",
    //   bodyRenderer: generateCommonBodyRender,
    // },
    {
      name: "IsActive",
      label: "Status",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ProjectId",
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
    expandableRows: false,
    // renderExpandableRow: (rowData: any, rowMeta: any) => {
    //   const activeUser = async (e: any, id: any, active: any) => {
    //     await setIsOpenSwitchModal(true);
    //     await setSwitchId(id);
    //     await setSwitchActive(!active);
    //   };
    //   return (
    //     <React.Fragment>
    //       <tr>
    //         <td colSpan={12}>
    //           <TableContainer component={Paper}>
    //             <Table style={{ minWidth: "650" }} aria-label="simple table">
    //               <TableBody>
    //                 {data[rowMeta.rowIndex].SubProject.length > 0 ? (
    //                   data[rowMeta.rowIndex].SubProject.map((i: any) => (
    //                     <TableRow key={i.SubProjectId}>
    //                       <TableCell className="!pl-[4.5rem] w-[22rem]">
    //                         {i.ClientName}
    //                       </TableCell>
    //                       <TableCell className="w-[19rem]">
    //                         {i.ProjectName}
    //                       </TableCell>
    //                       <TableCell className="w-[19rem]">
    //                         {i.SubProjectName}
    //                       </TableCell>
    //                       <TableCell className="w-[15.6rem]">
    //                         <Switch
    //                           checked={i.IsActive}
    //                           onChange={(e) =>
    //                             activeUser(
    //                               e.target.value,
    //                               i.SubProjectId,
    //                               i.IsActive
    //                             )
    //                           }
    //                         />
    //                       </TableCell>
    //                       <TableCell>
    //                         <Actions
    //                           actions={["Edit", "Delete"]}
    //                           id={i.SubProjectId}
    //                         />
    //                       </TableCell>
    //                     </TableRow>
    //                   ))
    //                 ) : (
    //                   <TableRow className="h-16">
    //                     <span className="flex items-center justify-start ml-16 pt-5">No data found.</span>
    //                   </TableRow>
    //                 )}
    //               </TableBody>
    //             </Table>
    //           </TableContainer>
    //         </td>
    //       </tr>
    //     </React.Fragment>
    //   );
    // },
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
                  columns={projectColumns}
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
                                create project
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

            {/* Delete Modal */}
            {isDeleteOpen && (
              <DeleteDialog
                isOpen={isDeleteOpen}
                onClose={closeModal}
                onActionClick={handleDeleteRow}
                Title={"Delete Project"}
                firstContent={"Are you sure you want to delete Project?"}
                secondContent={
                  "If you delete the project, you will permanently lose project and project related data."
                }
              />
            )}

            {isOpenSwitchModal && (
              <SwitchModal
                isOpen={isOpenSwitchModal}
                onClose={closeSwitchModal}
                title={`${
                  switchActive === true ? "Active" : "InActive"
                } Project`}
                actionText="Yes"
                onActionClick={handleToggleProject}
                firstContent={`Are you sure you want to ${
                  switchActive === true ? "Active" : "InActive"
                } Project?`}
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

export default Project;
