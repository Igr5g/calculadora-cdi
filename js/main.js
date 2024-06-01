const startInvestmentElmt = document.getElementById('startInvestment');
const monthlyInvestmentElmt = document.getElementById('monthlyInvestment');
const percentCdiElmt = document.getElementById('percentCDI');
const durationElmt = document.getElementById('duration');
const durationOptsElmt = document.getElementById('durationOptions');
const diFeeElmt = document.getElementById('diFee');

const dialogElmt = document.querySelector('dialog');
const dialogContentElmt = dialogElmt.querySelector('dialog .modal-content');

startInvestmentElmt.addEventListener('keydown', formatInputToCurrency);
monthlyInvestmentElmt.addEventListener('keydown', formatInputToCurrency);
percentCdiElmt.addEventListener('keydown', formatInputToPercentage);
diFeeElmt.addEventListener('keydown', formatInputToPercentage);

dialogElmt.querySelector('button').addEventListener('click', () => {
  dialogElmt.close();
});

document.getElementById('calculate').addEventListener('click', () => {
  const startInvestment = toFloat(startInvestmentElmt.value);
  const monthlyInvestment = toFloat(monthlyInvestmentElmt.value);
  const percentCdi = toFloat(percentCdiElmt.value);
  const diFee = toFloat(diFeeElmt.value);
  const duration = parseInt(durationElmt.value || 1);
  const durationType = durationOptsElmt.options[durationOptsElmt.selectedIndex].value;

  const months = durationType == 'year' ? duration * 12 : duration;
  const diFeeYearly = diFee / 100;
  const cdiFeeYearly = (percentCdi / 100) * diFeeYearly;
  const cdiFeeMonthly = Math.pow(1 + cdiFeeYearly, 1 / 12);

  let grossTotal = startInvestment;

  for (let i = 0; i < months; i++) {
    grossTotal *= cdiFeeMonthly;
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
    durationType == 'month' ? (duration == 1 ? 'Mês' : 'Meses') : duration == 1 ? 'Ano' : 'Anos'
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

document.getElementById('update-di').addEventListener('click', () => {
  fetch('https://www2.cetip.com.br/ConsultarTaxaDi/ConsultarTaxaDICetip.aspx')
    .then((res) => {
      if (!res.ok) throw new Error('Erro ao acessar a API: ' + res.statusText);

      return res.json();
    })
    .catch((error) => {
      console.error(error);
    })
    .then((data) => {
      diFeeElmt.value = data.taxa + '%' || '10,40%';

      dialogContentElmt.innerHTML = `
        <h3>Atualizado!</h3>
        <p>Taxa atual: <span class="result">${data.taxa}%</span></p>
        <p>Atualizado em: <span class="result">${data.dataTaxa}</span></p>
      `;

      dialogElmt.showModal();
    });
});
