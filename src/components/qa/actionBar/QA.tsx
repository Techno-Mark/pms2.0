import React, { useState } from "react";
import { toast } from "react-toastify";
import { List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import DetectorStatus from "@/assets/icons/worklogs/DetectorStatus";
import { callAPI } from "@/utils/API/callAPI";
import { LabelValueType } from "@/utils/Types/types";
import { getApiFunction } from "@/utils/commonDropdownApiCall";

const QA = ({
  selectedRowIds,
  handleClearSelection,
  getOverLay,
  getQaList,
}: {
  selectedRowIds: number[];
  handleClearSelection: () => void;
  getOverLay?: (e: boolean) => void;
  getQaList: any;
}) => {
  const [allQa, setAllQa] = useState<LabelValueType[]>([]);
  const [anchorElQa, setAnchorElQa] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClickQa = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElQa(event.currentTarget);
    getAllQa();
  };

  const handleCloseQa = () => {
    setAnchorElQa(null);
  };

  const openQa = Boolean(anchorElQa);
  const idQa = openQa ? "simple-popover" : undefined;

  const handleOptionQa = (id: number) => {
    updateQa(id);
    handleCloseQa();
  };

  const getAllQa = async () => {
    const QaData = await getApiFunction(
      `${process.env.api_url}/user/GetQAUsersDropdown`
    );
    QaData.length > 0 && setAllQa(QaData);
  };

  const updateQa = async (QaId: number) => {
    getOverLay?.(true);
    const params = {
      workitemIds: selectedRowIds,
      qaId: QaId,
    };
    const url = `${process.env.worklog_api_url}/workitem/quality/bulkupdateworkitemqa`;
    const successCallback = (
      ResponseData: boolean | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Qa has been updated successfully.");
        handleClearSelection();
        getQaList();
        getOverLay?.(false);
      } else if (ResponseStatus === "Warning" && error === false) {
        toast.warning(ResponseData);
        handleClearSelection();
        getQaList();
        getOverLay?.(false);
      } else {
        handleClearSelection();
        getQaList();
        getOverLay?.(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <div>
      <ColorToolTip title="Qa" arrow>
        <span aria-describedby={idQa} onClick={handleClickQa}>
          <DetectorStatus />
        </span>
      </ColorToolTip>
      <Popover
        id={idQa}
        open={openQa}
        anchorEl={anchorElQa}
        onClose={handleCloseQa}
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
            {allQa.length === 0 ? (
              <span className="flex flex-col py-2 px-4  text-sm">
                No Data Available
              </span>
            ) : (
              allQa.map((option: LabelValueType) => {
                return (
                  <span
                    key={option.value}
                    className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
                  >
                    <span
                      className="p-1 cursor-pointer"
                      onClick={() => handleOptionQa(option.value)}
                    >
                      {option.label}
                    </span>
                  </span>
                );
              })
            )}
          </List>
        </nav>
      </Popover>
    </div>
  );
};

export default QA;
