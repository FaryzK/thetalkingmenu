import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Spinner, Button } from "flowbite-react";
import { FiArrowLeft } from "react-icons/fi";

export default function QRCode() {
  const { restaurantId, dashboardId } = useParams();
  const qrRef = useRef();
  const [tableNumber, setTableNumber] = useState("");
  const [qrSize, setQrSize] = useState(256); // Adjustable QR code size
  const [isDownloading, setIsDownloading] = useState(false); // Loading state

  const navigate = useNavigate();

  const qrUrl = `${window.location.origin}/restaurant/${restaurantId}/chat/${
    tableNumber || "default"
  }`;

  const downloadQRCode = async () => {
    try {
      setIsDownloading(true);
      const canvas = await html2canvas(qrRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 180, 180);
      pdf.save(`QRCode_Table_${tableNumber || "default"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const validateInput = (value) => {
    if (/^[a-zA-Z0-9]*$/.test(value)) {
      setTableNumber(value);
    } else {
      alert("Table number must contain only alphanumeric characters.");
    }
  };

  return (
    <div className="bg-gray-100 p-6">
      {/* Back Button */}
      <button
        onClick={() =>
          navigate(`/dashboards/${dashboardId}/restaurant/${restaurantId}`)
        }
        className="mb-4 flex items-center text-blue-500 hover:underline"
      >
        <FiArrowLeft className="mr-2" />
        Back to Dashboard
      </button>

      <div className="flex flex-col items-center">
        {/* Page Title */}
        <h2 className="text-2xl font-bold mb-4">Share AI Chat</h2>
        <p className="text-gray-500 mb-4">
          Generate a QR code for table-specific chats.
        </p>

        {/* Input Section */}
        <input
          type="text"
          value={tableNumber}
          onChange={(e) => validateInput(e.target.value)}
          placeholder="Enter Table Number"
          className="p-2 border rounded mb-4 w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* QR Code Section */}
        <div
          ref={qrRef}
          className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center"
        >
          <QRCodeSVG
            value={qrUrl}
            size={qrSize}
            includeMargin
            style={{ margin: "auto" }}
          />
          <p className="text-lg font-bold text-center text-gray-700 mt-2">
            Recommendation Chatbot
            {tableNumber !== "" && ` (Table: ${tableNumber || "Default"})`}
          </p>
        </div>

        {/* QR Code Size Adjustment */}
        <div className="mt-4 flex items-center space-x-4">
          <label htmlFor="qr-size" className="text-sm font-semibold">
            QR Code Size:
          </label>
          <input
            type="range"
            id="qr-size"
            min="128"
            max="512"
            value={qrSize}
            onChange={(e) => setQrSize(Number(e.target.value))}
            className="slider"
          />
          <span className="text-sm">{qrSize}px</span>
        </div>

        {/* Download Button with Spinner */}
        <Button
          onClick={downloadQRCode}
          color="blue"
          disabled={isDownloading}
          className="mt-4 flex items-center"
        >
          {isDownloading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Generating...
            </>
          ) : (
            "Download QR Code"
          )}
        </Button>
      </div>
    </div>
  );
}
