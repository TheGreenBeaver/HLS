/* eslint-disable no-template-curly-in-string,default-case */
import { object, string, mixed, date } from 'yup';
import { mapValues } from 'lodash';
import { UNITS, unitToBytes } from '../../../util/misc';

const FIELD_TYPES = {
  text: 'text',
  file: 'file',
  email: 'email',
  futureDate: 'futureDate',
};
const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Not a valid email address',
  maxLength: '${path} must be less than ${max} characters',
  future: 'Please select some date and time in the future'
};

function composeFileValidator(val, unit = UNITS.MB, isImage = false) {
  return mixed(inp => inp instanceof File || typeof inp === 'string')
    .test(
      'fileSize', `Please select a file that's ${val}${unit} or below`,
        v => !v || typeof v === 'string' || v.size <= unitToBytes(val, unit)
    )
    .test(
      'fileType', `Please select ${isImage ? 'an image' : 'a video'}`,
      v => !v || typeof v === 'string' || v.type.startsWith(isImage ? 'image/' : 'video/')
    )
    .nullable();
}

function applyRequired(schema, required) {
  if (!required) {
    return schema;
  }

  if (typeof required === 'boolean') {
    return schema.required(VALIDATION_MESSAGES.required);
  }

  const [definingField, shouldBe] = typeof required === 'string' ? [required, true] : required;
  return schema.when(definingField, {
    is: shouldBe,
    then: schema => schema.required(VALIDATION_MESSAGES.required),
    otherwise: schema => schema.notRequired()
  });
}

function composeValidationSchema(validationConfig) {
  return object(mapValues(validationConfig, fieldConfig => {
    const [type, arg, required, modify] = fieldConfig;
    let schema;
    switch (type) {
      case FIELD_TYPES.text:
        schema = arg ? string().max(arg, VALIDATION_MESSAGES.maxLength) : string();
        break;
      case FIELD_TYPES.file:
        schema = composeFileValidator(...arg);
        break;
      case FIELD_TYPES.email:
        schema = string().email(VALIDATION_MESSAGES.email);
        break;
      case FIELD_TYPES.futureDate:
        schema = date().min(new Date(), VALIDATION_MESSAGES.future).nullable();
    }
    schema = applyRequired(schema, required);
    return modify ? modify(schema) : schema;
  }));
}

export {
  FIELD_TYPES, VALIDATION_MESSAGES,
  composeFileValidator, composeValidationSchema
};