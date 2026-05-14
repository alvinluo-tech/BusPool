# BusPool - UI设计规范文档

> 版本：v1.0.0  
> 更新时间：2026-05-14

---

## 📐 设计系统

### 颜色规范

#### 主色调
```css
Primary Blue (主操作色)
--primary: #0066ff
--primary-foreground: #ffffff

Primary Blue (深色模式)
--primary-dark: #0a84ff
```

#### 功能色
```css
Success (成功/收入)
--success: #34c759
--success-foreground: #ffffff

Warning (警告/待处理)  
--warning: #ff9500
--warning-foreground: #ffffff

Destructive (危险/支出)
--destructive: #ff3b30
--destructive-foreground: #ffffff
```

#### 中性色（亮色模式）
```css
背景色
--background: #ffffff
--card: #ffffff
--muted: #f5f5f7

文字色
--foreground: #1c1c1e
--muted-foreground: #8e8e93

边框色
--border: #e5e5ea
```

#### 中性色（深色模式）
```css
背景色
--background: #000000
--card: #1c1c1e
--muted: #2c2c2e

文字色
--foreground: #ffffff
--muted-foreground: #98989d

边框色
--border: #38383a
```

#### 管理后台专用色
```css
图表色
--chart-1: #10b981  /* Emerald 500 - 成功/上传 */
--chart-2: #8b5cf6  /* Purple 500 - 交易/借用 */
--chart-3: #3b82f6  /* Blue 500 - 用户 */
--chart-4: #f59e0b  /* Amber 500 - 警告 */
--chart-5: #ef4444  /* Red 500 - 错误 */
```

#### 颜色使用场景
| 颜色 | 使用场景 |
|------|---------|
| Primary Blue | 按钮、链接、选中状态、品牌元素 |
| Success Green | 成功提示、收入金额、有效状态 |
| Warning Orange | 警告提示、待处理状态 |
| Destructive Red | 危险操作、错误提示、支出金额 |
| Muted | 次要背景、输入框背景 |
| Muted Foreground | 次要文字、说明文字、时间戳 |

---

### 字体系统

#### 字体家族
```css
sans-serif 系统字体栈:
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", 
             "Roboto", "Oxygen", "Ubuntu", "Cantarell", 
             "Fira Sans", "Droid Sans", "Helvetica Neue", 
             sans-serif;
```

#### 字号规范
```css
/* 标题 */
h1: 32px (2rem)      /* 页面主标题 */
h2: 24px (1.5rem)    /* 区块标题 */
h3: 20px (1.25rem)   /* 卡片标题 */
h4: 16px (1rem)      /* 小标题 */

/* 正文 */
base: 16px (1rem)    /* 默认文字大小 */
sm: 14px (0.875rem)  /* 次要文字 */
xs: 12px (0.75rem)   /* 标注文字 */

/* 特殊 */
3xl: 48px (3rem)     /* 钱包余额 */
2xl: 32px (2rem)     /* 统计数字 */
xl: 24px (1.5rem)    /* 强调数字 */
```

#### 字重规范
```css
normal: 400   /* 正文 */
medium: 600   /* 按钮、标签、标题 */
bold: 700     /* 强调数字（钱包） */
```

#### 行高规范
```css
tight: 1.25   /* 大标题 */
normal: 1.5   /* 正文 */
relaxed: 1.75 /* 长文本 */
```

---

### 间距系统

#### 基础间距单位（4px 体系）
```
1 = 4px
2 = 8px
3 = 12px
4 = 16px
5 = 20px
6 = 24px
8 = 32px
10 = 40px
12 = 48px
16 = 64px
20 = 80px
```

#### 间距使用场景
| 间距值 | 使用场景 |
|--------|---------|
| 4px (1) | 图标与文字间距、小标签内边距 |
| 8px (2) | 按钮内边距、表单元素间距 |
| 12px (3) | 卡片之间间距、列表项间距 |
| 16px (4) | 内容区内边距、区块间距 |
| 24px (6) | 页面内边距、大区块间距 |
| 32px (8) | 页面顶部/底部间距 |
| 48px (12) | 页面分隔间距 |
| 80px (20) | 底部导航栏高度 |

#### 内边距模式
```css
/* 按钮 */
padding: 8px 16px;  /* 小按钮 */
padding: 12px 24px; /* 中按钮 */
padding: 16px 32px; /* 大按钮 */

/* 卡片 */
padding: 16px;      /* 标准卡片 */
padding: 24px;      /* 大卡片 */

/* 页面容器 */
padding: 16px;      /* 移动端 */
padding: 24px;      /* 平板/桌面 */
```

---

### 圆角系统

```css
/* 小组件 */
--radius-xs: 4px    /* Badge, Tag */
--radius-sm: 8px    /* Button, Input */
--radius-md: 12px   /* Card (小) */
--radius-lg: 16px   /* Card (标准) */
--radius-xl: 20px   /* Card (大) */
--radius-2xl: 24px  /* 票务卡片 */
--radius-3xl: 32px  /* 钱包卡片 */

/* 圆形 */
--radius-full: 9999px  /* Avatar, Badge, Dot */
```

#### 圆角使用场景
| 圆角值 | 使用场景 |
|--------|---------|
| 4px | 小徽章、标签 |
| 8px | 按钮、输入框 |
| 12px | 小卡片、下拉菜单 |
| 16px | 标准卡片、弹窗 |
| 20px | 导航栏背景 |
| 24px | 票务卡片、大卡片 |
| 9999px | 头像、状态点、圆形按钮 |

---

### 阴影系统

```css
/* 卡片阴影（静态） */
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);

/* 卡片阴影（悬停） */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);

/* 弹出层阴影 */
box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);

/* 大投影（Apple Wallet 风格） */
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

#### 阴影层级
| 层级 | 使用场景 |
|------|---------|
| Level 1 | 普通卡片、列表项 |
| Level 2 | 悬停卡片、下拉菜单 |
| Level 3 | 弹窗、对话框 |
| Level 4 | 票务卡片、钱包卡片 |

---

### 边框系统

```css
/* 边框宽度 */
border-width: 1px;   /* 标准边框 */
border-width: 2px;   /* 强调边框（输入框聚焦） */

/* 边框样式 */
border-style: solid;

/* 边框颜色 */
border-color: var(--border);           /* 标准边框 */
border-color: var(--primary);          /* 主题色边框 */
border-color: rgba(var(--border), 0.5); /* 半透明边框 */
```

---

## 🎨 组件设计

### Button 按钮

#### 尺寸规范
```
Small:  height: 32px, padding: 6px 12px, text: 14px
Medium: height: 40px, padding: 8px 16px, text: 16px
Large:  height: 48px, padding: 12px 24px, text: 16px
```

#### 变体样式

**Primary (主按钮)**
```css
background: var(--primary);
color: var(--primary-foreground);
border: none;
border-radius: 8px;
font-weight: 600;

/* Hover */
background: var(--primary) with opacity 0.9;

/* Active */
background: var(--primary) with opacity 0.8;
transform: scale(0.98);
```

**Secondary (次按钮)**
```css
background: var(--muted);
color: var(--foreground);
border: none;
border-radius: 8px;

/* Hover */
background: var(--muted) with darker shade;
```

**Outline (边框按钮)**
```css
background: transparent;
color: var(--primary);
border: 1px solid var(--border);
border-radius: 8px;

/* Hover */
background: var(--muted);
```

**Ghost (幽灵按钮)**
```css
background: transparent;
color: var(--foreground);
border: none;

/* Hover */
background: var(--muted);
```

**Destructive (危险按钮)**
```css
background: var(--destructive);
color: var(--destructive-foreground);
```

#### 图标按钮
```
尺寸: 40x40px (正方形)
图标: 20x20px
padding: 10px
border-radius: 8px
```

---

### Card 卡片

#### 基础卡片
```css
background: var(--card);
border: 1px solid var(--border);
border-radius: 16px;
padding: 16px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

/* Hover */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
transition: box-shadow 0.2s;
```

#### 票务卡片（Apple Wallet 风格）
```css
background: var(--card);
border: 1px solid var(--border);
border-radius: 24px;
overflow: hidden;
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* 顶部品牌区 */
header {
  background: var(--primary);
  color: white;
  padding: 16px 24px;
}

/* 内容区 */
content {
  padding: 24px;
}
```

#### 统计卡片
```css
background: gradient or solid;
border-radius: 20px;
padding: 24px;

/* 数字 */
font-size: 48px;
font-weight: 700;
line-height: 1;
```

---

### Input 输入框

#### 基础样式
```css
height: 40px;
padding: 8px 12px;
background: var(--input-background);
border: 1px solid var(--border);
border-radius: 8px;
font-size: 16px;
color: var(--foreground);

/* Focus */
border-color: var(--primary);
outline: 2px solid rgba(var(--primary), 0.1);
outline-offset: 2px;

/* Error */
border-color: var(--destructive);
```

#### 搜索输入框
```css
padding-left: 36px;  /* 为图标留空间 */

/* Icon */
position: absolute;
left: 12px;
top: 50%;
transform: translateY(-50%);
color: var(--muted-foreground);
```

---

### Badge 徽章

#### 尺寸
```
Small:  height: 20px, padding: 2px 8px, text: 12px
Medium: height: 24px, padding: 4px 10px, text: 13px
Large:  height: 28px, padding: 6px 12px, text: 14px
```

#### 变体

**默认**
```css
background: var(--muted);
color: var(--foreground);
border: 1px solid var(--border);
border-radius: 6px;
font-weight: 500;
```

**成功**
```css
background: rgba(52, 199, 89, 0.1);
color: #34c759;
border: 1px solid rgba(52, 199, 89, 0.2);
```

**警告**
```css
background: rgba(255, 149, 0, 0.1);
color: #ff9500;
border: 1px solid rgba(255, 149, 0, 0.2);
```

**错误**
```css
background: rgba(255, 59, 48, 0.1);
color: #ff3b30;
border: 1px solid rgba(255, 59, 48, 0.2);
```

---

### Avatar 头像

#### 尺寸
```
xs: 24x24px
sm: 32x32px
md: 40x40px
lg: 48x48px
xl: 64x64px
2xl: 80x80px
```

#### 样式
```css
border-radius: 9999px;  /* 圆形 */
overflow: hidden;

/* 占位符（无头像时） */
background: var(--primary) with opacity 0.1;
color: var(--primary);
display: flex;
align-items: center;
justify-content: center;
font-weight: 600;
```

---

### Dialog 对话框

#### 尺寸
```
Small:  max-width: 400px
Medium: max-width: 500px
Large:  max-width: 600px
Full:   max-width: 800px
```

#### 样式
```css
background: var(--card);
border-radius: 16px;
padding: 24px;
box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* 遮罩层 */
backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

/* 标题 */
header {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

/* 描述 */
description {
  font-size: 14px;
  color: var(--muted-foreground);
  margin-bottom: 16px;
}

/* 底部操作 */
footer {
  margin-top: 24px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
```

---

### Table 表格（管理后台）

#### 样式
```css
/* 表格容器 */
width: 100%;
border: 1px solid var(--border);
border-radius: 12px;
overflow: hidden;

/* 表头 */
thead {
  background: var(--muted);
  border-bottom: 1px solid var(--border);
}

th {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--muted-foreground);
  text-align: left;
}

/* 表体 */
tbody {
  background: var(--card);
}

tr {
  border-bottom: 1px solid var(--border);
}

tr:hover {
  background: rgba(var(--muted), 0.5);
}

td {
  padding: 16px;
  font-size: 14px;
}
```

---

## 📱 布局设计

### 底部导航栏（移动端）

```css
固定位置: fixed bottom-0 left-0 right-0
高度: 80px
背景: white/80% with backdrop-blur
边框: border-top: 1px solid var(--border)
安全区域: padding-bottom: env(safe-area-inset-bottom)

/* 导航项布局 */
display: grid;
grid-template-columns: repeat(5, 1fr);

/* 单个导航项 */
item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
}

/* 图标 */
icon {
  width: 24px;
  height: 24px;
  /* 激活状态 */
  active: {
    color: var(--primary);
    fill: var(--primary);
    fill-opacity: 0.15;
  }
}

/* 文字 */
label {
  font-size: 11px;
  font-weight: 500;
  /* 激活状态 */
  active: {
    color: var(--primary);
    font-weight: 600;
  }
}

/* 激活指示点 */
dot {
  width: 4px;
  height: 4px;
  background: var(--primary);
  border-radius: 9999px;
  position: absolute;
  bottom: 8px;
}
```

### Sticky Header（粘性头部）

```css
position: sticky;
top: 0;
z-index: 10;
background: var(--background);
border-bottom: 1px solid var(--border);
padding: 16px;

/* 添加轻微阴影（滚动后） */
scrolled: {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### 页面容器

```css
/* 移动端 */
padding: 0;  /* 让内容区自行控制padding */
padding-bottom: 80px;  /* 为底部导航栏留空间 */

/* 平板/桌面 */
max-width: 1200px;
margin: 0 auto;
padding: 24px;
```

### 管理后台侧边栏

```css
/* 侧边栏 */
width: 256px;
height: 100vh;
position: fixed;
left: 0;
top: 0;
background: var(--card);
border-right: 1px solid var(--border);

/* Logo区域 */
header {
  height: 64px;
  padding: 0 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
}

/* 导航菜单 */
nav {
  padding: 16px;
}

/* 导航项 */
item {
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  /* 激活状态 */
  active: {
    background: var(--primary);
    color: var(--primary-foreground);
  }
  
  /* 悬停状态 */
  hover: {
    background: var(--muted);
  }
}

/* 主内容区 */
main {
  margin-left: 256px;
  padding: 32px;
}

/* 移动端（收起侧边栏） */
@media (max-width: 1024px) {
  sidebar {
    transform: translateX(-100%);
    /* 展开时 */
    open: {
      transform: translateX(0);
    }
  }
  
  main {
    margin-left: 0;
  }
}
```

---

## 🎭 交互状态

### 悬停状态 (Hover)

```css
/* 按钮 */
button:hover {
  opacity: 0.9;
  cursor: pointer;
}

/* 卡片 */
card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
  transition: all 0.2s;
}

/* 链接 */
link:hover {
  color: var(--primary);
  text-decoration: underline;
}
```

### 激活状态 (Active)

```css
/* 按钮 */
button:active {
  transform: scale(0.98);
  opacity: 0.8;
}

/* 列表项 */
item:active {
  background: rgba(var(--muted), 0.5);
}
```

### 聚焦状态 (Focus)

```css
/* 输入框 */
input:focus {
  border-color: var(--primary);
  outline: 2px solid rgba(var(--primary), 0.1);
  outline-offset: 2px;
}

/* 按钮 */
button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### 禁用状态 (Disabled)

```css
disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

### 加载状态 (Loading)

```css
/* 旋转动画 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--muted);
  border-top-color: var(--primary);
  border-radius: 9999px;
  animation: spin 0.6s linear infinite;
}
```

---

## 🎬 动画效果

### 过渡时间

```css
/* 快速 */
transition: all 0.15s ease;

/* 标准 */
transition: all 0.2s ease;

/* 慢速 */
transition: all 0.3s ease;
```

### 常用动画

**淡入淡出**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

**滑入滑出**
```css
@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

**脉冲动画**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

**缩放**
```css
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

---

## 📐 响应式设计

### 断点

```css
/* 移动端（默认） */
@media (min-width: 0px) { }

/* 小屏手机 */
@media (min-width: 640px) { }  /* sm */

/* 平板竖屏 */
@media (min-width: 768px) { }  /* md */

/* 平板横屏 */
@media (min-width: 1024px) { } /* lg */

/* 桌面 */
@media (min-width: 1280px) { } /* xl */

/* 大屏 */
@media (min-width: 1536px) { } /* 2xl */
```

### 布局适配

**网格系统**
```css
/* 移动端 */
grid-template-columns: 1fr;

/* 平板 */
@media (min-width: 768px) {
  grid-template-columns: repeat(2, 1fr);
}

/* 桌面 */
@media (min-width: 1024px) {
  grid-template-columns: repeat(3, 1fr);
}
```

**间距适配**
```css
/* 移动端 */
padding: 16px;
gap: 12px;

/* 桌面 */
@media (min-width: 1024px) {
  padding: 24px;
  gap: 16px;
}
```

---

## 📊 图表设计（管理后台）

### 配色方案

```css
图表主色
--chart-blue: #3b82f6
--chart-green: #10b981
--chart-purple: #8b5cf6
--chart-orange: #f59e0b
--chart-red: #ef4444

渐变填充
linear-gradient(180deg, 
  rgba(59, 130, 246, 0.3) 0%, 
  rgba(59, 130, 246, 0) 100%
)
```

### 图表样式

**坐标轴**
```css
axis {
  stroke: var(--muted-foreground);
  font-size: 12px;
  stroke-width: 0;  /* 隐藏轴线 */
}
```

**网格线**
```css
grid {
  stroke: var(--border);
  stroke-dasharray: 3 3;
  stroke-width: 1px;
  /* 只显示水平线，隐藏垂直线 */
}
```

**Tooltip**
```css
tooltip {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-size: 14px;
}
```

**柱状图**
```css
bar {
  border-radius: 6px 6px 0 0;  /* 顶部圆角 */
  max-width: 40px;
}
```

**折线图**
```css
line {
  stroke-width: 2px;
  fill: none;
}

dot {
  r: 4px;
  fill: var(--chart-color);
}

activeDot {
  r: 6px;
  fill: var(--chart-color);
}
```

**面积图**
```css
area {
  stroke-width: 2px;
  fill: url(#gradient);  /* 渐变填充 */
}
```

---

## 🎨 页面布局示例

### 用户端页面

#### 首页（票务广场）

```
┌─────────────────────────────────┐
│ [Sticky Header - 64px]          │
│ Available Tickets               │ ← bg-white, border-bottom
│ 3 tickets • 💰 50 points        │
├─────────────────────────────────┤
│ [Content Area]                  │
│ padding: 16px                   │
│ background: #f5f5f7             │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Ticket Card]               │ │ ← margin-bottom: 12px
│ │ border-radius: 24px         │ │
│ │ shadow-sm                   │ │
│ │                             │ │
│ │ [Header: Primary Blue]      │ │ ← height: 56px
│ │ Dayrider · Durham City      │ │
│ │                             │ │
│ │ [Body: White]               │ │ ← padding: 16px
│ │ 👤 Alex Chen  ⭐️ 95        │ │
│ │ 📍 3h ago     💰 5pts       │ │
│ └─────────────────────────────┘ │
│                                 │
│ [更多卡片...]                   │
│                                 │
└─────────────────────────────────┘
[Bottom Nav - 80px]               ← fixed, backdrop-blur
```

#### 上传页面

```
┌─────────────────────────────────┐
│ [Sticky Header]                 │
│ Share Ticket                    │
│ Upload your unused Day Ticket   │
├─────────────────────────────────┤
│ [Content - padding: 16px]       │
│                                 │
│ Barcode Photo                   │
│ ┌─────────────────────────────┐ │
│ │ [Photo Upload Area]         │ │ ← aspect-ratio: 4/3
│ │ 📷 Take or upload photo     │ │   border-dashed
│ │ Tap to open camera          │ │   border-radius: 24px
│ └─────────────────────────────┘ │
│                                 │
│ Ticket Type                     │
│ ┌─────────┐  ┌─────────┐      │
│ │✓Dayrider│  │DaySaver │      │ ← grid-cols-2
│ │ £1.60   │  │Multi-zone│      │   border-radius: 12px
│ └─────────┘  └─────────┘      │
│                                 │
│ Purchase Time                   │
│ [datetime-local input]          │ ← border-radius: 12px
│                                 │
│ ☑ I confirm I have used this   │
│   ticket today                  │ ← bg-muted/50
│                                 │
│ ℹ Good to know                  │
│ • Maximum 3 uploads per day     │ ← bg-primary/5
│ • Reputation must be ≥30        │   border-primary/20
│                                 │
│ Your reputation    Today's      │
│      85               0/3        │ ← grid-cols-2
│                                 │
│ ┌─────────────────────────────┐ │
│ │  ✓ Upload Ticket            │ │ ← bg-primary
│ └─────────────────────────────┘ │   height: 48px
└─────────────────────────────────┘
```

#### 借用记录

```
┌─────────────────────────────────┐
│ [Sticky Header]                 │
│ My Tickets                      │
│ Active ticket ready to use      │
├─────────────────────────────────┤
│ Active Ticket                   │ ← text-xs, uppercase
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Wallet Card]               │ │ ← border-radius: 32px
│ │ ┌─────────────────────────┐ │ │   shadow-lg
│ │ │ BusPool                 │ │ │
│ │ │ Dayrider                │ │ │ ← bg-primary
│ │ │ Durham City             │ │ │   color: white
│ │ └─────────────────────────┘ │ │
│ │ [Barcode Area]              │ │
│ │ ████████████████████        │ │ ← height: 128px
│ │ Show this to the driver     │ │   bg-muted/30
│ │                             │ │
│ │ ⏰ 3h 25m remaining         │ │ ← text-warning
│ │                             │ │
│ │ ┌─────────────┐             │ │
│ │ │✓Confirm     │             │ │
│ │ └─────────────┘             │ │
│ └─────────────────────────────┘ │
│                                 │
│ History                         │ ← text-xs, uppercase
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ✓ Sarah Wang   -5 pts       │ │ ← border-radius: 16px
│ │   Dayrider · 14:30          │ │
│ │   [Successful]              │ │ ← bg-success/10
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ✗ Mike Liu     +5 pts       │ │
│ │   DaySaver · 11:00          │ │
│ │   [Failed · Ticket expired] │ │ ← bg-destructive/10
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### 钱包页面

```
┌─────────────────────────────────┐
│ [Sticky Balance Card]           │
│ background: gradient            │
│ padding: 24px                   │
│ border-radius: 20px             │
│                                 │
│      50                         │ ← font-size: 48px, bold
│                                 │
│ ┌──────────┐  ┌──────────┐    │
│ │ +25      │  │ -10      │    │ ← 收入/支出统计
│ │ Income   │  │ Spent    │    │   bg-success/10
│ └──────────┘  └──────────┘    │
├─────────────────────────────────┤
│ [Tab Buttons]                   │ ← height: 40px
│ ◉ All  ○ Income  ○ Spent       │   border-radius: 20px
├─────────────────────────────────┤
│ [Transaction List]              │
│ background: #f5f5f7             │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ↗️ 票被借用                  │ │ ← padding: 16px
│ │ +5 points  •  05-13 14:00   │ │   border-bottom
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

#### 个人中心

```
┌─────────────────────────────────┐
│ [Header Card]                   │
│ ┌────┐ Demo User               │
│ │ D  │ demo@durham.ac.uk       │ ← Avatar: 64px
│ └────┘                          │   border-radius: full
│                                 │
│ Reputation                      │
│ ⭐️ 85  [优秀]                  │ ← bg-muted/50
│ ████████░░ 85%                  │   border-radius: 16px
├─────────────────────────────────┤
│ [Stats Grid - cols-3]           │
│ │   12    │   24    │   96%   │ │ ← divide-x
│ │ Shared  │ Borrowed│ Success │ │   padding: 16px
├─────────────────────────────────┤
│ [Menu Section]                  │
│ ┌─────────────────────────────┐ │
│ │ 🛡 Reputation System    >   │ │ ← border-radius: 16px
│ ├─────────────────────────────┤ │   hover: bg-muted/50
│ │ 🔔 Notifications        >   │ │
│ ├─────────────────────────────┤ │
│ │ ⚙️ Settings             >   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📄 Terms & Conditions   >   │ │
│ ├─────────────────────────────┤ │
│ │ ❓ Help Center          >   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │  📊 管理后台                │ │ ← bg-primary (admin only)
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │  🚪 Sign Out                │ │ ← text-destructive
│ └─────────────────────────────┘ │
│                                 │
│ BusPool v1.0.0                  │ ← text-xs
│ Made for Durham students        │   text-center
└─────────────────────────────────┘
```

---

### 管理后台页面

#### 数据看板

```
┌────────┬────────────────────────────────────┐
│[Sidebar│ Dashboard                          │
│256px]  │ ┌──────┐ ┌──────┐ ┌──────┐        │
│        │ │  71  │ │  22  │ │  52  │        │ ← KPI Cards
│ • 数据 │ │ 活跃 │ │ 上传 │ │ 借用 │        │   padding: 24px
│ • 用户 │ └──────┘ └──────┘ └──────┘        │   gap: 16px
│ • 票务 │                                    │
│ • 交易 │ ┌────────────────────────────────┐ │
│ • 申诉 │ │ [Area Chart]                   │ │ ← height: 280px
│ • 积分 │ │ 用户增长趋势                    │ │   border-radius: 12px
│ • 日志 │ │                                │ │
│        │ └────────────────────────────────┘ │
│        │                                    │
│[返回]  │ ┌──────────┐  ┌──────────┐       │
└────────┤ │[Bar Chart│  │[Line Chart│       │
         │ │ 交易量   │  │ 有效率   │       │
         │ └──────────┘  └──────────┘       │
         └────────────────────────────────────┘
```

#### 用户管理列表

```
┌────────┬────────────────────────────────────┐
│[Sidebar│ 用户管理                           │
│256px]  │ 查看和管理所有用户                  │
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ [🔍 Search] [状态▼] [信誉▼]   │ │ ← Filter Card
│        │ └────────────────────────────────┘ │   padding: 16px
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ [Table]                        │ │
│        │ │ 用户│信誉│积分│统计│状态│操作│ │ │ ← border-radius: 12px
│        │ ├────────────────────────────────┤ │
│        │ │ AC│85[优秀]│45│12↑8↓│正常│👁│ │ │ ← hover: bg-muted/50
│        │ │ Alice Chen                     │ │
│        │ │ alice@durham.ac.uk             │ │
│        │ ├────────────────────────────────┤ │
│        │ │ BW│92[优秀]│68│18↑5↓│正常│👁│ │ │
│        │ │ Bob Wang                       │ │
│        │ ├────────────────────────────────┤ │
│        │ │ CL│28[限制]│12│3↑15↓│受限│👁│ │ │
│        │ │ Carol Li                       │ │
│        │ └────────────────────────────────┘ │
└────────┴────────────────────────────────────┘
```

#### 用户详情

```
┌────────┬────────────────────────────────────┐
│[Sidebar│ [<] 用户详情                       │
│256px]  │                                    │
│        │ ┌──────────────┬─────────────────┐ │
│        │ │  [Avatar]    │ 管理员操作      │ │
│        │ │   Alice      │ ┌─────────────┐ │ │
│        │ │   Chen       │ │💰 调整积分  │ │ │ ← lg:grid-cols-3
│        │ │   [正常]     │ ├─────────────┤ │ │
│        │ │              │ │⭐️ 调整信誉 │ │ │
│        │ │ ID: 1        │ ├─────────────┤ │ │
│        │ │ 2026-04-15   │ │⚠️ 修改状态  │ │ │
│        │ └──────────────┴─────────────────┘ │
│        │                                    │
│        │ ┌──────┐┌──────┐┌──────┐┌──────┐ │
│        │ │ 85   ││  45  ││  12  ││  8   │ │ ← Stats Cards
│        │ │信誉分││ 积分 ││ 上传 ││ 借用 │ │   grid-cols-4
│        │ └──────┘└──────┘└──────┘└──────┘ │
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ 交易记录                       │ │
│        │ ├────────────────────────────────┤ │
│        │ │ 上传票被借用    +10  05-13    │ │
│        │ ├────────────────────────────────┤ │
│        │ │ 借用 Dayrider   -5   05-12    │ │
│        │ └────────────────────────────────┘ │
└────────┴────────────────────────────────────┘
```

#### 票务管理列表

```
┌────────┬────────────────────────────────────┐
│[Sidebar│ 票务管理                           │
│256px]  │ 查看和管理所有票务                  │
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ [🔍 Search] [状态▼] [类型▼]   │ │
│        │ └────────────────────────────────┘ │
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ [Table]                        │ │
│        │ │ ID│上传者│类型│状态│次数│操作│ │ │
│        │ ├────────────────────────────────┤ │
│        │ │ 1 │Alice│Dayr│[可用]│0 │👁   │ │ │
│        │ ├────────────────────────────────┤ │
│        │ │ 2 │Bob  │Dayr│[使用中]│1│👁  │ │ │
│        │ ├────────────────────────────────┤ │
│        │ │ 3 │Alice│DayS│[已完成]│2│👁  │ │ │
│        │ ├────────────────────────────────┤ │
│        │ │ 4 │Carol│Dayr│[已失效]│1│👁  │ │ │
│        │ └────────────────────────────────┘ │
└────────┴────────────────────────────────────┘
```

#### 票务详情

```
┌────────┬────────────────────────────────────┐
│[Sidebar│ [<] 票务详情                       │
│256px]  │                                    │
│        │ ┌──────────────┬─────────────────┐ │
│        │ │ 票 #2        │ 管理员操作      │ │
│        │ │ [使用中]     │ ┌─────────────┐ │ │
│        │ │ [Dayrider]   │ │🚫 强制下架  │ │ │
│        │ │              │ └─────────────┘ │ │
│        │ │ ┌──────────┐ │                 │ │
│        │ │ │购买: 07:30│ │                 │ │
│        │ │ │过期:23:59 │ │                 │ │
│        │ │ │区域:Durham│ │                 │ │
│        │ │ │借用: 1次  │ │                 │ │
│        │ │ └──────────┘ │                 │ │
│        │ │              │                 │ │
│        │ │ 上传者信息   │                 │ │
│        │ │ ┌──────────┐ │                 │ │
│        │ │ │ BW       │ │                 │ │
│        │ │ │ Bob Wang │ │                 │ │
│        │ │ │ 信誉: 92 │ │                 │ │
│        │ │ └──────────┘ │                 │ │
│        │ │              │                 │ │
│        │ │ 条码照片     │                 │ │
│        │ │ ┌──────────┐ │                 │ │
│        │ │ │[Preview] │ │                 │ │
│        │ │ └──────────┘ │                 │ │
│        │ └──────────────┴─────────────────┘ │
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ 借用记录                       │ │
│        │ ├────────────────────────────────┤ │
│        │ │ Carol Li    5pts  [待确认]    │ │
│        │ │ 14:00                          │ │
│        │ └────────────────────────────────┘ │
└────────┴────────────────────────────────────┘
```

#### 交易管理列表

```
┌────────┬────────────────────────────────────┐
│[Sidebar│ 交易管理                           │
│256px]  │ 查看和管理所有交易记录              │
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ [🔍 Search] [状态 ▼]          │ │
│        │ └────────────────────────────────┘ │
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ [Table]                        │ │
│        │ │ ID│票│上传│借用│分│状态│操作│ │ │
│        │ ├────────────────────────────────┤ │
│        │ │ 1│2│Bob│Carol│5│[待确认]│👁  │ │ │
│        │ ├────────────────────────────────┤ │
│        │ │ 2│3│Alice│Bob│5│[有效]│👁    │ │ │
│        │ ├────────────────────────────────┤ │
│        │ │ 3│4│Carol│Alice│5│[无效]│👁  │ │ │
│        │ ├────────────────────────────────┤ │
│        │ │ 4│3│Alice│David│5│[自动]│👁  │ │ │
│        │ └────────────────────────────────┘ │
└────────┴────────────────────────────────────┘
```

#### 交易详情

```
┌────────┬────────────────────────────────────┐
│[Sidebar│ [<] 交易详情                       │
│256px]  │                                    │
│        │ ┌──────────────┬─────────────────┐ │
│        │ │ 交易 #1      │ 管理员操作      │ │
│        │ │ [待确认]     │ ┌─────────────┐ │ │
│        │ │              │ │✓ 手动确认   │ │ │
│        │ │ 5 积分       │ ├─────────────┤ │ │
│        │ │              │ │✗ 撤销交易   │ │ │
│        │ │ ┌──────────┐ │ └─────────────┘ │ │
│        │ │ │创建:14:00│ │                 │ │
│        │ │ │超时:18:00│ │                 │ │
│        │ │ └──────────┘ │                 │ │
│        │ │              │                 │ │
│        │ │ 上传者       │ 借用者          │ │
│        │ │ ┌──────────┐ │ ┌──────────┐   │ │
│        │ │ │ BW       │ │ │ CL       │   │ │
│        │ │ │ Bob Wang │ │ │ Carol Li │   │ │
│        │ │ │ 信誉: 92 │ │ │ 信誉: 28 │   │ │
│        │ │ └──────────┘ │ └──────────┘   │ │
│        │ │              │                 │ │
│        │ │ 票务信息     │                 │ │
│        │ │ ┌──────────┐ │                 │ │
│        │ │ │票ID: 2   │ │                 │ │
│        │ │ │Dayrider  │ │                 │ │
│        │ │ └──────────┘ │                 │ │
│        │ └──────────────┴─────────────────┘ │
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ 关联申诉                       │ │
│        │ ├────────────────────────────────┤ │
│        │ │ 申诉 #1  [待审核]             │ │
│        │ │ 申诉人: Bob Wang               │ │
│        │ │ "票是真实有效的..."            │ │
│        │ └────────────────────────────────┘ │
└────────┴────────────────────────────────────┘
```

#### 申诉管理

```
┌────────┬────────────────────────────────────┐
│[Sidebar│ 申诉审核                           │
│256px]  │ 处理用户提交的申诉                  │
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ [状态 ▼]                       │ │
│        │ └────────────────────────────────┘ │
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ 申诉 #1  [待审核]             │ │ ← Card
│        │ ├────────────────────────────────┤ │   padding: 24px
│        │ │ 申诉人: Carol Li               │ │
│        │ │ 借用者: Alice Chen             │ │
│        │ │ 票 ID: 4                       │ │
│        │ │ 交易 ID: 3                     │ │
│        │ │                                │ │
│        │ │ 申诉理由:                      │ │
│        │ │ ┌────────────────────────────┐ │ │
│        │ │ │我确认这张票当天是有效的... │ │ │ ← bg-muted/50
│        │ │ └────────────────────────────┘ │ │
│        │ │                                │ │
│        │ │ 提交: 2026-05-11 17:00         │ │
│        │ │                       [审核 👁] │ │
│        │ └────────────────────────────────┘ │
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ 申诉 #2  [已裁定]             │ │
│        │ │ ...                            │ │
│        │ └────────────────────────────────┘ │
└────────┴────────────────────────────────────┘
```

#### 积分管理

```
┌────────┬────────────────────────────────────┐
│[Sidebar│ 积分手动发放                       │
│256px]  │ 手动给用户发放或扣除积分            │
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ ⚠️ 注意事项                    │ │ ← bg-warning/5
│        │ │ • 单次上限 1000 积分           │ │   border-warning/20
│        │ │ • 每日上限 5000 积分           │ │
│        │ │ • 所有操作不可撤销             │ │
│        │ └────────────────────────────────┘ │
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ 1. 搜索用户                    │ │
│        │ ├────────────────────────────────┤ │
│        │ │ [🔍 Search] [搜索]            │ │
│        │ │                                │ │
│        │ │ ┌────────────────────────────┐ │ │
│        │ │ │ Alice Chen                 │ │ │ ← bg-muted/50
│        │ │ │ alice@durham.ac.uk         │ │ │
│        │ │ │         当前积分: 45       │ │ │
│        │ │ └────────────────────────────┘ │ │
│        │ └────────────────────────────────┘ │
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ 2. 积分操作                    │ │
│        │ ├────────────────────────────────┤ │
│        │ │ 积分数量                       │ │
│        │ │ [➖] [_____Input_____] [➕]   │ │
│        │ │ 操作后余额: 50                 │ │
│        │ │                                │ │
│        │ │ 操作原因                       │ │
│        │ │ [Textarea - 10+ chars]         │ │
│        │ │                                │ │
│        │ │ [确认操作]                     │ │
│        │ └────────────────────────────────┘ │
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ 最近操作记录                   │ │
│        │ ├────────────────────────────────┤ │
│        │ │ Alice Chen    +10              │ │
│        │ │ "补偿系统故障..."              │ │
│        │ │ Admin · 05-13 10:00            │ │
│        │ └────────────────────────────────┘ │
└────────┴────────────────────────────────────┘
```

#### 操作日志

```
┌────────┬────────────────────────────────────┐
│[Sidebar│ 操作日志        [导出 CSV ⬇️]     │
│256px]  │ 管理员操作审计追踪                  │
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ [操作类型 ▼] [操作对象 ▼]     │ │
│        │ └────────────────────────────────┘ │
│        │                                    │
│        │ ┌────────────────────────────────┐ │
│        │ │ [Table]                        │ │
│        │ │ 时间│管理员│操作│对象│详情│原因│ │ │
│        │ ├────────────────────────────────┤ │
│        │ │ 10:00│Admin│[调整积分]│Alice│ │ │
│        │ │ +10积分 "补偿系统故障..."      │ │ │
│        │ ├────────────────────────────────┤ │
│        │ │ 16:00│Admin│[封禁用户]│David│ │ │
│        │ │ 正常→封禁 "多次上传假票..."    │ │ │
│        │ ├────────────────────────────────┤ │
│        │ │ 14:30│Admin│[调整信誉]│Carol│ │ │
│        │ │ +10分 "申诉成功..."            │ │ │
│        │ ├────────────────────────────────┤ │
│        │ │ 11:00│Admin│[审核申诉]│申诉#2││ │
│        │ │ 已通过 "证据充分..."           │ │ │
│        │ └────────────────────────────────┘ │
└────────┴────────────────────────────────────┘
```

---

## 🎯 关键设计原则

### 1. 视觉层次

```
重要性层级：
Primary   → 主操作按钮、关键数字
Secondary → 次要信息、辅助按钮
Tertiary  → 说明文字、时间戳

大小层级：
3xl (48px) → 钱包余额
2xl (32px) → 统计数字
xl (24px)  → 页面标题
base (16px)→ 正文
sm (14px)  → 次要文字
xs (12px)  → 标注
```

### 2. 颜色对比

```
文字对比度（WCAG AA标准）
背景与主文字：≥ 4.5:1
背景与次要文字：≥ 3:1

交互元素辨识
主操作：Primary Blue (高饱和度)
次操作：Muted (低饱和度)
危险操作：Destructive Red
```

### 3. 触摸目标

```
最小点击区域：44x44px
按钮高度：≥ 40px
图标按钮：≥ 40x40px
列表项高度：≥ 56px
```

### 4. 信息密度

```
移动端：宽松布局，大间距
平板：中等密度
桌面：可适当提高密度
```

### 5. 加载反馈

```
按钮加载：显示spinner，禁用点击
页面加载：骨架屏或spinner
数据加载：局部加载指示器
```

---

## 📝 设计检查清单

### 颜色使用
- [ ] 所有颜色均来自设计系统
- [ ] 对比度符合无障碍标准
- [ ] 深色模式适配完整

### 间距一致性
- [ ] 使用4px基础单位
- [ ] 间距符合使用场景
- [ ] 响应式间距适配

### 字体规范
- [ ] 字号符合层级
- [ ] 字重使用正确
- [ ] 行高适合阅读

### 交互状态
- [ ] Hover状态明显
- [ ] Active状态有反馈
- [ ] Focus状态清晰
- [ ] Disabled状态明确
- [ ] Loading状态友好

### 响应式设计
- [ ] 移动端优先
- [ ] 断点合理
- [ ] 触摸目标≥44px
- [ ] 布局适配完整

### 动画流畅
- [ ] 过渡时间合理
- [ ] 动画有意义
- [ ] 不影响性能

---

**文档维护者：** Claude  
**最后更新：** 2026-05-14  
**版本：** v1.0.0
