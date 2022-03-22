const validationMessages = {
  required: 'This field is required',
  email: 'Not a valid email address',
  max: val => `Must not exceed ${val} characters`
};

export default validationMessages;