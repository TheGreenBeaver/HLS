import { mapValues } from 'lodash';


function finishSubmit(req, formikHelpers) {
  formikHelpers.setSubmitting(true);
  return req
    .catch(e => {
      const errorsObj = mapValues(e.payload, v => v.join('; '));
      formikHelpers.setErrors(errorsObj);
      formikHelpers.setSubmitting(false);
    });
}

export default finishSubmit;