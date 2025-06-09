import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Spinner } from "next-ts-lib";

interface TaskData {
  departments: string[];
  departmentIds: number[];
  slaAchieved: number[];
  slaNotAchieved: number[];
}

const Chart_SLATATAchivement = ({
  loading,
  data,
  sendData,
}: {
  loading: boolean;
  data: any;
  sendData: (department: number, type: number) => void;
}) => {
  const [chartData, setChartData] = useState<TaskData | null>(null);
  const [chartLoaded, setChartLoaded] = useState(true);

  useEffect(() => {
    if (data.length > 0 && !loading) {
      const formattedData: TaskData = {
        departments: data.map(
          (item: { DepartmentName: string }) => item.DepartmentName
        ),
        departmentIds: data.map(
          (item: { DepartmentId: number }) => item.DepartmentId
        ),
        slaAchieved: data.map((item: { SLAAchieved: number }) =>
          item.SLAAchieved === 0 ? null : item.SLAAchieved
        ),
        slaNotAchieved: data.map((item: { SLANotAchieved: number }) =>
          item.SLANotAchieved === 0 ? null : item.SLANotAchieved
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
              enabled: false,
            },
            cursor: "pointer",
            pointWidth: 30,
            maxPointWidth: 50,
            minPointLength: 5,
            point: {
              events: {
                click: function () {
                  const point = this as unknown as Highcharts.Point;
                  const department = chartData.departmentIds[point.index];
                  const type = point.series.name;
                  sendData(department, type === "SLA Not Achieved" ? 2 : 1);
                },
              },
            },
          },
        },
        series: [
          {
            name: "SLA Not Achieved",
            type: "column",
            data: chartData.slaNotAchieved,
            color: "#FF005F",
          },
          {
            name: "SLA Achieved",
            type: "column",
            data: chartData.slaAchieved,
            color: "#19C969",
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
        SLA TAT Achievement
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

export default Chart_SLATATAchivement;
