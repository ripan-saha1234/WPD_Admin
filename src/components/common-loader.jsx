import { GridLoader } from "react-spinners";

function CommonLoader({ text = 'Loading...' ,size = 20}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      height: '100%',
      width: '100%',
    }}>
      <GridLoader
        color="var(--primary)"
        loading={true}
        size={size}
      />
      <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-2)', margin: '6px 0 0' }}>{text}</p>
    </div>
  );
}

export default CommonLoader;