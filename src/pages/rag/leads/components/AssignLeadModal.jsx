import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CommonButton from '../../../../components/common-button';
import CommonSelect from '../../../../components/common-select';
import { BDM_OPTIONS } from '../../mock/leadsMockData';
import { useEffect, useState } from 'react';

function AssignLeadModal({ open, lead, onClose, onAssign }) {
  const [bdmId, setBdmId] = useState(lead?.assignedTo || '');

  useEffect(() => {
    if (open) setBdmId(lead?.assignedTo || '');
  }, [open, lead]);

  const bdmOptions = BDM_OPTIONS.map((bdm) => ({
    label: bdm.name,
    value: bdm.id,
  }));

  const handleAssign = () => {
    if (!bdmId) return;
    onAssign(lead.id, bdmId);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Lead to BDM</DialogTitle>
      <DialogContent>
        {lead && (
          <div className="assign-modal-body">
            <p className="rag-muted">
              Assigning <strong>{lead.name}</strong> ({lead.id})
            </p>
            <CommonSelect
              label="Business Development Manager"
              name="bdm"
              options={bdmOptions}
              value={bdmId}
              onChange={(e) => setBdmId(e.target.value)}
              placeholder="Select a BDM"
            />
          </div>
        )}
      </DialogContent>
      <DialogActions className="rag-confirm-actions">
        <CommonButton
          text="Cancel"
          onClick={onClose}
          backgroundColor="#fff"
          color="#0d0d0d"
          borderColor="#e8e8e8"
        />
        <CommonButton
          text="Assign Lead"
          onClick={handleAssign}
          disabled={!bdmId}
          backgroundColor="#0690fd"
          color="#fff"
          borderColor="#0690fd"
        />
      </DialogActions>
    </Dialog>
  );
}

export default AssignLeadModal;
