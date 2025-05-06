import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface ChartData {
  departments: string[];
  departmentIds: number[];
  billableTime: number[];
  nonBillableTime: number[];
  productiveTime: number[];
  nonProductiveTime: number[];
}

const Chart_BillableNonBillable = ({
  data,
  sendData,
}: {
  data: {
    DepartmentId: number;
    DepartmentName: string;
    ProductiveTime: number;
    NonProductiveTime: number;
    BillableTime: number;
    NonBillableTime: number;
  }[];
  sendData: (department: number, type: string) => void;
}) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    const formattedData: ChartData = {
      departments: data.map(
        (item: { DepartmentName: string }) => item.DepartmentName
      ),
      departmentIds: data.map(
        (item: { DepartmentId: number }) => item.DepartmentId
      ),
      billableTime: data.map(
        (item: { BillableTime: number }) => item.BillableTime || 0
      ),
      nonBillableTime: data.map(
        (item: { NonBillableTime: number }) => item.NonBillableTime || 0
      ),
      productiveTime: data.map(
        (item: { ProductiveTime: number }) => item.ProductiveTime || 0
      ),
      nonProductiveTime: data.map(
        (item: { NonProductiveTime: number }) => item.NonProductiveTime || 0
      ),
    };

    setChartData(formattedData);
  }, [data]);

  const options = chartData
    ? {
        chart: {
          type: "column",
        },
        title: {
          text: null,
        },
        xAxis: {
          categories: chartData.departments,
          title: {
            text: "Departments",
          },
        },
        yAxis: [
          {
            min: 0,
            title: { text: "" },
            labels: {
              format: "{value} hrs",
            },
          },
          {
            title: { text: "" },
            labels: {
              format: "{value}%",
            },
            opposite: true,
          },
        ],
        // tooltip: {
        //   shared: true,
        // },
        tooltip: {
          shared: true,
          useHTML: true,
          outside: true,
          backgroundColor: "#fff",
          borderColor: "#ccc",
          borderRadius: 8,
          borderWidth: 1,
          shadow: true,
          formatter: function (): string {
            const points = (this as any).points || [this as any];
            const department = points[0].key;
            let content = `<div style="padding: 10px; font-size: 14px; font-weight: 500;">
              <strong>${department}</strong><br/>`;
            points.forEach((p: any) => {
              content += `<span style="color:${p.color}">\u25CF</span> ${
                p.series.name
              }: <b>${p.y}</b> ${
                p.series.tooltipOptions.valueSuffix || ""
              }<br/>`;
            });
            content += `</div>`;
            return content;
          },
          positioner: function (
            labelWidth: any,
            labelHeight: any,
            point: any
          ): { x: number; y: number } {
            const chart = (this as any).chart;
            const hoveredPoint = chart.hoverPoints?.[0]; // use first point
            if (hoveredPoint) {
              const x =
                hoveredPoint.plotX +
                chart.plotLeft -
                labelWidth / 2 +
                hoveredPoint.shapeArgs.width / 2;
              const y = hoveredPoint.plotY + chart.plotTop - labelHeight - 10; // 10px above
              return { x, y };
            }
            return { x: 0, y: 0 };
          },
        },
        plotOptions: {
          series: {
            cursor: "pointer",
            maxPointWidth: 50,
            point: {
              events: {
                click: function () {
                  const point = this as any;
                  const departmentIndex = point.index;
                  const department = chartData.departmentIds[departmentIndex];
                  const seriesName = point.series.name;
                  point.y > 0 && sendData(department, seriesName);
                },
              },
            },
          },
        },
        series: [
          {
            name: "Billable",
            type: "column",
            data: chartData.billableTime,
            tooltip: { valueSuffix: " hrs" },
          },
          {
            name: "Non-Billable",
            type: "column",
            data: chartData.nonBillableTime,
            tooltip: { valueSuffix: " hrs" },
          },
          {
            name: "Productive",
            type: "spline",
            yAxis: 1,
            data: chartData.productiveTime,
            tooltip: { valueSuffix: "%" },
          },
          {
            name: "Non-Productive",
            type: "spline",
            yAxis: 1,
            data: chartData.nonProductiveTime,
            tooltip: { valueSuffix: "%" },
          },
        ],
        credits: {
          enabled: false,
        },
      }
    : {
        title: {
          text: null,
        },
      };

  return (
    <div className="flex flex-col w-full">
      <span className="flex items-start py-[15px] px-[10px] text-lg font-bold">
        Billable vs Non-Billable Hours
      </span>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default Chart_BillableNonBillable;

// import React, { useEffect, useState } from "react";
// import Highcharts from "highcharts";
// import HighchartsReact from "highcharts-react-official";

// interface ChartData {
//   departments: string[];
//   departmentIds: number[];
//   billableTime: number[];
//   nonBillableTime: number[];
//   productiveTime: number[];
//   nonProductiveTime: number[];
// }

// const Chart_BillableNonBillable = ({
//   data,
//   sendData,
// }: {
//   data: {
//     DepartmentId: number;
//     DepartmentName: string;
//     ProductiveTime: number;
//     NonProductiveTime: number;
//     BillableTime: number;
//     NonBillableTime: number;
//   }[];
//   sendData: (department: number, type: string) => void;
// }) => {
//   const [chartData, setChartData] = useState<ChartData | null>(null);

//   useEffect(() => {
//     const formattedData: ChartData = {
//       departments: data.map((item) => item.DepartmentName),
//       departmentIds: data.map((item) => item.DepartmentId),
//       billableTime: data.map((item) => item.BillableTime || 0),
//       nonBillableTime: data.map((item) => item.NonBillableTime || 0),
//       productiveTime: data.map((item) => item.ProductiveTime || 0),
//       nonProductiveTime: data.map((item) => item.NonProductiveTime || 0),
//     };

//     setChartData(formattedData);
//   }, [data]);

//   const options = chartData
//     ? {
//         chart: {
//           type: "column",
//         },
//         title: {
//           text: null,
//         },
//         xAxis: {
//           categories: chartData.departments,
//           title: {
//             text: "Departments",
//           },
//         },
//         yAxis: [
//           {
//             min: 0,
//             title: { text: "" },
//             labels: {
//               format: "{value} hrs",
//             },
//           },
//           {
//             title: { text: "" },
//             labels: {
//               format: "{value}%",
//             },
//             opposite: true,
//           },
//         ],
//         tooltip: {
//           shared: true,
//         },
//         plotOptions: {
//           column: {
//             point: {
//               events: {
//                 mouseOver: function () {
//                   const point = this as any;
//                   point.series.chart.container.style.cursor =
//                     point.y > 0 ? "pointer" : "default";
//                 },
//                 click: function () {
//                   const point = this as any;
//                   if (point.y > 0) {
//                     const departmentIndex = point.index;
//                     const department = chartData.departmentIds[departmentIndex];
//                     const seriesName = point.series.name;
//                     sendData(department, seriesName);
//                   }
//                 },
//               },
//             },
//           },
//           spline: {
//             enableMouseTracking: true,
//           },
//         },
//         series: [
//           {
//             name: "Billable",
//             type: "column",
//             data: chartData.billableTime.map((value) => ({
//               y: value,
//               color: value === 0 ? "#e0e0e0" : undefined,
//             })),
//             tooltip: { valueSuffix: " hrs" },
//           },
//           {
//             name: "Non-Billable",
//             type: "column",
//             data: chartData.nonBillableTime.map((value) => ({
//               y: value,
//               color: value === 0 ? "#e0e0e0" : undefined,
//             })),
//             tooltip: { valueSuffix: " hrs" },
//           },
//           {
//             name: "Productive",
//             type: "spline",
//             yAxis: 1,
//             data: chartData.productiveTime,
//             tooltip: { valueSuffix: "%" },
//           },
//           {
//             name: "Non-Productive",
//             type: "spline",
//             yAxis: 1,
//             data: chartData.nonProductiveTime,
//             tooltip: { valueSuffix: "%" },
//           },
//         ],
//         credits: {
//           enabled: false,
//         },
//       }
//     : {
//         title: {
//           text: null,
//         },
//       };

//   return (
//     <div className="flex flex-col w-full">
//       <span className="flex items-start py-[15px] px-[10px] text-lg font-bold">
//         Billable vs Non-Billable Hours
//       </span>
//       <HighchartsReact highcharts={Highcharts} options={options} />
//     </div>
//   );
// };

// export default Chart_BillableNonBillable;
