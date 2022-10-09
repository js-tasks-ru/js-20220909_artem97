export default class SortableTable {

  fieldValue;
  orderValue;
  subElements = {};
  isSortLocally = true;

  constructor(headerConfig = [], {data, sorted} = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.fieldValue = sorted.id;
    this.orderValue = sorted.order;

    this.render();
    this.createListener();
  }

  createListener() {

    this.element.querySelectorAll('.sortable-table__header .sortable-table__cell').forEach(column => {
      if (column.getAttribute('data-sortable') === 'true') {
        column.addEventListener('click', () => {
          this.callBackForListener(this.renderSort(), column)
        })
      }
    })


  }

  callBackForListener(orderElem, column) {
    if (column.getAttribute('data-order')) {
      const order = column.dataset.order = (column.getAttribute('data-order') === 'asc')
        ? 'desc'
        : 'asc'
      this.sortOnClient(column.getAttribute('data-id'), order);
    } else {
      this.element.querySelectorAll('.sortable-table__header .sortable-table__cell').forEach(item => {
        item.removeAttribute('data-order')
        if (item.querySelector('.sortable-table__sort-arrow')) {
          item.querySelector('.sortable-table__sort-arrow').remove();
        }
      })
      column.dataset.order = 'asc'
      column.append(orderElem)
      this.sortOnClient(column.getAttribute('data-id'), 'asc');
    }
  }

  getTemplate() {

    return `
        <div class="sortable-table">

        <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.getHeaderList()}
        </div>


            ${this.getBodyList()}
        </div>

    `
  }

  getHeaderList() {
    return this.headerConfig.map(column => {
        if (this.fieldValue === column['id']) {
          return `
          <div class="sortable-table__cell" data-id="${column['id']}" data-sortable="${column['sortable']}" data-order="${this.orderValue}">
            <span>${column['title']}</span>
            <span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
            </span>
          </div>
          `
        } else {
          return `
          <div class="sortable-table__cell" data-id="${column['id']}" data-sortable="${column['sortable']}">
            <span>${column['title']}</span>
          </div>
          `
        }
      }
    ).join("");

  }

  getBodyList() {
    return `
        <div data-element="body" class="sortable-table__body">
                ${this.sortData(this.data).map(item => {
        return `
                    <a href="#" class="sortable-table__row">
                      ${this.getTableRow(item)}
                    </a>
                    `;
      }
    ).join("")}
        </div>`
  }

  sortData(data = []) {
    const arr = [...data];
    const directions = {
      asc: 1,
      desc: -1
    };

    const comp = (a, b) => {
      switch (typeof (a[this.fieldValue])) {
        case "string" :
          return a[this.fieldValue].localeCompare(b[this.fieldValue], ['ru', 'en'], {
            sensitivity: 'variant',
            caseFirst: 'upper'
          }) * directions[this.orderValue];

        case "number" :
          return (a[this.fieldValue] - b[this.fieldValue]) * directions[this.orderValue];
      }
    }

    return arr
      .sort((a, b) => {
        return comp(a, b)
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


  sort () {
    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      //this.sortOnServer();
    }
  }

  sortOnClient(fieldValue = this.fieldValue, orderValue = this.orderValue) {
    this.fieldValue = fieldValue;
    this.orderValue = orderValue;

    this.sortData(this.data);

    this.subElements.body.innerHTML = this.getBodyList();
  }

  render() {

    const table = document.createElement('div');

    table.innerHTML = this.getTemplate();
    const element = table.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

  }

  renderSort() {
    const order = document.createElement('div');

    order.innerHTML = `
                    <span data-element="arrow" class="sortable-table__sort-arrow">
                        <span class="sort-arrow"></span>
                    </span>
      `
    return order.firstElementChild;
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

