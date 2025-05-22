import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Spinner } from "next-ts-lib";

interface DepartmentData {
  DepartmentId: number;
  DepartmentName: string;
  TotalAutoTime: number;
  TotalManualTime: number;
  TotalBreakTime: number;
  TotalIdleTime: number;
}

const Chart_ManualVsAuto = ({
  loading,
  data,
  sendData,
}: {
  loading: boolean;
  data: {
    DepartmentId: number;
    DepartmentName: string;
    TotalManualTime: number;
    TotalAutoTime: number;
    TotalBreakTime: number;
    TotalIdleTime: number;
  }[];
  sendData: (department: number, type: number) => void;
}) => {
  const [chartData, setChartData] = useState<DepartmentData[] | null>(null);

  useEffect(() => {
    setChartData(data);
  }, [data]);

  const options = chartData
    ? {
        chart: {
          type: "bar",
        },
        title: {
          text: null,
        },
        xAxis: {
          categories: chartData.map((d) => d.DepartmentName),
          title: {
            text: "Departments",
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: "Total Logged Hours",
          },
          stackLabels: {
            enabled: true,
            style: {
              fontWeight: "bold",
              color:
                (Highcharts.defaultOptions.title?.style &&
                  Highcharts.defaultOptions.title.style.color) ||
                "gray",
            },
          },
        },
        tooltip: {
          headerFormat: "<b>{point.x}</b><br/>",
          pointFormat:
            "{series.name}: {point.y} hrs<br/>Total: {point.stackTotal} hrs",
        },
        plotOptions: {
          series: {
            stacking: "normal",
            cursor: "pointer",
            pointWidth: 20,
            maxPointWidth: 30,
            point: {
              events: {
                click: function () {
                  const department =
                    chartData[(this as unknown as Highcharts.Point).index]
                      .DepartmentId;
                  const label = (this as unknown as Highcharts.Point).series
                    .name;
                  sendData(
                    department,
                    label === "Manual Logged Time"
                      ? 1
                      : label === "Auto Logged Time"
                      ? 2
                      : label === "Idle Time"
                      ? 3
                      : label === "Break Time"
                      ? 4
                      : 0
                  );
                },
              },
            },
          },
        },
        series: [
          {
            name: "Idle Time",
            data: chartData.map((d) => Number(d.TotalIdleTime)),
            color: "#FF005F",
            type: "column",
          },
          {
            name: "Break Time",
            data: chartData.map((d) => Number(d.TotalBreakTime)),
            color: "#FFC000",
            type: "column",
          },
          {
            name: "Manual Logged Time",
            data: chartData.map((d) => Number(d.TotalManualTime)),
            color: "#5D8BDD",
            type: "column",
          },
          {
            name: "Auto Logged Time",
            data: chartData.map((d) => Number(d.TotalAutoTime)),
            color: "#19C969",
            type: "column",
          },
        ],
        legend: { enable: true },
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
        Time Insights
      </span>
      {loading ? (
        <div className="h-[400px] w-full flex justify-center items-center">
          <Spinner size="30px" />
        </div>
      ) : (
        <HighchartsReact highcharts={Highcharts} options={options} />
      )}
    </div>
  );
};

export default Chart_ManualVsAuto;
