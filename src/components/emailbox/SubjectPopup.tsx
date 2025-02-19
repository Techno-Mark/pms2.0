import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Avatar } from "@mui/material";
import Feedback from "@/assets/icons/Feedback";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { callAPI } from "@/utils/API/callAPI";

const Red = ["A", "F", "K", "P", "U", "Z"];
const Blue = ["B", "G", "L", "Q", "V"];
const Green = ["C", "H", "M", "R", "W"];
const SkyBlue = ["D", "I", "N", "S", "X"];

interface Response {
  TicketId: number;
  FromId: number | null;
  UserName: string;
  EmailFrom: string | null;
  To: string | null;
  CC: string | null;
  BCC: string | null;
  ReceivedOn: string;
  PastTime: string;
  PreviewText: string;
}

interface SubjectPopupProps {
  value: string;
  shortProcessName: string;
  tableMeta: any;
  handleDrawerOpen?: () => void;
  getId?: (id: number, lastItem: any) => void;
  isDrawerOpen?: boolean;
  isBold?: boolean;
}

const SubjectPopup: React.FC<SubjectPopupProps> = ({
  value,
  shortProcessName,
  tableMeta,
  handleDrawerOpen,
  isDrawerOpen = true,
  getId,
  isBold = false,
}) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const feedbackRef = useRef<HTMLSpanElement | null>(null);
  const [feedbackPosition, setFeedbackPosition] = useState<{
    top: number;
    left: number;
  }>({
    top: 0,
    left: 0,
  });
  const [data, setData] = useState<Response | null>(null);

  useEffect(() => {
    if (feedbackRef.current) {
      const rect = feedbackRef.current.getBoundingClientRect();
      setFeedbackPosition({
        top:
          rect.top -
          (tableMeta.rowIndex <= 2
            ? 0
            : tableMeta.rowIndex >= 3 && tableMeta.rowIndex <= 4
            ? 120
            : tableMeta.rowIndex >= 5 && tableMeta.rowIndex <= 6
            ? 180
            : 200),
        left: rect.left + 20,
      });
    }
  }, [hoveredRow]);

  const getData = (id: number) => {
    const url = `${process.env.emailbox_api_url}/emailbox/getLastTrailPlainBody`;

    const successCallback = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setData(ResponseData);
      } else {
        setData(null);
      }
    };

    callAPI(url, { TicketId: id }, successCallback, "post");
  };

  return (
    <>
      <div className="ml-2">
        {!value || value === "0" || value === "null" ? (
          "-"
        ) : (
          <div className="flex items-center justify-start group">
            {value.length > 20 ? (
              <ColorToolTip title={value} placement="top">
                <span
                  className={`${
                    isDrawerOpen ? "text-[#0592C6] cursor-pointer" : ""
                  } ${
                    isBold && !tableMeta.rowData[tableMeta.rowData.length - 5]
                      ? "font-bold"
                      : ""
                  }`}
                  onClick={() => {
                    if (isDrawerOpen) {
                      handleDrawerOpen?.();
                      getId?.(
                        tableMeta.rowData[0],
                        tableMeta.rowData[tableMeta.rowData.length - 1]
                      );
                    }
                  }}
                >
                  {shortProcessName}...
                </span>
              </ColorToolTip>
            ) : (
              <span
                className={`${
                  isDrawerOpen ? "text-[#0592C6] cursor-pointer" : ""
                } ${
                  isBold && !tableMeta.rowData[tableMeta.rowData.length - 5]
                    ? "font-bold"
                    : ""
                }`}
                onClick={() => {
                  if (isDrawerOpen) {
                    handleDrawerOpen?.();
                    getId?.(
                      tableMeta.rowData[0],
                      tableMeta.rowData[tableMeta.rowData.length - 1]
                    );
                  }
                }}
              >
                {shortProcessName}
              </span>
            )}
            <span
              ref={feedbackRef}
              className={`text-gray-500 ml-3 transition-opacity duration-200 ${
                hoveredRow !== null
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}
              onMouseEnter={() => {
                setHoveredRow(tableMeta.rowData[0]);
                getData(tableMeta.rowData[0]);
              }}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <Feedback />
            </span>
          </div>
        )}
      </div>

      {hoveredRow === tableMeta.rowData[0] &&
        data &&
        ReactDOM.createPortal(
          <div
            className="absolute z-50 text-start text-gray-500 p-4 rounded-lg shadow-xl bg-white w-[50%]"
            style={{
              top: feedbackPosition.top,
              left: feedbackPosition.left,
              position: "absolute",
            }}
            onMouseEnter={() => setHoveredRow(tableMeta.rowData[0])} // Keep it visible
            onMouseLeave={() => setHoveredRow(null)} // Hide when mouse leaves
          >
            <div className="w-full rounded-lg flex items-start justify-start p-4 gap-4">
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  fontSize: 14,
                  bgcolor: Red.includes(data.UserName.toUpperCase().charAt(0))
                    ? "#DC3545"
                    : Blue.includes(data.UserName.charAt(0))
                    ? "#0A58CA"
                    : Green.includes(data.UserName.charAt(0))
                    ? "#02B89D"
                    : SkyBlue.includes(data.UserName.charAt(0))
                    ? "#333333"
                    : "#664D03",
                }}
              >
                {data.UserName.split(" ")
                  .map((word: string) => word.charAt(0).toUpperCase())
                  .join("")}
              </Avatar>
              <div
                className="flex flex-col items-start justify-center gap-1 w-full max-w-[95%]"
                style={{
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                <div className="flex items-start justify-between mb-1 w-full">
                  <p
                    className={`flex gap-1 ${
                      data.UserName.length > 20 ? "flex-col" : "gap-2"
                    }`}
                  >
                    <b>{data.UserName}</b>
                    <span>{data.ReceivedOn}</span>
                  </p>
                </div>
                {!!data.EmailFrom && (
                  <p>
                    <b>From:</b> {data.EmailFrom}
                  </p>
                )}
                {!!data.To && (
                  <p>
                    <b>To:</b> {data.To}
                  </p>
                )}
                {!!data.CC && (
                  <p>
                    <b>Cc:</b> {data.CC}
                  </p>
                )}
                {!!data.BCC && (
                  <p>
                    <b>Bcc:</b> {data.BCC}
                  </p>
                )}
                <p className="w-full">
                  {!!data.PreviewText && data.PreviewText.trim().length > 0 ? (
                    <>
                      {data.PreviewText}
                      <p
                        className="text-secondary cursor-pointer"
                        onClick={() => {
                          if (isDrawerOpen) {
                            handleDrawerOpen?.();
                            getId?.(
                              tableMeta.rowData[0],
                              tableMeta.rowData[tableMeta.rowData.length - 1]
                            );
                            setHoveredRow(null);
                          }
                        }}
                      >
                        View more...
                      </p>
                    </>
                  ) : (
                    "No preview available."
                  )}
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default SubjectPopup;
