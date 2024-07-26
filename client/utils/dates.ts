import moment from "moment";

// 24h Format
export const twentyFourHourFormat = (date: string) => {
  return moment(date).format("HH:mm");
};

export const dayMonYear = (date: string) => {
  return moment(date).format("DD/MMM/YYYY");
};

export const formatDateBasedOnTime = (createdAt: string) => {
  const now = moment();
  const createdAtMoment = moment(createdAt);

  // Checken ob die Zeit und das angegebene Datum gleich sind
  if (now.isSame(createdAtMoment, "day")) {
    return "Heute um: " + twentyFourHourFormat(createdAt);
  }

  // Checken ob die Zeit und das gestrige Datum gleich sind
  if (now.isSame(createdAtMoment, "day")) {
    return "Gestern um: " + twentyFourHourFormat(createdAt);
  }

  return dayMonYear(createdAt);
};

export const formatDateLastSeen = (createdAt: string) => {
  const now = moment();
  const createdAtMoment = moment(createdAt);

  // Checken ob die Zeit und das angegebene Datum gleich sind
  if (now.isSame(createdAtMoment, "day")) {
    return "Zuletzt online um: " + twentyFourHourFormat(createdAt);
  }

  // Checken ob die Zeit und das gestrige Datum gleich sind
  if (now.isSame(createdAtMoment, "day")) {
    return "Zuletzt online gestern um: " + twentyFourHourFormat(createdAt);
  } 

  return "Zuletzt online: " + dayMonYear(createdAt);
};
