export const dashboard_Options: any = {
  filterType: "checkbox",
  responsive: "standard",
  tableBodyHeight: "60vh",
  viewColumns: false,
  filter: false,
  print: false,
  download: false,
  search: false,
  pagination: false,
  selectToolbarPlacement: "none",
  draggableColumns: {
    enabled: true,
    transitionTime: 300,
  },
  selectableRows: "none",
  elevation: 0,
  textLabels: {
    body: {
      noMatch: (
        <div className="flex items-start">
          <span>Currently there is no record</span>
        </div>
      ),
      toolTip: "",
    },
  },
};

export const dashboardReport_Options: any = {
  responsive: "standard",
  tableBodyHeight: "73vh",
  viewColumns: false,
  filter: false,
  print: false,
  download: false,
  search: false,
  pagination: false,
  selectToolbarPlacement: "none",
  draggableColumns: {
    enabled: true,
    transitionTime: 300,
  },
  elevation: 0,
  selectableRows: "none",
};

export const approvals_Dt_Options: any = {
  filterType: "checkbox",
  responsive: "standard",
  tableBodyHeight: "73vh",
  elevation: 0,
  viewColumns: false,
  filter: false,
  print: false,
  download: false,
  search: false,
  selectToolbarPlacement: "none",
  pagination: false,
  draggableColumns: {
    enabled: true,
    transitionTime: 300,
  },
  textLabels: {
    body: {
      noMatch: (
        <div className="flex items-start">
          <span>Currently there is no records available.</span>
        </div>
      ),
      toolTip: "",
    },
  },
};

export const report_Options: any = {
  responsive: "standard",
  tableBodyHeight: "73vh",
  viewColumns: false,
  filter: false,
  print: false,
  download: false,
  search: false,
  selectToolbarPlacement: "none",
  selectableRows: "none",
  elevation: 0,
  pagination: false,
};

export const worklogs_Options: any = {
  filterType: "checkbox",
  responsive: "standard",
  tableBodyHeight: "73vh",
  viewColumns: false,
  filter: false,
  print: false,
  download: false,
  search: false,
  pagination: false,
  selectToolbarPlacement: "none",
  draggableColumns: {
    enabled: true,
    transitionTime: 300,
  },
  elevation: 0,
  selectableRows: "multiple",
};

export const options: any = {
  responsive: "standard",
  tableBodyHeight: "75vh",
  viewColumns: false,
  filter: false,
  print: false,
  download: false,
  search: false,
  pagination: false,
  screenX: true,
  selectableRows: "none",
  selectToolbarPlacement: "none",
  draggableColumns: {
    enabled: true,
    transitionTime: 300,
  },
  elevation: 0,
  textLabels: {
    body: {
      noMatch: (
        <div className="flex items-start">
          <span>Currently there is no record available.</span>
        </div>
      ),
      toolTip: "",
    },
  },
};
