const unitsByPower = ['B', 'KB', 'MB', 'GB', 'TB'];
const bitesPerPower = 1024;

const validationMessages = {
  required: 'This field is required',
  email: 'Not a valid email address',
  maxLength: val => `Must not exceed ${val} characters`,
  maxSize: val => {
    let niceVal = val;
    let unitIdx = 0;
    while (niceVal >= bitesPerPower) {
      niceVal /= bitesPerPower;
      unitIdx++;
    }
    return `Please select a file that's ${niceVal}${unitsByPower[unitIdx]} or below`;
  }
};

export default validationMessages;