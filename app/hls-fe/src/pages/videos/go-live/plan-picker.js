import React, { useState } from 'react';
import { useField } from 'formik';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import DatePicker from 'react-datepicker';
import './plan-picker.styles.scss';
import Typography from '@mui/material/Typography';
import OutlinedInput from '@mui/material/OutlinedInput';
import fieldNames from './field-names';


function PlanPicker() {
  const [isPlanning, setIsPlanning] = useState(false);
  const [, { error, value }, { setValue }] = useField(fieldNames.plan);

  function getContent() {
    if (!isPlanning) {
      return (
        <Button
          onClick={() => {
            setValue(new Date());
            setIsPlanning(true);
          }}
          variant='outlined'
        >
          Plan for future
        </Button>
      );
    }

    return (
      <Box className='ist-plan-picker'>
        <DatePicker
          selected={value}
          onChange={dt => setValue(dt)}
          showTimeSelect
          minDate={new Date()}
          filterTime={time => {
            const currentDate = new Date();
            const selectedDate = new Date(time);

            return currentDate.getTime() < selectedDate.getTime();
          }}
          timeIntervals={15}
          timeFormat='HH:mm'
          dateFormat='dd MMM yyyy, HH:mm'
          customInput={<OutlinedInput size='small' fullWidth />}
          shouldCloseOnSelect={false}
          popperModifiers={[
            {
              name: 'sameWidth',
              enabled: true,
              phase: 'beforeWrite',
              requires: ['computeStyles'],
              fn: ({ state }) => {
                state.styles.popper.width = `${state.rects.reference.width}px`;
              },
              effect: ({ state }) => {
                state.elements.popper.style.width = `${
                  state.elements.reference.offsetWidth
                }px`;
              }
            }
          ]}
        />
        <FormHelperText error>{error}</FormHelperText>
        <Button
          sx={{ mt: 1 }}
          onClick={() => {
            setValue(null);
            setIsPlanning(false);
          }}
          variant='outlined'
        >
          Cancel, start right now
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Typography mb={0.5}>Plan</Typography>
      {getContent()}
    </>
  );
}

export default PlanPicker;