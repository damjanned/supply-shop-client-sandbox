import React, { useRef, useState } from "react";
import Upload from "../Icons/Upload";

type Props = {
  name?: string;
  accept?: string;
  onChange?: (filename?: string) => void;
};

export default function FileUpload({ name, accept, onChange }: Props) {
  const [filename, setFilename] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  function openFileExplorer() {
    inputRef.current?.click();
  }

  function fileChanged(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files?.length) {
      const fileName = files[0].name;
      setFilename(fileName);
      if (onChange) {
        onChange(fileName);
      }
    }
  }

  function preventDefault(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragEnter(e: React.DragEvent) {
    preventDefault(e);
    setIsDragging(true);
  }

  function handleDragOver(e: React.DragEvent) {
    preventDefault(e);
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    preventDefault(e);
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    preventDefault(e);
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files?.length) {
      const file = files[0];
      const allowed = (() => {
        if (!accept || !accept.trim()) return true;
        const list = accept
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (!list.length) return true;

        return list.some((token) => {
          if (token.startsWith(".")) {
            return file.name.toLowerCase().endsWith(token.toLowerCase());
          }
          if (token.endsWith("/*")) {
            const prefix = token.slice(0, -1);
            return Boolean(file.type) && file.type.startsWith(prefix);
          }
          return Boolean(file.type) && file.type === token;
        });
      })();

      if (!allowed) {
        alert("File type not supported");
        return;
      }
      setFilename(file.name);

      if (inputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        inputRef.current.files = dt.files;
        inputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }

  return (
    <>
      <div
        className={`border-2 border-dashed p-5 flex border-primary rounded-pova-lg gap-x-2.5 items-center cursor-pointer ${
          isDragging ? "opacity-50" : "opacity-100"
        }`}
        onClick={openFileExplorer}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload />
        {filename ? (
          <div className="text-sm font-bold">{filename}</div>
        ) : (
          <div>
            <div className="text-sm font-bold">Upload Document</div>
            <div className="text-[0.625rem] font-light">
              Click Here or Drag item to this area to upload.
            </div>
          </div>
        )}
      </div>
      <input
        type="file"
        hidden
        ref={inputRef}
        name={name}
        accept={accept}
        onChange={fileChanged}
      />
    </>
  );
}
