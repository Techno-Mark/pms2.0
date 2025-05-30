import { Rating } from "@mui/material";
import React from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";

export const generateCustomHeaderName = (headerName: string) => {
  return (
    <span className="font-extrabold capitalize max-w-[10px] p-0 m-0">
      {headerName}
    </span>
  );
};

export const generateCommonBodyRender = (bodyValue: any) => {
  const shortProcessName =
    bodyValue !== null &&
    bodyValue !== undefined &&
    bodyValue !== "" &&
    bodyValue !== "0" &&
    bodyValue.length > 20
      ? bodyValue.slice(0, 20)
      : bodyValue;

  return (
    <div className="ml-2">
      {!bodyValue ||
      bodyValue === "0" ||
      bodyValue === null ||
      bodyValue === "null" ? (
        "-"
      ) : bodyValue.length > 20 ? (
        <>
          <ColorToolTip title={bodyValue} placement="top">
            <span>{shortProcessName}</span>
          </ColorToolTip>
          <span>...</span>
        </>
      ) : (
        shortProcessName
      )}
    </div>
  );
};

export const generateCommonBodyInvoice = (bodyValue: any) => {
  return bodyValue === 1 ? "Invoice Raised" : "Invoice Pending";
};

export const generateCommonBodyRenderNullCheck = (bodyValue: any) => {
  return <div className="ml-2">{bodyValue === null ? "-" : bodyValue}</div>;
};

export const generateCommonBodyRenderPercentage = (bodyValue: any) => {
  return (
    <div className="ml-2">
      {!bodyValue || bodyValue === "0" || bodyValue === null
        ? "-"
        : `${bodyValue} %`}
    </div>
  );
};

export const generateDashboardReportBodyRender = (bodyValue: any) => {
  return (
    <div className="ml-2">
      {bodyValue === "" || bodyValue === null ? "-" : bodyValue}
    </div>
  );
};

export const generateDashboardReportBodyRenderShortName = (bodyValue: any) => {
  const shortProcessName =
    bodyValue !== null &&
    bodyValue !== undefined &&
    bodyValue !== "" &&
    bodyValue !== "0" &&
    bodyValue.length > 20
      ? bodyValue.slice(0, 20)
      : bodyValue;

  return (
    <div className="ml-2">
      {!bodyValue ||
      bodyValue === "0" ||
      bodyValue === null ||
      bodyValue === "null" ? (
        "-"
      ) : bodyValue.length > 20 ? (
        <>
          <ColorToolTip title={bodyValue} placement="top">
            <span>{shortProcessName}</span>
          </ColorToolTip>
          <span>...</span>
        </>
      ) : (
        shortProcessName
      )}
    </div>
  );
};

export const generateDashboardReportBodyRenderSecondToTime = (
  bodyValue: any
) => {
  return (
    <div className="ml-2">
      {`${bodyValue < 0 ? "-" : ""}${String(
        Math.floor(Math.abs(bodyValue) / 3600)
      ).padStart(2, "0")}:${String(
        Math.floor((Math.abs(bodyValue) % 3600) / 60)
      ).padStart(2, "0")}:${String(Math.abs(bodyValue) % 60).padStart(2, "0")}`}
    </div>
  );
};

export const getTagDataForDashboard = (bodyValue: any) => {
  return !!bodyValue && JSON.parse(bodyValue).length <= 0 ? (
    "-"
  ) : (
    <div className="flex items-center justify-start gap-2">
      {!!bodyValue &&
        JSON.parse(bodyValue).map((item: string, index: number) => (
          <div
            key={index}
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: "#e0e0e0",
              borderRadius: "12px",
              padding: "4px 8px",
              fontSize: "14px",
              cursor: "default",
            }}
          >
            <span>{item}</span>
          </div>
        ))}
    </div>
  );
};

export const generateDashboardReportBodyRenderRight = (bodyValue: any) => {
  return (
    <div
      className="flex justify-end w-full items-center"
      style={{ paddingRight: "14px" }}
    >
      {bodyValue === "" ? "-" : bodyValue}
    </div>
  );
};

export const generateCustomFormatDate = (
  value: string | number | Date | null
) => {
  if (value === null || value === "") {
    return "-";
  }

  const startDate = new Date(value);
  const month = startDate.getMonth() + 1;
  const formattedMonth = month < 10 ? `0${month}` : month;
  const day = startDate.getDate();
  const formattedDay = day < 10 ? `0${day}` : day;
  const formattedYear = startDate.getFullYear();
  const formattedDate = `${formattedMonth}-${formattedDay}-${formattedYear}`;

  return <div>{formattedDate}</div>;
};

export const generatePriorityWithColor = (value: any) => {
  let isHighPriority;
  let isMediumPriority;
  let isLowPriority;

  if (value) {
    isHighPriority = value.toLowerCase() === "high";
    isMediumPriority = value.toLowerCase() === "medium";
    isLowPriority = value.toLowerCase() === "low";
  }

  const priorityColorCode = isHighPriority
    ? "#DC3545"
    : isMediumPriority
    ? "#FFC107"
    : isLowPriority
    ? "#02B89D"
    : "#D8D8D8";

  return (
    <div>
      {value === null || value === "" || value === 0 || value === "0" ? (
        "-"
      ) : (
        <div className="flex items-center justify-start mr-1">
          <div
            className={"w-[10px] h-[10px] rounded-full inline-block mr-2 "}
            style={{ backgroundColor: priorityColorCode }}
          ></div>
          {value}
        </div>
      )}
    </div>
  );
};

export const generateEmailboxStatusWithColor = (value: any) => {
  const statusColorCode =
    value.toLowerCase() === "not started"
      ? "#A5A5A5"
      : value.toLowerCase() === "in progress"
      ? "#4472C4"
      : value.toLowerCase() === "waiting for client"
      ? "#FFC000"
      : value.toLowerCase() === "in review"
      ? "#00B0F0"
      : value.toLowerCase() === "closed"
      ? "#e5801c"
      : value.toLowerCase() === "canceled"
      ? "#C00000"
      : value.toLowerCase() === "reopen"
      ? "#833C0C"
      : "#D8D8D8";

  return (
    <div>
      {value === null || value === "" || value === 0 || value === "0" ? (
        "-"
      ) : (
        <div className="inline-block mr-1">
          <div
            className={"w-[10px] h-[10px] rounded-full inline-block mr-2 "}
            style={{ backgroundColor: statusColorCode }}
          ></div>
          {value}
        </div>
      )}
    </div>
  );
};

export const generateEmailboxStatusOnlyColor = (value: any) => {
  const statusColorCode =
    value.toLowerCase() === "not started"
      ? "#A5A5A5"
      : value.toLowerCase() === "in progress"
      ? "#4472C4"
      : value.toLowerCase() === "waiting for client"
      ? "#FFC000"
      : value.toLowerCase() === "in review"
      ? "#00B0F0"
      : value.toLowerCase() === "closed"
      ? "#e5801c"
      : value.toLowerCase() === "canceled"
      ? "#C00000"
      : value.toLowerCase() === "reopen" || value.toLowerCase() === "re-open"
      ? "#833C0C"
      : "#D8D8D8";

  return statusColorCode;
};

export const generateEmailboxPriorityOnlyColor = (value: any) => {
  const priorityColorCode =
    value.toLowerCase() === "high"
      ? "#DC3545"
      : value.toLowerCase() === "medium"
      ? "#FFC107"
      : value.toLowerCase() === "low"
      ? "#02B89D"
      : value.toLowerCase() === "nopriority"
      ? "#D8D8D8"
      : "#D8D8D8";

  return priorityColorCode;
};

export const generateEmailboxSLAStatusWithColor = (value: any) => {
  let statusColorCode;
  if (!!value) {
    statusColorCode =
      value?.toLowerCase() === "achieved"
        ? "#00E272"
        : value?.toLowerCase() === "not achieved"
        ? "#FA4B42"
        : value?.toLowerCase() === "at risk"
        ? "#FFC000"
        : "#000000";
  }

  return (
    <div>
      {value === null || value === "" || value === 0 || value === "0" ? (
        "-"
      ) : (
        <div className="inline-block mr-1">
          <div
            className={"w-[10px] h-[10px] rounded-full inline-block mr-2 "}
            style={{ backgroundColor: statusColorCode }}
          ></div>
          {value}
        </div>
      )}
    </div>
  );
};

export const generateEmailboxStatusColor = (value: any) => {
  const statusColorCode =
    value.toLowerCase() === "unprocessed"
      ? "#A5A5A5"
      : value.toLowerCase() === "inbox"
      ? "#4472C4"
      : value.toLowerCase() === "draft"
      ? "#FFC000"
      : value.toLowerCase() === "approval"
      ? "#00B0F0"
      : value.toLowerCase() === "junk"
      ? "#e5801c"
      : value.toLowerCase() === "sent"
      ? "#833C0C"
      : value.toLowerCase() === "failed"
      ? "#FF0000"
      : value.toLowerCase() === "total"
      ? "#008080"
      : "#D8D8D8";

  return statusColorCode;
};

export const generateStatusWithColor = (value: string, rowIndex: any) => {
  const statusColorCode = rowIndex;

  return (
    <div>
      {value === null || value === "" || value === "0" ? (
        "-"
      ) : (
        <div className="inline-block mr-1">
          <div
            className="w-[10px] h-[10px] rounded-full inline-block mr-2"
            style={{ backgroundColor: statusColorCode }}
          ></div>
          {value}
        </div>
      )}
    </div>
  );
};

export const generateInitialTimer = (value: any) => {
  return (
    <div className="flex items-center gap-2">
      {value === null || value === 0 || value === "0" ? "00:00:00" : value}
    </div>
  );
};

export const generateDateWithoutTime = (value: any) => {
  const generatedValue =
    value === null || value === 0 || value === ""
      ? "-"
      : value.split("T")[0].split("-");
  return (
    <div>
      {value === null || value === 0 || value === ""
        ? generatedValue
        : `${generatedValue[1]}-${generatedValue[2]}-${generatedValue[0]}`}
    </div>
  );
};

export const generateTimeWithoutDate = (value: any) => {
  if (!value || typeof value !== "string" || !value.includes("T")) {
    return <div>-</div>;
  }

  const timePart = value.split("T")[1];

  return <div>{timePart}</div>;
};

export const generateDateWithTime = (value: any) => {
  return (
    <div>
      {value === null || value === 0 || value === "0" ? (
        "-"
      ) : (
        <>
          {value.split("T")[0].split("-")[1]}-
          {value.split("T")[0].split("-")[2]}-
          {value.split("T")[0].split("-")[0]}
          &nbsp;
          {value.split("T")[1]}
        </>
      )}
    </div>
  );
};

export const generateSecondsToHHMMSS = (value: number | null) => {
  if (value === null) {
    return <div>-</div>;
  }
  const hours = Math.floor(value / 3600);
  const remainingSeconds = value % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const remainingSecondsFinal = remainingSeconds % 60;

  const hoursStr = hours.toString().padStart(2, "0");
  const minsStr = minutes.toString().padStart(2, "0");
  const secsStr = remainingSecondsFinal.toString().padStart(2, "0");

  return (
    <div>
      {value === null ? (
        "-"
      ) : (
        <>
          {hoursStr}:{minsStr}:{secsStr}
        </>
      )}
    </div>
  );
};

export const getTagDataForReport = (bodyValue: any) => {
  return !!bodyValue && bodyValue.length <= 0 ? (
    "-"
  ) : (
    <div className="flex items-center justify-start gap-2">
      {!!bodyValue &&
        bodyValue.map((item: string, index: number) => (
          <div
            key={index}
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: "#e0e0e0",
              borderRadius: "12px",
              padding: "4px 8px",
              fontSize: "14px",
              cursor: "default",
            }}
          >
            <span>{item}</span>
          </div>
        ))}
    </div>
  );
};

export const generateBillingStatusBodyRender = (bodyValue: any) => {
  return (
    <div className="ml-2">
      {bodyValue === null || bodyValue === ""
        ? "-"
        : bodyValue === true
        ? "Active"
        : "Inactive"}
    </div>
  );
};

export const generateParentProcessBodyRender = (bodyValue: any) => {
  const shortProcessName = bodyValue && bodyValue.split(" ");
  return (
    <div className="font-semibold">
      {bodyValue === null || bodyValue === "" ? (
        "-"
      ) : (
        <ColorToolTip title={bodyValue} placement="top">
          {shortProcessName[0]}
        </ColorToolTip>
      )}
    </div>
  );
};

export const generateDaysBodyRender = (bodyValue: any) => {
  return (
    <div className="ml-2">
      {bodyValue === null || bodyValue === "" ? "-" : bodyValue}&nbsp;
      {bodyValue > 1 ? "days" : "day"}
    </div>
  );
};

export const generateStringValue = (value: boolean, type: string) => {
  return (
    <>
      {type === "IsBillable" ? (
        <div>{value ? "Billable" : "Non-Billable"}</div>
      ) : (
        <div>{value ? "Productive" : "Non-Productive"}</div>
      )}
    </>
  );
};

export const generateRatingsBodyRender = (bodyValue: any) => {
  return <Rating name="read-only" value={bodyValue} readOnly />;
};

export const generateIsLoggedInBodyRender = (bodyValue: any) => {
  return bodyValue === 0 ? <div>No</div> : bodyValue === 1 && <div>Yes</div>;
};

export const handleChangePage = (
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  newPage: number,
  setPage: React.Dispatch<React.SetStateAction<number>>
) => {
  setPage(newPage);
};

export const handleChangeRowsPerPage = (
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>,
  setPage: React.Dispatch<React.SetStateAction<number>>
) => {
  setRowsPerPage(parseInt(event.target.value));
  setPage(0);
};

export const handlePageChangeWithFilter = (
  newPage: number,
  setPage: React.Dispatch<React.SetStateAction<number>>,
  setFilteredObject: React.Dispatch<React.SetStateAction<any>>
) => {
  setPage(newPage);
  setFilteredObject((prevState: any) => ({
    ...prevState,
    PageNo: newPage + 1,
  }));
};

export const handleChangeRowsPerPageWithFilter = (
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>,
  setPage: React.Dispatch<React.SetStateAction<number>>,
  setFilteredObject: React.Dispatch<React.SetStateAction<any>>
) => {
  const pageSize = parseInt(event.target.value);

  setRowsPerPage(pageSize);
  setPage(0);
  setFilteredObject((prevState: any) => ({
    ...prevState,
    PageNo: 1,
    PageSize: pageSize,
  }));
};
