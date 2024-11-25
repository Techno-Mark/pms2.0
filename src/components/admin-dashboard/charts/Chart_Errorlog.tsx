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
interface ChartProjectStatusProps {
  onSelectedProjectIds: number[];
  currentFilterData: DashboardInitialFilter;
  sendData: (isDialogOpen: boolean, selectedPointData: number) => void;
}

interface Response {
  List: ListProjectStatusSequence[] | [];
  TotalCount: number;
}

const Chart_Errorlog = ({
  onSelectedProjectIds,
  currentFilterData,
  sendData,
}: ChartProjectStatusProps) => {
  const [data, setData] = useState<any | any[]>([]);

  const getProjectStatusData = async () => {
    const workTypeIdFromLocalStorage =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("workTypeId")
        : 3;
    const params = {
      Clients: currentFilterData.Clients,
      WorkTypeId:
        currentFilterData.WorkTypeId === null
          ? Number(workTypeIdFromLocalStorage)
          : currentFilterData.WorkTypeId,
      DepartmentIds: currentFilterData.DepartmentIds,
      AssigneeIds: currentFilterData.AssigneeIds,
      ReviewerIds: currentFilterData.ReviewerIds,
      StartDate: currentFilterData.StartDate,
      EndDate: currentFilterData.EndDate,
      ProjectId:
        onSelectedProjectIds.length === 0 ? null : onSelectedProjectIds,
    };
    const url = `${process.env.report_api_url}/dashboard/errorloggraph`;
    const successCallback = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        const chartData = ResponseData.List.map(
          (item: ListProjectStatusSequence) => ({
            name: item.Key,
            y: item.Value,
            z: item.Percentage,
            ColorCode: item.ColorCode,
            // Sequence: item.Sequence,
          })
        );

        setData(chartData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const fetchData = async () => {
      await getProjectStatusData();
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentFilterData]);

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
            click: (event: { point: { name: any } }) => {
              const selectedPointData = {
                name: (event.point && event.point.name) || "",
              };
              sendData(true, selectedPointData.name);
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
        Errorlog
      </span>
      <div className="flex justify-between relative">
        <div>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Chart_Errorlog;
