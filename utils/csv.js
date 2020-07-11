const path = require("path");
const csvtojsonV2 = require("csvtojson/v2");

const CsvSingleton = (function () {
  function CsvInstance() {
    this._msgs = [];
  }

  CsvInstance.prototype = {
    getBotData: function () {
      try {
        csvtojsonV2()
          .fromFile(path.join(__dirname, "../bot.csv"))
          .then((objArr) => {
            const result = objArr.map((obj) => {
              const [item] = Object.entries(obj).map(([_ignore2, value]) => {
                return value.split(";");
              });
              return item;
            });
            this._msgs = result;
          });
      } catch (err) {
        console.error("read csv error: ", JSON.stringify(err, null, 2));
      }
    },
    getBotDataByInput: function (input) {
      const msg = this._msgs.find((el) => el[0] === input);
      return msg;
    },
  };

  let instance;

  function createCsvInstance() {
    instance = new CsvInstance();
    return instance;
  }

  return {
    getCsvInstance: () => {
      if (!instance) instance = createCsvInstance();
      return instance;
    },
  };
})();

const csv = CsvSingleton.getCsvInstance();

module.exports = { csv };
