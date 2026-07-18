import "./whatsappFloat.css";

const WHATSAPP_NUMERO = import.meta.env.VITE_WHATSAPP_NUMERO || "";

export default function WhatsAppFloat() {
  if (!WHATSAPP_NUMERO) return null;

  const mensaje = encodeURIComponent("Hola Zazu Shop, tengo una consulta sobre una pieza.");

  return (
    <a
      className="zz-wa-float"
      href={`https://wa.me/${WHATSAPP_NUMERO}?text=${mensaje}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Escríbenos por WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.36a9.86 9.86 0 0 0 4.62 1.16h.01c5.46 0 9.9-4.45 9.9-9.9C21.95 6.45 17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.36-.5.06-1.02.26-3.43-.72-2.9-1.18-4.77-4.14-4.92-4.34-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.2-.15.31-.3.48-.14.17-.3.38-.43.51-.14.14-.29.29-.13.57.17.29.75 1.24 1.61 2.01 1.11 1 2.05 1.31 2.34 1.46.29.14.46.12.63-.07.17-.19.71-.83.9-1.11.19-.29.38-.24.63-.15.26.1 1.65.78 1.93.92.29.14.48.21.55.33.07.12.07.68-.17 1.36Z" />
      </svg>
    </a>
  );
}