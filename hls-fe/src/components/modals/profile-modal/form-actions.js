import React from 'react';
import { useFormikContext } from 'formik';
import Button from '@mui/material/Button';
import SubmitButton from '../../submit-button';
import DialogActions from '@mui/material/DialogActions';
import { func } from 'prop-types';


function FormActions({ onClose }) {
  const { status: { isEditing }, setStatus, isSubmitting, handleSubmit } = useFormikContext();

  return (
    <DialogActions sx={{ columnGap: 1 }}>
      {
        isEditing &&
        <>
          <SubmitButton onClick={handleSubmit}>
            Submit
          </SubmitButton>
          <Button
            disabled={isSubmitting}
            onClick={() => setStatus({ isEditing: false })}
          >
            Cancel
          </Button>
        </>
      }
      {
        !isEditing &&
        <Button onClick={() => setStatus({ isEditing: true })}>
          Edit
        </Button>
      }
      <Button onClick={onClose} disabled={isSubmitting}>
        Close
      </Button>
    </DialogActions>
  );
}

FormActions.propTypes = {
  onClose: func.isRequired
};

export default FormActions;