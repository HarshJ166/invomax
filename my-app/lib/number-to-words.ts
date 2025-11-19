const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
];

const teens = [
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

const convertHundreds = (num: number): string => {
  let result = "";
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }
  if (num >= 20) {
    result += tens[Math.floor(num / 10)] + " ";
    num %= 10;
  } else if (num >= 10) {
    result += teens[num - 10] + " ";
    return result;
  }
  if (num > 0) {
    result += ones[num] + " ";
  }
  return result;
};

export const numberToWords = (num: number): string => {
  if (num === 0) return "Zero";
  if (num < 0) return "Minus " + numberToWords(-num);

  let result = "";
  const numStr = num.toFixed(2);
  const parts = numStr.split(".");
  const integerPart = parseInt(parts[0], 10);
  const decimalPart = parts[1] ? parseInt(parts[1], 10) : 0;

  if (integerPart >= 10000000) {
    const crores = Math.floor(integerPart / 10000000);
    result += convertHundreds(crores) + "Crore ";
    const remainder = integerPart % 10000000;
    if (remainder > 0) {
      result += numberToWords(remainder).replace("Zero ", "");
    }
  } else if (integerPart >= 100000) {
    const lakhs = Math.floor(integerPart / 100000);
    result += convertHundreds(lakhs) + "Lakh ";
    const remainder = integerPart % 100000;
    if (remainder > 0) {
      result += numberToWords(remainder).replace("Zero ", "");
    }
  } else if (integerPart >= 1000) {
    const thousands = Math.floor(integerPart / 1000);
    result += convertHundreds(thousands) + "Thousand ";
    const remainder = integerPart % 1000;
    if (remainder > 0) {
      result += numberToWords(remainder).replace("Zero ", "");
    }
  } else {
    result += convertHundreds(integerPart);
  }

  result = result.trim();
  if (result === "") result = "Zero";

  if (decimalPart > 0) {
    result += " and " + convertHundreds(decimalPart).trim() + " Paise";
  }

  return result + " Only";
};

