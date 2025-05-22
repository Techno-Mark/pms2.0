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
  data: {
    DepartmentId: number;
    DepartmentName: string;
    WorklogTotalTime: number;
    ExeTotalLoggedTime: number;
  }[];
  sendData: (department: number, type: number) => void;
}) => {
  const [chartData, setChartData] = useState<DepartmentData[]>([]);
  const [chartLoaded, setChartLoaded] = useState(true);

  useEffect(() => {
    if (data.length > 0 && !loading) {
      setChartLoaded(false);
      setChartData(data);
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
            const hoveredPoint = chart.hoverPoints?.[0];
            const hoveredPoint1 = chart.hoverPoints?.[1];
            if (hoveredPoint) {
              const x =
                Math.max(hoveredPoint.plotX, hoveredPoint1.plotX) +
                chart.plotLeft -
                labelWidth / 2 +
                Math.max(
                  hoveredPoint.shapeArgs.width,
                  hoveredPoint1.shapeArgs.width
                ) /
                  2;
              const y = 300; // 10px above
              return { x, y };
            }
            return { x: 0, y: 0 };
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
            point: {
              events: {
                click: function () {
                  const department =
                    chartData[(this as unknown as Highcharts.Point).index]
                      .DepartmentId;
                  const label = (this as unknown as Highcharts.Point).series
                    .name;
                  sendData(department, label === "Logged Hours" ? 1 : 2);
                },
              },
            },
          },
        },
        series: [
          {
            name: "Logged Hours",
            data: chartData.map((d) => d.ExeTotalLoggedTime),
            color: "#5D8BDD",
            type: "column",
          },
          {
            name: "Working Hours",
            data: chartData.map((d) => d.WorklogTotalTime),
            color: "#19C969",
            type: "column",
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
