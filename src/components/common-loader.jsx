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
        color="#0690fd"
        loading={true}
        size={size}
      />
      <p style={{ fontSize: '24px', fontWeight: '500' }}>{text}</p>
    </div>
  );
}

export default CommonLoader;