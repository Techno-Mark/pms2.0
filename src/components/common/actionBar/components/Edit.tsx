import React from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import EditIcon from "@/assets/icons/worklogs/EditIcon";

const Edit = ({
  onEdit,
  selectedRowId,
  id,
}: {
  onEdit:
    | ((rowData: number) => void)
    | ((rowId: number, Id: number, iconIndex?: number) => void);
  selectedRowId: number;
  id: number;
}) => {
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
