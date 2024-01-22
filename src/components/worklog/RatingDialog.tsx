import React, { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  FormControl,
  IconButton,
  TextareaAutosize,
  Tooltip,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import { toast } from "react-toastify";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { Spinner } from "next-ts-lib";
import { callAPI } from "@/utils/API/callAPI";

interface RatingModalProps {
  onOpen: boolean;
  onClose: () => void;
  ratingId: any;
  noRatingId: any;
  onActionClick?: () => void;
  onDataFetch: () => void;
  handleClearSelection: () => void;
}

const RatingDialog: React.FC<RatingModalProps> = ({
  onOpen,
  onClose,
  ratingId,
  noRatingId,
  onDataFetch,
  handleClearSelection,
}) => {
  const [ratingValue, setRatingValue] = React.useState<any>(0);
  const [ratingErr, setRatingErr] = React.useState(false);
  const [comment, setComment] = React.useState<string>("");
  const [loaded, setLoaded] = useState(false);

  const handleClose = () => {
    setRatingValue(0);
    setRatingErr(false);
    setComment("");
    handleClearSelection();
    onClose();
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    ratingValue <= 0 ? setRatingErr(true) : setRatingErr(false);

    if (ratingValue > 0) {
      if (noRatingId.length > 0) {
        toast.warning(
          "You can only give rating which status is not signed-off."
        );
        handleClose();
      }
      if (ratingId.length > 0) {
        setLoaded(true);
        const params = {
          workitemIds: ratingId,
          rating: ratingValue,
          comment: comment.trim(),
        };
        const url = `${process.env.worklog_api_url}/ClientWorkitem/workitemrating`;
        const successCallback = (
          ResponseData: any,
          error: any,
          ResponseStatus: any
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success("Rating successfully submitted.");
            onDataFetch();
            handleClose();
            setLoaded(false);
          } else {
            setLoaded(false);
          }
        };
        callAPI(url, params, successCallback, "POST");
      }
    }
  };

  return (
    <div>
      <Dialog
        open={onOpen}
        TransitionComponent={DialogTransition}
        onClose={handleClose}
      >
        <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
          <span className="text-lg font-medium">Rating</span>
          <IconButton onClick={handleClose}>
            <Tooltip title="Close" placement="left" arrow>
              <Close />
            </Tooltip>
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-y-[20px] w-[500px]">
            <div className="flex flex-col p-[10px] gap-y-[10px]">
              <label className="text-[16px] text-darkCharcoal">Feedback:</label>
              <Rating
                name="hover-feedback"
                value={ratingValue}
                onChange={(event, newValue) => {
                  setRatingValue(newValue);
                }}
                emptyIcon={
                  <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
                }
              />
            </div>
            <span className="text-defaultRed ml-3 -mt-8">
              {ratingErr && ratingValue <= 0 ? "This is a required field." : ""}
            </span>

            <div className="flex flex-col px-[10px] gap-y-[10px]">
              <label className="text-[16px] text-darkCharcoal">Comment:</label>
              <FormControl variant="standard">
                <TextareaAutosize
                  color="error"
                  id="notes"
                  name="notes"
                  placeholder="Share comment of your own experience for this task."
                  minRows={3}
                  autoFocus
                  className="outline-none border-b border-slatyGrey"
                  required
                  onChange={(e) => setComment(e.target.value)}
                />
              </FormControl>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="border-t border-t-lightSilver p-[20px] gap-[10px] h-[64px]">
          <Button variant="outlined" color="info" onClick={handleClose}>
            Cancel
          </Button>
          {loaded ? (
            <span className="w-[75px] flex items-center justify-center">
              <Spinner size="20px" />
            </span>
          ) : (
            <Button
              variant="contained"
              color="info"
              className="!bg-secondary"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RatingDialog;
