"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utcToBogota = exports.bogotaToUTC = void 0;
const BOGOTA_OFFSET_HOURS = 5;
const bogotaToUTC = (date) => new Date(date.getTime() + BOGOTA_OFFSET_HOURS * 60 * 60 * 1000);
exports.bogotaToUTC = bogotaToUTC;
const utcToBogota = (date) => new Date(date.getTime() - BOGOTA_OFFSET_HOURS * 60 * 60 * 1000);
exports.utcToBogota = utcToBogota;
