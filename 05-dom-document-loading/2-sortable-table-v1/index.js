export default class SortableTable {

  fieldValue;
  orderValue;
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
  }

  getTemplate() {

    return `
        <div class="sortable-table">

        <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.getHeaderList()}
        </div>

        <div data-element="body" class="sortable-table__body">
            ${this.getBodyList()}
        </div>
        </div>
    `
  }

  getHeaderList() {
    return this.headerConfig.map(column => {
        return `
          <div class="sortable-table__cell" data-id="${column['id']}" data-sortable="${column['sortable']}">
            <span>${column['title']}</span>
          </div>
          `
      }
    ).join("");

  }

  getBodyList() {
    return this.sortData(this.data, this.orderValue).map(item => {
        return `
            <a href="#" class="sortable-table__row">
              ${this.getTableRow(item)}
            </a>
            `;
      }
    ).join("");
  }

  sortData(data, direction) {
    const arr = [...data]
    const directions = {
      asc: 1,
      desc: -1
    }
    this.comp = function (a, b) {
      if ((typeof (a[this.fieldValue]) === "string")) {
        return a[this.fieldValue].localeCompare(b[this.fieldValue], ['ru', 'en'], {
          sensitivity: 'variant',
          caseFirst: 'upper'
        }) * directions[direction];
      }
      if ((typeof (a[this.fieldValue]) === "number")) {
        return (a[this.fieldValue] - b[this.fieldValue]) * directions[direction];
      }
    }

    return arr
      .sort((a, b) => {
        return this.comp(a, b)
      })
  }

  getTableRow(item) {
    const cells = this.headerConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`
    }).join("");
  }

  sort(fieldValue = this.fieldValue, orderValue = this.orderValue) {
    this.fieldValue = fieldValue;
    this.orderValue = orderValue;

    this.destroy();
    this.render();
  }

  render() {

    const table = document.createElement('div');

    table.innerHTML = this.getTemplate();
    const element = table.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]')

    for (const subElement of elements) {
      const name = subElement.dataset.element
      result[name] = subElement;
    }
    return result;
  }


  remove() {
    if (this.element) {
      this.element.remove()
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}

