import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { callAPI } from "@/utils/API/callAPI";
import { KeyValueColorCodeSequenceStatusId } from "@/utils/Types/types";

interface TaskStatusProps {
  onSelectedProjectIds: number[];
  onSelectedWorkType: number;
  sendData: (isDialogOpen: boolean, selectedPointData: number) => void;
}

const Chart_TaskStatus = ({
  onSelectedProjectIds,
  onSelectedWorkType,
  sendData,
}: TaskStatusProps) => {
  const [data, setData] = useState<
    | {
        name: string;
        y: number;
        color: string;
        StatusId: number;
      }[]
    | []
  >([]);

  useEffect(() => {
    const getData = () => {
      const params = {
        projectIds: onSelectedProjectIds,
        typeOfWork: onSelectedWorkType === 0 ? null : onSelectedWorkType,
      };
      const url = `${process.env.report_api_url}/clientdashboard/taskstatuscount`;
      const successCallback = (
        ResponseData: KeyValueColorCodeSequenceStatusId[] | [],
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          const chartData = ResponseData.map(
            (item: KeyValueColorCodeSequenceStatusId) => ({
              name: item.Key,
              y: item.Value,
              color: item.ColorCode,
              StatusId: item.StatusId,
            })
          );

          setData(chartData);
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

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "bar",
      height: 600,
      spacingTop: 0,
    },
    title: {
      text: undefined,
    },
    xAxis: {
      categories: data.map((item: { name: string }) => item.name),
      title: {
        text: null,
      },
      gridLineWidth: 1,
      lineWidth: 0,
    },
    tooltip: {
      headerFormat: "",
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b> {point.name}</b><br/>' +
        "count: <b>{point.y}</b><br/>",
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        dataLabels: {
          enabled: true,
        },
        groupPadding: 0.1,

        cursor: "pointer",
        point: {
          events: {
            click: (event: any) => {
              const selectedPointData = {
                StatusId: (event.point && event.point.StatusId) || "",
              };
              sendData(true, selectedPointData.StatusId);
            },
          },
        },
      },
    },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "top",
      x: -40,
      y: 80,
      floating: true,
      borderWidth: 1,
      backgroundColor:
        Highcharts.defaultOptions?.legend?.backgroundColor || "#FFFFFF",
      shadow: true,
    },
    series: [
      {
        type: "bar",
        name: undefined,
        data: data,
        showInLegend: false,
        colorByPoint: true,
        colors: data.map((item: { color: string }) => item.color),
      },
    ],
    accessibility: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
  };

  useEffect(() => {
    Highcharts.setOptions({
      lang: {
        thousandsSep: ",",
      },
    });
  }, []);

  return (
    <div className="flex flex-col py-[20px] px-[30px]">
      <span className="text-lg font-medium pb-[20px]">Task Status</span>
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};

export default Chart_TaskStatus;
