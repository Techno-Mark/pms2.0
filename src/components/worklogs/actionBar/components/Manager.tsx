import React, { useState } from "react";
import { toast } from "react-toastify";
import { InputBase, List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { getManagerDropdownData } from "@/utils/commonDropdownApiCall";
import ManagerIcon from "@/assets/icons/worklogs/ManagerIcon";
import SearchIcon from "@/assets/icons/SearchIcon";
import { callAPI } from "@/utils/API/callAPI";
import { LabelValue } from "@/utils/Types/types";

const Manager = ({
  selectedRowIds,
  getWorkItemList,
  selectedRowWorkTypeId,
  getOverLay,
  areAllValuesSame,
}: {
  selectedRowIds: number[];
  getWorkItemList: () => void;
  selectedRowWorkTypeId: number[];
  getOverLay: (e: boolean) => void;
  areAllValuesSame: any;
}) => {
  const [managerSearchQuery, setManagerSearchQuery] = useState("");
  const [managerDropdownData, setManagerDropdownData] = useState([]);

  const [anchorElManager, setAnchorElManager] =
    React.useState<HTMLButtonElement | null>(null);

  const handleClickManager = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElManager(event.currentTarget);
    if (
      selectedRowWorkTypeId.length > 0 &&
      areAllValuesSame(selectedRowWorkTypeId)
    ) {
      const getManagerData = async () => {
        setManagerDropdownData(
          await getManagerDropdownData(selectedRowWorkTypeId[0])
        );
      };

      getManagerData();
    } else {
      setManagerDropdownData([]);
    }
  };

  const handleCloseManager = () => {
    setAnchorElManager(null);
  };

  const openManager = Boolean(anchorElManager);
  const idManager = openManager ? "simple-popover" : undefined;

  const handleManagerSearchChange = (e: string) => {
    setManagerSearchQuery(e);
  };

  const filteredManager = managerDropdownData?.filter((manager: LabelValue) =>
    manager.label.toLowerCase().includes(managerSearchQuery.toLowerCase())
  );

  const handleOptionManager = (id: number) => {
    updateManager(selectedRowIds, id);
    handleCloseManager();
  };

  const updateManager = async (id: number[], manager: number) => {
    getOverLay(true);
    const params = {
      WorkitemIds: id,
      ManagerId: manager,
    };
    const url = `${process.env.worklog_api_url}/workitem/bulkupdateworkitemmanager`;
    const successCallback = (
      ResponseData: boolean | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Manager has been updated successfully.");
        getWorkItemList();
        getOverLay(false);
      } else if (ResponseStatus === "Warning" && error === false) {
        toast.warning(ResponseData);
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
      <ColorToolTip title="Manager" arrow>
        <span aria-describedby={idManager} onClick={handleClickManager}>
          <ManagerIcon />
        </span>
      </ColorToolTip>

      {/* Manager Popover */}
      <Popover
        id={idManager}
        open={openManager}
        anchorEl={anchorElManager}
        onClose={handleCloseManager}
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
                  value={managerSearchQuery}
                  onChange={(e) => handleManagerSearchChange(e.target.value)}
                  style={{ fontSize: "13px" }}
                />
              </span>
            </div>
          </div>
          <List>
            {managerDropdownData.length === 0 ? (
              <span className="flex flex-col py-2 px-4  text-sm">
                No Data Available
              </span>
            ) : (
              filteredManager.map((manager: LabelValue) => {
                return (
                  <span
                    key={manager.value}
                    className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
                  >
                    <span
                      className="pt-1 pb-1 cursor-pointer flex flex-row items-center gap-2"
                      onClick={() => handleOptionManager(manager.value)}
                    >
                      <span className="pt-[0.8px]">{manager.label}</span>
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

export default Manager;
