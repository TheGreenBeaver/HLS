import React from 'react';
import FileUpload from '../../../components/file-upload';
import fields from './fields';
import { CenterBox } from '../../../components/layout';
import { Upload } from '@mui/icons-material';


function ThumbnailField() {
  return (
    <FileUpload
      accept='image/*'
      fieldName={fields.thumbnail}
    >
      <CenterBox>
        <Upload fontSize='large' />
      </CenterBox>
    </FileUpload>
  );
}

export default ThumbnailField;