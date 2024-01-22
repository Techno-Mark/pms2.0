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
import { AdminRatingsReports } from "../Enum/Filtertype";
import { rating_InitialFilter } from "@/utils/reports/getFilters";
import { Edit, Delete } from "@mui/icons-material";
import SearchIcon from "@/assets/icons/SearchIcon";
import { isWeekend } from "@/utils/commonFunction";
import {
  getClientDropdownData,
  getProjectDropdownData,
} from "@/utils/commonDropdownApiCall";
import { callAPI } from "@/utils/API/callAPI";

const RatingReportFilter = ({
  isFiltering,
  sendFilterToPage,
  onDialogClose,
}: FilterType) => {
  const [ratingreport_clients, setRatingReport_Clients] = useState<any[]>([]);
  const [ratingreport_clientName, setRatingReport_ClientName] = useState<any[]>(
    []
  );
  const [ratingreport_projectName, setRatingReport_ProjectName] =
    useState<any>(null);
  const [ratingreport_returnType, setRatingReport_ReturnType] =
    useState<any>(null);
  const [ratingreport_startDate, setRatingReport_StartDate] = useState<
    null | string
  >(null);
  const [ratingreport_endDate, setRatingReport_EndDate] = useState<
    null | string
  >(null);
  const [ratingreport_ratings, setRatingReport_Ratings] = useState<any>(null);
  const [ratingreport_filterName, setRatingReport_FilterName] =
    useState<string>("");
  const [ratingreport_saveFilter, setRatingReport_SaveFilter] =
    useState<boolean>(false);
  const [ratingreport_clientDropdown, setRatingReport_ClientDropdown] =
    useState<any[]>([]);
  const [ratingreport_projectDropdown, setRatingReport_ProjectDropdown] =
    useState<any[]>([]);
  const [ratingreport_anyFieldSelected, setRatingReport_AnyFieldSelected] =
    useState(false);
  const [ratingreport_currentFilterId, setRatingReport_CurrentFilterId] =
    useState<any>("");
  const [ratingreport_savedFilters, setRatingReport_SavedFilters] = useState<
    any[]
  >([]);
  const [ratingreport_defaultFilter, setRatingReport_DefaultFilter] =
    useState<boolean>(false);
  const [ratingreport_searchValue, setRatingReport_SearchValue] =
    useState<string>("");
  const [ratingreport_isDeleting, setRatingReport_IsDeleting] =
    useState<boolean>(false);
  const [ratingreport_resetting, setRatingReport_Resetting] =
    useState<boolean>(false);
  const [ratingreport_error, setRatingReport_Error] = useState("");

  const anchorElFilter: HTMLButtonElement | null = null;
  const openFilter = Boolean(anchorElFilter);
  const idFilter = openFilter ? "simple-popover" : undefined;
  const ratingReport_Dropdown = [
    {
      label: "Individual Return",
      value: "1",
    },
    {
      label: "Business Return",
      value: "2",
    },
  ];
  const ratingReportRating_Dropdown = [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
  ];

  const handleRatingReport_ResetAll = () => {
    setRatingReport_Clients([]);
    setRatingReport_ClientName([]);
    setRatingReport_ProjectName(null);
    setRatingReport_ReturnType(null);
    setRatingReport_StartDate(null);
    setRatingReport_EndDate(null);
    setRatingReport_Ratings(null);
    setRatingReport_Resetting(true);
    setRatingReport_Error("");

    sendFilterToPage({
      ...rating_InitialFilter,
    });
  };

  const handleRatingReport_Close = () => {
    onDialogClose(false);
    setRatingReport_Resetting(false);
    setRatingReport_FilterName("");
    setRatingReport_DefaultFilter(false);
    setRatingReport_ClientName([]);
    setRatingReport_Clients([]);
    setRatingReport_ProjectName(null);
    setRatingReport_ReturnType(null);
    setRatingReport_StartDate(null);
    setRatingReport_EndDate(null);
    setRatingReport_Ratings(null);
    setRatingReport_Error("");
  };

  const handleRatingReport_FilterApply = () => {
    sendFilterToPage({
      ...rating_InitialFilter,
      Clients: ratingreport_clientName,
      Projects:
        ratingreport_projectName === null || ratingreport_projectName === ""
          ? []
          : [ratingreport_projectName.value],
      ReturnTypeId:
        ratingreport_returnType !== null ? ratingreport_returnType.value : null,
      Ratings:
        ratingreport_ratings !== null ? ratingreport_ratings.value : null,
      StartDate:
        ratingreport_startDate !== null
          ? new Date(
              new Date(ratingreport_startDate).getTime() + 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0]
          : ratingreport_endDate !== null
          ? new Date(
              new Date(ratingreport_endDate).getTime() + 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0]
          : null,
      EndDate:
        ratingreport_endDate !== null
          ? new Date(
              new Date(ratingreport_endDate).getTime() + 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0]
          : ratingreport_startDate !== null
          ? new Date(
              new Date(ratingreport_startDate).getTime() + 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0]
          : null,
    });

    onDialogClose(false);
  };

  const handleRatingReport_SavedFilterApply = (index: number) => {
    if (Number.isInteger(index)) {
      if (index !== undefined) {
        sendFilterToPage({
          ...rating_InitialFilter,
          Clients: ratingreport_savedFilters[index].AppliedFilter.Clients,
          Projects:
            ratingreport_savedFilters[index].AppliedFilter.Projects.length > 0
              ? []
              : ratingreport_savedFilters[index].AppliedFilter.Projects[0],
          ReturnTypeId:
            ratingreport_savedFilters[index].AppliedFilter.ReturnTypeId,
          Ratings: ratingreport_savedFilters[index].AppliedFilter.Ratings,
          StartDate: ratingreport_savedFilters[index].AppliedFilter.StartDate,
          EndDate: ratingreport_savedFilters[index].AppliedFilter.EndDate,
        });
      }
    }

    onDialogClose(false);
  };

  const handleRatingReport_SaveFilter = async () => {
    if (ratingreport_filterName.trim().length === 0) {
      setRatingReport_Error("This is required field!");
    } else if (ratingreport_filterName.trim().length > 15) {
      setRatingReport_Error("Max 15 characters allowed!");
    } else {
      setRatingReport_Error("");
      const params = {
        filterId:
          ratingreport_currentFilterId !== ""
            ? ratingreport_currentFilterId
            : null,
        name: ratingreport_filterName,
        AppliedFilter: {
          Clients:
            ratingreport_clientName.length > 0 ? ratingreport_clientName : [],
          Projects:
            ratingreport_projectName === null || ratingreport_projectName === ""
              ? []
              : [ratingreport_projectName.value],
          ReturnTypeId:
            ratingreport_returnType !== null
              ? ratingreport_returnType.value
              : null,
          Ratings:
            ratingreport_ratings !== null ? ratingreport_ratings.value : null,
          StartDate:
            ratingreport_startDate !== null
              ? new Date(
                  new Date(ratingreport_startDate).getTime() +
                    24 * 60 * 60 * 1000
                )
                  .toISOString()
                  .split("T")[0]
              : ratingreport_endDate !== null
              ? new Date(
                  new Date(ratingreport_endDate).getTime() + 24 * 60 * 60 * 1000
                )
                  .toISOString()
                  .split("T")[0]
              : null,
          EndDate:
            ratingreport_endDate !== null
              ? new Date(
                  new Date(ratingreport_endDate).getTime() + 24 * 60 * 60 * 1000
                )
                  .toISOString()
                  .split("T")[0]
              : ratingreport_startDate !== null
              ? new Date(
                  new Date(ratingreport_startDate).getTime() +
                    24 * 60 * 60 * 1000
                )
                  .toISOString()
                  .split("T")[0]
              : null,
        },
        type: AdminRatingsReports,
      };
      const url = `${process.env.worklog_api_url}/filter/savefilter`;
      const successCallback = (
        ResponseData: any,
        error: any,
        ResponseStatus: any
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success("Filter has been successully saved.");
          handleRatingReport_Close();
          getRatingReport_FilterList();
          handleRatingReport_FilterApply();
          setRatingReport_SaveFilter(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  const getRatingReport_FilterList = async () => {
    const params = {
      type: AdminRatingsReports,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setRatingReport_SavedFilters(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleRatingReport_SavedFilterEdit = async (index: number) => {
    setRatingReport_SaveFilter(true);
    setRatingReport_DefaultFilter(true);
    setRatingReport_FilterName(ratingreport_savedFilters[index].Name);
    setRatingReport_CurrentFilterId(ratingreport_savedFilters[index].FilterId);

    setRatingReport_Clients(
      ratingreport_savedFilters[index].AppliedFilter.Clients.length > 0
        ? ratingreport_clientDropdown.filter((client: any) =>
            ratingreport_savedFilters[index].AppliedFilter.Clients.includes(
              client.value
            )
          )
        : []
    );
    setRatingReport_ClientName(
      ratingreport_savedFilters[index].AppliedFilter.Clients
    );
    setRatingReport_ProjectName(
      ratingreport_savedFilters[index].AppliedFilter.Projects.length > 0
        ? (
            await getProjectDropdownData(
              ratingreport_savedFilters[index].AppliedFilter.Clients[0]
            )
          ).filter(
            (item: any) =>
              item.value ===
              ratingreport_savedFilters[index].AppliedFilter.Projects[0]
          )[0]
        : null
    );
    setRatingReport_ReturnType(
      ratingreport_savedFilters[index].AppliedFilter.ReturnTypeId === null
        ? null
        : ratingReport_Dropdown.filter(
            (item: any) =>
              item.value ===
              ratingreport_savedFilters[index].AppliedFilter.ReturnTypeId
          )[0]
    );
    setRatingReport_StartDate(
      ratingreport_savedFilters[index].AppliedFilter.StartDate ?? null
    );
    setRatingReport_EndDate(
      ratingreport_savedFilters[index].AppliedFilter.EndDate ?? null
    );
    setRatingReport_Ratings(
      ratingreport_savedFilters[index].AppliedFilter.Ratings === null
        ? null
        : ratingReportRating_Dropdown.filter(
            (item: any) =>
              item.value ===
              ratingreport_savedFilters[index].AppliedFilter.Ratings
          )[0]
    );
  };

  const handleRatingReport_SavedFilterDelete = async () => {
    const params = `${process.env.worklog_api_url}/filter/delete`;
    const url = {
      filterId: ratingreport_currentFilterId,
    };
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Filter has been deleted successfully.");
        handleRatingReport_Close();
        getRatingReport_FilterList();
        setRatingReport_CurrentFilterId("");
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    getRatingReport_FilterList();
  }, []);

  useEffect(() => {
    const isAnyFieldSelected =
      ratingreport_clientName.length > 0 ||
      ratingreport_projectName !== null ||
      ratingreport_returnType !== null ||
      ratingreport_ratings !== null ||
      ratingreport_startDate !== null ||
      ratingreport_endDate !== null;

    setRatingReport_AnyFieldSelected(isAnyFieldSelected);
    setRatingReport_SaveFilter(false);
    setRatingReport_Resetting(false);
  }, [
    ratingreport_clientName,
    ratingreport_projectName,
    ratingreport_returnType,
    ratingreport_ratings,
    ratingreport_startDate,
    ratingreport_endDate,
  ]);

  useEffect(() => {
    const filterDropdowns = async () => {
      setRatingReport_ClientDropdown(await getClientDropdownData());
      setRatingReport_ProjectDropdown(
        await getProjectDropdownData(
          ratingreport_clientName.length > 0 ? ratingreport_clientName[0] : 0
        )
      );
    };
    filterDropdowns();

    if (ratingreport_clientName.length > 0 || ratingreport_resetting) {
      onDialogClose(true);
    }
  }, [ratingreport_clientName]);

  return (
    <>
      {ratingreport_savedFilters.length > 0 && !ratingreport_defaultFilter ? (
        <Popover
          id={idFilter}
          open={isFiltering}
          anchorEl={anchorElFilter}
          onClose={handleRatingReport_Close}
          anchorOrigin={{
            vertical: 130,
            horizontal: 1290,
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
                setRatingReport_DefaultFilter(true);
                setRatingReport_CurrentFilterId(0);
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
                value={ratingreport_searchValue}
                onChange={(e: any) =>
                  setRatingReport_SearchValue(e.target.value)
                }
                sx={{ fontSize: 14 }}
              />
              <span className="absolute top-4 right-3 text-slatyGrey">
                <SearchIcon />
              </span>
            </span>
            {ratingreport_savedFilters.map((i: any, index: number) => {
              return (
                <>
                  <div
                    key={i.FilterId}
                    className="group px-2 cursor-pointer bg-whiteSmoke hover:bg-lightSilver flex justify-between items-center h-9"
                  >
                    <span
                      className="pl-1"
                      onClick={() => {
                        setRatingReport_CurrentFilterId(i.FilterId);
                        onDialogClose(false);
                        handleRatingReport_SavedFilterApply(index);
                      }}
                    >
                      {i.Name}
                    </span>
                    <span className="flex gap-[10px] pr-[10px]">
                      <span
                        onClick={() =>
                          handleRatingReport_SavedFilterEdit(index)
                        }
                      >
                        <Tooltip title="Edit" placement="top" arrow>
                          <Edit className="hidden group-hover:inline-block w-5 h-5 ml-2 text-slatyGrey fill-current" />
                        </Tooltip>
                      </span>
                      <span
                        onClick={() => {
                          setRatingReport_IsDeleting(true);
                          setRatingReport_CurrentFilterId(i.FilterId);
                        }}
                      >
                        <Tooltip title="Delete" placement="top" arrow>
                          <Delete className="hidden group-hover:inline-block w-5 h-5 ml-2 text-slatyGrey fill-current" />
                        </Tooltip>
                      </span>
                    </span>
                  </div>
                </>
              );
            })}
            <hr className="text-lightSilver mt-2" />
            <Button
              onClick={handleRatingReport_ResetAll}
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
          onClose={handleRatingReport_Close}
        >
          <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
            <span className="text-lg font-medium">Filter</span>
            <Button color="error" onClick={handleRatingReport_ResetAll}>
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
                    options={ratingreport_clientDropdown.filter(
                      (option) =>
                        !ratingreport_clients.find(
                          (client) => client.value === option.value
                        )
                    )}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setRatingReport_Clients(data);
                      setRatingReport_ClientName(data.map((d: any) => d.value));
                      setRatingReport_ProjectName(null);
                    }}
                    value={ratingreport_clients}
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
                    options={ratingreport_projectDropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setRatingReport_ProjectName(data);
                    }}
                    value={ratingreport_projectName}
                    disabled={ratingreport_clientName.length > 1}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Project Name"
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
                    options={ratingReport_Dropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setRatingReport_ReturnType(data);
                    }}
                    value={ratingreport_returnType}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Return Type"
                      />
                    )}
                  />
                </FormControl>
              </div>
              <div className="flex gap-[20px]">
                <div className="inline-flex mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start Date"
                      shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now())}
                      value={
                        ratingreport_startDate === null
                          ? null
                          : dayjs(ratingreport_startDate)
                      }
                      onChange={(newDate: any) =>
                        setRatingReport_StartDate(newDate.$d)
                      }
                      slotProps={{
                        textField: {
                          readOnly: true,
                        } as Record<string, any>,
                      }}
                    />
                  </LocalizationProvider>
                </div>

                <div className="inline-flex mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[210px]">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="End Date"
                      shouldDisableDate={isWeekend}
                      maxDate={dayjs(Date.now())}
                      value={
                        ratingreport_endDate === null
                          ? null
                          : dayjs(ratingreport_endDate)
                      }
                      onChange={(newDate: any) =>
                        setRatingReport_EndDate(newDate.$d)
                      }
                      slotProps={{
                        textField: {
                          readOnly: true,
                        } as Record<string, any>,
                      }}
                    />
                  </LocalizationProvider>
                </div>
                <FormControl
                  variant="standard"
                  sx={{ mx: 0.75, minWidth: 210 }}
                >
                  <Autocomplete
                    id="tags-standard"
                    options={ratingReportRating_Dropdown}
                    getOptionLabel={(option: any) => option.label}
                    onChange={(e: any, data: any) => {
                      setRatingReport_Ratings(data);
                    }}
                    value={ratingreport_ratings}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Ratings"
                      />
                    )}
                  />
                </FormControl>
              </div>
            </div>
          </DialogContent>
          <DialogActions className="border-t border-t-lightSilver p-[20px] gap-[10px] h-[64px]">
            {!ratingreport_saveFilter ? (
              <>
                <Button
                  variant="contained"
                  color="info"
                  className={`${
                    ratingreport_anyFieldSelected && "!bg-secondary"
                  }`}
                  disabled={!ratingreport_anyFieldSelected}
                  onClick={handleRatingReport_FilterApply}
                >
                  Apply Filter
                </Button>

                <Button
                  variant="contained"
                  color="info"
                  className={`${
                    ratingreport_anyFieldSelected && "!bg-secondary"
                  }`}
                  onClick={() => setRatingReport_SaveFilter(true)}
                  disabled={!ratingreport_anyFieldSelected}
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
                    value={ratingreport_filterName}
                    onChange={(e) => {
                      setRatingReport_FilterName(e.target.value);
                      setRatingReport_Error("");
                    }}
                    error={ratingreport_error.length > 0 ? true : false}
                    helperText={ratingreport_error}
                  />
                </FormControl>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleRatingReport_SaveFilter}
                  className={`${
                    ratingreport_filterName.length === 0 ? "" : "!bg-secondary"
                  }`}
                  disabled={ratingreport_filterName.length === 0}
                >
                  Save & Apply
                </Button>
              </>
            )}

            <Button
              variant="outlined"
              color="info"
              onClick={handleRatingReport_Close}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <DeleteDialog
        isOpen={ratingreport_isDeleting}
        onClose={() => setRatingReport_IsDeleting(false)}
        onActionClick={handleRatingReport_SavedFilterDelete}
        Title={"Delete Filter"}
        firstContent={"Are you sure you want to delete this saved filter?"}
        secondContent={
          "If you delete this, you will permanently loose this saved filter and selected fields."
        }
      />
    </>
  );
};

export default RatingReportFilter;
