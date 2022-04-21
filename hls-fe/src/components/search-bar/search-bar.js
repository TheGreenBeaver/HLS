import React from 'react';
import { oneOf } from 'prop-types';
import SmartForm from '../../ui-kit/form-builder/smart-form';
import AsField from './as-field';
import { FIELD_TYPES } from '../../ui-kit/form-builder/util/validation';
import { links } from '../../pages/routing';
import { useHistory, useParams } from 'react-router-dom';
import queryString from 'query-string';
import { Q } from '../../util/constants';
import { Form } from 'formik';


const SECTIONS = {
  search: 'search',
  single: 'single',
};

function SearchBar({ section }) {
  const history = useHistory();
  const { location: { search } } = history;
  const params = useParams();

  function getRedirectArgs(values) {
    return params?.id ? [params.id, values] : [values];
  }

  return (
    <SmartForm
      doNotPopulate
      initialValues={{ [Q]: queryString.parse(search)?.[Q] || '' }}
      validationConfig={{ [Q]: [FIELD_TYPES.text, null, true] }}
      onSubmit={values => history.push(links.channels[section].get(...getRedirectArgs(values)))}
    >
      <Form>
        <AsField />
      </Form>
    </SmartForm>
  );
}

SearchBar.propTypes = {
  section: oneOf([...Object.values(SECTIONS)]).isRequired,
};

export { SECTIONS };
export default SearchBar;