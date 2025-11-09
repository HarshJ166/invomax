export function numberToWords(num: number): string {
  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function convertHundreds(n: number): string {
    let result = '';
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      result += ones[n] + ' ';
    }
    return result.trim();
  }

  if (num === 0) return 'Zero';

  const parts: string[] = [];
  const crores = Math.floor(num / 10000000);
  const lakhs = Math.floor((num % 10000000) / 100000);
  const thousands = Math.floor((num % 100000) / 1000);
  const hundreds = Math.floor((num % 1000) / 100);
  const remainder = num % 100;

  if (crores > 0) {
    parts.push(convertHundreds(crores) + ' Crore');
  }
  if (lakhs > 0) {
    parts.push(convertHundreds(lakhs) + ' Lakh');
  }
  if (thousands > 0) {
    parts.push(convertHundreds(thousands) + ' Thousand');
  }
  if (hundreds > 0) {
    parts.push(convertHundreds(hundreds) + ' Hundred');
  }
  if (remainder > 0) {
    parts.push(convertHundreds(remainder));
  }

  return parts.join(' ').trim() || 'Zero';
}

export function formatAmountInWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let result = 'INR ' + numberToWords(rupees);
  if (paise > 0) {
    result += ' and ' + numberToWords(paise) + ' Paise';
  }
  result += ' Only';

  return result;
}


