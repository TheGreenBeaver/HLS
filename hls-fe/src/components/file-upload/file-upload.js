import React, { useRef, useState, useCallback, useEffect } from 'react';
import { bool, func, string, elementType } from 'prop-types';
import { readFile } from '../../util/misc';
import { useFormikContext } from 'formik';
import FormHelperText from '@mui/material/FormHelperText';
import CenterBox from '../layout/center-box';
import Box from '@mui/material/Box';
import { omit } from 'lodash';
import './file-upload.styles.css';


const VOWELS = 'eyuioa';

function FileUpload({
  fieldName,
  accept,
  multiple,
  disabled,
  accessible,
  onUploadExtra,

  HintIcon,
  PreviewComponent,

  ...extraProps
}) {
  const { setFieldError, setFieldValue, errors, isSubmitting, values } = useFormikContext()

  const inputRef = useRef(null);
  const hintRef = useRef(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState(values[fieldName]);

  const canBeUsed = accessible && !isProcessing && !disabled && !isSubmitting;
  const shouldDisplayPreview = accept.startsWith('image/');
  const isEmpty = !values[fieldName];

  const hideHint = useCallback(() => setHintVisible(false), []);

  useEffect(() => {
    if (isEmpty) {
      setImageSrc(null);
    }
  }, [isEmpty]);

  function onFileAdd(rawFile) {
    if (!rawFile) {
      return;
    }
    if (shouldDisplayPreview) {
      setIsProcessing(true);
      readFile(rawFile, res => {
        setImageSrc(res);
        setIsProcessing(false);
      });
    }
    setFieldValue(fieldName, rawFile);
    onUploadExtra?.(rawFile);
  }

  function onClick() {
    if (canBeUsed) {
      inputRef.current.click();
    }
  }

  function onDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    if (canBeUsed) {
      const transferItems = e.dataTransfer.items;
      if (!transferItems) {
        return;
      }
      if (!multiple && transferItems.length > 1) {
        setFieldError(fieldName, 'Please select a single file');
        return;
      }
      const rawFile = transferItems[0].getAsFile();
      const acceptPattern = new RegExp(accept.replace('*', '.+'));
      if (!acceptPattern.test(rawFile.type)) {
        const fileTypeDesc = accept.split('/')[0];
        const article = VOWELS.includes(fileTypeDesc[0]) ? 'an' : 'a';
        setFieldError(fieldName, `Please select ${article} ${fileTypeDesc}`);
        return;
      }
      onFileAdd(rawFile);
    }
  }

  function onMouseEnter() {
    if (canBeUsed) {
      hintRef.current?.removeEventListener('animationend', hideHint);
      hintRef.current?.classList.remove('obs-file-upload-hint-out');
      setHintVisible(true);
    }
  }

  function onMouseLeave() {
    if (canBeUsed) {
      hintRef.current.addEventListener('animationend', hideHint);
      hintRef.current.classList.add('obs-file-upload-hint-out');
    }
  }

  return (
    <>
      <Box
        onClick={onClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        sx={{
          position: 'relative',
          cursor: canBeUsed ? 'pointer' : 'default',
          ...extraProps.sx
        }}
        {...omit(extraProps, 'sx')}
      >
        {
          hintVisible &&
          <CenterBox
            ref={hintRef}
            className='obs-file-upload-hint-in'
            position='absolute'
            top={0}
            left={0}
            right={0}
            bottom={0}
            borderRadius='50%'
            sx={{
              pointerEvents: 'none',
              background: theme => theme.palette.grey[700],
              opacity: 0.5,
              zIndex: 10
            }}
          >
            <HintIcon fontSize='large' />
          </CenterBox>
        }
        {shouldDisplayPreview && <PreviewComponent src={imageSrc} />}
        {
          accessible &&
          <input
            type='file'
            multiple={multiple}
            ref={inputRef}
            disabled={!canBeUsed}
            accept={accept}
            style={{ display: 'none' }}
            onChange={e => onFileAdd(e.target.files[0])}
          />
        }
      </Box>
      <FormHelperText error>
        {errors[fieldName]}
      </FormHelperText>
    </>
  );
}

FileUpload.propTypes = {
  fieldName: string.isRequired,
  accept: string.isRequired,
  multiple: bool,
  disabled: bool, // disabled = true means that the input is there and can perform SOME actions
  accessible: bool, // accessible = false basically means there's NO input AT ALL
  onUploadExtra: func,

  HintIcon: elementType.isRequired,
  PreviewComponent: elementType.isRequired
};

FileUpload.defaultProps = {
  disabled: false,
  accessible: true,
  onUploadExtra: null,
  multiple: false,
};

export default FileUpload;