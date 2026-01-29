
export const formatNumber = (num: number): string => {
  if (num < 1000) return Math.floor(num).toString();
  
  const suffixes = [
    { value: 1e39, symbol: " Du" },
    { value: 1e36, symbol: " U" },
    { value: 1e33, symbol: " D" },
    { value: 1e30, symbol: " N" },
    { value: 1e27, symbol: " O" },
    { value: 1e24, symbol: " Sp" },
    { value: 1e21, symbol: " Sx" },
    { value: 1e18, symbol: " Qi" },
    { value: 1e15, symbol: " Qa" },
    { value: 1e12, symbol: " T" },
    { value: 1e9, symbol: " B" },
    { value: 1e6, symbol: " M" },
    { value: 1e3, symbol: " k" }
  ];

  for (const suffix of suffixes) {
    if (num >= suffix.value) {
      return (num / suffix.value).toFixed(2) + suffix.symbol;
    }
  }
  
  return num.toFixed(2);
};

export const getUpgradePrice = (basePrice: number, owned: number): number => {
  return Math.floor(basePrice * Math.pow(1.15, owned));
};
