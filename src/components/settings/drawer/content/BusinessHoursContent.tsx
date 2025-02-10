import {
  Button,
  TextField,
  IconButton,
  FormControl,
  FormLabel,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

interface CheckboxComponentParams {
  id: number;
  name: string;
  checked: boolean;
  onChangeFunction: any;
  value: number;
  label: string;
}

interface HolidayParams {
  date: any;
  name: string;
  canEdit: boolean;
  dateError: boolean;
  nameError: boolean;
}

const CheckboxComponent = ({
  id,
  name,
  checked,
  onChangeFunction,
  value,
  label,
}: CheckboxComponentParams) => (
  <div className="checkboxRadio">
    <input
      type="checkbox"
      id={String(id)}
      name={name}
      checked={checked}
      onChange={onChangeFunction}
      value={value}
    />
    <span>{label}</span>
  </div>
);

const CheckboxComponentDay = ({
  id,
  name,
  checked,
  onChangeFunction,
  value,
  label,
}: CheckboxComponentParams) => (
  <div className="flex items-center justify-center">
    <input
      type="checkbox"
      id={String(id)}
      name={name}
      checked={checked}
      onChange={onChangeFunction}
      value={value}
      className="w-4 h-4"
    />
    <label htmlFor={String(id)} className="cursor-pointer ml-2 text-lg">
      {label.slice(0, 3)}
    </label>
  </div>
);

export interface BusinessHoursContenRef {
  clearBusinessHoursData: () => void;
}

const BusinessHoursContent = forwardRef<
  BusinessHoursContenRef,
  {
    onEdit: number;
    onOpen: boolean;
    clone: boolean;
    onClose: () => void;
    onDataFetch: (() => void) | null;
    onChangeLoader: (e: boolean) => void;
  }
>(({ onClose, onOpen, clone, onEdit, onDataFetch, onChangeLoader }, ref) => {
  const [businessHourName, setBusinessHourName] = useState("");
  const [businessHourNameErr, setBusinessHourNameErr] = useState("");
  const [checkbox, setCheckbox] = useState<number>(1);
  const [daysConfig, setDaysConfig] = useState(
    Array(7).fill({
      day: "",
      selected: false,
      startTime: "00:00",
      endTime: "00:00",
      timeError: false,
    })
  );
  const [holidays, setHolidays] = useState<HolidayParams[]>([]);
  const [holidayError, setHolidayError] = useState<boolean>(false);

  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const transformApiDataToState = (apiData: any) => {
    // Initialize with default values
    const defaultDaysConfig = Array(7).fill({
      day: "",
      selected: false,
      startTime: "00:00",
      endTime: "00:00",
      timeError: false,
    });

    // Update days based on API data
    return defaultDaysConfig.map((config, index) => {
      const dayData = apiData.find((item: any) => item.WeekDay === index);

      if (dayData) {
        const startTime = `${String(dayData.StartTime.Hour).padStart(
          2,
          "0"
        )}:${String(dayData.StartTime.Min).padStart(2, "0")}`;
        const endTime = `${String(dayData.EndTime.Hour).padStart(
          2,
          "0"
        )}:${String(dayData.EndTime.Min).padStart(2, "0")}`;

        return {
          ...config,
          day: dayNames[index],
          selected: true,
          startTime,
          endTime,
        };
      }

      return { ...config, day: dayNames[index] }; // Defaults for days not in API data
    });
  };

  const transformHolidayData = (
    apiData: {
      HolidayDate: string;
      HolidayName: string;
    }[]
  ) => {
    return apiData.map(
      (holiday: { HolidayDate: string; HolidayName: string }) => ({
        date: holiday.HolidayDate, // Consider converting this to a `Date` object if needed
        name: holiday.HolidayName,
        canEdit: false, // Default value
        dateError: false, // Default value
        nameError: false, // Default value
      })
    );
  };

  const fetchEditData = async () => {
    if (onEdit > 0) {
      const params = { Id: onEdit || 0 };
      const url = `${process.env.pms_api_url}/sla/businesshrs/getbyid`;
      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setBusinessHourName(clone ? "" : ResponseData.Name);
          setCheckbox(ResponseData.IsCustomHrs ? 2 : 1);
          setDaysConfig(transformApiDataToState(ResponseData.CustomHrsDetail));
          setHolidays(transformHolidayData(ResponseData.HolidayDetail));
        } else {
          clearData();
        }
      };
      callAPI(url, params, successCallback, "POST");
    } else {
      clearData();
    }
  };

  useEffect(() => {
    onOpen && onEdit > 0 && fetchEditData();
  }, [onEdit, onOpen]);

  const clearData = () => {
    setBusinessHourName("");
    setBusinessHourNameErr("");
    setCheckbox(1);
    setDaysConfig(
      Array(7).fill({
        day: "",
        selected: false,
        startTime: "00:00",
        endTime: "00:00",
        timeError: false,
      })
    );
    setHolidays([]);
  };

  const clearBusinessHoursData = async () => {
    await clearData();
  };

  useImperativeHandle(ref, () => ({
    clearBusinessHoursData,
  }));

  const handleTimeChange = (
    type: "start" | "end",
    time: string,
    index: number
  ) => {
    let newValue = time.trim();
    newValue = newValue.replace(/\D/g, "");
    if (newValue.length > 8) {
      return;
    }

    let formattedValue = "";
    if (newValue.length >= 1) {
      const hours = parseInt(newValue.slice(0, 2));
      if (hours >= 0 && hours <= 23) {
        formattedValue = newValue.slice(0, 2);
      } else {
        formattedValue = "23";
      }
    }

    if (newValue.length >= 3) {
      const minutes = parseInt(newValue.slice(2, 4));
      if (minutes >= 0 && minutes <= 59) {
        formattedValue += ":" + newValue.slice(2, 4);
      } else {
        formattedValue += ":59";
      }
    }

    const updatedConfig = [...daysConfig];
    if (type === "start") {
      updatedConfig[index].startTime = formattedValue;
    } else {
      updatedConfig[index].endTime = formattedValue;
    }
    (updatedConfig[index].timeError = false), setDaysConfig(updatedConfig);
  };

  const validateBusinessHourName = () => {
    const trimmedBusinessHourName = businessHourName.trim();

    if (trimmedBusinessHourName.length === 0) {
      setBusinessHourNameErr("Business hours Template Name is required.");
      return false;
    }
    if (trimmedBusinessHourName.length > 100) {
      setBusinessHourNameErr(
        "Business hours Template Name cannot exceed 100 characters."
      );
      return false;
    }

    setBusinessHourNameErr("");
    return true;
  };

  const handleCopy = () => {
    const firstSelectedDay = daysConfig.find((day) => day.selected);
    if (!firstSelectedDay) return;
    const { startTime, endTime } = firstSelectedDay;
    const updatedConfig = daysConfig.map((day) => {
      if (day.selected) {
        return { ...day, startTime, endTime, timeError: false };
      }
      return day;
    });

    setDaysConfig(updatedConfig);
  };

  const validateTimes = () => {
    let valid = true;
    const updatedConfig = [...daysConfig];

    // Regex for hh:mm format (24-hour clock)
    const timeFormatRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;

    updatedConfig.forEach((day, index) => {
      if (day.selected) {
        const isStartTimeValid = timeFormatRegex.test(day.startTime);
        const isEndTimeValid = timeFormatRegex.test(day.endTime);

        // Check if the time format is invalid
        if (!isStartTimeValid || !isEndTimeValid) {
          updatedConfig[index].timeError = true;
          valid = false;
          return; // Skip further checks for this day if format is invalid
        }

        const [startHour, startMin] = day.startTime.split(":").map(Number);
        const [endHour, endMin] = day.endTime.split(":").map(Number);

        // Check if endTime is 00:00
        if (endHour === 0 && endMin === 0) {
          updatedConfig[index].timeError = true;
          valid = false;
        }

        // Check if startTime and endTime are the same
        if (startHour === endHour && startMin === endMin) {
          updatedConfig[index].timeError = true;
          valid = false;
        }

        // Check if start time is greater than end time
        if (
          startHour > endHour ||
          (startHour === endHour && startMin >= endMin)
        ) {
          updatedConfig[index].timeError = true;
          valid = false;
        } else {
          updatedConfig[index].timeError = false;
        }
      }
    });

    setDaysConfig(updatedConfig);
    return valid;
  };

  const handleEditHoliday = (index: number) => {
    const updatedHolidays = holidays.map((holiday, i) =>
      i === index ? { ...holiday, canEdit: true } : holiday
    );
    setHolidays(updatedHolidays);
  };

  const handleDeleteHoliday = (index: number) => {
    const updatedHolidays = holidays.filter((_, i) => i !== index);
    setHolidays(updatedHolidays);
  };

  const validateFields = (index: number) => {
    let isValid = true;
    const updatedHolidays = [...holidays];
    const holidayToValidate = updatedHolidays[index];

    if (!holidayToValidate.date) {
      holidayToValidate.dateError = true;
      isValid = false;
    }
    if (
      !holidayToValidate.name.trim() ||
      holidayToValidate.name.trim().length > 100
    ) {
      holidayToValidate.nameError = true;
      isValid = false;
    }

    setHolidays(updatedHolidays);
    return isValid;
  };

  const handleSaveHoliday = (index: number) => {
    const updatedHolidays = [...holidays];
    const holiday = updatedHolidays[index];

    if (validateFields(index)) {
      holiday.canEdit = false;
      setHolidays(updatedHolidays);
      setHolidayError(false);
    } else {
    }
  };

  const validateHolidaySaved = () => {
    let isValid = true;

    if (holidays.map((holiday) => holiday.canEdit).includes(true)) {
      isValid = false;
      setHolidayError(true);
    } else {
      setHolidayError(false);
    }
    return isValid;
  };

  const handleSubmit = async (close: boolean) => {
    const isBusinessHourNameValid = validateBusinessHourName();
    const areTimesValid = checkbox === 1 ? true : validateTimes();
    const isHolidayValid = validateHolidaySaved();

    if (!isBusinessHourNameValid || !areTimesValid || !isHolidayValid) return;

    onChangeLoader(true);
    const params = {
      Id: onEdit > 0 && !clone ? onEdit : 0,
      Name: businessHourName.trim(),
      IsCustomHrs: checkbox === 1 ? false : true,
      CustomHrsDetail: daysConfig
        .map((day: any, index: number) =>
          day.selected
            ? new Object({
                WeekDay: index,
                StartTime: {
                  Hour: day.startTime.split(":")[0],
                  Min: day.startTime.split(":")[1],
                },
                EndTime: {
                  Hour: day.endTime.split(":")[0],
                  Min: day.endTime.split(":")[1],
                },
              })
            : false
        )
        .filter((j) => j != false),
      HolidayDetail:
        holidays.length > 0
          ? holidays.map(
              (holiday) =>
                new Object({
                  HolidayDate: dayjs(holiday.date),
                  HolidayName: holiday.name,
                })
            )
          : [],
    };
    const url = `${process.env.pms_api_url}/sla/businesshrs/save`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onDataFetch?.();
        onChangeLoader(false);
        close && onClose();
        clearData();
        toast.success(
          `${onEdit > 0 ? "" : "New"} Business Hours ${
            onEdit > 0 ? "Updated" : "added"
          } successfully.`
        );
      } else {
        onChangeLoader(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const isGreaterThanNextThreeDays = (holidayDate: string): boolean => {
    const holiday = dayjs(holidayDate);

    const threeDaysLater = dayjs().add(3, "day");

    return holiday.isAfter(threeDaysLater);
  };

  return (
    <>
      <div className="flex gap-[20px] flex-col px-[20px] pb-[50px] max-h-[73vh] overflow-y-auto">
        <TextField
          label={
            <span>
              Business Hours Template Name
              <span className="!text-defaultRed">&nbsp;*</span>
            </span>
          }
          fullWidth
          className="pt-1"
          value={businessHourName}
          onChange={(e) => {
            setBusinessHourName(e.target.value);
            setBusinessHourNameErr("");
          }}
          onBlur={validateBusinessHourName}
          error={!!businessHourNameErr}
          helperText={businessHourNameErr}
          margin="normal"
          variant="standard"
        />
        <FormControl className="mt-4">
          <FormLabel
            id="demo-radio-buttons-group-label"
            className="mb-2 text-lg text-black"
          >
            Business Hours
          </FormLabel>
          <span className="flex items-center gap-4">
            <CheckboxComponent
              id={1}
              name="checkbox"
              checked={checkbox === 1}
              onChangeFunction={() => {
                setCheckbox(1);
                setDaysConfig(
                  Array(7).fill({
                    day: "",
                    selected: false,
                    startTime: "00:00",
                    endTime: "00:00",
                    timeError: false,
                  })
                );
              }}
              value={1}
              label="24hrs. / 7days"
            />
            <CheckboxComponent
              id={2}
              name="checkbox"
              checked={checkbox === 2}
              onChangeFunction={() => {
                setCheckbox(2);
                setDaysConfig(
                  Array(7).fill({
                    day: "",
                    selected: false,
                    startTime: "00:00",
                    endTime: "00:00",
                    timeError: false,
                  })
                );
              }}
              value={2}
              label="Custom business hours"
              //  (Setup custom business for your team)"
            />
          </span>
        </FormControl>
        {checkbox === 2 && (
          <>
            <FormLabel
              id="demo-radio-buttons-group-label"
              className="mt-4 text-black"
            >
              Select the working hours (
              {daysConfig.filter((day) => day.selected).length} days selected)
            </FormLabel>
            <div className="mt-2 flex items-center justify-start gap-4">
              {dayNames.map((day, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckboxComponentDay
                    id={index + Math.random()}
                    name={`${index + Math.random()}`}
                    checked={daysConfig[index]?.selected || false}
                    value={daysConfig[index]?.selected || false}
                    onChangeFunction={(
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => {
                      const updatedConfig = [...daysConfig];
                      updatedConfig[index] = {
                        ...updatedConfig[index],
                        selected: e.target.checked,
                        day,
                      };
                      setDaysConfig(updatedConfig);
                    }}
                    label={day}
                  />
                </div>
              ))}
            </div>
            {daysConfig.filter((day) => day.selected).length > 0 && (
              <>
                <FormLabel
                  id="demo-radio-buttons-group-label mb-2"
                  className="mt-4 text-black"
                >
                  Enter the working hours
                </FormLabel>
                {daysConfig.map(
                  (day, index) =>
                    day.selected && (
                      <div
                        key={index}
                        className="flex items-center justify-start gap-2"
                      >
                        <span className="w-24">{day.day}</span>
                        <TextField
                          label="Start Time"
                          className="!w-16"
                          value={day.startTime}
                          onChange={(e) =>
                            handleTimeChange("start", e.target.value, index)
                          }
                          margin="normal"
                          variant="standard"
                          placeholder="hh:mm"
                          error={day.timeError}
                        />
                        <span className="w-24 flex items-center justify-center">
                          To
                        </span>
                        <TextField
                          label="End Time"
                          className="!w-16"
                          value={day.endTime}
                          onChange={(e) =>
                            handleTimeChange("end", e.target.value, index)
                          }
                          margin="normal"
                          variant="standard"
                          placeholder="hh:mm"
                          error={day.timeError}
                        />
                      </div>
                    )
                )}
                <p
                  className="w-fit mt-2 !text-secondary cursor-pointer"
                  onClick={() => handleCopy()}
                >
                  Copy to All
                </p>
              </>
            )}
          </>
        )}
        <FormLabel
          id="demo-radio-buttons-group-label"
          className="mt-4 text-lg text-black"
        >
          Holidays
        </FormLabel>
        <div>
          {holidays.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="font-extrabold capitalize">
                      Date
                    </TableCell>
                    <TableCell className="font-extrabold capitalize">
                      Name
                    </TableCell>
                    <TableCell className="font-extrabold capitalize">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {holidays.map((holiday, index) => (
                    <TableRow
                      key={index}
                      style={{
                        background: holiday.canEdit ? "#f0f0f0" : "transparent",
                      }}
                    >
                      <TableCell>
                        {holiday.canEdit ? (
                          <div
                            className={`inline-flex -mt-[11px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px] ${
                              holiday.dateError ? "datepickerError" : ""
                            }`}
                          >
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DatePicker
                                value={
                                  holiday.date === null
                                    ? null
                                    : dayjs(holiday.date)
                                }
                                minDate={dayjs(Date.now())}
                                onChange={(newDate: any) => {
                                  setHolidays(
                                    holidays.map((h, i: number) =>
                                      i === index
                                        ? {
                                            ...h,
                                            date: newDate.toISOString(),
                                            dateError: false,
                                          }
                                        : h
                                    )
                                  );
                                }}
                                slotProps={{
                                  textField: {
                                    helperText: holiday.dateError
                                      ? "Date is required"
                                      : "",
                                    error: holiday.dateError,
                                  },
                                }}
                              />
                            </LocalizationProvider>
                          </div>
                        ) : (
                          <p>{dayjs(holiday.date).format("MM-DD-YYYY")}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {holiday.canEdit ? (
                          <TextField
                            className="pt-1"
                            value={holiday.name}
                            onChange={(e) =>
                              setHolidays(
                                holidays.map((h, i) =>
                                  i === index
                                    ? {
                                        ...h,
                                        name: e.target.value,
                                        nameError: false,
                                      }
                                    : h
                                )
                              )
                            }
                            error={holiday.nameError}
                            helperText={
                              holiday.nameError &&
                              holiday.name.trim().length > 100
                                ? "Holiday Name cannot exceed 100 characters."
                                : holiday.nameError
                                ? "Please enter a valid holiday name."
                                : ""
                            }
                            margin="normal"
                            variant="standard"
                          />
                        ) : (
                          holiday.name
                        )}
                      </TableCell>
                      <TableCell>
                        {holiday.canEdit ? (
                          <IconButton onClick={() => handleSaveHoliday(index)}>
                            <SaveIcon />
                          </IconButton>
                        ) : (
                          isGreaterThanNextThreeDays(
                            dayjs(holiday.date).format("MM-DD-YYYY")
                          ) && (
                            <IconButton
                              onClick={() => handleEditHoliday(index)}
                            >
                              <EditIcon />
                            </IconButton>
                          )
                        )}
                        {(holiday.canEdit ||
                          isGreaterThanNextThreeDays(
                            dayjs(holiday.date).format("MM-DD-YYYY")
                          )) && (
                          <IconButton
                            onClick={() => handleDeleteHoliday(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <p className="flex items-center justify-center py-2 border-t border-b my-1 font-bold">
              No holidays added yet!
            </p>
          )}
        </div>
        {holidayError && (
          <p className="text-red-500 mt-1">Please save all holidays.</p>
        )}
        <p
          className="text-secondary mt-2 flex items-center justify-end cursor-pointer"
          onClick={() =>
            setHolidays([
              ...holidays,
              {
                date: new Date(),
                name: "",
                canEdit: true,
                dateError: false,
                nameError: false,
              },
            ])
          }
        >
          + Add Holiday
        </p>
      </div>

      <div className="flex justify-end fixed w-full bottom-0 py-[15px] bg-pureWhite border-t border-lightSilver">
        <Button
          variant="outlined"
          className="rounded-[4px] !h-[36px] !text-secondary"
          onClick={() => {
            clearData();
            onClose();
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          className="rounded-[4px] !h-[36px] !mx-6 !bg-secondary"
          onClick={() => handleSubmit(true)}
        >
          {onEdit > 0 ? "Save" : "Create Business Hours"}
        </Button>
      </div>
    </>
  );
});

export default BusinessHoursContent;
