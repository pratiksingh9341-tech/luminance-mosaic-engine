
import React from 'react';

interface ImageUploaderProps {
  label: string;
  image: string | null;
  onUpload: (url: string) => void;
  id: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onUpload, id }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpload(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      <div 
        className={`relative aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
          ${image ? 'border-indigo-500 bg-slate-800' : 'border-slate-700 hover:border-indigo-400 bg-slate-900'}`}
        onClick={() => document.getElementById(id)?.click()}
      >
        {image ? (
          <img src={image} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs font-medium">Click to upload</span>
          </div>
        )}
        <input 
          id={id}
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
      </div>
    </div>
  );
};

export default ImageUploader;
