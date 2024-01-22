import { Spinner } from "next-ts-lib";

const ReportLoader = () => {
  return (
    <div className="h-screen w-full flex justify-center my-[20%]">
      <Spinner size="30px" />
    </div>
  );
};

export default ReportLoader;
