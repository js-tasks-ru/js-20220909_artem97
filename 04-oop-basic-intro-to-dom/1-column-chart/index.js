export default class ColumnChart {

  chartHeight = 50;

  constructor({data = [], label = '', value = 0, link = '', formatHeading = data => data} = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading(value);

    this.render();
  }

  getTemplate() {
    return `
    <div class="column-chart column-chart_loading" style="--chart-height: 50">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.getLink()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">USD ${this.value}</div>
        <div data-element="body" class="column-chart__chart">
            ${this.getColumnList()}
        </div>
      </div>
    </div>
    `
  }

  getLink() {
    return (this.link)
      ? `<a href="${this.link}" class="column-chart__link">View all</a>`
      : '';
  }

  getColumnList() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data.map(column => {
        return `<div style="--value: ${Math.floor(column * scale)}" data-tooltip="${(column / maxValue * 100).toFixed(0) + '%'}"></div>`;
      }
    ).join("");
  }

  render() {
    const divColumnChart = document.createElement('div');

    divColumnChart.innerHTML = this.getTemplate();
    this.element = divColumnChart.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
    }

    this.subElements = this.getSubElements()
  }

  getSubElements() {
    const result = {};
    const elements = document.querySelectorAll('[data-element]')

    for (let subElement of elements) {
      const name = subElement.dataset.element

      result[name] = subElement;
    }

    return result;
  }

  update() {

  }

  remove() {
    if (this.element) {
      this.element.remove()
    }
  }

  destroy() {
    this.remove();
  }
}
