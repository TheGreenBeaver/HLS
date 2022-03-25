import React, { useCallback, useRef, useState } from 'react';
import { useFormikContext } from 'formik';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { Delete, Person, PhotoCamera } from '@mui/icons-material';
import CenterBox from '../../../layout/center-box';
import Button from '@mui/material/Button';
import fields from '../fields';
import './avatar-field.styles.css';


function AvatarField() {
  const inputRef = useRef(null);
  const hintRef = useRef(null);
  const { isSubmitting, values, setFieldValue, status: { isEditing } } = useFormikContext();

  const [imageSrc, setImageSrc] = useState(values.avatar);
  const [hintVisible, setHintVisible] = useState(false);

  const canInteract = isEditing && !isSubmitting;

  const hideHint = useCallback(() => setHintVisible(false), []);

  return (
    <>
      <Box
        position='relative'
        sx={{ cursor: canInteract ? 'pointer' : 'default' }}
        borderRadius='50%'
        onMouseEnter={() => {
          if (canInteract) {
            hintRef.current?.removeEventListener('animationend', hideHint);
            hintRef.current?.classList.remove('obs-avatar-field-out');
            setHintVisible(true);
          }
        }}
        onMouseLeave={() => {
          if (canInteract) {
            hintRef.current.addEventListener('animationend', hideHint);
            hintRef.current.classList.add('obs-avatar-field-out');
          }
        }}
        onClick={() => {
          if (canInteract) {
            inputRef.current.click();
          }
        }}
      >
        {
          hintVisible &&
          <CenterBox
            ref={hintRef}
            className='obs-avatar-field-in'
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
            <PhotoCamera fontSize='large' />
          </CenterBox>
        }
        {
          isEditing &&
          <input
            type='file'
            multiple={false}
            ref={inputRef}
            accept='image/*'
            style={{ display: 'none' }}
            onChange={e => {
              const rawFile = e.target.files[0];
              if (rawFile) {
                setFieldValue(fields.noAvatar, false);
                setFieldValue(fields.avatar, rawFile);
                const fr = new FileReader();
                fr.onload = loadEv => setImageSrc(loadEv.target.result);
                fr.readAsDataURL(rawFile);
              }
            }}
          />
        }
        <Avatar
          src={imageSrc}
          sx={{ minHeight: 100, minWidth: 100 }}
        >
          <Person fontSize='large' />
        </Avatar>
      </Box>

      {
        isEditing && !values[fields.noAvatar] &&
        <Box display='flex' justifyContent='center' mt={0.5}>
          <Button
            startIcon={<Delete />}
            onClick={() => {
              setFieldValue(fields.noAvatar, true);
              setFieldValue(fields.avatar, null);
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

export default AvatarField;