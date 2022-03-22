import React, { useEffect, useRef, useState } from 'react';
import { func, bool } from 'prop-types';
import IconButton from '@mui/material/IconButton';
import { startCase } from 'lodash';
import { Check, ChevronLeft, ChevronRight, DisplaySettings, Settings, SlowMotionVideo } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import Slide from '@mui/material/Slide';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { AUTO_LEVEL, VIDEO_DATA_SHAPE } from '../util';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';


const MAIN = 'main';
const SECTIONS = [
  {
    icon: <SlowMotionVideo />,
    name: 'playbackRate',
    getTitle: option => option === 1 ? 'Normal' : `x${option}`
  },
  {
    icon: <DisplaySettings />,
    name: 'quality',
    getTitle: (option) => option === AUTO_LEVEL ? 'Auto' : `${option.height}p`
  }
];

function Playback({ open, setOpen, scheduleControlsHide, ...props }) {
  const [currentSectionName, setCurrentSectionName] = useState(MAIN);

  const buttonRef = useRef(null);
  const menuContainerRef = useRef(null);

  const sections = [
    {
      name: MAIN,
      items: SECTIONS.map(({ name, icon, getTitle }) => ({
        title: startCase(name),
        onClick: () => setCurrentSectionName(name),
        icon,
        extra:
          <Box display='flex' alignItems='center'>
            <Typography variant='caption'>{getTitle(props[name].val)}</Typography>
            <ChevronRight sx={{ ml: 0.5 }} />
          </Box>
      }))
    },
    ...SECTIONS.map(({ name, getTitle }) => ({
      name,
      items: props[name].available.map(option => ({
        title: getTitle(option),
        onClick: () => props[name].set(option),
        icon: props[name].val === option && <Check />
      }))
    }))
  ];

  function closeMenu() {
    setOpen(false);
    setCurrentSectionName(MAIN);
    scheduleControlsHide(true);
  }

  useEffect(() => {
    const listener = e => {
      if (
        menuContainerRef.current && !menuContainerRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    };

    if (open) {
      document.addEventListener('click', listener);
    }

    return () => {
      document.removeEventListener('click', listener);
    };
  }, [open]);

  return (
    <>
      <Menu
        open={open}
        onClose={closeMenu}
        anchorEl={buttonRef.current}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        sx={{ mb: 1, pointerEvents: 'none' }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        MenuListProps={{
          ref: menuContainerRef,
          sx: { pointerEvents: 'all' }
        }}
      >
        {
          sections.map(section =>
            <Slide
              key={section.name}
              container={menuContainerRef.current}
              direction='left'
              in={currentSectionName === section.name}
            >
              <Box display={currentSectionName === section.name ? null : 'none'} width={250}>
                {
                  section.name !== MAIN &&
                  <>
                    <MenuItem onClick={() => setCurrentSectionName(MAIN)}>
                      <ListItemIcon>
                        <ChevronLeft />
                      </ListItemIcon>
                      <ListItemText>
                        {startCase(section.name)}
                      </ListItemText>
                    </MenuItem>
                    <Divider />
                  </>
                }
                {
                  section.items.map(item =>
                    <MenuItem onClick={item.onClick} key={item.title}>
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText>
                        {item.title}
                      </ListItemText>
                      {item.extra}
                    </MenuItem>
                  )
                }
              </Box>
            </Slide>
          )
        }
      </Menu>

      <IconButton
        color='primary'
        ref={buttonRef}
        onClick={() => setOpen(curr => !curr)}
      >
        <Settings />
      </IconButton>
    </>
  );
}

Playback.propTypes = {
  playbackRate: VIDEO_DATA_SHAPE.isRequired,
  quality: VIDEO_DATA_SHAPE.isRequired,
  setOpen: func.isRequired,
  open: bool.isRequired,
  scheduleControlsHide: func.isRequired
};

export default Playback;