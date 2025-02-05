import React, { useState } from "react";
import { toast } from "react-toastify";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { List, Popover, TextField } from "@mui/material";
import { callAPI } from "@/utils/API/callAPI";
import { TagSharp } from "@mui/icons-material";
import DeleteTagDialog from "./DeleteTagDialog";

const Tag = ({
  selectedRowIds,
  getData,
  getOverLay,
  tagDropdown,
  getTagDropdownData,
  handleClearSelection,
}: {
  selectedRowIds: number[];
  getData: () => void;
  getOverLay: (e: boolean) => void;
  tagDropdown: { label: string; value: string }[];
  getTagDropdownData: () => void;
  handleClearSelection: () => void;
}) => {
  const [anchorElTag, setAnchorElTag] =
    React.useState<HTMLButtonElement | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [inputError, setInputError] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [id, setId] = useState("");

  const handleClickTag = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElTag(event.currentTarget);
  };

  const handleCloseTag = () => {
    setAnchorElTag(null);
    setNewTagName("");
    setInputError(false);
  };

  const openTag = Boolean(anchorElTag);
  const idTag = openTag ? "simple-popover" : undefined;

  const handleOptionTag = (id: string) => {
    updateTag(selectedRowIds, id, false);
    handleCloseTag();
  };

  const handleDeleteTag = (value: string) => {
    setId(value);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setId("");
    setOpenDialog(false);
  };

  const handleNewTagSubmit = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      if (!newTagName.trim()) {
        setInputError(true);
      } else {
        updateTag(selectedRowIds, newTagName.trim(), true);
        setInputError(false);
        handleCloseTag();
      }
    }
  };

  const updateTag = async (
    id: number[],
    tagName: string,
    isNewTag: boolean
  ) => {
    getOverLay(true);
    const params = {
      TicketIds: id,
      Name: tagName,
    };
    const url = `${process.env.emailbox_api_url}/emailbox/savetag`;
    const successCallback = (
      ResponseData: boolean | number | string,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Tag has been updated successfully.");
        getData();
        isNewTag && getTagDropdownData();
        getOverLay(false);
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
      <ColorToolTip title="Tag" arrow>
        <span
          aria-describedby={idTag}
          onClick={handleClickTag}
          className="text-[#6E6D7A]"
        >
          <TagSharp />
        </span>
      </ColorToolTip>

      {/* Tag Popover */}
      <Popover
        id={idTag}
        open={openTag}
        anchorEl={anchorElTag}
        onClose={handleCloseTag}
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
          {/* Input Field for New Tag */}
          <div className="p-4">
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Enter new tag"
              value={newTagName}
              onChange={(e) => {
                e.target.value.trim().length <= 25 &&
                  setNewTagName(e.target.value);
                setInputError(false);
              }}
              onKeyDown={handleNewTagSubmit}
              error={inputError}
              helperText={inputError ? "Tag cannot be empty." : ""}
            />
          </div>
          {/* Tag Options */}
          <List>
            {tagDropdown.length > 0 &&
              tagDropdown.map((option: { value: string; label: string }) => (
                <span
                  key={option.value}
                  className="flex items-center justify-between py-2 px-4 hover:bg-gray-100 text-sm"
                >
                  <span
                    className="p-1 cursor-pointer"
                    onClick={() => handleOptionTag(option.value)}
                  >
                    {option.label}
                  </span>
                  <span
                    onClick={() => handleDeleteTag(option.value)}
                    style={{
                      marginLeft: "8px",
                      color: "#A5A5A5",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    ✕
                  </span>
                </span>
              ))}
          </List>
        </nav>
      </Popover>
      <DeleteTagDialog
        id={id}
        onOpen={openDialog}
        handleClose={handleClose}
        getTagDropdownData={getTagDropdownData}
        getOverLay={getOverLay}
        handleClearSelection={handleClearSelection}
      />
    </div>
  );
};

export default Tag;
