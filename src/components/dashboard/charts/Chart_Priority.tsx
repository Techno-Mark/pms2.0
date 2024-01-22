import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import HighchartsVariablePie from "highcharts/modules/variable-pie";
import { callAPI } from "@/utils/API/callAPI";

if (typeof Highcharts === "object") {
  HighchartsVariablePie(Highcharts);
}

interface PriorityProps {
  onSelectedProjectIds: number[];
  onSelectedWorkType: number;
  sendData: any;
}

const Chart_Priority: React.FC<PriorityProps> = ({
  onSelectedProjectIds,
  onSelectedWorkType,
  sendData,
}) => {
  const [data, setData] = useState<any | any[]>([]);
  const [totalCount, setTotalCount] = useState<any | number>(0);

  useEffect(() => {
    const getData = async () => {
      const params = {
        projectIds: onSelectedProjectIds,
        typeOfWork: onSelectedWorkType === 0 ? null : onSelectedWorkType,
      };
      const url = `${process.env.report_api_url}/clientdashboard/taskprioritycount`;
      const successCallback = (
        ResponseData: any,
        error: any,
        ResponseStatus: any
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          const drilldownData = Object.entries(ResponseData).map(
            ([category, value]) => ({
              name: category,
              id: category.toLowerCase(),
              y: value,
              z: value,
            })
          );
          const total = drilldownData.reduce(
            (acc: any, item: any) => acc + item.y,
            0
          );
          setTotalCount(total);
          setData(drilldownData);
        }
      };
      callAPI(url, params, successCallback, "POST");
    };

    getData();
  }, [onSelectedProjectIds, onSelectedWorkType]);

  const chartOptions = {
    chart: {
      type: "variablepie",
      width: 300,
      height: 280,
      spacingTop: 10,
    },
    title: {
      text: null,
    },
    tooltip: {
      headerFormat: "",
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b> {point.name}</b><br/>' +
        "count: <b>{point.y}</b><br/>",
    },
    plotOptions: {
      variablepie: {
        dataLabels: {
          enabled: false,
          format: "<b>{point.y}</b>",
        },
        cursor: "pointer",
        point: {
          events: {
            click: (event: { point: { name: string } }) => {
              const selectedPointData = {
                name: (event.point && event.point.name) || "",
              };
              sendData(true, selectedPointData.name);
            },
          },
        },
      },
    },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle",
      itemMarginBottom: 10,
      width: 80,
    },
    series: [
      {
        type: "variablepie",
        minPointSize: 30,
        innerSize: "60%",
        zMin: 0,
        name: "priority",
        borderRadius: 4,
        data: data,
        showInLegend: true,
        colors: ["#D32D41", "#EA6A47", "#6AB187"],
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
      <span className="flex items-start pt-[20px] text-lg font-medium">
        Priority
      </span>
      <div className="flex justify-between relative">
        <div>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
        {data.length > 0 && (
          <span
            className={`flex flex-col items-center absolute bottom-[7.2rem] ${
              totalCount <= 1 ? "left-[5.2rem]" : "left-[4.88rem]"
            }`}
          >
            <span className="text-xl font-semibold text-darkCharcoal">
              {totalCount}
            </span>
            <span className="text-lg text-slatyGrey">
              {totalCount > 1 ? "Tasks" : "Task"}
            </span>
          </span>
        )}
      </div>
    </div>
  );
};

export default Chart_Priority;
