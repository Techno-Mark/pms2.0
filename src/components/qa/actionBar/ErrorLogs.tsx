import React from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import ErrorLogsIcon from "@/assets/icons/worklogs/ErrorLogs";

interface ErrorLogs {
  selectedRowId: number;
  selectedRowSubmissionId: number;
  onErrorLog: (
    openDrawer: boolean,
    selectedRowId: number,
    selectedRowSubmissionId: number
  ) => void;
}

const ErrorLogs = ({
  selectedRowId,
  selectedRowSubmissionId,
  onErrorLog,
}: ErrorLogs) => {
  return (
    <div>
      <ColorToolTip title="Error logs" arrow>
        <span
          onClick={() =>
            onErrorLog(true, selectedRowId, selectedRowSubmissionId)
          }
        >
          <ErrorLogsIcon />
        </span>
      </ColorToolTip>
    </div>
  );
};

export default ErrorLogs;
