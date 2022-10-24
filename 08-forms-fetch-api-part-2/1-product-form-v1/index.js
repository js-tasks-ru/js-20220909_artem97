import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';
const CATEGORY_URL = 'api/rest/categories'
const ITEM_URL = 'api/rest/products'

export default class ProductForm {

  constructor(productId = '') {
    this.categoryUrl = new URL(CATEGORY_URL, BACKEND_URL)
    this.itemUrl = new URL(ITEM_URL, BACKEND_URL)

    this.productId = productId;
    //this.render();
  }

  async render() {
    const form = document.createElement('div');

    form.innerHTML = await this.getTemplate();
    const element = form.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-field]')

    for (const subElement of elements) {
      const name = subElement.dataset.field
      result[name] = subElement;
    }
    return result;
  }

  async getTemplate() {
    if (this.productId) {
      this.item = await this.loadItem();
    }
    return `
    <div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left" data-field="nameItem">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" class="form-control" placeholder="Название товара" value="${(this.item) ? escapeHtml(this.item['title']) : ''}">
        </fieldset>
      </div>
      <div class="form-group form-group__wide" data-field="description">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара" >${(this.item) ? escapeHtml(this.item['description']) : ''}</textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container" data-field="images">
        <label class="form-label">Фото</label>
        ${(this.item) ? this.getImagesContainer(this.item['images']) : ''}
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left" data-field="category">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory">
          ${await this.getCategoryList()}
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col" data-field="cost">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" class="form-control" placeholder="100" value="${(this.item) ? this.item['price'] : ''}">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" class="form-control" placeholder="0" value="${(this.item) ? this.item['discount'] : ''}">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half" data-field="quantity">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="1" value="${(this.item) ? this.item['quantity'] : ''}">
      </div>
      <div class="form-group form-group__part-half" data-field="status">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status">
          <option value="1" ${(this.item) ? (this.item['status'] === 1) ? 'selected' : '' : ''}>Активен</option>
          <option value="0" ${(this.item) ? (this.item['status'] === 0) ? 'selected' : '' : ''}>Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline" data-buttonType="${(this.item) ? 'save' : 'update'}">
          ${(this.item) ? 'Сохранить товар' : 'Добавить товар'}
        </button>
      </div>
    </form>
  </div>
  `
  }

  getImagesContainer(item) {
    return `
    <div data-elem="imageListContainer">
        <ul class="sortable-list">
        ${this.getImagesList(item, item.length)}
        </ul>
    </div>`
  }

  async loadItem() {
    this.itemUrl.searchParams.set('id', this.productId);

    try {
      return (await fetchJson(this.itemUrl))[0];
    } catch (error) {
      console.log('error fetch loadItem - ' + error.message);
    }
  }

  async loadCategory() {
    this.categoryUrl.searchParams.set('_sort', 'weight');
    this.categoryUrl.searchParams.set('_refs', 'subcategory');

    try {
      return await fetchJson(this.categoryUrl);
    } catch (error) {
      console.log('error fetch loadCategory - ' + error.message);
    }
  }

  getImagesList(images, length) {
    if (images[length - 1]) {
      return `${this.getImagesList(images, length - 1)}
        <li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${images[length - 1]['url']}">
          <input type="hidden" name="source" value="${images[length - 1]['source']}">
          <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${images[length - 1]['url']}">
        <span>${images[length - 1]['source']}</span>
      </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button></li>`;
    } else {
      return '';
    }
  }

  async getCategoryList() {
    const result = await this.loadCategory();
    return await this.getTemplateCategory(result, result.length, result[result.length - 1]['subcategories'].length);
  }

  getTemplateCategory(data, categoryLength, subcategoryLength) {
    if (categoryLength !== 0 && subcategoryLength !== 0) {
      return `${this.getTemplateCategory(data, categoryLength, subcategoryLength - 1)}
        <option ${(this.item) ? (this.item['subcategory'] === data[categoryLength - 1]['subcategories'][subcategoryLength - 1]['id']) ? 'selected' : '' : ''} value="${data[categoryLength - 1]['subcategories'][subcategoryLength - 1]['category']}">${data[categoryLength - 1]['title']} &gt; ${data[categoryLength - 1]['subcategories'][subcategoryLength - 1]['title']}</option>`
    } else if (categoryLength !== 0) {
      return this.getTemplateCategory(data, categoryLength - 1, data[categoryLength - 1]['subcategories'].length)
    } else {
      return '';
    }
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
