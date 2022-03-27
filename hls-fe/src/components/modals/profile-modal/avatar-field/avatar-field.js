import React from 'react';
import { useFormikContext } from 'formik';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { Delete, Person, PhotoCamera } from '@mui/icons-material';
import Button from '@mui/material/Button';
import fields from '../fields';
import FileUpload from '../../../file-upload';


function PreviewComponent({ src }) {
  return (
    <Avatar src={src} sx={{ minHeight: 100, minWidth: 100 }}>
      <Person fontSize='large' />
    </Avatar>
  );
}

function AvatarField() {
  const { values, setFieldValue, status: { isEditing } } = useFormikContext();

  return (
    <>
      <FileUpload
        accept='image/*'
        PreviewComponent={PreviewComponent}
        fieldName={fields.avatar}
        onUploadExtra={() => setFieldValue(fields.noAvatar, false)}
        accessible={isEditing}
        HintIcon={PhotoCamera}
        borderRadius='50%'
      />

      {
        isEditing && !values[fields.noAvatar] &&
        <Box display='flex' justifyContent='center' mt={0.5}>
          <Button
            startIcon={<Delete />}
            onClick={() => {
              setFieldValue(fields.noAvatar, true);
              setFieldValue(fields.avatar, null);
            }}
          >
            Clear
          </Button>
        </Box>
      }
    </>
  );
}

export default AvatarField;