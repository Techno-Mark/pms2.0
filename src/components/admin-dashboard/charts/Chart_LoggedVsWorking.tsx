import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Spinner } from "next-ts-lib";

interface DepartmentData {
  DepartmentId: number;
  DepartmentName: string;
  ExeTotalLoggedTime: number;
  WorklogTotalTime: number;
}

const Chart_LoggedVsWorking = ({
  loading,
  data,
  sendData,
}: {
  loading: boolean;
  data: DepartmentData[];
  sendData: (department: number, type: number) => void;
}) => {
  const [chartData, setChartData] = useState<DepartmentData[]>([]);
  const [chartLoaded, setChartLoaded] = useState(true);

  useEffect(() => {
    if (data.length > 0 && !loading) {
      setChartLoaded(false);
      setChartData(data);
    } else if (data.length <= 0 && !loading) {
      setChartLoaded(false);
      setChartData([]);
    } else {
      setChartLoaded(true);
      setChartData([]);
    }
  }, [data]);

  const chartOptions = chartData
    ? {
        chart: {
          type: "column",
        },
        title: {
          text: null,
        },
        xAxis: {
          categories: chartData.map((d) => d.DepartmentName),
          title: { text: "Departments" },
        },
        yAxis: {
          min: 0,
          title: {
            text: "Total Logged Hours",
          },
        },
        tooltip: {
          shared: true,
          useHTML: true,
          outside: true,
          backgroundColor: "#fff",
          borderColor: "#ccc",
          borderRadius: 8,
          borderWidth: 1,
          shadow: true,
          shape: "rect",
          formatter: function (): string {
            const points = (this as any).points || [this as any];
            let data = points
              .filter((p: any) => p.series.name !== "Hover Area")
              .map((i: any) => ({
                color: i.color,
                name: i.series.name,
                value: i.y,
              }));

            if (data.length <= 0) {
              data = [
                { color: "#5D8BDD", name: "Logged Hours", value: 0 },
                { color: "#19C969", name: "Working Hours", value: 0 },
              ];
            } else if (data.length === 1) {
              if (data[0].color === "#5D8BDD") {
                data.push({
                  color: "#19C969",
                  name: "Working Hours",
                  value: 0,
                });
              } else {
                data.unshift({
                  color: "#5D8BDD",
                  name: "Logged Hours",
                  value: 0,
                });
              }
            }

            const department = points[0].key;
            let content = `<div style="padding: 10px; font-size: 14px; font-weight: 500;">
              <strong>${department}</strong><br/>`;
            data.forEach((p: any) => {
              content += `<span style="color:${p.color}">\u25CF</span> ${
                p.name || ""
              }: <b>${p.value}</b><br/>`;
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
            const currentValue = realPoint.y;
            const color = realPoint.color;

            // Calculate sum of all series' values for the same category
            const categorySum = chart.series.reduce(
              (sum: number, series: any) => {
                const pt = series.points[currentCategoryIndex];
                return pt && typeof pt.y === "number" ? sum + pt.y : sum;
              },
              0
            );

            if (point) {
              const shapeWidth = point.shapeArgs?.width || 0;
              x =
                point.plotX -
                (categorySum === 0
                  ? 50
                  : categorySum !== currentValue
                  ? -25
                  : categorySum === currentValue && color === "#5D8BDD"
                  ? -30
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
          column: {
            grouping: true,
            shadow: false,
            borderWidth: 0,
          },
          series: {
            cursor: "pointer",
            pointWidth: 30,
            maxPointWidth: 50,
            minPointLength: 5,
            point: {
              events: {
                click: function () {
                  const department =
                    chartData[(this as any).index].DepartmentId;
                  const label = (this as any).series.name;
                  if (label !== "Hover Area") {
                    sendData(department, label === "Logged Hours" ? 1 : 2);
                  }
                },
              },
            },
          },
        },
        series: [
          {
            name: "Logged Hours",
            data: chartData.map((d) =>
              d.ExeTotalLoggedTime > 0 ? d.ExeTotalLoggedTime : null
            ),
            color: "#5D8BDD",
            type: "column",
          },
          {
            name: "Working Hours",
            data: chartData.map((d) =>
              d.WorklogTotalTime > 0 ? d.WorklogTotalTime : null
            ),
            color: "#19C969",
            type: "column",
          },
          {
            name: "Hover Area",
            data: chartData.map(() => 0),
            type: "column",
            color: "transparent",
            enableMouseTracking: true,
            showInLegend: false,
            pointPadding: 0,
            groupPadding: 0,
            borderWidth: 0,
            states: {
              hover: {
                enabled: false,
              },
            },
            tooltip: {
              enabled: false,
            },
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
        Total Logged vs Working
      </span>
      {loading || chartLoaded ? (
        <div className="h-[400px] w-full flex justify-center items-center">
          <Spinner size="30px" />
        </div>
      ) : (
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      )}
    </div>
  );
};

export default Chart_LoggedVsWorking;
