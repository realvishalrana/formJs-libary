export default class Storage {
  constructor(storageId, secretKey) {
    this.storageId = storageId;
    this.mainData = [];
    this.secret = secretKey;
    if (this.storageId in localStorage) {
      const temp = localStorage.getItem(this.storageId);
      let decryptArray = this.decryptedValue(temp);
      this.mainData = JSON.parse(decryptArray);
    }
  }

  save(data) {
    this.mainData.push(data);
    console.log('line 15 save data', this.mainData);
    let encryptedData = this.encryptedValue(JSON.stringify(this.mainData));
    localStorage.setItem(this.storageId, encryptedData);
  }

  encryptedValue(data) {
    let encrypted = CryptoJS.AES.encrypt(data, this.secret).toString();
    return encrypted;
  }

  decryptedValue(data) {
    let decrypted = CryptoJS.AES.decrypt(data, this.secret);
    let painText = decrypted.toString(CryptoJS.enc.Utf8);
    return painText;
  }

  delete(id) {
    if (this.mainData?.length) {
      this.mainData.splice(
        this.mainData.findIndex((obj) => obj.userId == id),
        1
      );
    }

    let encryptedData = this.encryptedValue(JSON.stringify(this.mainData));
    localStorage.setItem(this.storageId, encryptedData);
    return this.mainData;
  }

  dataToBeUpdate(id) {
    const updateIndex = this.mainData.findIndex((obj) => obj.userId == id);
    const data = this.mainData[updateIndex];
    return data;
  }

  newUpdatedData(data) {
    const updateIndex = this.mainData.findIndex((obj) => obj.userId == data.userId);
    this.mainData[updateIndex] = data;
    let encryptedData = this.encryptedValue(JSON.stringify(this.mainData));
    localStorage.setItem(this.storageId, encryptedData);
  }

  sendDataFromLocalStorage() {
    console.log('line 14 ', this.mainData);
    return this.mainData;
  }
}
