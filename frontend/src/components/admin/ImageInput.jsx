import { useRef, useState } from 'react';
import { Link2, Upload, X } from 'lucide-react';

// Unified image input: admins can either upload a custom image (stored as
// base64 in the DB) or paste an image link (e.g. from Google Images) — the
// backend fetches it and stores it as base64 too. Existing /uploads/ paths
// pass straight through.
const ImageInput = ({ label = 'Image', value, onChange, currentHint }) => {
  const [mode, setMode] = useState(value && /^https?:|^data:|^\/uploads\//i.test(value) ? 'link' : 'upload');
  const [preview, setPreview] = useState(value && !/^https?:/i.test(value) ? value : (value || null));
  const fileRef = useRef(null);

  const pickFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    onChange({ file, link: '', remove: false });
  };

  const setLink = (link) => {
    setPreview(/^data:/i.test(link) ? link : null);
    onChange({ file: null, link, remove: false });
  };

  const clear = () => {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
    onChange({ file: null, link: '', remove: true });
  };

  return (
    <div>
      <label className="text-xs font-semibold text-brand-700">{label}</label>
      <div className="mt-1.5 flex gap-2">
        <button type="button" onClick={() => setMode('upload')}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${mode === 'upload' ? 'bg-brand-900 text-white' : 'border border-brand-300 text-brand-700 hover:border-accent-500'}`}>
          <Upload className="mr-1 inline h-3 w-3" /> Upload
        </button>
        <button type="button" onClick={() => setMode('link')}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${mode === 'link' ? 'bg-brand-900 text-white' : 'border border-brand-300 text-brand-700 hover:border-accent-500'}`}>
          <Link2 className="mr-1 inline h-3 w-3" /> Image link
        </button>
      </div>

      {mode === 'upload' ? (
        <input ref={fileRef} type="file" accept="image/*" onChange={(e) => pickFile(e.target.files[0])}
          className="mt-2 w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold" />
      ) : (
        <div className="mt-2">
          <input type="url" placeholder="https://... (paste a Google image link)"
            defaultValue={/^https?:/i.test(value || '') ? value : ''}
            onChange={(e) => setLink(e.target.value)}
            className="w-full rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-2 text-sm outline-none focus:border-accent-500" />
          <p className="mt-1 text-[10px] text-brand-400">Paste any image URL — we fetch it and store a copy in the database.</p>
        </div>
      )}

      {preview && (
        <div className="mt-2 flex items-center gap-3">
          <img src={preview} alt="" className="h-16 w-24 rounded-xl border border-brand-200 object-cover" />
          <button type="button" onClick={clear}
            className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700">
            <X className="h-3 w-3" /> Remove
          </button>
        </div>
      )}
      {currentHint && <p className="mt-1 text-[10px] text-brand-400">{currentHint}</p>}
    </div>
  );
};

export default ImageInput;
