import React, { useState } from "react";
import { toast } from "react-toastify";
import { Avatar, InputBase, List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import SearchIcon from "@/assets/icons/SearchIcon";
import AssigneeIcon from "@/assets/icons/worklogs/Assignee";
import { getAssigneeDropdownData } from "@/utils/commonDropdownApiCall";
import { callAPI } from "@/utils/API/callAPI";
import { LabelValue } from "@/utils/Types/types";

const Assignee = ({
  selectedRowIds,
  getData,
  getOverLay,
  selectedRowClientId,
  handleClearSelection,
}: {
  selectedRowIds: number[];
  selectedRowClientId: number[];
  getData: () => void;
  getOverLay: (e: boolean) => void;
  handleClearSelection: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [assignee, setAssignee] = useState<LabelValue[]>([]);

  const [anchorElAssignee, setAnchorElAssignee] =
    React.useState<HTMLButtonElement | null>(null);

  const handleClickAssignee = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElAssignee(event.currentTarget);
    if (selectedRowClientId.length > 0) {
      const getAssignee = async () => {
        setAssignee(
          await getAssigneeDropdownData(
            selectedRowClientId,
            Number(localStorage.getItem("workTypeId"))
          )
        );
      };

      getAssignee();
    } else {
      setAssignee([]);
    }
  };

  const handleCloseAssignee = () => {
    setAnchorElAssignee(null);
  };

  const openAssignee = Boolean(anchorElAssignee);
  const idAssignee = openAssignee ? "simple-popover" : undefined;

  const handleSearchChange = (e: string) => {
    setSearchQuery(e);
  };

  const filteredAssignees = assignee?.filter((assignee: LabelValue) =>
    assignee.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateAssignee = (assigneeId: number) => {
    getOverLay(true);
    const params = {
      TicketIds: selectedRowIds,
      AssignTo: assigneeId,
    };
    const url = `${process.env.emailbox_api_url}/emailbox/UpdateAssignTo`;
    const successCallback = (
      ResponseData: boolean | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Assignee has been updated successfully.");
        getData();
        getOverLay(false);
        handleClearSelection();
      } else if (ResponseStatus === "Warning" && error === false) {
        toast.warning(ResponseData);
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
      <ColorToolTip title="Assignee" arrow>
        <span aria-describedby={idAssignee} onClick={handleClickAssignee}>
          <AssigneeIcon />
        </span>
      </ColorToolTip>

      {/* Assignee Popover */}
      <Popover
        id={idAssignee}
        open={openAssignee}
        anchorEl={anchorElAssignee}
        onClose={handleCloseAssignee}
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
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  style={{ fontSize: "13px" }}
                />
              </span>
            </div>
          </div>
          <List>
            {assignee.length === 0 ? (
              <span className="flex flex-col py-2 px-4  text-sm">
                No Data Available
              </span>
            ) : (
              filteredAssignees.map((assignee: LabelValue) => {
                return (
                  <span
                    key={assignee.value}
                    className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
                  >
                    <span
                      className="pt-1 pb-1 cursor-pointer flex flex-row items-center gap-2"
                      onClick={() => {
                        updateAssignee(assignee.value);
                      }}
                    >
                      <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                        {assignee.label
                          .split(" ")
                          .map((word: string) => word.charAt(0).toUpperCase())
                          .join("")}
                      </Avatar>

                      <span className="pt-[0.8px]">{assignee.label}</span>
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

export default Assignee;
