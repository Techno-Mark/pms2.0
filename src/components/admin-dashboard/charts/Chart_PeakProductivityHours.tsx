import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Spinner } from "next-ts-lib";

interface HourlyData {
  HourSlot: number;
  Duration: number;
}

const Chart_PeakProductivityHours = ({
  loading,
  data,
  sendData,
}: {
  loading: boolean;
  data: HourlyData[];
  sendData: (time: number) => void;
}) => {
  const [chartData, setChartData] = useState<HourlyData[]>([]);
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

  const maxVal = Math.max(...chartData.map((d) => d.Duration), 0);

  const chartOptions = chartData
    ? {
        chart: {
          type: "column",
        },
        title: {
          text: null,
        },
        xAxis: {
          categories: chartData.map((d) => `${d.HourSlot}:00`),
          title: { text: "Time of Day" },
        },
        yAxis: {
          min: 0,
          title: {
            text: "Total Logged Time in Hours",
          },
        },
        tooltip: {
          pointFormat: "<b>{point.y} Hrs</b>",
        },
        plotOptions: {
          column: {
            colorByPoint: false,
            pointWidth: 30,
            maxPointWidth: 50,
            point: {
              events: {
                click: function () {
                  const pointIndex = (this as unknown as Highcharts.Point)
                    .index;
                  const hour = chartData[pointIndex]?.HourSlot;
                  sendData(hour);
                },
              },
            },
          },
        },
        series: [
          {
            cursor: "pointer",
            name: "Peak Hours",
            type: "column",
            color: "#FFD700",
            data: chartData.map((d) => ({
              y: d.Duration,
              color: d.Duration === maxVal ? "#FFD700" : "#32E282",
            })),
          },
        ],
        legend: {
          enabled: true,
        },
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
        Peak Productivity Hours
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

export default Chart_PeakProductivityHours;
