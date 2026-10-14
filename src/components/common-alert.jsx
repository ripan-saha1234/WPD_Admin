import { Alert, Snackbar } from "@mui/material";

const CommonAlert = ({ msg }) => {
  const messages = Array.isArray(msg) ? msg : [msg];
  const hasSuccessMessage = messages.some((m) =>
    typeof m === "string" && m.toLowerCase().includes("success")
  );
  const severity = hasSuccessMessage ? "success" : "error";

  return (
    <Snackbar
      open={messages.length > 0}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        severity={severity}
        variant="filled"
        sx={{
          borderRadius: "var(--radius)",
          fontWeight: 600,
          fontSize: "13.5px",
          minWidth: "280px",
          boxShadow: "var(--shadow-lg)",
          ...(severity === "success"
            ? {
                backgroundColor: "color-mix(in srgb, var(--success) 14%, var(--surface))",
                color: "var(--success-text)",
                border: "1px solid color-mix(in srgb, var(--success) 35%, transparent)",
                "& .MuiAlert-icon": { color: "var(--success)" }
              }
            : {
                backgroundColor: "color-mix(in srgb, var(--danger) 14%, var(--surface))",
                color: "var(--danger-text)",
                border: "1px solid color-mix(in srgb, var(--danger) 35%, transparent)",
                "& .MuiAlert-icon": { color: "var(--danger)" }
              })
        }}
      >
        {messages.length > 1 ? (
          <ul style={{ paddingLeft: "10px", margin: 0 }}>
            {messages.map((m) => (
              <li style={{ listStyleType: "none" }} key={m}>
                {m}
              </li>
            ))}
          </ul>
        ) : (
          messages[0]
        )}
      </Alert>
    </Snackbar>
  );
};

export default CommonAlert;