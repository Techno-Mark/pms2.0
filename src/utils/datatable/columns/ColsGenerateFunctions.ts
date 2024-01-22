import {
  generateCustomHeaderName,
  generateStatusWithColor,
} from "../CommonFunction";

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
  } else if (column.name === "StatusName") {
    return {
      name: "StatusName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Status"),
        customBodyRender: (value: any, tableMeta: { rowData: any[] }) =>
          generateStatusWithColor(value, tableMeta.rowData[rowDataIndex]),
      },
    };
  } else {
    return generateCustomColumn(column.name, column.label, column.bodyRenderer);
  }
};

export { generateCustomColumn, generateStatusColumn };
