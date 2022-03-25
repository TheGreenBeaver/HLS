import React, { useEffect, useRef, useState } from 'react';
import { func, bool } from 'prop-types';
import IconButton from '@mui/material/IconButton';
import { startCase } from 'lodash';
import { Check, ChevronLeft, ChevronRight, DisplaySettings, Settings, SlowMotionVideo } from '@mui/icons-material';
import Popover from '@mui/material/Popover';
import Slide from '@mui/material/Slide';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { AUTO_LEVEL, VIDEO_DATA_SHAPE } from '../util';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';


const MAIN = 'main';
const SECTIONS = [
  {
    icon: <SlowMotionVideo />,
    name: 'playbackRate',
    getTitle: option => option === 1 ? 'Normal' : `x${option}`,
    isSelected: (val, option) => val === option
  },
  {
    icon: <DisplaySettings />,
    name: 'quality',
    getTitle: (option) => {
      if (option === AUTO_LEVEL) {
        return 'Auto';
      }

      if (option.isAutoLevel) {
        return  `Auto ${option.height}p`
      }

      return `${option.height}p`;
    },
    isSelected: (val, option) => option === AUTO_LEVEL
      ? val.isAutoLevel
      : val.height === option.height && !val.isAutoLevel
  }
];
const MENU_WIDTH = 250;
const MENU_MAX_HEIGHT = 380;
const HR_SIZE = 0.000003;

function getSectionHeight(theme, section) {
  const withHeader = section.name !== MAIN;
  const itemsAmt = section.items.length;

  const gutters = theme.spacing(2);
  const { lineHeight } = theme.typography.body1;
  const itemHeight = `${theme.spacing(0.75 * 2)} + ${lineHeight}rem`;

  let headerHeight = '';
  if (withHeader) {
    headerHeight = ` + ${HR_SIZE}px + ${gutters} + ${itemHeight}`;
  }

  return `calc(${gutters}${headerHeight} + (${itemHeight}) * ${itemsAmt})`;
}


function PlaybackSettings({ open, setOpen, scheduleControlsHide, ...props }) {
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
    ...SECTIONS.map(({ name, getTitle, isSelected }) => ({
      name,
      items: props[name].available.map(option => ({
        title: getTitle(option),
        onClick: () => props[name].set(option),
        icon: isSelected(props[name].val, option) && <Check />
      }))
    }))
  ];

  useEffect(() => {
    if (!open) {
      setCurrentSectionName(MAIN);
      scheduleControlsHide(true);
    }
  }, [open]);

  useEffect(() => {
    const listener = e => {
      if (
        menuContainerRef.current && !menuContainerRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('click', listener);
    }

    return () => {
      document.removeEventListener('click', listener);
    };
  }, [open]);

  function getSectionContent(section) {
    const itemsList = section.items.map(item =>
      <MenuItem onClick={item.onClick} key={item.title}>
        <ListItemIcon>
          {item.icon}
        </ListItemIcon>
        <ListItemText>
          {item.title}
        </ListItemText>
        {item.extra}
      </MenuItem>
    );
    if (section.name !== MAIN) {
      itemsList.unshift(
        <MenuItem onClick={() => setCurrentSectionName(MAIN)} key='back'>
          <ListItemIcon>
            <ChevronLeft />
          </ListItemIcon>
          <ListItemText>
            {startCase(section.name)}
          </ListItemText>
        </MenuItem>,
        <Divider key='divider' />
      );
    }

    return itemsList;
  }

  const currentSection = sections.find(s => s.name === currentSectionName);

  return (
    <>
      <Popover
        disablePortal
        open={open}
        onClose={() => setOpen(false)}
        anchorEl={buttonRef.current}
        disableScrollLock
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        sx={{ pointerEvents: 'none' }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        PaperProps={{
          sx: {
            height: MENU_MAX_HEIGHT,
            width: MENU_WIDTH,
            background: 'transparent'
          },
        }}
      >
        <Paper
          ref={menuContainerRef}
          sx={{
            position: 'absolute',
            width: MENU_WIDTH,
            left: 0,
            bottom: 0,
            height: theme => getSectionHeight(theme, currentSection),
            transition: theme => theme.transitions.create('height'),
            overflow: 'hidden'
          }}
        >
          {
            sections.map(section =>
              <Slide
                appear={false}
                key={section.name}
                container={menuContainerRef.current}
                direction={section.name === MAIN ? 'right' : 'left'}
                in={currentSectionName === section.name}
              >
                <MenuList
                  sx={{ pointerEvents: 'all', position: 'absolute', left: 0, width: MENU_WIDTH }}
                >
                  {getSectionContent(section)}
                </MenuList>
              </Slide>
            )
          }
        </Paper>
      </Popover>

      <IconButton
        color='primary'
        ref={buttonRef}
        onClick={() => setOpen(curr => !curr)}
      >
        <Settings fontSize='large' />
      </IconButton>
    </>
  );
}

PlaybackSettings.propTypes = {
  playbackRate: VIDEO_DATA_SHAPE.isRequired,
  quality: VIDEO_DATA_SHAPE.isRequired,
  setOpen: func.isRequired,
  open: bool.isRequired,
  scheduleControlsHide: func.isRequired
};

export default PlaybackSettings;