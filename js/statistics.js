const Statistics = (() => {
  const getMonthlyStats = (year, month) => {
    const tasks = Storage.load(Storage.KEYS.TASKS, []);
    const versions = Storage.load(Storage.KEYS.VERSIONS, []);
    
    const startDate = new Date(year, month - 1, 1).getTime();
    const endDate = new Date(year, month, 1).getTime();
    
    const monthTasks = tasks.filter(t => 
      t.createdAt >= startDate && t.createdAt < endDate
    );
    
    const total = monthTasks.length;
    const approved = monthTasks.filter(t => t.status === 'approved').length;
    const passRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    
    let totalRevisions = 0;
    monthTasks.forEach(t => {
      const taskVersions = versions.filter(v => v.taskId === t.id);
      totalRevisions += Math.max(0, taskVersions.length - 1);
    });
    const avgRevisions = total > 0 ? (totalRevisions / total).toFixed(1) : 0;
    
    const pending = monthTasks.filter(t => 
      t.status === 'pending' || t.status === 'processing' || t.status === 'waiting_confirm'
    ).length;
    
    return {
      total,
      approved,
      passRate,
      avgRevisions,
      pending
    };
  };

  const getTrendData = (months = 6) => {
    const now = new Date();
    const data = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const stats = getMonthlyStats(date.getFullYear(), date.getMonth() + 1);
      data.push({
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: `${date.getMonth() + 1}月`,
        total: stats.total,
        passRate: stats.passRate
      });
    }
    
    return data;
  };

  const calculatePassRate = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const approved = tasks.filter(t => t.status === 'approved').length;
    return Math.round((approved / tasks.length) * 100);
  };

  const calculateAvgRevisions = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const versions = Storage.load(Storage.KEYS.VERSIONS, []);
    
    let totalRevisions = 0;
    tasks.forEach(t => {
      const taskVersions = versions.filter(v => v.taskId === t.id);
      totalRevisions += Math.max(0, taskVersions.length - 1);
    });
    
    return (totalRevisions / tasks.length).toFixed(1);
  };

  const getPaperTypeStats = () => {
    const tasks = Storage.load(Storage.KEYS.TASKS, []);
    const stats = {};
    
    tasks.forEach(t => {
      const type = t.paperType;
      if (!stats[type]) {
        stats[type] = 0;
      }
      stats[type]++;
    });
    
    return Object.entries(stats).map(([type, count]) => ({
      type,
      label: Storage.getPaperTypeText(type),
      count,
      percentage: tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  };

  const getBindingTypeStats = () => {
    const tasks = Storage.load(Storage.KEYS.TASKS, []);
    const stats = {};
    
    tasks.forEach(t => {
      const type = t.bindingType;
      if (!stats[type]) {
        stats[type] = 0;
      }
      stats[type]++;
    });
    
    return Object.entries(stats).map(([type, count]) => ({
      type,
      label: Storage.getBindingTypeText(type),
      count,
      percentage: tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  };

  const getCustomerStats = () => {
    const tasks = Storage.load(Storage.KEYS.TASKS, []);
    const stats = {};
    
    tasks.forEach(t => {
      const customer = t.customerName;
      if (!stats[customer]) {
        stats[customer] = { total: 0, approved: 0 };
      }
      stats[customer].total++;
      if (t.status === 'approved') {
        stats[customer].approved++;
      }
    });
    
    return Object.entries(stats).map(([customer, data]) => ({
      customer,
      total: data.total,
      approved: data.approved,
      passRate: data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0
    })).sort((a, b) => b.total - a.total);
  };

  const drawLineChart = (container, data, options = {}) => {
    const width = container.clientWidth || 600;
    const height = 300;
    const padding = { top: 20, right: 30, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const maxValue = Math.max(...data.map(d => d.value), 10);
    const minValue = 0;
    
    let svg = container.querySelector('svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      container.appendChild(svg);
    } else {
      svg.innerHTML = '';
    }
    
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'lineGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', options.color || '#1e3a5f');
    stop1.setAttribute('stop-opacity', '0.3');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', options.color || '#1e3a5f');
    stop2.setAttribute('stop-opacity', '0');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);
    
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padding.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - padding.right);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#e0e0d8');
      line.setAttribute('stroke-dasharray', '4,4');
      svg.appendChild(line);
      
      const value = maxValue - ((maxValue - minValue) / 5) * i;
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', padding.left - 10);
      text.setAttribute('y', y + 4);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('fill', '#8a8a8a');
      text.setAttribute('font-size', '12');
      text.textContent = Math.round(value);
      svg.appendChild(text);
    }
    
    const xStep = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;
    
    const points = data.map((d, i) => {
      const x = padding.left + (data.length > 1 ? xStep * i : chartWidth / 2);
      const y = padding.top + chartHeight - ((d.value - minValue) / (maxValue - minValue)) * chartHeight;
      return { x, y, ...d };
    });
    
    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let areaD = `M ${points[0].x} ${padding.top + chartHeight}`;
    points.forEach(p => {
      areaD += ` L ${p.x} ${p.y}`;
    });
    areaD += ` L ${points[points.length - 1].x} ${padding.top + chartHeight} Z`;
    areaPath.setAttribute('d', areaD);
    areaPath.setAttribute('fill', 'url(#lineGradient)');
    svg.appendChild(areaPath);
    
    const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let lineD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      lineD += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    linePath.setAttribute('d', lineD);
    linePath.setAttribute('fill', 'none');
    linePath.setAttribute('stroke', options.color || '#1e3a5f');
    linePath.setAttribute('stroke-width', '2');
    linePath.setAttribute('stroke-linecap', 'round');
    svg.appendChild(linePath);
    
    points.forEach((p, i) => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.style.cursor = 'pointer';
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', p.x);
      circle.setAttribute('cy', p.y);
      circle.setAttribute('r', '5');
      circle.setAttribute('fill', 'white');
      circle.setAttribute('stroke', options.color || '#1e3a5f');
      circle.setAttribute('stroke-width', '2');
      group.appendChild(circle);
      
      const xText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      xText.setAttribute('x', p.x);
      xText.setAttribute('y', height - padding.bottom + 20);
      xText.setAttribute('text-anchor', 'middle');
      xText.setAttribute('fill', '#5c5c5c');
      xText.setAttribute('font-size', '12');
      xText.textContent = p.label;
      svg.appendChild(xText);
      
      const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      tooltip.setAttribute('opacity', '0');
      tooltip.setAttribute('class', 'chart-tooltip');
      
      const tooltipBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      tooltipBg.setAttribute('x', p.x - 40);
      tooltipBg.setAttribute('y', p.y - 45);
      tooltipBg.setAttribute('width', '80');
      tooltipBg.setAttribute('height', '30');
      tooltipBg.setAttribute('rx', '4');
      tooltipBg.setAttribute('fill', '#1a1a1a');
      tooltip.appendChild(tooltipBg);
      
      const tooltipText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tooltipText.setAttribute('x', p.x);
      tooltipText.setAttribute('y', p.y - 25);
      tooltipText.setAttribute('text-anchor', 'middle');
      tooltipText.setAttribute('fill', 'white');
      tooltipText.setAttribute('font-size', '12');
      tooltipText.setAttribute('font-weight', '500');
      tooltipText.textContent = `${options.valuePrefix || ''}${p.value}${options.valueSuffix || ''}`;
      tooltip.appendChild(tooltipText);
      
      group.appendChild(tooltip);
      
      group.addEventListener('mouseenter', () => {
        circle.setAttribute('r', '7');
        tooltip.setAttribute('opacity', '1');
      });
      group.addEventListener('mouseleave', () => {
        circle.setAttribute('r', '5');
        tooltip.setAttribute('opacity', '0');
      });
      
      svg.appendChild(group);
    });
  };

  const drawPieChart = (container, data, options = {}) => {
    const width = container.clientWidth || 300;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 40;
    const centerX = width / 2;
    const centerY = height / 2;
    
    let svg = container.querySelector('svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      container.appendChild(svg);
    } else {
      svg.innerHTML = '';
    }
    
    const colors = options.colors || ['#1e3a5f', '#e85d04', '#2d6a4f', '#d4a72c', '#1d72b8', '#ba181b'];
    
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let startAngle = -Math.PI / 2;
    
    data.forEach((d, i) => {
      const sliceAngle = (d.value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`);
      path.setAttribute('fill', colors[i % colors.length]);
      path.style.cursor = 'pointer';
      path.style.transition = 'transform 0.2s';
      path.style.transformOrigin = `${centerX}px ${centerY}px`;
      
      path.addEventListener('mouseenter', () => {
        path.style.transform = 'scale(1.05)';
      });
      path.addEventListener('mouseleave', () => {
        path.style.transform = 'scale(1)';
      });
      
      svg.appendChild(path);
      
      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.65;
      const labelX = centerX + labelRadius * Math.cos(midAngle);
      const labelY = centerY + labelRadius * Math.sin(midAngle);
      
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', labelX);
      label.setAttribute('y', labelY);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('fill', 'white');
      label.setAttribute('font-size', '12');
      label.setAttribute('font-weight', '500');
      label.textContent = `${d.percentage}%`;
      svg.appendChild(label);
      
      startAngle = endAngle;
    });
    
    const legendY = height - 30;
    const legendItemWidth = width / data.length;
    
    data.forEach((d, i) => {
      const legendX = legendItemWidth * i + legendItemWidth / 2;
      
      const legendColor = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      legendColor.setAttribute('x', legendX - 50);
      legendColor.setAttribute('y', legendY);
      legendColor.setAttribute('width', '12');
      legendColor.setAttribute('height', '12');
      legendColor.setAttribute('rx', '2');
      legendColor.setAttribute('fill', colors[i % colors.length]);
      svg.appendChild(legendColor);
      
      const legendText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      legendText.setAttribute('x', legendX - 35);
      legendText.setAttribute('y', legendY + 10);
      legendText.setAttribute('fill', '#5c5c5c');
      legendText.setAttribute('font-size', '11');
      legendText.textContent = `${d.label}: ${d.value}`;
      svg.appendChild(legendText);
    });
  };

  return {
    getMonthlyStats,
    getTrendData,
    calculatePassRate,
    calculateAvgRevisions,
    getPaperTypeStats,
    getBindingTypeStats,
    getCustomerStats,
    drawLineChart,
    drawPieChart
  };
})();
