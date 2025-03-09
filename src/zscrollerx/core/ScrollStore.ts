import { makeAutoObservable, action, observable } from 'mobx';
import { ScrollOptions } from './types';

export class ScrollStore {
  // 状态
  scrollX: number = 0;
  scrollY: number = 0;
  maxScrollX: number = 0;
  maxScrollY: number = 0;
  isDragging: boolean = false;
  isMomentumScrolling: boolean = false;
  isScrolling: boolean = false;
  isScrollbarVisible: boolean = false;
  
  // 尺寸数据
  contentWidth: number = 0;
  contentHeight: number = 0;
  viewportWidth: number = 0;
  viewportHeight: number = 0;
  
  // 动画相关
  private animationFrame: number | null = null;
  
  // 配置
  options: Required<ScrollOptions>;

  constructor(options: ScrollOptions = {}) {
    makeAutoObservable(this, {
      scrollX: observable,
      scrollY: observable,
      maxScrollX: observable,
      maxScrollY: observable,
      isDragging: observable,
      isMomentumScrolling: observable,
      isScrolling: observable,
      isScrollbarVisible: observable,
      
      scrollTo: action,
      scrollBy: action,
      startDrag: action,
      endDrag: action,
      setContentDimensions: action,
      setViewportDimensions: action,
    });
    
    // 设置默认配置，将 bounceEnabled 默认为 false
    this.options = {
      bounceEnabled: false, // 默认禁用回弹效果
      scrollingX: true,
      scrollingY: true,
      lockDirection: true,
      scrollbarSize: 6,
      scrollbarColor: 'rgba(0,0,0,0.4)',
      scrollbarOpacity: 0.6,
      scrollbarActiveOpacity: 0.8,
      momentum: true,
      momentumFactor: 0.9,
      onScroll: () => {},
      onScrollStart: () => {},
      onScrollEnd: () => {},
      ...options
    };
  }

  // 根据增量滚动
  scrollBy(deltaX: number, deltaY: number, animate: boolean = false): void {
    // 如果配置不允许特定方向滚动，则忽略该方向的增量
    if (!this.options.scrollingX) deltaX = 0;
    if (!this.options.scrollingY) deltaY = 0;
    
    // 调整滚轮滚动速度，接近浏览器原生速度
    const factor = 1; // 恢复到正常速度
    deltaX *= factor;
    deltaY *= factor;
    
    // 计算目标滚动位置
    const targetX = this.scrollX + deltaX;
    const targetY = this.scrollY + deltaY;
    
    // 使用 scrollTo 方法，它会处理边界检查
    this.scrollTo(targetX, targetY, animate);
  }

  // 滚动到指定位置
  scrollTo(x: number, y: number, animate: boolean = false): void {
    // 保存旧值用于比较
    const oldX = this.scrollX;
    const oldY = this.scrollY;
    
    // 不管 bounceEnabled 设置如何，始终严格限制在边界内
    x = Math.max(0, Math.min(x, this.maxScrollX));
    y = Math.max(0, Math.min(y, this.maxScrollY));
    
    // 如果位置未改变或变化很小，可能不值得更新（减少微小波动）
    const epsilon = 0.1; // 小于此值的变化忽略不计
    if (Math.abs(x - oldX) < epsilon && Math.abs(y - oldY) < epsilon) {
      return;
    }
    
    // 更新滚动状态
    if (!this.isScrolling) {
      this.isScrolling = true;
      this.isScrollbarVisible = true;
      this.options.onScrollStart();
    }
    
    // 设置新的滚动位置
    this.scrollX = x;
    this.scrollY = y;
    
    // 回调函数
    this.options.onScroll(this.scrollX, this.scrollY);
    
    // 简化滚动动画逻辑
    if (animate) {
      this.animateScroll(x, y);
    }
  }
  
  // 设置内容尺寸
  setContentDimensions(width: number, height: number): void {
    this.contentWidth = width;
    this.contentHeight = height;
    this.updateMaxScrollValues();
  }
  
  // 设置视口尺寸
  setViewportDimensions(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.updateMaxScrollValues();
  }
  
  // 更新最大滚动值
  private updateMaxScrollValues(): void {
    // 计算最大滚动范围 (内容尺寸减去视口尺寸)
    this.maxScrollX = Math.max(0, this.contentWidth - this.viewportWidth);
    this.maxScrollY = Math.max(0, this.contentHeight - this.viewportHeight);
    
    // 如果当前滚动位置超出范围，调整它
    if (this.scrollX > this.maxScrollX) {
      this.scrollX = this.maxScrollX;
    }
    
    if (this.scrollY > this.maxScrollY) {
      this.scrollY = this.maxScrollY;
    }
  }
  
  // 开始拖动
  startDrag(): void {
    this.isDragging = true;
    this.isScrollbarVisible = true;
    
    // 停止所有动画
    this.stopAnimation();
  }
  
  // 结束拖动
  endDrag(velocityX: number = 0, velocityY: number = 0): void {
    this.isDragging = false;
    
    // 约束到有效范围内
    let x = this.scrollX;
    let y = this.scrollY;
    
    if (x < 0) x = 0;
    else if (x > this.maxScrollX) x = this.maxScrollX;
    
    if (y < 0) y = 0;
    else if (y > this.maxScrollY) y = this.maxScrollY;
    
    // 如果需要校正位置，先滚动到有效范围
    if (x !== this.scrollX || y !== this.scrollY) {
      this.scrollTo(x, y, true);
      return;
    }
    
    if (this.options.momentum && (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1)) {
      this.startMomentumScroll(velocityX, velocityY);
    } else {
      this.finishScrolling();
    }
  }
  
  // 启动动量滚动
  private startMomentumScroll(velocityX: number, velocityY: number): void {
    this.isMomentumScrolling = true;
    
    let lastTimestamp = Date.now();
    // 增加初始速度，减少阻尼感
    let currentVelocityX = velocityX * 800; // 增加初始速度
    let currentVelocityY = velocityY * 800;
    
    // 减少衰减程度跟踪的初始值，使开始更顺滑
    let dampingX = 0.92;
    let dampingY = 0.92;
    
    const animate = () => {
      const now = Date.now();
      const deltaTime = Math.min(now - lastTimestamp, 33); // 限制最大时间差，确保丝滑
      lastTimestamp = now;
      
      // 使用更接近原生的摩擦系数
      const baseFriction = 0.98; // 减小摩擦系数，使滚动更流畅
      
      // 减少渐进式阻尼的增长速度
      dampingX = Math.min(0.98, dampingX + 0.0005 * deltaTime); // 更缓慢地增加阻尼
      dampingY = Math.min(0.98, dampingY + 0.0005 * deltaTime);
      
      // 应用阻尼
      const frictionX = Math.pow(baseFriction, deltaTime / 16.7) * dampingX;
      const frictionY = Math.pow(baseFriction, deltaTime / 16.7) * dampingY;
      
      currentVelocityX *= frictionX;
      currentVelocityY *= frictionY;
      
      // 计算新位置，使用更精确的时间因子
      const deltaX = currentVelocityX * (deltaTime / 1000);
      const deltaY = currentVelocityY * (deltaTime / 1000);
      
      // 预测下一个位置
      const nextX = this.scrollX + deltaX;
      const nextY = this.scrollY + deltaY;
      
      // 边界检测
      if (nextX < 0 || nextX > this.maxScrollX || nextY < 0 || nextY > this.maxScrollY) {
        // 在边界处优雅地停止
        const finalX = Math.max(0, Math.min(nextX, this.maxScrollX));
        const finalY = Math.max(0, Math.min(nextY, this.maxScrollY));
        
        // 减少软着陆动画时间，使其更接近原生
        this.animateScroll(finalX, finalY, 150);
        return;
      }
      
      // 正常滚动，使用更精确的位置更新
      this.scrollX = nextX;
      this.scrollY = nextY;
      this.options.onScroll(this.scrollX, this.scrollY);
      
      // 使用更小的最小速度阈值，让滚动更自然地停止
      const minVelocity = 0.2; // 减小阈值，使动画延续更长时间
      
      if (Math.abs(currentVelocityX) < minVelocity && Math.abs(currentVelocityY) < minVelocity) {
        // 使用更短的结束动画
        const targetX = Math.round(this.scrollX);
        const targetY = Math.round(this.scrollY);
        
        if (Math.abs(targetX - this.scrollX) > 0.1 || Math.abs(targetY - this.scrollY) > 0.1) {
          this.animateScroll(targetX, targetY, 80); // 减少最终动画时间
        } else {
          this.stopAnimation();
          this.finishScrolling();
        }
        return;
      }
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }
  
  // 改进动画函数，支持自定义持续时间
  private animateScroll(targetX: number, targetY: number, customDuration?: number): void {
    this.stopAnimation();
    
    const startX = this.scrollX;
    const startY = this.scrollY;
    const deltaX = targetX - startX;
    const deltaY = targetY - startY;
    const startTime = Date.now();
    
    // 使用自定义持续时间或基于距离的计算
    let duration: number;
    
    if (customDuration !== undefined) {
      duration = customDuration;
    } else {
      // 小距离使用短时间，大距离使用长时间但有上限
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      duration = Math.min(300, 80 + Math.sqrt(distance) * 4);
    }
    
    // 非常小的移动使用更短的持续时间
    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
      duration = Math.min(duration, 100);
    }
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      // 使用更精细的缓动函数，确保结束时更平滑
      const easedProgress = this.smoothEasing(progress);
      
      // 使用更精确的位置计算
      this.scrollX = startX + deltaX * easedProgress;
      this.scrollY = startY + deltaY * easedProgress;
      
      // 当接近目标时，直接设置为目标值，避免舍入错误
      if (progress > 0.99) {
        this.scrollX = targetX;
        this.scrollY = targetY;
      }
      
      this.options.onScroll(this.scrollX, this.scrollY);
      
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.stopAnimation();
        this.finishScrolling();
      }
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }
  
  // 平滑的缓动函数，确保开始和结束都很平滑
  private smoothEasing(t: number): number {
    // 结合多个缓动函数，确保开始和结束都非常平滑
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  // 停止动画
  private stopAnimation(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.isMomentumScrolling = false;
  }
  
  // 完成滚动
  private finishScrolling(): void {
    this.isScrolling = false;
    this.options.onScrollEnd();
    
    // 渐隐滚动条，与原生浏览器一致
    if (!this.isDragging) {
      // 延迟隐藏，给用户一点时间看到滚动位置
      setTimeout(() => {
        if (!this.isDragging && !this.isScrolling) {
          this.isScrollbarVisible = false;
        }
      }, 1500); // 延长显示时间，与大多数浏览器一致
    }
  }
} 