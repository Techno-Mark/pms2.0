import FilterIcon from "@/assets/icons/FilterIcon";
import { ColorToolTip, getMuiTheme } from "@/utils/datatable/CommonStyle";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { Close, Delete } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TablePagination,
  ThemeProvider,
  Tooltip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import FilterDialogHalfDay from "./FilterDialogHalfDay";
import { callAPI } from "@/utils/API/callAPI";
import {
  generateCommonBodyRender,
  generateCustomHeaderName,
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import { generateCustomColumn } from "@/utils/datatable/columns/ColsGenerateFunctions";
import MUIDataTable from "mui-datatables";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import SwitchModal from "@/components/common/SwitchModal";
import ReportLoader from "@/components/common/ReportLoader";
import { toast } from "react-toastify";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";

interface HalfDayModalProps {
  onOpen: boolean;
  onClose: () => void;
}

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  IsDownload: false,
  PageNo: pageNo,
  PageSize: pageSize,
  IsDesc: false,
  SortColumn: "",
  MonthFilter: null,
  YearFilter: null,
  Users: [],
};

const TimelineHalfDay: React.FC<HalfDayModalProps> = ({ onOpen, onClose }) => {
  const [isFilterOpen, setisFilterOpen] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [workItemData, setWorkItemData] = useState<any | any[]>([]);
  const [filteredObject, setFilteredOject] = useState<any>(initialFilter);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [tableDataCount, setTableDataCount] = useState(0);
  const [inputDate, setInputDate] = useState(new Date());
  const [leaveId, setLeaveId] = useState(0);
  const [leaveDate, setLeaveDate] = useState(null);
  const [isOpenSwitchModal, setIsOpenSwitchModal] = useState(false);
  const [isDeleteOpenProject, setIsDeleteOpenProject] = useState(false);

  const closeModal = () => {
    setIsDeleteOpenProject(false);
    setLeaveId(0);
    setLeaveDate(null);
  };

  const closeSwitchModal = () => {
    setIsOpenSwitchModal(false);
  };

  const handleCloseFilter = () => {
    setisFilterOpen(false);
  };

  const handleClose = () => {
    setisFilterOpen(false);
    setFilteredOject(initialFilter);
    setInputDate(new Date());
    setLoaded(false);
    setIsOpenSwitchModal(false);
    setIsDeleteOpenProject(false);
    setLeaveDate(null);
    onClose();
  };

  const getIdFromFilterDialog = (data: any) => {
    setFilteredOject({
      ...filteredObject,
      ...data,
    });
  };

  const applyHalfDay = async () => {
    const params = {
      LeaveId: 0,
      LeaveDate:
        inputDate !== null
          ? new Date(new Date(inputDate).getTime())?.toISOString()
          : null,
    };
    const url = `${process.env.worklog_api_url}/workitem/timeline/savedeleteuserleave`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setIsOpenSwitchModal(false);
        toast.success("Half Day Applied Successfully.");
        getHalfDayList();
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const deleteHalfDayList = async () => {
    const params = {
      LeaveId: leaveId,
      LeaveDate: leaveDate,
    };
    const url = `${process.env.worklog_api_url}/workitem/timeline/savedeleteuserleave`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        getHalfDayList();
        toast.success(`Half Day has been deleted successfully!`);
        setLeaveId(0);
        setLeaveDate(null);
        setIsDeleteOpenProject(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
    setIsDeleteOpenProject(false);
  };

  const getHalfDayList = async () => {
    setLoaded(false);
    const params = filteredObject;
    const url = `${process.env.worklog_api_url}/workitem/timeline/getuserleavelist`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setLoaded(true);
        setWorkItemData(ResponseData.List);
        setTableDataCount(ResponseData.TotalCount);
      } else {
        setLoaded(true);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const fetchData = async () => {
      await getHalfDayList();
    };
    const timer = setTimeout(() => {
      onOpen && fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [filteredObject, onOpen]);

  const columnConfig = [
    {
      name: "UserName",
      label: "User Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "LeaveDate",
      label: "Leave Date",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "AppliedDate",
      label: "Applied Date",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Action",
      label: "Action",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "AllowDelete",
      label: "",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "LeaveId",
      label: "LeaveId",
      bodyRenderer: generateCommonBodyRender,
    },
  ];

  const generateConditionalColumn = (
    column: {
      name: string;
      label: string;
      bodyRenderer: (arg0: any) => any;
    },
    rowDataIndex: number
  ) => {
    if (column.label === "") {
      return {
        name: "AllowDelete",
        options: {
          filter: true,
          viewColumns: false,
          sort: false,
          customHeadLabelRender: () => generateCustomHeaderName(""),
          customBodyRender: (value: any, tableMeta: any) => {
            return value ? (
              <ColorToolTip title="Delete" placement="top" arrow>
                <span
                  onClick={() => {
                    setLeaveId(tableMeta.rowData[tableMeta.rowData.length - 1]);
                    setLeaveDate(tableMeta.rowData[2]);
                    setIsDeleteOpenProject(true);
                  }}
                  className="cursor-pointer"
                >
                  <Delete />
                </span>
              </ColorToolTip>
            ) : (
              <span>-</span>
            );
          },
        },
      };
    } else if (column.name === "LeaveId") {
      return {
        name: "LeaveId",
        options: {
          display: false,
          viewColumns: false,
          filter: false,
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

  const HalfDayTaskColumns: any = columnConfig.map((col: any) => {
    return generateConditionalColumn(col, 9);
  });

  const options: any = {
    filterType: "checkbox",
    responsive: "standard",
    tableBodyHeight: "54vh",
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
    selectableRows: "multiple",
  };

  return (
    <div>
      <Dialog
        open={onOpen}
        TransitionComponent={DialogTransition}
        keepMounted
        maxWidth="md"
        onClose={handleClose}
      >
        <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
          <span className="text-lg font-medium">
            Apply for a Half Day Leave
          </span>
          <span className="flex items-center justify-center">
            <ColorToolTip title="Filter" placement="top" arrow>
              <span
                className="cursor-pointer"
                onClick={() => setisFilterOpen(true)}
              >
                <FilterIcon />
              </span>
            </ColorToolTip>
            <Tooltip title="Close" placement="top" arrow>
              <IconButton onClick={handleClose}>
                <Close />
              </IconButton>
            </Tooltip>
          </span>
        </DialogTitle>
        <DialogContent>
          <div className="my-4 flex items-end justify-end">
            <div className="flex items-center justify-center">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date"
                  maxDate={dayjs(new Date())}
                  value={dayjs(inputDate)}
                  onChange={(newDate: any) => {
                    setInputDate(newDate.$d);
                  }}
                  slotProps={{
                    textField: {
                      readOnly: true,
                    } as Record<string, any>,
                  }}
                />
              </LocalizationProvider>
              <Button
                type="button"
                variant="contained"
                className="rounded-[4px] !h-[36px] !ml-6 !bg-secondary cursor-pointer"
                onClick={() => setIsOpenSwitchModal(true)}
              >
                Apply
              </Button>
            </div>
          </div>
          {loaded ? (
            <ThemeProvider theme={getMuiTheme()}>
              <MUIDataTable
                data={workItemData}
                columns={HalfDayTaskColumns}
                title={undefined}
                options={{
                  ...options,
                  selectableRows: "none",
                  textLabels: {
                    body: {
                      noMatch: (
                        <div className="flex items-start">
                          <span>Currently there is no record found.</span>
                        </div>
                      ),
                      toolTip: "",
                    },
                  },
                }}
                data-tableid="unassignee_Datatable"
              />
              <TablePagination
                component="div"
                count={tableDataCount}
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
          ) : (
            <ReportLoader />
          )}
        </DialogContent>
      </Dialog>

      <FilterDialogHalfDay
        onOpen={isFilterOpen}
        onClose={handleCloseFilter}
        currentFilterData={getIdFromFilterDialog}
      />

      <SwitchModal
        isOpen={isOpenSwitchModal}
        onClose={closeSwitchModal}
        title={""}
        actionText="Yes"
        onActionClick={applyHalfDay}
        firstContent={"Are you sure you want to submit your half day?"}
      />

      <DeleteDialog
        isOpen={isDeleteOpenProject}
        onClose={closeModal}
        onActionClick={deleteHalfDayList}
        Title={""}
        firstContent={"Are you sure?"}
        secondContent={"Do you really want to Delete these record?"}
      />
    </div>
  );
};

export default TimelineHalfDay;