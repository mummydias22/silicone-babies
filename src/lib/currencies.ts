export const CURRENCIES: [code: string, name: string][] = [
  ["USD", "US Dollar"], ["EUR", "Euro"], ["GBP", "British Pound"], ["CAD", "Canadian Dollar"], ["AUD", "Australian Dollar"],
  ["NZD", "New Zealand Dollar"], ["CHF", "Swiss Franc"], ["SEK", "Swedish Krona"], ["NOK", "Norwegian Krone"], ["DKK", "Danish Krone"],
  ["PLN", "Polish Zloty"], ["TRY", "Turkish Lira"], ["AED", "UAE Dirham"], ["SAR", "Saudi Riyal"], ["INR", "Indian Rupee"],
  ["CNY", "Chinese Yuan"], ["JPY", "Japanese Yen"], ["KRW", "South Korean Won"], ["HKD", "Hong Kong Dollar"], ["SGD", "Singapore Dollar"],
  ["PHP", "Philippine Peso"], ["IDR", "Indonesian Rupiah"], ["BRL", "Brazilian Real"], ["MXN", "Mexican Peso"],
  ["NGN", "Nigerian Naira"], ["GHS", "Ghanaian Cedi"], ["KES", "Kenyan Shilling"], ["UGX", "Ugandan Shilling"], ["TZS", "Tanzanian Shilling"],
  ["ZAR", "South African Rand"], ["EGP", "Egyptian Pound"], ["MAD", "Moroccan Dirham"],
  ["XAF", "Central African CFA Franc"], ["XOF", "West African CFA Franc"],
];
export const isCurrency = (c: string) => CURRENCIES.some(([code]) => code === c);
