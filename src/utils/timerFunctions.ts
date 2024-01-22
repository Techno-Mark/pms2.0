const toHoursAndMinutes = (totalSeconds: number) => {
  const totalMinutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours.toString().length === 1 ? `0${hours}` : hours}:${
    minutes.toString().length === 1 ? `0${minutes}` : minutes
  }:${seconds.toString().length === 1 ? `0${seconds}` : seconds}`;
};

const toSeconds = (time: string) => {
  if (/\d+:\d+:\d+/.test(time)) {
    const hours = parseInt(time.split(":")[0]) * 60 * 60;
    const minutes = parseInt(time.split(":")[1]) * 60;
    const seconds = parseInt(time.split(":")[2]);
    return hours + minutes + seconds;
  } else console.error("Please provide the time in hh:mm:ss format!");
};

const getDates = (startDate?: any, endDate?: any) => {
  let array = [];
  let date = new Date();

  let startParts = startDate ? startDate.split("-") : null;
  let endParts = endDate ? endDate.split("-") : null;

  let startDay = startParts
    ? parseInt(startParts[2])
    : new Date(date.getFullYear(), date.getMonth(), 1).getDate();
  let startMonth = startParts ? parseInt(startParts[1]) - 1 : date.getMonth();
  let startYear = startParts ? parseInt(startParts[0]) : date.getFullYear();

  let endDay = endParts ? parseInt(endParts[2]) : date.getDate();
  let endMonth = endParts ? parseInt(endParts[1]) - 1 : date.getMonth();
  let endYear = endParts ? parseInt(endParts[0]) : date.getFullYear();

  let current = new Date(startYear, startMonth, startDay);

  while (current <= new Date(endYear, endMonth, endDay)) {
    let d =
      current.getFullYear() +
      "-" +
      ((current.getMonth() + 1).toString().length > 1
        ? current.getMonth() + 1
        : "0" + (current.getMonth() + 1)) +
      "-" +
      (current.getDate().toString().length > 1
        ? current.getDate()
        : "0" + current.getDate());
    array.push(d);
    current.setDate(current.getDate() + 1);
  }

  return array;
};

const getFormattedDate = (newValue: any) => {
  if (newValue !== "") {
    const dateObject = new Date(newValue);
    const year = dateObject.getFullYear();
    const month = dateObject.getMonth() + 1;
    const day = dateObject.getDate();
    const date = day.toString().length > 1 ? day : `0${day}`;
    const formattedDate = year + "-" + month + "-" + date;

    return formattedDate;
  }
};

export { toHoursAndMinutes, toSeconds, getDates, getFormattedDate };
