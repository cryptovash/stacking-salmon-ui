function formatSmallNumber(n: number, significant = 6) {
    const decimals = -Math.floor(Math.log10(n));
    return '0.' + '0'.repeat(decimals - 1) + (n * Math.pow(10, decimals)).toString().replace('.', '').substring(0, significant);
  }
  
  /*
   * Return the number floored to a certain amount of significant digits
   */
  export function formatFloat(n: number, significant = 6) : string {
    if (n === Infinity) return 'Infinity'; // return "∞";
    if (!n) return '0';
    if (n * 1.000001 >= 10 ** (significant - 1)) return Math.floor(n).toString();
    if (n < 1e-6) return formatSmallNumber(n, significant);
    const rounded = parseFloat(n.toPrecision(significant));
    if (rounded <= n) return rounded.toString();
    const decimals = rounded.toPrecision(significant).split('.')[1].length;
    const floored = rounded - 10 ** (-decimals);
    return parseFloat(floored.toPrecision(significant)).toString();
  }
  
  export function formatToDecimals(n: number, decimals = 2) : string {
    if (n === Infinity) return 'Infinity'; // return "∞";
    return (Math.round(n * (10 ** decimals)) / (10 ** decimals)).toFixed(decimals);
  }
  
  export function formatPercentage(n: number, decimals = 2, symbol = '%') : string {
    if (n === Infinity) return `∞${symbol}`;
    if (n > 0 && n < 0.00001) {
      return `<0.01${symbol}`;
    }
    return `${formatToDecimals(n * 100, decimals)}${symbol}`;
  }
  
  export function formatPercentageShort(n: number, symbol = '%') : string {
    if (n === Infinity) return `∞${symbol}`;
    if (n > 0 && n < 0.00001) {
      return `<0.01${symbol}`;
    }
    let negative = '';
    if (n < 0) {
      negative = '-';
    }
    n = Math.abs(n);
    if (Math.abs(Math.round((n * 100) * (10 ** 2))) === 10000) {
      return `${negative}100${symbol}`;
    }
    if (Math.abs(n) > 0 && Math.abs(n) < 1) {
      return negative + formatPercentage(n, 2, symbol);
    }
    if (Math.abs(n) > 0 && Math.abs(n) < 10) {
      return negative + formatPercentage(n, 0, symbol);
    }
    if (Math.abs(n) > 0 && Math.abs(n) < 100) {
      const pct = formatPercentage(n, 0, symbol);
      return negative + pct.slice(0, 1) + ',' + pct.slice(1);
    }
    if (Math.abs(n) > 0 && Math.abs(n) < 1000) {
      const pct = formatPercentage(n, 0, symbol);
      return negative + pct.slice(0, 2) + ',' + pct.slice(2);
    }
    if (negative === '-') {
      n = 0 - n;
    }
    const pctShort = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(parseFloat((Math.round((n * 100) * (10 ** 2)) / (10 ** 2)).toFixed(2)));
    return `${pctShort}${symbol}`;
  }
  
  // TODO: could use https://formatjs.io/docs/react-intl/
  export function formatAmount(n: number, symbol = '') : string {
    if (!n || n === Infinity) return `${symbol}0`;
    if (n < 1000) return `${symbol}${formatToDecimals(n, 2)}`;
    n = Math.round(n);
    let result = '';
    while (n >= 1000) {
      const lastThreeCypher = (1000 + n % 1000).toString().substr(1, 4);
      result = ',' + lastThreeCypher + result;
      n = Math.floor(n / 1000);
    }
    return `${symbol}${n.toString() + result}`;
  }
  
  export function formatAmountShort(n: number, symbol = '') : string {
    if (!n || n === Infinity) return `${symbol}0`;
    if (n > 0 && n < .01) {
      return `<${symbol}0.01`;
    }
    if (n < 1000) return `${symbol}${formatToDecimals(n, 2)}`;
    return `${symbol}${new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(n)}`;
  }
  
  export function formatUSD(n: number) : string {
    if (n > 0 && n < .01) {
      return '<$0.01';
    }
    return formatAmount(n, '$');
  }
  
  export function formatUSDShort(n: number) : string {
    if (n > 0 && n < .01) {
      return '<$0.01';
    }
    return formatAmountShort(n, '$');
  }
  
  export function formatLeverage(n: number) : string {
    if (n === Infinity) return '∞';
    return formatToDecimals(n, 2) + 'x';
  }
  