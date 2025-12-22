import { useEffect, useRef } from 'preact/hooks';

interface Props {
  slot: string;
  format?: 'auto' | 'rectangle' | 'vertical';
}

export default function AdUnit({ slot, format = 'vertical' }: Props) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <ins
      class="adsbygoogle"
      style={{
        display: 'block',
        width: '160px',
        height: '600px',
      }}
      data-ad-client="ca-pub-9282727224828020"
      data-ad-slot={slot}
      data-ad-format={format}
    />
  );
}
