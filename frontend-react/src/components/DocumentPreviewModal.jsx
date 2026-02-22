import React, { useState, useEffect } from 'react';

/**
 * DocumentPreviewModal Component
 * Displays document preview in a modal for PDFs, images, and other file types.
 * Features:
 * - Modal overlay with close button
 * - PDF preview using iframe
 * - Image preview with <img>
 * - Download button for non-viewable files
 * - Loading state while fetching file
 * - Error handling for missing/corrupted files
 */
export default function DocumentPreviewModal({
    isOpen,
    onClose,
    documentId,
    documentName,
    documentType,
    token
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [isViewable, setIsViewable] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Define handlers early so they can be used in useEffect
    const handleClose = () => {
        // Clean up blob URL and reset zoom
        if (fileUrl) {
            URL.revokeObjectURL(fileUrl);
        }
        setFileUrl('');
        setError('');
        setZoomLevel(1);
        onClose();
    };

    const handleDownload = () => {
        if (fileUrl) {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = documentName || 'document';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.2, 3));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
    };

    const handleResetZoom = () => {
        setZoomLevel(1);
    };

    useEffect(() => {
        if (isOpen && documentId && token) {
            loadDocument();
        }
    }, [isOpen, documentId, token]);

    // Handle ESC key to close full-screen viewer
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                // Clean up blob URL and close
                if (fileUrl) {
                    URL.revokeObjectURL(fileUrl);
                }
                setFileUrl('');
                setError('');
                setZoomLevel(1);
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscKey);
            // Prevent body scroll when full-screen viewer is open
            document.body.style.overflow = 'hidden';
            return () => {
                window.removeEventListener('keydown', handleEscKey);
                document.body.style.overflow = 'auto';
            };
        }
    }, [isOpen, fileUrl, onClose]);

    const loadDocument = async () => {
        try {
            setLoading(true);
            setError('');
            setFileUrl('');
            setIsViewable(false);

            console.log(`Loading document ${documentId}...`);
            console.log(`Document props - Name: ${documentName}, Type: ${documentType}`);

            // Fetch document from backend
            const response = await fetch(
                `http://localhost:8000/admin/documents/${documentId}/view?token=${token}`
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Backend error response:', errorText);
                let errorMessage = `Failed to load document: ${response.status}`;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.detail || errorMessage;
                } catch (e) {
                    // If not JSON, use the text as is
                }
                throw new Error(errorMessage);
            }

            // Create blob from response
            const blob = await response.blob();
            console.log(`Blob created - Size: ${blob.size}, Type: ${blob.type}`);

            const url = URL.createObjectURL(blob);
            setFileUrl(url);

            // Determine if file is viewable based on MIME type from response or props
            const contentType = response.headers.get('content-type') || documentType || '';
            const fileName = documentName?.toLowerCase() || '';

            console.log(`Content-Type from response: ${contentType}`);
            console.log(`File name: ${fileName}`);

            const viewableTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'text/plain',
                'text/html'
            ];

            // Check if viewable - from content-type or file extension
            const isViewable = viewableTypes.some(type => contentType?.includes(type)) ||
                fileName.endsWith('.pdf') ||
                fileName.endsWith('.jpg') ||
                fileName.endsWith('.jpeg') ||
                fileName.endsWith('.png') ||
                fileName.endsWith('.gif') ||
                fileName.endsWith('.webp');

            console.log(`Is viewable: ${isViewable}`);
            setIsViewable(isViewable);
        } catch (err) {
            console.error('Error loading document:', err);
            setError(err.message || 'Failed to load document. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Dark overlay backdrop */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 9998,
                    transition: 'opacity 0.3s'
                }}
                onClick={handleClose}
            ></div>

            {/* Centering Container */}
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                overflow: 'hidden',
                backgroundColor: 'transparent',
                pointerEvents: 'auto'
            }}>
                {/* Modal Dialog Box */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    width: '100%',
                    height: '100%',
                    maxWidth: '1400px',
                    maxHeight: '92vh',
                    minWidth: '400px',
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',
                    boxSizing: 'border-box'
                }}>
                    {/* Header - Fixed at top */}
                    <div style={{
                        background: 'linear-gradient(135deg, #9333ea 0%, #2563eb 100%)',
                        color: '#ffffff',
                        padding: '14px 24px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        height: '60px',
                        width: '100%',
                        zIndex: 10000,
                        boxSizing: 'border-box',
                        position: 'relative'
                    }}>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                            <h2 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                margin: 0,
                                letterSpacing: '-0.3px'
                            }}>📄 {documentName || 'Document'}</h2>
                        </div>

                        {/* Zoom Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            {/* Zoom Out Button */}
                            <button
                                onClick={handleZoomOut}
                                disabled={zoomLevel <= 0.5}
                                style={{
                                    backgroundColor: zoomLevel <= 0.5 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.2)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    cursor: zoomLevel <= 0.5 ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.2s',
                                    fontSize: '18px',
                                    opacity: zoomLevel <= 0.5 ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => zoomLevel > 0.5 && (e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)')}
                                onMouseLeave={(e) => zoomLevel > 0.5 && (e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
                                title="Zoom Out"
                            >
                                −
                            </button>

                            {/* Zoom Level Display */}
                            <button
                                onClick={handleResetZoom}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '6px 10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                    fontSize: '12px',
                                    minWidth: '45px'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                                title="Reset zoom to 100%"
                            >
                                {Math.round(zoomLevel * 100)}%
                            </button>

                            {/* Zoom In Button */}
                            <button
                                onClick={handleZoomIn}
                                disabled={zoomLevel >= 3}
                                style={{
                                    backgroundColor: zoomLevel >= 3 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.2)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    cursor: zoomLevel >= 3 ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.2s',
                                    fontSize: '18px',
                                    opacity: zoomLevel >= 3 ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => zoomLevel < 3 && (e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)')}
                                onMouseLeave={(e) => zoomLevel < 3 && (e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
                                title="Zoom In"
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={handleClose}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontSize: '24px',
                                lineHeight: '1',
                                flexShrink: 0,
                                marginLeft: '8px'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                            title="Close (ESC)"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Document Content Area - Fills remaining space */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        justifyContent: 'stretch',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#ffffff',
                        overflow: 'hidden',
                        minHeight: 0,
                        minWidth: 0,
                        position: 'relative',
                        boxSizing: 'border-box'
                    }}>
                        {loading ? (
                            // Loading state
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        border: '4px solid rgba(147, 51, 234, 0.3)',
                                        borderTop: '4px solid #9333ea',
                                        borderRadius: '50%',
                                        margin: '0 auto 16px',
                                        animation: 'spin 0.8s linear infinite'
                                    }}></div>
                                    <p style={{ color: '#4b5563', fontWeight: '500' }}>Loading document...</p>
                                </div>
                            </div>
                        ) : error ? (
                            // Error state
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%'
                            }}>
                                <div style={{
                                    backgroundColor: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: '8px',
                                    padding: '24px',
                                    maxWidth: '448px',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ color: '#b91c1c', fontWeight: '600', margin: '0 0 8px 0' }}>⚠️ Error Loading Document</p>
                                    <p style={{ color: '#dc2626', fontSize: '14px', margin: '0 0 16px 0' }}>{error}</p>
                                    <button
                                        onClick={loadDocument}
                                        style={{
                                            backgroundColor: '#dc2626',
                                            color: '#ffffff',
                                            padding: '8px 16px',
                                            borderRadius: '4px',
                                            border: 'none',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        ) : !isViewable ? (
                            // Non-viewable file state
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%'
                            }}>
                                <div style={{
                                    backgroundColor: '#fef3c7',
                                    border: '1px solid #fcd34d',
                                    borderRadius: '8px',
                                    padding: '24px',
                                    maxWidth: '448px',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ color: '#92400e', fontWeight: '600', margin: '0 0 8px 0' }}>📦 File Not Displayable</p>
                                    <p style={{ color: '#b45309', fontSize: '14px', margin: '0 0 16px 0' }}>
                                        This file type cannot be previewed in the browser.
                                    </p>
                                    <button
                                        onClick={handleDownload}
                                        style={{
                                            backgroundColor: '#b45309',
                                            color: '#ffffff',
                                            padding: '8px 16px',
                                            borderRadius: '4px',
                                            border: 'none',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#92400e'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#b45309'}
                                    >
                                        Download File
                                    </button>
                                </div>
                            </div>
                        ) : fileUrl && documentName?.toLowerCase().endsWith('.pdf') ? (
                            // PDF viewer - fit entire page
                            <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'auto',
                                position: 'relative'
                            }}>
                                <iframe
                                    key={zoomLevel}
                                    src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=${Math.round(zoomLevel * 100)}`}
                                    title={documentName}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        margin: 0,
                                        padding: 0,
                                        display: 'block',
                                        backgroundColor: '#ffffff'
                                    }}
                                    seamless
                                />
                            </div>
                        ) : fileUrl ? (
                            // Check if it's an image by looking at file extension or documentType
                            documentType?.startsWith('image/') ||
                                documentName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                // Image viewer
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'auto',
                                    backgroundColor: '#ffffff'
                                }}>
                                    <img
                                        src={fileUrl}
                                        alt={documentName}
                                        style={{
                                            maxWidth: 'none',
                                            maxHeight: 'none',
                                            width: zoomLevel === 1 ? '95%' : 'auto',
                                            height: zoomLevel === 1 ? '95%' : 'auto',
                                            objectFit: 'contain',
                                            display: 'block',
                                            transform: `scale(${zoomLevel})`,
                                            transition: 'transform 0.2s ease',
                                            transformOrigin: 'center center'
                                        }}
                                        onError={(e) => {
                                            console.error('Image failed to load:', e);
                                            setError('Failed to display image. The image may be corrupted.');
                                        }}
                                        onLoad={() => console.log('Image loaded successfully')}
                                    />
                                </div>
                            ) : (
                                // Text file or other viewable content
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'stretch',
                                    justifyContent: 'stretch',
                                    overflow: 'hidden'
                                }}>
                                    <iframe
                                        src={fileUrl}
                                        title={documentName}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            border: 'none',
                                            margin: 0,
                                            padding: 0,
                                            display: 'block'
                                        }}
                                        onError={(e) => console.error('iframe load error:', e)}
                                    />
                                </div>
                            )
                        ) : null}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
}
