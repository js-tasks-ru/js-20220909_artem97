export default class DoubleSlider {

  constructor({min = 10, max = 100, selected: {from = min, to = max} = {}, formatValue = value => '$' + value} = {}) {
    this.min = min;
    this.max = max;

    this.formatValue = formatValue;
    this.size = max - min;

    this.initMin = from;
    this.initMax = to;

    this.initMinPercent = (from - min) / this.size * 100;
    this.initMaxPercent = (max - to) / this.size * 100;

    this.render();
    this.createListener();
  }

  createListener() {
    for (const subElement in this.subElements) {
      const element = this.subElements[subElement];
      element.addEventListener('pointerdown', (event) => {
        this.callBackForListenerMousedown(event, element);
      });
    }
  }

  callBackForListenerMousedown = (mousedown, element) => {
    const headElement = this.element.querySelector('.range-slider__inner');
    const rangeSlider = this.element.querySelector('.range-slider__progress');
    const minValueSpan = this.element.querySelector('#minValue');
    const maxValueSpan = this.element.querySelector('#maxValue');
    const that = this;
    let wrapper = (event) =>{callBackForListenerMousemove(event)}
    document.addEventListener('pointermove', wrapper);

    document.addEventListener('pointerup', () => {
      this.chanceMinValue = minValueSpan.innerHTML;
      this.chanceMaxValue = maxValueSpan.innerHTML;
      document.removeEventListener('pointermove', wrapper);
    });

    function callBackForListenerMousemove(event) {
      let leftMove = (event.clientX - headElement.getBoundingClientRect().left) / headElement.clientWidth;
      if (element.dataset.side === 'left') {
        element.style.left = `${leftMove * 100}%`;
        rangeSlider.style.left = `${leftMove * 100}%`;
        if (parseFloat(element.style.left) + parseFloat(that.subElements['right'].style.right) >= 100) {
          element.style.left = `${100 - parseFloat(that.subElements['right'].style.right)}%`;
          rangeSlider.style.left = `${100 - parseFloat(that.subElements['right'].style.right)}%`;
        } else {
          if ((Math.round(that.size * leftMove) + that.min) < that.min) {
            minValueSpan.innerHTML = `${that.formatValue(that.min)}`;
            that.chanceMinValue = minValueSpan.innerHTML;
            element.style.left = '0%';
            rangeSlider.style.left = '0%';
          } else {
            minValueSpan.innerHTML = `${that.formatValue(Math.round(that.size * leftMove) + that.min)}`;
          }
        }
      } else if (element.dataset.side === 'right') {
        leftMove = 1 - leftMove;
        element.style.right = `${leftMove * 100}%`;
        rangeSlider.style.right = `${leftMove * 100}%`;
        if (parseFloat(element.style.right) + parseFloat(that.subElements['left'].style.left) >= 100) {
          element.style.right = `${100 - parseFloat(that.subElements['left'].style.left)}%`;
          rangeSlider.style.right = `${100 - parseFloat(that.subElements['left'].style.left)}%`;
        } else {
          if ((that.max - Math.round(that.size * leftMove)) > that.max) {
            maxValueSpan.innerHTML = `${that.formatValue(that.max)}`;
            that.chanceMaxValue = maxValueSpan.innerHTML;
            element.style.right = '0%';
            rangeSlider.style.right = '0%';
          } else {
            maxValueSpan.innerHTML = `${that.formatValue(that.max - Math.round(that.size * leftMove))}`;
          }
        }
      }
    }
  };


  getTemplate() {
    return `
        <div class="range-slider">
          <span id="minValue" data-element="from">${this.formatValue(this.initMin)}</span>
          <div class="range-slider__inner">
            <span class="range-slider__progress" style="left: ${this.initMinPercent}%; right: ${this.initMaxPercent}%"></span>
            <span class="range-slider__thumb-left" data-side="left" style="left: ${this.initMinPercent}%"></span>
            <span class="range-slider__thumb-right" data-side="right" style="right: ${this.initMaxPercent}%"></span>
          </div>
          <span id="maxValue" data-element="to">${this.formatValue(this.initMax)}</span>
        </div>
    `
  }

  render() {
    const div = document.createElement('div');

    div.innerHTML = this.getTemplate();
    const element = div.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-side]')
    for (const subElement of elements) {
      const name = subElement.dataset.side
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
