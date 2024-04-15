type LegendType = {
  title: string;
  color: string;
};

type LegendsPropsType = {
  legends: LegendType[];
};

const Legends = ({ legends }: LegendsPropsType) => {
  return (
    <div className="w-full gap-5 flex items-center justify-center">
      {legends.map((legend: LegendType) => (
        <div key={legend.color} className="mt-4 flex gap-2 items-center">
          <span
            style={{ backgroundColor: `${legend.color}` }}
            className={`h-2.5 w-2.5 rounded-full`}
          ></span>
          <span className="text-sm font-normal capitalize">{legend.title}</span>
        </div>
      ))}
    </div>
  );
};

export default Legends;
