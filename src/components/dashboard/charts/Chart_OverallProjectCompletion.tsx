import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsVariablePie from "highcharts/modules/variable-pie";
import { callAPI } from "@/utils/API/callAPI";
import { ListOverallProject } from "@/utils/Types/dashboardTypes";

if (typeof Highcharts === "object") {
  HighchartsVariablePie(Highcharts);
}
interface OverallProjectCompletionProps {
  onSelectedProjectIds: number[];
  onSelectedWorkType: number;
  onSelectedDepartment: number;
  sendData: (isDialogOpen: boolean, selectedPointData: string) => void;
}

const Chart_OverallProjectCompletion = ({
  onSelectedProjectIds,
  onSelectedWorkType,
  onSelectedDepartment,
  sendData,
}: OverallProjectCompletionProps) => {
  const [data, setData] = useState<ListOverallProject[] | []>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    const getData = async () => {
      const params = {
        projectIds: onSelectedProjectIds,
        typeOfWork: onSelectedWorkType === 0 ? null : onSelectedWorkType,
        DepartmentId: onSelectedDepartment === 0 ? null : onSelectedDepartment,
      };
      const url = `${process.env.report_api_url}/clientdashboard/overallprojectcompletion`;
      const successCallback = (
        ResponseData: { List: ListOverallProject[] | []; TotalCount: number },
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setData(ResponseData.List);
          setTotalCount(ResponseData.TotalCount);
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
  }, [onSelectedProjectIds, onSelectedWorkType, onSelectedDepartment]);

  const chartOptions = {
    chart: {
      type: "variablepie",
      width: 300,
      height: 280,
      spacingTop: -50,
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
      width: 80,
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
        data: data.map((item: ListOverallProject) => {
          return {
            name: item.Key,
            key: item.Key,
            y: item.Count,
            z: `${item.Percentage} %`,
          };
        }),
        colors: data.map((item: ListOverallProject) => item.ColorCode),
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
        Overall Project Completion
      </span>
      <div className="flex justify-between relative">
        <div className="mt-5">
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
        {data.length > 0 && (
          <span className="flex flex-col items-center absolute bottom-[9rem] z-0 left-[5rem]">
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

export default Chart_OverallProjectCompletion;
