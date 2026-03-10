'use client';

import { useState, useRef, useCallback } from 'react';
import {
  X, Upload, FileJson, FileSpreadsheet, FileText,
  Download, CheckCircle, AlertCircle, Loader2, CloudUpload,
} from 'lucide-react';
import { uploadMultipleCollections, downloadCollectionSample } from '@/services/brand-collection.service';
import type { CollectionImportResult } from '@/services/brand-collection.service';

interface CollectionBulkUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';
type SampleFormat = 'json' | 'csv' | 'excel';

const ACCEPTED_EXTENSIONS = '.json,.csv,.xlsx,.xls';

export default function CollectionBulkUploadModal({ onClose, onSuccess }: CollectionBulkUploadModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [result, setResult] = useState<CollectionImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadingFormat, setDownloadingFormat] = useState<SampleFormat | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValidFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    return ['json', 'csv', 'xlsx', 'xls'].includes(ext ?? '');
  };

  const handleFile = useCallback((file: File) => {
    if (!isValidFile(file)) {
      setErrorMessage('Invalid file type. Please upload a .json, .csv, .xlsx or .xls file.');
      return;
    }
    setSelectedFile(file);
    setErrorMessage(null);
    setUploadState('idle');
    setResult(null);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadState('uploading');
    setErrorMessage(null);
    try {
      const res = await uploadMultipleCollections(selectedFile);
      setResult(res);
      setUploadState('success');
      onSuccess();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setUploadState('error');
    }
  };

  const handleDownloadSample = async (format: SampleFormat) => {
    setDownloadingFormat(format);
    try {
      await downloadCollectionSample(format);
    } catch {
      // silently ignore
    } finally {
      setDownloadingFormat(null);
    }
  };

  const getFileIcon = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'json') return <FileJson size={20} className="text-gold-muted" />;
    if (ext === 'csv') return <FileText size={20} className="text-info" />;
    return <FileSpreadsheet size={20} className="text-success" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-noir/50 p-4">
      <div className="bg-white w-full max-w-xl border border-sand shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-sand/50">
          <div>
            <h2 className="font-display text-base text-charcoal-deep tracking-wide">Bulk Import Collections</h2>
            <p className="text-xs text-stone mt-0.5">Upload multiple collections at once via JSON, CSV, or Excel</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-taupe hover:text-charcoal-deep transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Drop Zone */}
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-gold-muted bg-gold-soft/5'
                : selectedFile
                ? 'border-sand bg-parchment/40'
                : 'border-sand/60 hover:border-sand hover:bg-parchment/20'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              onChange={onFileChange}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-parchment flex items-center justify-center">
                  {getFileIcon(selectedFile)}
                </div>
                <p className="text-sm font-medium text-charcoal-deep">{selectedFile.name}</p>
                <p className="text-xs text-taupe">{formatBytes(selectedFile.size)}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setUploadState('idle');
                    setResult(null);
                    setErrorMessage(null);
                  }}
                  className="text-xs text-stone hover:text-red-500 underline transition-colors mt-1"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <CloudUpload size={32} className="text-taupe/50" />
                <div>
                  <p className="text-sm text-charcoal-deep">
                    <span className="font-medium">Click to upload</span> or drag &amp; drop
                  </p>
                  <p className="text-xs text-taupe mt-1">Supports .json, .csv, .xlsx, .xls</p>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success result */}
          {uploadState === 'success' && result && (
            <div className="p-4 bg-success/5 border border-success/20 space-y-2">
              <div className="flex items-start gap-2 text-success">
                <CheckCircle size={15} className="mt-0.5 shrink-0" />
                <p className="text-sm font-medium">{result.message ?? 'Import successful'}</p>
              </div>
              <div className="pl-6 space-y-1">
                <p className="text-xs text-stone">
                  <span className="font-medium text-charcoal-deep">{result.imported_count ?? 0}</span> collection{result.imported_count !== 1 ? 's' : ''} created
                </p>
                {result.collection_ids && result.collection_ids.length > 0 && (
                  <p className="text-[11px] text-taupe font-mono break-all">
                    IDs: {result.collection_ids.slice(0, 3).join(', ')}{result.collection_ids.length > 3 ? ` +${result.collection_ids.length - 3} more` : ''}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploadState === 'uploading' || uploadState === 'success'}
            className="w-full flex items-center justify-center gap-2 py-3 bg-charcoal-deep text-white text-sm tracking-[0.08em] uppercase transition-colors hover:bg-noir disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploadState === 'uploading' ? (
              <><Loader2 size={15} className="animate-spin" /> Uploading…</>
            ) : uploadState === 'success' ? (
              <><CheckCircle size={15} /> Uploaded</>
            ) : (
              <><Upload size={15} /> Upload File</>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-sand/40" />
            <span className="text-[11px] text-taupe tracking-[0.08em] uppercase">Sample Files</span>
            <div className="flex-1 h-px bg-sand/40" />
          </div>

          {/* Sample downloads */}
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { fmt: 'json' as SampleFormat, label: 'JSON', Icon: FileJson, color: 'text-gold-muted', hover: 'hover:border-gold-muted/40' },
                { fmt: 'csv' as SampleFormat, label: 'CSV', Icon: FileText, color: 'text-info', hover: 'hover:border-info/40' },
                { fmt: 'excel' as SampleFormat, label: 'Excel', Icon: FileSpreadsheet, color: 'text-success', hover: 'hover:border-success/40' },
              ] as const
            ).map(({ fmt, label, Icon, color, hover }) => (
              <button
                key={fmt}
                onClick={() => handleDownloadSample(fmt)}
                disabled={downloadingFormat === fmt}
                className={`flex flex-col items-center gap-2 p-4 border border-sand/60 ${hover} hover:bg-parchment/30 transition-colors group disabled:opacity-60`}
              >
                {downloadingFormat === fmt
                  ? <Loader2 size={22} className={`${color} animate-spin`} />
                  : <Icon size={22} className={`${color} group-hover:scale-110 transition-transform`} />}
                <span className="text-[11px] text-stone tracking-wide uppercase">{label}</span>
                <span className="flex items-center gap-1 text-[10px] text-taupe">
                  {downloadingFormat === fmt ? 'Loading…' : <><Download size={10} /> Download</>}
                </span>
              </button>
            ))}
          </div>

          <p className="text-[11px] text-taupe leading-relaxed">
            Each row (or object in JSON) represents one collection. Required:{' '}
            <span className="font-medium text-stone">collection_name</span>,{' '}
            <span className="font-medium text-stone">season</span>,{' '}
            <span className="font-medium text-stone">year</span>,{' '}
            <span className="font-medium text-stone">status</span>.{' '}
            <span className="font-medium text-stone">collection_description</span> and{' '}
            <span className="font-medium text-stone">collection_image</span> are optional.
          </p>
        </div>
      </div>
    </div>
  );
}
