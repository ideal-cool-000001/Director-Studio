# 🎬 Director-Studio

AI 视频导演 Agent 平台 — 全流程 AI 视频创作工作台

## 🌟 核心功能

### 1. 3D导演台
- **实时 WebGL 场景编排**：角色、道具、机位与全景的实时编排
- **全身多轴关节控制**：身体、躯干、头部、手臂、腿部的逐关节摆姿
- **20组姿势预设**：站立、T型、行走、跑步、坐姿、蹲下、单膝跪、双膝跪、叉腰、倚靠、鞠躬、思考、格斗、踢球、投掷、推进、招手、伸手、抱臂、看手机
- **15+运镜预设**：正面中景、正面特写、侧面跟拍、过肩、鸟瞰、荷兰角等
- **导演视角/机位视角切换**：一键切换，机位视角带取景框与三分构图网格
- **场景缓存**：自动保存到浏览器，下次访问即恢复

### 2. 画布节点系统
- **8种节点类型**：Character（角色）、Scene（场景）、Storyboard（分镜）、Image（图片）、Video（视频）、Audio（音频）、Text（文本）、Style（风格）
- **3种连接线**：StrongDependency（实线强依赖）、WeakReference（虚线弱引用）、StyleInheritance（点划线风格继承）
- **节点状态管理**：draft → generating → ready → approved → failed
- **版本历史**：每次生成创建新版本，支持单节点回滚

### 3. 剧本编辑系统
- **章节大纲管理**：多章节组织结构，支持拖拽排序
- **场景编辑**：时代背景、地点、时间、出场人物、氛围设定
- **人物设定**：角色类型、年龄、性格、动机、背景故事、外貌特征
- **AI 辅助创作**：续写、润色、生成场景等 AI 能力

### 4. 专业视频剪辑
- **时间轴编辑**：多轨道视频/音频管理，支持片段拖拽
- **剪辑工具**：分割、删除、转场效果（淡入淡出、交叉溶解等）
- **色彩调整**：亮度、对比度、饱和度精细调节
- **风格滤镜**：黑白、复古、暖色、冷色、胶片等多种预设
- **视频特效**：模糊、锐化、降噪、防抖、色彩校正

### 5. 提示词知识库
- **提示词词典**：镜头运镜、灯光照明、动作表现、视觉特效、声音音效分类
- **提示词模板**：紧凑模板、时间轴模板、序列续拍模板
- **套话改写指南**：将抽象感觉词拆解为具体物理元素
- **一键复制**：支持复制任意提示词和模板

### 6. WebSocket实时通信
- **12种事件类型**：节点状态变化、缩略图更新、质量评分、任务进度、成本变化、预算警告、审核请求等
- **自动重连机制**：最多5次尝试，指数退避策略
- **实时进度推送**：Agent任务进度、导出进度实时推送

### 7. 数据库持久化（PostgreSQL）
- **完整数据模型**：项目、节点、边、任务、版本、用户、Prompt版本
- **数据访问层**：ProjectRepository、GraphRepository 仓储模式
- **数据库迁移**：Alembic管理，初始迁移脚本已就绪

### 8. 质量检验与导出
- **质量评分系统**：基于元数据完整性的自动评分（excellent/good/fair/poor）
- **项目成片导出**：整合视频/音频节点，支持下载
- **多平台宣发**：抖音/快手/B站/小红书内容自动生成

### 9. 9个专家Agent
| Agent | 职责 |
|-------|------|
| Producer | 项目创建、预算分配、成本追踪 |
| Director | 全流程把控、质量监督、人类用户介入 |
| Screenwriter | 剧本创作、小说写作、剧本拆解 |
| Character Designer | 角色形象设计、服装道具设计 |
| Scene Designer | 场景环境设计、背景设计 |
| Video Generator | 文生视频、视频质量控制 |
| Audio Producer | 语音合成、音效生成、混音 |
| Editor | 视频剪辑、色彩调整、特效合成 |
| Promotion | 短视频剪辑、文案生成 |

## 🚀 项目迭代方向

### 1. 艺术风格体系扩展
参考 Toonflow 的风格体系，建立完整的风格预设库：
- 2D风格：日式动画、扁平设计、国潮风格、都市言情
- 3D风格：动漫渲染、国风赛博、黏土定格
- 真人风格：古装、现代都市

### 2. 叙事类型模板
参考 Toonflow 的故事类型体系：
- 喜剧幽默、成长故事、家庭温情、历史史诗
- 恐怖灵异、热血动作、悬疑惊悚、心理剧情
- 科幻末世、甜蜜言情、职场都市、仙侠玄幻

### 3. 资产中心建设
参考 waoowaoo 的资产管理模式：
- 角色库：支持角色创建、编辑、复用
- 场景库：可复用的场景环境设定
- 道具库：支持道具设计和管理
- 语音库：多音色配音管理

### 4. AI 能力增强
- AI 助手聊天：支持自然语言交互创作
- 唇形同步：视频口型匹配优化
- 智能提示词生成：基于上下文的自动提示词推荐

### 5. 多语言国际化
- 支持中文、英文、日文等多语言界面
- 多语言提示词模板

### 6. 成本管理系统
- 生成成本预估和追踪
- 预算控制和告警
- 消费明细统计

## 🛠️ 技术栈

### 前端（apps/web）
| 层面 | 选型 |
|------|------|
| 框架 | React 18 + TypeScript 5.x |
| 构建 | Vite 6 |
| 画布 | React Flow (xyflow) |
| 3D | Three.js + React Three Fiber + @react-three/drei |
| 状态 | Zustand（多 store） |
| UI | shadcn/ui + Tailwind CSS |
| HTTP | Axios |
| WebSocket | 原生 WebSocket + 自动重连 |

### 后端（apps/api）
| 层面 | 选型 |
|------|------|
| 框架 | FastAPI + Uvicorn |
| Agent编排 | LangGraph |
| ORM | SQLAlchemy 2.0 async |
| 迁移 | Alembic |
| 数据库 | PostgreSQL 16 |
| 缓存/队列 | Redis 7 |
| 对象存储 | S3 / R2 |
| HTTP客户端 | httpx async |
| 监控 | LangSmith |

### 共享层（packages/）
| 包 | 职责 |
|-----|------|
| shared-types | 前后端共享类型定义 |
| validation-rules | 共享校验规则 |

## 📁 项目结构

```
Director-Studio/
├── packages/
│   ├── shared-types/          # 共享类型定义
│   └── validation-rules/      # 共享校验规则
├── apps/
│   ├── web/                   # 前端画布应用
│   │   ├── src/
│   │   │   ├── canvas/        # 画布引擎（节点/边/工作区）
│   │   │   ├── studio/        # 3D导演台模块
│   │   │   ├── services/      # API/WS服务层
│   │   │   ├── stores/        # Zustand状态管理
│   │   │   ├── hooks/         # 自定义Hooks
│   │   │   ├── pages/         # 功能页面
│   │   │   └── components/    # UI组件
│   └── api/                   # 后端Agent服务
│       ├── src/
│       │   ├── agents/        # 9个专家Agent
│       │   ├── api/           # API路由层
│       │   ├── coordinator/   # Agent调度协调器
│       │   ├── db/            # 数据访问层
│       │   ├── ws/            # WebSocket管理
│       │   ├── prompts/       # Prompt工程系统
│       │   └── services/      # 外部API客户端
├── infra/                     # 基础设施配置
└── scripts/                   # 开发脚本
```

## 🚀 快速开始

### 前置条件
- Node.js >= 20.x
- pnpm >= 9.x
- Python >= 3.11
- PostgreSQL >= 16
- Redis >= 7

### 安装依赖

```bash
cd Director-Studio
pnpm install
```

### 前端开发

```bash
cd apps/web
pnpm dev
```

访问 http://localhost:5173

### 后端开发

```bash
cd apps/api
python -m pip install -e .
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### 数据库迁移

```bash
cd apps/api
alembic upgrade head
```

### 构建生产版本

```bash
pnpm build
```

## 🔌 API 接口

### RESTful API

| 接口 | 方法 | 描述 |
|------|------|------|
| /api/v1/projects | POST | 创建项目 |
| /api/v1/projects | GET | 项目列表 |
| /api/v1/projects/{id} | GET | 项目详情 |
| /api/v1/projects/{id}/graph | GET | 获取完整图结构 |
| /api/v1/projects/{id}/nodes | POST | 创建节点 |
| /api/v1/projects/{id}/nodes/{node_id} | PATCH | 更新节点 |
| /api/v1/projects/{id}/nodes/{node_id} | DELETE | 删除节点 |
| /api/v1/projects/{id}/edges | POST | 创建连接线 |
| /api/v1/projects/{id}/generate | POST | 触发全量生成 |
| /api/v1/projects/{id}/export | POST | 触发成片导出 |
| /api/v1/projects/{id}/quality-check | POST | 质量检验 |
| /api/v1/projects/{id}/promotion/generate | POST | 生成宣发内容 |
| /api/v1/settings | GET | 获取AI服务配置 |
| /api/v1/settings | POST | 创建AI服务配置 |
| /api/v1/settings/{id} | PATCH | 更新AI服务配置 |
| /api/v1/settings/{id} | DELETE | 删除AI服务配置 |

### WebSocket

```
ws://host/api/v1/ws/projects/{project_id}
```

支持的事件类型：`node:status_changed`、`task:progress`、`cost:updated`、`review:required` 等

## 🎨 3D导演台优化亮点

- **解剖学几何体**：锥形圆柱体模拟真实肢体，关节球体连接各部位
- **三点照明系统**：主光、补光、背光，支持阴影映射和ACES色调映射
- **深色主题配色**：`#060608` 背景、`#00d4ff` 青色强调、细边框设计
- **专业UI面板**：TopBar、LeftPanel、Toolbar、RightPanel 完整布局

## 📝 License

MIT