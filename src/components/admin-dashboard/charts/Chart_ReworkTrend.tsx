import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Spinner } from "next-ts-lib";

interface ReworkData {
  departments: string[];
  departmentIds: number[];
  taskCounts: number[];
}

const Chart_ReworkTrend = ({
  loading,
  data,
  sendData,
}: {
  loading: boolean;
  data: {
    DepartmentId: number;
    DepartmentName: string;
    TaskCount: number;
  }[];
  sendData: (department: number) => void;
}) => {
  const [chartData, setChartData] = useState<ReworkData | null>(null);
  const [chartLoaded, setChartLoaded] = useState(true);

  useEffect(() => {
    if (data.length > 0 && !loading) {
      const formattedData: ReworkData = {
        departments: data.map(
          (item: { DepartmentName: string }) => item.DepartmentName
        ),
        departmentIds: data.map(
          (item: { DepartmentId: number }) => item.DepartmentId
        ),
        taskCounts: data.map(
          (item: { TaskCount: number }) => item.TaskCount || 0
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

  const options = chartData
    ? {
        chart: {
          type: "line",
        },
        title: {
          text: null,
        },
        subtitle: {
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
            text: "Number Of Tasks Returned For Rework",
          },
        },
        tooltip: {
          pointFormat: "{series.name}: <b>{point.y}</b>",
        },
        plotOptions: {
          series: {
            cursor: "pointer",
            point: {
              events: {
                click: function () {
                  const departmentId =
                    chartData.departmentIds[(this as any).index];
                  const taskCount = chartData.taskCounts[(this as any).index];
                  taskCount > 0 && sendData(departmentId);
                },
              },
            },
          },
        },
        series: [
          {
            name: "Rework Tasks",
            data: chartData.taskCounts || 0,
            color: "#000000",
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
        Rework Trend
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

export default Chart_ReworkTrend;
