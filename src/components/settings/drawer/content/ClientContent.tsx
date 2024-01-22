/* eslint-disable react/jsx-key */
/* eslint-disable react/display-name */
import {
  Button,
  CheckBox,
  MultiSelectChip,
  Select,
  Tel,
  Text,
  Email,
  Textarea,
  Datepicker,
} from "next-ts-lib";
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

export interface ClientContentRef {
  clearAllData: () => void;
}

const ClientContent = forwardRef<
  ClientContentRef,
  {
    tab: string;
    onEdit: boolean;
    onClose: () => void;
    clientData: any;
    onDataFetch: any;
    onOpen: boolean;
    onChangeLoader: any;
  }
>(
  (
    { tab, onEdit, onClose, clientData, onOpen, onDataFetch, onChangeLoader },
    ref
  ) => {
    const [departmentData, setDepartmentData] = useState([
      "Tax",
      "Acounting",
      "Audit",
    ]);
    const [departmentDataObj, setDepartmentDataObj] = useState<any>([]);
    const handleClose = () => {
      setDepartmentDataObj([
        ...departmentData.map(
          (i: any, index: any) =>
            new Object({
              id: 0,
              apiId:
                i === "Acounting" ? 1 : i === "Audit" ? 2 : i === "Tax" && 3,
              index: index,
              label: i,
              checkbox: false,
              isOpen: false,
              billingType: 0,
              billingErr: false,
              billingHasErr: true,
              group: [],
              groupErr: false,
              groupHasErr: true,
              contHrs: 0,
              contHrsErr: false,
              contHrsHasErr: true,
              contHrsErrMsg: "",
              actHrs: 0,
              actHrsErr: false,
              actHrsHasErr: true,
              actHrsErrMsg: "",
            })
        ),
      ]);
    };

    useEffect(() => {
      onOpen &&
        departmentDataObj.length < 3 &&
        setDepartmentDataObj([
          ...departmentDataObj,
          ...departmentData.map(
            (i: any, index: any) =>
              new Object({
                id: 0,
                apiId:
                  i === "Acounting" ? 1 : i === "Audit" ? 2 : i === "Tax" && 3,
                index: index,
                label: i,
                checkbox: false,
                isOpen: false,
                billingType: 0,
                billingErr: false,
                billingHasErr: true,
                group: [],
                groupErr: false,
                groupHasErr: true,
                contHrs: 0,
                contHrsErr: false,
                contHrsHasErr: true,
                contHrsErrMsg: "",
                actHrs: 0,
                actHrsErr: false,
                actHrsHasErr: true,
                actHrsErrMsg: "",
              })
          ),
        ]);
    }, [onOpen]);

    const [billingTypeData, setBillingTypeData] = useState([]);
    const [groupTypeData, setGroupTypeData] = useState([]);

    const [Id, setId] = useState(0);
    const [clientName, setClientName] = useState("");
    const [clientError, setClientError] = useState(false);
    const [clientNameHasError, setClientNameHasError] = useState(false);
    const [address, setAddress] = useState("");
    const [addressError, setAddressError] = useState(false);
    const [addressHasError, setAddressHasError] = useState(false);
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [emailHasError, setEmailHasError] = useState(false);
    const [tel, setTel] = useState("");
    const [telError, settelError] = useState(false);

    const [addMoreClicked, setAddMoreClicked] = useState(false);
    const [isAddClientClicked, setIsAddClientClicked] = useState(true);
    const [isAdditionalFieldsClicked, setIsAdditionalFieldsClicked] =
      useState(false);
    const [deletedPocFields, setDeletedPocFields] = useState<any>([]);
    const [pocFields, setPocFields] = useState<any>([
      {
        Name: null,
        Email: null,
      },
    ]);
    const [stateList, setStateList] = useState<string[] | any>([]);
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
    const [dateOfImplementation, setDateofImplementation] = useState<any>("");
    const [agreementStartDate, setAgreementStartDate] = useState<any>("");
    const [fteAgreement, setFteAgreement] = useState<string>("");
    const [estimationWorkflow, setEstimationWorkFlow] = useState<string>("");
    const [vpnRequirement, setVpnRequirement] = useState<string>("");
    const [remoteSystemAccess, setRemoteSystemAccess] = useState<string>("");
    const [taxPreparationSoftware, setTaxPreparationSoftware] =
      useState<string>("");
    const [documentPortal, setDocumentPortal] = useState<string>("");
    const [workflowTracker, setWorkflowTracker] = useState<string>("");
    const [communicationChannel, setCommunicationChannel] =
      useState<string>("");
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

    const handleClientPOCNameChange = (e: any, index: number) => {
      const newPOCFields = [...pocFields];
      newPOCFields[index].Name = e;
      setPocFields(newPOCFields);
    };

    const handleClientPOCEmailChange = (e: any, index: number) => {
      const newPOCFields = [...pocFields];
      newPOCFields[index].Email = e;
      setPocFields(newPOCFields);
    };

    const toggleAccordion = (
      e: React.ChangeEvent<HTMLInputElement>,
      index: any
    ) => {
      const checked = e.target.checked;
      setDepartmentDataObj([
        ...departmentDataObj.map((i: any) =>
          i.index === index
            ? new Object({
                ...i,
                checkbox: checked,
                isOpen: checked,
                billingHasErr: !checked,
                groupHasErr: !checked,
                contHrsHasErr: !checked,
                actHrsHasErr: !checked,
              })
            : i
        ),
      ]);
    };

    useEffect(() => {
      setErrorTrue();
      clearClientData();
      if (clientData && onEdit) {
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
                setClientNameHasError(true);
                setAddress(response.data.ResponseData.Address);
                setAddressHasError(true);
                setEmail(response.data.ResponseData.Email);
                setEmailHasError(true);
                setTel(response.data.ResponseData.ContactNo);
                setId(response.data.ResponseData.Id);
                const updatedFirstArray = departmentDataObj.map((item: any) => {
                  const matchingItem =
                    response.data.ResponseData.WorkTypes.find(
                      (secondItem: any) =>
                        secondItem.WorkTypeId === item.apiId ? true : false
                    );

                  if (matchingItem) {
                    return {
                      ...item,
                      apiId: matchingItem.WorkTypeId,
                      id: matchingItem.ClientWorkTypeId,
                      checkbox: true,
                      isOpen: true,
                      billingType: matchingItem.BillingTypeId,
                      billingHasErr: true,
                      group: matchingItem.GroupIds,
                      groupHasErr: true,
                      contHrs: matchingItem.ContractHrs,
                      contHrsHasErr: true,
                      actHrs: matchingItem.InternalHrs,
                      actHrsHasErr: true,
                    };
                  }

                  return item;
                });
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
                    : dayjs(
                        response.data.ResponseData.AgreementStartDate
                      ).format("MM/DD/YYYY")
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
    }, [clientData, onEdit, onOpen]);

    const handleContHrs = (e: any, index: any) => {
      if (e.length <= 5) {
        setDepartmentDataObj([
          ...departmentDataObj.map((i: any) =>
            i.index === index
              ? new Object({
                  ...i,
                  contHrs: e,
                })
              : i
          ),
        ]);
      }
    };

    const handleActualHrs = (e: any, index: any) => {
      if (e.length <= 5) {
        setDepartmentDataObj([
          ...departmentDataObj.map((i: any) =>
            i.index === index
              ? new Object({
                  ...i,
                  actHrs: e,
                })
              : i
          ),
        ]);
      }
    };

    const handleSubmit = (e: { preventDefault: () => void }) => {
      e.preventDefault();

      clientName.trim().length <= 0 && setClientError(true);
      address.trim().length <= 0 && setAddressError(true);
      email.trim().length <= 0 && setEmailError(true);

      setDepartmentDataObj([
        ...departmentDataObj.map((i: any) =>
          i.checkbox === true
            ? new Object({
                ...i,
                billingErr: i.billingType <= 0 ? true : false,
                groupErr: i.group.length === 0 ? true : false,
                contHrsErr:
                  i.contHrs <= 0
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
                contHrsErrMsg:
                  i.contHrs <= 0
                    ? "Contracted Hours must be greater than 0."
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
                    ? `Contracted Hours should not be ${i.contHrs}.`
                    : i.contHrs.toString().includes(".") ||
                      i.contHrs.toString().includes(",")
                    ? "Contracted Hours must be a valid value."
                    : "",
                actHrsErr:
                  i.actHrs <= 0
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
                actHrsErrMsg:
                  i.actHrs <= 0
                    ? "Internal Hours must be greater than 0."
                    : Number(i.actHrs) > Number(i.contHrs)
                    ? "Internal Hours should be less than or equal to contracted hours."
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
                    ? `Internal Hours should not be ${i.actHrs}.`
                    : i.actHrs.toString().includes(".") ||
                      i.actHrs.toString().includes(",")
                    ? "Internal Hours must be a valid value."
                    : "",
              })
            : i
        ),
      ]);

      const timeGrater = departmentDataObj
        .map((i: any) => Number(i.actHrs) > Number(i.contHrs))
        .includes(true);

      const isChecked = departmentDataObj
        .map((i: any) => (i.checkbox === true ? i.index : false))
        .filter((j: any) => j !== false);

      const hasError = departmentDataObj.map((i: any) =>
        i.billingHasErr && i.groupHasErr && i.contHrsHasErr && i.actHrsHasErr
          ? i.index
          : false
      );

      if (
        emailHasError &&
        clientNameHasError &&
        addressHasError &&
        isChecked.length > 0 &&
        !hasError.includes(false) &&
        !timeGrater
      ) {
        saveClient();
      } else if (
        emailHasError &&
        clientNameHasError &&
        addressHasError &&
        isChecked.length <= 0
      ) {
        toast.error("Please Select at least one work type.");
      }
    };

    const setErrorTrue = () => {
      setClientError(true);
      setAddressError(true);
      setEmailError(true);
      settelError(true);
    };

    const clearClientData = () => {
      setId(0);
      setClientName("");
      setClientError(false);
      setClientNameHasError(false);
      setAddress("");
      setAddressError(false);
      setAddressHasError(false);
      setEmail("");
      setEmailError(false);
      settelError(false);
      setEmailHasError(false);
      setTel("");
      departmentDataObj.length < 3 &&
        setDepartmentDataObj([
          ...departmentDataObj,
          ...departmentData.map(
            (i: any, index: any) =>
              new Object({
                id: 0,
                apiId:
                  i === "Acounting" ? 1 : i === "Audit" ? 2 : i === "Tax" && 3,
                index: index,
                label: i,
                checkbox: false,
                isOpen: false,
                billingType: 0,
                billingErr: false,
                billingHasErr: true,
                group: [],
                groupErr: false,
                groupHasErr: true,
                contHrs: 0,
                contHrsErr: false,
                contHrsHasErr: true,
                contHrsErrMsg: "",
                actHrs: 0,
                actHrsErr: false,
                actHrsHasErr: true,
                actHrsErrMsg: "",
              })
          ),
        ]);

      setPocFields([
        {
          Name: null,
          email: null,
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
      const token = await localStorage.getItem("token");
      const Org_Token = await localStorage.getItem("Org_Token");

      const getFieldValue = (condition: any, value: any) => {
        return condition && value.trim() !== "" ? value.trim() : null;
      };

      try {
        const workTypes = departmentDataObj
          .map((i: any) =>
            i.checkbox === true
              ? new Object({
                  ClientWorkTypeId: i.id,
                  workTypeId: i.apiId,
                  billingTypeId: i.billingType,
                  groupIds: i.group,
                  layoutId: 1,
                  internalHrs: i.actHrs,
                  contractHrs: i.contHrs,
                })
              : false
          )
          .filter((j: any) => j !== false);

        onChangeLoader(true);

        const response = await axios.post(
          `${process.env.pms_api_url}/client/save`,
          {
            id: Id || 0,
            Name: clientName,
            email: email.trim(),
            contactNo: tel,
            address: address.trim(),
            isActive: true,

            WorkTypes: workTypes.length > 0 ? workTypes : null,

            OwnerAndCPAName: getFieldValue(
              isAdditionalFieldsClicked,
              cpaName.trim()
            ),
            OwnerEmail: getFieldValue(
              isAdditionalFieldsClicked,
              cpaEmail.trim()
            ),
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
              dateOfImplementation
            ),
            AgreementStartDate: getFieldValue(
              isAdditionalFieldsClicked,
              agreementStartDate
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
              `Client ${onEdit ? "Updated" : "created"} successfully.`
            );
            setErrorTrue();
            clearClientData();
            handleClose();
            onDataFetch();
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
      setDepartmentDataObj([
        ...departmentDataObj.map(
          (i: any) =>
            new Object({
              ...i,
              billingErr: true,
              groupErr: true,
              contHrsErr: true,
              actHrsErr: true,
              contHrsErrMsg: "",
              actHrsErrMsg: "",
            })
        ),
      ]);
      await setErrorTrue();
      await clearClientData();
      handleClose();
      onClose();
    };

    useImperativeHandle(ref, () => ({
      clearAllData,
    }));

    useEffect(() => {
      if (onOpen) {
        getBillingTypes();
        getGroupTypes();
        getStates();
      }
    }, [onOpen]);

    const getBillingTypes = async () => {
      const token = await localStorage.getItem("token");
      const Org_Token = await localStorage.getItem("Org_Token");
      try {
        const response = await axios.get(
          `${process.env.pms_api_url}/BillingType/GetDropdown`,
          {
            headers: {
              Authorization: `bearer ${token}`,
              org_token: `${Org_Token}`,
            },
          }
        );

        if (response.status === 200) {
          if (response.data.ResponseStatus === "Success") {
            setBillingTypeData(response.data.ResponseData);
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
                <Text
                  label="Client Name"
                  placeholder="Enter Client Name"
                  validate
                  value={clientName}
                  getValue={(e) => setClientName(e)}
                  getError={(e) => setClientNameHasError(e)}
                  hasError={clientError}
                  autoComplete="off"
                  minChar={2}
                  maxChar={50}
                />
                <Textarea
                  label="Address"
                  placeholder="Enter Address"
                  validate
                  value={address}
                  getValue={(e) => setAddress(e)}
                  getError={(e) => setAddressHasError(e)}
                  hasError={addressError}
                  autoComplete="off"
                  maxChar={300}
                  rows={1}
                />
                <Email
                  label="Email"
                  type="email"
                  placeholder="Enter Email ID"
                  validate
                  value={email}
                  getValue={(e) => setEmail(e)}
                  getError={(e) => setEmailHasError(e)}
                  hasError={emailError}
                  autoComplete="off"
                  minChar={5}
                  maxChar={100}
                />
                <Text
                  className="telPadding"
                  value={tel}
                  getValue={(e) => setTel(e)}
                  hasError={telError}
                  placeholder="Enter Mobile No."
                  label="Mobile Number"
                  getError={() => {}}
                />

                {/* Checkbox selection */}
                {departmentDataObj.map((i: any, index: any) => (
                  <div key={i.index}>
                    <label
                      className={`flex items-center justify-between cursor-pointer`}
                      htmlFor={i.label}
                    >
                      <span className="flex items-center">
                        <CheckBox
                          checked={i.checkbox}
                          id={i.index}
                          label={i.label}
                          onChange={(e: any) => toggleAccordion(e, index)}
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
                        <Select
                          id="billing_type"
                          label="Billing Type"
                          defaultValue={i.billingType}
                          options={billingTypeData}
                          onSelect={() => {}}
                          getValue={(e) => {
                            const updatedDepartmentDataObj = [
                              ...departmentDataObj,
                            ];
                            updatedDepartmentDataObj[index].billingType = e;
                            updatedDepartmentDataObj[index].billingErr = e <= 0;
                            setDepartmentDataObj(updatedDepartmentDataObj);
                          }}
                          getError={(e) => {
                            const updatedDepartmentDataObj = [
                              ...departmentDataObj,
                            ];
                            updatedDepartmentDataObj[index].billingHasErr = e;
                            setDepartmentDataObj(updatedDepartmentDataObj);
                          }}
                          hasError={i.billingErr}
                          validate
                          errorClass="!-mt-[15px]"
                          search
                        />
                        <MultiSelectChip
                          type="checkbox"
                          id="group"
                          label="Group"
                          defaultValue={i.group}
                          options={groupTypeData}
                          onSelect={() => {}}
                          getValue={(e) => {
                            const updatedDepartmentDataObj = [
                              ...departmentDataObj,
                            ];
                            updatedDepartmentDataObj[index].group = e;
                            updatedDepartmentDataObj[index].groupErr =
                              e.length <= 0;
                            setDepartmentDataObj(updatedDepartmentDataObj);
                          }}
                          getError={(e) => {
                            const updatedDepartmentDataObj = [
                              ...departmentDataObj,
                            ];
                            updatedDepartmentDataObj[index].groupHasErr = e;
                            setDepartmentDataObj(updatedDepartmentDataObj);
                          }}
                          hasError={i.groupErr}
                          validate
                          errorClass="!-mt-[15px]"
                        />
                        <Text
                          className="[appearance:number] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          type="number"
                          label="Contracted Hours"
                          placeholder="Enter Total Contracted Hours"
                          validate
                          maxLength={5}
                          maxChar={5}
                          value={i.contHrs === 0 ? "" : i.contHrs}
                          getValue={(e) => handleContHrs(e, index)}
                          getError={(e) => {
                            const updatedDepartmentDataObj = [
                              ...departmentDataObj,
                            ];
                            updatedDepartmentDataObj[index].contHrsHasErr = e;
                            setDepartmentDataObj(updatedDepartmentDataObj);
                          }}
                          hasError={i.contHrsErr}
                          errorMessage={i.contHrsErrMsg}
                          noText
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                        <Text
                          className="[appearance:number] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          type="number"
                          label="Internal Hours"
                          placeholder="Enter Total Internal Hours"
                          validate
                          maxLength={5}
                          value={i.actHrs === 0 ? "" : i.actHrs}
                          getValue={(e) => handleActualHrs(e, index)}
                          getError={(e) => {
                            const updatedDepartmentDataObj = [
                              ...departmentDataObj,
                            ];
                            updatedDepartmentDataObj[index].actHrsHasErr = e;
                            setDepartmentDataObj(updatedDepartmentDataObj);
                          }}
                          hasError={i.actHrsErr}
                          errorMessage={i.actHrsErrMsg}
                          noText
                          onWheel={(e) => e.currentTarget.blur()}
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
                  <Text
                    label="Owner/CPA Name"
                    placeholder="Enter Owner/CPA Name"
                    value={cpaName}
                    getValue={(e) => setCpaName(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />

                  <Email
                    label="CPA Email"
                    type="email"
                    placeholder="Enter CPA Email"
                    value={cpaEmail}
                    getValue={(e) => setCpaEmail(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />
                </div>

                <div className="flex flex-row gap-5">
                  <Tel
                    label="CPA Mobile Number"
                    placeholder="Enter CPA Mobile No."
                    value={cpaMobileNo}
                    getValue={(e) => setCpaMobileNo(e)}
                    getError={() => {}}
                    autoComplete="off"
                    maxLength={14}
                  />

                  <Text
                    label="City"
                    placeholder="Enter City"
                    value={city}
                    getValue={(e) => setCity(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />
                </div>

                <div className="flex flex-row gap-5">
                  <Select
                    id="State"
                    label="State"
                    defaultValue={state}
                    options={stateList}
                    getValue={(e) => setState(e)}
                    getError={(e) => {}}
                  />

                  <Text
                    label="ZIP Code"
                    placeholder="Enter ZIP Code"
                    type="number"
                    value={zip}
                    getValue={(e) => setZip(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />
                </div>

                {pocFields.map(
                  (
                    field: {
                      Name: string | undefined;
                      Email: string | undefined;
                    },
                    index: any
                  ) => (
                    <div className="flex flex-row" key={index}>
                      <div className="flex gap-5 w-full">
                        <Text
                          label="Client POC Name"
                          placeholder="Enter Client POC Name"
                          value={field.Name}
                          getValue={(e) => handleClientPOCNameChange(e, index)}
                          getError={() => {}}
                          autoComplete="off"
                        />

                        <Email
                          label="CPA Email"
                          type="Email"
                          placeholder="Enter CPA Email"
                          value={field.Email}
                          getValue={(e) => handleClientPOCEmailChange(e, index)}
                          getError={() => {}}
                          autoComplete="off"
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

                <div className="flex flex-row gap-5">
                  <Text
                    label="Client IT POC Name"
                    placeholder="Enter Client IT POC Name"
                    value={clientItPOCName}
                    getValue={(e) => setClientItPOCName(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />

                  <Email
                    label="Client IT POC Email"
                    type="email"
                    placeholder="Enter Client IT POC Email"
                    value={clientItPOCEmail}
                    getValue={(e) => setClientItPOCEmail(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />
                </div>

                <div className="flex flex-row gap-5">
                  <Text
                    label="PABS POC Name"
                    placeholder="Enter PABS POC Name"
                    value={pabsPOCName}
                    getValue={(e) => setPabsPOCName(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />

                  <Text
                    label="PABS BDM"
                    placeholder="Enter PABS BDM"
                    value={pabsBDM}
                    getValue={(e) => setPabsBDM(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />
                </div>

                <div className="flex flex-row gap-5">
                  <Text
                    label="PABS MANAGER Assigned"
                    placeholder="Enter PABS MANAGER Assigned"
                    value={pabsManagerAssigned}
                    getValue={(e) => setPabsManagerAssigned(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />

                  <Email
                    label="Group Email"
                    type="email"
                    placeholder="Enter Group Email"
                    value={groupEmail}
                    getValue={(e) => setGroupEmail(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />
                </div>

                <div className="flex gap-5">
                  <Text
                    label="SOP Status"
                    placeholder="Enter SOP Status"
                    value={sopStatus}
                    getValue={(e) => setSOPStatus(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />

                  <span className="w-full">
                    <Datepicker
                      label="Date Of Implementation"
                      startYear={1990}
                      endYear={2080}
                      value={dateOfImplementation}
                      getValue={(e) => setDateofImplementation(e)}
                      id="Date Of Implementation"
                      getError={() => {}}
                      format="mm/dd/yyyy"
                    />
                  </span>
                </div>

                <div className="flex gap-5">
                  <span className="w-full">
                    <Datepicker
                      label="Agreement Start Date"
                      startYear={1990}
                      endYear={2080}
                      value={agreementStartDate}
                      getValue={(e) => setAgreementStartDate(e)}
                      id="Agreement Start Date"
                      getError={() => {}}
                      format="mm/dd/yyyy"
                    />
                  </span>

                  <Text
                    label="FTE Agreement (Tax)"
                    placeholder="Enter FTE Agreement (Tax)"
                    value={fteAgreement}
                    getValue={(e) => setFteAgreement(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />
                </div>

                <div className="flex flex-row gap-5">
                  <Text
                    label="Estimation Workflow"
                    placeholder="Enter Estimation Workflow"
                    value={estimationWorkflow}
                    getValue={(e) => setEstimationWorkFlow(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />

                  <Text
                    label="VPN Requirement"
                    placeholder="Enter VPN Requirement"
                    value={vpnRequirement}
                    getValue={(e) => setVpnRequirement(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />
                </div>

                <div className="flex flex-row gap-5">
                  <Text
                    label="Remote System Access"
                    placeholder="Enter Remote System Access"
                    value={remoteSystemAccess}
                    getValue={(e) => setRemoteSystemAccess(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />

                  <Text
                    label="Tax Preparation Software"
                    placeholder="Enter Tax Preparation Software"
                    value={taxPreparationSoftware}
                    getValue={(e) => setTaxPreparationSoftware(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />
                </div>

                <div className="flex flex-row gap-5">
                  <Text
                    label="Document Portal"
                    placeholder="Enter Document Portal"
                    value={documentPortal}
                    getValue={(e) => setDocumentPortal(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />

                  <Text
                    label="Workflow Tracker"
                    placeholder="Enter Workflow Tracker"
                    value={workflowTracker}
                    getValue={(e) => setWorkflowTracker(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />
                </div>

                <div className="flex flex-row gap-5">
                  <Text
                    label="Communication Channel"
                    placeholder="Enter Communication Channel"
                    value={communicationChannel}
                    getValue={(e) => setCommunicationChannel(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />

                  <Text
                    label="Recurring Call"
                    placeholder="Enter Recurring Call"
                    value={recurringCall}
                    getValue={(e) => setRecurringCall(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />
                </div>

                <div className="flex flex-row gap-5">
                  <Text
                    label="Specific Additional Process Step"
                    placeholder="Enter Specific Additional Process Step"
                    value={specificProcessStep}
                    getValue={(e) => setSpecificProcessStep(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />

                  <Text
                    label="Client Timezone"
                    placeholder="Enter Client Timezone"
                    value={clientTimeZone}
                    getValue={(e) => setClientTimeZone(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />
                </div>

                <div className="flex flex-row gap-5">
                  <Text
                    className="[appearance:number] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    type="number"
                    label="No. Of Login"
                    placeholder="Enter No. Of Login"
                    value={noOfLogin}
                    getValue={(e) => setNoOfLogin(e)}
                    getError={() => {}}
                    autoComplete="off"
                    noText
                    onWheel={(e) => e.currentTarget.blur()}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                    }}
                  />

                  <Text
                    className="hidden"
                    placeholder="Enter Client Timezone"
                    value={clientTimeZone}
                    getValue={(e) => setClientTimeZone(e)}
                    getError={() => {}}
                    autoComplete="off"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end fixed w-full bottom-0 gap-[20px] px-[20px] py-[15px] bg-pureWhite border-t border-lightSilver">
            {onEdit ? (
              <Button
                variant="btn-outline-primary"
                className="rounded-[4px] !h-[36px]"
                onClick={() => {
                  clearAllData();
                }}
              >
                Cancel
              </Button>
            ) : (
              <Button
                variant="btn-outline-primary"
                className="rounded-[4px] !h-[36px]"
                type="submit"
                onClick={() => setAddMoreClicked(true)}
              >
                Add More
              </Button>
            )}
            <Button
              variant="btn-primary"
              className="rounded-[4px] !h-[36px]"
              type="submit"
            >
              {onEdit
                ? "Save"
                : `Create ${tab === "Permissions" ? "Role" : tab}`}
            </Button>
          </div>
        </form>
      </>
    );
  }
);

export default ClientContent;
