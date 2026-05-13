# BusPool - 公交纸质日票共享平台

## 项目概述
Durham 大学城公交纸质 Day Ticket 共享平台。用户拍摄闲置的纸质 Day Ticket 条码照片上传，其他用户借用后用手机屏幕展示条码给车上扫码器识别，实现一人购票、全天复用。

## 核心前提
- **仅支持纸质票**（Paper Ticket），不支持 App 电子票
- 条码为静态，扫码器可识别手机屏幕照片
- 同一张票同一天内可被多人复用

## 技术栈
- **前端**: Next.js 16 + TypeScript + Tailwind CSS (PWA)
- **后端**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **部署**: Vercel + Supabase Cloud

## 核心规则
- 所有页面移动端优先设计
- 使用 Supabase Row Level Security 控制数据权限
- 条码照片存储在 Supabase Storage，访问权限严格控制
- 积分系统：上传者获积分，借用者扣积分，确认有效后结算
- 信誉系统：追踪每张票的有效率，低于阈值禁止上传
- 强制 .ac.uk 邮箱注册
