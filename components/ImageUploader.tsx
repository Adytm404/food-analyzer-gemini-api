
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CameraIcon, UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageSelect: (file: File, previewUrl: string) => void;
  currentPreviewUrl?: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, currentPreviewUrl }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentPreviewUrl || null);
  }, [currentPreviewUrl]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear input
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File is too large. Maximum 5MB.');
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear input
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageSelect(file, result);
      };
      reader.readAsDataURL(file);
    }
    // Clear the file input's value to allow re-selecting the same file to trigger onChange
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }, [onImageSelect]);

  const handleTakePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleUploadGalleryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleChangePhotoClick = () => {
    setPreview(null); // Clear local preview, parent will be updated on new selection
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
    // To immediately clear parent state, you might call onImageSelect with nulls,
    // but current design updates parent only on new successful selection.
  };

  return (
    <div className="w-full flex flex-col items-center">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div 
        className="w-full aspect-video bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 overflow-hidden"
        aria-label="Image preview area"
      >
        {preview ? (
          <img src={preview} alt="Selected food" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-4">
            <CameraIcon className="w-16 h-16 mb-3 text-slate-400" />
            <p className="font-medium text-slate-600">Food photo will appear here</p>
            <p className="text-xs text-slate-400 mt-1">Max 5MB. JPG, PNG, WebP, GIF.</p>
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600 text-center">{error}</p>}

      {preview ? (
        <button
          onClick={handleChangePhotoClick}
          className="mt-4 w-full flex items-center justify-center px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Change selected photo"
        >
          Change Photo
        </button>
      ) : (
        <div className="mt-4 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleTakePhotoClick}
            className="flex items-center justify-center w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            aria-label="Take photo with camera"
          >
            <CameraIcon className="w-5 h-5 mr-2" />
            Take Photo
          </button>
          <button
            onClick={handleUploadGalleryClick}
            className="flex items-center justify-center w-full px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            aria-label="Upload photo from gallery"
          >
            <UploadIcon className="w-5 h-5 mr-2" />
            Upload from Gallery
          </button>
        </div>
      )}
    </div>
  );
};
