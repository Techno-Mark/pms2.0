import { Autocomplete, Button, Checkbox, TextField } from "@mui/material";
import axios from "axios";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { toast } from "react-toastify";
import { callAPI } from "@/utils/API/callAPI";
import { Radio } from "next-ts-lib";
import { LabelValue, LabelValueType } from "@/utils/Types/types";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export interface UserContentRef {
  clearAllData: () => void;
}

const UserContent = forwardRef<
  UserContentRef,
  {
    onEdit: number;
    onOpen: boolean;
    onClose: () => void;
    onUserDataFetch: (() => void) | null;
    onChangeLoader: (e: boolean) => void;
  }
>(({ onEdit, onOpen, onClose, onUserDataFetch, onChangeLoader }, ref) => {
  const [value, setValue] = useState("Employee");
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [addMoreClicked, setAddMoreClicked] = useState(false);
  const roleIdAdmin: any = localStorage.getItem("roleId");

  // for Employee
  const [userId, setUserId] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastName, setLastName] = useState("");
  const [lastNameError, setLastNameError] = useState(false);
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [tel, setTel] = useState("");
  const [typeOfWork, setTypeOfWork] = useState(0);
  const [typeOfWorkError, setTypeOfWorkError] = useState(false);
  const [role, setRole] = useState(0);
  const [roleError, setRoleError] = useState(false);
  const [department, setDepartment] = useState(0);
  const [departmentError, setDepartmentError] = useState(false);
  const [report, setReport] = useState(0);
  const [reportError, setReportError] = useState(false);
  const [selectGroupValue, setSelectGroupValue] = useState<number[]>([]);
  const [selectedGroupOptions, setSelectGroupOptions] = useState<LabelValue[]>(
    []
  );
  const [groupError, setGroupError] = useState(false);
  const [typeOfWorkDropdownData, setTypeOfWorkDropdownData] = useState<
    LabelValue[]
  >([]);
  const [roleDropdownData, setRoleDropdownData] = useState([]);
  const [departmentDropdownData, setDepartmentDropdownData] = useState([]);
  const [groupDropdownData, setGroupDropdownData] = useState([]);
  const [reportManagerDropdownData, setReportManagerDropdownData] = useState(
    []
  );

  // For client
  const [clientName, setClientName] = useState(0);
  const [clientNameError, setClientNameError] = useState(false);
  const [clientFirstName, setClientFirstName] = useState("");
  const [clientFirstNameError, setClientFirstNameError] = useState(false);
  const [clientLastName, setClientLastName] = useState("");
  const [clientLastNameError, setClientLastNameError] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [clientEmailError, setClientEmailError] = useState(false);
  const [clientRole, setClientRole] = useState(0);
  const [clientRoleError, setClientRoleError] = useState(false);
  const [clientTel, setClientTel] = useState("");

  const [clientDropdownData, setClientDropdownData] = useState([]);

  useEffect(() => {
    if (onEdit > 0) {
      const getData = async () => {
        const token = await localStorage.getItem("token");
        const Org_Token = await localStorage.getItem("Org_Token");
        try {
          const response = await axios.post(
            `${process.env.api_url}/user/GetById`,
            {
              UserId: onEdit,
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
              const data = await response.data.ResponseData;
              if (data.IsClientUser === false) {
                setValue("Employee");
                setEmailConfirmed(data.EmailConfirmed);
                setUserId(data.UserId);
                setFirstName(data.FirstName);
                setLastName(data.LastName);
                setEmail(data.Email);
                setTel(data.ContactNo);
                setTypeOfWork(data.WorkTypeId);
                setRole(data.RoleId);
                setDepartment(data.DepartmentId);
                setReport(
                  data.ReportingManagerId === null ? 0 : data.ReportingManagerId
                );
                setSelectGroupValue(data.GroupIds);
              } else {
                setValue("Client");
                setEmailConfirmed(data.EmailConfirmed);
                setUserId(data.UserId);
                setClientName(data.ClientId);
                setClientFirstName(data.FirstName);
                setClientLastName(data.LastName);
                setClientEmail(data.Email);
                setClientTel(data.ContactNo);
                setClientRole(data.RoleId);
              }
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
              toast.error("Login failed. Please try again.");
            } else {
              toast.error(data);
            }
          }
        } catch (error) {
          console.error(error);
        }
      };

      getData();
    } else {
      setFirstName("");
      setLastName("");
      setEmail("");
      setTel("");
      setTypeOfWork(0);
      setRole(0);
      setDepartment(0);
      setReport(0);
    }
    clearDataClient();
    clearDataEmployee();
  }, [onEdit, onClose]);

  useEffect(() => {
    const getData = async (api: string) => {
      const token = await localStorage.getItem("token");
      const Org_Token = await localStorage.getItem("Org_Token");
      try {
        let response: any;
        if (api === "/user/GetRMUserDropdown") {
          response = await axios.post(
            `${process.env.api_url}/user/GetRMUserDropdown`,
            {
              WorkTypeId: typeOfWork,
              UserId: userId,
            },
            {
              headers: {
                Authorization: `bearer ${token}`,
                org_token: `${Org_Token}`,
              },
            }
          );
        } else {
          response = await axios.get(`${process.env.pms_api_url}${api}`, {
            headers: {
              Authorization: `bearer ${token}`,
              org_token: `${Org_Token}`,
            },
          });
        }

        if (response.status === 200) {
          if (response.data.ResponseStatus === "Success") {
            if (api === "/client/getdropdown") {
              setClientDropdownData(response.data.ResponseData);
            }
            if (api === "/department/getdropdown") {
              setDepartmentDropdownData(response.data.ResponseData);
            }
            if (api === "/Role/GetDropdown") {
              setRoleDropdownData(response.data.ResponseData);
            }
            if (api === "/group/getdropdown") {
              setGroupDropdownData(response.data.ResponseData);
              const filteredOptionsData = response.data.ResponseData.filter(
                (d: LabelValue) => {
                  return selectGroupValue.some((id: number) => {
                    return id === Number(d.value);
                  });
                }
              );
              setSelectGroupOptions(filteredOptionsData);
            }
            if (api === "/user/GetRMUserDropdown") {
              setReportManagerDropdownData(response.data.ResponseData);
            }
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
            toast.error("Please try again.");
          } else {
            toast.error(data);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    const getWorkTypeData = async () => {
      const params = {
        ClientId: null,
        OrganizationId: await localStorage.getItem("Org_Id"),
      };
      const url = `${process.env.pms_api_url}/WorkType/GetDropdown`;
      const successCallback = async (
        ResponseData: LabelValue[],
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setTypeOfWorkDropdownData(ResponseData);
        } else {
          onChangeLoader(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    };

    onOpen && getWorkTypeData();
    onOpen && getData("/client/getdropdown");
    onOpen && getData("/department/getdropdown");
    onOpen && getData("/Role/GetDropdown");
    onOpen && getData("/group/getdropdown");
    onOpen && typeOfWork > 0 && getData("/user/GetRMUserDropdown");
  }, [typeOfWork, userId, onOpen]);

  const clearDataEmployee = () => {
    setUserId(0);
    setFirstName("");
    setFirstNameError(false);
    setLastName("");
    setLastNameError(false);
    setEmail("");
    setEmailError(false);
    setTel("");
    setTypeOfWork(0);
    setTypeOfWorkError(false);
    setRole(0);
    setRoleError(false);
    setDepartment(0);
    setDepartmentError(false);
    setReport(0);
    setReportError(false);
    setSelectGroupOptions([]);
    setSelectGroupValue([]);
    setGroupError(false);
    setEmailConfirmed(false);
    setReportManagerDropdownData([]);
  };

  const saveUser = async () => {
    onChangeLoader(true);
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");
    try {
      const response = await axios.post(
        `${process.env.api_url}/user/Save`,
        {
          UserId: userId,
          ClientId: 0,
          FirstName: firstName.trim(),
          LastName: lastName.trim(),
          Email: email.trim(),
          ContactNo: tel,
          WorkTypeId: typeOfWork === 0 ? null : typeOfWork,
          RoleId: role === 0 ? null : role,
          DepartmentId: department === 0 ? null : department,
          ReportingManagerId: report === 0 ? null : report,
          GroupIds: selectGroupValue,
          IsClientUser: false,
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
            `User ${onEdit > 0 ? "Updated" : "created"} successfully.`
          );
          await onUserDataFetch?.();
          await clearDataEmployee();
          onChangeLoader(false);
          {
            !addMoreClicked && onClose();
          }
        } else {
          onChangeLoader(false);
          const data = response.data.Message;
          if (data === null) {
            toast.error("Please try again later.");
          } else {
            toast.error(data);
          }
        }
      } else {
        onChangeLoader(false);
        const data = response.data.Message;
        if (data === null) {
          toast.error("Failed Please try again.");
        } else {
          toast.error(data);
        }
      }
    } catch (error) {
      onChangeLoader(false);
      console.error(error);
    }
  };

  const clearDataClient = () => {
    setUserId(0);
    setClientNameError(false);
    setClientName(0);
    setClientFirstName("");
    setClientFirstNameError(false);
    setClientLastName("");
    setClientLastNameError(false);
    setClientEmail("");
    setClientEmailError(false);
    setClientRole(0);
    setClientRoleError(false);
    setClientTel("");
    setRole(0);
    setDepartment(0);
    setReport(0);
    setEmailConfirmed(false);
  };

  const saveClient = async () => {
    onChangeLoader(true);
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");
    try {
      const response = await axios.post(
        `${process.env.api_url}/user/Save`,
        {
          UserId: userId,
          ClientId: clientName,
          FirstName: clientFirstName.trim(),
          LastName: clientLastName.trim(),
          Email: clientEmail.trim(),
          ContactNo: clientTel,
          RoleId: clientRole,
          DepartmentId: 0,
          RMId: 0,
          GroupIds: [],
          IsClientUser: true,
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
          onChangeLoader(false);
          onUserDataFetch?.();
          clearDataClient();
          {
            !addMoreClicked && onClose();
          }
          toast.success(
            `User ${onEdit > 0 ? "Updated" : "created"} successfully.`
          );
        } else {
          onChangeLoader(false);
          const data = response.data.Message;
          if (data === null) {
            toast.error("Please try again later.");
          } else {
            toast.error(data);
          }
        }
      } else {
        onChangeLoader(false);
        const data = response.data.Message;
        if (data === null) {
          toast.error("Failed Please try again.");
        } else {
          toast.error(data);
        }
      }
    } catch (error) {
      onChangeLoader(false);
      console.error(error);
    }
  };

  const clearAllData = async () => {
    await clearDataEmployee();
    await clearDataClient();
    onClose();
  };

  useImperativeHandle(ref, () => ({
    clearAllData,
  }));

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (value === "Employee") {
      firstName.trim().length <= 0 && setFirstNameError(true);
      lastName.trim().length <= 0 && setLastNameError(true);
      email.trim().length <= 0 && setEmailError(true);
      email.trim().length > 100 && setEmailError(true);
      typeOfWork <= 0 && setTypeOfWorkError(true);
      role <= 0 && setRoleError(true);
      department <= 0 && setDepartmentError(true);
      report <= 0 && parseInt(roleIdAdmin) > 1 && setReportError(true);
      selectGroupValue.length <= 0 && setGroupError(true);
      setEmailError(!regex.test(email));
      if (
        !firstNameError &&
        firstName.trim().length > 2 &&
        firstName.trim().length < 50 &&
        !lastNameError &&
        lastName.trim().length > 2 &&
        lastName.trim().length < 50 &&
        !emailError &&
        email.trim().length > 0 &&
        email.trim().length < 100 &&
        typeOfWork > 0 &&
        !typeOfWorkError &&
        role !== 0 &&
        !roleError &&
        department !== 0 &&
        !departmentError &&
        report !== 0 &&
        !reportError &&
        selectGroupValue.length > 0 &&
        !groupError
      ) {
        if (parseInt(roleIdAdmin) > 1) {
          report !== 0 && saveUser();
        } else {
          saveUser();
        }
      }
    } else if (value === "Client") {
      clientName <= 0 && setClientNameError(true);
      clientFirstName.trim().length <= 0 && setClientFirstNameError(true);
      clientLastName.trim().length <= 0 && setClientLastNameError(true);
      clientEmail.trim().length <= 0 && setClientEmailError(true);
      clientRole <= 0 && setClientRoleError(true);

      if (
        !clientNameError &&
        clientName > 0 &&
        !clientFirstNameError &&
        clientFirstName.trim().length > 2 &&
        clientFirstName.trim().length < 50 &&
        !clientLastNameError &&
        clientLastName.trim().length > 2 &&
        clientLastName.trim().length < 50 &&
        !clientEmailError &&
        clientEmail.trim().length > 0 &&
        clientEmail.trim().length < 100 &&
        !clientRoleError &&
        clientRole > 0
      ) {
        saveClient();
      }
    }
  };

  const handleMultiSelect = (e: React.SyntheticEvent, value: LabelValue[]) => {
    if (value !== undefined) {
      const selectedValue = value.map((v: LabelValue) => v.value);
      setSelectGroupOptions(value);
      setSelectGroupValue(selectedValue);
      setGroupError(false);
    } else {
      setSelectGroupValue([]);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <span className="flex flex-row items-center my-[20px] w-28 gap-5 pl-2">
        {onEdit > 0 ? (
          <>
            {value === "Employee" ? (
              <>
                <Radio
                  label="Employee"
                  checked
                  id="Employee"
                  name="user"
                  onChange={(e) => {}}
                />
                <span className="mr-32">
                  <Radio
                    label="Client"
                    id="Client"
                    disabled
                    name="user"
                    onChange={(e) => {}}
                  />
                </span>
              </>
            ) : (
              <>
                <Radio
                  label="Employee"
                  disabled
                  id="Employee"
                  name="user"
                  onChange={(e) => {}}
                />
                <span className="mr-32">
                  <Radio
                    label="Client"
                    id="Client"
                    checked
                    name="user"
                    onChange={(e) => {}}
                  />
                </span>
              </>
            )}
          </>
        ) : (
          <>
            <Radio
              label="Employee"
              checked={value === "Employee" ? true : false}
              id="Employee"
              name="user"
              onChange={(e) => setValue(e.target.id)}
            />
            <span className="mr-32">
              <Radio
                label="Client"
                checked={value === "Client" ? true : false}
                id="Client"
                name="user"
                onChange={(e) => setValue(e.target.id)}
              />
            </span>
          </>
        )}
      </span>

      <div className="flex flex-col px-[20px] max-h-[64vh] overflow-y-auto">
        {value === "Employee" && (
          <>
            <TextField
              label={
                <span>
                  First Name
                  <span className="!text-defaultRed">&nbsp;*</span>
                </span>
              }
              fullWidth
              value={firstName?.trim().length <= 0 ? "" : firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setFirstNameError(false);
              }}
              onBlur={(e) => {
                if (
                  e.target.value.trim().length < 3 ||
                  e.target.value.trim().length > 50
                ) {
                  setFirstNameError(true);
                }
              }}
              error={firstNameError}
              helperText={
                firstNameError && firstName?.trim().length > 50
                  ? "Maximum 50 characters allowed."
                  : firstNameError &&
                    firstName?.trim().length > 0 &&
                    firstName?.trim().length < 3
                  ? "Minimum 3 characters allowed."
                  : firstNameError
                  ? "This is a required field."
                  : ""
              }
              margin="normal"
              variant="standard"
            />
            <TextField
              label={
                <span>
                  Last Name
                  <span className="!text-defaultRed">&nbsp;*</span>
                </span>
              }
              sx={{ mt: "12px" }}
              fullWidth
              value={lastName?.trim().length <= 0 ? "" : lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setLastNameError(false);
              }}
              onBlur={(e) => {
                if (
                  e.target.value.trim().length < 3 ||
                  e.target.value.trim().length > 50
                ) {
                  setLastNameError(true);
                }
              }}
              error={lastNameError}
              helperText={
                lastNameError && lastName?.trim().length > 50
                  ? "Maximum 50 characters allowed."
                  : lastNameError &&
                    lastName?.trim().length > 0 &&
                    lastName?.trim().length < 3
                  ? "Minimum 3 characters allowed."
                  : lastNameError
                  ? "This is a required field."
                  : ""
              }
              margin="normal"
              variant="standard"
            />
            <TextField
              type="email"
              sx={{ mt: "12px" }}
              disabled={emailConfirmed}
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
            <TextField
              label="Mobile Number"
              sx={{ mt: "12px" }}
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
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              sx={{ mt: "10px" }}
              options={roleDropdownData
                .map((i: LabelValueType) => (i.Type === 1 ? i : undefined))
                .filter((i: LabelValueType | undefined) => i !== undefined)}
              value={
                roleDropdownData
                  .map((i: LabelValueType) => (i.Type === 1 ? i : undefined))
                  .filter((i: LabelValueType | undefined) => i !== undefined)
                  .find((i: any) => i.value === role) || null
              }
              onChange={(e, value: any) => {
                value && setRole(value.value);
                value && setRoleError(false);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label={
                    <span>
                      Role
                      <span className="text-defaultRed">&nbsp;*</span>
                    </span>
                  }
                  error={roleError}
                  onBlur={() => {
                    if (role > 0) {
                      setRoleError(false);
                    }
                  }}
                  helperText={roleError ? "This is a required field." : ""}
                />
              )}
            />
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              sx={{ mt: "18px" }}
              options={departmentDropdownData}
              value={
                departmentDropdownData.find(
                  (i: LabelValue) => i.value === department
                ) || null
              }
              onChange={(e, value: LabelValue | null) => {
                value && setDepartment(value.value);
                value && setDepartmentError(false);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label={
                    <span>
                      Department
                      <span className="text-defaultRed">&nbsp;*</span>
                    </span>
                  }
                  error={departmentError}
                  onBlur={() => {
                    if (department > 0) {
                      setDepartmentError(false);
                    }
                  }}
                  helperText={
                    departmentError ? "This is a required field." : ""
                  }
                />
              )}
            />
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              sx={{ mt: "15px" }}
              options={typeOfWorkDropdownData}
              value={
                typeOfWorkDropdownData.find(
                  (i: LabelValue) => i.value === typeOfWork
                ) || null
              }
              onChange={(e, value: LabelValue | null) => {
                value && setTypeOfWork(value.value);
                value && setTypeOfWorkError(false);
                value && setReport(0);
                value && setReportError(false);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label={
                    <span>
                      Type Of Work
                      <span className="text-defaultRed">&nbsp;*</span>
                    </span>
                  }
                  error={typeOfWorkError}
                  onBlur={() => {
                    if (typeOfWork > 0) {
                      setTypeOfWorkError(false);
                    }
                  }}
                  helperText={
                    typeOfWorkError ? "This is a required field." : ""
                  }
                />
              )}
            />
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              sx={{ mt: "18px" }}
              options={reportManagerDropdownData}
              value={
                reportManagerDropdownData.find(
                  (i: LabelValue) => i.value === report
                ) || null
              }
              onChange={(e, value: LabelValue | null) => {
                value && setReport(value.value);
                value && setReportError(false);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label={
                    <span>
                      Report Manager
                      {parseInt(roleIdAdmin) > 1 && (
                        <span className="text-defaultRed">&nbsp;*</span>
                      )}
                    </span>
                  }
                  error={reportError}
                  onBlur={() => {
                    if (parseInt(roleIdAdmin) > 1) {
                      if (role > 0) {
                        setReportError(false);
                      }
                    } else {
                      setReportError(false);
                    }
                  }}
                  helperText={reportError ? "This is a required field." : ""}
                />
              )}
            />
            {/* <Select
                label="Report Manager"
                id="reporting_manager"
                placeholder="Add Reporting Manager"
                validate={parseInt(roleIdAdmin) > 1}
                defaultValue={report === 0 ? "" : report}
                errorClass="!-mt-[15px]"
                hasError={reportHasError}
                getValue={(value) => {
                  setReport(value);
                  value > 0 && setReportHasError(false);
                }}
                search
                getError={(e) => setReportError(e)}
                options={reportManagerDropdownData}
              /> */}
            <Autocomplete
              multiple
              limitTags={2}
              sx={{ mt: "18px" }}
              id="checkboxes-tags-demo"
              options={groupDropdownData}
              value={selectedGroupOptions}
              getOptionLabel={(option: LabelValue) => option.label}
              getOptionDisabled={(option: LabelValue) =>
                selectGroupValue.includes(option.value)
              }
              disableCloseOnSelect
              onChange={handleMultiSelect}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selectGroupValue.includes(option.value)}
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
                  error={groupError}
                  onBlur={() => {
                    if (selectGroupValue.length > 0) {
                      setReportError(false);
                    }
                  }}
                  helperText={groupError ? "This is a required field." : ""}
                />
              )}
            />
            {/* <MultiSelectChip
                type="checkbox"
                options={groupDropdownData}
                defaultValue={group}
                errorClass={"!-mt-4"}
                onSelect={(e) => {}}
                label="Group"
                validate
                hasError={groupHasError}
                getValue={(e) => setGroup(e)}
                getError={(e) => {
                  setGroupError(e);
                }}
              /> */}
          </>
        )}
        {value === "Client" && (
          <>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              sx={{ mt: 2 }}
              options={clientDropdownData}
              value={
                clientDropdownData.find(
                  (i: LabelValue) => i.value === clientName
                ) || null
              }
              onChange={(e, value: LabelValue | null) => {
                value && setClientName(value.value);
                value && setClientNameError(false);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label={
                    <span>
                      Client Name
                      <span className="text-defaultRed">&nbsp;*</span>
                    </span>
                  }
                  error={clientNameError}
                  onBlur={() => {
                    if (clientName > 0) {
                      setClientNameError(false);
                    }
                  }}
                  helperText={
                    clientNameError ? "This is a required field." : ""
                  }
                />
              )}
            />
            <TextField
              label={
                <span>
                  First Name
                  <span className="!text-defaultRed">&nbsp;*</span>
                </span>
              }
              fullWidth
              value={clientFirstName?.trim().length <= 0 ? "" : clientFirstName}
              onChange={(e) => {
                setClientFirstName(e.target.value);
                setClientFirstNameError(false);
              }}
              onBlur={(e) => {
                if (
                  e.target.value.trim().length < 3 ||
                  e.target.value.trim().length > 50
                ) {
                  setClientFirstNameError(true);
                }
              }}
              error={clientFirstNameError}
              helperText={
                clientFirstNameError && clientFirstName?.trim().length > 50
                  ? "Maximum 50 characters allowed."
                  : clientFirstNameError &&
                    clientFirstName?.trim().length > 0 &&
                    clientFirstName?.trim().length < 3
                  ? "Minimum 3 characters allowed."
                  : clientFirstNameError
                  ? "This is a required field."
                  : ""
              }
              margin="normal"
              variant="standard"
              sx={{ mt: "18px" }}
            />
            <TextField
              label={
                <span>
                  Last Name
                  <span className="!text-defaultRed">&nbsp;*</span>
                </span>
              }
              sx={{ mt: "12px" }}
              fullWidth
              value={clientLastName?.trim().length <= 0 ? "" : clientLastName}
              onChange={(e) => {
                setClientLastName(e.target.value);
                setClientLastNameError(false);
              }}
              onBlur={(e) => {
                if (
                  e.target.value.trim().length < 3 ||
                  e.target.value.trim().length > 50
                ) {
                  setClientLastNameError(true);
                }
              }}
              error={clientLastNameError}
              helperText={
                clientLastNameError && clientLastName?.trim().length > 50
                  ? "Maximum 50 characters allowed."
                  : clientLastNameError &&
                    clientLastName?.trim().length > 0 &&
                    clientLastName?.trim().length < 3
                  ? "Minimum 3 characters allowed."
                  : clientLastNameError
                  ? "This is a required field."
                  : ""
              }
              margin="normal"
              variant="standard"
            />
            <TextField
              type="email"
              sx={{ mt: "12px" }}
              disabled={emailConfirmed}
              label={
                <span>
                  Email
                  <span className="!text-defaultRed">&nbsp;*</span>
                </span>
              }
              fullWidth
              value={clientEmail?.trim().length <= 0 ? "" : clientEmail}
              onChange={(e) => {
                setClientEmail(e.target.value);
                setClientEmailError(false);
              }}
              onBlur={(e) => {
                if (
                  e.target.value.trim().length < 1 ||
                  e.target.value.trim().length > 100 ||
                  !regex.test(e.target.value)
                ) {
                  setClientEmailError(true);
                }
              }}
              error={clientEmailError}
              helperText={
                clientEmailError && clientEmail?.trim().length > 100
                  ? "Maximum 100 characters allowed."
                  : clientEmailError && !regex.test(clientEmail)
                  ? "Please enter valid email."
                  : clientEmailError
                  ? "This is a required field."
                  : ""
              }
              margin="normal"
              variant="standard"
            />
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              sx={{ mt: "15px" }}
              options={roleDropdownData
                .map((i: LabelValueType) => (i.Type === 2 ? i : undefined))
                .filter((i: LabelValueType | undefined) => i !== undefined)}
              value={
                roleDropdownData
                  .map((i: LabelValueType) => (i.Type === 2 ? i : undefined))
                  .filter((i: LabelValueType | undefined) => i !== undefined)
                  .find((i: any) => i.value === clientRole) || null
              }
              onChange={(e, value: any) => {
                value && setClientRole(value.value);
                value && setClientRoleError(false);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label={
                    <span>
                      Role
                      <span className="text-defaultRed">&nbsp;*</span>
                    </span>
                  }
                  error={clientRoleError}
                  onBlur={() => {
                    if (clientRole > 0) {
                      setClientRoleError(false);
                    }
                  }}
                  helperText={
                    clientRoleError ? "This is a required field." : ""
                  }
                />
              )}
            />
            <TextField
              label="Mobile Number"
              sx={{ mt: "20px" }}
              fullWidth
              type="number"
              value={clientTel?.trim().length <= 0 ? "" : clientTel}
              onChange={(e) => setClientTel(e.target.value)}
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
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end fixed w-full bottom-0 py-[15px] bg-pureWhite border-t border-lightSilver">
        {onEdit > 0 ? (
          <Button
            variant="outlined"
            className="rounded-[4px] !h-[36px] !text-secondary"
            onClick={clearAllData}
          >
            Close
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
          {onEdit > 0 ? "Save" : `Create User`}
        </Button>
      </div>
    </form>
  );
});

export default UserContent;
