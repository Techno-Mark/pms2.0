import React from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import RecurringIcon from "@/assets/icons/worklogs/Recurring";

const Recurring = ({
  onRecurring,
  selectedRowId,
}: {
  onRecurring: (rowData: boolean, selectedId: number) => void;
  selectedRowId: number | null;
}) => {
  return (
    <div>
      <ColorToolTip title="Recurring" arrow>
        <span
          onClick={() =>
            onRecurring(true, selectedRowId !== null ? selectedRowId : 0)
          }
        >
          <RecurringIcon />
        </span>
      </ColorToolTip>
    </div>
  );
};

export default Recurring;
