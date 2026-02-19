import { Upload, X, FileText, Image as ImageIcon, File } from 'lucide-react';
import { useState, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const FileUpload = ({ files, onFilesChange }) => {
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    };

    const handleFileInput = (e) => {
        const selectedFiles = Array.from(e.target.files);
        handleFiles(selectedFiles);
    };

    const handleFiles = (newFiles) => {
        const validFiles = newFiles.filter(file => {
            const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            const maxSize = 10 * 1024 * 1024; // 10MB

            if (!validTypes.includes(file.type)) {
                alert(`${file.name} is not a supported file type. Please upload PDF, JPG, or PNG files.`);
                return false;
            }

            if (file.size > maxSize) {
                alert(`${file.name} is too large. Maximum file size is 10MB.`);
                return false;
            }

            return true;
        });

        const filesWithMetadata = validFiles.map(file => ({
            file,
            docType: 'other',
            id: Math.random().toString(36).substr(27),
        }));

        onFilesChange([...files, ...filesWithMetadata]);
    };

    const removeFile = (id) => {
        onFilesChange(files.filter(f => f.id !== id));
    };

    const updateDocType = (id, docType) => {
        onFilesChange(files.map(f => f.id === id ? { ...f, docType } : f));
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (fileType) => {
        if (fileType.includes('pdf')) return <FileText className="h-8 w-8 text-red-400" />;
        if (fileType.includes('image')) return <ImageIcon className="h-8 w-8 text-blue-400" />;
        return <File className="h-8 w-8 text-slate-400" />;
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragging
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 hover:border-blue-500/50 bg-slate-800/30'
                    }`}
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload className={`h-12 w-12 mx-auto mb-4 ${dragging ? 'text-blue-400' : 'text-slate-400'}`} />
                <p className="text-white font-medium mb-2">
                    {dragging ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-slate-400 text-sm mb-4">or click to browse</p>
                <p className="text-slate-500 text-xs">Supported: PDF, JPG, PNG (Max 10MB each)</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileInput}
                    className="hidden"
                />
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-300">{files.length} file(s) selected</p>
                    {files.map(({ file, docType, id }) => (
                        <Card key={id} className="p-4" glass hover={false}>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    {getFileIcon(file.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">{file.name}</p>
                                    <p className="text-sm text-slate-400">{formatFileSize(file.size)}</p>

                                    <div className="mt-3">
                                        <label className="block text-xs text-slate-400 mb-1">Document Type</label>
                                        <select
                                            value={docType}
                                            onChange={(e) => updateDocType(id, e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/50"
                                        >
                                            <option value="medical_report">Medical Report</option>
                                            <option value="invoice">Invoice</option>
                                            <option value="photo">Photo</option>
                                            <option value="police_report">Police Report</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(id)}
                                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
