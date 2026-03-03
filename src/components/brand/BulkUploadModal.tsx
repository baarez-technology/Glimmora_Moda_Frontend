'use client';

import { useState, useRef, useCallback } from 'react';
import {
  X, Upload, FileJson, FileSpreadsheet, FileText,
  Download, CheckCircle, AlertCircle, Loader2, CloudUpload,
} from 'lucide-react';
import { uploadMultipleStories, downloadSampleTemplate } from '@/services/brand-story.service';
import type { MultiStoryUploadResult } from '@/services/brand-story.service';

interface BulkUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

const ACCEPTED_EXTENSIONS = '.json,.csv,.xlsx,.xls';

function downloadJSON() {
  const a = document.createElement('a');
  a.href = '/samples/stories-sample.json';
  a.download = 'stories-sample.json';
  a.click();
}

function downloadCSV() {
  const a = document.createElement('a');
  a.href = '/samples/stories-sample.csv';
  a.download = 'stories-sample.csv';
  a.click();
}

export default function BulkUploadModal({ onClose, onSuccess }: BulkUploadModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [result, setResult] = useState<MultiStoryUploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
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
      const res = await uploadMultipleStories(selectedFile);
      setResult(res);
      setUploadState('success');
      onSuccess();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setUploadState('error');
    }
  };

  const handleDownloadExcel = async () => {
    setDownloadingExcel(true);
    try {
      await downloadSampleTemplate();
    } catch {
      // fallback: silently ignore, user can try JSON/CSV instead
    } finally {
      setDownloadingExcel(false);
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
            <h2 className="font-display text-base text-charcoal-deep tracking-wide">Bulk Upload Stories</h2>
            <p className="text-xs text-stone mt-0.5">Upload multiple stories at once via JSON, CSV, or Excel</p>
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
                <p className="text-sm font-medium">{result.message}</p>
              </div>
              <div className="pl-6 space-y-1">
                <p className="text-xs text-stone">
                  <span className="font-medium text-charcoal-deep">{result.inserted_count}</span> stor{result.inserted_count !== 1 ? 'ies' : 'y'} created
                </p>
                {result.story_ids.length > 0 && (
                  <p className="text-[11px] text-taupe font-mono break-all">
                    IDs: {result.story_ids.slice(0, 3).join(', ')}{result.story_ids.length > 3 ? ` +${result.story_ids.length - 3} more` : ''}
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
            <button
              onClick={downloadJSON}
              className="flex flex-col items-center gap-2 p-4 border border-sand/60 hover:border-gold-muted/40 hover:bg-parchment/30 transition-colors group"
            >
              <FileJson size={22} className="text-gold-muted group-hover:scale-110 transition-transform" />
              <span className="text-[11px] text-stone tracking-wide uppercase">JSON</span>
              <span className="flex items-center gap-1 text-[10px] text-taupe">
                <Download size={10} /> Download
              </span>
            </button>

            <button
              onClick={downloadCSV}
              className="flex flex-col items-center gap-2 p-4 border border-sand/60 hover:border-info/40 hover:bg-parchment/30 transition-colors group"
            >
              <FileText size={22} className="text-info group-hover:scale-110 transition-transform" />
              <span className="text-[11px] text-stone tracking-wide uppercase">CSV</span>
              <span className="flex items-center gap-1 text-[10px] text-taupe">
                <Download size={10} /> Download
              </span>
            </button>

            {/* Excel — downloaded from backend /api/v1/multistory/sample */}
            <button
              onClick={handleDownloadExcel}
              disabled={downloadingExcel}
              className="flex flex-col items-center gap-2 p-4 border border-sand/60 hover:border-success/40 hover:bg-parchment/30 transition-colors group disabled:opacity-60"
            >
              {downloadingExcel
                ? <Loader2 size={22} className="text-success animate-spin" />
                : <FileSpreadsheet size={22} className="text-success group-hover:scale-110 transition-transform" />}
              <span className="text-[11px] text-stone tracking-wide uppercase">Excel</span>
              <span className="flex items-center gap-1 text-[10px] text-taupe">
                {downloadingExcel ? 'Loading…' : <><Download size={10} /> Download</>}
              </span>
            </button>
          </div>

          <p className="text-[11px] text-taupe leading-relaxed">
            Each row (or object in JSON) represents one story. Required:{' '}
            <span className="font-medium text-stone">title</span>,{' '}
            <span className="font-medium text-stone">story_type</span>,{' '}
            <span className="font-medium text-stone">excerpt</span>.{' '}
            <span className="font-medium text-stone">content</span> must be a JSON array of sections.{' '}
            <span className="font-medium text-stone">product_list</span> is an optional JSON array of product ID strings.
            The Excel template is generated by the server with styled headers.
          </p>
        </div>
      </div>
    </div>
  );
}
