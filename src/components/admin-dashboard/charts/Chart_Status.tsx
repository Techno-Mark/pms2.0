import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsVariablePie from "highcharts/modules/variable-pie";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";
import { generateEmailboxStatusOnlyColor } from "@/utils/datatable/CommonFunction";

if (typeof Highcharts === "object") {
  HighchartsVariablePie(Highcharts);
}

interface chartData {
  Type: number;
  StatusType: string;
  Count: number;
  CountInPercentage: number;
}

interface ChartProjectStatusProps {
  dashboardEmailboxStatus: chartData[];
  currentFilterData: DashboardInitialFilter;
  sendData: (isDialogOpen: boolean, selectedPointData: number) => void;
}

const Chart_Status = ({
  dashboardEmailboxStatus,
  currentFilterData,
  sendData,
}: ChartProjectStatusProps) => {
  const [data, setData] = useState<any[]>([]);

  const getProjectStatusData = async () => {
    const chartData = dashboardEmailboxStatus.map((item: chartData) => ({
      name: item.StatusType,
      y: item.Count,
      z: item.CountInPercentage,
      ColorCode: generateEmailboxStatusOnlyColor(item.StatusType),
      Type: item.Type,
    }));

    setData(chartData);
  };

  useEffect(() => {
    const fetchData = async () => {
      await getProjectStatusData();
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentFilterData, dashboardEmailboxStatus]);

  const drilldownData = data;

  const chartOptions = {
    chart: {
      type: "pie",
      width: 500,
      height: 280,
      spacingTop: 10,
      marginLeft: -180,
    },
    title: {
      text: null,
    },

    plotOptions: {
      series: {
        dataLabels: {
          enabled: false,
        },
        cursor: "pointer",
        point: {
          events: {
            click: function (this: Highcharts.Point) {
              sendData(true, (this.options as any).Type);
            },
          },
        },
      },
    },
    tooltip: {
      headerFormat: "",
      formatter(this: Highcharts.TooltipFormatterContextObject) {
        const count = this.point.y !== undefined ? this.point.y : 0;
        const percentage =
          this.point.percentage !== undefined ? this.point.percentage : 0;

        return (
          '<span style="color:' +
          this.point.color +
          '">\u25CF</span> <b>' +
          this.point.name +
          "</b><br/>" +
          "Count: <b>" +
          count +
          "</b><br/>" +
          "Percentage: <b>" +
          Highcharts.numberFormat(percentage, 2, ".") +
          "%</b>"
        );
      },
    },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "center",
      // itemMarginTop: 10,
      // width: 400,
      // x: 200,
    },
    series: [
      {
        type: "pie",
        colorByPoint: true,
        data: data,
        showInLegend: true,
        colors: data.map((item: { ColorCode: string }) => item.ColorCode),
      },
    ],
    drilldown: {
      series: drilldownData,
    },
    accessibility: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
  };

  return (
    <div className="flex flex-col px-[20px]">
      <span className="flex items-start pt-[30px] px-[10px] text-lg font-bold">
        Ticket Created - By Status
      </span>
      <div className="flex justify-between relative">
        <div>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Chart_Status;
