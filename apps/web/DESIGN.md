---
name: AI 漫剧工作台
colors:
  primary: "#000000"
  on-primary: "#FFFFFF"
  secondary: "#F5F5F5"
  on-secondary: "#333333"
  tertiary: "#8B5CF6"
  on-tertiary: "#FFFFFF"
  background: "#F8F8F8"
  surface: "#FFFFFF"
  surface-elevated: "#FFFFFF"
  on-surface: "#1A1A1A"
  on-surface-variant: "#6B7280"
  outline: "#E5E7EB"
  outline-variant: "#D1D5DB"
  accent: "#00D4FF"
  success: "#22C55E"
  warning: "#F59E0B"
  error: "#EF4444"
  purple-light: "#EDE9FE"
  purple-accent: "#8B5CF6"
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: 700
    lineHeight: 44px
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
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
components:
  card-standard:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.outline}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  card-elevated:
    backgroundColor: "{colors.surface-elevated}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "8px 20px"
    height: 40px
  button-primary-hover:
    backgroundColor: "#1A1A1A"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "8px 20px"
    height: 40px
  button-outline:
    borderColor: "{colors.outline}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "8px 20px"
    height: 40px
  button-purple:
    backgroundColor: "{colors.purple-accent}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "6px 16px"
    height: 32px
  input-field:
    backgroundColor: "{colors.secondary}"
    borderColor: "{colors.outline}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
    height: 40px
  input-field-focus:
    borderColor: "{colors.accent}"
  badge-standard:
    backgroundColor: "{colors.secondary}"
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
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "6px 16px"
---

## Brand & Style

小云雀 AI 漫剧工作台是一款面向内容创作者的专业工具，采用极简主义设计风格，强调清晰的信息层级和流畅的创作体验。整体视觉语言现代、清爽，以浅色背景为基底，配合深色主按钮和紫色点缀，营造专业而亲和的创作氛围。

设计核心原则：
- **简洁高效**：去除冗余元素，让用户专注于创作流程
- **清晰层级**：通过留白、卡片和色彩对比建立明确的视觉层次
- **柔和交互**：采用圆润的按钮和卡片，配合细腻的过渡动画
- **专业感**：深色主按钮传达专业和信赖感，紫色点缀增添创意氛围

## Colors

色彩系统采用浅色背景配合深色主色调，形成清晰的对比层次。

- **Primary (#000000)**：纯黑色，用于主按钮和关键操作，传达专业与权威
- **On-Primary (#FFFFFF)**：纯白色，用于深色背景上的文字
- **Secondary (#F5F5F5)**：浅灰色，用于次要背景和按钮
- **Background (#F8F8F8)**：极浅灰色，作为页面主背景，柔和不刺眼
- **Surface (#FFFFFF)**：纯白卡片背景，用于内容区域
- **On-Surface (#1A1A1A)**：深灰色正文，保证阅读舒适度
- **On-Surface-Variant (#6B7280)**：中灰色，用于次要文字和标签
- **Outline (#E5E7EB)**：浅灰边框，分隔内容区域
- **Accent (#00D4FF)**：青色点缀，用于进度指示和重点突出
- **Tertiary (#8B5CF6)**：紫色，用于会员和特殊功能按钮，增添创意感
- **Purple-Light (#EDE9FE)**：淡紫色背景，用于标签和徽章

**色彩使用规范**：
- 主按钮必须使用纯黑色背景配白色文字
- 卡片统一使用白色背景配浅灰边框
- 标签和徽章使用淡紫色背景配深紫色文字
- 警告和错误状态使用语义色彩

## Typography

采用 Inter 字体作为全局字体，建立清晰的排版层级。

- **Display-Large**：36px，字重 700，用于页面主标题
- **Headline-Large**：24px，字重 600，用于区域标题
- **Headline-Medium**：20px，字重 600，用于卡片标题
- **Body-Large**：16px，字重 400，用于主要内容
- **Body-Medium**：14px，字重 400，用于次要内容
- **Body-Small**：12px，字重 400，用于辅助信息
- **Label-Medium**：12px，字重 600，用于按钮和标签文字
- **Label-Small**：11px，字重 600，用于微标签和状态文字

**排版使用规范**：
- 标题使用字重 600-700，正文使用字重 400
- 行高设置：标题 1.3-1.4，正文 1.5-1.6
- 按钮和标签文字全部使用字重 600
- 标签文字可适当增加字间距（letter-spacing: 0.05em）

## Layout & Spacing

采用 8px 基础网格系统，确保布局的一致性和节奏感。

- **Unit**：8px，所有间距和尺寸的基准单位
- **XS**：4px，微间距，用于元素内部紧凑布局
- **SM**：8px，小间距，用于小型组件内边距
- **MD**：16px，中等间距，用于卡片内边距和元素间距
- **LG**：24px，大间距，用于区域分隔和外边距
- **XL**：32px，超大间距，用于页面级别的分隔
- **XXL**：48px，最大间距，用于关键区域的留白

**布局原则**：
- 页面采用侧边栏 + 主内容区的双栏布局
- 卡片内边距统一使用 24px（LG）
- 卡片之间间距使用 16px（MD）
- 内容区域与边框的最小距离为 24px（LG）
- 使用 Flexbox 和 Grid 实现响应式布局

## Elevation & Depth

通过阴影和边框营造视觉层次，而非依赖颜色深浅。

- **卡片层级**：白色背景 + 浅灰边框，基础层级
- **悬浮效果**：hover 时添加轻微阴影（0 4px 20px rgba(0,0,0,0.08)）
- **弹窗层级**：更高的阴影（0 8px 32px rgba(0,0,0,0.12)）
- **按钮状态**：点击时轻微下沉（transform: translateY(1px)）

**层级规范**：
- 避免使用厚重阴影，保持轻盈感
- 阴影模糊半径大于扩散半径，营造柔和效果
- 所有可点击元素必须有 hover 状态反馈

## Shapes

采用圆润但不过分的圆角设计，营造现代友好的视觉感受。

- **SM (4px)**：用于小按钮和标签
- **MD (8px)**：用于标准按钮和输入框
- **LG (12px)**：用于卡片和容器
- **XL (16px)**：用于弹窗和模态框
- **Full (9999px)**：用于圆形按钮和徽章

**形状规范**：
- 卡片统一使用 12px 圆角
- 按钮统一使用 8px 圆角
- 标签和徽章使用全圆角
- 避免在同一视图中混用不同圆角风格

## Components

### Cards
- **标准卡片**：白色背景，1px 浅灰边框，12px 圆角，24px 内边距
- **悬浮卡片**：白色背景，16px 圆角，带有柔和阴影

### Buttons
- **主按钮**：黑色背景，白色文字，8px 圆角，40px 高度
- **次按钮**：浅灰背景，深灰文字，8px 圆角，40px 高度
- **轮廓按钮**：白色背景，浅灰边框，深灰文字，8px 圆角
- **紫色按钮**：紫色背景，白色文字，小号尺寸（32px 高度），用于特殊功能

### Inputs
- **输入框**：浅灰背景，浅灰边框，8px 圆角，40px 高度
- **聚焦状态**：边框变为青色 (#00D4FF)
- **文本域**：同样的样式，可调整高度

### Tabs
- **激活状态**：黑色背景，白色文字，全圆角
- **未激活状态**：浅灰背景，中灰文字，全圆角
- **步骤指示**：数字标签显示进度

### Badges
- **标准徽章**：浅灰背景，中灰文字，全圆角
- **强调徽章**：淡紫背景，紫色文字，全圆角

### Lists
- **列表项**：12px 内边距，hover 时背景变为浅灰
- **分隔线**：1px 浅灰线，仅用于列表内部

## Do's and Don'ts

- **Do** 使用纯黑色作为主按钮背景
- **Don't** 使用彩色渐变作为按钮背景
- **Do** 保持卡片圆角一致（12px）
- **Don't** 在卡片中混用不同圆角
- **Do** 使用紫色作为创意功能的点缀
- **Don't** 过度使用紫色，保持主色调简洁
- **Do** 保持间距的 8px 倍数关系
- **Don't** 使用非标准间距值
- **Do** 为所有可点击元素添加 hover 状态
- **Don't** 使用突兀的过渡动画
- **Do** 保持文字对比度符合 WCAG AA 标准
- **Don't** 使用低对比度的文字颜色