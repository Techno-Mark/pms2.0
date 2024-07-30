import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import {
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { Close } from "@mui/icons-material";
import { LabelValueProfileImage } from "@/utils/Types/types";
import { getCCDropdownData } from "@/utils/commonDropdownApiCall";

interface SwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  firstContent: string;
  actionText: string;
  onActionClick: (id: number) => void;
}

const ToggleSwitch = ({
  isOpen,
  onClose,
  title,
  firstContent,
  actionText,
  onActionClick,
}: SwitchModalProps) => {
  const [requestedBy, setRequestedBy] = useState(0);
  const [requestedByDropdown, setRequestedByDropdown] = useState<
    LabelValueProfileImage[]
  >([]);

  useEffect(() => {
    const getData = async () => {
      setRequestedByDropdown(await getCCDropdownData());
    };

    isOpen && getData();
  }, [isOpen]);
  return (
    <>
      <div
        className={`fixed right-0 top-0 z-30 h-screen overflow-y-auto w-[30vw] border border-lightSilver bg-pureWhite transform  ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex p-[20px] justify-between items-center bg-whiteSmoke border-b border-lightSilver">
          <span className="text-pureBlack text-lg font-medium">{title}</span>
          <div className="flex items-center">
            <Tooltip title="Close" placement="left" arrow>
              <IconButton
                onClick={() => {
                  onClose();
                  setRequestedBy(0);
                }}
              >
                <Close />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col items-start justify-center mt-5 pl-6">
          <p>{firstContent}</p>
          <div className="min-w-[300px] mt-8">
            <Autocomplete
              id="tags-standard"
              sx={{ marginTop: "-12px" }}
              options={requestedByDropdown}
              value={
                requestedByDropdown?.find(
                  (i: LabelValueProfileImage) => i.value === requestedBy
                ) || null
              }
              onChange={(e, value: LabelValueProfileImage | null) => {
                !!value ? setRequestedBy(value.value) : setRequestedBy(0);
              }}
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  variant="standard"
                  label="Requested by"
                />
              )}
            />
          </div>
        </div>

        <div className="flex justify-end fixed w-full bottom-0 gap-[20px] px-[20px] py-[15px] bg-pureWhite border-t border-lightSilver">
          <Button
            variant="outlined"
            className="rounded-[4px] !h-[36px] !text-secondary"
            onClick={() => {
              onClose();
              setRequestedBy(0);
            }}
          >
            Close
          </Button>

          <Button
            variant="contained"
            className="rounded-[4px] !h-[36px] !bg-secondary cursor-pointer"
            type="button"
            onClick={() => {
              onActionClick(requestedBy);
              setRequestedBy(0);
            }}
          >
            {actionText}
          </Button>
        </div>
      </div>
    </>
  );
};

export default ToggleSwitch;
