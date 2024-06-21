import React from "react";
import { toast } from "react-toastify";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { List, Popover } from "@mui/material";
import PriorityIcon from "@/assets/icons/worklogs/Priority";
import { callAPI } from "@/utils/API/callAPI";
import { priorityOptions } from "@/utils/staticDropdownData";

const Priority = ({
  selectedRowIds,
  getData,
  getOverLay,
}: {
  selectedRowIds: number[];
  getData: () => void;
  getOverLay: (e: boolean) => void;
}) => {
  const [anchorElPriority, setAnchorElPriority] =
    React.useState<HTMLButtonElement | null>(null);

  const handleClickPriority = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElPriority(event.currentTarget);
  };

  const handleClosePriority = () => {
    setAnchorElPriority(null);
  };

  const openPriority = Boolean(anchorElPriority);
  const idPriority = openPriority ? "simple-popover" : undefined;

  const handleOptionPriority = (id: number) => {
    updatePriority(selectedRowIds, id);
    handleClosePriority();
  };

  const updatePriority = async (id: number[], priorityId: number) => {
    getOverLay(true);
    const params = {
      workitemIds: id,
      priority: priorityId,
    };
    const url = `${process.env.worklog_api_url}/workitem/UpdatePriority`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Priority has been updated successfully.");
        getData();
        getOverLay(false);
      } else {
        getOverLay(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <div>
      <ColorToolTip title="Priority" arrow>
        <span aria-describedby={idPriority} onClick={handleClickPriority}>
          <PriorityIcon />
        </span>
      </ColorToolTip>

      {/* Priority Popover */}
      <Popover
        id={idPriority}
        open={openPriority}
        anchorEl={anchorElPriority}
        onClose={handleClosePriority}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <nav className="!w-52">
          <List>
            {priorityOptions.map((option: { value: number; label: string }) => (
              <span
                key={option.value}
                className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
              >
                <span
                  className="p-1 cursor-pointer"
                  onClick={() => handleOptionPriority(option.value)}
                >
                  {option.label}
                </span>
              </span>
            ))}
          </List>
        </nav>
      </Popover>
    </div>
  );
};

export default Priority;
