export default class NotificationMessage {

  static activeNotification;

  constructor(message = '', {duration = 0, type = "error"} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render()
  }

  getTemplate() {
    return `
        <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">
                    ${this.message}
                </div>
            </div>
        </div>
    `
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  show(parent = document.body) {
    if(NotificationMessage.activeNotification){
      NotificationMessage.activeNotification.remove();
    }
    parent.append(this.element);

    this.timer = setTimeout(() => {
      this.remove();
    }, this.duration);

    NotificationMessage.activeNotification = this;
  }

  remove() {
    clearTimeout(this.timer);

    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    NotificationMessage.activeNotification = null;
  }
}
