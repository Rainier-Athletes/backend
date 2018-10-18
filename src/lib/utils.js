const convertDateToValue = (inputDate) => {
  let date;
  if (inputDate instanceof Date) {
    date = inputDate.toISOString();
  } else {
    date = inputDate;
  }
  
  if (!inputDate) return null; // handle null inputs

  // replacing '-' with '/' gets around the timezone issue that skews
  // dates by a day depending on the current time of day in your
  // current location.
  const dt = new Date(date.replace(/-/g, '/').replace(/T.+/, ''));
  const year = dt.getFullYear().toString();
  const month = (dt.getMonth() + 1).toString().padStart(2, '0');
  const day = dt.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export {
  convertDateToValue, // eslint-disable-line
};
