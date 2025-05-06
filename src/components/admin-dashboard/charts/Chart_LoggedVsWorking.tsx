import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface DepartmentData {
  DepartmentId: number;
  DepartmentName: string;
  ExeTotalLoggedTime: number;
  WorklogTotalTime: number;
}

const Chart_LoggedVsWorking = ({ data }: any) => {
  const [chartData, setChartData] = useState<DepartmentData[]>([]);

  useEffect(() => {
    setChartData(data);
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
          pointFormat:
            "<span style='color:{series.color}'>\u25CF</span> {series.name}: <b>{point.y} hrs</b><br/>",
        },
        plotOptions: {
          column: {
            grouping: true,
            shadow: false,
            borderWidth: 0,
          },
          series: {
            cursor: "pointer",
            point: {
              events: {
                click: function () {
                  const department =
                    chartData[(this as unknown as Highcharts.Point).index]
                      .DepartmentId;
                  const label = (this as unknown as Highcharts.Point).series
                    .name;
                  console.log(
                    `Clicked on: ${label}, Department: ${department}`
                  );
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
        Total Logged Vs Working
      </span>
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};

export default Chart_LoggedVsWorking;
