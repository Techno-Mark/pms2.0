import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToPDF = (props: any): void => {
  const filteredData: any[] = props.filteredData;
  const headers: any[] = props.headers;

  const doc = new jsPDF();
  const tableData: any[][] = filteredData.map((item: any) =>
    headers.map((header: any) => item[header.field])
  );

  const headerTexts: string[] = headers.map((header: any) => header.heading);

  (doc as any).autoTable({
    head: [headerTexts],
    body: tableData,
  });
  doc.save("table.pdf");
};
