import dayjs from "dayjs";
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputBase,
  Popover,
  TextField,
  Tooltip,
} from "@mui/material";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import { FilterType } from "../types/ReportsFilterType";
import { project } from "../Enum/Filtertype";
import { client_project_InitialFilter } from "@/utils/reports/getFilters";
import SearchIcon from "@/assets/icons/SearchIcon";
import { Edit, Delete } from "@mui/icons-material";
import { getFormattedDate } from "@/utils/timerFunctions";
import { isWeekend } from "@/utils/commonFunction";
import {
  getBillingTypeData,
  getClientDropdownData,
  getProjectDropdownData,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";
import { callAPI } from "@/utils/API/callAPI";
import { LabelValue } from "@/utils/Types/types";

interface SavedFilter {
  FilterId: number;
  Name: string;
  AppliedFilter: {
    clients: number[];
    projects: number[];
    TypeOfWork: number | null;
    BillingType: number | null;
    startDate: string | null;
    endDate: string | null;
  };
}

const project_filter_InitialFilter = {
  ...client_project_InitialFilter,
  isClientReport: false,
};

const ProjectReportFilter = ({
  isFiltering,
  sendFilterToPage,
  onDialogClose,
}: FilterType) => {
  const [project_clients, setProject_Clients] = useState<LabelValue[]>([]);
  const [project_clientName, setProject_ClientName] = useState<number[]>([]);
  const [project_projects, setProject_Projects] = useState<LabelValue | null>(
    null
  );
  const [project_typeOfWork, setProject_TypeOfWork] =
    useState<LabelValue | null>(null);
  const [project_billingType, setProject_BillingType] =
    useState<LabelValue | null>(null);

  const [project_filterName, setProject_FilterName] = useState<string>("");
  const [project_saveFilter, setProject_SaveFilter] = useState<boolean>(false);
  const [project_startDate, setProject_StartDate] = useState<string | number>(
    ""
  );
  const [project_endDate, setProject_EndDate] = useState<string | number>("");

  const [project_workTypeDropdown, setProject_WorkTypeDropdown] = useState<
    LabelValue[]
  >([]);
  const [project_billingTypeDropdown, setProject_BillingTypeDropdown] =
    useState<LabelValue[]>([]);
  const [project_clientDropdown, setProject_ClientDropdown] = useState<
    LabelValue[]
  >([]);
  const [project_projectDropdown, setProject_ProjectDropdown] = useState<
    LabelValue[]
  >([]);
  const [project_anyFieldSelected, setProject_AnyFieldSelected] =
    useState(false);
  const [currentFilterId, setCurrentFilterId] = useState<number>(0);
  const [project_savedFilters, setProject_SavedFilters] = useState<
    SavedFilter[]
  >([]);
  const [project_defaultFilter, setProject_DefaultFilter] =
    useState<boolean>(false);
  const [project_searchValue, setProject_SearchValue] = useState<string>("");
  const [project_isDeleting, setProject_IsDeleting] = useState<boolean>(false);
  const [project_error, setProject_Error] = useState("");
  const [idFilter, setIdFilter] = useState<string | undefined>(undefined);

  const anchorElFilter: HTMLButtonElement | null = null;
  const openFilter = Boolean(anchorElFilter);

  useEffect(() => {
    openFilter ? setIdFilter("simple-popover") : setIdFilter(undefined);
  }, [openFilter]);

  const handleResetAll = (close: boolean) => {
    setProject_ClientName([]);
    setProject_Clients([]);
    setProject_Projects(null);
    setProject_TypeOfWork(null);
    setProject_BillingType(null);
    setProject_StartDate("");
    setProject_EndDate("");
    setProject_Error("");
    setProject_ProjectDropdown([]);
    setProject_FilterName("");
    setProject_AnyFieldSelected(false);
    setIdFilter(undefined);
    close && setProject_DefaultFilter(false);
    close && onDialogClose(false);

    sendFilterToPage({
      ...project_filter_InitialFilter,
    });
  };

  const handleProject_Close = () => {
    onDialogClose(false);
    setProject_FilterName("");
    setProject_DefaultFilter(false);
    setProject_Clients([]);
    setProject_ClientName([]);
    setProject_Projects(null);
    setProject_TypeOfWork(null);
    setProject_BillingType(null);
    setProject_StartDate("");
    setProject_EndDate("");
    setProject_Error("");
    setProject_ProjectDropdown([]);
  };

  const handleProject_FilterApply = () => {
    sendFilterToPage({
      ...project_filter_InitialFilter,
      clients: project_clientName.length > 0 ? project_clientName : [],
      projects: project_projects !== null ? [project_projects.value] : [],
      typeOfWork: project_typeOfWork === null ? null : project_typeOfWork.value,
      billType: project_billingType === null ? null : project_billingType.value,
      startDate:
        project_startDate.toString().trim().length <= 0
          ? project_endDate.toString().trim().length <= 0
            ? null
            : getFormattedDate(project_endDate)
          : getFormattedDate(project_startDate),
      endDate:
        project_endDate.toString().trim().length <= 0
          ? project_startDate.toString().trim().length <= 0
            ? null
            : getFormattedDate(project_startDate)
          : getFormattedDate(project_endDate),
    });

    onDialogClose(false);
  };

  const handleProject_SavedFilterApply = (index: number) => {
    if (Number.isInteger(index)) {
      if (index !== undefined) {
        sendFilterToPage({
          ...project_filter_InitialFilter,
          clients: project_savedFilters[index].AppliedFilter.clients,
          projects: project_savedFilters[index].AppliedFilter.projects,
          typeOfWork: project_savedFilters[index].AppliedFilter.TypeOfWork,
          billType: project_savedFilters[index].AppliedFilter.BillingType,
          startDate: project_savedFilters[index].AppliedFilter.startDate,
          endDate: project_savedFilters[index].AppliedFilter.endDate,
        });
      }
    }

    onDialogClose(false);
  };

  const handleProject_SaveFilter = async () => {
    if (project_filterName.trim().length === 0) {
      setProject_Error("This is required field!");
    } else if (project_filterName.trim().length > 15) {
      setProject_Error("Max 15 characters allowed!");
    } else {
      setProject_Error("");
      const params = {
        filterId: currentFilterId > 0 ? currentFilterId : null,
        name: project_filterName,
        AppliedFilter: {
          clients: project_clientName.length > 0 ? project_clientName : [],
          projects: project_projects !== null ? [project_projects.value] : [],
          TypeOfWork:
            project_typeOfWork === null ? null : project_typeOfWork.value,
          BillingType:
            project_billingType === null ? null : project_billingType.value,
          startDate:
            project_startDate.toString().trim().length <= 0
              ? project_endDate.toString().trim().length <= 0
                ? null
                : getFormattedDate(project_endDate)
              : getFormattedDate(project_startDate),
          endDate:
            project_endDate.toString().trim().length <= 0
              ? project_startDate.toString().trim().length <= 0
                ? null
                : getFormattedDate(project_startDate)
              : getFormattedDate(project_endDate),
        },
        type: project,
      };
      const url = `${process.env.worklog_api_url}/filter/savefilter`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success("Filter has been successully saved.");
          handleProject_Close();
          getProject_FilterList();
          handleProject_FilterApply();
          setProject_SaveFilter(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  useEffect(() => {
    getProject_FilterList();
  }, []);

  useEffect(() => {
    const isAnyFieldSelected =
      project_clientName.length > 0 ||
      project_projects !== null ||
      project_typeOfWork !== null ||
      project_billingType !== null ||
      project_startDate.toString().trim().length > 0 ||
      project_endDate.toString().trim().length > 0;

    setProject_AnyFieldSelected(isAnyFieldSelected);
    setProject_SaveFilter(false);
  }, [
    project_typeOfWork,
    project_billingType,
    project_clientName,
    project_projects,
    project_startDate,
    project_endDate,
  ]);

  useEffect(() => {
    const filterDropdowns = async () => {
      setProject_ClientDropdown(await getClientDropdownData());
      setProject_WorkTypeDropdown(await getTypeOfWorkDropdownData(0));
      setProject_BillingTypeDropdown(await getBillingTypeData());
    };
    filterDropdowns();
  }, []);

  useEffect(() => {
    const filterDropdowns = async () => {
      project_clientName.length > 0 &&
        project_typeOfWork !== null &&
        project_typeOfWork?.value > 0 &&
        setProject_ProjectDropdown(
          await getProjectDropdownData(
            project_clientName[0],
            project_typeOfWork?.value
          )
        );
    };
    filterDropdowns();
  }, [project_clientName, project_typeOfWork]);

  const getProject_FilterList = async () => {
    const params = {
      type: project,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = (
      ResponseData: SavedFilter[],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setProject_SavedFilters(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleProject_SavedFilterEdit = async (index: number) => {
    setProject_SaveFilter(true);
    setProject_DefaultFilter(true);

    const { Name, FilterId, AppliedFilter } = project_savedFilters[index];
    setProject_FilterName(Name);
    setCurrentFilterId(FilterId);

    const clients = AppliedFilter?.clients || [];
    setProject_Clients(
      clients.length > 0
        ? project_clientDropdown.filter((client: LabelValue) =>
            clients.includes(client.value)
          )
        : []
    );
    setProject_ClientName(clients);

    setProject_TypeOfWork(
      AppliedFilter.TypeOfWork !== null
        ? project_workTypeDropdown.filter(
            (item: LabelValue) => item.value === AppliedFilter.TypeOfWork
          )[0]
        : null
    );

    setProject_Projects(
      AppliedFilter.projects.length > 0 && AppliedFilter.TypeOfWork !== null
        ? (
            await getProjectDropdownData(
              project_savedFilters[index].AppliedFilter.clients[0],
              project_savedFilters[index].AppliedFilter.TypeOfWork
            )
          ).filter(
            (item: LabelValue) => item.value === AppliedFilter.projects[0]
          )[0]
        : null
    );

    setProject_BillingType(
      AppliedFilter.BillingType !== null
        ? project_billingTypeDropdown.filter(
            (item: LabelValue) => item.value === AppliedFilter.BillingType
          )[0]
        : null
    );

    setProject_StartDate(AppliedFilter.startDate ?? "");
    setProject_EndDate(AppliedFilter.endDate ?? "");
  };

  const handleProject_SavedFilterDelete = async () => {
    const params = {
      filterId: currentFilterId,
    };
    const url = `${process.env.worklog_api_url}/filter/delete`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Filter has been deleted successfully.");
        handleProject_Close();
        getProject_FilterList();
        setCurrentFilterId(0);
        sendFilterToPage({
          ...project_filter_InitialFilter,
        });
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <>
      {project_savedFilters.length > 0 && !project_defaultFilter ? (
        <Popover
          id={idFilter}
          open={isFiltering}
          anchorEl={anchorElFilter}
          onClose={() => onDialogClose(false)}
          anchorOrigin={{
            vertical: 110,
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <div className="flex flex-col py-2 w-[250px] ">
            <span
              className="p-2 cursor-pointer hover:bg-lightGray"
              onClick={() => {
                setProject_DefaultFilter(true);
                setCurrentFilterId(0);
              }}
            >
              Default Filter
            </span>
            <hr className="text-lightSilver mt-2" />

            <span className="py-3 px-2 relative">
              <InputBase
                className="pr-7 border-b border-b-slatyGrey w-full"
                placeholder="Search saved filters"
                inputProps={{ "aria-label": "search" }}
                value={project_searchValue}
                onChange={(e) => setProject_SearchValue(e.target.value)}
                sx={{ fontSize: 14 }}
              />
              <span className="absolute top-4 right-3 text-slatyGrey">
                <SearchIcon />
              </span>
            </span>
            {project_savedFilters.map((i: SavedFilter, index: number) => {
              return (
                <div
                  key={i.FilterId}
                  className="group px-2 cursor-pointer bg-whiteSmoke hover:bg-lightSilver flex justify-between items-center h-9"
                >
                  <span
                    className="pl-1"
                    onClick={() => {
                      setCurrentFilterId(i.FilterId);
                      onDialogClose(false);
                      handleProject_SavedFilterApply(index);
                    }}
                  >
                    {i.Name}
                  </span>
                  <span className="flex gap-[10px] pr-[10px]">
                    <span onClick={() => handleProject_SavedFilterEdit(index)}>
                      <Tooltip title="Edit" placement="top" arrow>
                        <Edit className="hidden group-hover:inline-block w-5 h-5 ml-2 text-slatyGrey fill-current" />
                      </Tooltip>
                    </span>
                    <span
                      onClick={() => {
                        setProject_IsDeleting(true);
                        setCurrentFilterId(i.FilterId);
                      }}
                    >
                      <Tooltip title="Delete" placement="top" arrow>
                        <Delete className="hidden group-hover:inline-block w-5 h-5 ml-2 text-slatyGrey fill-current" />
                      </Tooltip>
                    </span>
                  </span>
                </div>
              );
            })}
            <hr className="text-lightSilver mt-2" />
            <Button
              onClick={() => handleResetAll(true)}
              className="mt-2"
              color="error"
            >
              clear all
            </Button>
          </div>
        </Popover>
      ) : (
        <Dialog
          open={isFiltering}
          TransitionComponent={DialogTransition}
          keepMounted
          maxWidth="md"
          onClose={() => onDialogClose(false)}
        >
          <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
            <span className="text-lg font-medium">Filter</span>
            <Button color="error" onClick={() => handleResetAll(false)}>
              Reset all
            </Button>
          </DialogTitle>
          <DialogContent>
            <div className="flex flex-col gap-[20px] pt-[15px]">
              <div className="flex gap-[20px]">
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 210 }}
                >
                  <Autocomplete
                    multiple
                    id="tags-standard"
                    options={project_clientDropdown.filter(
                      (option) =>
                        !project_clients.find(
                          (client) => client.value === option.value
                        )
                    )}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue[]) => {
                      setProject_Clients(data);
                      setProject_ClientName(
                        data.map((d: LabelValue) => d.value)
                      );
                      setProject_Projects(null);
                      setProject_ProjectDropdown([]);
                    }}
                    value={project_clients}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Client Name"
                      />
                    )}
                  />
                </FormControl>
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 210 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={project_workTypeDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
                      setProject_TypeOfWork(data);
                      setProject_Projects(null);
                    }}
                    value={project_typeOfWork}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Type Of Work"
                      />
                    )}
                  />
                </FormControl>
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 210 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={project_projectDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
                      setProject_Projects(data);
                    }}
                    disabled={project_clientName.length > 1}
                    value={project_projects}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Project Name"
                      />
                    )}
                  />
                </FormControl>
              </div>
              <div className="flex gap-[20px]">
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 210 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={project_billingTypeDropdown}
                    getOptionLabel={(option: LabelValue) => option.label}
                    onChange={(e, data: LabelValue | null) => {
                      setProject_BillingType(data);
                    }}
                    value={project_billingType}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Billing Type"
                      />
                    )}
                  />
                </FormControl>
                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start Date"
                      // shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now()) || dayjs(project_endDate)}
                      value={
                        project_startDate === ""
                          ? null
                          : dayjs(project_startDate)
                      }
                      onChange={(newValue: any) =>
                        setProject_StartDate(newValue)
                      }
                      slotProps={{
                        textField: {
                          readOnly: true,
                        } as Record<string, any>,
                      }}
                    />
                  </LocalizationProvider>
                </div>

                <div
                  className={`inline-flex mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]`}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="End Date"
                      // shouldDisableDate={isWeekend}
                      minDate={dayjs(project_startDate)}
                      maxDate={dayjs(Date.now())}
                      value={
                        project_endDate === "" ? null : dayjs(project_endDate)
                      }
                      onChange={(newValue: any) => setProject_EndDate(newValue)}
                      slotProps={{
                        textField: {
                          readOnly: true,
                        } as Record<string, any>,
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions className="border-t border-t-lightSilver p-[20px] gap-[10px] h-[64px]">
            {!project_saveFilter ? (
              <>
                <Button
                  variant="contained"
                  color="info"
                  className={`${project_anyFieldSelected && "!bg-secondary"}`}
                  disabled={!project_anyFieldSelected}
                  onClick={handleProject_FilterApply}
                >
                  Apply Filter
                </Button>

                <Button
                  variant="contained"
                  color="info"
                  className={`${project_anyFieldSelected && "!bg-secondary"}`}
                  onClick={() => setProject_SaveFilter(true)}
                  disabled={!project_anyFieldSelected}
                >
                  Save Filter
                </Button>
              </>
            ) : (
              <>
                <FormControl
                  variant="standard"
                  sx={{ marginRight: 3, minWidth: 420 }}
                >
                  <TextField
                    placeholder="Enter Filter Name"
                    fullWidth
                    required
                    variant="standard"
                    value={project_filterName}
                    onChange={(e) => {
                      setProject_FilterName(e.target.value);
                      setProject_Error("");
                    }}
                    error={project_error.length > 0 ? true : false}
                    helperText={project_error}
                  />
                </FormControl>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleProject_SaveFilter}
                  className={`${
                    project_filterName.trim().length === 0
                      ? ""
                      : "!bg-secondary"
                  }`}
                  disabled={project_filterName.trim().length === 0}
                >
                  Save & Apply
                </Button>
              </>
            )}

            <Button
              variant="outlined"
              color="info"
              onClick={() =>
                currentFilterId > 0 || !!currentFilterId
                  ? handleResetAll(true)
                  : (onDialogClose(false), setProject_DefaultFilter(false))
              }
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <DeleteDialog
        isOpen={project_isDeleting}
        onClose={() => setProject_IsDeleting(false)}
        onActionClick={handleProject_SavedFilterDelete}
        Title={"Delete Filter"}
        firstContent={"Are you sure you want to delete this saved filter?"}
        secondContent={
          "If you delete this, you will permanently loose this saved filter and selected fields."
        }
      />
    </>
  );
};

export default ProjectReportFilter;
