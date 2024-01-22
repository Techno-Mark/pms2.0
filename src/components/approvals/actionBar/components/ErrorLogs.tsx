import React from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import ErrorLogsIcon from "@/assets/icons/worklogs/ErrorLogs";

const ErrorLogs = ({ settingSelectedId }: any) => {
  return (
    <div>
      <ColorToolTip title="Error logs" arrow>
        <span
          onClick={settingSelectedId}
        >
          <ErrorLogsIcon />
        </span>
      </ColorToolTip>
    </div>
  );
};

export default ErrorLogs;
