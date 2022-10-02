export default class SortableTable {

  fieldValue;
  orderValue;
  subElements;

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
    this.comp = function (a, b) {
      if ((typeof (a[this.fieldValue]) === "string")) {
        return a[this.fieldValue].localeCompare(b[this.fieldValue], ['ru', 'en'], {
          sensitivity: 'variant',
          caseFirst: 'upper'
        });
      }
      if ((typeof (a[this.fieldValue]) === "number")) {
        return a[this.fieldValue] - b[this.fieldValue];
      }
    }
    return this.data
      .sort((a, b) => {
        if (this.orderValue === 'asc') {
          return this.comp(a, b)
        }
        if (this.orderValue === 'desc') {
          return this.comp(b, a);
        }
      })
      .map(item => {
          return `
            <a href="#" class="sortable-table__row">
              <div class="sortable-table__cell">
                <img class="sortable-table-image" alt="Image" src="${item['id']}"></div>
              <div class="sortable-table__cell">${item['title']}</div>

              <div class="sortable-table__cell">${item['quantity']}</div>
              <div class="sortable-table__cell">${item['price']}</div>
              <div class="sortable-table__cell">${item['sales']}</div>
            </a>
            `;
        }
      ).join("");
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
    this.element = table.firstElementChild;

    document.addEventListener('DOMContentLoaded', () => {
      this.getSubElements();
    });
  }

  getSubElements() {
    const result = {};
    const elements = document.querySelectorAll('[data-element]')

    for (let subElement of elements) {
      const name = subElement.dataset.element
      result[name] = subElement;
    }
    this.subElements = result;
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

