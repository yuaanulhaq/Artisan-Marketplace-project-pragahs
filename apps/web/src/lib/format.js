export const formatCurrency = (amount, language) =>
  new Intl.NumberFormat(language, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount || 0);

export const formatDate = (date, language) =>
  new Intl.DateTimeFormat(language, {
    dateStyle: "medium"
  }).format(new Date(date));

