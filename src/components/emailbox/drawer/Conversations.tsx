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
import EmailTemplateDrawer from "./EmailTemplateDrawer";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";

interface conversationAttachment {
  AttachmentId: number;
  UserFileName: string;
  SystemFileName: string;
  AttachmentType: string;
  Type: number;
  ReferenceId: number;
  Path: string;
  WorkItemId: number;
}

interface conversationData {
  TrailId: number;
  From: string;
  To: string;
  CC: string | null;
  BCC: string | null;
  Subject: string;
  Body: string;
  isHTML: boolean;
  ReceivedOn: string;
  MessageId: string | null;
  InReplyTo: string | null;
  Attachments: conversationAttachment[] | null;
  Type: number;
  FromUser: string;
  IsDraft: boolean;
  IsInReview: boolean;
  HasPermission: boolean;
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
      Assignee: number;
      Status: number;
      DueDate: string;
      EmailType: number;
      Priority: number;
      Tags: string[];
      Subject: string;
      RemainingSyncTime: number;
      AttachmentCount: number;
      ApprovalId: number;
      OriginalMessgeId: string;
    };
    clientId: number;
    activeTabList: number;
    onClose: () => void;
    onDataFetch: (() => void) | null;
    allFieldsFilled: boolean;
  }
>(
  (
    {
      activeTab,
      ticketId,
      setOverlayOpen,
      getTicketDetails,
      ticketDetails,
      clientId,
      activeTabList,
      onClose,
      onDataFetch,
      allFieldsFilled,
    },
    ref
  ) => {
    const draftPlaceholders = ["Edit Draft", "Discard Draft", "Send Draft"];
    const approvalPlaceholders = ["Edit Mail", "Send Mail"];
    const [active, setActive] = useState(0);
    const [activeType, setActiveType] = useState("");
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
    const [openEmailTemplate, setOpenEmailTemplate] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(0);

    const getConversationData = () => {
      const url = `${process.env.emailbox_api_url}/emailbox/GetTicketDetails`;

      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          // setData(ResponseData.ConversationDetails);
          setData([
            {
              TrailId: 63,
              From: "varun.vataliya@technomark.io",
              To: "",
              MessageId:
                "PN3PPF6ED4D0A96CF1AA3D38CB93E241E0293F72@PN3PPF6ED4D0A96.INDPRD01.PROD.OUTLOOK.COM",
              CC: "bhumika.vyas@technomark.io",
              BCC: null,
              Subject: "Test Bank Statement05-02-2025",
              Body: '<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">\r\n<head>\r\n<meta http-equiv="Content-Type" content="text/html; charset=us-ascii">\r\n<meta name="Generator" content="Microsoft Word 15 (filtered medium)">\r\n<!--[if !mso]><style>v\\:* {behavior:url(#default#VML);}\r\no\\:* {behavior:url(#default#VML);}\r\nw\\:* {behavior:url(#default#VML);}\r\n.shape {behavior:url(#default#VML);}\r\n</style><![endif]--><style><!--\r\n/* Font Definitions */\r\n@font-face\r\n\t{font-family:Shruti;\r\n\tpanose-1:2 0 5 0 0 0 0 0 0 0;}\r\n@font-face\r\n\t{font-family:"Cambria Math";\r\n\tpanose-1:2 4 5 3 5 4 6 3 2 4;}\r\n@font-face\r\n\t{font-family:Calibri;\r\n\tpanose-1:2 15 5 2 2 2 4 3 2 4;}\r\n/* Style Definitions */\r\np.MsoNormal, li.MsoNormal, div.MsoNormal\r\n\t{margin:0cm;\r\n\tmargin-bottom:.0001pt;\r\n\tfont-size:11.0pt;\r\n\tfont-family:"Calibri",sans-serif;\r\n\tmso-fareast-language:EN-US;}\r\na:link, span.MsoHyperlink\r\n\t{mso-style-priority:99;\r\n\tcolor:#0563C1;\r\n\ttext-decoration:underline;}\r\na:visited, span.MsoHyperlinkFollowed\r\n\t{mso-style-priority:99;\r\n\tcolor:#954F72;\r\n\ttext-decoration:underline;}\r\nspan.EmailStyle17\r\n\t{mso-style-type:personal-compose;\r\n\tfont-family:"Calibri",sans-serif;\r\n\tcolor:windowtext;}\r\n.MsoChpDefault\r\n\t{mso-style-type:export-only;\r\n\tfont-family:"Calibri",sans-serif;\r\n\tmso-fareast-language:EN-US;}\r\n@page WordSection1\r\n\t{size:612.0pt 792.0pt;\r\n\tmargin:72.0pt 72.0pt 72.0pt 72.0pt;}\r\ndiv.WordSection1\r\n\t{page:WordSection1;}\r\n--></style><!--[if gte mso 9]><xml>\r\n<o:shapedefaults v:ext="edit" spidmax="1026" />\r\n</xml><![endif]--><!--[if gte mso 9]><xml>\r\n<o:shapelayout v:ext="edit">\r\n<o:idmap v:ext="edit" data="1" />\r\n</o:shapelayout></xml><![endif]-->\r\n</head>\r\n<body lang="EN-IN" link="#0563C1" vlink="#954F72">\r\n<div class="WordSection1">\r\n<p class="MsoNormal"><o:p>&nbsp;</o:p></p>\r\n<p class="MsoNormal"><o:p>&nbsp;</o:p></p>\r\n<p class="MsoNormal"><span style="mso-fareast-language:EN-IN"><o:p>&nbsp;</o:p></span></p>\r\n<p class="MsoNormal"><span style="mso-fareast-language:EN-IN"><o:p>&nbsp;</o:p></span></p>\r\n<p class="MsoNormal"><span style="mso-fareast-language:EN-IN"><o:p>&nbsp;</o:p></span></p>\r\n<p class="MsoNormal"><span style="mso-fareast-language:EN-IN"><o:p>&nbsp;</o:p></span></p>\r\n<p class="MsoNormal"><span style="mso-fareast-language:EN-IN"><o:p>&nbsp;</o:p></span></p>\r\n<p class="MsoNormal"><span style="mso-fareast-language:EN-IN"><o:p>&nbsp;</o:p></span></p>\r\n<p class="MsoNormal"><span style="mso-fareast-language:EN-IN"><o:p>&nbsp;</o:p></span></p>\r\n<table class="MsoTableGrid" border="0" cellspacing="0" cellpadding="0" width="548" style="width:410.85pt;border-collapse:collapse;border:none">\r\n<tbody>\r\n<tr style="height:112.95pt">\r\n<td width="257" valign="top" style="width:193.05pt;border:none;border-right:solid #000099 1.5pt;padding:0cm 5.4pt 0cm 5.4pt;height:112.95pt">\r\n<p class="MsoNormal" align="center" style="text-align:center"><img width="77" height="103" style="width:.802in;height:1.0729in" id="Picture_x0020_1" src="cid:image001.jpg@01DB77D8.9FC4D5C0"><o:p></o:p></p>\r\n<p class="MsoNormal" align="center" style="text-align:center"><img width="243" height="45" style="width:2.5312in;height:.4687in" id="Graphic_x0020_2" src="cid:image002.png@01DB77D8.9FC4D5C0"><o:p></o:p></p>\r\n</td>\r\n<td width="290" valign="top" style="width:217.8pt;border:none;padding:0cm 5.4pt 0cm 5.4pt;height:112.95pt">\r\n<p class="MsoNormal" style="line-height:115%"><b><span style="font-size:16.0pt;line-height:115%;color:#000099">Varun Vataliya</span></b><span style="font-size:16.0pt;line-height:115%;color:#0070C0">\r\n</span>| Jr. Quality Analyst<o:p></o:p></p>\r\n<p class="MsoNormal" style="line-height:115%">Email: varun.vataliya@technomark.io<o:p></o:p></p>\r\n<p class="MsoNormal" style="line-height:115%">Phone: (808)838-4854<o:p></o:p></p>\r\n<p class="MsoNormal" style="line-height:115%">Address: Texas | California | Hawaii<o:p></o:p></p>\r\n<p class="MsoNormal" style="line-height:115%">Sydney | Ahmedabad | Mumbai | Hyderabad<o:p></o:p></p>\r\n<p class="MsoNormal" style="line-height:115%"><b><span style="font-size:12.0pt;line-height:115%;color:#000099"><a href="http://www.technomark.io"><span style="color:#000099">www.technomark.io</span></a></span></b><b><span style="font-size:12.0pt;line-height:115%;color:#0070C0"><o:p></o:p></span></b></p>\r\n</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<p class="MsoNormal"><span style="mso-fareast-language:EN-IN"><o:p>&nbsp;</o:p></span></p>\r\n<p class="MsoNormal"><o:p>&nbsp;</o:p></p>\r\n</div>\r\n</body>\r\n</html>\r\n',
              isHTML: true,
              ReceivedOn: "05 February 2025 02:17 PM (1 hours ago)",
              Attachments: null,
              Type: 2,
              FromUser: "varun.vataliya@technomark.io",
              IsDraft: false,
              IsInReview: false,
              HasPermission: true,
              InReplyTo: null,
            },
            {
              TrailId: 66,
              From: "pmstest.manager1@yopmail.com",
              To: "varun.vataliya@technomark.io",
              MessageId: "F9GA2DONBPU4.ITP9JR3ZSP513@10-30-19-127",
              CC: "bhumika.vyas@technomark.io",
              BCC: "",
              Subject: "Test Bank Statement05-02-2025",
              Body: "<p>draft mail for that functionality</p>",
              isHTML: true,
              ReceivedOn: "05 February 2025 03:14 PM (18 minutes ago)",
              Attachments: null,
              Type: 1,
              FromUser: "PMS Test Manager",
              IsDraft: false,
              IsInReview: false,
              HasPermission: true,
              InReplyTo:
                "PN3PPF6ED4D0A96CF1AA3D38CB93E241E0293F72@PN3PPF6ED4D0A96.INDPRD01.PROD.OUTLOOK.COM",
            },
            {
              TrailId: 69,
              From: "pmstest.manager1@yopmail.com",
              To: "varun.vataliya@technomark.io,bhumika.vyas@technomark.io",
              MessageId: "W8S4I5QNBPU4.ZWQ2DUVQ2KOQ@10-30-19-127",
              CC: "varun.vataliya@technomark.io",
              BCC: "",
              Subject: "Email Statement",
              Body: "<p>checking draft mail</p>",
              isHTML: true,
              ReceivedOn: "05 February 2025 03:20 PM (12 minutes ago)",
              Attachments: null,
              Type: 1,
              FromUser: "PMS Test Manager",
              IsDraft: false,
              IsInReview: false,
              HasPermission: true,
              InReplyTo:
                "PN3PPF6ED4D0A96F9248CCDF9E29632890C93F52@PN3PPF6ED4D0A96.INDPRD01.PROD.OUTLOOK.COM",
            },
            {
              TrailId: 71,
              From: "pmstest.manager1@yopmail.com",
              To: "pmstest.manager1@yopmail.com,varun.vataliya@technomark.io,bhumika.vyas@technomark.io",
              MessageId: "H9MR50RNBPU4.8555QOBKQ4OM3@10-30-19-127",
              CC: "varun.vataliya@technomark.io",
              BCC: "",
              Subject: "Email Statement",
              Body: "<p>edit draft mail with attachment</p>",
              isHTML: true,
              ReceivedOn: "05 February 2025 03:21 PM (11 minutes ago)",
              Attachments: null,
              Type: 1,
              FromUser: "PMS Test Manager",
              IsDraft: false,
              IsInReview: false,
              HasPermission: true,
              InReplyTo: "W8S4I5QNBPU4.ZWQ2DUVQ2KOQ@10-30-19-127",
            },
          ]);
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
          FromDate: null,
          ToDate: null,
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
    }, [activeTab, ticketId]);

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

    const handleDraftMail = (isDraft: boolean) => {
      if (!allFieldsFilled)
        return toast.warning("Please fill all mendatory details.");
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

      const url = `${process.env.emailbox_api_url}/emailbox/SaveEmailDraftApproval`;

      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success(
            isDraft
              ? "Email has been successfully saved as a draft."
              : "Email has been successfully sent for approval."
          );
          getConversationData();
          setOverlayOpen(false);
          (activeType !== "Edit Draft" || !isDraft) && onClose();
          (activeType !== "Edit Draft" || !isDraft) && onDataFetch?.();
          getTicketDetails();
          handleClearMailData();
        } else {
          setSending(false);
          setOverlayOpen(false);
        }
      };

      callAPI(
        url,
        {
          TicketId: ticketId,
          InReplyTo: !!data[active - 1].MessageId
            ? data[active - 1].MessageId
            : data[active - 1].InReplyTo,
          TicketTrailId:
            activeTabList === 3 || activeTabList === 4 ? trailId : 0,
          ApprovalId: ticketDetails.ApprovalId,
          To: toMembers.join(","),
          CC: ccMembers.join(","),
          BCC: bccMembers.join(","),
          Subject: data[active - 1].Subject || "",
          IsHtml: true,
          MailBody: text,
          TicketAttachments: conversationAttachment,
          IsDraft: isDraft,
          IsApproval: !isDraft,
        },
        successCallback,
        "post"
      );
    };

    const handleSubmitMail = () => {
      if (!allFieldsFilled)
        return toast.warning("Please fill all mendatory details.");
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
          onClose();
          onDataFetch?.();
        } else {
          setSending(false);
          setOverlayOpen(false);
        }
      };

      callAPI(
        url,
        {
          OriginalMessageId: ticketDetails.OriginalMessgeId,
          InReplyTo: !!data[active - 1].MessageId
            ? data[active - 1].MessageId
            : data[active - 1].InReplyTo,
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

    const handleSubmitDraftOrApproval = () => {
      if (!allFieldsFilled)
        return toast.warning("Please fill all mendatory details.");
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

      const url = `${process.env.emailbox_api_url}/emailbox/SaveAndSendDraftApprovalEmail`;

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
          onClose();
          onDataFetch?.();
        } else {
          setSending(false);
          setOverlayOpen(false);
        }
      };

      callAPI(
        url,
        {
          OriginalMessageId: ticketDetails.OriginalMessgeId,
          InReplyTo: !!data[active - 1].MessageId
            ? data[active - 1].MessageId
            : data[active - 1].InReplyTo,
          To: toMembers.join(","),
          CC: ccMembers.join(","),
          BCC: bccMembers.join(","),
          Subject: data[active - 1].Subject,
          IsHtml: true,
          MailBody: text,
          TicketAttachments: conversationAttachment,
          TicketId: ticketId,
          TicketTrailId: trailId,
          IsApproval: activeTabList === 3,
          IsDraft: activeTabList === 4,
          ApprovalId: ticketDetails.ApprovalId,
        },
        successCallback,
        "post"
      );
    };

    const deleteDraftMail = () => {
      if (!allFieldsFilled)
        return toast.warning("Please fill all mendatory details.");
      setOverlayOpen(true);

      const url = `${process.env.emailbox_api_url}/emailbox/DiscardDraftById`;

      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success("Draft mail deleted successfully.");
          getConversationData();
          setOverlayOpen(false);
          getTicketDetails();
          setDeleteId(0);
          handleClearMailData();
          onClose();
          onDataFetch?.();
        } else {
          setTrailId(0);
          setDeleteId(0);
          setIsDeleteOpen(false);
          setActiveType("");
          setOverlayOpen(false);
        }
      };

      callAPI(
        url,
        {
          TicketTrailId: deleteId,
        },
        successCallback,
        "post"
      );
    };

    const submitMail = () => {
      if (!allFieldsFilled)
        return toast.warning("Please fill all mendatory details.");
      setOverlayOpen(true);

      const url = `${process.env.emailbox_api_url}/emailbox/SendDraftApprovalEmailById`;

      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          activeType === "Send Draft" &&
            toast.success("Draft sent successfully.");
          activeType === "Send Mail" &&
            toast.success("Email sent successfully.");
          getConversationData();
          setOverlayOpen(false);
          getTicketDetails();
          setDeleteId(0);
          handleClearMailData();
          onClose();
          onDataFetch?.();
        } else {
          setTrailId(0);
          setDeleteId(0);
          setIsDeleteOpen(false);
          setActiveType("");
          setOverlayOpen(false);
        }
      };

      callAPI(
        url,
        {
          TicketTrailId: trailId,
          HasPermission: data.filter((i) => i.TrailId === trailId)[0]
            ?.HasPermission,
        },
        successCallback,
        "post"
      );
    };

    const handleClearMailData = (change: boolean = true) => {
      change && setActive(0);
      change && setActiveType("");
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
      change && setText("");
      setTextError(false);
      setSending(false);
      setOpenEmailTemplate(false);
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
      // handleClearMailData(false);
      if (active > 0) {
        setCcMembers(
          data[active - 1].CC?.trim()
            ? data[active - 1].CC?.split(",") ?? []
            : []
        );
        setBccMembers(
          data[active - 1].BCC?.trim()
            ? data[active - 1].BCC?.split(",") ?? []
            : []
        );
        setTrailId(data[active - 1].TrailId || 0);
        if (activeType === "EmailTemplate") {
          setOverlayOpen(true);
          setOpenEmailTemplate(true);
        }
        if (activeType === "Edit Draft" || activeType === "Edit Mail") {
          setText(data[active - 1].Body || "");
          setToMembers(
            data[active - 1].To?.trim() ? data[active - 1].To.split(",") : []
          );
        } else {
          const fromMembers = data[active - 1].From?.trim()
            ? data[active - 1].From.split(",")
            : [];
          const toMembers = data[active - 1].To?.trim()
            ? data[active - 1].To.split(",")
            : [];

          setToMembers([
            ...fromMembers,
            ...toMembers.filter((to) => !fromMembers.includes(to)), // Remove duplicates
          ]);
        }
      }
    }, [active, activeType]);

    return (
      <>
        <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto bg-gray-100 w-full">
          {data.map((i: conversationData, index: number) => (
            <div key={index} className="bg-white">
              {active > 0 && active - 1 === index && (
                <div className="bg-white px-2 rounded-lg w-full break-all">
                  <p className="py-2 px-4">Email Reply</p>
                  <MemberInput
                    label="To"
                    members={toMembers}
                    setMembers={setToMembers}
                    inputValue={toInputValue}
                    setInputValue={setToInputValue}
                    error={toInputValueError}
                    setError={setToInputValueError}
                    validate={true}
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
                    placeholders={[
                      { label: "Ticket ID", value: "{{TicketID}}" },
                      { label: "Ticket Subject", value: "{{TicketSubject}}" },
                      { label: "Ticket Priority", value: "{{TicketPriority}}" },
                      { label: "Ticket URL", value: "{{TicketURL}}" },
                      { label: "Tag", value: "{{Tag}}" },
                      { label: "Assignee Name", value: "{{AssigneeName}}" },
                      { label: "Assignee Email", value: "{{AssigneeEmail}}" },
                      { label: "Status", value: "{{Status}}" },
                      { label: "Ticket Type", value: "{{TicketType}}" },
                      { label: "Client Name", value: "{{ClientName}}" },
                      { label: "Client Email", value: "{{ClientEmail}}" },
                      { label: "Updated By", value: "{{UpdatedBy}}" },
                      { label: "SLA Due Time", value: "{{SLADueTime}}" },
                      {
                        label: "OrganizationName",
                        value: "{{OrganizationName}}",
                      },
                      { label: "Closed Date", value: "{{ClosedDate}}" },
                    ]}
                    ChangeValue={true}
                    ticketId={ticketId}
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
                              <div className="!w-fit m-0 p-0">
                                <Loading />
                              </div>
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
                    {(activeTabList === 1 || activeTabList === 4) && (
                      <Button
                        variant="contained"
                        className={`rounded-[4px] !h-[36px] ${
                          (conversationAttachment.length > 0 &&
                            conversationAttachment.filter(
                              (attachment: any) => attachment.uploading
                            ).length > 0) ||
                          sending
                            ? "cursor-not-allowed !bg-gray-300 !text-white"
                            : "cursor-pointer !bg-secondary"
                        }`}
                        onClick={() =>
                          sending ||
                          (conversationAttachment.length > 0 &&
                            conversationAttachment.filter(
                              (attachment: any) => attachment.uploading
                            ).length > 0)
                            ? undefined
                            : handleDraftMail(true)
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
                          Save as Draft
                        </span>
                      </Button>
                    )}
                    {i.HasPermission && (
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
                        onClick={() => {
                          if (
                            sending ||
                            (conversationAttachment.length > 0 &&
                              conversationAttachment.filter(
                                (attachment: any) => attachment.uploading
                              ).length > 0)
                          ) {
                            undefined;
                          } else {
                            if (activeTabList === 1) {
                              handleSubmitMail();
                            } else {
                              handleSubmitDraftOrApproval();
                            }
                          }
                        }}
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
                    )}
                    {!i.HasPermission && (
                      <Button
                        variant="outlined"
                        color="warning"
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
                            : handleDraftMail(false)
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
                          Sent For Approval
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
              )}
              <div className="max-w-full rounded-lg flex items-start justify-start p-4 gap-4">
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
                  <div className="flex items-start justify-between mb-1 w-full">
                    <p
                      className={`flex ${
                        i.FromUser.length > 20 ? "flex-col" : "gap-2"
                      }`}
                    >
                      {i.FromUser.length > 50 ? (
                        <ColorToolTip title={i.FromUser} placement="top" arrow>
                          <b>{i.FromUser.slice(0, 50)}</b>
                        </ColorToolTip>
                      ) : (
                        <b>{i.FromUser}</b>
                      )}
                      <span>{i.ReceivedOn}</span>
                    </p>
                    {(ticketDetails.Assignee ===
                      Number(localStorage.getItem("UserId")) ||
                      activeTabList === 3) && (
                      <div className="flex items-center justify-center gap-3 relative">
                        {activeTabList === 1 && (
                          <>
                            <ColorToolTip
                              title="Email Template"
                              placement="top"
                              arrow
                            >
                              <p
                                className="cursor-pointer"
                                onClick={() => {
                                  setActive(index + 1);
                                  // setTrailId(i.TrailId);
                                  setConversationAttachment([]);
                                  setActiveType("EmailTemplate");
                                }}
                              >
                                <EmailTemplate />
                              </p>
                            </ColorToolTip>
                            <ColorToolTip
                              title="ReplyAll"
                              placement="top"
                              arrow
                            >
                              <p
                                className="cursor-pointer"
                                onClick={() => {
                                  setActive(index + 1);
                                  // setTrailId(i.TrailId);
                                  setConversationAttachment([]);
                                  setActiveType("ReplyAll");
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
                                  // setTrailId(i.TrailId);
                                  setConversationAttachment(
                                    !!i.Attachments ? i.Attachments : []
                                  );
                                  setActiveType("Forward");
                                }}
                              >
                                <Forward />
                              </p>
                            </ColorToolTip>
                          </>
                        )}
                        {((activeTabList === 4 && i.IsDraft) ||
                          (activeTabList === 3 &&
                            i.IsInReview &&
                            i.HasPermission)) && (
                          <p
                            className="cursor-pointer"
                            onClick={() => setShowPopup(i.TrailId)}
                            ref={buttonRef}
                          >
                            <ThreeDot />
                          </p>
                        )}
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
                              width: "120px",
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
                              {(activeTabList === 4
                                ? draftPlaceholders
                                : activeTabList === 3 && i.HasPermission
                                ? approvalPlaceholders
                                : []
                              ).map((placeholder: string, j: number) => (
                                <li
                                  key={j}
                                  className="hover:bg-gray-100 rounded-lg text-sm w-full py-1 px-2 break-all"
                                  onClick={() => {
                                    setShowPopup(0);
                                    setActiveType(placeholder);
                                    if (
                                      placeholder === "Edit Draft" ||
                                      placeholder === "Edit Mail"
                                    ) {
                                      setActive(index + 1);
                                      setConversationAttachment(
                                        !!i.Attachments ? i.Attachments : []
                                      );
                                    }
                                    if (
                                      placeholder === "Send Draft" ||
                                      placeholder === "Send Mail"
                                    ) {
                                      setTrailId(i.TrailId);
                                      setToMembers(
                                        i.From?.trim() ? i.From.split(",") : []
                                      );
                                      setCcMembers(
                                        i.CC?.trim()
                                          ? i.CC?.split(",") ?? []
                                          : []
                                      );
                                      setBccMembers(
                                        i.BCC?.trim()
                                          ? i.BCC?.split(",") ?? []
                                          : []
                                      );
                                      setText(i.Body ?? "");
                                      setIsDeleteOpen(true);
                                    }
                                    if (placeholder === "Discard Draft") {
                                      setDeleteId(i.TrailId);
                                      setIsDeleteOpen(true);
                                    }
                                  }}
                                >
                                  {placeholder}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="break-all">From: {i.From}</p>
                  {i.To && (
                    // i.Type !== 2
                    <p className="break-all">To: {i.To}</p>
                  )}
                  {!!i.CC && <p className="break-all">Cc: {i.CC}</p>}
                  {!!i.BCC && <p className="break-all">Bcc: {i.BCC}</p>}
                  <p className="break-all">Subject: {i.Subject}</p>
                  {/* <p
                    className="mt-2 !break-all"
                    dangerouslySetInnerHTML={{
                      __html: i.Body,
                    }}
                    style={{
                      wordBreak: 'break-all',
                      maxWidth:"100%",
                      overflow:"auto"
                    }}
                  /> */}
                  <p
                    className="mt-2 !break-all w-full [&>*]:w-full [&>font>pre]:w-full pretag"
                    dangerouslySetInnerHTML={{
                      __html: i.Body,
                    }}
                    style={{
                      wordBreak: "break-all",
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
        <EmailTemplateDrawer
          onOpen={openEmailTemplate}
          onClose={() => {
            setOpenEmailTemplate(false);
            setOverlayOpen(false);
          }}
          onReset={() => {
            setActive(0);
            setTrailId(0);
            setConversationAttachment([]);
            setActiveType("");
          }}
          clientId={clientId}
          ticketId={ticketId}
          assigneeId={ticketDetails.Assignee}
          getConversationData={getConversationData}
          setText={setText}
        />
        <DeleteDialog
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setDeleteId(0);
            setActiveType("");
          }}
          onActionClick={() => {
            activeType === "Discard Draft" && deleteDraftMail();
            (activeType === "Send Draft" || activeType === "Send Mail") &&
              submitMail();
          }}
          Title={activeType}
          firstContent={`Are you sure you want to ${activeType}?`}
          secondContent={""}
          buttonContent={true}
        />
      </>
    );
  }
);

export default Conversations;
