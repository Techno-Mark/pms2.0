import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import {
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import SearchIcon from "@/assets/icons/SearchIcon";
import Datatable_TaskStatus from "@/components/admin-dashboard/Datatables/Datatable_TaskStatus";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { getStatusDropdownData } from "@/utils/commonDropdownApiCall";

interface Status {
  Type: string;
  label: string;
  value: number;
}

interface TaskStatusInfoDialogProps {
  onOpen: boolean;
  onClose: () => void;
  onSelectedWorkType: number;
  onSelectedStatusName: string;
}

const Dialog_TaskStatus: React.FC<TaskStatusInfoDialogProps> = ({
  onOpen,
  onClose,
  onSelectedWorkType,
  onSelectedStatusName,
}) => {
  const [allStatus, setAllStatus] = useState<any>([]);
  const [status, setStatus] = useState<number | any>(0);
  const [clickedStatusName, setClickedStatusName] = useState<string>("");
  const [searchValue, setSearchValue] = useState("");

  const handleClose = () => {
    onClose();
    setStatus(0);
    setClickedStatusName("");
    setSearchValue("");
  };

  function getValueByLabelOrType(labelOrType: any): number {
    const status = allStatus.find(
      (status: Status) =>
        status.Type === labelOrType || status.label === labelOrType
    );
    if (status) {
      return status.value;
    } else {
      return 0;
    }
  }

  const handleChangeValue = (e: any) => {
    setStatus(e.target.value);
    setSearchValue("");
  };

  useEffect(() => {
    setClickedStatusName(onSelectedStatusName);
    const statusValue: number = getValueByLabelOrType(clickedStatusName);
    setStatus(statusValue);
  }, [clickedStatusName, onSelectedStatusName]);

  const getAllStatus = async () => {
    const statusData = await getStatusDropdownData();
    setAllStatus(statusData);
  };

  useEffect(() => {
    getAllStatus();
  }, []);

  return (
    <div>
      <Dialog
        fullWidth
        open={onOpen}
        TransitionComponent={DialogTransition}
        keepMounted
        maxWidth="xl"
        onClose={handleClose}
      >
        <DialogTitle className="flex justify-between p-5 bg-whiteSmoke">
          <span className="font-semibold text-lg">Task Status</span>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className="flex flex-col gap-5 mt-[10px]">
          <div className="flex justify-between items-center">
            <FormControl sx={{ mx: 0.75, minWidth: 220, marginTop: 1 }}>
              <div className="flex items-center h-full relative">
                <TextField
                  className="m-0"
                  placeholder="Search"
                  fullWidth
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  margin="normal"
                  variant="standard"
                  sx={{ mx: 0.75, maxWidth: 300 }}
                />
                <span className="absolute right-1 pl-1">
                  <SearchIcon />
                </span>
              </div>
            </FormControl>

            <FormControl sx={{ mx: 0.75, minWidth: 220, marginTop: 1 }}>
              <Select
                labelId="status"
                id="status"
                value={status ? status : 0}
                onChange={handleChangeValue}
                sx={{ height: "36px" }}
              >
                <MenuItem value={0}>All</MenuItem>
                {allStatus.map((i: any) => (
                  <MenuItem value={i.value} key={i.value}>
                    {i.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <Datatable_TaskStatus
            onSelectedWorkType={onSelectedWorkType}
            onSelectedStatusName={onSelectedStatusName}
            onCurrSelectedStatus={status}
            onSearchValue={searchValue}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dialog_TaskStatus;
