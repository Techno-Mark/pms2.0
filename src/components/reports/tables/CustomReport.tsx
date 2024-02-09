import {
  generateCustomHeaderName,
  generateCommonBodyRender,
  generateInitialTimer,
  generateDateWithoutTime,
  generateStatusWithColor,
} from "@/utils/datatable/CommonFunction";
import MUIDataTable from "mui-datatables";
import { useEffect, useRef, useState } from "react";
import { callAPI } from "@/utils/API/callAPI";
import { options } from "@/utils/datatable/TableOptions";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { TablePagination, ThemeProvider } from "@mui/material";
import { haveSameData } from "@/utils/reports/commonFunctions";
import { customreport_InitialFilter } from "@/utils/reports/getFilters";
import ReportLoader from "@/components/common/ReportLoader";
import TableActionIcon from "@/assets/icons/TableActionIcon";
import React from "react";
import { toast } from "react-toastify";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";

const CustomReport = ({ filteredData, searchValue, onHandleExport }: any) => {
  const [customReportFields, setCustomReportFields] = useState({
    loaded: true,
    data: [],
    dataCount: 0,
  });
  const [customReportCurrentPage, setCustomReportCurrentPage] =
    useState<number>(0);
  const [customReportRowsPerPage, setCustomReportRowsPerPage] =
    useState<number>(10);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  const getData = async (arg1: any) => {
    setCustomReportFields({
      ...customReportFields,
      loaded: false,
    });
    const url = `${process.env.report_api_url}/report/custom`;

    const successCallback = (data: any, error: any) => {
      if (data !== null && error === false) {
        onHandleExport(data.List.length > 0);
        setCustomReportFields({
          ...customReportFields,
          loaded: true,
          data: data.List,
          dataCount: data.TotalCount,
        });
      }
    };
    callAPI(url, arg1, successCallback, "post");
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setCustomReportCurrentPage(newPage);

    if (filteredData !== null) {
      if (!haveSameData(customreport_InitialFilter, filteredData)) {
        getData({
          ...filteredData,
          pageNo: newPage + 1,
          pageSize: customReportRowsPerPage,
        });
      }
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCustomReportCurrentPage(0);
    setCustomReportRowsPerPage(parseInt(event.target.value));

    if (filteredData !== null) {
      if (!haveSameData(customreport_InitialFilter, filteredData)) {
        getData({
          ...filteredData,
          pageNo: 1,
          pageSize: event.target.value,
        });
      }
    }
  };

  const handleDeleteRow = async () => {
    if (selectedRowId) {
      const params = {
        workitemIds: [selectedRowId],
      };
      const url = `${process.env.worklog_api_url}/workitem/deleteworkitem`;
      const successCallback = (
        ResponseData: any,
        error: any,
        ResponseStatus: any
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success("Task has been deleted successfully!");
        }
      };
      callAPI(url, params, successCallback, "POST");
      setSelectedRowId(null);
      setIsDeleteOpen(false);
      getData({ ...filteredData, globalSearch: searchValue });
    }
  };

  const closeModal = () => {
    setSelectedRowId(null);
    setIsDeleteOpen(false);
  };

  useEffect(() => {
    if (filteredData !== null) {
      if (haveSameData(customreport_InitialFilter, filteredData)) {
        setCustomReportFields({
          ...customReportFields,
          data: [],
          dataCount: 0,
        });
      } else {
        setCustomReportCurrentPage(0);
        setCustomReportRowsPerPage(10);
        getData({ ...filteredData, globalSearch: searchValue });
      }
    }
  }, [filteredData, searchValue]);

  const handleActionValue = async (actionId: string, id: any) => {
    if (actionId.toLowerCase() === "edit") {
      window.open(`${process.env.redirectEditURL}${id}`, "_blank");
    }
    if (actionId.toLowerCase() === "delete") {
      setSelectedRowId(id);
      setIsDeleteOpen(true);
    }
  };

  const Actions = ({ actions, id }: any) => {
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
      (action: any) =>
        action.toLowerCase() === "edit" || action.toLowerCase() === "delete"
    );
    const admin: any = localStorage.getItem("IsAdmin");

    return actionPermissions.length > 0 && admin === true ? (
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
                  {actionPermissions.map((action: any, index: any) => (
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
    ) : admin === true ? (
      <div className="w-5 h-5 relative opacity-50 pointer-events-none">
        <TableActionIcon />
      </div>
    ) : (
      <div className="w-5 h-5 relative opacity-50 pointer-events-none">-</div>
    );
  };

  const columns: any[] = [
    {
      name: "WorkItemId",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Task ID"),
      },
    },
    {
      name: "ClientName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Client Name"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "ProjectName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Project Name"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "TaskName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Task Name"),
        customBodyRender: (value: any, tableMeta: any) => {
          return (
            <div className="ml-2">
              {!value || value === "0" ? (
                "-"
              ) : (
                <a
                  target="_blank"
                  href={`${process.env.redirectURL}${tableMeta.rowData[0]}`}
                  className="text-[#0592C6] cursor-pointer"
                >
                  {value}
                </a>
              )}
            </div>
          );
        },
      },
    },
    {
      name: "ProcessName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Process Name"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "Status",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Status"),
        customBodyRender: (value: any, tableMeta: any) => {
          return generateStatusWithColor(
            value,
            tableMeta.rowData[tableMeta.rowData.length - 1]
          );
        },
      },
    },
    {
      name: "AssigneeName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Assignee"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "ReviewerName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Reviewer"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "AssignedBy",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Assigned By"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "TaxReturnType",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Return Type"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "NoOfPages",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("No. of Pages"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "ReturnYear",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Return Year"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "CurrentYear",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Current Year"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "Complexity",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Complexity"),
        customBodyRender: (value: any) => {
          switch (value) {
            case 1:
              return "Moderate";
            case 2:
              return "Intermediate";
            case 3:
              return "Complex";
            default:
              return "-";
          }
        },
      },
    },
    {
      name: "priority",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Priority"),
        customBodyRender: (value: any) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "ReceiverDate",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Recieved Date"),
        customBodyRender: (value: any) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "DueDate",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Due Date"),
        customBodyRender: (value: any) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "AllInfoDate",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("All Info Date"),
        customBodyRender: (value: any) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "TotalEstimatedHours",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Total Est. Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "TotalSTDHours",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Total Std. Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "TotalTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Actual Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "EditedHours",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Edited Hours"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "Description",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Description"),
      },
    },
    {
      name: "DateCreated",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Date Created"),
        customBodyRender: (value: any) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "DateOfPreparation",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Date of Preparation"),
        customBodyRender: (value: any) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "DateOfReview",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Date of Review"),
        customBodyRender: (value: any) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "AssigneeTimeTracked",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Assignee Time Tracked"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "ReviewerTimeTracked",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Reviewer Time Tracked"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "Errors",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Errors-Reviewer"),
      },
    },
    {
      name: "BTC",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("BTC Hours"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "IsBTC",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Billing Status"),
      },
    },
    {
      name: "WorkItemId",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Change Request"),
        customBodyRender: (value: any) => {
          return (
            <div>
              {!value || value === "0" ? (
                <span className="ml-[-30px]">-</span>
              ) : (
                <Actions actions={["Edit", "Delete"]} id={value} />
              )}
            </div>
          );
        },
      },
    },
    {
      name: "StatusColorCode",
      options: {
        display: false,
      },
    },
  ];

  return customReportFields.loaded ? (
    <>
      <div
        className={`${customReportFields.data.length > 0 && "muiTableAction"}`}
      >
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            columns={columns}
            data={customReportFields.data}
            title={undefined}
            options={{
              ...options,
              textLabels: {
                body: {
                  noMatch: (
                    <div className="flex items-start">
                      <span>
                        {filteredData === null
                          ? "Please apply filter to view data."
                          : "Currently there is no record available."}
                      </span>
                    </div>
                  ),
                  toolTip: "",
                },
              },
            }}
          />
          <TablePagination
            component="div"
            count={customReportFields.dataCount}
            page={customReportCurrentPage}
            onPageChange={handleChangePage}
            rowsPerPage={customReportRowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </ThemeProvider>
      </div>

      {/* Delete Modal */}
      {isDeleteOpen && (
        <DeleteDialog
          isOpen={isDeleteOpen}
          onClose={closeModal}
          onActionClick={handleDeleteRow}
          Title={"Delete Task"}
          firstContent={"Are you sure you want to delete Task?"}
          secondContent={
            "If you delete task, you will permanently loose task and task related data."
          }
        />
      )}
    </>
  ) : (
    <ReportLoader />
  );
};

export default CustomReport;
