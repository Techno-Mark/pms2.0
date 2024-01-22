

export const exportToCSV = (props: any): any[] => {
  const filteredData: any[] = props.filteredData;
  const headers: string[] = props.headers;

  const csvData: any[] = filteredData.map((item: any) => {
    const rowData: any = {};
    headers.forEach((header: string) => {
      rowData[header] = item[header];
    });
    return rowData;
  });

  return csvData;
};
