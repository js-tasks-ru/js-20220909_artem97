import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';
const CATEGORY_URL = 'api/rest/categories'
const ITEM_URL = 'api/rest/products'

export default class ProductForm {

  element;
  subElements;

  defaultFormData = {
    title: '',
    description: '',
    quantity: '',
    status: -1,
    images: [],
    price: 100,
    discount: ''
  };

  categoryUrl = new URL(CATEGORY_URL, BACKEND_URL);
  itemUrl = new URL(ITEM_URL, BACKEND_URL);

  constructor(productId = '') {
    this.controller = new AbortController()
    this.productId = productId;
  }

  onSubmit = event => {
    event.preventDefault();
    this.save();
  }

  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}/${ITEM_URL}`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      console.error('error - ' + error);
    }
  }

  getFormData() {
    const param = ['title', 'description', 'quantity', 'status', 'images', 'price', 'discount'];
    const {productForm, imageListContainer} = this.subElements;
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = param.filter(item => !excludedFields.includes(item));
    const getValue = field => productForm.querySelector(`[name=${field}]`).value;
    const values = {};

    for (const field of fields) {
      const value = getValue(field);

      values[field] = formatToNumber.includes(field)
        ? parseInt(value)
        : value;
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    values.images = [];
    values.id = this.productId;

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.parentElement.textContent
      });
    }

    return values;
  }

  dispatchEvent(id) {
    const event = this.productId
      ? new CustomEvent('product-update', {detail: id})
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  async render() {
    const categoriesPromise = this.loadCategory();

    const productPromise = this.productId
      ? this.loadItem(this.productId)
      : Promise.resolve(this.defaultFormData);

    const [categoriesData, productResponse] = await Promise.all([
      categoriesPromise, productPromise
    ]);

    if (this.productId) {
      const [productData] = productResponse;
      this.defaultFormData = productData;
    }
    this.categories = categoriesData;


    this.renderForm();

  }

  renderForm() {
    const form = document.createElement('div');

    form.innerHTML = this.getTemplate();
    const element = form.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
    this.initEventListeners();
  }

  getSubElements(element) {
    const result = {};

    const elements = element.querySelectorAll('[data-element]')
    for (const subElement of elements) {
      result[subElement.dataset.element] = subElement;
    }
    return result;
  }

  initEventListeners() {
    const {productForm, uploadImage, imageListContainer} = this.subElements;

    productForm.addEventListener('submit', this.onSubmit, {
      signal: this.controller.signal
    });
    uploadImage.addEventListener('click', () => this.changeImage(), {
      signal: this.controller.signal
    });
    imageListContainer.addEventListener('click', event => {
      if ('deleteHandle' in event.target.dataset) {
        event.target.closest('li').remove();
      }
    }, {
      signal: this.controller.signal
    });
  }

  changeImage() {
    const imagesList = this.element.querySelector('.sortable-list');
    const input = document.createElement('input');
    input.type = 'file';

    input.addEventListener('change', async () => {
      const [file] = input.files;
      console.log(file)
      const result = await this.loadImage(file);
      imagesList.append(this.getImageElement(result['data']['link'], result['data']['id']));
    }, {
      signal: this.controller.signal
    })

    input.click();
  }

  async loadImage(file) {
    const formData = new FormData();

    formData.append('image', file);

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
        },
        body: formData,
        referrer: ''
      });

      return await response.json();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  getTemplate() {
    return `
    <div class="product-form">

    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required=""
            type="text"
            name="title"
            class="form-control"
            placeholder="Название товара"
            value="${escapeHtml(this.defaultFormData['title'])}">
        </fieldset>
      </div>

      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required=""
            class="form-control"
            name="description"
            data-element="productDescription"
            placeholder="Описание товара">${escapeHtml(this.defaultFormData['description'])}</textarea>
      </div>

      <div class="form-group form-group__wide">
        <label class="form-label">Фото</label>
        ${this.getImagesContainer(this.defaultFormData['images'])}
        <input id="fileInput" type="file" style="visibility:hidden" accept="image/jpeg">
        <button type="button"
            name="uploadImage"
            class="button-primary-outline"
            data-element="uploadImage">
            <span>Загрузить</span>
        </button>
        </input>
      </div>

      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control"
            name="subcategory">
          ${this.getCategoryList()}
        </select>
      </div>

      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required=""
            type="number"
            name="price"
            class="form-control"
            placeholder="100"
            value="${this.defaultFormData['price']}">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required=""
            type="number"
            name="discount"
            class="form-control"
            placeholder="0"
            value="${this.defaultFormData['discount']}">
        </fieldset>
      </div>

      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required=""
            type="number"
            class="form-control"
            name="quantity"
            placeholder="1"
            value="${this.defaultFormData['quantity']}">
      </div>

      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status">
          <option value="1" ${(this.productId) ? (this.defaultFormData['status'] === 1) ? 'selected' : '' : ''}>Активен</option>
          <option value="0" ${(this.productId) ? (this.defaultFormData['status'] === 0) ? 'selected' : '' : ''}>Неактивен</option>
        </select>
      </div>

      <div class="form-buttons">
        <button id='formButton'
            type="submit"
            name="save"
            class="button-primary-outline"
            data-buttonType="${(this.productId) ? 'save' : 'update'}">
          ${(this.productId) ? 'Сохранить товар' : 'Добавить товар'}
        </button>
      </div>
    </form>
  </div>
  `
  }

  getImagesContainer(item) {
    return `
    <div data-element="imageListContainer">
        <ul class="sortable-list">
        ${this.getImagesList(item, item.length)}
        </ul>
    </div>`
  }

  async loadItem(productId = this.productId) {
    this.itemUrl.searchParams.set('id', productId);

    try {
      return fetchJson(this.itemUrl);
    } catch (error) {
      console.log('error fetch loadItem - ' + error.message);
    }
  }

  async loadCategory() {
    this.categoryUrl.searchParams.set('_sort', 'weight');
    this.categoryUrl.searchParams.set('_refs', 'subcategory');

    try {
      return fetchJson(this.categoryUrl);
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
          <button type="button" data-atr="deleteHandle">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button></li>`;
    } else {
      return '';
    }
  }

  getImageElement(url, source) {
    const image = document.createElement('div');

    image.innerHTML = this.templateImage(url, source);
    return image.firstElementChild;
  }

  templateImage = (url, source) => {
    return `<li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${url}">
          <input type="hidden" name="source" value="${source}">
          <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${url}">
        <span>${source}</span>
      </span>
          <button type="button" data-atr="deleteHandle">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button></li>`;
  }

  getCategoryList() {
    return this.getTemplateCategory(this.categories, this.categories.length, this.categories[this.categories.length - 1]['subcategories'].length);
  }

  getTemplateCategory(data, categoryLength, subcategoryLength) {
    if (categoryLength !== 0 && subcategoryLength !== 0) {
      return `${this.getTemplateCategory(data, categoryLength, subcategoryLength - 1)}
        <option ${(this.defaultFormData)
        ? (this.defaultFormData['subcategory'] === data[categoryLength - 1]['subcategories'][subcategoryLength - 1]['id'])
          ? 'selected'
          : ''
        : ''} value="${data[categoryLength - 1]['subcategories'][subcategoryLength - 1]['category']}">${data[categoryLength - 1]['title']} &gt; ${data[categoryLength - 1]['subcategories'][subcategoryLength - 1]['title']}</option>`
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
    this.controller.abort();
  }
}
