import React from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import RecurringIcon from "@/assets/icons/worklogs/Recurring";

const Recurring = ({ onRecurring, selectedRowId }: any) => {
  return (
    <div>
      <ColorToolTip title="Recurring" arrow>
        <span onClick={() => onRecurring(true, selectedRowId)}>
          <RecurringIcon />
        </span>
      </ColorToolTip>
    </div>
  );
};

export default Recurring;
