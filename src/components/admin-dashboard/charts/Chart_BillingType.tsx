import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import HighchartsVariablePie from "highcharts/modules/variable-pie";
import { callAPI } from "@/utils/API/callAPI";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";

if (typeof Highcharts === "object") {
  HighchartsVariablePie(Highcharts);
}

interface ChartBillingTypeProps {
  data: any;
  totalCount: number;
  sendData: (selectedPointData: string) => void;
}

const Chart_BillingType = ({
  data,
  totalCount,
  sendData,
}: ChartBillingTypeProps) => {

  const chartOptions = {
    chart: {
      type: "variablepie",
      width: 480,
      height: 240,
      spacingTop: 10,
    },
    title: {
      text: null,
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
    plotOptions: {
      variablepie: {
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
              sendData(selectedPointData.name);
            },
          },
        },
      },
    },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle",
      width: 150,
      itemMarginBottom: 10,
    },
    series: [
      {
        type: "variablepie",
        minPointSize: 30,
        innerSize: "60%",
        zMin: 0,
        name: "projects",
        borderRadius: 4,
        showInLegend: true,
        data: data,
      },
    ],
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
        Billing Type
      </span>
      <div className="flex justify-between relative">
        <div className="mt-5">
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
        {data.length > 0 && (
          <span
            className={`flex flex-col items-center absolute bottom-[5.9rem] z-0 ${
              totalCount <= 1 ? "left-[8.45rem]" : "left-[8.35rem]"
            }`}
          >
            <span className="text-xl font-semibold text-darkCharcoal">
              {totalCount}
            </span>
            <span className="text-lg text-slatyGrey">
              {totalCount > 1 ? "Clients" : "Client"}
            </span>
          </span>
        )}
      </div>
    </div>
  );
};

export default Chart_BillingType;
