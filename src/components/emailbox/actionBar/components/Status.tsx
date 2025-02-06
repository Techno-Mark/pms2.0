import React from "react";
import { toast } from "react-toastify";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { List, Popover } from "@mui/material";
import { callAPI } from "@/utils/API/callAPI";
import { emailBoxStatusOptions } from "@/utils/staticDropdownData";
import DetectorStatus from "@/assets/icons/worklogs/DetectorStatus";
import { generateEmailboxStatusWithColor } from "@/utils/datatable/CommonFunction";

const Status = ({
  selectedRowIds,
  getData,
  getOverLay,
  tab,
}: {
  selectedRowIds: number[];
  getData: (IsDelay: boolean) => void;
  getOverLay: (e: boolean) => void;
  tab: string;
}) => {
  const [anchorElStatus, setAnchorElStatus] =
    React.useState<HTMLButtonElement | null>(null);

  const handleClickStatus = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElStatus(event.currentTarget);
  };

  const handleCloseStatus = () => {
    setAnchorElStatus(null);
  };

  const openStatus = Boolean(anchorElStatus);
  const idStatus = openStatus ? "simple-popover" : undefined;

  const handleOptionStatus = (id: number) => {
    updateStatus(selectedRowIds, id);
    handleCloseStatus();
  };

  const updateStatus = async (id: number[], statusId: number) => {
    getOverLay(true);
    const params = {
      TicketIds: id,
      Status: statusId,
    };
    const url = `${process.env.emailbox_api_url}/emailbox/UpdateStatus`;
    const successCallback = (
      ResponseData: {
        Result: number;
        SuccessTicketIds: string;
        NotProcessedTicketIds: string;
      },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        !!ResponseData.SuccessTicketIds &&
          ResponseData.SuccessTicketIds.length > 0 &&
          toast.success("Status has been updated successfully.");
        !!ResponseData.NotProcessedTicketIds &&
          ResponseData.NotProcessedTicketIds.length > 0 &&
          toast.warning(
            `Please set bussiness hours for ${ResponseData.NotProcessedTicketIds}.`
          );
        getData(statusId === 2);
        getOverLay(false);
      } else {
        getOverLay(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <div>
      <ColorToolTip title="Status" arrow>
        <span aria-describedby={idStatus} onClick={handleClickStatus}>
          <DetectorStatus />
        </span>
      </ColorToolTip>

      {/* Status Popover */}
      <Popover
        id={idStatus}
        open={openStatus}
        anchorEl={anchorElStatus}
        onClose={handleCloseStatus}
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
            {emailBoxStatusOptions
              .filter((i) => {
                if (tab === "Approval") {
                  return (
                    i.value !== 1 &&
                    i.value !== 2 &&
                    i.value !== 4 &&
                    i.value !== 7
                  );
                }
                return i.value !== 1 && i.value !== 4 && i.value !== 7;
              })
              .map((option: { value: number; label: string }) => (
                <span
                  key={option.value}
                  className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
                >
                  <span
                    className="p-1 cursor-pointer"
                    onClick={() => handleOptionStatus(option.value)}
                  >
                    {generateEmailboxStatusWithColor(option.label)}
                  </span>
                </span>
              ))}
          </List>
        </nav>
      </Popover>
    </div>
  );
};

export default Status;
