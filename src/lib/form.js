export default class Form {
  constructor(formContainerId, formData) {
    this.container = document.getElementById(formContainerId);
    this.formData = formData;
    this.obj = {};
    this.fields = {};

    this._events = {};
    this.on = function (name, cb) {
      if (!this._events[name]) {
        this._events[name] = [cb];
      } else {
        this._events[name].push(cb);
      }
      if (name === 'submit') {
        this.container.onsubmit = (e) => {
          e.preventDefault();
          this._events[name].forEach((func) => {
            func();
            this.container.reset();
          });
        };
      } else if (name === 'reset') {
        this.container.onreset = () => {
          this._events[name].forEach((func) => func());
        };
      } else if (name === 'change') {
        this.container.onchange = (e) => {
          e.preventDefault();
          this._events[name].forEach((func) => func());
        };
      }
    };

    this.container.onreset = () => {
      this.container.reset();
    };

    this.createForm = function () {
      this.formData.forEach((item) => {
        let attr = item.attr;
        switch (item.type) {
          case 'hidden':
            this.fields[item.key] = item.type;
            this[item.key] = item.getValue;
            this.hidden = document.createElement('input');
            this.hidden.setAttribute('type', item.type);
            this.hidden.setAttribute('unique', true);
            this.hidden.setAttribute('key', item.key);
            this.container.appendChild(this.hidden);
            break;
          case 'text':
          case 'email':
          case 'number':
          case 'tel':
            let label = this.createLabel(item.label, attr['id']);
            this.container.append(label);
            this[item.key] = this.createInputField(item);
            this.container.append(this[item.key]);
            this.fields[item.key] = item.type;
            break;
          case 'textarea':
            let textAreaLabel = this.createLabel(item.label, attr['id']);
            this.container.append(textAreaLabel);
            this[item.key] = this.createInputField(item);
            this.container.appendChild(this[item.key]);
            this.fields[item.key] = item.type;
            break;
          case 'select':
            let selectLabel = this.createLabel(item.label, attr['id']);
            this.container.append(selectLabel);
            this[item.key] = document.createElement('select');
            item.options.forEach((opt) => {
              const option = document.createElement('option');
              option.value = opt.value;
              option.innerText = opt.innerText;
              this[item.key].appendChild(option);
            });
            this.container.appendChild(this[item.key]);
            if (item.attr) {
              this.addAttributeExceptInputType(this[item.key], item.attr);
            }
            this.fields[item.key] = item.type;
            break;
          case 'radio':
          case 'checkbox':
            let checkboxLabel = this.createLabel(item.label);
            this.container.append(checkboxLabel);
            item.options.forEach((opt) => {
              this[opt.value] = document.createElement('input');
              this[opt.value].type = item.type;
              this[opt.value].value = opt.value;
              this[opt.value].name = opt.name;
              if (opt.attr) {
                this.addAttributeExceptInputType(this[opt.value], opt.attr);
              }
              const checkLabel = document.createElement('label');
              // checkLabel.setAttribute('for', opt.value);
              checkLabel.setAttribute('for', opt.attr.id);
              checkLabel.innerText = opt.innerText;
              checkLabel.value = opt.value;
              const checkDiv = document.createElement('div');
              checkDiv.className = 'options';
              checkDiv.appendChild(this[opt.value]);
              checkDiv.appendChild(checkLabel);
              this.container.appendChild(checkDiv);
            });
            this.fields[item.key] = item.type;
            break;
          case 'submit':
          case 'reset':
            this[item.type] = document.createElement('input');
            this[item.type].type = item.type;
            this[item.type].id = item.attr.id;
            this.container.appendChild(this[item.type]);
            break;
          default:
            break;
        }
      });
    };
    this.createForm();
  }

  createLabel(labelText, forId) {
    const label = document.createElement('label');
    label.innerText = labelText;
    label.setAttribute('class', 'allLabel');
    if (typeof forId !== 'undefined') {
      label.setAttribute('for', forId);
    }
    return label;
  }

  createInputField(item) {
    let input = document.createElement('input');
    let on;
    if (item.type === 'textarea') {
      input = document.createElement('textarea');
    }
    input.setAttribute('type', `${item.type}`);

    Object.entries(item.attr).forEach(([key, value]) => {
      input.setAttribute(`${key}`, `${value}`);
      if (key === 'onchange') {
        on = value;
      }
    });

    input.onchange = (e) => {
      this.obj[e.target.name] = e.target.value;
      if (on) {
        on();
      }
    };
    return input;
  }

  addAttributeExceptInputType(field, obj) {
    let hasOnChange;
    Object.entries(obj).forEach(([key, value]) => {
      field.setAttribute(key, value);

      if (key === 'onchange') {
        hasOnChange = value;
      }
    });

    field.onchange = (e) => {
      if (e.target.type === 'checkbox') {
        this.getCheckBoxValue(e);
      } else {
        this.obj[e.target.name] = e.target.value;
      }

      if (hasOnChange) {
        hasOnChange();
      }
    };
  }

  getCheckBoxValue(event) {
    switch (event.target.checked) {
      case true:
        if (this.obj[event.target.name] && event.target.name in this.obj) {
          this.obj[event.target.name].push(event.target.value);
        } else {
          this.obj[event.target.name] = [event.target.value];
        }
        break;

      case false:
        const index = this.obj[event.target.name].findIndex((value) => value == event.target.value);
        this.obj[event.target.name].splice(index, 1);
        break;
    }
  }

  getDataInsideForm() {
    for (const key in this.fields) {
      switch (this.fields[key]) {
        case 'hidden':
          this.obj[key] = this[key](this.obj);
          break;
        default:
          if (!(key in this.obj)) {
            this.obj[key] = '';
          }
      }
    }
    return this.obj;
  }

  sendFields() {
    return this.fields;
  }

  getDataToBeUpdated(data) {
    for (let key in this.fields) {
      switch (this.fields[key]) {
        case 'checkbox':
        case 'radio':
          for (let i = 0; i < this.container.elements.length; i++) {
            let containerElementsType = this.container.elements[i].type;
            if (containerElementsType === 'radio') {
              if (this.container.elements[i].value === data[key]) {
                this.container.elements[i].checked = true ? true : false;
              }
              this.obj[key] = data[key];
            }
            if (containerElementsType === 'checkbox') {
              let hobbiesElms = this.container.elements[i];
              if (key === 'hobbies') {
                hobbiesElms.checked = data[key].includes(hobbiesElms.value);
              }
            }
          }
          break;
        default:
          this[key].value = data[key];
          this.obj[key] = data[key];
          break;
      }
    }
  }
}
