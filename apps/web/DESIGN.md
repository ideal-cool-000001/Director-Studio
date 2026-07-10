---
name: AI 漫剧工作台
colors:
  primary: "#1A1A2E"
  on-primary: "#FFFFFF"
  primary-light: "#2D2D44"
  primary-dark: "#0F0F1A"
  secondary: "#F8FAFC"
  on-secondary: "#334155"
  tertiary: "#7C3AED"
  on-tertiary: "#FFFFFF"
  background: "#F1F5F9"
  surface: "#FFFFFF"
  surface-muted: "#F8FAFC"
  surface-elevated: "#FFFFFF"
  on-surface: "#1E293B"
  on-surface-variant: "#64748B"
  outline: "#E2E8F0"
  outline-variant: "#CBD5E1"
  accent: "#06B6D4"
  on-accent: "#FFFFFF"
  success: "#22C55E"
  success-bg: "#DCFCE7"
  on-success: "#FFFFFF"
  warning: "#F59E0B"
  warning-bg: "#FEF3C7"
  on-warning: "#FFFFFF"
  error: "#EF4444"
  error-bg: "#FEE2E2"
  on-error: "#FFFFFF"
  info: "#3B82F6"
  info-bg: "#DBEAFE"
  on-info: "#FFFFFF"
  purple-light: "#EDE9FE"
  purple-accent: "#8B5CF6"
  hover: "#F1F5F9"
  canvas-node: "#1E293B"
  canvas-accent: "#06B6D4"
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: 700
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: 700
    lineHeight: 44px
  headline-xl:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 600
    lineHeight: 36px
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 600
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 600
    lineHeight: 26px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 600
    lineHeight: 14px
rounded:
  none: 0
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 20px
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
shadows:
  shadow-1: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
  shadow-2: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)"
  shadow-3: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)"
  shadow-4: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
animations:
  duration-fast: 150ms
  duration-normal: 200ms
  duration-slow: 300ms
  easing-ease-out: "cubic-bezier(0.4, 0, 0.2, 1)"
  easing-ease-in-out: "cubic-bezier(0.4, 0, 0.2, 1)"
components:
  card-standard:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.outline}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    boxShadow: "{shadows.shadow-1}"
  card-hover:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.outline}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
    boxShadow: "{shadows.shadow-1}"
    hoverBoxShadow: "{shadows.shadow-2}"
  card-elevated:
    backgroundColor: "{colors.surface-elevated}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
    boxShadow: "{shadows.shadow-3}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "8px 20px"
    height: 40px
    boxShadow: "{shadows.shadow-1}"
    hoverBackgroundColor: "{colors.primary-light}"
    hoverBoxShadow: "{shadows.shadow-2}"
  button-secondary:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "8px 20px"
    height: 40px
    borderColor: "{colors.outline}"
    hoverBackgroundColor: "{colors.hover}"
  button-outline:
    borderColor: "{colors.outline}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "8px 20px"
    height: 40px
    hoverBorderColor: "{colors.primary}"
    hoverTextColor: "{colors.primary}"
  button-tertiary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "6px 16px"
    height: 32px
    hoverBackgroundColor: "{colors.purple-accent}"
  input-field:
    backgroundColor: "{colors.surface-muted}"
    borderColor: "{colors.outline}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
    height: 40px
    focusBorderColor: "{colors.primary}"
    focusBoxShadow: "0 0 0 3px rgba(26, 26, 46, 0.1)"
  badge-standard:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  badge-accent:
    backgroundColor: "{colors.purple-light}"
    textColor: "{colors.purple-accent}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  tab-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "6px 16px"
  tab-inactive:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "6px 16px"
    hoverTextColor: "{colors.on-surface}"
---

## Brand & Style

小云雀 AI 漫剧工作台是一款面向内容创作者的专业工具，采用现代极简主义设计风格，强调清晰的信息层级和流畅的创作体验。整体视觉语言现代、清爽，以浅色背景为基底，配合深蓝色主色调和紫色点缀，营造专业而富有创意的创作氛围。

设计核心原则：
- **简洁高效**：去除冗余元素，让用户专注于创作流程
- **清晰层级**：通过留白、卡片和色彩对比建立明确的视觉层次
- **柔和交互**：采用圆润的按钮和卡片，配合细腻的过渡动画
- **专业感**：深蓝色主按钮传达专业和信赖感，紫色点缀增添创意氛围
- **可访问性**：遵循 WCAG 2.1 AA 级标准，确保色彩对比度和文本可读性

## Colors

色彩系统采用浅色背景配合深蓝色主色调，形成清晰的对比层次，并包含完整的语义色彩体系。

### 主色调
- **Primary (#1A1A2E)**：深蓝色，用于主按钮和关键操作，传达专业与权威
- **On-Primary (#FFFFFF)**：纯白色，用于深色背景上的文字
- **Primary-Light (#2D2D44)**：深蓝色浅变体，用于 hover 状态
- **Primary-Dark (#0F0F1A)**：深蓝色深变体，用于 pressed 状态

### 次色调
- **Secondary (#F8FAFC)**：浅灰蓝，用于次要背景和按钮
- **On-Secondary (#334155)**：中深蓝灰色，用于次要文字

### 第三色调
- **Tertiary (#7C3AED)**：紫色，用于会员和特殊功能按钮，增添创意感
- **On-Tertiary (#FFFFFF)**：纯白色，用于紫色背景上的文字

### 背景与表面
- **Background (#F1F5F9)**：极浅灰蓝色，作为页面主背景，柔和不刺眼
- **Surface (#FFFFFF)**：纯白卡片背景，用于内容区域
- **Surface-Muted (#F8FAFC)**：浅灰蓝背景，用于次要内容区域
- **Surface-Elevated (#FFFFFF)**：纯白背景，用于悬浮和弹窗组件

### 文字颜色
- **On-Surface (#1E293B)**：深灰蓝色正文，保证阅读舒适度（对比度 > 7:1）
- **On-Surface-Variant (#64748B)**：中灰蓝色，用于次要文字和标签（对比度 > 4.5:1）

### 边框与分隔
- **Outline (#E2E8F0)**：浅灰蓝边框，分隔内容区域
- **Outline-Variant (#CBD5E1)**：中灰蓝边框，用于特殊状态

### 强调色
- **Accent (#06B6D4)**：青色点缀，用于进度指示和重点突出

### 语义色彩
- **Success (#22C55E)**：绿色，用于成功状态和进度完成
- **Success-BG (#DCFCE7)**：淡绿色背景，用于成功徽章
- **Warning (#F59E0B)**：橙色，用于警告和进行中状态
- **Warning-BG (#FEF3C7)**：淡橙色背景，用于警告徽章
- **Error (#EF4444)**：红色，用于错误和失败状态
- **Error-BG (#FEE2E2)**：淡红色背景，用于错误徽章
- **Info (#3B82F6)**：蓝色，用于信息提示和说明
- **Info-BG (#DBEAFE)**：淡蓝色背景，用于信息徽章

**色彩使用规范**：
- 主按钮必须使用深蓝色背景配白色文字
- 卡片统一使用白色背景配浅灰边框
- 标签和徽章使用语义色背景配合对应文字颜色
- 警告和错误状态必须使用语义色彩
- 确保所有文字与背景对比度达到 WCAG 2.1 AA 级标准（正文 > 4.5:1，大文字 > 3:1）

## Typography

采用 Inter 字体作为全局字体，建立完整的排版层级系统。

### 字体层级
| 层级 | 字号 | 字重 | 行高 | 字间距 | 用途 |
|------|------|------|------|--------|------|
| Display-XL | 48px | 700 | 56px | -0.02em | 页面主标题 |
| Display-LG | 36px | 700 | 44px | - | 大型标题 |
| Headline-XL | 28px | 600 | 36px | - | 区域大标题 |
| Headline-LG | 24px | 600 | 32px | - | 区域标题 |
| Headline-MD | 20px | 600 | 28px | - | 卡片标题 |
| Title-LG | 18px | 600 | 26px | - | 次级标题 |
| Title-MD | 16px | 600 | 24px | - | 按钮和标签标题 |
| Body-LG | 16px | 400 | 24px | - | 主要内容 |
| Body-MD | 14px | 400 | 20px | - | 次要内容 |
| Body-SM | 12px | 400 | 16px | - | 辅助信息 |
| Label-MD | 12px | 600 | 16px | 0.05em | 按钮和标签文字 |
| Label-SM | 11px | 600 | 14px | - | 微标签和状态文字 |

**排版使用规范**：
- 标题使用字重 600-700，正文使用字重 400
- 行高设置：标题 1.3-1.4，正文 1.5-1.6
- 按钮和标签文字全部使用字重 600
- 标签文字可适当增加字间距（letter-spacing: 0.05em）
- 确保正文最小字号不小于 14px，辅助文字不小于 12px

## Layout & Spacing

采用 8px 基础网格系统，确保布局的一致性和节奏感。

### 间距系统
| 名称 | 值 | 用途 |
|------|-----|------|
| Unit | 8px | 所有间距和尺寸的基准单位 |
| XS | 4px | 微间距，用于元素内部紧凑布局 |
| SM | 8px | 小间距，用于小型组件内边距 |
| MD | 16px | 中等间距，用于卡片内边距和元素间距 |
| LG | 24px | 大间距，用于区域分隔和外边距 |
| XL | 32px | 超大间距，用于页面级别的分隔 |
| XXL | 48px | 最大间距，用于关键区域的留白 |

**布局原则**：
- 页面采用侧边栏 + 主内容区的双栏布局
- 卡片内边距统一使用 24px（LG）
- 卡片之间间距使用 16px（MD）
- 内容区域与边框的最小距离为 24px（LG）
- 使用 Flexbox 和 Grid 实现响应式布局
- 所有间距值必须是 8px 的倍数

## Elevation & Depth

通过阴影层级营造视觉深度，而非依赖颜色深浅。

### 阴影层级
| 层级 | 样式 | 用途 |
|------|------|------|
| Shadow-1 | 0 1px 2px 0 rgba(0,0,0,0.05) | 基础卡片、按钮默认状态 |
| Shadow-2 | 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1) | hover 状态、选中卡片 |
| Shadow-3 | 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1) | 弹窗、模态框 |
| Shadow-4 | 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1) | 下拉菜单、浮动面板 |

**层级规范**：
- 避免使用厚重阴影，保持轻盈感
- 阴影模糊半径大于扩散半径，营造柔和效果
- 所有可点击元素必须有 hover 状态反馈
- 选中元素使用更高层级的阴影突出显示

## Shapes

采用圆润但不过分的圆角设计，营造现代友好的视觉感受。

### 圆角系统
| 名称 | 值 | 用途 |
|------|-----|------|
| None | 0 | 特殊场景 |
| SM | 4px | 小按钮和标签 |
| MD | 8px | 标准按钮和输入框 |
| LG | 12px | 卡片和容器 |
| XL | 16px | 弹窗和模态框 |
| XXL | 20px | 大型面板和画布 |
| Full | 9999px | 圆形按钮和徽章 |

**形状规范**：
- 卡片统一使用 12px 圆角
- 按钮统一使用 8px 圆角
- 标签和徽章使用全圆角
- 弹窗和模态框使用 16px 圆角
- 避免在同一视图中混用不同圆角风格

## Animations

添加适度的过渡动画和微交互效果，提升用户体验。

### 动画时长
| 名称 | 值 | 用途 |
|------|-----|------|
| Duration-Fast | 150ms | 快速状态切换 |
| Duration-Normal | 200ms | 标准过渡效果 |
| Duration-Slow | 300ms | 页面切换和弹窗动画 |

### 动画类型
| 动画 | 效果 | 用途 |
|------|------|------|
| Fade-In | 淡入效果 | 页面加载、组件出现 |
| Scale-In | 缩放出现 | 弹窗、模态框 |
| Slide-Up | 向上滑入 | 列表项、卡片 |
| Slide-Right | 向右滑入 | 侧边栏、面板 |
| Bounce-Soft | 柔和弹跳 | 按钮点击、通知 |
| Pulse | 脉冲闪烁 | 加载状态、进行中 |

**动画规范**：
- 动画时长不超过 300ms，保持响应迅速
- 使用 cubic-bezier(0.4, 0, 0.2, 1) 缓动函数
- 避免过度动画导致视觉疲劳
- 确保动画不影响页面性能（保持 60fps）

## Components

### Cards
- **标准卡片**：白色背景，1px 浅灰边框，12px 圆角，24px 内边距，基础阴影
- **悬浮卡片**：白色背景，16px 圆角，带有柔和阴影，hover 时阴影增强
- **升高卡片**：白色背景，16px 圆角，带有较强阴影，用于弹窗

### Buttons
- **主按钮**：深蓝色背景，白色文字，8px 圆角，40px 高度，hover 时背景变亮
- **次按钮**：浅灰背景，深蓝文字，8px 圆角，40px 高度，带有边框
- **轮廓按钮**：透明背景，浅灰边框，深蓝文字，8px 圆角，hover 时边框变深
- **第三按钮**：紫色背景，白色文字，小号尺寸（32px 高度），用于特殊功能

### Inputs
- **输入框**：浅灰背景，浅灰边框，8px 圆角，40px 高度
- **聚焦状态**：边框变为深蓝色，添加柔和光晕效果
- **文本域**：同样的样式，可调整高度

### Tabs
- **激活状态**：深蓝色背景，白色文字，全圆角
- **未激活状态**：浅灰背景，中灰文字，全圆角，hover 时文字变深
- **步骤指示**：数字标签显示进度

### Badges
- **标准徽章**：浅灰背景，中灰文字，全圆角
- **强调徽章**：淡紫背景，紫色文字，全圆角
- **语义徽章**：使用对应语义色背景和文字颜色

### Lists
- **列表项**：16px 内边距，hover 时背景变为浅灰
- **分隔线**：1px 浅灰线，仅用于列表内部

### Messages
- **用户消息**：深蓝色背景，白色文字，12px 圆角，右下角直角
- **助手消息**：浅灰背景，深蓝文字，12px 圆角，左下角直角

## Do's and Don'ts

- **Do** 使用深蓝色 (#1A1A2E) 作为主按钮背景
- **Don't** 使用彩色渐变作为按钮背景
- **Do** 保持卡片圆角一致（12px）
- **Don't** 在卡片中混用不同圆角
- **Do** 使用紫色作为创意功能的点缀
- **Don't** 过度使用紫色，保持主色调简洁
- **Do** 保持间距的 8px 倍数关系
- **Don't** 使用非标准间距值
- **Do** 为所有可点击元素添加 hover 状态
- **Don't** 使用突兀的过渡动画
- **Do** 保持文字对比度符合 WCAG AA 标准（正文 > 4.5:1）
- **Don't** 使用低对比度的文字颜色
- **Do** 使用语义色彩区分不同状态
- **Don't** 混淆语义色彩的使用场景
- **Do** 保持动画时长在 150-300ms 之间
- **Don't** 使用过长或过短的动画
- **Do** 使用一致的阴影层级系统
- **Don't** 随意使用自定义阴影值

## Accessibility Guidelines

### 色彩对比度
- 正文文字与背景对比度 ≥ 4.5:1
- 大文字（> 18px 或 > 14px 粗体）与背景对比度 ≥ 3:1
- 按钮文字与按钮背景对比度 ≥ 4.5:1

### 键盘导航
- 所有可交互元素必须可通过 Tab 键访问
- 按钮和链接必须有明确的焦点状态
- 模态框打开时必须阻止背景内容的键盘导航

### 屏幕阅读器
- 所有图片必须有 alt 属性
- 表单元素必须有 label 关联
- 动态内容变化必须通过 ARIA 属性通知

### 语义化
- 使用正确的 HTML 语义标签（header, nav, main, footer 等）
- 按钮使用 button 元素，而非 div
- 链接使用 a 元素，且 href 属性正确

## Performance Guidelines

### 动画性能
- 使用 CSS transform 和 opacity 实现动画
- 避免使用 width/height/top/left 等触发重排的属性
- 为动画元素添加 will-change 属性
- 使用 CSS containment 限制重绘范围

### 图片优化
- 使用适当的图片格式（webp 优先）
- 为图片添加 loading="lazy" 属性
- 使用适当的图片尺寸，避免过大图片
- 添加图片占位符，减少布局偏移

### 代码优化
- 避免不必要的组件重渲染
- 使用 memo 优化组件性能
- 合理使用虚拟滚动处理大量数据
- 拆分大型组件为更小的可复用单元