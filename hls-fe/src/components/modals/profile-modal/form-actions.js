import React from 'react';
import Button from '@mui/material/Button';
import SubmitButton from '../../../ui-kit/form-builder/interactions/submit-button';
import DialogActions from '@mui/material/DialogActions';
import { func } from 'prop-types';
import useEditableView from '../../../ui-kit/form-builder/util/use-editable-view';


function FormActions({ onClose }) {
  const { isEditing, setIsEditing, isSubmitting, handleSubmit, resetAndExit } = useEditableView();

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
            onClick={resetAndExit}
          >
            Cancel
          </Button>
        </>
      }
      {
        !isEditing &&
        <Button onClick={() => setIsEditing(true)}>
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