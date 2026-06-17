const FileHandler = (() => {
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const MAX_FILE_SIZE = 20 * 1024 * 1024;

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: '仅支持 PDF、JPG、PNG 格式文件' };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: '文件大小不能超过 20MB' };
    }
    return { valid: true };
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      if (file.type.startsWith('image/')) {
        const img = new Image();
        reader.onload = (e) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxWidth = 1920;
            
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.onerror = reject;
          img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } else {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFileSelect = async (files) => {
    const results = [];
    
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        results.push({ file, error: validation.error });
        continue;
      }
      
      try {
        const data = await fileToBase64(file);
        results.push({
          file,
          name: file.name,
          type: file.type,
          size: file.size,
          data: data,
          error: null
        });
      } catch (error) {
        results.push({ file, error: '文件读取失败' });
      }
    }
    
    return results;
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const files = Array.from(event.dataTransfer.files);
    return handleFileSelect(files);
  };

  const getFileIcon = (type) => {
    if (type === 'pdf' || type === 'application/pdf') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6"/><path d="M9 18h3"/></svg>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
  };

  let pdfDoc = null;
  let currentPage = 1;
  let totalPages = 1;
  let zoom = 1;
  let renderTask = null;

  const initPdfPreview = async (fileData, canvasContainer) => {
    try {
      if (!window.pdfjsLib) {
        await loadPdfJs();
      }
      
      const typedArray = base64ToArrayBuffer(fileData);
      pdfDoc = await window.pdfjsLib.getDocument(typedArray).promise;
      totalPages = pdfDoc.numPages;
      currentPage = 1;
      zoom = 1;
      
      return { totalPages, currentPage, zoom };
    } catch (error) {
      console.error('PDF preview error:', error);
      throw new Error('PDF预览加载失败');
    }
  };

  const loadPdfJs = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const base64ToArrayBuffer = (base64) => {
    const base64Data = base64.split(',')[1] || base64;
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const renderPdfPage = async (pageNum, canvasContainer) => {
    if (!pdfDoc) return null;
    
    try {
      if (renderTask) {
        renderTask.cancel();
      }
      
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: zoom });
      
      let canvas = canvasContainer.querySelector('canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvasContainer.appendChild(canvas);
      }
      
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      renderTask = page.render({
        canvasContext: context,
        viewport: viewport
      });
      
      await renderTask.promise;
      currentPage = pageNum;
      
      return { currentPage, totalPages, zoom };
    } catch (error) {
      if (error.name !== 'RenderingCancelledException') {
        console.error('Render page error:', error);
      }
      return null;
    }
  };

  const setZoom = (newZoom, canvasContainer) => {
    zoom = Math.max(0.5, Math.min(2, newZoom));
    return renderPdfPage(currentPage, canvasContainer);
  };

  const zoomIn = (canvasContainer) => {
    return setZoom(zoom + 0.25, canvasContainer);
  };

  const zoomOut = (canvasContainer) => {
    return setZoom(zoom - 0.25, canvasContainer);
  };

  const nextPage = (canvasContainer) => {
    if (currentPage < totalPages) {
      return renderPdfPage(currentPage + 1, canvasContainer);
    }
    return null;
  };

  const prevPage = (canvasContainer) => {
    if (currentPage > 1) {
      return renderPdfPage(currentPage - 1, canvasContainer);
    }
    return null;
  };

  const previewImage = (fileData, container) => {
    container.innerHTML = '';
    const img = document.createElement('img');
    img.src = fileData;
    img.alt = '预览图片';
    container.appendChild(img);
  };

  const getPreviewInfo = () => ({
    currentPage,
    totalPages,
    zoom
  });

  return {
    validateFile,
    fileToBase64,
    handleFileSelect,
    handleDrop,
    getFileIcon,
    initPdfPreview,
    renderPdfPage,
    setZoom,
    zoomIn,
    zoomOut,
    nextPage,
    prevPage,
    previewImage,
    getPreviewInfo
  };
})();
