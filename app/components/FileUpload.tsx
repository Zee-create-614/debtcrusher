"use client";

import { useState, useCallback } from "react";

interface FileUploadProps {
  onFile: (file: File) => void;
}

export default function FileUpload({ onFile }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      onFile(file);
    }
  }, [onFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFile(file);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
        dragActive ? 'border-crusher-blue bg-crusher-blue/10' : 'border-slate-700 hover:border-slate-500'
      }`}
    >
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {fileName ? (
        <div>
          <span className="text-4xl block mb-3">📄</span>
          <p className="text-white font-semibold">{fileName}</p>
          <p className="text-slate-400 text-sm mt-1">Click or drop to replace</p>
        </div>
      ) : (
        <div>
          <span className="text-4xl block mb-3">📤</span>
          <p className="text-white font-semibold mb-1">Drop your bill here</p>
          <p className="text-slate-400 text-sm">PDF, photo, or screenshot • Max 10MB</p>
        </div>
      )}
    </div>
  );
}
