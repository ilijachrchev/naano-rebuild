import type { CollaborationMoney } from "@/lib/collaborations/data";

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

const currencyFormatters = new Map<string, Intl.NumberFormat>();

export function formatCollaborationMoney(money: CollaborationMoney | null) {
  if (!money) return "Not set";

  let formatter = currencyFormatters.get(money.currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en", {
      style: "currency",
      currency: money.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    currencyFormatters.set(money.currency, formatter);
  }

  return formatter.format(money.cents / 100);
}

export function formatCollaborationDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "Not scheduled";
}

export function formatCollaborationDateTime(value: string | null) {
  return value ? dateTimeFormatter.format(new Date(value)) : "Date unavailable";
}
