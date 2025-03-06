// city-view.js
import { 
  getCity, 
  getBuildings, 
  getBuildingTypes, 
  mergeBuildings, 
  handleApiError 
} from '../../services/api';

// Constants for the city grid
const GRID_SIZE = 10; // 10x10 grid
const BUILDING_COLORS = [
  '#8ecae6', // Level 1
  '#219ebc', // Level 2
  '#023047', // Level 3
  '#ffb703', // Level 4
  '#fb8500'  // Level 5
];

Page({
  data: {
    buildings: [],
    buildingTypes: [],
    selectedBuilding: null,
    showMergePanel: false,
    mergeCandidates: [],
    selectedBuildingsCount: 0,
    canMergeBuildings: false,
    loading: true,
    // Canvas properties
    canvasWidth: 0,
    canvasHeight: 0,
    cellSize: 0,
    // Touch handling
    touchStartX: 0,
    touchStartY: 0,
    isDragging: false
  },
  
  onLoad: function() {
    // Get the system info to set canvas size
    const systemInfo = wx.getSystemInfoSync();
    const canvasWidth = systemInfo.windowWidth - 60; // 30rpx padding on each side
    const canvasHeight = canvasWidth; // Square canvas
    const cellSize = canvasWidth / GRID_SIZE;
    
    this.setData({
      canvasWidth,
      canvasHeight,
      cellSize
    });
    
    // Initialize canvas context
    this.ctx = wx.createCanvasContext('cityCanvas');
    
    // Load data
    this.fetchData();
  },
  
  onShow: function() {
    // Refresh data when returning to this page
    this.fetchData();
  },
  
  fetchData: function() {
    this.setData({ loading: true });
    
    // Fetch buildings and building types
    Promise.all([
      getBuildings(),
      getBuildingTypes(),
      getCity()
    ])
      .then(([buildings, buildingTypes, city]) => {
        this.setData({ 
          buildings,
          buildingTypes,
          city,
          loading: false,
          selectedBuilding: null,
          showMergePanel: false
        });
        
        // Draw the city
        this.drawCity();
      })
      .catch(error => {
        console.error('Failed to fetch data:', error);
        handleApiError(error);
        this.setData({ loading: false });
      });
  },
  
  drawCity: function() {
    const { canvasWidth, canvasHeight, cellSize, buildings } = this.data;
    const ctx = this.ctx;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw grid
    ctx.setStrokeStyle('#e8e8e8');
    ctx.setLineWidth(1);
    
    // Draw horizontal grid lines
    for (let i = 0; i <= GRID_SIZE; i++) {
      const y = i * cellSize;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
    
    // Draw vertical grid lines
    for (let i = 0; i <= GRID_SIZE; i++) {
      const x = i * cellSize;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    
    // Draw buildings
    buildings.forEach(building => {
      this.drawBuilding(building);
    });
    
    // Draw to canvas
    ctx.draw();
  },
  
  drawBuilding: function(building) {
    const { cellSize } = this.data;
    const ctx = this.ctx;
    
    // Calculate position
    const x = building.x * cellSize;
    const y = building.y * cellSize;
    
    // Building size based on level (higher level = larger building)
    const sizeMultiplier = 0.6 + (building.level * 0.08);
    const buildingSize = cellSize * sizeMultiplier;
    const offset = (cellSize - buildingSize) / 2;
    
    // Get color based on level (capped at max color index)
    const colorIndex = Math.min(building.level - 1, BUILDING_COLORS.length - 1);
    const color = BUILDING_COLORS[colorIndex];
    
    // Draw building
    ctx.setFillStyle(color);
    
    // Draw different shapes based on building type
    const buildingType = building.type_id % 4; // Use modulo to ensure we have a valid type
    
    switch (buildingType) {
      case 0: // Rectangle (house)
        ctx.fillRect(x + offset, y + offset, buildingSize, buildingSize);
        break;
      case 1: // Circle (park/public building)
        ctx.beginPath();
        ctx.arc(x + cellSize/2, y + cellSize/2, buildingSize/2, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 2: // Triangle (commercial)
        ctx.beginPath();
        ctx.moveTo(x + cellSize/2, y + offset);
        ctx.lineTo(x + offset, y + cellSize - offset);
        ctx.lineTo(x + cellSize - offset, y + cellSize - offset);
        ctx.closePath();
        ctx.fill();
        break;
      case 3: // Diamond (special building)
        ctx.beginPath();
        ctx.moveTo(x + cellSize/2, y + offset);
        ctx.lineTo(x + cellSize - offset, y + cellSize/2);
        ctx.lineTo(x + cellSize/2, y + cellSize - offset);
        ctx.lineTo(x + offset, y + cellSize/2);
        ctx.closePath();
        ctx.fill();
        break;
    }
    
    // If this is a special building (e.g., Palace in Beijing), add a highlight
    if (building.is_special) {
      ctx.setStrokeStyle('#FFD700'); // Gold color
      ctx.setLineWidth(3);
      ctx.strokeRect(x + offset - 2, y + offset - 2, buildingSize + 4, buildingSize + 4);
    }
    
    // If selected, draw a selection indicator
    if (this.data.selectedBuilding && building.id === this.data.selectedBuilding.id) {
      ctx.setStrokeStyle('#4a6bff'); // Primary color
      ctx.setLineWidth(3);
      ctx.strokeRect(x + offset - 2, y + offset - 2, buildingSize + 4, buildingSize + 4);
    }
  },
  
  handleTouchStart: function(e) {
    const touch = e.touches[0];
    this.setData({
      touchStartX: touch.x,
      touchStartY: touch.y,
      isDragging: false
    });
    
    // Check if a building was tapped
    this.checkBuildingTap(touch.x, touch.y);
  },
  
  handleTouchMove: function(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.x - this.data.touchStartX);
      const deltaY = Math.abs(touch.y - this.data.touchStartY);
      
      // If moved more than a threshold, consider it a drag
      if (deltaX > 10 || deltaY > 10) {
        this.setData({ isDragging: true });
      }
    }
  },
  
  handleTouchEnd: function(e) {
    // If it was a drag, don't process as a tap
    if (this.data.isDragging) {
      this.setData({ isDragging: false });
      return;
    }
  },
  
  checkBuildingTap: function(x, y) {
    const { buildings, cellSize } = this.data;
    
    // Convert tap coordinates to grid coordinates
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
    
    // Find building at this grid position
    const tappedBuilding = buildings.find(b => b.x === gridX && b.y === gridY);
    
    if (tappedBuilding) {
      // Get building type info
      const buildingType = this.data.buildingTypes.find(t => t.id === tappedBuilding.type_id);
      
      // Check if there are other buildings of the same type and level for merging
      const mergeCandidates = buildings.filter(b => 
        b.type_id === tappedBuilding.type_id && 
        b.level === tappedBuilding.level
      );
      
      const canMergeBuildings = mergeCandidates.length >= 2;
      
      // Set selected building with additional info
      this.setData({
        selectedBuilding: {
          ...tappedBuilding,
          name: buildingType ? buildingType.name : '未知建筑',
          description: buildingType ? buildingType.description : '',
          category_name: tappedBuilding.category_name || '未知分类',
          transaction_type: tappedBuilding.transaction_type === 'income' ? '收入' : '支出'
        },
        canMergeBuildings
      });
      
      // Redraw to show selection
      this.drawCity();
    } else {
      // Tapped empty space, clear selection
      this.setData({
        selectedBuilding: null,
        showMergePanel: false
      });
      
      // Redraw to clear selection
      this.drawCity();
    }
  },
  
  closeInfoPanel: function() {
    this.setData({
      selectedBuilding: null,
      showMergePanel: false
    });
    
    // Redraw to clear selection
    this.drawCity();
  },
  
  showMergeOptions: function() {
    const { buildings, selectedBuilding } = this.data;
    
    // Find buildings of the same type and level
    const mergeCandidates = buildings
      .filter(b => 
        b.type_id === selectedBuilding.type_id && 
        b.level === selectedBuilding.level
      )
      .map(b => ({
        ...b,
        selected: b.id === selectedBuilding.id // Pre-select the current building
      }));
    
    this.setData({
      showMergePanel: true,
      mergeCandidates,
      selectedBuildingsCount: 1 // Start with 1 since the current building is pre-selected
    });
  },
  
  toggleBuildingSelection: function(e) {
    const buildingId = e.currentTarget.dataset.id;
    const { mergeCandidates, selectedBuildingsCount } = this.data;
    
    // Update the selection state
    const updatedCandidates = mergeCandidates.map(b => {
      if (b.id === buildingId) {
        return { ...b, selected: !b.selected };
      }
      return b;
    });
    
    // Count selected buildings
    const newSelectedCount = updatedCandidates.filter(b => b.selected).length;
    
    this.setData({
      mergeCandidates: updatedCandidates,
      selectedBuildingsCount: newSelectedCount
    });
  },
  
  cancelMerge: function() {
    this.setData({
      showMergePanel: false
    });
  },
  
  mergeSelectedBuildings: function() {
    const { mergeCandidates } = this.data;
    const selectedBuildingIds = mergeCandidates
      .filter(b => b.selected)
      .map(b => b.id);
    
    if (selectedBuildingIds.length < 2) {
      wx.showToast({
        title: '请选择至少两个建筑',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ loading: true });
    
    mergeBuildings({ building_ids: selectedBuildingIds })
      .then(newBuilding => {
        wx.showToast({
          title: '合并成功',
          icon: 'success'
        });
        
        // Refresh data
        this.fetchData();
      })
      .catch(error => {
        console.error('Failed to merge buildings:', error);
        handleApiError(error);
        this.setData({ loading: false });
      });
  },
  
  navigateToTransactions: function() {
    wx.switchTab({
      url: '/pages/transactions/transactions'
    });
  }
});
