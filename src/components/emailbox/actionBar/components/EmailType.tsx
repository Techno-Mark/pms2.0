import React, { useState } from "react";
import { toast } from "react-toastify";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { List, Popover } from "@mui/material";
import { callAPI } from "@/utils/API/callAPI";
import { getEmailTypeData } from "@/utils/commonDropdownApiCall";
import EmailTypeIcon from "@/assets/icons/worklogs/EmailTypeIcon";

const EmailType = ({
  selectedRowIds,
  getData,
  getOverLay,
  handleClearSelection,
}: {
  selectedRowIds: number[];
  getData: () => void;
  getOverLay: (e: boolean) => void;
  handleClearSelection: () => void;
}) => {
  const [anchorElEmailType, setAnchorElEmailType] =
    React.useState<HTMLButtonElement | null>(null);
  const [errorTypeOptions, setErrorTypeOptions] = useState([]);

  const handleClickEmailType = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElEmailType(event.currentTarget);
    const getEmailType = async () => {
      setErrorTypeOptions(await getEmailTypeData());
    };

    getEmailType();
  };

  const handleCloseEmailType = () => {
    setAnchorElEmailType(null);
  };

  const openEmailType = Boolean(anchorElEmailType);
  const idEmailType = openEmailType ? "simple-popover" : undefined;

  const handleOptionEmailType = (id: number) => {
    updateEmailType(selectedRowIds, id);
    handleCloseEmailType();
  };

  const updateEmailType = async (id: number[], emailTypeId: number) => {
    getOverLay(true);
    const params = {
      TicketIds: id,
      EmailTypeId: emailTypeId,
    };
    const url = `${process.env.emailbox_api_url}/emailbox/UpdateEmailType`;
    const successCallback = (
      ResponseData: {
        Result: number;
        NotExceedTicketIds: string;
        ExceedTicketIds: string;
      },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        !!ResponseData.NotExceedTicketIds &&
          ResponseData.NotExceedTicketIds.trim().length > 0 &&
          toast.success("EmailType has been updated successfully.");
        !!ResponseData.ExceedTicketIds &&
          ResponseData.ExceedTicketIds.trim().length > 0 &&
          toast.warning(
            `Email type cannot be changed as 15% of the total time has already been spent on this email.`
          );
        getData();
        getOverLay(false);
        handleClearSelection();
      } else {
        getOverLay(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <div>
      <ColorToolTip title="Email Type" arrow>
        <span aria-describedby={idEmailType} onClick={handleClickEmailType}>
          <EmailTypeIcon />
        </span>
      </ColorToolTip>

      {/* EmailType Popover */}
      <Popover
        id={idEmailType}
        open={openEmailType}
        anchorEl={anchorElEmailType}
        onClose={handleCloseEmailType}
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
            {errorTypeOptions.map(
              (option: { value: number; label: string }) => (
                <span
                  key={option.value}
                  className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
                >
                  <span
                    className="p-1 cursor-pointer"
                    onClick={() => handleOptionEmailType(option.value)}
                  >
                    {option.label}
                  </span>
                </span>
              )
            )}
          </List>
        </nav>
      </Popover>
    </div>
  );
};

export default EmailType;
