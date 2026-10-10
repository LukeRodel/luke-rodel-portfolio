'use strict';
(() => {
  const weeks = ['2026-06-01', '2026-06-08', '2026-06-15', '2026-06-22', '2026-06-29', '2026-07-06'];
  const series = [
    { supplier: 'Supplier A', component: 'Bracket', unitCost: 18, quantities: [9, 6, 8, 5, 4, 3] },
    { supplier: 'Supplier B', component: 'Housing', unitCost: 42, quantities: [4, 5, 3, 4, 2, 2] },
    { supplier: 'Supplier C', component: 'Seal', unitCost: 6, quantities: [15, 12, 10, 9, 8, 6] }
  ];
  const records = weeks.flatMap((week, index) => series.map(item => ({
    week, supplier: item.supplier, component: item.component,
    quantity: item.quantities[index], unitCost: item.unitCost,
    cost: item.quantities[index] * item.unitCost
  })));
  const money = amount => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0}).format(amount);
  const dateLabel = date => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {month: 'short', day: 'numeric', timeZone: 'UTC'});
  const get = id => document.getElementById(id);
  function render() {
    const supplier = get('supplier').value;
    const selected = records.filter(item => supplier === 'all' || item.supplier === supplier);
    const total = selected.reduce((sum, item) => sum + item.cost, 0);
    const units = selected.reduce((sum, item) => sum + item.quantity, 0);
    const components = series.map(item => ({ name: item.component, cost: selected.filter(row => row.component === item.component).reduce((sum, row) => sum + row.cost, 0) })).sort((a, b) => b.cost - a.cost);
    const leader = components[0];
    const share = Math.round(leader.cost / total * 100);
    get('total-cost').textContent = money(total);
    get('total-units').textContent = units;
    get('top-component').textContent = leader.name;
    get('top-cost').textContent = `${money(leader.cost)} · ${share}% of selected cost`;
    get('interpretation').textContent = `${leader.name} accounts for ${share}% of selected scrap cost. This identifies a place to investigate; it does not establish a root cause.`;
    const bars = get('component-chart');
    bars.replaceChildren();
    bars.setAttribute('role', 'img');
    bars.setAttribute('aria-label', `Fictional scrap cost by component: ${components.map(item => `${item.name} ${money(item.cost)}`).join(', ')}.`);
    components.forEach(item => {
      const row = document.createElement('div'); row.className = 'bar-row'; row.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span'); label.textContent = item.name;
      const track = document.createElement('div'); track.className = 'bar-track';
      const fill = document.createElement('div'); fill.className = 'bar-fill'; fill.style.width = `${item.cost / leader.cost * 100}%`; track.append(fill);
      const value = document.createElement('span'); value.className = 'bar-cost'; value.textContent = money(item.cost);
      row.append(label, track, value); bars.append(row);
    });
    const weekly = weeks.map(week => selected.filter(item => item.week === week).reduce((sum, item) => sum + item.cost, 0));
    const maximum = Math.ceil(Math.max(...weekly) / 50) * 50;
    const width = 440, height = 133, left = 34, right = 18, top = 17, bottom = 27;
    const plotWidth = width - left - right, plotHeight = height - top - bottom;
    const coordinates = weekly.map((value, i) => [left + plotWidth * i / 5, top + plotHeight * (1 - value / maximum)]);
    const points = coordinates.map(point => point.join(',')).join(' ');
    const grid = [0, maximum / 2, maximum].map(value => { const y = top + plotHeight * (1 - value / maximum); return `<line class="grid" x1="${left}" x2="${width - right}" y1="${y}" y2="${y}"/><text x="${left - 6}" y="${y + 3}" text-anchor="end">${value}</text>`; }).join('');
    const dots = coordinates.map(([x,y], i) => `<circle class="point" cx="${x}" cy="${y}" r="3"><title>${dateLabel(weeks[i])}: ${money(weekly[i])}</title></circle>`).join('');
    const labels = weeks.map((week, i) => `<text x="${coordinates[i][0]}" y="${height - 7}" text-anchor="middle">${dateLabel(week)}</text>`).join('');
    // All SVG content comes from the fixed demonstration dataset, not user input.
    get('trend-chart').innerHTML = `<svg class="trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="trend-title"><title id="trend-title">Fictional weekly scrap cost: ${weeks.map((week, i) => `${dateLabel(week)} ${money(weekly[i])}`).join(', ')}.</title>${grid}<polygon class="area" points="${left},${top + plotHeight} ${points} ${width - right},${top + plotHeight}"/><polyline class="series" points="${points}"/>${dots}${labels}</svg>`;
    const tbody = get('record-table'); tbody.replaceChildren();
    selected.forEach(item => {
      const row = document.createElement('tr');
      [dateLabel(item.week), item.supplier, item.component, item.quantity, money(item.unitCost), money(item.cost)].forEach((value, index) => {
        const cell = document.createElement('td'); cell.textContent = value; if(index > 2) cell.className = 'number'; row.append(cell);
      }); tbody.append(row);
    });
  }
  get('supplier').addEventListener('change', render);
  render();
})();
