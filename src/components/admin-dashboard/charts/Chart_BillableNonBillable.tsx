import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Spinner } from "next-ts-lib";

interface ChartData {
  departments: string[];
  departmentIds: number[];
  billableTime: number[];
  nonBillableTime: number[];
  productiveTime: number[];
  nonProductiveTime: number[];
}

const Chart_BillableNonBillable = ({
  loading,
  data,
  sendData,
}: {
  loading: boolean;
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
  const [chartLoaded, setChartLoaded] = useState(true);

  useEffect(() => {
    if (data.length > 0 && !loading) {
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
      setChartLoaded(false);
      setChartData(formattedData);
    } else if (data.length <= 0 && !loading) {
      setChartLoaded(false);
      setChartData(null);
    } else {
      setChartLoaded(true);
    }
  }, [data]);

  const filterZero = (value: number) => (value > 0 ? value : null);

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
            labelWidth: number,
            labelHeight: number,
            point: any
          ): { x: number; y: number } {
            const chart = (this as any).chart;
            let x = 0;
            let y = 0;
            const realPoint = point?.point ?? chart.hoverPoint;

            if (!realPoint) {
              return {
                x: chart.plotLeft + chart.plotWidth / 2 - labelWidth / 2,
                y: chart.plotTop + chart.plotHeight / 2 - labelHeight / 2,
              };
            }

            const currentCategoryIndex = realPoint.index;
            const currentValue =
              realPoint.color === "#2caffe" || realPoint.color === "#544fc5"
                ? realPoint.y
                : 0;

            // Calculate sum of all series' values for the same category
            const categorySum = chart.series.reduce(
              (sum: number, series: any) => {
                const pt = series.points[currentCategoryIndex];
                return pt &&
                  typeof pt.y === "number" &&
                  (pt.color === "#2caffe" || pt.color === "#544fc5")
                  ? sum + pt.y
                  : sum;
              },
              0
            );


            if (point) {
              const shapeWidth = point.shapeArgs?.width || 0;
              x =
                point.plotX -
                (categorySum === 0
                  ? 0
                  : categorySum !== currentValue
                  ? -25
                  : 0) +
                chart.plotLeft -
                labelWidth / 2 +
                shapeWidth / 2;
              y = 330;
            } else {
              x = chart.plotLeft + chart.plotWidth / 2 - labelWidth / 2;
              y = chart.plotTop + chart.plotHeight / 2 - labelHeight / 2;
            }

            return { x, y };
          },
        },
        plotOptions: {
          series: {
            cursor: "pointer",
            pointWidth: 30,
            maxPointWidth: 50,
            minPointLength: 5,
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
            data: chartData.billableTime.map((d) => filterZero(d)),
            tooltip: { valueSuffix: " hrs" },
          },
          {
            name: "Non-Billable",
            type: "column",
            data: chartData.nonBillableTime.map((d) => filterZero(d)),
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
      {loading || chartLoaded ? (
        <div className="h-[400px] w-full flex justify-center items-center">
          <Spinner size="30px" />
        </div>
      ) : (
        <HighchartsReact highcharts={Highcharts} options={options} />
      )}
    </div>
  );
};

export default Chart_BillableNonBillable;
