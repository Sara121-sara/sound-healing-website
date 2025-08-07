# 声音疗愈网站

基于 Next.js、Supabase、TailwindCSS 和 Shadcn/UI 构建的现代声音疗愈预约和音频库网站。

## 功能特性

- 🎵 **音频库展示** - 用户可以浏览和播放疗愈音频
- 📅 **在线预约** - 用户可以预约个案疗愈服务
- 👤 **管理员后台** - 音频文件上传和预约管理
- 🔐 **安全认证** - 基于 Supabase Auth 的管理员登录
- 📱 **响应式设计** - 支持桌面和移动设备
- ☁️ **云存储** - 使用 Supabase Storage 存储音频文件

## 技术栈

- **前端**: Next.js 15 (App Router)
- **数据库**: Supabase PostgreSQL
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **样式**: TailwindCSS + Shadcn/UI
- **部署**: Netlify

## 本地开发

### 环境要求

- Node.js 18+
- npm/yarn/pnpm

### 安装依赖

```bash
npm install
```

### 环境变量配置

复制 `.env.local.example` 到 `.env.local` 并填入你的 Supabase 配置:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_nextauth_secret
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看网站。

## Supabase 数据库配置

### 创建表结构

在 Supabase SQL 编辑器中执行以下 SQL：

```sql
-- 预约表
CREATE TABLE public.appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  wechat_name text NOT NULL,
  phone text NOT NULL,
  service text NOT NULL,
  appointment_time timestamptz NOT NULL,
  status text DEFAULT 'pending'::text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 音频文件表
CREATE TABLE public.audio_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  storage_path text NOT NULL,
  description text,
  uploaded_by uuid REFERENCES auth.users(id),
  uploaded_at timestamptz DEFAULT now()
);

-- 设置表权限
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;

-- 预约表权限策略
CREATE POLICY "Anyone can insert appointments" ON public.appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view all appointments" ON public.appointments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update all appointments" ON public.appointments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all appointments" ON public.appointments
  FOR DELETE USING (auth.role() = 'authenticated');

-- 音频文件表权限策略
CREATE POLICY "Anyone can view audio files" ON public.audio_files
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert audio files" ON public.audio_files
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update audio files" ON public.audio_files
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete audio files" ON public.audio_files
  FOR DELETE USING (auth.role() = 'authenticated');
```

### 创建存储桶

在 Supabase Storage 中创建一个名为 `audio-files` 的公共存储桶。

## 部署到 Netlify

### 方法一：连接 GitHub 仓库

1. 将代码推送到 GitHub 仓库
2. 在 Netlify 中连接该仓库
3. 设置环境变量（与本地 .env.local 相同）
4. 部署会自动开始

### 方法二：手动部署

1. 构建项目：`npm run build`
2. 将 `.next` 文件夹上传到 Netlify

### 环境变量设置

在 Netlify 控制台中设置以下环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`

## 项目结构

```
sound-healing-app/
├── app/                    # Next.js App Router 页面
│   ├── admin/             # 管理员后台
│   ├── login/             # 登录页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ui/               # Shadcn/UI 组件
│   ├── AdminDashboard.tsx
│   ├── AppointmentForm.tsx
│   ├── AudioLibrary.tsx
│   └── Navigation.tsx
├── lib/                  # 工具函数
│   ├── supabase/         # Supabase 客户端配置
│   └── utils.ts
├── types/                # TypeScript 类型定义
│   └── database.ts
├── middleware.ts         # Next.js 中间件（认证保护）
├── netlify.toml         # Netlify 部署配置
└── package.json
```

## 使用说明

### 管理员功能

1. 访问 `/login` 使用管理员账号登录
2. 登录后访问 `/admin` 进入管理后台
3. **预约管理**: 查看所有用户预约，更改状态，删除预约
4. **音频管理**: 上传新的疗愈音频，删除现有音频，试听音频

### 用户功能

1. 浏览首页的疗愈音频库，在线播放音频
2. 填写个案预约表单，提交预约请求
3. 查看网站介绍和服务信息

## 许可证

MIT License
