/* eslint-disable default-case */
import React, { useState } from 'react';
import { Notifications } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { useAlert, usePopover } from '../../util/hooks';
import { useWsAction } from '../../ws/hooks';
import ACTIONS from '../../ws/actions';
import { links } from '../../pages/routing';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { STREAM_STATE } from '../../util/constants';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';


function VisitButton({ onClick, to }) {
  return (
    <Button
      onClick={onClick}
      component={Link}
      to={to}
      sx={{ color: 'success.contrastText' }}
    >
      Visit
    </Button>
  )
}

const ACTIONS_REP_LOGIC = {
  [ACTIONS.streamStateAck]: ({ video, state }) => {
    let message, to;
    switch (state) {
      case STREAM_STATE.crashed:
        message = <>Oops! <b>{video.name}</b> livestream crashed</>;
        break;
      case STREAM_STATE.cancelled:
        message = <><b>{video.author.username}</b> has cancelled the <b>{video.name}</b> livestream</>;
        break;
      case STREAM_STATE.started:
        message = <><b>{video.author.username}</b> has is now live with <b>{video.name}</b>!</>;
        to = links.videos.single.get(video.id);
        break;
      case STREAM_STATE.gracefullyEnded:
        message = <><b>{video.name}</b> livestream has ended</>;
    }
    return { message, to };
  },
  [ACTIONS.videoProcessedAck]: video => ({
    message: <>Finished processing {video.name}</>,
    to: links.videos.single.get(video.id)
  })
};

function Alerts() {
  const showAlert = useAlert();
  const [ntfList, setNtfList] = useState([]);
  const { triggerProps, popoverProps, closeMenu } = usePopover();

  function pushNtf(message, to) {
    setNtfList(curr => [...curr, { message, to, seen: false }]);
  }

  function seeNtf(idx) {
    if (ntfList[idx].seen) {
      return;
    }
    setNtfList(curr => {
      const newNtfList = [...curr];
      newNtfList[idx].seen = true;
      return newNtfList;
    });
  }

  function representAction(actionName, payload) {
    const { message, to } = ACTIONS_REP_LOGIC[actionName](payload);
    pushNtf(message, to);
    showAlert(message, 'success', props => <VisitButton to={to} {...props} />);
  }
  
  useWsAction(ACTIONS.videoProcessedAck, payload => representAction(ACTIONS.videoProcessedAck, payload));
  useWsAction(ACTIONS.streamStateAck, payload => representAction(ACTIONS.streamStateAck, payload));

  function getContent() {
    if (ntfList.length) {
      return ntfList.map((ntf, idx) =>
        <MenuItem
          onMouseEnter={() => seeNtf(idx)}
          sx={{
            boxShadow: theme => {
              const colour = theme.palette.secondary.light;
              return ntf.seen
                ? undefined
                : `${colour} 0px 7px 8px -4px inset, ${colour} 0px 12px 17px 2px inset, ${colour} 0px 5px 22px 4px inset`
            }
          }}
          component={Link}
          to={ntf.to}
          key={idx}
          onClick={closeMenu}
        >
          {ntf.message}
        </MenuItem>
      );
    }

    return <Typography py={2} px={3} color='text.secondary'>No notifications yet</Typography>;
  }

  return (
    <>
      <Badge badgeContent={ntfList.filter(ntf => !ntf.seen).length} color='secondary'>
        <IconButton {...triggerProps}>
          <Notifications />
        </IconButton>
      </Badge>

      <Menu
        sx={{ mt: 1 }}
        MenuListProps={{ sx: { width: 220, maxHeight: 250 } }}
        {...popoverProps}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
      >
        {getContent()}
      </Menu>
    </>
  );
}

export default Alerts;