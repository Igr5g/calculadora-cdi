function calcIRAliquot(days) {
  if (days < 0) return 0;
  if (days >= 0 && days <= 180) return 0.225;
  if (days >= 181 && days <= 360) return 0.2;
  if (days >= 361 && days <= 720) return 0.175;
  return 0.15;
}

function toFloat(inputString) {
  return parseFloat(inputString.replace(/[^\d,]/g, '').replace(/,/g, '.'));
}

function formatCurrency(number, currencyPrefix = 'R$ ', currencyLocale = 'pt-BR') {
  return (
    currencyPrefix +
    Number(number).toLocaleString(currencyLocale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

const formatInputToPercentage = (e) => {
  formatInputToDecimalNumber(e, (formatted) => formatted + '%');
};

const formatInputToCurrency = (e) => {
  formatInputToDecimalNumber(e, (formatted) => formatCurrency(toFloat(formatted)));
};

const formatInputToDecimalNumber = (e, formatation) => {
  e.preventDefault();

  if (!e.key.match(/[0-9]|Backspace/)) {
    return;
  }

  let typedValue =
    e.key === 'Backspace' ? e.target.value.replace(/\D/g, '').slice(0, -1) : e.target.value.replace(/\D/g, '') + e.key;

  let formatted = typedValue
    .replace(/^0+/, '')
    .padStart(3, '0')
    .replace(/(\d\d)$/, ',$1');

  e.target.value = formatation(formatted);
};
