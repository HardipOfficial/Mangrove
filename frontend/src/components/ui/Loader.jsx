export default function Loader({ fullPage = false }) {
  if (fullPage) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }
  return (
    <div className="loader-container">
      <div className="spinner" />
    </div>
  );
}
