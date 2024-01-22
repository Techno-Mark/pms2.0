import { Rating } from "@mui/material";
import React from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";

export const generateCustomHeaderName = (headerName: string) => {
  return <span className="font-extrabold capitalize">{headerName}</span>;
};

export const generateCommonBodyRender = (bodyValue: any) => {
  return (
    <div className="ml-2">
      {!bodyValue || bodyValue === "0" ? "-" : bodyValue}
    </div>
  );
};

export const generateDashboardReportBodyRender = (bodyValue: any) => {
  return <div className="ml-2">{bodyValue === "" ? "-" : bodyValue}</div>;
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
        <div className="inline-block mr-1">
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

export const generateStatusWithColor = (value: any, rowIndex: any) => {
  const statusColorCode = rowIndex;

  return (
    <div>
      {value === null || value === "" || value === 0 || value === "0" ? (
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

export const generateRatingsBodyRender = (bodyValue: any) => {
  return <Rating name="read-only" value={bodyValue} readOnly />;
};

export const generateIsLoggedInBodyRender = (bodyValue: any) => {
  return bodyValue === 0 ? <div>No</div> : bodyValue === 1 && <div>Yes</div>;
};

export const generateCustomeTaskIdwithErrorLogs = (
  bodyValue: any,
  TableMeta: any,
  RowIndex: number
) => {
  const IsHasErrorlog = TableMeta.rowData[RowIndex];

  return (
    <div>
      {IsHasErrorlog && (
        <div
          className={
            "w-[10px] h-[10px] rounded-full inline-block mr-2 bg-defaultRed"
          }
        ></div>
      )}
      {bodyValue === null || bodyValue === "" ? "-" : bodyValue}
    </div>
  );
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
