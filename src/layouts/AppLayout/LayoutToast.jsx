import { useContext } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { globalContext } from '../../context/context';

function LayoutToast() {
  const { toast, hideToast } = useContext(globalContext);

  return (
    <Snackbar
      open={toast?.open}
      autoHideDuration={3000}
      onClose={hideToast}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={hideToast}
        severity={toast?.severity || 'info'}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {toast?.message || ''}
      </Alert>
    </Snackbar>
  );
}

export default LayoutToast;
