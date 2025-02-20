import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";
import { generateEmailboxPriorityOnlyColor } from "@/utils/datatable/CommonFunction";

interface ChartData {
  Type: number;
  Priority: string;
  Count: number;
  CountInPercentage: number;
}

interface ChartProjectStatusProps {
  dashboardEmailboxPriority: ChartData[];
  currentFilterData: DashboardInitialFilter;
  sendData: (isDialogOpen: boolean, selectedType: number) => void;
}

const Chart_EmailPriority = ({
  dashboardEmailboxPriority,
  currentFilterData,
  sendData,
}: ChartProjectStatusProps) => {
  const [data, setData] = useState<any[]>([]);

  const getProjectStatusData = async () => {
    const chartData = dashboardEmailboxPriority.map((item: ChartData) => ({
      name: item.Priority,
      y: item.Count,
      color: generateEmailboxPriorityOnlyColor(item.Priority),
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
  }, [currentFilterData, dashboardEmailboxPriority]);

  const chartOptions = {
    chart: {
      type: "bar",
      width: 500,
      height: 350,
      spacingTop: 30,
    },
    title: {
      text: "Ticket Created - By Priority",
      align: "left",
      style: {
        fontWeight: "normal",
        fontSize: "18px",
      },
    },
    xAxis: {
      type: "category",
      categories: data.map((item) => item.name),
      title: {
        text: "Priority Levels",
      },
    },
    yAxis: {
      title: {
        text: "Count",
      },
      allowDecimals: false,
    },
    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          format: "{y}",
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
      formatter(this: Highcharts.TooltipFormatterContextObject) {
        return `<b>${this.point.name}</b><br/>Count: <b>${this.point.y}</b>`;
      },
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        name: "SLA Tickets",
        data: data,
        colorByPoint: false,
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
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};

export default Chart_EmailPriority;
