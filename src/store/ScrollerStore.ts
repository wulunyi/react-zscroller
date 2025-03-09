import { makeAutoObservable, action, observable } from 'mobx';
import type { ScrollOptions, ScrollPosition } from '../types';

export class ScrollerStore {
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
    // 设置默认选项
    this.options = {
      // 滚动方向控制
      scrollingX: options.scrollingX !== undefined ? options.scrollingX : true,
      scrollingY: options.scrollingY !== undefined ? options.scrollingY : true,
      
      // 回弹和动量效果
      bounceEnabled: options.bounceEnabled !== undefined ? options.bounceEnabled : false,
      momentum: options.momentum !== undefined ? options.momentum : true,
      // 使用更高效的动量因子
      momentumFactor: options.momentumFactor !== undefined ? options.momentumFactor : 0.92,
      
      // 滚动条样式
      scrollbarSize: options.scrollbarSize !== undefined ? options.scrollbarSize : 6,
      scrollbarColor: options.scrollbarColor || 'rgba(0,0,0,0.4)',
      scrollbarOpacity: options.scrollbarOpacity !== undefined ? options.scrollbarOpacity : 0.3,
      scrollbarActiveOpacity: options.scrollbarActiveOpacity !== undefined ? options.scrollbarActiveOpacity : 0.8,
      
      // 滚动控制
      lockDirection: options.lockDirection !== undefined ? options.lockDirection : false,
      
      // 优化滚轮控制
      wheelScrollSpeed: options.wheelScrollSpeed !== undefined ? options.wheelScrollSpeed : 5,
      smoothWheel: options.smoothWheel !== undefined ? options.smoothWheel : true,
      
      // 简化动画时间配置
      animationDuration: options.animationDuration !== undefined ? options.animationDuration : 300,
      wheelAnimationDuration: options.wheelAnimationDuration !== undefined ? options.wheelAnimationDuration : 150,
      
      // 回调函数
      onScroll: options.onScroll || ((x: number, y: number) => {}),
      onScrollStart: options.onScrollStart || (() => {}),
      onScrollEnd: options.onScrollEnd || (() => {})
    };
    
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
  }

  // 根据增量滚动
  scrollBy(deltaX: number, deltaY: number, animate: boolean = false): void {
    // 如果配置不允许特定方向滚动，则忽略该方向的增量
    if (!this.options.scrollingX) deltaX = 0;
    if (!this.options.scrollingY) deltaY = 0;
    
    // 计算目标滚动位置
    const targetX = this.scrollX + deltaX;
    const targetY = this.scrollY + deltaY;
    
    // 使用 scrollTo 方法，它会处理边界检查
    this.scrollTo(targetX, targetY, animate);
  }

  // 滚动到指定位置
  scrollTo(x: number, y: number, animate: boolean = false, duration: number = 300): void {
    // 保存旧值用于比较
    const oldX = this.scrollX;
    const oldY = this.scrollY;
    
    // 严格限制在边界内
    x = Math.max(0, Math.min(x, this.maxScrollX));
    y = Math.max(0, Math.min(y, this.maxScrollY));
    
    // 如果位置没有变化，则无需滚动
    if (oldX === x && oldY === y) {
      return;
    }
    
    // 更新滚动位置
    this.scrollX = x;
    this.scrollY = y;
    
    // 如果之前没有滚动，则触发滚动开始
    if (!this.isScrolling) {
      this.isScrolling = true;
      this.options.onScrollStart();
    }
    
    // 显示滚动条
    this.isScrollbarVisible = true;
    
    // 触发滚动回调
    this.options.onScroll(this.scrollX, this.scrollY);
    
    // 如果需要动画，则使用动画效果滚动
    if (animate) {
      this.animateScroll(oldX, oldY, x, y, duration);
    }
  }

  // 开始拖动
  startDrag(): void {
    this.stopAnimation();
    this.isDragging = true;
    this.isScrollbarVisible = true;
  }

  // 结束拖动
  endDrag(velocityX: number, velocityY: number): void {
    this.isDragging = false;
    
    if (this.options.momentum && (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1)) {
      this.startMomentumScroll(velocityX, velocityY);
    } else {
      this.finishScrolling();
    }
  }

  // 设置内容尺寸
  setContentDimensions(width: number, height: number): void {
    this.contentWidth = Math.max(width, 1);
    this.contentHeight = Math.max(height, 1);
    
    // 更新最大滚动范围
    this.updateMaxScrollValues();
  }

  // 设置视口尺寸
  setViewportDimensions(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
    
    // 更新最大滚动范围
    this.maxScrollX = Math.max(0, this.contentWidth - this.viewportWidth);
    this.maxScrollY = Math.max(0, this.contentHeight - this.viewportHeight);
    
    // 确保当前滚动位置在新的有效范围内
    if (this.scrollX > this.maxScrollX) {
      this.scrollX = this.maxScrollX;
    }
    
    if (this.scrollY > this.maxScrollY) {
      this.scrollY = this.maxScrollY;
    }
  }

  // 私有方法: 开始动量滚动
  private startMomentumScroll(velocityX: number, velocityY: number): void {
    // 停止之前的动画
    this.stopAnimation();
    
    this.isMomentumScrolling = true;
    
    // 适度的初始速度
    let currentVelocityX = velocityX;
    let currentVelocityY = velocityY;
    
    let lastTimestamp = performance.now();
    
    const animate = () => {
      const now = performance.now();
      const deltaTime = now - lastTimestamp;
      lastTimestamp = now;
      
      // 简单的衰减系数
      const damping = 0.95;
      
      // 应用衰减
      currentVelocityX *= damping;
      currentVelocityY *= damping;
      
      // 计算增量并取整，避免小数位引起的抖动
      const deltaX = Math.round(currentVelocityX * (deltaTime / 16.67));
      const deltaY = Math.round(currentVelocityY * (deltaTime / 16.67));
      
      if (Math.abs(deltaX) >= 1 || Math.abs(deltaY) >= 1) {
        // 只有当有足够的移动距离时才滚动
        this.scrollBy(deltaX, deltaY);
      }
      
      // 速度足够小时停止动画
      if (Math.abs(currentVelocityX) < 0.1 && Math.abs(currentVelocityY) < 0.1) {
        this.stopAnimation();
        this.finishScrolling();
        return;
      }
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }

  // 动画滚动到指定位置
  private animateScroll(fromX: number, fromY: number, toX: number, toY: number, duration: number = 300): void {
    // 停止之前的动画
    this.stopAnimation();
    
    // 对滚动位置取整，避免小数位引起的抖动
    fromX = Math.round(fromX);
    fromY = Math.round(fromY);
    toX = Math.round(toX);
    toY = Math.round(toY);
    
    // 如果目标位置与当前位置相同，不需要动画
    if (fromX === toX && fromY === toY) {
      return;
    }
    
    this.isScrolling = true;
    this.options.onScrollStart();
    
    const startTime = performance.now(); // 使用更精确的时间源
    
    // 使用简单的线性缓动函数，减少复杂计算导致的抖动
    const animate = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 简单线性缓动，减少计算复杂度
      const easeValue = progress; 
      
      // 对计算结果取整，避免小数位导致的抖动
      const x = Math.round(fromX + (toX - fromX) * easeValue);
      const y = Math.round(fromY + (toY - fromY) * easeValue);
      
      this.setScrollPosition(x, y);
      
      if (progress < 1) {
        // 使用 RAF 继续动画
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        // 动画完成
        this.setScrollPosition(toX, toY);
        this.finishScrolling();
      }
    };
    
    this.animationFrame = requestAnimationFrame(animate);
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
      }, 1500);
    }
  }

  private updateMaxScrollValues(): void {
    this.maxScrollX = Math.max(0, this.contentWidth - this.viewportWidth);
    this.maxScrollY = Math.max(0, this.contentHeight - this.viewportHeight);
    
    // 确保当前滚动位置在新的有效范围内
    if (this.scrollX > this.maxScrollX) {
      this.scrollX = this.maxScrollX;
    }
    
    if (this.scrollY > this.maxScrollY) {
      this.scrollY = this.maxScrollY;
    }
  }

  /**
   * 设置滚动位置
   */
  setScrollPosition(x: number, y: number): void {
    // 对位置取整，避免小数位引起的抖动
    x = Math.round(x);
    y = Math.round(y);
    
    // 限制滚动范围
    if (!this.options.bounceEnabled) {
      x = Math.max(0, Math.min(x, this.maxScrollX));
      y = Math.max(0, Math.min(y, this.maxScrollY));
    }
    
    // 更新滚动位置
    this.scrollX = x;
    this.scrollY = y;
    
    // 显示滚动条
    this.isScrollbarVisible = true;
    
    // 触发滚动回调
    this.options.onScroll(x, y);
  }

  // 更改为公开方法，让滚动条组件能够使用
  calculateThumbSizeRatio(): number {
    return this.viewportHeight / Math.max(this.contentHeight, 1);
  }
} 