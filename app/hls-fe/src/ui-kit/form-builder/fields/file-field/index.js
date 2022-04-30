import React, { useCallback, useEffect, useRef, useState } from 'react';
import { string, bool, elementType, object, oneOfType, shape, number, node } from 'prop-types';
import './file-field.styles.css';
import useEditableView from '../../util/use-editable-view';
import Box from '@mui/material/Box';
import { omit } from 'lodash';
import CenterBox from '../../../layout/center-box';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import { Delete, Upload, VideoCameraBack } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import AutosizeImage from '../../../autosize-image';
import { RatioBox } from '../../../layout';
import { blockEvent, bytesToUnit } from '../../../../util/misc';


function EditableFile({ name, HintIcon, isImage, extraProps, PreviewComponent, label, keepRatio, emptyContent }) {
  const inputRef = useRef(null);
  const hintRef = useRef(null);

  const {
    setFieldValue,
    errors,
    isSubmitting,
    values,
    isEditing,
    setFieldError
  } = useEditableView();

  const fieldError = errors[name];
  const fieldValue = values[name];
  const hasValue = !!fieldValue;

  function setVal(val) {
    setFieldValue(name, val);
  }

  function setErr(err) {
    setFieldError(name, err);
  }

  const [hintVisible, setHintVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState(fieldValue);

  useEffect(() => {
    if (!isEditing) {
      setImageSrc(fieldValue);
    }
  }, [isEditing]);

  const canBeUsed = isEditing && !isSubmitting;
  const shouldHandleHint = canBeUsed && isImage && hasValue;

  const hideHint = useCallback(() => setHintVisible(false), []);

  function onFileAdd(files) {
    const amt = files.length;
    if (!amt) {
      return;
    }

    if (amt > 1) {
      setErr('Please select a single file');
      return;
    }

    const rawFile = files[0];
    if (isImage) {
      if (!rawFile.type.startsWith('image')) {
        setErr('Please select an image');
        return;
      }
      setImageSrc(URL.createObjectURL(rawFile));
    }
    setVal(rawFile);
  }

  function onClick() {
    if (canBeUsed) {
      inputRef.current.click();
    }
  }

  function onDragOver(e) {
    blockEvent(e);
  }

  function onDrop(e) {
    blockEvent(e);
    if (canBeUsed) {
      const transferItems = e.dataTransfer.items;
      if (!transferItems) {
        return;
      }
      onFileAdd(transferItems.map(item => item.getAsFile()));
    }
  }

  function onMouseEnter() {
    if (shouldHandleHint) {
      hintRef.current?.removeEventListener('animationend', hideHint);
      hintRef.current?.classList.remove('ist-file-field-hint-out');
      setHintVisible(true);
    }
  }

  function onMouseLeave() {
    hintRef.current?.addEventListener('animationend', hideHint);
    hintRef.current?.classList.add('ist-file-field-hint-out');
  }

  let Insides;
  if (!keepRatio) {
    Insides = React.Fragment;
  } else {
    Insides = keepRatio?.constructor.name === 'Object'
      ? props => <RatioBox ratio={keepRatio} {...props}>{props.children}</RatioBox>
      : RatioBox;
  }

  return (
    <>
      {label && <Typography mb={0.5}>{label}</Typography>}
      <Box
        onClick={onClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        sx={{
          position: 'relative',
          cursor: canBeUsed ? 'pointer' : 'default',
          overflow: 'hidden',
          borderWidth: '2px',
          borderStyle: 'solid',
          borderRadius: '4px',
          borderColor: theme => theme.palette.grey[400],
          backgroundColor: theme => isImage && !!imageSrc ? theme.palette.common.black : theme.palette.grey[300],
          transition: theme => theme.transitions.create('border-color'),

          '& .MuiSvgIcon-root': {
            color: theme => theme.palette.grey[400],
            transition: theme => theme.transitions.create('color')
          },

          '&:hover': canBeUsed ? {
            borderColor: theme => theme.palette.primary.light,
            '& .MuiSvgIcon-root': {
              color: theme => theme.palette.primary.light
            }
          } : undefined,
          ...extraProps.sx
        }}
        {...omit(extraProps, 'sx')}
      >
        <Insides>
          {
            hintVisible &&
            <CenterBox
              ref={hintRef}
              className='ist-file-field-hint-in'
              position='absolute'
              top={0}
              left={0}
              right={0}
              bottom={0}
              sx={{
                pointerEvents: 'none',
                background: theme => theme.palette.grey[500],
                opacity: 0.5,
                zIndex: 10
              }}
            >
              <HintIcon sx={{ fontSize: '3em' }} />
            </CenterBox>
          }
          {
            !hasValue && isEditing && (
              emptyContent ||
              <CenterBox>
                <Upload sx={{ fontSize: '3em' }} />
              </CenterBox>
            )
          }
          {
            isImage && (!!imageSrc || !isEditing) && (
              PreviewComponent
                ? <PreviewComponent src={imageSrc} />
                : <CenterBox>
                  <AutosizeImage src={imageSrc} alt='preview' />
                </CenterBox>
            )
          }
          {
            !isImage && hasValue &&
            <CenterBox columnGap={2}>
              <VideoCameraBack sx={{ fontSize: '3em' }} />
              <Box>
                <Typography display='block' variant='button'>{fieldValue.name}</Typography>
                <Typography color={theme => theme.palette.grey[400]} variant='caption' display='block'>
                  {bytesToUnit(fieldValue.size)}
                </Typography>
              </Box>
            </CenterBox>
          }
        </Insides>
        {
          isEditing &&
          <input
            type='file'
            multiple={false}
            ref={inputRef}
            disabled={!canBeUsed}
            accept={isImage ? 'image/*' : 'video/*'}
            style={{ display: 'none' }}
            onChange={e => onFileAdd(e.target.files)}
          />
        }
      </Box>
      <FormHelperText error>
        {fieldError}
      </FormHelperText>
      {
        isEditing && hasValue &&
        <Box display='flex' justifyContent='flex-end' mt={0.5}>
          <Button
            disabled={!canBeUsed}
            startIcon={<Delete />}
            onClick={() => {
              setVal(null);
              setImageSrc(null);
            }}
          >
            Clear
          </Button>
        </Box>
      }
    </>
  );
}

EditableFile.propTypes = {
  name: string.isRequired,
  label: string,
  isImage: bool,
  keepRatio: oneOfType([bool, shape({ w: number.isRequired, h: number.isRequired })]),
  extraProps: object,
  PreviewComponent: elementType,
  HintIcon: elementType,
  emptyContent: node
};

EditableFile.defaultProps = {
  isImage: false,
  extraProps: {},
  keepRatio: false
};

export default EditableFile;