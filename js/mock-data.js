const MockData = (() => {
  const createSampleImage = (width, height, color) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, height - 40);
    
    ctx.fillStyle = color;
    ctx.font = 'bold 24px serif';
    ctx.fillText('印刷打样样张', width / 2 - 80, height / 2);
    
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('Sample Proof Document', width / 2 - 70, height / 2 + 30);
    
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(40, 100 + i * 25);
      ctx.lineTo(width - 40, 100 + i * 25);
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const createSamplePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 400, 300);
    gradient.addColorStop(0, '#f5f5f0');
    gradient.addColorStop(1, '#e0e0d8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(50, 50, 300, 200);
    
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, 300, 200);
    
    ctx.fillStyle = '#333';
    ctx.font = '16px sans-serif';
    ctx.fillText('打样照片', 160, 160);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const customers = [
    '张三 - 品牌设计',
    '李四 - 广告公司',
    '王五 - 出版社',
    '赵六 - 企业宣传',
    '孙七 - 个人工作室'
  ];

  const fileNames = [
    '产品手册封面.pdf',
    '公司宣传册.pdf',
    '期刊内页设计.jpg',
    '海报设计稿.pdf',
    '包装设计.jpg',
    '书籍封面设计.pdf',
    '名片设计稿.jpg',
    '画册内页.pdf'
  ];

  const init = () => {
    const existingTasks = Storage.load(Storage.KEYS.TASKS, []);
    if (existingTasks.length > 0) return;

    const now = Date.now();
    const tasks = [];
    const versions = [];
    const issues = [];
    const photos = [];

    for (let i = 0; i < 8; i++) {
      const taskId = Storage.generateId();
      const token = Storage.generateToken();
      const customer = customers[i % customers.length];
      const fileName = fileNames[i % fileNames.length];
      const fileType = fileName.endsWith('.pdf') ? 'pdf' : 'jpg';
      const statuses = ['pending', 'processing', 'waiting_confirm', 'approved', 'need_revise', 'waiting_confirm', 'approved', 'pending'];
      const status = statuses[i];
      const isUrgent = i < 2;
      
      const paperTypes = ['coated_157', 'coated_200', 'coated_250', 'coated_300', 'matte_157', 'matte_200', 'specialty', 'newsprint'];
      const bindingTypes = ['perfect', 'saddle', 'sewn', 'spiral', 'case', 'none'];
      
      const task = {
        id: taskId,
        customerName: customer,
        fileName: fileName,
        fileType: fileType,
        fileData: fileType === 'pdf' ? null : createSampleImage(800, 600, '#1e3a5f'),
        printQuantity: Math.floor(Math.random() * 5000) + 500,
        paperType: paperTypes[i % 4],
        bindingType: bindingTypes[i % 4],
        priority: isUrgent ? 'urgent' : 'normal',
        status: status,
        confirmToken: token,
        createdAt: now - (i * 86400000 + Math.random() * 86400000),
        updatedAt: now - (i * 86400000),
        currentVersion: status === 'approved' ? 2 : 1
      };
      
      tasks.push(task);

      for (let v = 1; v <= task.currentVersion; v++) {
        const versionId = Storage.generateId();
        const version = {
          id: versionId,
          taskId: taskId,
          versionNumber: v,
          status: v === task.currentVersion ? status : (v === 1 ? 'need_revise' : 'approved'),
          proofOperator: '打样员' + ((v + i) % 3),
          proofTime: now - ((i + v) * 86400000),
          customerOpinion: v === 1 ? '颜色需要调整，整体偏暗' : '',
          confirmTime: v < task.currentVersion ? now - ((i + v) * 43200000) : null,
          confirmResult: v < task.currentVersion ? 'need_revise' : null
        };
        versions.push(version);

        if (status !== 'pending') {
          const issueTypes = ['color', 'cut', 'binding'];
          for (let j = 0; j < 2; j++) {
            issues.push({
              id: Storage.generateId(),
              versionId: versionId,
              issueType: issueTypes[j % 3],
              description: ['颜色偏差，红色偏暗', '裁切位置需要调整2mm', '装订边距不够'][j % 3],
              positionX: 20 + Math.random() * 60,
              positionY: 20 + Math.random() * 60,
              pageNumber: 1,
              createdAt: now - ((i + v + j) * 3600000)
            });
          }

          photos.push({
            id: Storage.generateId(),
            versionId: versionId,
            photoData: createSamplePhoto(),
            description: '打样实拍照片',
            uploadedAt: now - ((i + v) * 3600000)
          });
        }
      }
    }

    Storage.save(Storage.KEYS.TASKS, tasks, false);
    Storage.save(Storage.KEYS.VERSIONS, versions, false);
    Storage.save(Storage.KEYS.ISSUES, issues, false);
    Storage.save(Storage.KEYS.PHOTOS, photos, false);
  };

  return { init, createSampleImage, createSamplePhoto };
})();
