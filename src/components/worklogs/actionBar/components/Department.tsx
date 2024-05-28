import React, { useState } from "react";
import { toast } from "react-toastify";
import { InputBase, List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import DepartmentIcon from "@/assets/icons/worklogs/Department";
import SearchIcon from "@/assets/icons/SearchIcon";
import { callAPI } from "@/utils/API/callAPI";
import { LabelValue } from "@/utils/Types/types";

const Department = ({
  selectedRowIds,
  getWorkItemList,
  departmentDropdownData,
  handleClearSelection,
  getOverLay,
}: {
  selectedRowIds: number[];
  getWorkItemList: () => void;
  departmentDropdownData: LabelValue[];
  handleClearSelection: () => void;
  getOverLay: (e: boolean) => void;
}) => {
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState("");

  const [anchorElDepartment, setAnchorElDepartment] =
    React.useState<HTMLButtonElement | null>(null);

  const handleClickDepartment = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorElDepartment(event.currentTarget);
  };

  const handleCloseDepartment = () => {
    setAnchorElDepartment(null);
  };

  const openDepartment = Boolean(anchorElDepartment);
  const idDepartment = openDepartment ? "simple-popover" : undefined;

  const handleDepartmentSearchChange = (e: string) => {
    setDepartmentSearchQuery(e);
  };

  const filteredDepartment = departmentDropdownData?.filter(
    (Department: LabelValue) =>
      Department.label
        .toLowerCase()
        .includes(departmentSearchQuery.toLowerCase())
  );

  const handleOptionDepartment = (id: number) => {
    updateDepartment(selectedRowIds, id);
    handleCloseDepartment();
  };

  const updateDepartment = async (id: number[], DepartmentId: number) => {
    getOverLay(true);
    const params = {
      WorkitemIds: id,
      DepartmentId: DepartmentId,
    };
    const url = `${process.env.worklog_api_url}/workitem/bulkupdateworkitemdepartment`;
    const successCallback = (
      ResponseData: boolean | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Department has been updated successfully.");
        getWorkItemList();
        handleClearSelection();
        getOverLay(false);
      } else if (ResponseStatus === "Warning" && error === false) {
        toast.warning(ResponseData);
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
      <ColorToolTip title="Department" arrow>
        <span aria-describedby={idDepartment} onClick={handleClickDepartment}>
          <DepartmentIcon />
        </span>
      </ColorToolTip>

      {/* Process Department */}
      <Popover
        id={idDepartment}
        open={openDepartment}
        anchorEl={anchorElDepartment}
        onClose={handleCloseDepartment}
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
                  value={departmentSearchQuery}
                  onChange={(e) => handleDepartmentSearchChange(e.target.value)}
                  style={{ fontSize: "13px" }}
                />
              </span>
            </div>
          </div>
          <List>
            {departmentDropdownData.length === 0 ? (
              <span className="flex flex-col py-2 px-4  text-sm">
                No Data Available
              </span>
            ) : (
              filteredDepartment.map((Department: LabelValue) => {
                return (
                  <span
                    key={Department.value}
                    className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
                  >
                    <span
                      className="pt-1 pb-1 cursor-pointer flex flex-row items-center gap-2"
                      onClick={() => handleOptionDepartment(Department.value)}
                    >
                      <span className="pt-[0.8px]">{Department.label}</span>
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

export default Department;
