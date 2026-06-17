const Storage = (() => {
  const KEYS = {
    TASKS: 'proof_tasks',
    VERSIONS: 'proof_versions',
    ISSUES: 'proof_issues',
    PHOTOS: 'proof_photos',
    CONFIG: 'system_config'
  };

  let debounceTimers = {};

  const save = (key, data, debounce = true) => {
    if (debounce) {
      clearTimeout(debounceTimers[key]);
      debounceTimers[key] = setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(data));
      }, 100);
    } else {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const load = (key, defaultValue = []) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error('Storage load error:', e);
      return defaultValue;
    }
  };

  const generateId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
  };

  const generateToken = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: '待打样',
      processing: '打样中',
      waiting_confirm: '待客户确认',
      approved: '已通过',
      need_revise: '需修改'
    };
    return statusMap[status] || status;
  };

  const getPriorityText = (priority) => {
    return priority === 'urgent' ? '紧急' : '普通';
  };

  const getPaperTypeText = (type) => {
    const map = {
      coated_157: '铜版纸 157g',
      coated_200: '铜版纸 200g',
      coated_250: '铜版纸 250g',
      coated_300: '铜版纸 300g',
      matte_157: '哑粉纸 157g',
      matte_200: '哑粉纸 200g',
      matte_250: '哑粉纸 250g',
      specialty: '特种纸',
      newsprint: '新闻纸'
    };
    return map[type] || type;
  };

  const getBindingTypeText = (type) => {
    const map = {
      perfect: '无线胶装',
      saddle: '骑马钉',
      sewn: '锁线装订',
      spiral: '螺旋装订',
      case: '硬壳精装',
      none: '无需装订'
    };
    return map[type] || type;
  };

  const getIssueTypeText = (type) => {
    const map = {
      color: '色差',
      cut: '裁切',
      binding: '装订'
    };
    return map[type] || type;
  };

  return {
    KEYS,
    save,
    load,
    generateId,
    generateToken,
    formatDate,
    formatFileSize,
    getStatusText,
    getPriorityText,
    getPaperTypeText,
    getBindingTypeText,
    getIssueTypeText
  };
})();
