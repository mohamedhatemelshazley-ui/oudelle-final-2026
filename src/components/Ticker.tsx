export default function Ticker({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="ticker-wrap">
      <div className="ticker">{text}</div>
    </div>
  );
}
