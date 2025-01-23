import React, { useState } from "react";
import { toast } from "react-toastify";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { List, Popover, TextField } from "@mui/material";
import { callAPI } from "@/utils/API/callAPI";
import { getTagData } from "@/utils/commonDropdownApiCall";
import { TagSharp } from "@mui/icons-material";

const Tag = ({
  selectedRowIds,
  getData,
  getOverLay,
}: {
  selectedRowIds: number[];
  getData: () => void;
  getOverLay: (e: boolean) => void;
}) => {
  const [anchorElTag, setAnchorElTag] =
    React.useState<HTMLButtonElement | null>(null);
  const [tagOptions, setTagOptions] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [inputError, setInputError] = useState(false);

  const handleClickTag = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElTag(event.currentTarget);
    const getTag = async () => {
      setTagOptions(await getTagData());
    };

    getTag();
  };

  const handleCloseTag = () => {
    setAnchorElTag(null);
    setNewTagName("");
    setInputError(false);
  };

  const openTag = Boolean(anchorElTag);
  const idTag = openTag ? "simple-popover" : undefined;

  const handleOptionTag = (id: string) => {
    updateTag(selectedRowIds, id);
    handleCloseTag();
  };

  const handleNewTagSubmit = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      if (!newTagName.trim()) {
        setInputError(true);
      } else {
        updateTag(selectedRowIds, newTagName.trim());
        setInputError(false);
        handleCloseTag();
      }
    }
  };

  const updateTag = async (id: number[], tagName: string) => {
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
                e.target.value.trim().length <= 20 &&
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
            {tagOptions.map((option: { value: string; label: string }) => (
              <span
                key={option.value}
                className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
              >
                <span
                  className="p-1 cursor-pointer"
                  onClick={() => handleOptionTag(option.value)}
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

export default Tag;
