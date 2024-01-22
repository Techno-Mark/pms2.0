import React from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import EditIcon from "@/assets/icons/worklogs/EditIcon";

const Edit = ({ onEdit, selectedRowId, id }: any) => {
  return (
    <div>
      <ColorToolTip title="Edit" arrow>
        <span
          onClick={() => {
            onEdit(selectedRowId, id);
          }}
        >
          <EditIcon />
        </span>
      </ColorToolTip>
    </div>
  );
};

export default Edit;
