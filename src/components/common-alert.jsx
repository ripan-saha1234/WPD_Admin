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
          borderRadius: "10px",
          fontWeight: 600,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          ...(severity === "success"
            ? {
                backgroundColor: "#E6F4EA",
                color: "#1E4620"
              }
            : {
                backgroundColor: "#FDE8E8",
                color: "#7A1C1C"
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