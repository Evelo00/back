const BOGOTA_OFFSET_HOURS = 5;

const bogotaToUTC = (date: Date) =>
  new Date(date.getTime() + BOGOTA_OFFSET_HOURS * 60 * 60 * 1000);

const utcToBogota = (date: Date) =>
  new Date(date.getTime() - BOGOTA_OFFSET_HOURS * 60 * 60 * 1000);

export { bogotaToUTC, utcToBogota };
