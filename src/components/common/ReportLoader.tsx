import { Spinner } from "next-ts-lib";

const ReportLoader = () => {
  return (
    <div className="w-full flex items-center justify-center my-[20%]">
      <Spinner size="30px" />
    </div>
  );
};

export default ReportLoader;
