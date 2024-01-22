import React, { useState } from "react";
import { toast } from "react-toastify";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import { FormControl, FormHelperText } from "@mui/material";
import MUIDataTable from "mui-datatables";
import {
  Table_Options,
  Table_Columns,
} from "../../../utils/worklog/importTableOprions";
import { TransitionDown } from "@/utils/style/DialogTransition";
import { callAPI } from "@/utils/API/callAPI";

interface ImportDialogProp {
  onOpen: boolean;
  onClose: () => void;
  onDataFetch: any;
}

const ImportDialog: React.FC<ImportDialogProp> = ({
  onOpen,
  onClose,
  onDataFetch,
}) => {
  const [error, setError] = useState("");
  const [importText, setImportText] = useState("");
  const [importFields, setImportFields] = useState<any[]>([]);
  const [isNextCliecked, setIsNextClicked] = useState<boolean>(false);
  const [selectedTasks, setselectedtasks] = useState<any[]>([]);

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setError("");
    setImportText("");
    setImportFields([]);
    setIsNextClicked(false);
    setselectedtasks([]);
  };

  const handleRowSelect = (
    currentRowsSelected: any,
    allRowsSelected: any,
    rowsSelected: any
  ) => {
    const selectedData = allRowsSelected.map(
      (row: any) => importFields[row.dataIndex]
    );

    const tasks =
      selectedData.length > 0
        ? selectedData.map((selectedRow: any) => ({
            TaskName: selectedRow.field,
          }))
        : [];

    setselectedtasks(tasks);
  };

  const convertToArrayOfObjects = (data: string) => {
    let dataArray;
    if (data.includes(",")) {
      dataArray = data
        .split(",")
        .map((item, index) => ({ id: index + 1, field: item.trim() }));
    } else if (data.includes("\n")) {
      dataArray = data
        .split("\n")
        .filter((item) => item.trim() !== "")
        .map((item, index) => ({ id: index + 1, field: item.trim() }));
    } else {
      dataArray = [{ id: 1, field: data.trim() }];
    }
    return dataArray;
  };

  const handleProcessData = () => {
    if (importText.trim() === "") {
      setError("Please enter import fields");
      return;
    }

    setIsNextClicked(true);
    setImportFields(convertToArrayOfObjects(importText));
  };

  const handleApplyImport = async () => {
    const params = {
      TaskNameList: selectedTasks,
    };
    const url = `${process.env.worklog_api_url}/workitem/import`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Task has been imported successfully.");
        onDataFetch();
        handleClose();
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <div>
      <Dialog
        open={onOpen}
        TransitionComponent={TransitionDown}
        keepMounted
        maxWidth="md"
        onClose={handleClose}
      >
        <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
          <span className="text-lg font-medium">Import</span>
          {!isNextCliecked ? (
            <Button color="error" onClick={handleReset}>
              Reset
            </Button>
          ) : (
            <Button color="info" onClick={() => setIsNextClicked(false)}>
              Back
            </Button>
          )}
        </DialogTitle>
        <DialogContent>
          {isNextCliecked ? (
            <div className="pt-6 pb-1 w-[40vw]">
              <MUIDataTable
                options={{
                  ...Table_Options,
                  onRowSelectionChange: (
                    currentRowsSelected: any,
                    allRowsSelected: any,
                    rowsSelected: any
                  ) =>
                    handleRowSelect(
                      currentRowsSelected,
                      allRowsSelected,
                      rowsSelected
                    ),
                }}
                columns={Table_Columns}
                data={importFields}
                title={undefined}
              />
            </div>
          ) : (
            <div className="pt-6 px-[10px] pb-[10px] h-[235px] w-[40vw]">
              <FormControl sx={{ mx: 0.75 }} variant="standard">
                <TextareaAutosize
                  color="error"
                  aria-label="import_TextArea"
                  minRows={8}
                  required
                  placeholder="Enter Import Fields"
                  className={`outline-none border-b border-lightSilver !w-[37.5vw] ${
                    error.length > 0 ? "!border-defaultRed" : ""
                  }`}
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    setError("");
                  }}
                />
                {error.length > 0 && (
                  <FormHelperText error>{error}</FormHelperText>
                )}
              </FormControl>
            </div>
          )}
        </DialogContent>
        <DialogActions className="border-t border-t-lightSilver p-[20px] gap-[10px] h-[64px]">
          <Button variant="outlined" color="error" onClick={handleClose}>
            Cancel
          </Button>
          {isNextCliecked ? (
            <Button
              className="!bg-secondary"
              variant="contained"
              onClick={handleApplyImport}
            >
              Submit
            </Button>
          ) : (
            <Button
              className="!bg-secondary"
              variant="contained"
              onClick={handleProcessData}
            >
              Next
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ImportDialog;
