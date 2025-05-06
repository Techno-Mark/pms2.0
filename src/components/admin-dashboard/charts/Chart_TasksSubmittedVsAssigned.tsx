import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface TaskData {
  departments: string[];
  departmentIds: number[];
  submitted: number[];
  assigned: number[];
}

const Chart_TasksSubmittedVsAssigned = ({ data, sendData }: any) => {
  const [chartData, setChartData] = useState<TaskData | null>(null);

  useEffect(() => {
    const formattedData: TaskData = {
      departments: data.map(
        (item: { DepartmentName: string }) => item.DepartmentName
      ),
      departmentIds: data.map(
        (item: { DepartmentId: number }) => item.DepartmentId
      ),
      submitted: data.map((item: { CompletedCount: number }) =>
        item.CompletedCount === 0 ? null : item.CompletedCount
      ),
      assigned: data.map((item: { AssignedCount: number }) =>
        item.AssignedCount === 0 ? null : item.AssignedCount
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
        yAxis: {
          min: 0,
          title: {
            text: "Number Of Tasks",
          },
          stackLabels: {
            enabled: true,
            style: {
              fontWeight: "bold",
              color: Highcharts.defaultOptions.title?.style?.color || "gray",
            },
          },
        },
        tooltip: {
          headerFormat: "<b>{point.x}</b><br/>",
          pointFormat: "{series.name}: {point.y}<br/>Total: {point.stackTotal}",
        },
        plotOptions: {
          column: {
            stacking: "normal",
            dataLabels: {
              enabled: true,
              style: {
                color: "white",
                textOutline: "none",
                fontWeight: "bold",
              },
            },
            cursor: "pointer",
            pointWidth: 50,
            point: {
              events: {
                click: function () {
                  const point = this as unknown as Highcharts.Point;
                  const department = chartData.departments[point.index];
                  const type = point.series.name;
                  sendData(department, type);
                },
              },
            },
          },
        },
        series: [
          {
            name: "Submitted",
            type: "column",
            data: chartData.submitted,
            color: "#19C969",
          },
          {
            name: "Assigned",
            type: "column",
            data: chartData.assigned,
            color: "#5D8BDD",
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
        Tasks Submitted vs Assigned
      </span>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default Chart_TasksSubmittedVsAssigned;
