import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import ws from '../../../ws';
import ACTIONS from '../../../ws/actions';
import { useHistory } from 'react-router-dom';
import { links } from '../../../pages/routing';
import { PLANNED_STREAM_KEY } from '../../../util/constants';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useWsAction } from '../../../ws/hooks';
import { useAlert } from '../../../util/hooks';


function ConfirmPlanModal() {
  const [open, setOpen] = useState(false);
  const [streamData, setStreamData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const showAlert = useAlert();
  const history = useHistory();

  useWsAction(ACTIONS.streamPlannedReminder, payload => {
    setStreamData(payload);
    setOpen(true);
  });

  function sendAnswer(willStream) {
    setProcessing(true);
    ws
      .request(ACTIONS.confirmPlan, { willStream, id: streamData.id })
      .then(({ payload: { willStream: serverConfirmation } }) => {
        setProcessing(false);
        setOpen(false);
        if (!serverConfirmation) {
          showAlert(`${streamData.name} livestream cancelled`);
        } else {
          history.push(links.videos.goLive.path, { [PLANNED_STREAM_KEY]: streamData.id });
        }
      })
  }

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      maxWidth='xs'
      fullWidth
    >
      <DialogTitle>
        Planned stream reminder
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          You've planned a <b>{streamData?.name}</b> livestream for now. Are you willing to actually go live?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={processing}
          variant='outlined'
          onClick={() => sendAnswer(false)}
        >
          Cancel livestream
        </Button>
        <Button
          disabled={processing}
          variant='contained'
          onClick={() => sendAnswer(true)}
        >
          Go live
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmPlanModal;