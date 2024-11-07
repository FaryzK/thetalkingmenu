import React, { useRef } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function QRCode() {
  const { restaurantId } = useParams();
  const qrRef = useRef();

  const qrUrl = `${window.location.origin}/restaurant/${restaurantId}/chat`;

  const downloadQRCode = async () => {
    const canvas = await html2canvas(qrRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 180, 180);
    pdf.save("QRCode.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Share AI Chat</h2>
      <p className="text-gray-500 mb-2">
        Scan the QR code below to start a chat with {restaurantId}!
      </p>

      {/* Clickable URL */}
      <a
        href={qrUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline mb-4"
      >
        Open Chat in New Tab
      </a>

      <div ref={qrRef} className="bg-white p-6 rounded-lg shadow-md">
        <QRCodeSVG value={qrUrl} size={256} />
      </div>
      <button
        onClick={downloadQRCode}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Download QR Code as PDF
      </button>
    </div>
  );
}
