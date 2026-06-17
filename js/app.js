const App = (() => {
  let currentRole = 'operator';
  
  const showToast = (message, type = 'info') => {
    const container = document.querySelector('.toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      error: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const createToastContainer = () => {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  };

  const showModal = (content, options = {}) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
      ${options.title ? `
        <div class="modal-header">
          <h3 class="modal-title">${options.title}</h3>
          <button class="modal-close" data-close>&times;</button>
        </div>
      ` : ''}
      <div class="modal-body">${content}</div>
      ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
    `;
    
    backdrop.appendChild(modal);
    document.body.appendChild(modal);
    
    const close = () => {
      backdrop.style.opacity = '0';
      modal.style.transform = 'scale(0.9)';
      modal.style.transition = 'all 0.2s ease';
      setTimeout(() => backdrop.remove(), 200);
      if (options.onClose) options.onClose();
    };
    
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });
    
    modal.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', close);
    });
    
    return { close, modal, backdrop };
  };

  const showLightbox = (imageSrc) => {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <img src="${imageSrc}" alt="Preview">
      <button class="lightbox-close">&times;</button>
    `;
    
    document.body.appendChild(lightbox);
    
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        lightbox.style.opacity = '0';
        setTimeout(() => lightbox.remove(), 200);
      }
    });
    
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        lightbox.style.opacity = '0';
        setTimeout(() => lightbox.remove(), 200);
        document.removeEventListener('keydown', escHandler);
      }
    });
  };

  const createStatusBadge = (status) => {
    const iconMap = {
      pending: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      processing: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',
      waiting_confirm: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      approved: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      need_revise: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
    };
    
    return `<span class="task-status-badge status-badge-${status}">
      ${iconMap[status] || ''}
      ${Storage.getStatusText(status)}
    </span>`;
  };

  const renderTaskCard = (task, index) => {
    return `
      <div class="task-card status-${task.status} ${task.priority === 'urgent' ? 'urgent' : ''}" 
           data-id="${task.id}"
           style="animation-delay: ${index * 0.05}s">
        <div class="task-card-header">
          <div>
            <div class="task-customer">${task.customerName}</div>
            <div class="task-filename">
              ${FileHandler.getFileIcon(task.fileType)}
              ${task.fileName}
            </div>
          </div>
          ${createStatusBadge(task.status)}
        </div>
        <div class="task-card-body">
          <div class="task-info-item">纸张：<span>${Storage.getPaperTypeText(task.paperType)}</span></div>
          <div class="task-info-item">装订：<span>${Storage.getBindingTypeText(task.bindingType)}</span></div>
          <div class="task-info-item">数量：<span>${task.printQuantity.toLocaleString()}</span></div>
          <div class="task-info-item">优先级：<span>${Storage.getPriorityText(task.priority)}</span></div>
        </div>
        <div class="task-card-footer">
          <span class="task-version">版本 v${task.currentVersion}</span>
          <span class="task-date">${Storage.formatDate(task.updatedAt)}</span>
        </div>
      </div>
    `;
  };

  const renderTaskList = () => {
    const container = document.getElementById('tasks-grid');
    if (!container) return;
    
    const filters = {
      status: document.getElementById('filter-status')?.value || 'all',
      priority: document.getElementById('filter-priority')?.value || 'all',
      search: document.getElementById('search-input')?.value || ''
    };
    
    const tasks = TaskManager.getTaskList(filters);
    
    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          <div class="empty-state-text">暂无打样任务</div>
          <p>点击"新建打样任务"开始创建</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = tasks.map((task, index) => renderTaskCard(task, index)).join('');
    
    container.querySelectorAll('.task-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        window.location.hash = `#/task/${id}`;
      });
    });
  };

  const renderTaskDetail = async (taskId) => {
    const task = TaskManager.getTaskById(taskId);
    if (!task) {
      showToast('任务不存在', 'error');
      window.location.hash = '#/';
      return;
    }
    
    const version = TaskManager.getCurrentVersion(taskId);
    const issues = TaskManager.getVersionIssues(version?.id || '');
    const photos = TaskManager.getVersionPhotos(version?.id || '');
    const allVersions = TaskManager.getTaskVersions(taskId);
    
    document.getElementById('detail-customer').textContent = task.customerName;
    document.getElementById('detail-filename').textContent = task.fileName;
    document.getElementById('detail-status').innerHTML = createStatusBadge(task.status);
    document.getElementById('detail-quantity').textContent = task.printQuantity.toLocaleString();
    document.getElementById('detail-paper').textContent = Storage.getPaperTypeText(task.paperType);
    document.getElementById('detail-binding').textContent = Storage.getBindingTypeText(task.bindingType);
    document.getElementById('detail-priority').textContent = Storage.getPriorityText(task.priority);
    document.getElementById('detail-version').textContent = `v${task.currentVersion}`;
    document.getElementById('detail-created').textContent = Storage.formatDate(task.createdAt);
    document.getElementById('detail-updated').textContent = Storage.formatDate(task.updatedAt);
    
    document.getElementById('priority-select').value = task.priority;
    document.getElementById('priority-select').addEventListener('change', (e) => {
      TaskManager.setPriority(taskId, e.target.value);
      showToast('优先级已更新', 'success');
      document.getElementById('detail-priority').textContent = Storage.getPriorityText(e.target.value);
    });
    
    const previewContainer = document.getElementById('preview-content');
    previewContainer.innerHTML = '';
    
    if (task.fileType === 'pdf' && task.fileData) {
      try {
        const info = await FileHandler.initPdfPreview(task.fileData, previewContainer);
        await FileHandler.renderPdfPage(1, previewContainer);
        updatePreviewControls(info);
        setupPreviewControls(previewContainer, taskId);
      } catch (e) {
        previewContainer.innerHTML = '<p style="color: #ba181b;">PDF预览加载失败</p>';
      }
    } else if (task.fileData) {
      const img = document.createElement('img');
      img.src = task.fileData;
      previewContainer.appendChild(img);
      setupIssueMarkers(previewContainer, issues);
      setupImageClickForIssue(previewContainer, taskId, version?.id);
      document.getElementById('preview-controls').style.display = 'none';
    } else {
      previewContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #8a8a8a;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p style="margin-top: 16px;">此PDF文件需要PDF.js支持预览</p>
        </div>
      `;
      document.getElementById('preview-controls').style.display = 'none';
    }
    
    renderIssuesList(issues);
    renderPhotosList(photos);
    renderVersionTimeline(allVersions, task);
    setupDetailActions(taskId, task);
    setupIssueTypeSelector(taskId, version?.id);
    setupPhotoUpload(taskId, version?.id);
  };

  const updatePreviewControls = (info) => {
    document.getElementById('page-info').textContent = `${info.currentPage} / ${info.totalPages}`;
    document.getElementById('zoom-level').textContent = `${Math.round(info.zoom * 100)}%`;
    document.getElementById('btn-prev').disabled = info.currentPage <= 1;
    document.getElementById('btn-next').disabled = info.currentPage >= info.totalPages;
  };

  const setupPreviewControls = (container, taskId) => {
    document.getElementById('btn-prev').onclick = async () => {
      const info = await FileHandler.prevPage(container);
      if (info) updatePreviewControls(info);
    };
    
    document.getElementById('btn-next').onclick = async () => {
      const info = await FileHandler.nextPage(container);
      if (info) updatePreviewControls(info);
    };
    
    document.getElementById('btn-zoom-out').onclick = async () => {
      const info = await FileHandler.zoomOut(container);
      if (info) updatePreviewControls(info);
    };
    
    document.getElementById('btn-zoom-in').onclick = async () => {
      const info = await FileHandler.zoomIn(container);
      if (info) updatePreviewControls(info);
    };
  };

  const setupIssueMarkers = (container, issues) => {
    container.querySelectorAll('.issue-marker, .issue-tooltip').forEach(el => el.remove());
    
    const img = container.querySelector('img');
    if (!img) return;
    
    const rect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    issues.forEach((issue, index) => {
      const marker = document.createElement('div');
      marker.className = `issue-marker ${issue.issueType}`;
      marker.style.left = `${issue.positionX}%`;
      marker.style.top = `${issue.positionY}%`;
      marker.textContent = index + 1;
      marker.dataset.issueId = issue.id;
      
      const tooltip = document.createElement('div');
      tooltip.className = 'issue-tooltip';
      tooltip.style.left = `${issue.positionX}%`;
      tooltip.style.top = `${issue.positionY + 5}%`;
      tooltip.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px; color: var(--color-text-primary);">
          ${Storage.getIssueTypeText(issue.issueType)}
        </div>
        <div>${issue.description}</div>
      `;
      
      container.appendChild(marker);
      container.appendChild(tooltip);
      
      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('删除此问题标记？')) {
          TaskManager.removeIssue(issue.id);
          marker.remove();
          tooltip.remove();
          const version = TaskManager.getCurrentVersion(container.closest('[data-task-id]')?.dataset.taskId);
          renderIssuesList(TaskManager.getVersionIssues(version?.id || ''));
          showToast('问题标记已删除', 'success');
        }
      });
    });
  };

  const setupImageClickForIssue = (container, taskId, versionId) => {
    container.dataset.taskId = taskId;
    
    container.addEventListener('click', (e) => {
      if (e.target.closest('.issue-marker')) return;
      
      const selectedType = document.querySelector('.issue-type-btn.active')?.dataset.type;
      if (!selectedType) {
        showToast('请先选择问题类型', 'warning');
        return;
      }
      
      const img = container.querySelector('img');
      if (!img) return;
      
      const rect = img.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      const modal = showModal(`
        <div class="form-group">
          <label class="form-label">问题描述 <span class="required">*</span></label>
          <textarea class="form-textarea" id="issue-desc" placeholder="请输入问题描述..."></textarea>
        </div>
      `, {
        title: `添加${Storage.getIssueTypeText(selectedType)}问题`,
        footer: `
          <button class="btn btn-ghost" data-close>取消</button>
          <button class="btn btn-primary" id="confirm-issue">确认添加</button>
        `
      });
      
      document.getElementById('confirm-issue').onclick = () => {
        const description = document.getElementById('issue-desc').value.trim();
        if (!description) {
          showToast('请输入问题描述', 'warning');
          return;
        }
        
        const issue = TaskManager.addIssue(versionId, {
          issueType: selectedType,
          description,
          positionX: Math.round(x * 10) / 10,
          positionY: Math.round(y * 10) / 10,
          pageNumber: FileHandler.getPreviewInfo().currentPage || 1
        });
        
        const issues = TaskManager.getVersionIssues(versionId);
        setupIssueMarkers(container, issues);
        renderIssuesList(issues);
        modal.close();
        showToast('问题标记已添加', 'success');
      };
    });
  };

  const setupIssueTypeSelector = (taskId, versionId) => {
    const buttons = document.querySelectorAll('.issue-type-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  };

  const renderIssuesList = (issues) => {
    const container = document.getElementById('issues-list');
    if (!container) return;
    
    if (issues.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #8a8a8a;">
          <p>暂无问题标记</p>
          <p style="font-size: 12px; margin-top: 4px;">在预览图上点击添加问题</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = issues.map((issue, index) => `
      <div class="issue-item">
        <span class="issue-type-tag ${issue.issueType}">${Storage.getIssueTypeText(issue.issueType)}</span>
        <div class="issue-content">
          <div class="issue-desc">${index + 1}. ${issue.description}</div>
          <div class="issue-meta">位置: (${issue.positionX}%, ${issue.positionY}%) · 第${issue.pageNumber}页</div>
        </div>
        <button class="btn btn-ghost" style="padding: 4px 8px;" data-delete-issue="${issue.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    `).join('');
    
    container.querySelectorAll('[data-delete-issue]').forEach(btn => {
      btn.addEventListener('click', () => {
        const issueId = btn.dataset.deleteIssue;
        if (confirm('删除此问题标记？')) {
          TaskManager.removeIssue(issueId);
          const taskId = window.location.hash.split('/')[2];
          const version = TaskManager.getCurrentVersion(taskId);
          const issues = TaskManager.getVersionIssues(version?.id || '');
          renderIssuesList(issues);
          setupIssueMarkers(document.getElementById('preview-content'), issues);
          showToast('问题标记已删除', 'success');
        }
      });
    });
  };

  const setupPhotoUpload = (taskId, versionId) => {
    const uploadArea = document.getElementById('photo-upload-area');
    const fileInput = document.getElementById('photo-input');
    
    if (!uploadArea || !fileInput) return;
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      handlePhotoUpload(e.dataTransfer.files, versionId);
    });
    
    fileInput.addEventListener('change', (e) => {
      handlePhotoUpload(e.target.files, versionId);
      e.target.value = '';
    });
  };

  const handlePhotoUpload = async (files, versionId) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    
    for (const file of imageFiles) {
      try {
        const data = await FileHandler.fileToBase64(file);
        TaskManager.addPhoto(versionId, { photoData: data, description: file.name });
      } catch (e) {
        showToast(`照片 ${file.name} 上传失败`, 'error');
      }
    }
    
    const photos = TaskManager.getVersionPhotos(versionId);
    renderPhotosList(photos);
    showToast(`已上传 ${imageFiles.length} 张照片`, 'success');
  };

  const renderPhotosList = (photos) => {
    const container = document.getElementById('photos-grid');
    if (!container) return;
    
    if (photos.length === 0) {
      container.innerHTML = '';
      return;
    }
    
    container.innerHTML = photos.map(photo => `
      <div class="photo-item">
        <img src="${photo.photoData}" alt="打样照片" data-lightbox>
        <button class="photo-remove" data-delete-photo="${photo.id}">&times;</button>
      </div>
    `).join('');
    
    container.querySelectorAll('[data-lightbox]').forEach(img => {
      img.addEventListener('click', () => showLightbox(img.src));
    });
    
    container.querySelectorAll('[data-delete-photo]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const photoId = btn.dataset.deletePhoto;
        if (confirm('删除此照片？')) {
          TaskManager.removePhoto(photoId);
          const taskId = window.location.hash.split('/')[2];
          const version = TaskManager.getCurrentVersion(taskId);
          const photos = TaskManager.getVersionPhotos(version?.id || '');
          renderPhotosList(photos);
          showToast('照片已删除', 'success');
        }
      });
    });
  };

  const renderVersionTimeline = (versions, task) => {
    const container = document.getElementById('version-timeline');
    if (!container) return;
    
    container.innerHTML = versions.map((version, index) => `
      <div class="timeline-item ${index === 0 ? 'current' : ''}">
        <div class="timeline-version">版本 v${version.versionNumber}</div>
        <div class="timeline-status">${createStatusBadge(version.status)}</div>
        <div class="timeline-time">
          ${version.proofTime ? `打样时间：${Storage.formatDate(version.proofTime)}` : ''}
          ${version.proofOperator ? ` · ${version.proofOperator}` : ''}
        </div>
        ${version.customerOpinion ? `
          <div class="timeline-opinion ${version.confirmResult || ''}">
            <strong>${version.confirmResult === 'approved' ? '客户确认通过' : '客户修改意见'}：</strong>
            ${version.customerOpinion}
          </div>
        ` : ''}
        ${version.confirmTime ? `<div class="timeline-time">确认时间：${Storage.formatDate(version.confirmTime)}</div>` : ''}
      </div>
    `).join('');
  };

  const setupDetailActions = (taskId, task) => {
    const btnStart = document.getElementById('btn-start-proof');
    const btnSubmit = document.getElementById('btn-submit-confirm');
    const btnNewVersion = document.getElementById('btn-new-version');
    const btnDelete = document.getElementById('btn-delete-task');
    
    if (task.status === 'pending') {
      btnStart.style.display = 'inline-flex';
      btnStart.onclick = () => {
        TaskManager.updateTaskStatus(taskId, 'processing');
        showToast('已开始打样', 'success');
        renderTaskDetail(taskId);
      };
    } else {
      btnStart.style.display = 'none';
    }
    
    if (task.status === 'processing') {
      btnSubmit.style.display = 'inline-flex';
      btnSubmit.onclick = () => {
        const confirmLink = TaskManager.submitForConfirmation(taskId);
        navigator.clipboard.writeText(confirmLink).then(() => {
          showToast('客户确认链接已复制到剪贴板', 'success');
        });
        const modal = showModal(`
          <p style="margin-bottom: 16px;">客户确认链接已生成：</p>
          <div style="background: var(--color-bg); padding: 12px; border-radius: 8px; word-break: break-all; margin-bottom: 16px;">
            <a href="${confirmLink}" target="_blank" style="color: var(--color-primary);">${confirmLink}</a>
          </div>
          <p style="font-size: 12px; color: var(--color-text-muted);">请将此链接发送给客户进行确认</p>
        `, {
          title: '生成确认链接',
          footer: `
            <button class="btn btn-primary" id="copy-link">复制链接</button>
          `
        });
        
        document.getElementById('copy-link').onclick = () => {
          navigator.clipboard.writeText(confirmLink);
          showToast('链接已复制', 'success');
        };
        
        renderTaskDetail(taskId);
      };
    } else {
      btnSubmit.style.display = 'none';
    }
    
    if (task.status === 'need_revise') {
      btnNewVersion.style.display = 'inline-flex';
      btnNewVersion.onclick = () => {
        if (confirm('确认创建新版本？将基于当前版本创建新的打样版本。')) {
          TaskManager.createVersion(taskId);
          showToast('新版本已创建', 'success');
          renderTaskDetail(taskId);
        }
      };
    } else {
      btnNewVersion.style.display = 'none';
    }
    
    btnDelete.onclick = () => {
      if (confirm('确认删除此打样任务？此操作不可恢复。')) {
        TaskManager.deleteTask(taskId);
        showToast('任务已删除', 'success');
        window.location.hash = '#/';
      }
    };
  };

  const renderConfirmPage = async (token) => {
    const task = TaskManager.getTaskByToken(token);
    const confirmContent = document.getElementById('confirm-content');
    const confirmCard = document.querySelector('.confirm-card');
    
    if (!task) {
      if (confirmContent) {
        confirmContent.innerHTML = `
          <div style="text-align: center; padding: 40px;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ba181b" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <h2 style="margin: 16px 0; color: #ba181b;">链接无效或已过期</h2>
            <p>请检查链接是否正确，或联系印刷厂获取新的确认链接。</p>
          </div>
        `;
      }
      if (confirmCard) confirmCard.style.display = 'none';
      return;
    }
    
    if (confirmContent) confirmContent.style.display = 'none';
    if (confirmCard) confirmCard.style.display = 'block';
    
    const version = TaskManager.getCurrentVersion(task.id);
    const issues = TaskManager.getVersionIssues(version?.id || '');
    const photos = TaskManager.getVersionPhotos(version?.id || '');
    
    document.getElementById('confirm-customer').textContent = task.customerName;
    document.getElementById('confirm-filename').textContent = task.fileName;
    document.getElementById('confirm-quantity').textContent = task.printQuantity.toLocaleString();
    document.getElementById('confirm-paper').textContent = Storage.getPaperTypeText(task.paperType);
    document.getElementById('confirm-binding').textContent = Storage.getBindingTypeText(task.bindingType);
    document.getElementById('confirm-version').textContent = `v${task.currentVersion}`;
    document.getElementById('confirm-status').innerHTML = createStatusBadge(task.status);
    
    const issuesContainer = document.getElementById('confirm-issues');
    if (issues.length === 0) {
      issuesContainer.innerHTML = '<p style="color: var(--color-text-muted);">暂无打样问题标记</p>';
    } else {
      issuesContainer.innerHTML = issues.map((issue, index) => `
        <div class="confirm-issue-item ${issue.issueType}">
          <span class="issue-type-tag ${issue.issueType}">${Storage.getIssueTypeText(issue.issueType)}</span>
          <div>
            <div style="font-weight: 500;">${index + 1}. ${issue.description}</div>
            <div style="font-size: 12px; color: var(--color-text-muted); margin-top: 4px;">
              位置: 第${issue.pageNumber}页 (${issue.positionX}%, ${issue.positionY}%)
            </div>
          </div>
        </div>
      `).join('');
    }
    
    const photosContainer = document.getElementById('confirm-photos');
    if (photos.length === 0) {
      photosContainer.innerHTML = '<p style="color: var(--color-text-muted);">暂无打样照片</p>';
    } else {
      photosContainer.innerHTML = photos.map(photo => `
        <img src="${photo.photoData}" alt="打样照片" data-lightbox>
      `).join('');
      
      photosContainer.querySelectorAll('[data-lightbox]').forEach(img => {
        img.addEventListener('click', () => showLightbox(img.src));
      });
    }
    
    const actionsContainer = document.getElementById('confirm-actions');
    if (task.status !== 'waiting_confirm') {
      actionsContainer.style.display = 'none';
      return;
    }
    
    document.getElementById('btn-approve').onclick = () => {
      showModal(`
        <p>确认此打样通过吗？确认后将无法修改。</p>
      `, {
        title: '确认通过',
        footer: `
          <button class="btn btn-ghost" data-close>取消</button>
          <button class="btn btn-success" id="confirm-approve">确认通过</button>
        `
      });
      
      document.getElementById('confirm-approve').onclick = () => {
        TaskManager.confirmTask(token, 'approved', '');
        showToast('确认成功，感谢您的配合！', 'success');
        setTimeout(() => location.reload(), 1000);
      };
    };
    
    document.getElementById('btn-revise').onclick = () => {
      const modal = showModal(`
        <div class="form-group">
          <label class="form-label">修改意见 <span class="required">*</span></label>
          <textarea class="form-textarea" id="revise-opinion" placeholder="请详细描述需要修改的内容..."></textarea>
        </div>
      `, {
        title: '需要修改',
        footer: `
          <button class="btn btn-ghost" data-close>取消</button>
          <button class="btn btn-warning" id="confirm-revise">提交修改意见</button>
        `
      });
      
      document.getElementById('confirm-revise').onclick = () => {
        const opinion = document.getElementById('revise-opinion').value.trim();
        if (!opinion) {
          showToast('请输入修改意见', 'warning');
          return;
        }
        TaskManager.confirmTask(token, 'need_revise', opinion);
        showToast('修改意见已提交，感谢您的配合！', 'success');
        setTimeout(() => location.reload(), 1000);
      };
    };
  };

  const renderDashboard = () => {
    const now = new Date();
    const stats = Statistics.getMonthlyStats(now.getFullYear(), now.getMonth() + 1);
    
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-approved').textContent = stats.approved;
    document.getElementById('stat-passrate').textContent = stats.passRate + '%';
    document.getElementById('stat-revisions').textContent = stats.avgRevisions;
    document.getElementById('stat-pending').textContent = stats.pending;
    
    const trendData = Statistics.getTrendData(6);
    const totalChartData = trendData.map(d => ({
      label: d.label,
      value: d.total
    }));
    
    Statistics.drawLineChart(document.getElementById('chart-total'), totalChartData, {
      color: '#1e3a5f',
      valueSuffix: '个'
    });
    
    const passRateData = trendData.map(d => ({
      label: d.label,
      value: d.passRate
    }));
    
    Statistics.drawLineChart(document.getElementById('chart-passrate'), passRateData, {
      color: '#2d6a4f',
      valueSuffix: '%'
    });
    
    const paperStats = Statistics.getPaperTypeStats();
    Statistics.drawPieChart(document.getElementById('chart-paper'), paperStats.map(s => ({
      label: s.label,
      value: s.count,
      percentage: s.percentage
    })));
    
    const customerStats = Statistics.getCustomerStats();
    const customerTableBody = document.getElementById('customer-stats-body');
    customerTableBody.innerHTML = customerStats.slice(0, 5).map(s => `
      <tr>
        <td>${s.customer}</td>
        <td>${s.total}</td>
        <td>${s.approved}</td>
        <td>
          <span style="color: ${s.passRate >= 80 ? 'var(--color-success)' : s.passRate >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'}; font-weight: 500;">
            ${s.passRate}%
          </span>
        </td>
      </tr>
    `).join('');
  };

  const renderNewTaskPage = () => {
    let selectedFiles = [];
    
    const uploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', async (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      await handleFileUpload(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', async (e) => {
      await handleFileUpload(e.target.files);
      e.target.value = '';
    });
    
    const handleFileUpload = async (files) => {
      const results = await FileHandler.handleFileSelect(Array.from(files));
      
      results.forEach(result => {
        if (result.error) {
          showToast(`${result.file.name}: ${result.error}`, 'error');
        } else {
          selectedFiles.push(result);
        }
      });
      
      renderFileList();
    };
    
    const renderFileList = () => {
      if (selectedFiles.length === 0) {
        fileList.innerHTML = '';
        return;
      }
      
      fileList.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-item">
          <div class="file-icon ${file.type.split('/')[1]}">
            ${FileHandler.getFileIcon(file.type)}
          </div>
          <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${Storage.formatFileSize(file.size)}</div>
          </div>
          <button class="file-remove" data-remove-file="${index}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `).join('');
      
      fileList.querySelectorAll('[data-remove-file]').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.removeFile);
          selectedFiles.splice(index, 1);
          renderFileList();
        });
      });
    };
    
    const form = document.getElementById('new-task-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (selectedFiles.length === 0) {
        showToast('请至少上传一个文件', 'warning');
        return;
      }
      
      const formData = {
        customerName: document.getElementById('customer-name').value.trim(),
        printQuantity: parseInt(document.getElementById('print-quantity').value),
        paperType: document.getElementById('paper-type').value,
        bindingType: document.getElementById('binding-type').value,
        priority: document.querySelector('input[name="priority"]:checked').value
      };
      
      if (!formData.customerName) {
        showToast('请输入客户名称', 'warning');
        return;
      }
      
      const tasks = TaskManager.createBatchTasks(selectedFiles, formData);
      showToast(`成功创建 ${tasks.length} 个打样任务`, 'success');
      
      setTimeout(() => {
        window.location.hash = '#/';
      }, 1000);
    });
    
    document.getElementById('btn-cancel').addEventListener('click', () => {
      window.location.hash = '#/';
    });
  };

  const setActiveNav = (path) => {
    document.querySelectorAll('.navbar-link').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === path || (path === '/' && href === '#/')) {
        link.classList.add('active');
      }
    });
  };

  const route = () => {
    const hash = window.location.hash || '#/';
    const path = hash.replace('#', '');
    const parts = path.split('/').filter(Boolean);
    
    if (parts[0] === 'confirm' && parts[1]) {
      renderConfirmPage(parts[1]);
      return;
    }
    
    if (parts[0] === 'task' && parts[1]) {
      renderTaskDetail(parts[1]);
      setActiveNav('/task');
      return;
    }
    
    if (parts[0] === 'new') {
      renderNewTaskPage();
      setActiveNav('/new');
      return;
    }
    
    if (parts[0] === 'dashboard') {
      renderDashboard();
      setActiveNav('/dashboard');
      return;
    }
    
    renderTaskList();
    setActiveNav('/');
    
    ['filter-status', 'filter-priority', 'search-input'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', renderTaskList);
        el.addEventListener('input', renderTaskList);
      }
    });
  };

  const init = () => {
    MockData.init();
    window.addEventListener('hashchange', route);
    route();
  };

  return {
    init,
    route,
    showToast,
    showModal,
    showLightbox,
    renderTaskList,
    renderTaskDetail,
    renderConfirmPage,
    renderDashboard,
    renderNewTaskPage
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});