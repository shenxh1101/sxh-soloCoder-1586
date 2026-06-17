const TaskManager = (() => {
  const createTask = (taskData) => {
    const tasks = Storage.load(Storage.KEYS.TASKS, []);
    const now = Date.now();
    const token = Storage.generateToken();
    
    const task = {
      id: Storage.generateId(),
      customerName: taskData.customerName,
      fileName: taskData.fileName,
      fileType: taskData.fileType,
      fileData: taskData.fileData || null,
      printQuantity: taskData.printQuantity,
      paperType: taskData.paperType,
      bindingType: taskData.bindingType,
      priority: taskData.priority || 'normal',
      status: 'pending',
      confirmToken: token,
      createdAt: now,
      updatedAt: now,
      currentVersion: 1
    };
    
    tasks.unshift(task);
    Storage.save(Storage.KEYS.TASKS, tasks);
    
    const versions = Storage.load(Storage.KEYS.VERSIONS, []);
    versions.push({
      id: Storage.generateId(),
      taskId: task.id,
      versionNumber: 1,
      status: 'pending',
      proofOperator: null,
      proofTime: null,
      customerOpinion: '',
      confirmTime: null,
      confirmResult: null
    });
    Storage.save(Storage.KEYS.VERSIONS, versions);
    
    return task;
  };

  const createBatchTasks = (files, commonData) => {
    return files.map(file => {
      return createTask({
        ...commonData,
        fileName: file.name,
        fileType: file.type.startsWith('image') ? 'jpg' : 'pdf',
        fileData: file.data
      });
    });
  };

  const getTaskById = (id) => {
    const tasks = Storage.load(Storage.KEYS.TASKS, []);
    return tasks.find(t => t.id === id);
  };

  const getTaskByToken = (token) => {
    const tasks = Storage.load(Storage.KEYS.TASKS, []);
    return tasks.find(t => t.confirmToken === token);
  };

  const getTaskList = (filters = {}) => {
    let tasks = Storage.load(Storage.KEYS.TASKS, []);
    
    if (filters.status && filters.status !== 'all') {
      tasks = tasks.filter(t => t.status === filters.status);
    }
    
    if (filters.priority && filters.priority !== 'all') {
      tasks = tasks.filter(t => t.priority === filters.priority);
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      tasks = tasks.filter(t => 
        t.customerName.toLowerCase().includes(search) ||
        t.fileName.toLowerCase().includes(search)
      );
    }
    
    tasks.sort((a, b) => {
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    
    return tasks;
  };

  const updateTaskStatus = (id, status) => {
    const tasks = Storage.load(Storage.KEYS.TASKS, []);
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index].status = status;
      tasks[index].updatedAt = Date.now();
      Storage.save(Storage.KEYS.TASKS, tasks);
      
      const versions = Storage.load(Storage.KEYS.VERSIONS, []);
      const versionIndex = versions.findIndex(v => 
        v.taskId === id && v.versionNumber === tasks[index].currentVersion
      );
      if (versionIndex !== -1) {
        versions[versionIndex].status = status;
        Storage.save(Storage.KEYS.VERSIONS, versions);
      }
      
      return tasks[index];
    }
    return null;
  };

  const createVersion = (taskId, data = {}) => {
    const tasks = Storage.load(Storage.KEYS.TASKS, []);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;
    
    const newVersion = tasks[taskIndex].currentVersion + 1;
    tasks[taskIndex].currentVersion = newVersion;
    tasks[taskIndex].status = 'processing';
    tasks[taskIndex].updatedAt = Date.now();
    Storage.save(Storage.KEYS.TASKS, tasks);
    
    const versions = Storage.load(Storage.KEYS.VERSIONS, []);
    const version = {
      id: Storage.generateId(),
      taskId: taskId,
      versionNumber: newVersion,
      status: 'processing',
      proofOperator: data.proofOperator || '打样员',
      proofTime: Date.now(),
      customerOpinion: '',
      confirmTime: null,
      confirmResult: null
    };
    versions.push(version);
    Storage.save(Storage.KEYS.VERSIONS, versions);
    
    return version;
  };

  const getTaskVersions = (taskId) => {
    const versions = Storage.load(Storage.KEYS.VERSIONS, []);
    return versions
      .filter(v => v.taskId === taskId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  };

  const getCurrentVersion = (taskId) => {
    const versions = getTaskVersions(taskId);
    return versions[0] || null;
  };

  const addIssue = (versionId, issue) => {
    const issues = Storage.load(Storage.KEYS.ISSUES, []);
    const newIssue = {
      id: Storage.generateId(),
      versionId: versionId,
      issueType: issue.issueType,
      description: issue.description,
      positionX: issue.positionX,
      positionY: issue.positionY,
      pageNumber: issue.pageNumber || 1,
      createdAt: Date.now()
    };
    issues.push(newIssue);
    Storage.save(Storage.KEYS.ISSUES, issues);
    return newIssue;
  };

  const getVersionIssues = (versionId) => {
    const issues = Storage.load(Storage.KEYS.ISSUES, []);
    return issues.filter(i => i.versionId === versionId);
  };

  const removeIssue = (issueId) => {
    const issues = Storage.load(Storage.KEYS.ISSUES, []);
    const filtered = issues.filter(i => i.id !== issueId);
    Storage.save(Storage.KEYS.ISSUES, filtered);
    return filtered.length !== issues.length;
  };

  const addPhoto = (versionId, photo) => {
    const photos = Storage.load(Storage.KEYS.PHOTOS, []);
    const newPhoto = {
      id: Storage.generateId(),
      versionId: versionId,
      photoData: photo.photoData,
      description: photo.description || '打样照片',
      uploadedAt: Date.now()
    };
    photos.push(newPhoto);
    Storage.save(Storage.KEYS.PHOTOS, photos);
    return newPhoto;
  };

  const getVersionPhotos = (versionId) => {
    const photos = Storage.load(Storage.KEYS.PHOTOS, []);
    return photos.filter(p => p.versionId === versionId);
  };

  const removePhoto = (photoId) => {
    const photos = Storage.load(Storage.KEYS.PHOTOS, []);
    const filtered = photos.filter(p => p.id !== photoId);
    Storage.save(Storage.KEYS.PHOTOS, filtered);
    return filtered.length !== photos.length;
  };

  const submitForConfirmation = (taskId, operator = '打样员') => {
    const tasks = Storage.load(Storage.KEYS.TASKS, []);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;
    
    tasks[taskIndex].status = 'waiting_confirm';
    tasks[taskIndex].updatedAt = Date.now();
    Storage.save(Storage.KEYS.TASKS, tasks);
    
    const versions = Storage.load(Storage.KEYS.VERSIONS, []);
    const versionIndex = versions.findIndex(v => 
      v.taskId === taskId && v.versionNumber === tasks[taskIndex].currentVersion
    );
    if (versionIndex !== -1) {
      versions[versionIndex].status = 'waiting_confirm';
      versions[versionIndex].proofOperator = operator;
      versions[versionIndex].proofTime = Date.now();
      Storage.save(Storage.KEYS.VERSIONS, versions);
    }
    
    return `${window.location.origin}${window.location.pathname}#/confirm/${tasks[taskIndex].confirmToken}`;
  };

  const confirmTask = (token, result, opinion = '') => {
    const tasks = Storage.load(Storage.KEYS.TASKS, []);
    const taskIndex = tasks.findIndex(t => t.confirmToken === token);
    if (taskIndex === -1) return null;
    
    const newStatus = result === 'approved' ? 'approved' : 'need_revise';
    tasks[taskIndex].status = newStatus;
    tasks[taskIndex].updatedAt = Date.now();
    Storage.save(Storage.KEYS.TASKS, tasks);
    
    const versions = Storage.load(Storage.KEYS.VERSIONS, []);
    const versionIndex = versions.findIndex(v => 
      v.taskId === tasks[taskIndex].id && 
      v.versionNumber === tasks[taskIndex].currentVersion
    );
    if (versionIndex !== -1) {
      versions[versionIndex].status = newStatus;
      versions[versionIndex].customerOpinion = opinion;
      versions[versionIndex].confirmTime = Date.now();
      versions[versionIndex].confirmResult = result;
      Storage.save(Storage.KEYS.VERSIONS, versions);
    }
    
    return tasks[taskIndex];
  };

  const setPriority = (id, priority) => {
    const tasks = Storage.load(Storage.KEYS.TASKS, []);
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index].priority = priority;
      tasks[index].updatedAt = Date.now();
      Storage.save(Storage.KEYS.TASKS, tasks);
      return tasks[index];
    }
    return null;
  };

  const deleteTask = (id) => {
    const tasks = Storage.load(Storage.KEYS.TASKS, []);
    const filteredTasks = tasks.filter(t => t.id !== id);
    Storage.save(Storage.KEYS.TASKS, filteredTasks);
    
    const versions = Storage.load(Storage.KEYS.VERSIONS, []);
    const versionIds = versions.filter(v => v.taskId === id).map(v => v.id);
    const filteredVersions = versions.filter(v => v.taskId !== id);
    Storage.save(Storage.KEYS.VERSIONS, filteredVersions);
    
    const issues = Storage.load(Storage.KEYS.ISSUES, []);
    const filteredIssues = issues.filter(i => !versionIds.includes(i.versionId));
    Storage.save(Storage.KEYS.ISSUES, filteredIssues);
    
    const photos = Storage.load(Storage.KEYS.PHOTOS, []);
    const filteredPhotos = photos.filter(p => !versionIds.includes(p.versionId));
    Storage.save(Storage.KEYS.PHOTOS, filteredPhotos);
    
    return filteredTasks.length !== tasks.length;
  };

  return {
    createTask,
    createBatchTasks,
    getTaskById,
    getTaskByToken,
    getTaskList,
    updateTaskStatus,
    createVersion,
    getTaskVersions,
    getCurrentVersion,
    addIssue,
    getVersionIssues,
    removeIssue,
    addPhoto,
    getVersionPhotos,
    removePhoto,
    submitForConfirmation,
    confirmTask,
    setPriority,
    deleteTask
  };
})();
