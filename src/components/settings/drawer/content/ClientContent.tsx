import React, {
  useImperativeHandle,
  forwardRef,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
  Autocomplete,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  TextField,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { getFormattedDate } from "@/utils/timerFunctions";
import { getBillingTypeData, getDeptData } from "@/utils/commonDropdownApiCall";
import { DepartmentDataObj } from "@/utils/Types/settingTypes";
import { LabelValue } from "@/utils/Types/types";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export interface ClientContentRef {
  clearAllData: () => void;
}

const ClientContent = forwardRef<
  ClientContentRef,
  {
    onEdit: number;
    onClose: () => void;
    onDataFetch: (() => void) | null;
    onOpen: boolean;
    onChangeLoader: (e: boolean) => void;
  }
>(({ onEdit, onClose, onOpen, onDataFetch, onChangeLoader }, ref) => {
  const [departmentData, setDepartmentData] = useState([
    "Tax",
    "Acounting",
    "Audit",
  ]);
  const [departmentDataObj, setDepartmentDataObj] = useState<
    DepartmentDataObj[]
  >([]);

  const handleClose = () => {
    setDepartmentDataObj([
      ...departmentData.map((i: string, index: number) => ({
        id: 0,
        apiId: i === "Acounting" ? 1 : i === "Audit" ? 2 : i === "Tax" ? 3 : 0,
        index: index,
        label: i,
        checkbox: false,
        isOpen: false,
        billingType: 0,
        billingErr: false,
        group: [],
        groupErr: false,
        selectGroupValue: [],
        contHrs: 0,
        contHrsErr: false,
        actHrs: 0,
        actHrsErr: false,
        allFields: false,
      })),
    ]);
  };

  useEffect(() => {
    onOpen &&
      departmentDataObj.length < 3 &&
      setDepartmentDataObj([
        ...departmentDataObj,
        ...departmentData.map((i: string, index: number) => ({
          id: 0,
          apiId:
            i === "Acounting" ? 1 : i === "Audit" ? 2 : i === "Tax" ? 3 : 0,
          index: index,
          label: i,
          checkbox: false,
          isOpen: false,
          billingType: 0,
          billingErr: false,
          group: [],
          groupErr: false,
          selectGroupValue: [],
          contHrs: 0,
          contHrsErr: false,
          actHrs: 0,
          actHrsErr: false,
          allFields: false,
        })),
      ]);
  }, [onOpen]);

  const [billingTypeData, setBillingTypeData] = useState([]);
  const [groupTypeData, setGroupTypeData] = useState([]);

  const [Id, setId] = useState(0);
  const [clientName, setClientName] = useState("");
  const [clientNameError, setClientNameError] = useState(false);
  const [depts, setDepts] = useState<LabelValue[]>([]);
  const [deptName, setDeptName] = useState<number[]>([]);
  const [deptError, setDeptError] = useState(false);
  const [departmentDropdown, setDepartmentDropdown] = useState<LabelValue[]>(
    []
  );
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState(false);
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [tel, setTel] = useState("");

  const [addMoreClicked, setAddMoreClicked] = useState(false);
  const [isAddClientClicked, setIsAddClientClicked] = useState(true);
  const [isAdditionalFieldsClicked, setIsAdditionalFieldsClicked] =
    useState(false);
  const [deletedPocFields, setDeletedPocFields] = useState<
    { Name: string | null; Email: string | null }[]
  >([]);
  const [pocFields, setPocFields] = useState<
    { Name: string | null; Email: string | null }[]
  >([
    {
      Name: null,
      Email: null,
    },
  ]);
  const [stateList, setStateList] = useState<LabelValue[]>([]);
  const [cpaName, setCpaName] = useState<string>("");
  const [cpaEmail, setCpaEmail] = useState<string>("");
  const [cpaMobileNo, setCpaMobileNo] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<number>(0);
  const [zip, setZip] = useState<string>("");
  const [clientItPOCName, setClientItPOCName] = useState<string>("");
  const [clientItPOCEmail, setClientItPOCEmail] = useState<string>("");
  const [pabsPOCName, setPabsPOCName] = useState<string>("");
  const [pabsBDM, setPabsBDM] = useState<string>("");
  const [pabsManagerAssigned, setPabsManagerAssigned] = useState<string>("");
  const [groupEmail, setGroupEmail] = useState<string>("");
  const [sopStatus, setSOPStatus] = useState<string>("");
  const [dateOfImplementation, setDateofImplementation] = useState<string>("");
  const [agreementStartDate, setAgreementStartDate] = useState<string>("");
  const [fteAgreement, setFteAgreement] = useState<string>("");
  const [estimationWorkflow, setEstimationWorkFlow] = useState<string>("");
  const [vpnRequirement, setVpnRequirement] = useState<string>("");
  const [remoteSystemAccess, setRemoteSystemAccess] = useState<string>("");
  const [taxPreparationSoftware, setTaxPreparationSoftware] =
    useState<string>("");
  const [documentPortal, setDocumentPortal] = useState<string>("");
  const [workflowTracker, setWorkflowTracker] = useState<string>("");
  const [communicationChannel, setCommunicationChannel] = useState<string>("");
  const [recurringCall, setRecurringCall] = useState<string>("");
  const [specificProcessStep, setSpecificProcessStep] = useState<string>("");
  const [clientTimeZone, setClientTimeZone] = useState<string>("");
  const [noOfLogin, setNoOfLogin] = useState<string>("");

  const addTaskField = () => {
    setPocFields([
      ...pocFields,
      {
        Name: null,
        Email: null,
      },
    ]);
  };

  const removePocField = (index: number) => {
    setDeletedPocFields([...deletedPocFields, pocFields[index]]);

    const newTaskFields = [...pocFields];
    newTaskFields.splice(index, 1);
    setPocFields(newTaskFields);
  };

  const handleClientPOCNameChange = (e: string, index: number) => {
    const newPOCFields = [...pocFields];
    newPOCFields[index].Name = e;
    setPocFields(newPOCFields);
  };

  const handleClientPOCEmailChange = (e: string, index: number) => {
    const newPOCFields = [...pocFields];
    newPOCFields[index].Email = e;
    setPocFields(newPOCFields);
  };

  const toggleAccordion = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const checked = e.target.checked;
    checked
      ? setDepartmentDataObj([
          ...departmentDataObj.map((i: DepartmentDataObj) =>
            i.index === index
              ? {
                  ...i,
                  checkbox: checked,
                  isOpen: checked,
                  allFields: true,
                }
              : i
          ),
        ])
      : setDepartmentDataObj([
          ...departmentDataObj.map((i: DepartmentDataObj) =>
            i.index === index
              ? {
                  ...i,
                  checkbox: checked,
                  isOpen: checked,
                  billingErr: checked,
                  groupErr: checked,
                  contHrsErr: checked,
                  actHrsErr: checked,
                  allFields: false,
                }
              : i
          ),
        ]);
  };

  useEffect(() => {
    clearClientData();
    if (onEdit > 0) {
      const getClientById = async () => {
        const token = await localStorage.getItem("token");
        const Org_Token = await localStorage.getItem("Org_Token");
        try {
          const response = await axios.post(
            `${process.env.pms_api_url}/client/GetById`,
            {
              clientId: onEdit || 0,
            },
            {
              headers: {
                Authorization: `bearer ${token}`,
                org_token: `${Org_Token}`,
              },
            }
          );

          if (response.status === 200) {
            if (response.data.ResponseStatus === "Success") {
              setClientName(response.data.ResponseData.Name);
              setAddress(response.data.ResponseData.Address);
              setEmail(response.data.ResponseData.Email);
              setDepts(
                response.data.ResponseData.DepartmentIds.length <= 0 ||
                  response.data.ResponseData.DepartmentIds.length === null
                  ? []
                  : departmentDropdown.filter((dept: LabelValue) =>
                      response.data.ResponseData.DepartmentIds.includes(
                        dept.value
                      )
                    )
              );
              setDeptName(response.data.ResponseData.DepartmentIds);
              setTel(response.data.ResponseData.ContactNo);
              setId(response.data.ResponseData.Id);
              const updatedFirstArray = departmentDataObj.map(
                (item: DepartmentDataObj) => {
                  const matchingItem =
                    response.data.ResponseData.WorkTypes.find(
                      (secondItem: {
                        ClientWorkTypeId: number;
                        WorkTypeId: number;
                        BillingTypeId: number;
                        GroupIds: number[];
                        LayoutId: number;
                        InternalHrs: number;
                        ContractHrs: number;
                      }) =>
                        secondItem.WorkTypeId === item.apiId ? true : false
                    );

                  if (matchingItem) {
                    const filteredOptionsData =
                      matchingItem.GroupIds !== null
                        ? groupTypeData.filter((d: LabelValue) => {
                            return matchingItem.GroupIds.some((id: number) => {
                              return id === Number(d.value);
                            });
                          })
                        : [];
                    return {
                      ...item,
                      apiId: matchingItem.WorkTypeId,
                      id: matchingItem.ClientWorkTypeId,
                      checkbox: true,
                      isOpen: true,
                      billingType: matchingItem.BillingTypeId,
                      group: filteredOptionsData,
                      selectGroupValue: matchingItem.GroupIds,
                      contHrs: matchingItem.ContractHrs,
                      actHrs: matchingItem.InternalHrs,
                      allFields: false,
                    };
                  }

                  return item;
                }
              );
              setDepartmentDataObj(updatedFirstArray);

              setCpaName(
                response.data.ResponseData.OwnerAndCPAName === null
                  ? ""
                  : response.data.ResponseData.OwnerAndCPAName
              );
              setCpaEmail(
                response.data.ResponseData.OwnerEmail === null
                  ? ""
                  : response.data.ResponseData.OwnerEmail
              );
              setCpaMobileNo(
                response.data.ResponseData.OwnerPhone === null
                  ? ""
                  : response.data.ResponseData.OwnerPhone
              );
              setCity(
                response.data.ResponseData.City === null
                  ? ""
                  : response.data.ResponseData.City
              );
              setState(
                response.data.ResponseData.StateId === null
                  ? 0
                  : response.data.ResponseData.StateId
              );
              setZip(
                response.data.ResponseData.Zip === null
                  ? ""
                  : response.data.ResponseData.Zip
              );

              setPocFields(
                response.data.ResponseData.ClientPOCInformation.length === 0
                  ? pocFields
                  : response.data.ResponseData.ClientPOCInformation
              );

              setClientItPOCName(
                response.data.ResponseData.ClientITPOCName === null
                  ? ""
                  : response.data.ResponseData.ClientITPOCName
              );
              setClientItPOCEmail(
                response.data.ResponseData.ClientITPOCEmail === null
                  ? ""
                  : response.data.ResponseData.ClientITPOCEmail
              );
              setPabsPOCName(
                response.data.ResponseData.PABSPOCName === null
                  ? ""
                  : response.data.ResponseData.PABSPOCName
              );
              setPabsBDM(
                response.data.ResponseData.PABSBDM === null
                  ? ""
                  : response.data.ResponseData.PABSBDM
              );
              setPabsManagerAssigned(
                response.data.ResponseData.PABSManagerAssigned === null
                  ? ""
                  : response.data.ResponseData.PABSManagerAssigned
              );
              setGroupEmail(
                response.data.ResponseData.GroupMail === null
                  ? ""
                  : response.data.ResponseData.GroupMail
              );
              setSOPStatus(
                response.data.ResponseData.SOPStatus === null
                  ? ""
                  : response.data.ResponseData.SOPStatus
              );
              setDateofImplementation(
                response.data.ResponseData.DateOfImplementation === null
                  ? ""
                  : dayjs(
                      response.data.ResponseData.DateOfImplementation
                    ).format("MM/DD/YYYY")
              );
              setAgreementStartDate(
                response.data.ResponseData.AgreementStartDate === null
                  ? ""
                  : dayjs(response.data.ResponseData.AgreementStartDate).format(
                      "MM/DD/YYYY"
                    )
              );
              setFteAgreement(
                response.data.ResponseData.FTEAgreementTax === null
                  ? ""
                  : response.data.ResponseData.FTEAgreementTax
              );
              setEstimationWorkFlow(
                response.data.ResponseData.EstimatedWorkflow === null
                  ? ""
                  : response.data.ResponseData.EstimatedWorkflow
              );
              setVpnRequirement(
                response.data.ResponseData.VPNRequirement === null
                  ? ""
                  : response.data.ResponseData.VPNRequirement
              );
              setRemoteSystemAccess(
                response.data.ResponseData.RemoteSystemAccess === null
                  ? ""
                  : response.data.ResponseData.RemoteSystemAccess
              );
              setTaxPreparationSoftware(
                response.data.ResponseData.TaxPreparationSoftware === null
                  ? ""
                  : response.data.ResponseData.TaxPreparationSoftware
              );
              setDocumentPortal(
                response.data.ResponseData.DocumentPortal === null
                  ? ""
                  : response.data.ResponseData.DocumentPortal
              );
              setWorkflowTracker(
                response.data.ResponseData.WorkflowTracker === null
                  ? ""
                  : response.data.ResponseData.WorkflowTracker
              );
              setCommunicationChannel(
                response.data.ResponseData.CommunicationChannel === null
                  ? ""
                  : response.data.ResponseData.CommunicationChannel
              );
              setRecurringCall(
                response.data.ResponseData.RecurringCall === null
                  ? ""
                  : response.data.ResponseData.RecurringCall
              );
              setSpecificProcessStep(
                response.data.ResponseData.SpecificAdditionalProcessSteps ===
                  null
                  ? ""
                  : response.data.ResponseData.SpecificAdditionalProcessSteps
              );
              setClientTimeZone(
                response.data.ResponseData.ClientTimeZone === null
                  ? ""
                  : response.data.ResponseData.ClientTimeZone
              );
              setNoOfLogin(
                response.data.ResponseData.NoOfLogins === null
                  ? ""
                  : response.data.ResponseData.NoOfLogins
              );
            } else {
              const data = response.data.Message;
              if (data === null) {
                toast.error("Please try again later.");
              } else {
                toast.error(data);
              }
            }
          } else {
            const data = response.data.Message;
            if (data === null) {
              toast.error("Failed Please try again.");
            } else {
              toast.error(data);
            }
          }
        } catch (error) {
          console.error(error);
        }
      };

      getClientById();
    }
  }, [onEdit, onOpen]);

  const handleContHrs = (e: number, index: number) => {
    if (e.toString().length <= 5) {
      setDepartmentDataObj([
        ...departmentDataObj.map((i: DepartmentDataObj) =>
          i.index === index
            ? {
                ...i,
                contHrs: e,
                contHrsErr: e.toString().length > 0 ? false : true,
                allFields:
                  i.billingType > 0 &&
                  i.selectGroupValue.length > 0 &&
                  Number(i.actHrs) > 0 &&
                  e.toString().length > 0 &&
                  e.toString().length <= 5
                    ? false
                    : true,
              }
            : i
        ),
      ]);
    }
  };

  const handleActualHrs = (e: number, index: number) => {
    if (e.toString().length <= 5) {
      setDepartmentDataObj([
        ...departmentDataObj.map((i: DepartmentDataObj) =>
          i.index === index
            ? {
                ...i,
                actHrs: e,
                actHrsErr: e.toString().length > 0 ? false : true,
                allFields:
                  i.billingType > 0 &&
                  i.selectGroupValue.length > 0 &&
                  Number(i.contHrs) > 0 &&
                  e.toString().length > 0 &&
                  e.toString().length <= 5
                    ? false
                    : true,
              }
            : i
        ),
      ]);
    }
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    clientName.trim().length < 2 && setClientNameError(true);
    clientName.trim().length > 100 && setClientNameError(true);
    address.trim().length <= 0 && setAddressError(true);
    address.trim().length > 300 && setAddressError(true);
    email.trim().length <= 0 && setEmailError(true);
    email.trim().length > 100 && setEmailError(true);
    setEmailError(!regex.test(email));
    setDeptError(deptName.length <= 0);

    setDepartmentDataObj([
      ...departmentDataObj.map((i: DepartmentDataObj) =>
        i.checkbox === true
          ? {
              ...i,
              billingErr: i.billingType <= 0 ? true : false,
              groupErr: i.selectGroupValue.length <= 0 ? true : false,
              contHrsErr:
                Number(i.contHrs) <= 0
                  ? true
                  : i.contHrs === "0" ||
                    i.contHrs === "00" ||
                    i.contHrs === "000" ||
                    i.contHrs === "0000" ||
                    i.contHrs === "00000" ||
                    i.contHrs === "-0" ||
                    i.contHrs === "-00" ||
                    i.contHrs === "-000" ||
                    i.contHrs === "-0000" ||
                    i.contHrs === "-00000"
                  ? true
                  : i.contHrs.toString().includes(".") ||
                    i.contHrs.toString().includes(",")
                  ? true
                  : false,
              actHrsErr:
                Number(i.actHrs) <= 0
                  ? true
                  : Number(i.actHrs) > Number(i.contHrs)
                  ? true
                  : i.actHrs === "0" ||
                    i.actHrs === "00" ||
                    i.actHrs === "000" ||
                    i.actHrs === "0000" ||
                    i.actHrs === "00000" ||
                    i.actHrs === "-0" ||
                    i.actHrs === "-00" ||
                    i.actHrs === "-000" ||
                    i.actHrs === "-0000" ||
                    i.actHrs === "-00000"
                  ? true
                  : i.actHrs.toString().includes(".") ||
                    i.actHrs.toString().includes(",")
                  ? true
                  : false,
              allFields:
                i.billingType > 0 &&
                i.selectGroupValue.length > 0 &&
                Number(i.contHrs) > 0 &&
                Number(i.actHrs) > 0
                  ? false
                  : true,
            }
          : i
      ),
    ]);

    const allFieldsCheck = departmentDataObj
      .map((i: DepartmentDataObj) => i.allFields)
      .includes(true);

    const timeGrater = departmentDataObj
      .map((i: DepartmentDataObj) => Number(i.actHrs) > Number(i.contHrs))
      .includes(true);

    const isChecked = departmentDataObj
      .map((i: DepartmentDataObj) => (i.checkbox === true ? i.index : false))
      .filter((j: number | boolean) => j !== false);

    const hasError = departmentDataObj.map((i: DepartmentDataObj) =>
      !i.billingErr && !i.groupErr && !i.contHrsErr && !i.actHrsErr
        ? i.index
        : false
    );

    if (
      !emailError &&
      email.trim().length > 0 &&
      email.trim().length < 100 &&
      !deptError &&
      deptName.length > 0 &&
      !clientNameError &&
      !addressError &&
      isChecked.length > 0 &&
      !hasError.includes(false) &&
      !timeGrater &&
      !allFieldsCheck
    ) {
      saveClient();
    } else if (
      !emailError &&
      email.trim().length > 0 &&
      email.trim().length < 100 &&
      !deptError &&
      deptName.length > 0 &&
      !clientNameError &&
      !addressError &&
      isChecked.length <= 0
    ) {
      toast.error("Please Select at least one work type.");
    }
  };

  const clearClientData = () => {
    setId(0);
    setClientName("");
    setClientNameError(false);
    setAddress("");
    setAddressError(false);
    setEmail("");
    setEmailError(false);
    setDepts([]);
    setDeptName([]);
    setDeptError(false);
    setTel("");
    departmentDataObj.length < 3 &&
      setDepartmentDataObj([
        ...departmentDataObj,
        ...departmentData.map((i: string, index: number) => ({
          id: 0,
          apiId:
            i === "Acounting" ? 1 : i === "Audit" ? 2 : i === "Tax" ? 3 : 0,
          index: index,
          label: i,
          checkbox: false,
          isOpen: false,
          billingType: 0,
          billingErr: false,
          group: [],
          groupErr: false,
          selectGroupValue: [],
          contHrs: 0,
          contHrsErr: false,
          actHrs: 0,
          actHrsErr: false,
          allFields: false,
        })),
      ]);

    setPocFields([
      {
        Name: null,
        Email: null,
      },
    ]);
    setCpaName("");
    setCpaEmail("");
    setCpaMobileNo("");
    setCity("");
    setState(0);
    setZip("");
    setClientItPOCName("");
    setClientItPOCEmail("");
    setPabsPOCName("");
    setPabsBDM("");
    setPabsManagerAssigned("");
    setGroupEmail("");
    setSOPStatus("");
    setDateofImplementation("");
    setAgreementStartDate("");
    setFteAgreement("");
    setEstimationWorkFlow("");
    setVpnRequirement("");
    setRemoteSystemAccess("");
    setTaxPreparationSoftware("");
    setDocumentPortal("");
    setWorkflowTracker("");
    setCommunicationChannel("");
    setRecurringCall("");
    setSpecificProcessStep("");
    setClientTimeZone("");
    setNoOfLogin("");
    setIsAdditionalFieldsClicked(false);
    setIsAddClientClicked(true);
  };

  const saveClient = async () => {
    // onChangeLoader(true);
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");

    const getFieldValue = (condition: boolean, value: any) => {
      return condition && value !== null && value?.toString().trim() !== ""
        ? value?.toString().trim()
        : null;
    };

    try {
      const workTypes = departmentDataObj
        .map((i: DepartmentDataObj) =>
          i.checkbox === true
            ? {
                ClientWorkTypeId: i.id,
                workTypeId: i.apiId,
                billingTypeId: i.billingType,
                groupIds: i.selectGroupValue,
                layoutId: 1,
                internalHrs: i.actHrs,
                contractHrs: i.contHrs,
              }
            : false
        )
        .filter(
          (
            j:
              | {
                  ClientWorkTypeId: number;
                  workTypeId: number;
                  billingTypeId: number;
                  groupIds: number[];
                  layoutId: number;
                  internalHrs: number | string;
                  contractHrs: number | string;
                }
              | boolean
          ) => j !== false
        );

      // const response = await axios.get(
      //   `${process.env.pms_api_url}/client/getdropdownforgroup`,
      //   {
      //     headers: {
      //       Authorization: `bearer ${token}`,
      //       org_token: `${Org_Token}`,
      //     },
      //   }
      // );

      const response = await axios.post(
        `${process.env.pms_api_url}/client/save`,
        {
          id: Id || 0,
          Name: clientName,
          email: email.trim(),
          DepartmentIds: deptName,
          contactNo: tel,
          address: address.trim(),
          isActive: true,

          WorkTypes: workTypes.length > 0 ? workTypes : null,

          OwnerAndCPAName: getFieldValue(
            isAdditionalFieldsClicked,
            cpaName.trim()
          ),
          OwnerEmail: getFieldValue(isAdditionalFieldsClicked, cpaEmail.trim()),
          OwnerPhone: getFieldValue(isAdditionalFieldsClicked, cpaMobileNo),
          City: getFieldValue(isAdditionalFieldsClicked, city.trim()),
          StateId: isAdditionalFieldsClicked && state !== 0 ? state : null,
          Zip: getFieldValue(isAdditionalFieldsClicked, zip),

          ClientPOCInformation: isAdditionalFieldsClicked ? pocFields : [],

          ClientITPOCName: getFieldValue(
            isAdditionalFieldsClicked,
            clientItPOCName.trim()
          ),
          ClientITPOCEmail: getFieldValue(
            isAdditionalFieldsClicked,
            clientItPOCEmail.trim()
          ),
          PABSPOCName: getFieldValue(
            isAdditionalFieldsClicked,
            pabsPOCName.trim()
          ),

          Pabsbdm: getFieldValue(isAdditionalFieldsClicked, pabsBDM.trim()),
          PabsManagerAssigned: getFieldValue(
            isAdditionalFieldsClicked,
            pabsManagerAssigned.trim()
          ),

          GroupMail: getFieldValue(
            isAdditionalFieldsClicked,
            groupEmail.trim()
          ),
          SopStatus: getFieldValue(isAdditionalFieldsClicked, sopStatus),

          DateOfImplementation: getFieldValue(
            isAdditionalFieldsClicked,
            dateOfImplementation !== null &&
              dateOfImplementation.toString().trim().length > 0
              ? getFormattedDate(dateOfImplementation)
              : null
          ),
          AgreementStartDate: getFieldValue(
            isAdditionalFieldsClicked,
            agreementStartDate !== null &&
              agreementStartDate.toString().trim().length > 0
              ? getFormattedDate(agreementStartDate)
              : null
          ),
          FteAgreementTax: getFieldValue(
            isAdditionalFieldsClicked,
            fteAgreement.trim()
          ),
          EstimatedWorkflow: getFieldValue(
            isAdditionalFieldsClicked,
            estimationWorkflow.trim()
          ),
          VpnRequirement: getFieldValue(
            isAdditionalFieldsClicked,
            vpnRequirement.trim()
          ),
          RemoteSystemAccess: getFieldValue(
            isAdditionalFieldsClicked,
            remoteSystemAccess.trim()
          ),
          TaxPreparationSoftware: getFieldValue(
            isAdditionalFieldsClicked,
            taxPreparationSoftware.trim()
          ),
          DocumentPortal: getFieldValue(
            isAdditionalFieldsClicked,
            documentPortal.trim()
          ),
          WorkflowTracker: getFieldValue(
            isAdditionalFieldsClicked,
            workflowTracker.trim()
          ),
          CommunicationChannel: getFieldValue(
            isAdditionalFieldsClicked,
            communicationChannel.trim()
          ),
          RecurringCall: getFieldValue(
            isAdditionalFieldsClicked,
            recurringCall.trim()
          ),
          SpecificAdditionalProcessSteps: getFieldValue(
            isAdditionalFieldsClicked,
            specificProcessStep.trim()
          ),
          ClientTimeZone: getFieldValue(
            isAdditionalFieldsClicked,
            clientTimeZone.trim()
          ),
          NoOfLogins: parseInt(
            getFieldValue(
              isAdditionalFieldsClicked,
              noOfLogin.toString().trim()
            )
          ),
        },
        {
          headers: {
            Authorization: `bearer ${token}`,
            org_token: `${Org_Token}`,
          },
        }
      );

      if (response.status === 200) {
        if (response.data.ResponseStatus === "Success") {
          toast.success(
            `Client ${onEdit > 0 ? "Updated" : "created"} successfully.`
          );
          clearClientData();
          handleClose();
          onDataFetch?.();
          onChangeLoader(false);
          {
            !addMoreClicked && onClose();
          }
        } else {
          onChangeLoader(false);
          onClose();
          const data = response.data.Message;
          if (data === null) {
            toast.error("Please try again later.");
          } else {
            toast.error(data);
          }
        }
      } else {
        onChangeLoader(false);
        onClose();
        const data = response.data.Message;
        if (data === null) {
          toast.error("Failed Please try again.");
        } else {
          toast.error(data);
        }
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
      }
      console.error(error);
    }
  };

  const clearAllData = async () => {
    await clearClientData();
    handleClose();
    onClose();
  };

  useImperativeHandle(ref, () => ({
    clearAllData,
  }));

  useEffect(() => {
    billingTypeData.length <= 0 && getBillingTypesData();
    groupTypeData.length <= 0 && getGroupTypes();
    stateList.length <= 0 && getStates();
  }, [onOpen]);

  const getBillingTypesData = async () => {
    setDepartmentDropdown(await getDeptData());
    setBillingTypeData(await getBillingTypeData());
  };

  const getGroupTypes = async () => {
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");
    try {
      const response = await axios.get(
        `${process.env.pms_api_url}/group/getdropdown`,
        {
          headers: {
            Authorization: `bearer ${token}`,
            org_token: `${Org_Token}`,
          },
        }
      );

      if (response.status === 200) {
        if (response.data.ResponseStatus === "Success") {
          setGroupTypeData(response.data.ResponseData);
        }
      } else {
        const data = response.data.Message;
        if (data === null) {
          toast.error("Failed Please try again.");
        } else {
          toast.error(data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getStates = async () => {
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");
    try {
      const response = await axios.get(
        `${process.env.pms_api_url}/state/getdropdown`,
        {
          headers: {
            Authorization: `bearer ${token}`,
            org_token: `${Org_Token}`,
          },
        }
      );

      if (response.status === 200) {
        if (response.data.ResponseStatus === "Success") {
          setStateList(response.data.ResponseData);
        }
      } else {
        const data = response.data.Message;
        if (data === null) {
          toast.error("Failed Please try again.");
        } else {
          toast.error(data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleMultiSelect = (
    e: React.SyntheticEvent,
    value: LabelValue[],
    index: number
  ) => {
    if (value !== undefined) {
      const selectedValue = value.map((v: LabelValue) => v.value);
      setDepartmentDataObj([
        ...departmentDataObj.map((i: DepartmentDataObj) =>
          i.index === index
            ? {
                ...i,
                group: value,
                groupErr: value.length > 0 ? false : true,
                selectGroupValue: selectedValue,
                allFields:
                  i.billingType > 0 &&
                  selectedValue.length > 0 &&
                  Number(i.actHrs) > 0 &&
                  Number(i.actHrs) <= 5 &&
                  Number(i.contHrs) > 0 &&
                  Number(i.contHrs) <= 5
                    ? false
                    : true,
              }
            : i
        ),
      ]);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <span className="flex flex-row items-center px-[20px] py-[20px] gap-[20px]">
          <label
            onClick={() => {
              setIsAddClientClicked(true);
              setIsAdditionalFieldsClicked(false);
            }}
            className={`cursor-pointer select-none ${
              isAddClientClicked
                ? "text-secondary text-[16px] font-semibold"
                : "text-slatyGrey text-[14px]"
            }`}
          >
            Add Client
          </label>
          <span className="text-lightSilver">|</span>
          <label
            onClick={() => {
              setIsAdditionalFieldsClicked(true);
              setIsAddClientClicked(false);
            }}
            className={`cursor-pointer select-none ${
              isAdditionalFieldsClicked
                ? "text-secondary text-[16px] font-semibold"
                : "text-slatyGrey text-[14px]"
            }`}
          >
            Additional Fields
          </label>
        </span>
        <div className="flex gap-[20px] flex-col px-[20px] pb-[50px] max-h-[73.5vh] overflow-y-auto">
          {isAddClientClicked && (
            <>
              <TextField
                label={
                  <span>
                    Client Name
                    <span className="!text-defaultRed">&nbsp;*</span>
                  </span>
                }
                fullWidth
                value={clientName?.trim().length <= 0 ? "" : clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  setClientNameError(false);
                }}
                onBlur={(e) => {
                  if (
                    e.target.value.trim().length < 2 ||
                    e.target.value.trim().length > 100
                  ) {
                    setClientNameError(true);
                  }
                }}
                error={clientNameError}
                helperText={
                  clientNameError && clientName?.trim().length > 100
                    ? "Maximum 100 characters allowed."
                    : clientNameError &&
                      clientName?.trim().length > 0 &&
                      clientName?.trim().length < 2
                    ? "Minimum 2 characters allowed."
                    : clientNameError
                    ? "This is a required field."
                    : ""
                }
                margin="normal"
                variant="standard"
              />
              <TextField
                label={
                  <span>
                    Address
                    <span className="!text-defaultRed">&nbsp;*</span>
                  </span>
                }
                sx={{ mt: "-10px" }}
                fullWidth
                value={address?.trim().length <= 0 ? "" : address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setAddressError(false);
                }}
                onBlur={(e) => {
                  if (
                    e.target.value.trim().length < 1 ||
                    e.target.value.trim().length > 300
                  ) {
                    setAddressError(true);
                  }
                }}
                error={addressError}
                helperText={
                  addressError && address?.trim().length > 300
                    ? "Maximum 300 characters allowed."
                    : addressError
                    ? "This is a required field."
                    : ""
                }
                margin="normal"
                variant="standard"
              />
              <TextField
                type="email"
                sx={{ mt: "-10px" }}
                label={
                  <span>
                    Email
                    <span className="!text-defaultRed">&nbsp;*</span>
                  </span>
                }
                fullWidth
                value={email?.trim().length <= 0 ? "" : email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(false);
                }}
                onBlur={(e) => {
                  if (
                    e.target.value.trim().length < 1 ||
                    e.target.value.trim().length > 100 ||
                    !regex.test(e.target.value)
                  ) {
                    setEmailError(true);
                  }
                }}
                error={emailError}
                helperText={
                  emailError && email?.trim().length > 100
                    ? "Maximum 100 characters allowed."
                    : emailError && !regex.test(email)
                    ? "Please enter valid email."
                    : emailError
                    ? "This is a required field."
                    : ""
                }
                margin="normal"
                variant="standard"
              />
              <Autocomplete
                multiple
                id="tags-standard"
                sx={{ mt: "-10px" }}
                options={departmentDropdown}
                getOptionLabel={(option: LabelValue) => option.label}
                onChange={(e, data: LabelValue[]) => {
                  setDepts(data);
                  setDeptName(data.map((d: LabelValue) => d.value));
                  setDeptError(false);
                }}
                value={depts}
                onBlur={() => {
                  if (deptName.length <= 0) {
                    setDeptError(true);
                  }
                }}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label={
                      <span>
                        Department
                        <span className="!text-defaultRed">&nbsp;*</span>
                      </span>
                    }
                    error={deptError}
                    helperText={deptError ? "This is a required field." : ""}
                  />
                )}
              />
              <TextField
                label="Mobile Number"
                sx={{ mt: "-10px" }}
                fullWidth
                type="number"
                value={tel?.trim().length <= 0 ? "" : tel}
                onChange={(e) => setTel(e.target.value)}
                margin="normal"
                variant="standard"
                onFocus={(e) =>
                  e.target.addEventListener(
                    "wheel",
                    function (e) {
                      e.preventDefault();
                    },
                    { passive: false }
                  )
                }
              />

              {/* Checkbox selection */}
              {departmentDataObj.map((i: DepartmentDataObj, index: number) => (
                <div key={i.index}>
                  <label
                    className={`flex items-center justify-between cursor-pointer`}
                    htmlFor={i.label}
                  >
                    <span className="flex items-center">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={i.checkbox}
                            onChange={(e) => toggleAccordion(e, index)}
                          />
                        }
                        label={i.label}
                        id={i.index.toString()}
                      />
                    </span>
                    {i.isOpen ? (
                      <span
                        className={`transition-transform duration-300 transform rotate-180`}
                      >
                        <ChevronDownIcon />
                      </span>
                    ) : (
                      <span
                        className={`transition-transform duration-300 transform rotate-0`}
                      >
                        <ChevronDownIcon />
                      </span>
                    )}
                  </label>
                  <div
                    className={`${
                      i.isOpen
                        ? "max-h-[430px] transition-all duration-700 pt-[10px]"
                        : "max-h-0 transition-all duration-700"
                    } overflow-hidden`}
                  >
                    <div className="flex flex-col gap-[17px] pl-[34px]">
                      <FormControl variant="standard" error={i.billingErr}>
                        <InputLabel id="demo-simple-select-standard-label">
                          Billing Type
                          <span className="text-defaultRed">&nbsp;*</span>
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-standard-label"
                          id="demo-simple-select-standard"
                          value={i.billingType === 0 ? "" : i.billingType}
                          onChange={(e) => {
                            const updatedDepartmentDataObj = [
                              ...departmentDataObj,
                            ];
                            updatedDepartmentDataObj[index].billingType =
                              Number(e.target.value);
                            updatedDepartmentDataObj[index].billingErr =
                              Number(e.target.value) <= 0;
                            Number(e.target.value) > 0 &&
                              setDepartmentDataObj(updatedDepartmentDataObj);
                          }}
                          onBlur={() => {
                            if (i.billingType > 0) {
                              const updatedDepartmentDataObj = [
                                ...departmentDataObj,
                              ];
                              updatedDepartmentDataObj[index].billingErr =
                                false;
                              setDepartmentDataObj(updatedDepartmentDataObj);
                            } else {
                              const updatedDepartmentDataObj = [
                                ...departmentDataObj,
                              ];
                              updatedDepartmentDataObj[index].billingErr = true;
                              setDepartmentDataObj(updatedDepartmentDataObj);
                            }
                          }}
                        >
                          {billingTypeData.map(
                            (i: LabelValue, index: number) => (
                              <MenuItem value={i.value} key={i.value + index}>
                                {i.label}
                              </MenuItem>
                            )
                          )}
                        </Select>
                        {i.billingErr && (
                          <FormHelperText>
                            This is a required field.
                          </FormHelperText>
                        )}
                      </FormControl>
                      <Autocomplete
                        multiple
                        limitTags={2}
                        id="checkboxes-tags-demo"
                        options={groupTypeData}
                        value={i.group}
                        getOptionLabel={(option: LabelValue) => option.label}
                        getOptionDisabled={(option: LabelValue) =>
                          i.selectGroupValue.includes(option.value)
                        }
                        disableCloseOnSelect
                        onChange={(e, value: LabelValue[]) =>
                          handleMultiSelect(e, value, index)
                        }
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Checkbox
                              icon={icon}
                              checkedIcon={checkedIcon}
                              style={{ marginRight: 8 }}
                              checked={i.selectGroupValue.includes(
                                option.value
                              )}
                            />
                            {option.label}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={
                              <span>
                                Group
                                <span className="text-defaultRed">&nbsp;*</span>
                              </span>
                            }
                            placeholder="Please Select..."
                            variant="standard"
                            error={i.groupErr}
                            onBlur={() => {
                              if (i.selectGroupValue.length > 0) {
                                const updatedDepartmentDataObj = [
                                  ...departmentDataObj,
                                ];
                                updatedDepartmentDataObj[index].groupErr =
                                  false;
                                setDepartmentDataObj(updatedDepartmentDataObj);
                              } else {
                                const updatedDepartmentDataObj = [
                                  ...departmentDataObj,
                                ];
                                updatedDepartmentDataObj[index].groupErr = true;
                                setDepartmentDataObj(updatedDepartmentDataObj);
                              }
                            }}
                            helperText={
                              i.groupErr ? "This is a required field." : ""
                            }
                          />
                        )}
                      />
                      <TextField
                        label={
                          <span>
                            Contracted Hours
                            <span className="!text-defaultRed">&nbsp;*</span>
                          </span>
                        }
                        onFocus={(e) =>
                          e.target.addEventListener(
                            "wheel",
                            function (e) {
                              e.preventDefault();
                            },
                            { passive: false }
                          )
                        }
                        sx={{ mt: "0px" }}
                        type="number"
                        fullWidth
                        value={i.contHrs}
                        onChange={(e) =>
                          handleContHrs(Number(e.target.value), index)
                        }
                        onBlur={(e) => {
                          if (
                            Number(e.target.value) <= 0 ||
                            Number(e.target.value) >= 10000 ||
                            e.target.value.trim().length < 0 ||
                            e.target.value.trim().length > 5 ||
                            e.target.value.trim().includes(".")
                          ) {
                            const updatedDepartmentDataObj = [
                              ...departmentDataObj,
                            ];
                            updatedDepartmentDataObj[index].contHrsErr = true;
                            setDepartmentDataObj(updatedDepartmentDataObj);
                          } else {
                            const updatedDepartmentDataObj = [
                              ...departmentDataObj,
                            ];
                            updatedDepartmentDataObj[index].contHrsErr = false;
                            setDepartmentDataObj(updatedDepartmentDataObj);
                          }
                        }}
                        error={i.contHrsErr}
                        helperText={
                          i.contHrsErr &&
                          (i.contHrs === "0" ||
                            i.contHrs === "00" ||
                            i.contHrs === "000" ||
                            i.contHrs === "0000" ||
                            i.contHrs === "00000" ||
                            i.contHrs === "-0" ||
                            i.contHrs === "-00" ||
                            i.contHrs === "-000" ||
                            i.contHrs === "-0000" ||
                            i.contHrs === "-00000")
                            ? `Contracted Hours should not be ${i.contHrs}.`
                            : i.contHrsErr && Number(i.contHrs) <= 0
                            ? "Contracted Hours must be greater than 0."
                            : (i.contHrsErr &&
                                i.contHrs.toString().includes(".")) ||
                              (i.contHrsErr &&
                                i.contHrs.toString().includes(","))
                            ? "Contracted Hours must be a valid value."
                            : ""
                        }
                        margin="normal"
                        variant="standard"
                      />
                      <TextField
                        label={
                          <span>
                            Internal Hours
                            <span className="!text-defaultRed">&nbsp;*</span>
                          </span>
                        }
                        onFocus={(e) =>
                          e.target.addEventListener(
                            "wheel",
                            function (e) {
                              e.preventDefault();
                            },
                            { passive: false }
                          )
                        }
                        sx={{ mt: "0px" }}
                        type="number"
                        fullWidth
                        value={i.actHrs}
                        onChange={(e) =>
                          handleActualHrs(Number(e.target.value), index)
                        }
                        onBlur={(e) => {
                          if (
                            Number(e.target.value) <= 0 ||
                            Number(e.target.value) >= 10000 ||
                            e.target.value.trim().length > 5 ||
                            e.target.value.trim().includes(".")
                          ) {
                            const updatedDepartmentDataObj = [
                              ...departmentDataObj,
                            ];
                            updatedDepartmentDataObj[index].actHrsErr = true;
                            setDepartmentDataObj(updatedDepartmentDataObj);
                          } else {
                            const updatedDepartmentDataObj = [
                              ...departmentDataObj,
                            ];
                            updatedDepartmentDataObj[index].actHrsErr = false;
                            setDepartmentDataObj(updatedDepartmentDataObj);
                          }
                        }}
                        error={i.actHrsErr}
                        helperText={
                          Number(i.actHrs) > Number(i.contHrs) && i.actHrsErr
                            ? "Internal Hours should be less than or equal to contracted hours."
                            : i.actHrsErr &&
                              (i.actHrs === "0" ||
                                i.actHrs === "00" ||
                                i.actHrs === "000" ||
                                i.actHrs === "0000" ||
                                i.actHrs === "00000" ||
                                i.actHrs === "-0" ||
                                i.actHrs === "-00" ||
                                i.actHrs === "-000" ||
                                i.actHrs === "-0000" ||
                                i.actHrs === "-00000")
                            ? `Internal Hours should not be ${i.actHrs}.`
                            : i.actHrsErr && Number(i.actHrs) <= 0
                            ? "Internal Hours must be greater than 0."
                            : i.actHrsErr &&
                              (i.actHrs.toString().includes(".") ||
                                i.actHrs.toString().includes(","))
                            ? "Internal Hours must be a valid value."
                            : ""
                        }
                        margin="normal"
                        variant="standard"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {isAdditionalFieldsClicked && (
            <>
              <div className="flex flex-row gap-5">
                <TextField
                  label="Owner/CPA Name"
                  fullWidth
                  value={cpaName?.trim().length <= 0 ? "" : cpaName}
                  onChange={(e) => setCpaName(e.target.value)}
                  margin="normal"
                  variant="standard"
                />

                <TextField
                  type="email"
                  label="CPA Email"
                  fullWidth
                  value={cpaEmail?.trim().length <= 0 ? "" : cpaEmail}
                  onChange={(e) => setCpaEmail(e.target.value)}
                  margin="normal"
                  variant="standard"
                />
              </div>

              <div className="flex flex-row gap-5 mt-[-2rem]">
                <TextField
                  label="CPA Mobile Number"
                  fullWidth
                  type="number"
                  value={cpaMobileNo?.trim().length <= 0 ? "" : cpaMobileNo}
                  onChange={(e) => setCpaMobileNo(e.target.value)}
                  margin="normal"
                  variant="standard"
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
                />

                <TextField
                  label="City"
                  fullWidth
                  value={city?.trim().length <= 0 ? "" : city}
                  onChange={(e) => setCity(e.target.value)}
                  margin="normal"
                  variant="standard"
                />
              </div>

              <div className="flex flex-row gap-5 mt-[-2rem]">
                {/* <Select
                    id="State"
                    label="State"
                    defaultValue={state}
                    options={stateList}
                    getValue={(e) => setState(e)}
                    getError={(e) => {}}
                  /> */}

                <TextField
                  label="ZIP Code"
                  type="number"
                  className="w-[19.2rem]"
                  value={zip?.trim().length <= 0 ? "" : zip}
                  onChange={(e) => setZip(e.target.value)}
                  margin="normal"
                  variant="standard"
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
                />
              </div>

              {pocFields.map(
                (
                  field: {
                    Name: string | null;
                    Email: string | null;
                  },
                  index: number
                ) => (
                  <div className="flex flex-row mt-[-2rem]" key={index}>
                    <div className="flex gap-5 w-full">
                      <TextField
                        label="Client POC Name"
                        fullWidth
                        value={
                          field.Name !== null && field.Name?.trim().length <= 0
                            ? ""
                            : field.Name
                        }
                        onChange={(e) =>
                          handleClientPOCNameChange(e.target.value, index)
                        }
                        margin="normal"
                        variant="standard"
                      />

                      <TextField
                        label="CPA Email"
                        type="email"
                        fullWidth
                        value={
                          field.Email !== null &&
                          field.Email?.trim().length <= 0
                            ? ""
                            : field.Email
                        }
                        onChange={(e) =>
                          handleClientPOCEmailChange(e.target.value, index)
                        }
                        margin="normal"
                        variant="standard"
                      />
                    </div>

                    {index === 0 ? (
                      <span className="cursor-pointer" onClick={addTaskField}>
                        <svg
                          className="MuiSvgIcon-root !w-[24px] !h-[24px] !mt-[24px]  mx-[10px] MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root"
                          focusable="false"
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          data-testid="AddIcon"
                        >
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
                        </svg>
                      </span>
                    ) : (
                      <span
                        className="cursor-pointer"
                        onClick={() => removePocField(index)}
                      >
                        <svg
                          className="MuiSvgIcon-root !w-[24px] !h-[24px] !mt-[24px]  mx-[10px] MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root"
                          focusable="false"
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          data-testid="RemoveIcon"
                        >
                          <path d="M19 13H5v-2h14v2z"></path>
                        </svg>
                      </span>
                    )}
                  </div>
                )
              )}

              <div className="flex flex-row gap-5 mt-[-2rem]">
                <TextField
                  label="Client IT POC Name"
                  fullWidth
                  value={
                    clientItPOCName?.trim().length <= 0 ? "" : clientItPOCName
                  }
                  onChange={(e) => setClientItPOCName(e.target.value)}
                  margin="normal"
                  variant="standard"
                />

                <TextField
                  label="Client IT POC Email"
                  type="email"
                  fullWidth
                  value={
                    clientItPOCEmail?.trim().length <= 0 ? "" : clientItPOCEmail
                  }
                  onChange={(e) => setClientItPOCEmail(e.target.value)}
                  margin="normal"
                  variant="standard"
                />
              </div>

              <div className="flex flex-row gap-5 mt-[-2rem]">
                <TextField
                  label="PABS POC Name"
                  fullWidth
                  value={pabsPOCName?.trim().length <= 0 ? "" : pabsPOCName}
                  onChange={(e) => setPabsPOCName(e.target.value)}
                  margin="normal"
                  variant="standard"
                />

                <TextField
                  label="PABS BDM"
                  fullWidth
                  value={pabsBDM?.trim().length <= 0 ? "" : pabsBDM}
                  onChange={(e) => setPabsBDM(e.target.value)}
                  margin="normal"
                  variant="standard"
                />
              </div>

              <div className="flex flex-row gap-5 mt-[-2rem]">
                <TextField
                  label="PABS MANAGER Assigned"
                  fullWidth
                  value={
                    pabsManagerAssigned?.trim().length <= 0
                      ? ""
                      : pabsManagerAssigned
                  }
                  onChange={(e) => setPabsManagerAssigned(e.target.value)}
                  margin="normal"
                  variant="standard"
                />

                <TextField
                  label="Group Email"
                  type="email"
                  fullWidth
                  value={groupEmail?.trim().length <= 0 ? "" : groupEmail}
                  onChange={(e) => setGroupEmail(e.target.value)}
                  margin="normal"
                  variant="standard"
                />
              </div>

              <div className="flex gap-5 mt-[-2rem]">
                <TextField
                  label="SOP Status"
                  fullWidth
                  value={sopStatus?.trim().length <= 0 ? "" : sopStatus}
                  onChange={(e) => setSOPStatus(e.target.value)}
                  margin="normal"
                  variant="standard"
                />

                <div className="inline-flex mt-[13px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date Of Implementation"
                      value={
                        dateOfImplementation === ""
                          ? null
                          : dayjs(dateOfImplementation)
                      }
                      onChange={(newDate: any) =>
                        setDateofImplementation(newDate.$d)
                      }
                      slotProps={{
                        textField: {
                          readOnly: true,
                        } as Record<string, any>,
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>

              <div className="flex gap-5 mt-[-2rem]">
                <div className="inline-flex mt-[13px] mb-[8px] mx-[6px] muiDatepickerCustomizer w-full max-w-[300px]">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Agreement Start Date"
                      value={
                        agreementStartDate === ""
                          ? null
                          : dayjs(agreementStartDate)
                      }
                      onChange={(newDate: any) =>
                        setAgreementStartDate(newDate.$d)
                      }
                      slotProps={{
                        textField: {
                          readOnly: true,
                        } as Record<string, any>,
                      }}
                    />
                  </LocalizationProvider>
                </div>

                <TextField
                  label="FTE Agreement (Tax)"
                  fullWidth
                  value={fteAgreement?.trim().length <= 0 ? "" : fteAgreement}
                  onChange={(e) => setFteAgreement(e.target.value)}
                  margin="normal"
                  variant="standard"
                />
              </div>

              <div className="flex flex-row gap-5 mt-[-2rem]">
                <TextField
                  label="Estimation Workflow"
                  fullWidth
                  value={
                    estimationWorkflow?.trim().length <= 0
                      ? ""
                      : estimationWorkflow
                  }
                  onChange={(e) => setEstimationWorkFlow(e.target.value)}
                  margin="normal"
                  variant="standard"
                />

                <TextField
                  label="VPN Requirement"
                  fullWidth
                  value={
                    vpnRequirement?.trim().length <= 0 ? "" : vpnRequirement
                  }
                  onChange={(e) => setVpnRequirement(e.target.value)}
                  margin="normal"
                  variant="standard"
                />
              </div>

              <div className="flex flex-row gap-5 mt-[-2rem]">
                <TextField
                  label="Remote System Access"
                  fullWidth
                  value={
                    remoteSystemAccess?.trim().length <= 0
                      ? ""
                      : remoteSystemAccess
                  }
                  onChange={(e) => setRemoteSystemAccess(e.target.value)}
                  margin="normal"
                  variant="standard"
                />

                <TextField
                  label="Tax Preparation Software"
                  fullWidth
                  value={
                    taxPreparationSoftware?.trim().length <= 0
                      ? ""
                      : taxPreparationSoftware
                  }
                  onChange={(e) => setTaxPreparationSoftware(e.target.value)}
                  margin="normal"
                  variant="standard"
                />
              </div>

              <div className="flex flex-row gap-5 mt-[-2rem]">
                <TextField
                  label="Document Portal"
                  fullWidth
                  value={
                    documentPortal?.trim().length <= 0 ? "" : documentPortal
                  }
                  onChange={(e) => setDocumentPortal(e.target.value)}
                  margin="normal"
                  variant="standard"
                />

                <TextField
                  label="Workflow Tracker"
                  fullWidth
                  value={
                    workflowTracker?.trim().length <= 0 ? "" : workflowTracker
                  }
                  onChange={(e) => setWorkflowTracker(e.target.value)}
                  margin="normal"
                  variant="standard"
                />
              </div>

              <div className="flex flex-row gap-5 mt-[-2rem]">
                <TextField
                  label="Communication Channel"
                  fullWidth
                  value={
                    communicationChannel?.trim().length <= 0
                      ? ""
                      : communicationChannel
                  }
                  onChange={(e) => setCommunicationChannel(e.target.value)}
                  margin="normal"
                  variant="standard"
                />

                <TextField
                  label="Recurring Call"
                  fullWidth
                  value={recurringCall?.trim().length <= 0 ? "" : recurringCall}
                  onChange={(e) => setRecurringCall(e.target.value)}
                  margin="normal"
                  variant="standard"
                />
              </div>

              <div className="flex flex-row gap-5 mt-[-2rem]">
                <TextField
                  label="Specific Additional Process Step"
                  fullWidth
                  value={
                    specificProcessStep?.trim().length <= 0
                      ? ""
                      : specificProcessStep
                  }
                  onChange={(e) => setSpecificProcessStep(e.target.value)}
                  margin="normal"
                  variant="standard"
                />

                <TextField
                  label="Client Timezone"
                  fullWidth
                  value={
                    clientTimeZone?.trim().length <= 0 ? "" : clientTimeZone
                  }
                  onChange={(e) => setClientTimeZone(e.target.value)}
                  margin="normal"
                  variant="standard"
                />
              </div>

              <div className="flex flex-row gap-5 mt-[-2rem]">
                <TextField
                  label="No. Of Login"
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
                  type="number"
                  className="w-[19.2rem]"
                  value={noOfLogin}
                  onChange={(e) => setNoOfLogin(e.target.value)}
                  margin="normal"
                  variant="standard"
                />

                {/* <Text
                    className="hidden"
                    placeholder="Enter Client Timezone"
                    value={clientTimeZone}
                    getValue={(e) => setClientTimeZone(e)}
                    getError={() => {}}
                    autoComplete="off"
                  /> */}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end fixed w-full bottom-0 py-[15px] bg-pureWhite border-t border-lightSilver">
          {onEdit > 0 ? (
            <Button
              variant="outlined"
              className="rounded-[4px] !h-[36px] !text-secondary"
              onClick={() => {
                clearAllData();
              }}
            >
              Cancel
            </Button>
          ) : (
            <Button
              variant="outlined"
              className="rounded-[4px] !h-[36px] !text-secondary cursor-pointer"
              type="submit"
              onClick={() => setAddMoreClicked(true)}
            >
              Add More
            </Button>
          )}
          <Button
            variant="contained"
            className="rounded-[4px] !h-[36px] !mx-6 !bg-secondary cursor-pointer"
            type="submit"
          >
            {onEdit > 0 ? "Save" : `Create Client`}
          </Button>
        </div>
      </form>
    </>
  );
});

ClientContent.displayName = "ClientContent";
export default ClientContent;
