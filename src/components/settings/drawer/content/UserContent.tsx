/* eslint-disable react/display-name */
import axios from "axios";
import {
  Button,
  MultiSelectChip,
  Radio,
  Select,
  Tel,
  Text,
  Email,
} from "next-ts-lib";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { toast } from "react-toastify";

export interface UserContentRef {
  clearAllData: () => void;
}

const UserContent = forwardRef<
  UserContentRef,
  {
    tab: string;
    onEdit: boolean;
    onOpen: boolean;
    onClose: () => void;
    userData: any;
    onUserDataFetch: any;
    onChangeLoader: any;
  }
>(
  (
    { tab, onEdit, onOpen, onClose, userData, onUserDataFetch, onChangeLoader },
    ref
  ) => {
    const [value, setValue] = useState("Employee");
    const [emailConfirmed, setEmailConfirmed] = useState(false);
    const [addMoreClicked, setAddMoreClicked] = useState(false);
    const roleIdAdmin: any = localStorage.getItem("roleId");

    // for Employee
    const [userId, setUserId] = useState(0);
    const [firstName, setFirstName] = useState("");
    const [firstNameHasError, setFirstNameHasError] = useState(false);
    const [firstNameError, setFirstNameError] = useState(false);
    const [lastName, setLastName] = useState("");
    const [lastNameHasError, setLastNameHasError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [email, setEmail] = useState("");
    const [emailHasError, setEmailHasError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [tel, setTel] = useState("");
    const [role, setRole] = useState(0);
    const [roleHasError, setRoleHasError] = useState(false);
    const [roleError, setRoleError] = useState(false);
    const [department, setDepartment] = useState(0);
    const [departmentHasError, setDepartmentHasError] = useState(false);
    const [departmentError, setDepartmentError] = useState(false);
    const [report, setReport] = useState(0);
    const [reportHasError, setReportHasError] = useState(false);
    const [reportError, setReportError] = useState(false);
    const [group, setGroup] = useState([]);
    const [groupHasError, setGroupHasError] = useState(false);
    const [groupError, setGroupError] = useState(false);

    const [departmentDropdownData, setDepartmentDropdownData] = useState([]);
    const [roleDropdownData, setRoleDropdownData] = useState([]);
    const [groupDropdownData, setGroupDropdownData] = useState([]);
    const [reportManagerDropdownData, setReportManagerDropdownData] = useState(
      []
    );

    // For client
    const [clientName, setClientName] = useState(0);
    const [clientNameHasError, setClientNameHasError] = useState(false);
    const [clientNameError, setClientNameError] = useState(false);
    const [clientFirstName, setClientFirstName] = useState("");
    const [clientFirstNameHasError, setClientFirstNameHasError] =
      useState(false);
    const [clientFirstNameError, setClientFirstNameError] = useState(false);
    const [clientLastName, setClientLastName] = useState("");
    const [clientLastNameHasError, setClientLastNameHasError] = useState(false);
    const [clientLastNameError, setClientLastNameError] = useState(false);
    const [clientEmail, setClientEmail] = useState("");
    const [clientEmailHasError, setClientEmailHasError] = useState(false);
    const [clientEmailError, setClientEmailError] = useState(false);
    const [clientRole, setClientRole] = useState(0);
    const [clientRoleHasError, setClientRoleHasError] = useState(false);
    const [clientRoleError, setClientRoleError] = useState(false);
    const [clientTel, setClientTel] = useState("");

    const [clientDropdownData, setClientDropdownData] = useState([]);

    useEffect(() => {
      setEmailConfirmed(false);
    }, []);

    useEffect(() => {
      if (userData && onEdit) {
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
                  setFirstNameError(true);
                  setLastName(data.LastName);
                  setLastNameError(true);
                  setEmail(data.Email);
                  setEmailError(true);
                  setTel(data.ContactNo);
                  setRole(data.RoleId);
                  setRoleError(true);
                  setDepartment(data.DepartmentId);
                  setDepartmentError(true);
                  setReport(
                    data.ReportingManagerId === null
                      ? 0
                      : data.ReportingManagerId
                  );
                  setReportError(true);
                  setGroup(data.GroupIds);
                  setGroupError(true);
                } else {
                  setValue("Client");
                  setEmailConfirmed(data.EmailConfirmed);
                  setUserId(data.UserId);
                  setClientName(data.ClientId);
                  setClientNameError(true);
                  setClientFirstName(data.FirstName);
                  setClientFirstNameError(true);
                  setClientLastName(data.LastName);
                  setClientLastNameError(true);
                  setClientEmail(data.Email);
                  setClientEmailError(true);
                  setClientTel(data.ContactNo);
                  setClientRole(data.RoleId);
                  setClientRoleError(true);
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
        setRole(0);
        setDepartment(0);
        setReport(0);
      }
      setEmployeeDataTrue();
      setClientDataTrue();
      clearDataClient();
      clearDataEmployee();
    }, [onEdit, userData, onClose]);

    useEffect(() => {
      const getData = async (api: any) => {
        const token = await localStorage.getItem("token");
        const Org_Token = await localStorage.getItem("Org_Token");
        try {
          let response: any;
          if (api === "/user/GetRMUserDropdown") {
            response = await axios.post(
              `${process.env.api_url}/user/GetRMUserDropdown`,
              {
                DepartmentId: department,
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

      onOpen && getData("/client/getdropdown");
      onOpen && getData("/department/getdropdown");
      onOpen && getData("/Role/GetDropdown");
      onOpen && getData("/group/getdropdown");
      onOpen && department > 0 && getData("/user/GetRMUserDropdown");
    }, [department, userId, onOpen]);

    const setEmployeeDataTrue = () => {
      setFirstNameHasError(true);
      setLastNameHasError(true);
      setEmailHasError(true);
      setRoleHasError(true);
      setDepartmentHasError(true);
      setReportHasError(true);
      setGroupHasError(true);
    };

    const clearDataEmployee = () => {
      setUserId(0);
      setFirstName("");
      setFirstNameError(false);
      setFirstNameHasError(false);
      setLastName("");
      setLastNameError(false);
      setLastNameHasError(false);
      setEmail("");
      setEmailError(false);
      setEmailHasError(false);
      setTel("");
      setRole(0);
      setRoleError(false);
      setRoleHasError(false);
      setDepartment(0);
      setDepartmentError(false);
      setDepartmentHasError(false);
      setReport(0);
      setReportError(false);
      setReportHasError(false);
      setGroup([]);
      setGroupError(false);
      setGroupHasError(false);
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
            RoleId: role === 0 ? null : role,
            DepartmentId: department === 0 ? null : department,
            ReportingManagerId: report === 0 ? null : report,
            GroupIds: group,
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
              `User ${onEdit ? "Updated" : "created"} successfully.`
            );
            await onUserDataFetch();
            await setEmployeeDataTrue();
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

    const setClientDataTrue = () => {
      setClientNameHasError(true);
      setClientFirstNameHasError(true);
      setClientLastNameHasError(true);
      setClientEmailHasError(true);
      setClientRoleHasError(true);
    };

    const clearDataClient = () => {
      setUserId(0);
      setClientNameError(false);
      setClientNameHasError(false);
      setClientName(0);
      setClientFirstName("");
      setClientFirstNameError(false);
      setClientFirstNameHasError(false);
      setClientLastName("");
      setClientLastNameError(false);
      setClientLastNameHasError(false);
      setClientEmail("");
      setClientEmailError(false);
      setClientEmailHasError(false);
      setClientRole(0);
      setClientRoleError(false);
      setClientRoleHasError(false);
      setClientTel("");
      setRole(0);
      setDepartment(0);
      setReport(0);
      setGroup([]);
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
            onUserDataFetch();
            setClientDataTrue();
            clearDataClient();
            {
              !addMoreClicked && onClose();
            }
            toast.success(
              `User ${onEdit ? "Updated" : "created"} successfully.`
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
      await setEmployeeDataTrue();
      await clearDataEmployee();
      await setClientDataTrue();
      await clearDataClient();
      onClose();
    };

    useImperativeHandle(ref, () => ({
      clearAllData,
    }));

    const handleSubmit = async (e: { preventDefault: () => void }) => {
      e.preventDefault();

      if (value === "Employee") {
        firstName.trim().length <= 0 && setFirstNameHasError(true);
        lastName.trim().length <= 0 && setLastNameHasError(true);
        email.trim().length <= 0 && setEmailHasError(true);
        role <= 0 && setRoleHasError(true);
        department <= 0 && setDepartmentHasError(true);
        report <= 0 && setReportHasError(true);
        group.length <= 0 && setGroupHasError(true);
        if (
          firstNameError &&
          firstName.trim().length !== 0 &&
          lastNameError &&
          lastName.trim().length !== 0 &&
          emailError &&
          email.trim().length !== 0 &&
          role !== 0 &&
          department !== 0 &&
          group.length !== 0
        ) {
          if (parseInt(roleIdAdmin) > 1) {
            report !== 0 && saveUser();
          } else {
            saveUser();
          }
        }
      } else if (value === "Client") {
        clientName <= 0 && setClientNameHasError(true);
        clientFirstName.trim().length <= 0 && setClientFirstNameHasError(true);
        clientLastName.trim().length <= 0 && setClientLastNameHasError(true);
        clientEmail.trim().length <= 0 && setClientEmailHasError(true);
        clientRole <= 0 && setClientRoleHasError(true);
        if (
          clientNameError &&
          clientName > 0 &&
          clientFirstNameError &&
          clientFirstName.trim().length !== 0 &&
          clientLastNameError &&
          clientLastName.trim().length !== 0 &&
          clientEmailError &&
          clientEmail.trim().length !== 0 &&
          clientRoleError &&
          clientRole > 0
        ) {
          saveClient();
        }
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <span className="flex flex-row items-center pr-[20px] pt-[20px] pl-[10px]">
          {onEdit ? (
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

        <div className="flex gap-[15px] flex-col p-[20px] max-h-[70vh] overflow-y-auto">
          {value === "Employee" && (
            <>
              <Text
                label="First Name"
                placeholder="Enter First Name"
                noNumeric
                validate
                value={firstName}
                minChar={3}
                maxChar={50}
                hasError={firstNameHasError}
                getValue={(e) => setFirstName(e)}
                getError={(e) => setFirstNameError(e)}
              />
              <Text
                label="Last Name"
                placeholder="Enter Last Name"
                noNumeric
                validate
                value={lastName}
                maxChar={50}
                hasError={lastNameHasError}
                getValue={(e) => setLastName(e)}
                getError={(e) => setLastNameError(e)}
              />
              <Email
                type="email"
                label="Email"
                placeholder="Enter Email ID"
                disabled={emailConfirmed}
                validate
                value={email}
                maxChar={100}
                hasError={emailHasError}
                getValue={(e) => setEmail(e)}
                getError={(e) => setEmailError(e)}
              />
              <Tel
                className="telPadding"
                label="Mobile Number"
                placeholder="Enter Mobile Number"
                value={tel}
                maxLength={14}
                getValue={(e) => setTel(e)}
                getError={(e) => {}}
              />
              <Select
                label="Role"
                id="role"
                placeholder="Select Role"
                validate
                defaultValue={role === 0 ? "" : role}
                errorClass="!-mt-[15px]"
                hasError={roleHasError}
                getValue={(value) => {
                  setRole(value);
                  value > 0 && setRoleHasError(false);
                }}
                search
                getError={(e) => setRoleError(e)}
                options={roleDropdownData
                  .map((i: any) => (i.Type === 1 ? i : undefined))
                  .filter((i: any) => i !== undefined)}
              />
              <Select
                label="Department"
                id="department"
                placeholder="Select Department"
                validate
                defaultValue={department === 0 ? "" : department}
                errorClass="!-mt-[15px]"
                hasError={departmentHasError}
                getValue={(value) => {
                  setDepartment(value);
                  value > 0 && setDepartmentHasError(false);
                }}
                getError={(e) => setDepartmentError(e)}
                options={departmentDropdownData}
              />
              <Select
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
              />
              <MultiSelectChip
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
              />
            </>
          )}
          {value === "Client" && (
            <>
              <Select
                label="Client Name"
                id="clientName"
                placeholder="Select Client Name"
                validate
                defaultValue={clientName === 0 ? "" : clientName}
                errorClass="!-mt-[15px]"
                hasError={clientNameHasError}
                getValue={(value) => {
                  setClientName(value);
                  value > 0 && setClientNameHasError(false);
                }}
                getError={(e) => setClientNameError(e)}
                options={clientDropdownData}
              />
              <Text
                label="First Name"
                placeholder="Enter First Name"
                noNumeric
                value={clientFirstName}
                validate
                maxChar={50}
                hasError={clientFirstNameHasError}
                getValue={(e) => setClientFirstName(e)}
                getError={(e) => setClientFirstNameError(e)}
              />
              <Text
                label="Last Name"
                placeholder="Enter Last Name"
                noNumeric
                value={clientLastName}
                validate
                maxChar={50}
                hasError={clientLastNameHasError}
                getValue={(e) => setClientLastName(e)}
                getError={(e) => setClientLastNameError(e)}
              />
              <Email
                type="email"
                label="Email"
                placeholder="Enter Email ID"
                disabled={emailConfirmed}
                value={clientEmail}
                validate
                maxChar={100}
                hasError={clientEmailHasError}
                getValue={(e) => setClientEmail(e)}
                getError={(e) => setClientEmailError(e)}
              />
              <Select
                label="Role"
                id="role"
                placeholder="Select Role"
                validate
                defaultValue={clientRole === 0 ? "" : clientRole}
                errorClass="!-mt-[15px]"
                hasError={clientRoleHasError}
                getValue={(value) => {
                  setClientRole(value);
                  value > 0 && setClientRoleHasError(false);
                }}
                search
                getError={(e) => setClientRoleError(e)}
                options={roleDropdownData
                  .map((i: any) => (i.Type === 2 ? i : undefined))
                  .filter((i: any) => i !== undefined)}
              />
              <Tel
                label="Mobile Number"
                placeholder="Enter Mobile Number"
                value={clientTel}
                maxLength={14}
                getValue={(e) => setClientTel(e)}
                getError={(e) => {}}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end fixed w-full bottom-0 bg-pureWhite gap-[20px] px-[20px] py-[15px] border-t border-lightSilver">
          {onEdit ? (
            <Button
              variant="btn-outline-secondary"
              className="rounded-[4px] !h-[36px] !uppercase"
              onClick={clearAllData}
            >
              Cancel
            </Button>
          ) : (
            <Button
              variant="btn-outline-secondary"
              className="rounded-[4px] !h-[36px] !uppercase"
              type="submit"
              onClick={() => setAddMoreClicked(true)}
            >
              Add More
            </Button>
          )}
          <Button
            variant="btn-secondary"
            className="rounded-[4px] !h-[36px] !uppercase"
            type="submit"
          >
            {onEdit ? "Save" : `Create ${tab === "Permissions" ? "Role" : tab}`}
          </Button>
        </div>
      </form>
    );
  }
);

export default UserContent;
