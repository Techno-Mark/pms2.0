import { callAPI } from "@/utils/API/callAPI";
import { Autocomplete, Button, TextField } from "@mui/material";
import { ColorPicker } from "next-ts-lib";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { toast } from "react-toastify";

export interface StatusContenRef {
  clearStatusData: () => void;
}
const StatusContent = forwardRef<
  StatusContenRef,
  {
    tab: string;
    onEdit: any;
    onClose: () => void;
    onDataFetch: any;
    onChangeLoader: any;
  }
>(({ tab, onClose, onEdit, onDataFetch, onChangeLoader }, ref) => {
  const [statusName, setStatusName] = useState("");
  const [statusNameErr, setStatusNameErr] = useState(false);
  const [type, setType] = useState("");
  const [typeErr, setTypeErr] = useState(false);
  const [colorName, setColorName] = useState("");
  const [isDefualt, setIsDefualt] = useState(false);

  const [typeOfWorks, setTypeOfWorks] = useState<any[]>([]);
  const [typeOfWorkName, setTypeOfWorkName] = useState<any[]>([]);
  const [typeOfWorkDropdown, setTypeOfWorkDropdown] = useState<any[]>([]);
  const [typeOfWorkNameError, setTypeOfWorkNameError] = useState(false);
  const [displayNames, setDisplayNames] = useState<any>([]);

  const getWorkTypeData = async () => {
    const params = {
      ClientId: null,
      OrganizationId: await localStorage.getItem("Org_Id"),
    };
    const url = `${process.env.pms_api_url}/WorkType/GetDropdown`;
    const successCallback = async (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setTypeOfWorkDropdown(ResponseData);
      } else {
        onChangeLoader(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const fetchEditData = async () => {
    if (onEdit) {
      const params = {
        statusId: onEdit || 0,
      };
      const url = `${process.env.pms_api_url}/status/GetById`;
      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setStatusName(ResponseData.Name);
          setType(ResponseData.Type);
          setIsDefualt(ResponseData.IsDefault);
          setColorName(ResponseData.ColorCode);
          setTypeOfWorks(
            ResponseData.WorkTypeDetails.map((i: any) => ({
              label: i.WorkTypeName,
              value: i.WorkTypeId,
            }))
          );
          setTypeOfWorkName(
            ResponseData.WorkTypeDetails.map((i: any) => i.value)
          );
          setDisplayNames(ResponseData.WorkTypeDetails);
        } else {
          setStatusName("");
          setColorName("");
        }
      };
      callAPI(url, params, successCallback, "POST");
    } else {
      setStatusName("");
      setColorName("");
    }
  };

  useEffect(() => {
    setStatusNameErr(false);
    setColorName("#000000");
    setIsDefualt(false);
    setTypeErr(false);
  }, [onClose]);

  useEffect(() => {
    onEdit && fetchEditData();
    setColorName("");
  }, [onEdit]);

  useEffect(() => {
    typeOfWorkDropdown.length <= 0 && getWorkTypeData();
  }, []);

  const clearData = () => {
    setStatusName("");
    setColorName("");
    setStatusNameErr(false);
    setType("");
    setTypeErr(false);
    setTypeOfWorkName([]);
    setTypeOfWorks([]);
    setTypeOfWorkNameError(false);
    setDisplayNames([]);
  };

  const clearStatusData = async () => {
    await clearData();
  };

  useImperativeHandle(ref, () => ({
    clearStatusData,
  }));

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    typeOfWorks.length <= 0 && setTypeOfWorkNameError(true);
    type.trim().length <= 0 && setTypeErr(true);
    type.trim().length > 50 && setTypeErr(true);
    statusName.trim().length <= 0 && setStatusNameErr(true);
    statusName.trim().length > 50 && setStatusNameErr(true);

    if (
      !statusNameErr &&
      statusName.trim().length > 0 &&
      statusName.trim().length < 50 &&
      !typeErr &&
      type.trim().length > 0 &&
      type.trim().length < 50 &&
      !typeOfWorkNameError &&
      typeOfWorkName.length > 0
    ) {
      onChangeLoader(true);
      const params = {
        statusId: onEdit || 0,
        name: statusName.trim(),
        Type: type,
        colorCode: colorName.trim(),
        WorkTypeDetails: displayNames.map(
          (i: any) =>
            new Object({
              WorkTypeId: i.WorkTypeId,
              DisplayName: i.DisplayName,
            })
        ),
      };
      const url = `${process.env.pms_api_url}/status/Save`;
      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          onDataFetch();
          clearStatusData();
          onChangeLoader(false);
          onClose();
          toast.success(
            `${onEdit ? "" : "New"} Status ${
              onEdit ? "Updated" : "added"
            }  successfully.`
          );
        } else {
          onChangeLoader(false);
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  const addMoreSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    typeOfWorks.length <= 0 && setTypeOfWorkNameError(true);
    type.trim().length <= 0 && setTypeErr(true);
    type.trim().length > 50 && setTypeErr(true);
    setTypeErr(!/[^a-zA-Z0-9\s]/.test(type));
    statusName.trim().length <= 0 && setStatusNameErr(true);
    statusName.trim().length > 50 && setStatusNameErr(true);

    if (
      !statusNameErr &&
      statusName.trim().length > 0 &&
      statusName.trim().length < 50 &&
      !typeErr &&
      type.trim().length > 0 &&
      type.trim().length < 50 &&
      /^[a-zA-Z0-9]+$/.test(type) &&
      !typeOfWorkNameError &&
      typeOfWorkName.length > 0
    ) {
      const params = {
        statusId: onEdit || 0,
        name: statusName.trim(),
        Type: type,
        colorCode: colorName.trim(),
        WorkTypeDetails: displayNames.map(
          (i: any) =>
            new Object({
              WorkTypeId: i.WorkTypeId,
              DisplayName: i.DisplayName,
            })
        ),
      };
      const url = `${process.env.pms_api_url}/status/Save`;
      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          onDataFetch();
          clearStatusData();
          toast.success(
            `${onEdit ? "" : "New"} Status ${
              onEdit ? "Updated" : "added"
            }  successfully.`
          );
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  return (
    <>
      <form
        className="max-h-[78vh] overflow-y-auto px-5"
        onSubmit={handleSubmit}
      >
        <TextField
          label={
            <span>
              Status
              <span className="!text-defaultRed">&nbsp;*</span>
            </span>
          }
          fullWidth
          className="pt-1"
          value={statusName?.trim().length <= 0 ? "" : statusName}
          onChange={(e) => {
            setStatusName(e.target.value);
            setStatusNameErr(false);
          }}
          onBlur={(e: any) => {
            if (
              e.target.value.trim().length < 1 ||
              e.target.value.trim().length > 50
            ) {
              setStatusNameErr(true);
            }
          }}
          error={statusNameErr}
          helperText={
            statusNameErr && statusName?.trim().length > 50
              ? "Maximum 50 characters allowed."
              : statusNameErr
              ? "This is a required field."
              : ""
          }
          margin="normal"
          variant="standard"
        />
        <TextField
          label={
            <span>
              Type
              <span className="text-defaultRed">&nbsp;*</span>
            </span>
          }
          disabled={isDefualt}
          fullWidth
          className="pt-1"
          value={type?.trim().length <= 0 ? "" : type}
          onChange={(e) => setType(e.target.value.trim())}
          onBlur={(e: any) => {
            if (
              !isDefualt &&
              (e.target.value.trim().length < 1 ||
                e.target.value.trim().length > 50 ||
                !/^[a-zA-Z0-9]+$/.test(e.target.value))
            ) {
              setTypeErr(true);
            } else {
              setTypeErr(false);
            }
          }}
          error={!isDefualt && typeErr}
          helperText={
            !isDefualt && typeErr && type?.trim().length > 50
              ? "Maximum 50 characters allowed."
              : !/^[a-zA-Z0-9]+$/.test(type) && typeErr
              ? "Special characters are not allowed.."
              : !isDefualt && typeErr
              ? "This is a required field."
              : ""
          }
          margin="normal"
          variant="standard"
        />
        <Autocomplete
          multiple
          id="tags-standard"
          sx={{ my: 2 }}
          options={
            typeOfWorkDropdown.length === typeOfWorks.length
              ? []
              : typeOfWorkDropdown.filter(
                  (option) =>
                    !typeOfWorks.find(
                      (typeOfWork) => typeOfWork.value === option.value
                    )
                )
          }
          getOptionLabel={(option: any) => option.label}
          onChange={(e: any, data: any) => {
            if (data.some((d: any) => d.value === -1)) {
              setTypeOfWorks(
                typeOfWorkDropdown.filter((d: any) => d.value !== -1)
              );
              setTypeOfWorkName(
                typeOfWorkDropdown
                  .filter((d: any) => d.value !== -1)
                  .map((d: any) => d.value)
              );
              setTypeOfWorkNameError(false);
            } else {
              setTypeOfWorks(data);
              setTypeOfWorkName(data.map((d: any) => d.value));
              setTypeOfWorkNameError(false);
              setDisplayNames(
                data.map((d: any) =>
                  displayNames.find((item: any) => item.value === d.value)
                    ? {
                        WorkTypeName: d.label,
                        WorkTypeId: d.value,
                        DisplayName: displayNames.map((item: any) =>
                          item.value === d.value ? item.DisplayName : ""
                        )[0],
                      }
                    : {
                        WorkTypeName: d.label,
                        WorkTypeId: d.value,
                        DisplayName: "",
                      }
                )
              );
            }
          }}
          value={typeOfWorks}
          renderInput={(params: any) => (
            <TextField
              {...params}
              variant="standard"
              label={
                <span>
                  Type Of Work
                  <span className="text-defaultRed">&nbsp;*</span>
                </span>
              }
              error={typeOfWorkNameError}
              onBlur={(e) => {
                if (typeOfWorks.length > 0) {
                  setTypeOfWorkNameError(false);
                }
              }}
              helperText={
                typeOfWorkNameError ? "This is a required field." : ""
              }
            />
          )}
        />

        {typeOfWorks.length > 0 && (
          <>
            <div className="flex moduleOrgHeader font-semibold justify-between items-center py-3 px-5">
              <h1 className="font-medium text-[18px]">Default Name</h1>
              <h1 className="font-medium text-[18px]">Display Name</h1>
            </div>
            {displayNames.map((i: any) => (
              <div
                className="flex moduleOrgHeader font-semibold justify-between items-center px-5"
                key={i.WorkTypeId}
              >
                <span className="font-medium text-[16px]">
                  {i.WorkTypeName}
                </span>
                <div className="max-w-[230px]">
                  <TextField
                    fullWidth
                    className="pt-1"
                    value={i.DisplayName}
                    onChange={(e) => {
                      setDisplayNames(
                        displayNames.map((j: any) =>
                          j.WorkTypeId === i.WorkTypeId
                            ? { ...j, DisplayName: e.target.value }
                            : j
                        )
                      );
                    }}
                    margin="normal"
                    variant="standard"
                    sx={{ width: 200 }}
                  />
                </div>
              </div>
            ))}
          </>
        )}

        <ColorPicker
          value={colorName}
          onChange={(e) => {
            setColorName(e);
          }}
        />

        {/* Footer */}
        <div className="flex justify-end fixed w-full bottom-0 py-[15px] bg-pureWhite border-t border-lightSilver">
          <>
            {onEdit ? (
              <Button
                variant="outlined"
                className="rounded-[4px] !h-[36px] !text-secondary"
                onClick={() => {
                  clearData();
                  onClose();
                }}
              >
                Close
              </Button>
            ) : (
              <Button
                type="button"
                variant="outlined"
                className="rounded-[4px] !h-[36px] !text-secondary cursor-pointer"
                onClick={addMoreSubmit}
              >
                Add More
              </Button>
            )}
            <Button
              variant="contained"
              className="rounded-[4px] !h-[36px] !mx-6 !bg-secondary cursor-pointer"
              type="submit"
            >
              {onEdit ? "Save" : `Create Status`}
            </Button>
          </>
        </div>
      </form>
    </>
  );
});
export default StatusContent;
