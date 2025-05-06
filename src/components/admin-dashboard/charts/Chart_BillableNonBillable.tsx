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
        tooltip: {
          shared: true,
        },
        plotOptions: {
          series: {
            cursor: "pointer",
            point: {
              events: {
                click: function () {
                  const point = this as any;
                  const departmentIndex = point.index;
                  const department = chartData.departmentIds[departmentIndex];
                  const seriesName = point.series.name;
                  sendData(department, seriesName);
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
