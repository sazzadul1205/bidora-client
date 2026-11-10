// Global date formatter: DD-Mon-YYYY 12 HR Format time

export const formatDateTime = (dateString) => {
  if (!dateString) {return "-";}

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {return dateString;}

  const day = date.getDate().toString().padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;
  const hoursStr = hours.toString().padStart(2, "0");

  return day + "-" + month + "-" + year + " " + hoursStr + ":" + minutes + " " + ampm;
};

export const formatDate = (dateString) => {
  if (!dateString) {return "-";}

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {return dateString;}

  const day = date.getDate().toString().padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return day + "-" + month + "-" + year;
};

export const formatTime = (dateString) => {
  if (!dateString) {return "-";}

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {return dateString;}

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;
  const hoursStr = hours.toString().padStart(2, "0");

  return hoursStr + ":" + minutes + " " + ampm;
};

export default { formatDateTime, formatDate, formatTime };