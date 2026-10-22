export default function ErrorBox({ message, error, onRetry }) {
  return (
    <div className="error-box">
      <p>{message}{error ? `: ${error.message}` : ''}</p>
      {onRetry && <button className="btn-primary" onClick={onRetry}>Coba Lagi</button>}
    </div>
  );
}
