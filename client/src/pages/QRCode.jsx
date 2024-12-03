import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function QRCode() {
  const { restaurantId } = useParams();
  const qrRef = useRef();
  const [tableNumber, setTableNumber] = useState("");

  const qrUrl = `${window.location.origin}/restaurant/${restaurantId}/chat/${
    tableNumber || "default"
  }`;

  const downloadQRCode = async () => {
    const canvas = await html2canvas(qrRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 180, 180);
    pdf.save(`QRCode_Table_${tableNumber || "default"}.pdf`);
  };

  return (
    <div className=" bg-gray-100 p-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Share AI Chat</h2>
      <p className="text-gray-500 mb-2">
        Generate a QR code for table-specific chats.
      </p>

      <input
        type="text"
        value={tableNumber}
        onChange={(e) => setTableNumber(e.target.value)}
        placeholder="Enter Table Number"
        className="p-2 border rounded mb-4"
      />

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
        <QRCodeSVG
          value={qrUrl}
          size={256}
          includeMargin
          style={{ margin: "auto" }}
        />
        <p className="text-center text-gray-700 mt-2">
          Scan me! (Table: {tableNumber || "Default"})
        </p>
      </div>
      <button
        onClick={downloadQRCode}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Download QR Code
      </button>
    </div>
  );
}
