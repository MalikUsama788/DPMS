// src/components/WebcamCapture.js
"use client";

import React, { useRef, useState, useEffect } from "react";

export default function WebcamCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const thumbCanvasRef = useRef(null);
  const [error, setError] = useState("");
  const [facingMode, setFacingMode] = useState("user");
  const [isCameraOn, setIsCameraOn] = useState(false);

  useEffect(() => {
    if (isCameraOn) startCamera();
    return () => stopCamera();
  }, [facingMode, isCameraOn]);

  // Camera On
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Unable to access camera: " + err.message);
    }
  };

  // Camera Off
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Capture Image
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const fullImageFile = new File([blob], `webcam_${Date.now()}.png`, { type: "image/png" });

      // Create thumbnail
      const thumbCanvas = thumbCanvasRef.current;
      const thumbWidth = 200;
      const thumbHeight = (video.videoHeight / video.videoWidth) * thumbWidth;
      thumbCanvas.width = thumbWidth;
      thumbCanvas.height = thumbHeight;
      const tctx = thumbCanvas.getContext("2d");
      tctx.drawImage(video, 0, 0, thumbWidth, thumbHeight);

      thumbCanvas.toBlob((thumbBlob) => {
        if (!thumbBlob) return;
        const thumbFile = new File([thumbBlob], `thumbnail_${Date.now()}.png`, { type: "image/png" });

        // Pass both files to parent (page)
        if (onCapture) {
          onCapture({ original: fullImageFile, thumbnail: thumbFile });
        }
      }, "image/png");
    }, "image/png");
  };

  // Toggle Camera (facing mode)
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div className="rounded-lg bg-gray-50 mb-2">
      {error && <p className="text-red-500">{error}</p>}

      {isCameraOn ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="rounded-xl border shadow-lg w-full max-w-md"
          />
          <canvas ref={canvasRef} className="hidden" />
          <canvas ref={thumbCanvasRef} className="hidden" />
          
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={captureImage}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Capture
            </button>

            {/* <button
              type="button"
              onClick={toggleCamera}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Switch Camera
            </button> */}

            <button
              type="button"
              onClick={() => {
                stopCamera();
                setIsCameraOn(false);
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Stop
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setIsCameraOn(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          Start Camera
        </button>
      )}
    </div>
  );
}
