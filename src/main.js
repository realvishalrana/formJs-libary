// formData is accessible here as we have global variable in formData.js
import { formData, cricketData } from './data/formData.js';
import Form from './lib/form.js';
import Storage from './lib/storage.js';
import Table from './lib/table.js';

class Main {
  constructor(formContainerId, storageId, tableContainerId, secretKey, data) {
    const frm = new Form(formContainerId, data);
    const storage = new Storage(storageId, secretKey);
    const tbl = new Table(tableContainerId);

    let flag = false;
    tbl.on('delete', (id) => {
      storage.delete(id);
      frm.container.onreset();
    });
    tbl.on('update', (element) => {
      let oldData = storage.dataToBeUpdate(element.userId);
      frm.getDataToBeUpdated(oldData);
      flag = true;
    });

    const dataInsideTheStorage = storage.sendDataFromLocalStorage();
    let fields = frm.sendFields();
    tbl.displayData(dataInsideTheStorage, fields);

    window.onstorage = () => {
      console.log('main file');
      console.log(dataInsideTheStorage);
    };

    frm.on('submit', () => {
      tbl.container.style.display = 'block';
      const data = frm.getDataInsideForm();
      if (flag) {
        storage.newUpdatedData(data);
        tbl.displayUpdateDataInRow(data, fields);
        flag = false;
      } else {
        console.log('line 41', data);
        storage.save(data);
        tbl.displayData(data, fields);
      }
      frm.obj = {};
    });
  }
}

const main = new Main('employeeForm', 'employeeData', 'tableDiv', 'tvyxzg2MyfHkQ2L6', formData);
// const main2 = new Main('cricketForm', 'cricketData', 'cricketDiv', 'tvyxzQ2L6', cricketData);
