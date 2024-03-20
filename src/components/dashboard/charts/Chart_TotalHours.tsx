import React, { useEffect, useState } from "react";
import HighchartsVariablePie from "highcharts/modules/variable-pie";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { callAPI } from "@/utils/API/callAPI";
import { ListProjectStatus } from "@/utils/Types/dashboardTypes";

interface TotalHoursProps {
  onSelectedProjectIds: number[];
  onSelectedWorkType: number;
  sendData: (isDialogOpen: boolean, selectedPointData: string) => void;
}

if (typeof Highcharts === "object") {
  HighchartsVariablePie(Highcharts);
}

const Chart_TotalHours = ({
  onSelectedProjectIds,
  onSelectedWorkType,
  sendData,
}: TotalHoursProps) => {
  const [data, setData] = useState<ListProjectStatus[] | []>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    const getData = () => {
      const params = {
        projectIds: onSelectedProjectIds,
        typeOfWork: onSelectedWorkType === 0 ? null : onSelectedWorkType,
      };
      const url = `${process.env.report_api_url}/clientdashboard/clienttotalhours`;
      const successCallback = (
        ResponseData: { List: any; TotalCount: number },
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setData(ResponseData.List);
          const totalCount =
            ResponseData.List?.length > 0
              ? ResponseData.List.reduce(
                  (total: number, item: ListProjectStatus) =>
                    total + item.Value,
                  0
                )
              : 0;
          setTotalCount(totalCount);
        }
      };
      callAPI(url, params, successCallback, "POST");
    };

    const fetchData = async () => {
      getData();
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [onSelectedProjectIds, onSelectedWorkType]);

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
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b> {point.key}</b><br/>' +
        "Hours: <b>{point.y}</b><br/>",
    },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle",
      itemMarginBottom: 10,
      width: 140,
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

              sendData(true, selectedPointData.name);
            },
          },
        },
      },
    },
    series: [
      {
        type: "variablepie",
        minPointSize: 30,
        innerSize: "60%",
        zMin: 0,
        name: "Total Hours",
        borderRadius: 4,
        showInLegend: true,
        data: data.map((item: ListProjectStatus) => {
          return {
            name: `${item.Key} Hours`,
            key: item.Key,
            y: item.Value,
            z: `${item.Percentage} %`,
          };
        }),
        colors: data.map((item: ListProjectStatus) => item.ColorCode),
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
      <span className="flex items-start pt-[30px] px-[10px] text-lg font-medium">
        Total Hours
      </span>
      <div className="flex justify-between relative">
        <div className="mt-5">
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
        {data.length > 0 && (
          <span
            className={`flex flex-col items-center absolute bottom-[5.8rem] ${
              totalCount <= 1 ? "left-[8.8rem]" : "left-[8.5rem]"
            }`}
          >
            <span className="text-xl font-semibold text-darkCharcoal">
              {totalCount}
            </span>
            <span className="text-lg text-slatyGrey">
              {totalCount > 1 ? "Hours" : "Hour"}
            </span>
          </span>
        )}
      </div>
    </div>
  );
};

export default Chart_TotalHours;
