export const Table_Options: any = {
  responsive: "standard",
  tableBodyHeight: "55vh",
  viewColumns: false,
  filter: false,
  print: false,
  download: false,
  search: false,
  pagination: false,
  screenX: true,
  selectableRows: "multiple",
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

export const Table_Columns = [
  {
    name: "field",
    options: {
      filter: true,
      sort: true,
      customHeadLabelRender: () => (
        <span className="font-bold text-sm">Task</span>
      ),
      customBodyRender: (value: any) => {
        return <div>{value === null || value === "" ? "-" : value}</div>;
      },
    },
  },
];
