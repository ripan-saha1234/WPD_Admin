import { Dialog, DialogContent, DialogTitle, Grid, IconButton } from "@mui/material";
import '../css/common-display-dialog.css';
import CommonButton from "./common-button";
import CommonToggleSwitch from "./common-toggle-switch";

function CommonDisplayDialog({
  open,
  setOpen,
  title,
  formSection,
}) {

  const renderSection = (section) => {
    switch (section.type) {
      case "straight text":
        return (
          <Grid item xs={12} key={section.id} style={{ width: "100%" }}>
            <div className="common-display-dialog-straight-text-container" key={section.id}>
              <span>{section.title} : </span> {section.content}
            </div>
          </Grid>
        )
      case "seperate line text":
        return (
          <Grid item xs={12} key={section.id} style={{ width: "100%" }}>
            <div className="common-display-dialog-seperate-line-text-container" key={section.id}>
              <h1>{section.title}</h1>
              <p>{section.content}</p>
            </div>
          </Grid>
        )
      case "link":
        return (
          <Grid item xs={12} key={section.id} style={{ width: "100%" }}>
            <div className="common-display-dialog-straight-text-container" key={section.id}>
              <span>{section.title} : </span> 
              <a href={section.content} target="_blank" rel="noopener noreferrer" style={{ color: '#6600CC', wordBreak: 'break-all' }}>
                {section.content}
              </a>
            </div>
          </Grid>
        )
      
      case "attached documents":
        return (
          <CommonButton
            text={section.title}
            img={section.img}
            backgroundColor={section.backgroundColor}
            color={section.color}
            borderColor={section.borderColor}
            onClick={section.onClick || (() => {})}
            className={section.className}
            disabled={section.disabled}
          />
        )
      case "toggle switch":
        return (
          <Grid item xs={12} key={section.id} style={{ width: "100%" }}>
            <div 
              className="common-display-dialog-toggle-switch-container" 
              key={section.id}
              style={{ 
                justifyContent: section.align === "right" ? "flex-end" : "flex-start" 
              }}
            >
              {section.title && <span>{section.title}</span>}
              <CommonToggleSwitch
                checked={section.checked || false}
                onChange={(checked, event) => {
                  if (section.onClick) {
                    section.onClick(checked, event);
                  }
                }}
                disabled={section.disabled || false}
              />
            </div>
          </Grid>
        )
      default:
        return null;
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false)
      }}
      maxWidth="sm"
      fullWidth={true}
      className="dialog-container"
      PaperProps={{
        style: {
          borderRadius: '1rem',
          padding: '1%',
        }
      }}
    >
      <DialogTitle>
        <span className='dialog-title'>{title}</span>
        <IconButton
          aria-label="close"
          onClick={() => {
            setOpen(false)
          }}
          sx={{
            position: 'absolute',
            right: 15,
            top: 15,
          }}
        >
          <img src="/cross-icon.svg" alt="" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 3, pt: 2 }} style={{
        overflowX: 'hidden',
      }}>
        <Grid
          container
          spacing={2}
          sx={{
            width: '100%',
            margin: 0,
            display: 'flex',
            flexWrap: 'wrap',
            '& .MuiGrid-item': {
              paddingLeft: '8px',
              paddingTop: '8px'
            }
          }}>
          {formSection?.map(section => renderSection(section))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

export default CommonDisplayDialog;