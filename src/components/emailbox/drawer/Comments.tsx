import SendIcon from "@/assets/icons/worklogs/SendIcon";
import FileIcon from "@/components/common/FileIcon";
import FileIconUpload from "@/assets/icons/worklogs/FileIcon";
import OverLay from "@/components/common/OverLay";
import { callAPI } from "@/utils/API/callAPI";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { getFileFromBlob } from "@/utils/downloadFile";
import { LabelValue } from "@/utils/Types/types";
import { CommentAttachment } from "@/utils/Types/worklogsTypes";
import mentionsInputStyle from "@/utils/worklog/mentionsInputStyle";
import { Close, Download, Edit, Save } from "@mui/icons-material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Mention, MentionsInput } from "react-mentions";
import { toast } from "react-toastify";
import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";
import Loading from "@/assets/icons/reports/Loading";
import { getCommentUserDropdownData } from "@/utils/commonDropdownApiCall";
import { Avatar } from "@mui/material";
import { extractText } from "@/utils/commonFunction";

const Red = ["A", "F", "K", "P", "U", "Z"];
const Blue = ["B", "G", "L", "Q", "V"];
const Green = ["C", "H", "M", "R", "W"];
const SkyBlue = ["D", "I", "N", "S", "X"];

interface CommentsData {
  IsEdited: boolean;
  SubmitedByName: string;
  SubmitedOn: string;
  UpdatedOn: string | null;
  UpdatedBy: string | null;
  CommentId: number;
  TicketId: number;
  SubmitBy: number;
  Message: string;
  TaggedUsers: string | null;
  Attachments:
    | {
        IsRemoved: boolean;
        UserFileName: string | null;
        SystemFileName: string | null;
        AttachmentPath: string | null;
        AttachmentId: number | null;
      }[]
    | null;
}

const Comments = ({
  activeTab,
  ticketId,
  clientId,
}: {
  activeTab: number;
  ticketId: number;
  clientId: number;
}) => {
  const isCalledRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefEdit = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement | null>(null);
  const [commentUserData, setCommentUserData] = useState<LabelValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [valueError, setValueError] = useState(false);
  const [mention, setMention] = useState<any>([]);
  const [commentAttachment, setCommentAttachment] = useState<
    CommentAttachment[]
  >([]);
  const [commentData, setCommentData] = useState<CommentsData[]>([]);
  const [valueEdit, setValueEdit] = useState("");
  const [valueEditError, setValueEditError] = useState(false);
  const [editComment, setEditComment] = useState(0);
  const [editMention, setEditMention] = useState<any>([]);
  const [editCommentAttachment, setEditCommentAttachment] = useState<any>([]);

  useEffect(() => {
    const getData = async () => {
      setCommentUserData(
        await getCommentUserDropdownData({
          ClientId: clientId,
          GetClientUser: false,
        })
      );
    };

    getData();
  }, []);

  const handleCommentChangeWorklogs = (e: string) => {
    setEditMention(
      e
        .split("(")
        .map((i: string) => {
          if (i.includes(")")) {
            const parsedValue = parseInt(i.split(")")[0]);
            return isNaN(parsedValue) ? null : parsedValue;
          }
        })
        .filter((i: any) => i !== undefined && i !== null)
    );
    setValueEditError(false);
  };

  const users: { id: number; display: string }[] =
    commentUserData?.length > 0
      ? commentUserData.map((i: LabelValue) => ({
          id: i.value,
          display: i.label,
        }))
      : [];

  const handleCommentChange = (e: string) => {
    setMention(
      e
        .split("(")
        .map((i: string) => {
          if (i.includes(")")) {
            const parsedValue = parseInt(i.split(")")[0]);
            return isNaN(parsedValue) ? null : parsedValue;
          }
        })
        .filter((i: any) => i !== undefined && i !== null)
    );
    setValueError(false);
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean
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
        AttachmentId: 0,
        UserFileName: file.name,
        SystemFileName: fileName,
        AttachmentPath: process.env.emailAttachment || "",
        uploading: true,
        IsRemoved: false,
      };

      (isEdit ? setEditCommentAttachment : setCommentAttachment)(
        (prevAttachments: any) => [...prevAttachments, attachment]
      );

      uploadFileToBlob(file, fileName)
        .then((response: any) => {
          if (response.status === 201) {
          }
        })
        .catch((error) => {
          console.error(`Error uploading file ${file.name}:`, error);
        })
        .finally(() => {
          (isEdit ? setEditCommentAttachment : setCommentAttachment)(
            (prevAttachments: any) =>
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

  const getCommentData = async () => {
    const url = `${process.env.emailbox_api_url}/emailbox/GetTicketDetails`;
    const successCallback = (
      ResponseData: { CommentDetails: CommentsData[] },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setCommentData(ResponseData.CommentDetails);
      } else {
        setCommentData([]);
      }
    };
    callAPI(
      url,
      {
        TicketId: ticketId,
        TabId: 2,
        AttachmentType: 0,
        FromDate: null,
        ToDate: null,
      },
      successCallback,
      "POST"
    );
  };

  useEffect(() => {
    if (activeTab === 2 && !isCalledRef.current) {
      getCommentData();
      isCalledRef.current = true;
    }
  }, [activeTab]);

  useEffect(() => {
    if (commentData.length > 0) {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [commentData]);

  const handleSubmitComment = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setValueError(value.trim().length < 5);

    if (value.trim().length >= 5 && !valueError) {
      setLoading(true);
      const params = {
        CommentId: 0,
        TicketId: ticketId,
        SubmitBy: Number(localStorage.getItem("UserId")),
        Message: value,
        TaggedUsers: mention.length > 0 ? mention.join(", ") : null,
        Attachments: commentAttachment.length > 0 ? commentAttachment : null,
      };
      const url = `${process.env.emailbox_api_url}/emailbox/SaveTicketComment`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success(`Comment sent successfully.`);
          setMention([]);
          setCommentAttachment([]);
          setValue("");
          getCommentData();
          setLoading(false);
        }
        setLoading(false);
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  const handleSaveComment = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setValueEditError(valueEdit.trim().length < 1);

    if (valueEdit.trim().length >= 1 && !valueEditError) {
      setLoading(true);
      const params = {
        CommentId: editComment,
        TicketId: ticketId,
        SubmitBy: Number(localStorage.getItem("UserId")),
        Message: valueEdit,
        TaggedUsers: editMention.length > 0 ? editMention.join(", ") : null,
        Attachments:
          editCommentAttachment.length > 0 ? editCommentAttachment : null,
      };
      const url = `${process.env.emailbox_api_url}/emailbox/SaveTicketComment`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success(`Comment saved successfully.`);
          setEditComment(0);
          setEditCommentAttachment([]);
          setValueEdit("");
          setValueEditError(false);
          setEditMention([]);
          getCommentData();
          setLoading(false);
        }
        setLoading(false);
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  useEffect(() => {
    setValue("");
    setValueError(false);
    setMention([]);
    setCommentAttachment([]);
    setValueEdit("");
    setValueEditError(false);
    setEditComment(0);
    setEditCommentAttachment([]);
    setEditMention([]);
    setCommentUserData([]);
    setLoading(false);
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-4 h-full bg-gray-100">
      {commentData.length > 0 ? (
        <div className="flex-grow pt-3 px-4 mb-2 h-[85%] overflow-y-auto flex flex-col items-start justify-start gap-4">
          {commentData.map((comment: CommentsData, index: number) => (
            <div
              className="bg-white rounded-lg flex flex-col items-start justify-between p-4 gap-4 w-full"
              key={index}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      fontSize: 14,
                      bgcolor: Red.includes(
                        comment.SubmitedByName.toUpperCase().charAt(0)
                      )
                        ? "#DC3545"
                        : Blue.includes(comment.SubmitedByName.charAt(0))
                        ? "#0A58CA"
                        : Green.includes(comment.SubmitedByName.charAt(0))
                        ? "#02B89D"
                        : SkyBlue.includes(comment.SubmitedByName.charAt(0))
                        ? "#333333"
                        : "#664D03",
                    }}
                  >
                    {comment.SubmitedByName.split(" ")
                      .map((word: string) => word.charAt(0).toUpperCase())
                      .join("")}
                  </Avatar>
                  <b>{comment.SubmitedByName}</b>
                  <span>|</span>
                  <span>
                    {!!comment.UpdatedOn
                      ? comment.UpdatedOn
                      : comment.SubmitedOn}
                  </span>
                </div>
                <div className="flex items-center gap-5">
                  {comment.IsEdited && "Edited"}
                  <div
                    className={`flex items-center justify-center gap-3 ${
                      comment.CommentId === editComment &&
                      editCommentAttachment.length > 0 &&
                      editCommentAttachment.filter(
                        (attachment: any) => attachment.uploading
                      ).length > 0
                        ? "cursor-not-allowed"
                        : "cursor-pointer !text-secondary"
                    }`}
                    onClick={(e) => {
                      if (comment.CommentId === editComment) {
                        editCommentAttachment.length > 0 &&
                        editCommentAttachment.filter(
                          (attachment: any) => attachment.uploading
                        ).length > 0
                          ? undefined
                          : handleSaveComment(e);
                      } else {
                        setEditComment(comment.CommentId);
                        setEditMention(
                          !!comment.TaggedUsers
                            ? comment.TaggedUsers.split(",").map((num) =>
                                num.trim()
                              )
                            : []
                        );
                        setValueEdit(comment.Message);
                        setEditCommentAttachment(
                          !!comment.Attachments ? comment.Attachments : []
                        );
                      }
                    }}
                  >
                    {comment.CommentId === editComment ? <Save /> : <Edit />}
                  </div>
                </div>
              </div>
              {comment.CommentId === editComment ? (
                <>
                  <div className="flex items-center justify-between w-full gap-5">
                    <MentionsInput
                      style={mentionsInputStyle}
                      className="!w-[100%] textareaOutlineNoneEdit max-w-[60vw]"
                      value={valueEdit}
                      onChange={(e) => {
                        setValueEdit(e.target.value);
                        setValueEditError(false);
                        handleCommentChangeWorklogs(e.target.value);
                      }}
                      placeholder="Type a next message OR type @ if you want to mention anyone in the message."
                    >
                      <Mention
                        data={users}
                        style={{
                          backgroundColor: "#cee4e5",
                        }}
                        trigger="@"
                      />
                    </MentionsInput>
                    <ColorToolTip title="Attachment" placement="top" arrow>
                      <span
                        className={`text-white cursor-pointer max-w-1 mt-6`}
                        onClick={() => fileInputRefEdit.current?.click()}
                      >
                        <FileIconUpload />
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                          ref={fileInputRefEdit}
                          className="input-field hidden"
                          onChange={(e) => handleImageChange(e, true)}
                          multiple
                        />
                      </span>
                    </ColorToolTip>
                  </div>
                  {editCommentAttachment.length > 0 && (
                    <div className="flex flex-col items-start justify-center ml-5 gap-4 mb-2">
                      {editCommentAttachment
                        .filter((att: CommentAttachment) => !att.IsRemoved)
                        .map((attachment: any, index: number) => (
                          <div
                            className="flex items-center justify-center gap-2 mr-6 border rounded-full py-2 px-4"
                            key={index}
                          >
                            <FileIcon fileName={attachment?.UserFileName} />
                            {attachment?.UserFileName}
                            {attachment?.uploading ? (
                              <div className="!w-fit m-0 p-0">
                                <Loading />
                              </div>
                            ) : (
                              <span
                                className="cursor-pointer"
                                onClick={() =>
                                  setEditCommentAttachment(
                                    editCommentAttachment.map(
                                      (
                                        i: CommentAttachment,
                                        attachmentIndex: number
                                      ) =>
                                        attachmentIndex === index
                                          ? { ...i, IsRemoved: true }
                                          : i
                                    )
                                  )
                                }
                              >
                                <Close />
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="pl-12 ml-2">
                  {extractText(comment.Message).map((i: string) => {
                    const assignee = commentUserData.map(
                      (j: LabelValue) => j.label
                    );
                    return assignee.includes(i) ? (
                      <span className="text-secondary" key={index}>
                        {i}
                      </span>
                    ) : (
                      i
                    );
                  })}
                  {!!comment.Attachments &&
                    comment.Attachments.length > 0 &&
                    comment.Attachments.filter(
                      (attachment) => !attachment.IsRemoved
                    ).map((attachment: any, index: number) => (
                      <div
                        className="flex items-center justify-start gap-2 w-fit mt-2 border rounded-full py-2 px-4"
                        key={index}
                      >
                        <FileIcon fileName={attachment?.UserFileName} />
                        {attachment?.UserFileName}
                        {attachment?.uploading ? (
                          <div className="!w-fit m-0 p-0">
                            <Loading />
                          </div>
                        ) : (
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
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
          {/* Scroll target */}
          <div ref={commentsEndRef} />
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center">
          No comments yet.
        </div>
      )}
      <div className="sticky bottom-2">
        <div className="bg-white border border-slatyGrey gap-2 py-2 rounded-lg my-2 mx-4 px-4 flex items-center justify-center">
          <MentionsInput
            style={mentionsInputStyle}
            className="!w-[92%] textareaOutlineNone"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setValueError(false);
              handleCommentChange(e.target.value);
            }}
            placeholder="Type a next message OR type @ if you want to mention anyone in the message."
          >
            <Mention
              data={users}
              style={{ backgroundColor: "#cee4e5" }}
              trigger="@"
            />
          </MentionsInput>
          <div className="flex flex-col -mt-5">
            <div className="flex">
              <ColorToolTip title="Attachment" placement="top" arrow>
                <span
                  className={`text-white cursor-pointer max-w-1 mt-6`}
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                >
                  <FileIconUpload />
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    ref={fileInputRef}
                    className="input-field hidden"
                    onChange={(e) => handleImageChange(e, false)}
                    multiple // Enable multiple file selection
                  />
                </span>
              </ColorToolTip>
            </div>
          </div>
          <button
            type="button"
            className={`${
              commentAttachment.length > 0 &&
              commentAttachment.filter(
                (attachment: any) => attachment.uploading
              ).length > 0
                ? "cursor-not-allowed"
                : "cursor-pointer !bg-secondary"
            } text-white p-[6px] rounded-md mr-2`}
            onClick={(e) =>
              commentAttachment.length > 0 &&
              commentAttachment.filter(
                (attachment: any) => attachment.uploading
              ).length > 0
                ? undefined
                : handleSubmitComment(e)
            }
          >
            <SendIcon />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {valueError &&
            value.trim().length > 1 &&
            value.trim().length < 5 ? (
              <span className="text-defaultRed text-[14px] ml-20">
                Minimum 5 characters required.
              </span>
            ) : valueError ? (
              <span className="text-defaultRed text-[14px] ml-20">
                This is a required field.
              </span>
            ) : (
              ""
            )}
          </div>
        </div>
        {commentAttachment.length > 0 && (
          <div className="flex flex-col items-start justify-center ml-5 gap-4 mb-2">
            {commentAttachment
              .filter((attachment: CommentAttachment) => !attachment.IsRemoved)
              .map((attachment: any, index: number) => (
                <div
                  className="flex items-center justify-center gap-2 mr-6 border rounded-full py-2 px-4"
                  key={index}
                >
                  <FileIcon fileName={attachment?.UserFileName} />
                  {attachment?.UserFileName}
                  {attachment?.uploading ? (
                    <div className="!w-fit m-0 p-0">
                      <Loading />
                    </div>
                  ) : (
                    <span
                      className="cursor-pointer"
                      onClick={() =>
                        setCommentAttachment(
                          commentAttachment.map(
                            (i: CommentAttachment, attachmentIndex: number) =>
                              attachmentIndex === index
                                ? { ...i, IsRemoved: true }
                                : i
                          )
                        )
                      }
                    >
                      <Close />
                    </span>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
      {loading ? <OverLay className="!-top-[1px] !-left-[1px]" /> : ""}
    </div>
  );
};

export default Comments;
