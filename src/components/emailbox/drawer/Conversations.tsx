/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import EmailTemplate from "@/assets/icons/emailBox/EmailTemplate";
import Forward from "@/assets/icons/emailBox/Forward";
import ReplayAll from "@/assets/icons/emailBox/ReplayAll";
import Reply from "@/assets/icons/emailBox/Reply";
import ThreeDot from "@/assets/icons/emailBox/ThreeDot";
import RichTextEditor from "@/components/common/RichTextEditor";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { Avatar, Button } from "@mui/material";
import MemberInput from "@/components/common/MemberInput";
import { getTextLength } from "@/utils/commonFunction";
import { callAPI } from "@/utils/API/callAPI";
import { toast } from "react-toastify";
import { CommentAttachment } from "@/utils/Types/worklogsTypes";
import { Close, Download } from "@mui/icons-material";
import FileIcon from "@/components/common/FileIcon";
import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";
import Loading from "@/assets/icons/reports/Loading";
import { getFileFromBlob } from "@/utils/downloadFile";

interface conversationAttachment {
  AttachmentId: number;
  UserFileName: string;
  SystemFileName: string;
  Type: number;
  ReferenceId: number;
  Path: string;
  WorkItemId: number;
}

interface conversationData {
  TrailId: number;
  From: string;
  To: string | null;
  CC: string | null;
  BCC: string | null;
  Subject: string;
  Body: string;
  isHTML: boolean;
  ReceivedOn: string;
  MessageId: string;
  Attachments: conversationAttachment[];
  Type: number;
  FromUser: string;
}

const Red = ["A", "F", "K", "P", "U", "Z"];
const Blue = ["B", "G", "L", "Q", "V"];
const Green = ["C", "H", "M", "R", "W"];
const SkyBlue = ["D", "I", "N", "S", "X"];

export interface ConversationDataContenRef {
  clearConversationData: () => void;
}

const Conversations = forwardRef<
  ConversationDataContenRef,
  {
    activeTab: number;
    ticketId: number;
    setOverlayOpen: any;
    getTicketDetails: () => void;
    ticketDetails: {
      Assignee: string;
      Status: number;
      DueDate: string;
      EmailType: number;
      Priority: number;
      Tags: string[];
      Subject: string;
      RemainingSyncTime: number;
      AttachmentCount: number;
      RMUser: number;
      OriginalMessgeId: string;
    };
  }
>(
  (
    { activeTab, ticketId, setOverlayOpen, getTicketDetails, ticketDetails },
    ref
  ) => {
    const placeholders = ["Edit Draft", "Discard Draft", "Send Draft"];
    const [active, setActive] = useState(0);
    const [trailId, setTrailId] = useState(0);
    const [showPopup, setShowPopup] = useState(0);
    const conversationEndRef = useRef<HTMLDivElement | null>(null);
    const popupRef: any = useRef(null);
    const buttonRef: any = useRef(null);
    const isCalledRef = useRef(false);
    const [toMembers, setToMembers] = useState<string[]>([]);
    const [toInputValue, setToInputValue] = useState("");
    const [toInputValueError, setToInputValueError] = useState("");
    const [ccMembers, setCcMembers] = useState<string[]>([]);
    const [ccInputValue, setCcInputValue] = useState("");
    const [ccInputValueError, setCcInputValueError] = useState("");
    const [bccMembers, setBccMembers] = useState<string[]>([]);
    const [bccInputValue, setBccInputValue] = useState("");
    const [bccInputValueError, setBccInputValueError] = useState("");
    const [text, setText] = useState("");
    const [textError, setTextError] = useState(false);
    const [data, setData] = useState<conversationData[]>([]);
    const [sending, setSending] = useState(false);
    const [conversationAttachment, setConversationAttachment] = useState<any>(
      []
    );

    const getConversationData = () => {
      const url = `${process.env.emailbox_api_url}/emailbox/GetTicketDetails`;

      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setData(ResponseData.ConversationDetails);
        } else {
          setData([]);
        }
      };

      callAPI(
        url,
        {
          TicketId: ticketId,
          TabId: 1,
          AttachmentType: 0,
        },
        successCallback,
        "post"
      );
    };

    useEffect(() => {
      if (activeTab === 1 && !isCalledRef.current) {
        getConversationData();
        isCalledRef.current = true;
      }
    }, [activeTab]);

    useEffect(() => {
      if (data.length > 0) {
        conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }, [data]);

    const handleOutsideClick = (e: any) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setShowPopup(0);
      }
    };

    useEffect(() => {
      if (showPopup) {
        document.addEventListener("click", handleOutsideClick);
      } else {
        document.removeEventListener("click", handleOutsideClick);
      }
      return () => document.removeEventListener("click", handleOutsideClick);
    }, [showPopup]);

    const validateMailData = () => {
      let valid = false;
      if (toMembers.length <= 0) {
        setToInputValueError("Please provide an email address.");
        valid = true;
      }
      if (
        getTextLength(text.trim()) <= 0 ||
        getTextLength(text.trim()) > 5000
      ) {
        setTextError(true);
        valid = true;
      }
      return valid;
    };

    const handleImageChange = async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const files = event.target.files;
      if (!files) return;

      const uuidv4 = () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (c) {
            const r = (Math.random() * 16) | 0,
              v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          }
        );
      };

      Array.from(files).forEach((file) => {
        const fileSizeInMB = parseFloat((file.size / 1024 / 1024).toFixed(2));

        if (fileSizeInMB > 5) {
          toast.warning(`File ${file.name} exceeds the 5MB limit.`);
          return;
        }

        const fileName = uuidv4().slice(0, 32);
        const attachment = {
          Type: 3,
          AttachmentId: 0,
          WorkItemId: ticketId,
          ReferenceId: trailId,
          UserFileName: file.name,
          SystemFileName: fileName,
          Path: process.env.emailAttachment || "",
          uploading: true,
        };

        // Push the attachment immediately
        setConversationAttachment((prevAttachments: any) => [
          ...prevAttachments,
          attachment,
        ]);

        // Start the upload
        uploadFileToBlob(file, fileName)
          .then((response: any) => {
            if (response.status === 201) {
            }
          })
          .catch((error) => {
            console.error(`Error uploading file ${file.name}:`, error);
          })
          .finally(() => {
            setConversationAttachment((prevAttachments: any) =>
              prevAttachments.map((att: CommentAttachment) =>
                att.SystemFileName === fileName
                  ? { ...att, uploading: false }
                  : att
              )
            );
          });
      });
    };

    const uploadFileToBlob = useCallback(
      async (file: any | null, newFileName: string) => {
        const storageAccount = process.env.storageName;
        const containerName: any = process.env.emailAttachment;
        const sasToken = process.env.sasToken;

        const blobServiceClient = new BlobServiceClient(
          `https://${storageAccount}.blob.core.windows.net?${sasToken}`
        );
        const containerClient =
          blobServiceClient.getContainerClient(containerName);

        const blockBlobClient: BlockBlobClient =
          containerClient.getBlockBlobClient(newFileName);

        await blockBlobClient
          .uploadData(file, {
            blobHTTPHeaders: { blobContentType: file.type },
          })
          .then(async () => {})
          .catch((err) => console.error("err", err));
      },
      []
    );

    const handleSubmitMail = () => {
      if (
        !!toInputValueError ||
        !!ccInputValueError ||
        !!bccInputValueError ||
        textError ||
        validateMailData()
      )
        return;

      setSending(true);
      setOverlayOpen(true);

      const url = `${process.env.emailbox_api_url}/emailbox/sendemail`;

      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          handleClearMailData();
          toast.success("Email sent successfully.");
          getConversationData();
          setOverlayOpen(false);
          getTicketDetails();
        } else {
          toast.error("Please try again later.");
          setSending(false);
          setOverlayOpen(false);
        }
      };

      callAPI(
        url,
        {
          OriginalMessageId: ticketDetails.OriginalMessgeId,
          InReplyTo: data[active - 1].MessageId,
          To: toMembers.join(","),
          CC: ccMembers.join(","),
          BCC: bccMembers.join(","),
          Subject: data[active - 1].Subject,
          IsHtml: true,
          MailBody: text,
          TicketAttachments: conversationAttachment,
        },
        successCallback,
        "post"
      );
    };

    const handleClearMailData = (change: boolean = true) => {
      change && setActive(0);
      setTrailId(0);
      setToMembers([]);
      setToInputValue("");
      setToInputValueError("");
      setCcMembers([]);
      setCcInputValue("");
      setCcInputValueError("");
      setBccMembers([]);
      setBccInputValue("");
      setBccInputValueError("");
      setText("");
      setTextError(false);
      setSending(false);
      change && setConversationAttachment([]);
    };

    const clearConversationData = async () => {
      await handleClearMailData();
    };

    useImperativeHandle(ref, () => ({
      clearConversationData,
    }));

    useEffect(() => {
      handleClearMailData();
    }, [activeTab]);

    useEffect(() => {
      handleClearMailData(false);
      if (active > 0) {
        setToMembers(data[active - 1].From?.split(",") || []);
        setCcMembers(data[active - 1].CC?.split(",") || []);
        setBccMembers(data[active - 1].BCC?.split(",") || []);
      }
    }, [active, trailId]);

    return (
      <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto bg-gray-100">
        {data.map((i: conversationData, index: number) => (
          <div key={index}>
            {active > 0 && active - 1 === index && (
              <div className="bg-white px-2 rounded-lg">
                <p className="py-2 px-4">Email Reply</p>
                <MemberInput
                  label="To"
                  members={toMembers}
                  setMembers={setToMembers}
                  inputValue={toInputValue}
                  setInputValue={setToInputValue}
                  error={toInputValueError}
                  setError={setToInputValueError}
                />
                <MemberInput
                  label="Cc"
                  members={ccMembers}
                  setMembers={setCcMembers}
                  inputValue={ccInputValue}
                  setInputValue={setCcInputValue}
                  error={ccInputValueError}
                  setError={setCcInputValueError}
                />
                <MemberInput
                  label="Bcc"
                  members={bccMembers}
                  setMembers={setBccMembers}
                  inputValue={bccInputValue}
                  setInputValue={setBccInputValue}
                  error={bccInputValueError}
                  setError={setBccInputValueError}
                />
                <RichTextEditor
                  text={text}
                  setText={setText}
                  textError={textError}
                  setTextError={setTextError}
                  height="120px"
                  addImage
                  handleImageChange={handleImageChange}
                />
                {conversationAttachment.length > 0 && (
                  <div className="flex flex-col items-start justify-center ml-5 gap-2 mt-4">
                    {conversationAttachment.map(
                      (attachment: any, index: number) => (
                        <div
                          className="flex items-center justify-center gap-2 border rounded-full py-1.5 px-4"
                          key={index}
                        >
                          <FileIcon fileName={attachment?.UserFileName} />
                          {attachment?.UserFileName}
                          {attachment?.uploading ? (
                            <Loading />
                          ) : (
                            <span
                              className="cursor-pointer"
                              onClick={() =>
                                setConversationAttachment(
                                  conversationAttachment.filter(
                                    (_: any, attachmentIndex: number) =>
                                      attachmentIndex !== index
                                  )
                                )
                              }
                            >
                              <Close />
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
                <div className="flex items-center justify-end gap-4 py-4 border-b">
                  <Button
                    variant="outlined"
                    color="error"
                    className="rounded-[4px] !h-[36px]"
                    onClick={() => handleClearMailData()}
                  >
                    <span className="flex items-center justify-center px-[5px]">
                      Cancel
                    </span>
                  </Button>
                  <Button
                    variant="contained"
                    className="rounded-[4px] !h-[36px] !bg-secondary cursor-pointer"
                    onClick={() => {}}
                  >
                    <span className="flex items-center justify-center px-[5px]">
                      Save as Draft
                    </span>
                  </Button>
                  <Button
                    variant="outlined"
                    className={`rounded-[4px] !h-[36px] ${
                      (conversationAttachment.length > 0 &&
                        conversationAttachment.filter(
                          (attachment: any) => attachment.uploading
                        ).length > 0) ||
                      sending
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={() =>
                      sending ||
                      (conversationAttachment.length > 0 &&
                        conversationAttachment.filter(
                          (attachment: any) => attachment.uploading
                        ).length > 0)
                        ? undefined
                        : handleSubmitMail()
                    }
                    disabled={
                      (conversationAttachment.length > 0 &&
                        conversationAttachment.filter(
                          (attachment: any) => attachment.uploading
                        ).length > 0) ||
                      sending
                    }
                  >
                    <span className="flex items-center justify-center px-[5px]">
                      Sent Email
                    </span>
                  </Button>
                </div>
              </div>
            )}
            <div className="bg-white rounded-lg flex items-start justify-start p-4 gap-4">
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  fontSize: 14,
                  bgcolor: Red.includes(i.FromUser.toUpperCase().charAt(0))
                    ? "#DC3545"
                    : Blue.includes(i.FromUser.charAt(0))
                    ? "#0A58CA"
                    : Green.includes(i.FromUser.charAt(0))
                    ? "#02B89D"
                    : SkyBlue.includes(i.FromUser.charAt(0))
                    ? "#333333"
                    : "#664D03",
                }}
              >
                {i.FromUser.split(" ")
                  .map((word: string) => word.charAt(0).toUpperCase())
                  .join("")}
              </Avatar>
              <div className="flex flex-col items-start justify-center w-full">
                <div className="flex items-center justify-between mb-1 w-full">
                  <p className="gap-2 flex">
                    <b>{i.FromUser}</b>
                    <span>{i.ReceivedOn}</span>
                  </p>
                  <div className="flex items-center justify-center gap-3 relative">
                    <ColorToolTip title="Email Template" placement="top" arrow>
                      <p className="cursor-pointer">
                        <EmailTemplate />
                      </p>
                    </ColorToolTip>
                    {/* <ColorToolTip title="Reply" placement="top" arrow>
                    <p
                      className="cursor-pointer"
                      onClick={() => {
                        setActive(index + 1);
                        setTrailId(i.TrailId);
                      }}
                    >
                      <Reply />
                    </p>
                  </ColorToolTip> */}
                    <ColorToolTip title="ReplyAll" placement="top" arrow>
                      <p
                        className="cursor-pointer"
                        onClick={() => {
                          setActive(index + 1);
                          setTrailId(i.TrailId);
                          setConversationAttachment([]);
                        }}
                      >
                        <ReplayAll />
                      </p>
                    </ColorToolTip>
                    <ColorToolTip title="Forward" placement="top" arrow>
                      <p
                        className="cursor-pointer"
                        onClick={() => {
                          setActive(index + 1);
                          setTrailId(i.TrailId);
                          setConversationAttachment(
                            !!i.Attachments ? i.Attachments : []
                          );
                        }}
                      >
                        <Forward />
                      </p>
                    </ColorToolTip>
                    <p
                      className="cursor-pointer"
                      onClick={() => setShowPopup(i.TrailId)}
                      ref={buttonRef}
                    >
                      <ThreeDot />
                    </p>
                    {i.TrailId === showPopup && (
                      <div
                        ref={popupRef}
                        style={{
                          position: "absolute",
                          top: 30,
                          right: 0,
                          background: "#fff",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                          padding: "10px",
                          zIndex: 10,
                          width: "80%",
                        }}
                      >
                        <ul
                          style={{
                            listStyle: "none",
                            margin: 0,
                            padding: 0,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "2px",
                          }}
                        >
                          {placeholders.map(
                            (placeholder: string, index: number) => (
                              <li
                                key={index}
                                className="hover:bg-gray-100 rounded-lg text-sm w-full py-1 px-2"
                                onClick={() => {
                                  setShowPopup(0);
                                }}
                              >
                                {placeholder}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <p>From: {i.From}</p>
                {i.Type !== 2 && <p>To: {i.To}</p>}
                {!!i.CC && <p>Cc: {i.CC}</p>}
                {!!i.BCC && <p>Bcc: {i.BCC}</p>}
                <p>Subject: {i.Subject}</p>
                <p
                  className="mt-2"
                  dangerouslySetInnerHTML={{
                    __html: i.Body,
                  }}
                />
                {!!i.Attachments &&
                  i.Attachments.length > 0 &&
                  i.Attachments.map((attachment: any, index: number) => (
                    <div
                      className="flex items-center justify-start gap-2 w-fit mt-2 border rounded-full py-2 px-4"
                      key={index}
                    >
                      <FileIcon fileName={attachment?.UserFileName} />
                      {attachment?.UserFileName}
                      <span
                        className="cursor-pointer"
                        onClick={() =>
                          getFileFromBlob(
                            attachment?.SystemFileName,
                            attachment?.UserFileName,
                            true
                          )
                        }
                      >
                        <Download />
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div ref={conversationEndRef} />
          </div>
        ))}
      </div>
    );
  }
);

export default Conversations;
