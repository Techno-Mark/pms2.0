import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import HighchartsVariablePie from "highcharts/modules/variable-pie";
import { callAPI } from "@/utils/API/callAPI";
import {
  DashboardInitialFilter,
  ListProjectStatusSequence,
} from "@/utils/Types/dashboardTypes";

if (typeof Highcharts === "object") {
  HighchartsVariablePie(Highcharts);
}

interface chartData {
  Type: number;
  SLAType: string;
  Count: number;
  CountInPercentage: number;
}

interface ChartProjectStatusProps {
  dashboardEmailboxSLACounts: chartData[];
  onSelectedProjectIds: number[];
  currentFilterData: DashboardInitialFilter;
  sendData: (isDialogOpen: boolean, selectedPointData: number) => void;
}

interface Response {
  List: ListProjectStatusSequence[] | [];
  TotalCount: number;
}

const Chart_SLA = ({
  dashboardEmailboxSLACounts,
  onSelectedProjectIds,
  currentFilterData,
  sendData,
}: ChartProjectStatusProps) => {
  const [data, setData] = useState<any[]>([]);

  const getProjectStatusData = async () => {
    const chartData = dashboardEmailboxSLACounts.map((item: chartData) => ({
      name: item.SLAType,
      y: item.Count,
      z: item.CountInPercentage,
      ColorCode:
        item.SLAType?.toLowerCase() === "achieved"
          ? "#00E272"
          : item.SLAType?.toLowerCase() === "not achieved"
          ? "#FA4B42"
          : item.SLAType?.toLowerCase() === "at risk"
          ? "#FFC000"
          : "#000000",
      // Sequence: item.Sequence,
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
  }, [currentFilterData, dashboardEmailboxSLACounts]);

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
            click: (event: { point: { name: string } }) => {
              const selectedPointData = {
                name: (event.point && event.point.name) || "",
              };
              sendData(
                true,
                selectedPointData.name.toLowerCase() === "not achieved"
                  ? 1
                  : selectedPointData.name.toLowerCase() === "achieved"
                  ? 2
                  : selectedPointData.name.toLowerCase() === "at risk"
                  ? 3
                  : 0
              );
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
      <span className="flex items-start pt-[30px] px-[10px] text-lg font-medium">
        SLA Tickets
      </span>
      <div className="flex justify-between relative">
        <div>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Chart_SLA;
