import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  TextField,
  Tooltip,
  TooltipProps,
  styled,
  tooltipClasses,
} from "@mui/material";
import { toast } from "react-toastify";
import { Close } from "@mui/icons-material";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { callAPI } from "@/utils/API/callAPI";
import { toHoursAndMinutes, toSeconds } from "@/utils/timerFunctions";

interface EditModalProps {
  onOpen: boolean;
  onClose: () => void;
  onReviewerDataFetch?: () => void;
  onClearSelection?: () => void;
  onSelectWorkItemId: number;
  onSelectedSubmissionId: number;
  getOverLay?: (e: boolean) => void;
  handleEditClicked: (click: boolean) => void;
}

interface Response {
  EstimateTime: number;
  Quantity: number;
  TotalEstimateTime: number;
  ActualTime: number;
  ManagerTime: number;
  Percentage: number | null;
  IsPercent: boolean | null;
  ReviewerEditedTime: number;
  IsReviewerPercent: boolean | null;
  ReviewerPercentage: number | null;
  ReviewerActualTime: number;
  QAEditedTime: number;
  IsQAPercent: boolean | null;
  QAPercentage: number | null;
  QAActualTime: number;
  IsTaskQA: number;
}

const ColorToolTip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: "#0281B9",
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#0281B9",
  },
}));

const EditDialog = ({
  onOpen,
  onClose,
  onSelectWorkItemId,
  onReviewerDataFetch,
  onClearSelection,
  onSelectedSubmissionId,
  getOverLay,
  handleEditClicked,
}: EditModalProps) => {
  const [estTime, setEstTime] = useState<string>("00:00:00");
  const [quantity, setQuantity] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<string>("00:00:00");
  const [actualTime, setActualTime] = useState<string>("00:00:00");
  const [editTime, setEditTime] = useState<string>("00:00:00");
  const [percentage, setPercentage] = useState<number>(0);
  const [checkboxClicked, setCheckboxClicked] = useState<boolean>(false);
  const [initialEditTime, setInitialEditTime] = useState<string>("00:00:00");
  const [reviewerActualTime, setReviewerActualTime] =
    useState<string>("00:00:00");
  const [reviewerEditTime, setReviewerEditTime] = useState<string>("00:00:00");
  const [reviewerPercentage, setReviewerPercentage] = useState<number>(0);
  const [reviewerCheckboxClicked, setReviewerCheckboxClicked] =
    useState<boolean>(false);
  const [reviewerInitialEditTime, setReviewerInitialEditTime] =
    useState<string>("00:00:00");
  const [qaActualTime, setQaActualTime] = useState<string>("00:00:00");
  const [qaEditTime, setQaEditTime] = useState<string>("00:00:00");
  const [qaPercentage, setQaPercentage] = useState<number>(0);
  const [qaCheckboxClicked, setQaCheckboxClicked] = useState<boolean>(false);
  const [qaInitialEditTime, setQaInitialEditTime] =
    useState<string>("00:00:00");
  const [isQaTask, setIsQaTask] = useState<boolean>(false);

  const handleClose = () => {
    setEditTime("00:00:00");
    setCheckboxClicked(false);
    setPercentage(0);
    setReviewerEditTime("00:00:00");
    setReviewerCheckboxClicked(false);
    setReviewerPercentage(0);
    setQaEditTime("00:00:00");
    setQaCheckboxClicked(false);
    setQaPercentage(0);
    setIsQaTask(false);
    onClose();
    // onReviewerDataFetch?.();
  };

  const handleEditTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    IsPreperor: number
  ) => {
    let newValue = event.target.value;
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

    if (newValue.length >= 5) {
      const seconds = parseInt(newValue.slice(4, 6));
      if (seconds >= 0 && seconds <= 59) {
        formattedValue += ":" + newValue.slice(4, 6);
      } else {
        formattedValue += ":59";
      }
    }

    let totalSeconds = 0;

    if (formattedValue) {
      const timeComponents = formattedValue.split(":");
      const hours = parseInt(timeComponents[0]);
      const minutes = parseInt(timeComponents[1]);
      const seconds = parseInt(timeComponents[2]);
      totalSeconds = hours * 3600 + minutes * 60 + seconds;
    }

    IsPreperor == 1
      ? setEditTime(formattedValue)
      : IsPreperor == 2
      ? setReviewerEditTime(formattedValue)
      : setQaEditTime(formattedValue);
  };

  function formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  useEffect(() => {
    if (
      onSelectedSubmissionId > 0 &&
      onSelectedSubmissionId !== null &&
      onOpen
    ) {
      const getDataForManualTime = async () => {
        const params = {
          SubmissionId: onSelectedSubmissionId,
        };
        const url = `${process.env.worklog_api_url}/workitem/approval/GetDataForManulTime`;
        const successCallback = (
          ResponseData: Response,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            setEstTime(formatTime(ResponseData.EstimateTime));
            setQuantity(ResponseData.Quantity);
            setTotalTime(formatTime(ResponseData.TotalEstimateTime));
            setActualTime(formatTime(ResponseData.ActualTime));
            setInitialEditTime(formatTime(ResponseData.ManagerTime));
            setEditTime(formatTime(ResponseData.ManagerTime));
            setCheckboxClicked(
              ResponseData.IsPercent === null ? false : ResponseData.IsPercent
            );
            setPercentage(
              ResponseData.Percentage === null ? 0 : ResponseData.Percentage
            );
            setReviewerActualTime(formatTime(ResponseData.ReviewerActualTime));
            setReviewerInitialEditTime(
              formatTime(ResponseData.ReviewerEditedTime)
            );
            setReviewerEditTime(formatTime(ResponseData.ReviewerEditedTime));
            setReviewerCheckboxClicked(
              ResponseData.IsReviewerPercent === null
                ? false
                : ResponseData.IsReviewerPercent
            );
            setReviewerPercentage(
              ResponseData.ReviewerPercentage === null
                ? 0
                : ResponseData.ReviewerPercentage
            );
            setQaActualTime(formatTime(ResponseData.QAActualTime));
            setQaInitialEditTime(formatTime(ResponseData.QAEditedTime));
            setQaEditTime(formatTime(ResponseData.QAEditedTime));
            setQaCheckboxClicked(
              ResponseData.IsQAPercent === null
                ? false
                : ResponseData.IsQAPercent
            );
            setQaPercentage(
              ResponseData.QAPercentage === null ? 0 : ResponseData.QAPercentage
            );
            setIsQaTask(ResponseData.IsTaskQA === 1 ? true : false);
          }
        };
        callAPI(url, params, successCallback, "POST");
      };

      getDataForManualTime();
    }
  }, [onSelectedSubmissionId, onOpen]);

  const updateManualTime = async () => {
    const [hours, minutes, seconds] = editTime.split(":");
    const convertedEditTime =
      parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
    const [reviewerHours, reviewerMinutes, reviewerSeconds] =
      reviewerEditTime.split(":");
    const convertedReviewerEditTime =
      parseInt(reviewerHours) * 3600 +
      parseInt(reviewerMinutes) * 60 +
      parseInt(reviewerSeconds);
    const [qaHours, qaMinutes, qaSeconds] = qaEditTime.split(":");
    const convertedQaEditTime =
      parseInt(qaHours) * 3600 + parseInt(qaMinutes) * 60 + parseInt(qaSeconds);

    getOverLay?.(true);
    const params = {
      WorkItemId: onSelectWorkItemId,
      SubmissionId: onSelectedSubmissionId,
      ManagerTime: checkboxClicked
        ? convertedEditTime
        : convertedEditTime > 0
        ? convertedEditTime
        : null,
      IsPercent: checkboxClicked,
      Percentage: checkboxClicked ? percentage.toString() : null,
      ReviewerEditedTime: reviewerCheckboxClicked
        ? convertedReviewerEditTime
        : convertedReviewerEditTime > 0
        ? convertedReviewerEditTime
        : null,
      IsReviewerPercent: reviewerCheckboxClicked,
      ReviewerPercentage: reviewerCheckboxClicked
        ? reviewerPercentage.toString()
        : null,
      QAEditedTime: qaCheckboxClicked
        ? convertedQaEditTime
        : convertedQaEditTime > 0
        ? convertedQaEditTime
        : null,
      IsQAPercent: qaCheckboxClicked,
      QAPercentage: qaCheckboxClicked ? qaPercentage.toString() : null,
    };

    const url = `${process.env.worklog_api_url}/workitem/approval/updateManualTime`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Time has been updated successfully.");
        onClose();
        handleEditClicked(false);
        onClearSelection?.();
        onReviewerDataFetch?.();
        getOverLay?.(false);
      } else {
        getOverLay?.(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const hasEditTimeChanged = () => {
    return (
      editTime !== initialEditTime ||
      (checkboxClicked && percentage > 0) ||
      reviewerEditTime !== reviewerInitialEditTime ||
      (reviewerCheckboxClicked && reviewerPercentage > 0) ||
      qaEditTime !== qaInitialEditTime ||
      (qaCheckboxClicked && qaPercentage > 0)
    );
  };

  const handleCheckboxChange = (e: boolean, IsPreperor: number) => {
    if (IsPreperor == 1) {
      setCheckboxClicked(e);

      if (e === false) {
        setEditTime("00:00:00");
        setPercentage(0);
      }
    } else if (IsPreperor == 2) {
      setReviewerCheckboxClicked(e);

      if (e === false) {
        setReviewerEditTime("00:00:00");
        setReviewerPercentage(0);
      }
    } else {
      setQaCheckboxClicked(e);

      if (e === false) {
        setQaEditTime("00:00:00");
        setQaPercentage(0);
      }
    }
  };

  const handleInputChange = (inputValue: number, IsPreperor: number) => {
    const digitRegex = /^\d*\.?\d*$/;

    if (digitRegex.test(inputValue.toString()) && inputValue <= 99.99) {
      const hasDecimal = inputValue.toString().includes(".");
      const decimalPart = hasDecimal
        ? inputValue.toString().split(".")[1] || ""
        : "";

      if (!hasDecimal || (hasDecimal && decimalPart.length <= 2)) {
        IsPreperor == 1
          ? setPercentage(inputValue)
          : IsPreperor == 2
          ? setReviewerPercentage(inputValue)
          : setQaPercentage(inputValue);
        const total: number | undefined = toSeconds(
          IsPreperor == 1
            ? actualTime
            : IsPreperor == 2
            ? reviewerActualTime
            : qaActualTime
        );
        const time =
          total !== undefined && total > 0
            ? toHoursAndMinutes(Math.round((inputValue * total) / 100))
            : "00:00:00";
        IsPreperor == 1
          ? setEditTime(time)
          : IsPreperor == 2
          ? setReviewerEditTime(time)
          : setQaEditTime(time);
      }
    }
  };

  const CommonField = ({ totalTime, actualTime }: any) => {
    return (
      <>
        <FormControl variant="standard">
          <TextField
            label="Est. Time"
            type="text"
            fullWidth
            value={estTime}
            variant="standard"
            sx={{ mx: 0.75, maxWidth: 100 }}
            InputProps={{ readOnly: true }}
          />
        </FormControl>
        <FormControl variant="standard">
          <TextField
            label="Qty"
            type="text"
            fullWidth
            value={quantity}
            variant="standard"
            sx={{ mx: 0.75, maxWidth: 100 }}
            InputProps={{ readOnly: true }}
          />
        </FormControl>
        <FormControl variant="standard">
          <TextField
            label="Std. Time"
            type="text"
            fullWidth
            value={totalTime}
            variant="standard"
            sx={{ mx: 0.75, maxWidth: 100 }}
            InputProps={{ readOnly: true }}
          />
        </FormControl>
        <FormControl variant="standard">
          <TextField
            label="Actual Time"
            type="text"
            fullWidth
            value={actualTime}
            variant="standard"
            sx={{ mx: 0.75, maxWidth: 100 }}
            InputProps={{ readOnly: true }}
          />
        </FormControl>
      </>
    );
  };

  return (
    <div>
      <Dialog
        open={onOpen}
        TransitionComponent={DialogTransition}
        keepMounted
        maxWidth="md"
        onClose={handleClose}
        // className="ml-80"
      >
        <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
          <span className="text-lg font-medium">Edit Time</span>
          <ColorToolTip title="Close" placement="top" arrow>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </ColorToolTip>
        </DialogTitle>
        <DialogContent className="!pt-[20px]">
          <p className="mb-2 font-extrabold">Preparer Time</p>
          <div className="flex gap-[20px]">
            <CommonField totalTime={totalTime} actualTime={actualTime} />
            <FormControl variant="standard">
              <TextField
                label="Edited Time"
                placeholder="00:00:00"
                variant="standard"
                fullWidth
                disabled={checkboxClicked}
                value={editTime}
                onChange={(e: any) => handleEditTimeChange(e, 1)}
                sx={{ mx: 0.75, maxWidth: 100 }}
              />
            </FormControl>
            <span className="flex flex-col items-start justify-center">
              <FormControl variant="standard">
                <TextField
                  type="number"
                  label="Percentage"
                  variant="standard"
                  fullWidth
                  disabled={!checkboxClicked}
                  value={percentage <= 0 ? "-" : percentage}
                  onChange={(e) => handleInputChange(Number(e.target.value), 1)}
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
                  autoComplete="off"
                  inputProps={{ step: "any" }}
                  sx={{ mx: 0.75, maxWidth: 100 }}
                />
              </FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checkboxClicked}
                    onChange={(e) => handleCheckboxChange(e.target.checked, 1)}
                  />
                }
                label="Add In %"
              />
            </span>
          </div>
          <p className="mb-2 font-extrabold">Reviewer Time</p>
          <div className="flex gap-[20px]">
            <CommonField
              totalTime={totalTime}
              actualTime={reviewerActualTime}
            />
            <FormControl variant="standard">
              <TextField
                label="Edited Time"
                placeholder="00:00:00"
                variant="standard"
                fullWidth
                disabled={
                  reviewerCheckboxClicked || reviewerActualTime === "00:00:00"
                }
                value={reviewerEditTime}
                onChange={(e: any) => handleEditTimeChange(e, 2)}
                sx={{ mx: 0.75, maxWidth: 100 }}
              />
            </FormControl>
            <span className="flex flex-col items-start justify-center">
              <FormControl variant="standard">
                <TextField
                  type="number"
                  label="Percentage"
                  variant="standard"
                  fullWidth
                  disabled={!reviewerCheckboxClicked}
                  value={reviewerPercentage <= 0 ? "-" : reviewerPercentage}
                  onChange={(e) => handleInputChange(Number(e.target.value), 2)}
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
                  autoComplete="off"
                  inputProps={{ step: "any" }}
                  sx={{ mx: 0.75, maxWidth: 100 }}
                />
              </FormControl>
              <FormControlLabel
                disabled={reviewerActualTime === "00:00:00"}
                control={
                  <Checkbox
                    checked={reviewerCheckboxClicked}
                    onChange={(e) => handleCheckboxChange(e.target.checked, 2)}
                  />
                }
                label="Add In %"
              />
            </span>
          </div>
          {isQaTask && (
            <>
              <p className="mb-2 font-extrabold">Qa Time</p>
              <div className="flex gap-[20px]">
                <CommonField totalTime={totalTime} actualTime={qaActualTime} />
                <FormControl variant="standard">
                  <TextField
                    label="Edited Time"
                    placeholder="00:00:00"
                    variant="standard"
                    fullWidth
                    disabled={qaCheckboxClicked || qaActualTime === "00:00:00"}
                    value={qaEditTime}
                    onChange={(e: any) => handleEditTimeChange(e, 3)}
                    sx={{ mx: 0.75, maxWidth: 100 }}
                  />
                </FormControl>
                <span className="flex flex-col items-start justify-center">
                  <FormControl variant="standard">
                    <TextField
                      type="number"
                      label="Percentage"
                      variant="standard"
                      fullWidth
                      disabled={!qaCheckboxClicked}
                      value={qaPercentage <= 0 ? "-" : qaPercentage}
                      onChange={(e) =>
                        handleInputChange(Number(e.target.value), 3)
                      }
                      onFocus={(e) =>
                        e.target.addEventListener(
                          "wheel",
                          function (e) {
                            e.preventDefault();
                          },
                          { passive: false }
                        )
                      }
                      autoComplete="off"
                      inputProps={{ step: "any" }}
                      sx={{ mx: 0.75, maxWidth: 100 }}
                    />
                  </FormControl>
                  <FormControlLabel
                    disabled={qaActualTime === "00:00:00"}
                    control={
                      <Checkbox
                        checked={qaCheckboxClicked}
                        onChange={(e) =>
                          handleCheckboxChange(e.target.checked, 3)
                        }
                      />
                    }
                    label="Add In %"
                  />
                </span>
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions className="border-t border-t-lightSilver p-[20px] gap-[10px] h-[64px]">
          <Button variant="outlined" color="error" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={updateManualTime}
            className={`${hasEditTimeChanged() && "!bg-secondary"}`}
            variant="contained"
            disabled={!hasEditTimeChanged()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EditDialog;
