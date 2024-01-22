import React, { useState } from "react";
import { toast } from "react-toastify";
import { InputBase, List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import ProcessIcon from "@/assets/icons/worklogs/ProcessIcon";
import SearchIcon from "@/assets/icons/SearchIcon";
import { callAPI } from "@/utils/API/callAPI";

const Process = ({
  processDropdownData,
  selectedRowIds,
  handleClearSelection,
  getWorkItemList,
  getOverLay,
}: any) => {
  const [processSearchQuery, setprocessSearchQuery] = useState("");

  const [anchorElProcess, setAnchorElProcess] =
    React.useState<HTMLButtonElement | null>(null);

  const handleClickProcess = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElProcess(event.currentTarget);
  };

  const handleCloseProcess = () => {
    setAnchorElProcess(null);
  };

  const openProcess = Boolean(anchorElProcess);
  const idProcess = openProcess ? "simple-popover" : undefined;

  const handleProcessSearchChange = (event: any) => {
    setprocessSearchQuery(event.target.value);
  };

  const filteredProcess = processDropdownData?.filter((process: any) =>
    process.label.toLowerCase().includes(processSearchQuery.toLowerCase())
  );

  const handleOptionProcess = (id: any) => {
    updateProcess(selectedRowIds, id);
    handleCloseProcess();
  };

  const updateProcess = async (id: number[], processId: number) => {
    getOverLay(true);
    const params = {
      workitemIds: id,
      ProcessId: processId,
    };
    const url = `${process.env.worklog_api_url}/workitem/bulkupdateworkitemprocess`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Process has been updated successfully.");
        handleClearSelection();
        getWorkItemList();
        getOverLay(false);
      } else {
        getOverLay(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <div>
      <ColorToolTip title="Process" arrow>
        <span aria-describedby={idProcess} onClick={handleClickProcess}>
          <ProcessIcon />
        </span>
      </ColorToolTip>

      <Popover
        id={idProcess}
        open={openProcess}
        anchorEl={anchorElProcess}
        onClose={handleCloseProcess}
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
          <div className="mr-4 ml-4 mt-4">
            <div
              className="flex items-center h-10 rounded-md pl-2 flex-row"
              style={{
                border: "1px solid lightgray",
              }}
            >
              <span className="mr-2">
                <SearchIcon />
              </span>
              <span>
                <InputBase
                  placeholder="Search"
                  inputProps={{ "aria-label": "search" }}
                  value={processSearchQuery}
                  onChange={handleProcessSearchChange}
                  style={{ fontSize: "13px" }}
                />
              </span>
            </div>
          </div>
          <List>
            {processDropdownData.length === 0 ? (
              <span className="flex flex-col py-2 px-4  text-sm">
                No Data Available
              </span>
            ) : (
              filteredProcess.map((process: any) => {
                return (
                  <span
                    key={process.value}
                    className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
                  >
                    <span
                      className="pt-1 pb-1 cursor-pointer flex flex-row items-center gap-2"
                      onClick={() => handleOptionProcess(process.value)}
                    >
                      <span className="pt-[0.8px]">{process.label}</span>
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

export default Process;
