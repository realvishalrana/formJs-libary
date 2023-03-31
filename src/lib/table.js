export default class Table {
  constructor(tableContainerId) {
    this.container = document.getElementById(tableContainerId);
    this._events = {};
    this.on = function (name, cb) {
      if (!this._events[name]) {
        this._events[name] = [cb];
      } else {
        this._events[name].push(cb);
      }
    };
    this.counter = 0;
  }

  createHeader(headerFields) {
    const tableHeader = document.createElement('tr');
    let str = '';
    for (const key in headerFields) {
      str += '<th>' + key.toUpperCase().replace('_', ' ') + '</th>';
    }
    str += '<th>ACTION</th>';
    tableHeader.innerHTML = str;
    this.table.append(tableHeader);
  }

  displayDataInsideTheLocalStorage(element, headerFields) {
    let row = document.createElement('tr');
    row.setAttribute('id', element.userId);
    for (let key in headerFields) {
      let tdEle = document.createElement('td');
      tdEle.innerHTML = element[key];
      row.append(tdEle);
    }
    let button = this.addButton(element, row);
    row.append(button);
    return row;
  }

  addButton(element, row) {
    let tdEle = document.createElement('td');
    tdEle.setAttribute('class', 'display-btn');
    let updateBtn = document.createElement('button');
    updateBtn.innerText = 'Update';
    updateBtn.setAttribute('id', element.userId);
    updateBtn.setAttribute('class', 'update');
    updateBtn.onclick = () => {
      this._events['update'].forEach((func) => {
        func(element);
      });
    };

    let deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Delete';
    deleteBtn.setAttribute('id', element.userId);
    deleteBtn.setAttribute('class', 'delete');
    deleteBtn.onclick = () => {
      const id = element.userId;
      this._events['delete'].forEach((val) => {
        val(id);
      });
      this.table.removeChild(row);
      this.counter = this.counter - 1;
      this.headerElement.innerHTML = `Total items : ${this.counter}`;
      if (this.counter == 0) {
        this.container.style.display = 'none';
      }
    };
    tdEle.append(updateBtn);
    tdEle.append(deleteBtn);
    return tdEle;
  }

  addRow(data, headerFields, flag) {
    let row = document.createElement('tr');
    row.setAttribute('id', data.userId);
    for (let key in headerFields) {
      let tdEle = document.createElement('td');
      tdEle.innerHTML = data[key];
      row.append(tdEle);
    }
    let button = this.addButton(data, row);
    row.append(button);

    if (flag) {
      return row;
    } else {
      this.table.append(row);
      this.container.append(this.table);
    }
  }

  displayData(data, headerFields) {
    if (Array.isArray(data)) {
      console.log('line 94', data);
      this.counter = data.length;
      this.setCounter();
      this.table = document.createElement('table');
      this.table.setAttribute('width', '100%');
      this.createHeader(headerFields);
      if (data && data.length) {
        this.container.style.display = 'block';
        data.forEach((element) => {
          let headerRow = this.displayDataInsideTheLocalStorage(element, headerFields);
          this.table.append(headerRow);
        });
      }
    } else {
      this.counter = this.counter + 1;
      this.headerElement.innerHTML = `Total items : ${this.counter}`;
      this.addRow(data, headerFields, false);
    }
    this.container.append(this.table);
  }

  setCounter() {
    this.headerElement = document.createElement('h3');
    this.headerElement.innerHTML = `Total items : ${this.counter}`;
    this.container.append(this.headerElement);
  }

  displayUpdateDataInRow(data, headerFields) {
    for (let row of this.table.rows) {
      if (row.id == Number(data.userId)) {
        let updatedRow = this.addRow(data, headerFields, true);
        row.replaceWith(updatedRow);
      }
    }
  }
}
