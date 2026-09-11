import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CommonButton from '../../../components/common-button';

function ConfirmDialog({
  open,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <p className="rag-confirm-message">{message}</p>
      </DialogContent>
      <DialogActions className="rag-confirm-actions">
        <CommonButton
          text={cancelText}
          onClick={onCancel}
          disabled={loading}
          backgroundColor="#fff"
          color="#0d0d0d"
          borderColor="#e8e8e8"
        />
        <CommonButton
          text={loading ? 'Please wait...' : confirmText}
          onClick={onConfirm}
          disabled={loading}
          backgroundColor="#ef4444"
          color="#fff"
          borderColor="#ef4444"
        />
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
