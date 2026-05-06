# 🦛 HIPPO MEME — 河马梗图生成器

> 无需连接钱包 · AI 生成梗图 · 方案B税收梯度联动 · 代币销毁通缩叙事

## 功能简介

- **梗图生成**：输入关键词，调用 Replicate API 生成卡通河马梗图（丑萌大小眼、粗描边、扁平色块风格）。无 API Key 时自动降级为占位图模式，页面仍可正常运行。
- **方案B税收梯度面板**：根据今日生成梗图数实时显示当前税收梯度（Normal / High / Very High / Ultra），含买税、卖税及黑洞销毁比例。
- **分红/释放逻辑面板**：展示总供应、释放池剩余、每次生成的代币分配比例（持仓池 50% / 创作奖励 20% / 黑洞销毁 30%），以及本地账本分配记录。
- **梗图墙**：展示所有已生成梗图（通过 IndexedDB 本地持久化）。
- **无需钱包**：所有分红/持仓数据均为站内本地模拟，仅作演示用途。

---

## 本地启动

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Replicate API Key（可选）

复制 `.env.example` 为 `.env`，并填入你的 Replicate API Token：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
VITE_REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxx
```

> 如不配置，页面仍可运行，生成图片将使用占位图，并在界面顶部显示提示。

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173)

### 4. 构建生产版本

```bash
npm run build
```

构建产物位于 `dist/` 目录。

---

## 如何获取 Replicate API Key

1. 访问 [https://replicate.com](https://replicate.com) 并注册账号
2. 进入 [Account Settings → API Tokens](https://replicate.com/account/api-tokens)
3. 创建新 Token，复制后填入 `.env` 文件

---

## 代币参数说明

| 参数 | 数值 |
|------|------|
| 总供应量 | 10,000,000,000（100亿） |
| 释放池 | 5,000,000,000（总量50%） |
| 每张梗图释放 | 10,000 代币 |
| 预计可支持梗图数 | ~500,000 张 |
| 持仓池分配 | 50% |
| 创作者奖励 | 20% |
| 黑洞/社区基金 | 30% |

### 方案B税收梯度

| 梯度 | 今日生成数 | 买入税 | 卖出税 |
|------|-----------|--------|--------|
| Normal | 0–100 张 | 2% | 4% |
| High | 101–500 张 | 3% | 4.5% |
| Very High | 501–1000 张 | 4% | 5% |
| Ultra | 1000+ 张 | 5% | 6% |

- 买入税中 **50%** 进入黑洞销毁
- 卖出税中 **60%** 进入黑洞销毁

---

## ⚠️ 重要免责声明

1. **无钱包连接**：本站无需、也不支持连接任何加密货币钱包。
2. **模拟展示**：页面内展示的持仓量、累计收益、分红分配等数据，均为**站内本地模拟演示**，不代表任何真实链上资产或收益。
3. **链上以合约为准**：任何链上税收参数、代币分配逻辑，均以实际部署的智能合约（Flap 合约）参数为准，页面展示数据仅供参考。
4. **非投资建议**：本站内容仅作技术演示，不构成任何投资建议。

---

## 技术栈

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [idb](https://github.com/jakearchibald/idb)（IndexedDB 封装）
- [Replicate API](https://replicate.com/docs/reference/http)（AI 图片生成）