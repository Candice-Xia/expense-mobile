let date = new Date();
    let dates = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
let nowDate=dates.year +
"-" +
(dates.month < 10 ? "0" + dates.month : dates.month) +
"-" +
(dates.day < 10 ? "0" + dates.day : dates.day);
export default nowDate;