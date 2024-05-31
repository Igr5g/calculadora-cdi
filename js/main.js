const startInvestmentElmt = document.getElementById('startInvestment');
const monthlyInvestmentElmt = document.getElementById('monthlyInvestment');
const percentCDIElmt = document.getElementById('percentCDI');
const durationElmt = document.getElementById('duration');
const durationOptsElmt = document.getElementById('durationOptions');
const DIFeeElmt = document.getElementById('diFee');

const dialogElmt = document.querySelector('dialog');
const dialogContentElmt = dialogElmt.querySelector('dialog .modal-content');

startInvestmentElmt.addEventListener('keydown', formatInputToCurrency);
monthlyInvestmentElmt.addEventListener('keydown', formatInputToCurrency);
percentCDIElmt.addEventListener('keydown', formatInputToPercentage);
DIFeeElmt.addEventListener('keydown', formatInputToPercentage);

dialogElmt.querySelector('button').addEventListener('click', () => {
  dialogElmt.close();
});

document.getElementById('calculate').addEventListener('click', () => {
  const startInvestment = toFloat(startInvestmentElmt.value);
  const monthlyInvestment = toFloat(monthlyInvestmentElmt.value);
  const percentCDI = toFloat(percentCDIElmt.value);
  const DIFee = toFloat(DIFeeElmt.value);
  const duration = parseInt(durationElmt.value || 1);
  const durationType = durationOptsElmt.options[durationOptsElmt.selectedIndex].value;

  const months = durationType == 'year' ? duration * 12 : duration;
  const DIFeeYearly = DIFee / 100;
  const CDIFeeYearly = (percentCDI / 100) * DIFeeYearly;
  const CDIFeeMonthly = Math.pow(1 + CDIFeeYearly, 1 / 12);

  let grossTotal = startInvestment;

  for (let i = 0; i < months; i++) {
    grossTotal *= CDIFeeMonthly;
    grossTotal += monthlyInvestment;
  }

  const totalInvested = startInvestment + months * monthlyInvestment;
  const aliquot = calcIRAliquot(months * 30);
  const grossProfit = grossTotal - totalInvested;
  const incomeTax = grossProfit * aliquot;
  const netProfit = grossProfit - incomeTax;
  const netTotal = totalInvested + netProfit;

  dialogContentElmt.innerHTML = `
    <h3>Resultados</h3>
    <p>Duração: <span class="result">${duration} ${
      durationType == "month" ? (duration == 1 ? "Mês" : "Meses") : (duration == 1 ? "Ano" : "Anos")
    }</span></p>
    <p>Investimento Inicial: <span class="result">${formatCurrency(startInvestment)}</span></p>
    ${
      startInvestment == totalInvested
        ? ``
        : `<p>Total Investido: <span class="result">${formatCurrency(totalInvested)}</span></p>`
    }
    <p>Imposto de Renda: <span class="result tax">${formatCurrency(incomeTax)} (${aliquot * 100}%)</span></p>
    <br>
    <p>Lucro Bruto: <span class="result">${formatCurrency(grossProfit)}</span></p>
    <p>Lucro Líquido: <span class="result netProf">${formatCurrency(netProfit)}</span></p>
    <br>
    <p>Total Bruto: <span class="result">${formatCurrency(grossTotal)}</span></p>
    <p>Total Líquido: <span class="result netProf">${formatCurrency(netTotal)}</span></p>
  `;

  dialogElmt.showModal();
});

// fetch('https://www2.cetip.com.br/ConsultarTaxaDi/ConsultarTaxaDICetip.aspx')
//   .then((res) => {
//     if (!res.ok) throw new Error('Erro ao acessar a API: ' + res.statusText);

//     return res.json();
//   })
//   .catch((error) => {
//     console.error(error);
//   })
//   .then((data) => {
//     DIFeeElmt.value = (data.taxa + "%") || "10,40%"
//   });