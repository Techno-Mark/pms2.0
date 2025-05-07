import {
  generateCustomHeaderName,
  generateStatusWithColor,
  generateStringValue,
} from "./CommonFunction";

const generateCustomColumn = (
  name: any,
  label: string,
  bodyRenderer: (arg0: any) => any
) => ({
  name,
  options: {
    filter: true,
    sort: true,
    customHeadLabelRender: () => generateCustomHeaderName(label),
    customBodyRender: (value: any) => bodyRenderer(value),
  },
});

const generateCustomColumnSortFalse = (
  name: any,
  label: string,
  bodyRenderer: (arg0: any) => any
) => ({
  name,
  options: {
    filter: true,
    sort: false,
    customHeadLabelRender: () => generateCustomHeaderName(label),
    customBodyRender: (value: any) => bodyRenderer(value),
  },
});

const generateStatusColumn = (
  column: {
    name: string;
    label: string;
    bodyRenderer: (arg0: any) => any;
  },
  rowDataIndex: number
) => {
  if (column.name === "StatusColorCode") {
    return {
      name: "StatusColorCode",
      options: {
        filter: false,
        sort: false,
        display: false,
      },
    };
  } else if (column.name === "IsCreatedByClient") {
    return {
      name: "IsCreatedByClient",
      options: {
        display: false,
      },
    };
  } else if (column.name === "StatusName" || column.name === "TaskStatus") {
    return {
      name: column.name,
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Status"),
        customBodyRender: (value: any, tableMeta: { rowData: any[] }) =>
          generateStatusWithColor(value, tableMeta.rowData[rowDataIndex]),
      },
    };
  } else if (column.name === "SLAStatus") {
    return {
      name: column.name,
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName(column.label),
        customBodyRender: (value: string) =>
          generateStatusWithColor(
            value,
            value === "SLA Not Achieved" ? "#FF005F" : "#19C969"
          ),
      },
    };
  } else if (column.name === "IsBillable") {
    return {
      name: column.name,
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName(column.label),
        customBodyRender: (value: boolean) =>
          generateStringValue(value, "IsBillable"),
      },
    };
  } else if (column.name === "IsProductive") {
    return {
      name: column.name,
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName(column.label),
        customBodyRender: (value: boolean) =>
          generateStringValue(value, "IsProductive"),
      },
    };
  } else {
    return generateCustomColumn(column.name, column.label, column.bodyRenderer);
  }
};

export {
  generateCustomColumn,
  generateCustomColumnSortFalse,
  generateStatusColumn,
};
