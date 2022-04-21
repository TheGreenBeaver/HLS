import React from 'react';
import { useField } from 'formik';
import { OutlinedInput } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { Search } from '@mui/icons-material';
import { Q } from '../../util/constants';
import Box from '@mui/material/Box';


function AsField() {
  const [, { value }, { setValue}] = useField(Q);

  return (
    <Box width='100%' display='flex' justifyContent='center'>
      <OutlinedInput
        size='small'
        value={value}
        onChange={e => setValue(e.target.value)}
        fullWidth
        sx={{ mb: 2, maxWidth: 600 }}
        endAdornment={
          <InputAdornment position='end'>
            <IconButton type='submit'>
              <Search />
            </IconButton>
          </InputAdornment>
        }
        placeholder='Search...'
      />
    </Box>
  );
}

export default AsField;