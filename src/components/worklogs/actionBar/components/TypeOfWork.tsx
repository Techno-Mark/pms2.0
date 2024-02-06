import React, { useState } from "react";
import { toast } from "react-toastify";
import { InputBase, List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import TypeOfWorkIcon from "@/assets/icons/worklogs/TypeOfWork";
import SearchIcon from "@/assets/icons/SearchIcon";
import { callAPI } from "@/utils/API/callAPI";

const TypeOfWork = ({
  selectedRowIds,
  getWorkItemList,
  typeOfWorkDropdownData,
  handleClearSelection,
  getOverLay,
}: any) => {
  const [typeOfWorkSearchQuery, setTypeOfWorkSearchQuery] = useState("");

  const [anchorElTypeOfWork, setAnchorElTypeOfWork] =
    React.useState<HTMLButtonElement | null>(null);

  const handleClickTypeOfWork = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorElTypeOfWork(event.currentTarget);
  };

  const handleCloseTypeOfWork = () => {
    setAnchorElTypeOfWork(null);
  };

  const openTypeOfWork = Boolean(anchorElTypeOfWork);
  const idTypeOfWork = openTypeOfWork ? "simple-popover" : undefined;

  const handleTypeOfWorkSearchChange = (event: any) => {
    setTypeOfWorkSearchQuery(event.target.value);
  };

  const filteredTypeOfWork = typeOfWorkDropdownData?.filter((TypeOfWork: any) =>
    TypeOfWork.label.toLowerCase().includes(typeOfWorkSearchQuery.toLowerCase())
  );

  const handleOptionTypeOfWork = (id: any) => {
    updateTypeOfWork(selectedRowIds, id);
    handleCloseTypeOfWork();
  };

  const updateTypeOfWork = async (id: number[], TypeOfWorkId: number) => {
    getOverLay(true);
    const params = {
      WorkitemIds: id,
      WorkTypeId: TypeOfWorkId,
    };
    const url = `${process.env.worklog_api_url}/workitem/bulkupdateworkitemtypeofwork`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Type Of Work has been updated successfully.");
        getWorkItemList();
        handleClearSelection();
        getOverLay(false);
      } else {
        getOverLay(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <div>
      <ColorToolTip title="Type Of Work" arrow>
        <span aria-describedby={idTypeOfWork} onClick={handleClickTypeOfWork}>
          <TypeOfWorkIcon />
        </span>
      </ColorToolTip>

      {/* Process TypeOfWork */}
      <Popover
        id={idTypeOfWork}
        open={openTypeOfWork}
        anchorEl={anchorElTypeOfWork}
        onClose={handleCloseTypeOfWork}
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
                  value={typeOfWorkSearchQuery}
                  onChange={handleTypeOfWorkSearchChange}
                  style={{ fontSize: "13px" }}
                />
              </span>
            </div>
          </div>
          <List>
            {typeOfWorkDropdownData.length === 0 ? (
              <span className="flex flex-col py-2 px-4  text-sm">
                No Data Available
              </span>
            ) : (
              filteredTypeOfWork.map((TypeOfWork: any) => {
                return (
                  <span
                    key={TypeOfWork.value}
                    className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
                  >
                    <span
                      className="pt-1 pb-1 cursor-pointer flex flex-row items-center gap-2"
                      onClick={() => handleOptionTypeOfWork(TypeOfWork.value)}
                    >
                      <span className="pt-[0.8px]">{TypeOfWork.label}</span>
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

export default TypeOfWork;
