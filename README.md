gen-ui\components\prebuilt\  组件预设页面
ai\tools\workout.tsx         组件预设页面相关工具
ai\tools\index.ts            路由
ai\graph.tsx                 添加相关链接

兼容性

test
"记录一次晨跑：标题是'清晨5公里'，距离5公里，时间35分钟，配速7分钟每公里，消耗了320卡路里"

可以使用以下提示让AI助手创建个性化训练计划：
"帮我制定一个为期4周的初级健身计划，目标是增肌，重点锻炼胸部和背部"
"我想要一个中级减脂训练计划，每周训练5天，重点锻炼腹部和腿部"
"请为我设计一个高级力量训练计划，为马拉松做准备，重点是耐力训练"


可以使用以下提示让AI助手创建各种营养食谱：
"请为我制作一份低脂高蛋白的鸡胸肉沙拉食谱，包含详细的营养成分"
"我想要一份适合减肥期间的早餐食谱，要求低碳水、高蛋白且容易制作"
"帮我设计一道中式素食炒饭的食谱，需要包含丰富的蔬菜和适量的蛋白质"
"请提供一份适合儿童的健康甜点食谱，要求低糖且含有水果"
"我需要一份适合运动后恢复的高蛋白食谱，最好是能在30分钟内完成的"
"帮我制作一份地中海风格的鱼类食谱，包含橄榄油和新鲜香草"
"请设计一份无麸质的面包替代品食谱，适合乳糖不耐受的人"

可以使用以下提示让AI助手创建运动与健康成就徽章：
"展示我的跑步成就，包括'连续跑步30天'金牌徽章和'完成首个10公里'银牌徽章"
"创建我的健身成就集，包括'完成100次俯卧撑挑战'和'30天健身房打卡'徽章"
"显示我的健康习惯成就，包括'连续一周早睡早起'铜牌和'每日8杯水'银牌徽章"
"帮我制作一个瑜伽成就集，记录我完成的初级和中级瑜伽课程徽章"
"创建我的游泳里程碑成就，包括'学会蛙泳'和'首次完成1000米自由泳'徽章"
"展示我的骑行成就徽章，记录我的首次50公里和100公里骑行里程碑"
"制作一个健康饮食成就集，包括'连续一个月不吃垃圾食品'和'学会制作5道健康菜品'徽章"



可以使用以下提示让AI助手创建个性化训练打卡记录：
"创建一个名为'30天健身挑战'的训练打卡记录，目前已连续打卡15天，目标是30天，包含最近的5次训练记录"
"帮我制作一个瑜伽训练打卡记录，标题是'瑜伽修行之旅'，已坚持7天，目标21天，记录包括不同强度的瑜伽练习"
"生成一个跑步训练记录表，我已经连续跑步10天了，目标是100天，包含最近的几次跑步记录和详细数据"
"创建一个力量训练打卡记录，记录我的卧推、深蹲和硬拉训练，已坚持20天，目标是60天"
"帮我做一个游泳训练记录表，标题是'自由泳进阶'，目前已练习12天，目标是50天，包含不同强度的训练"
"创建一个健身打卡记录，包含有氧和力量训练，已坚持5天，目标是90天，记录详细的训练类型和时长"























# Generative UI with LangChain.js 🦜🔗

![Generative UI with LangChain.js](./public/gen_ui_diagram.png)

## Overview

This application aims to provide a template for building generative UI applications with LangChain.js.
It comes pre-built with a few UI features which you can use to play about with gen ui. The UI components are built using [Shadcn](https://ui.shadcn.com/).

## Getting Started

### Installation

First, clone the repository and install dependencies:

```bash
git clone https://github.com/bracesproul/gen-ui.git

cd gen-ui

yarn install
```

Next, if you plan on using the existing pre-built UI components, you'll need to set a few environment variables:

Copy the [`.env.example`](./.env.example) file to `.env`:

The `OPENAI_API_KEY` is required. LangSmith keys are optional, but highly recommended if you plan on developing this application further.

Get your OpenAI API key from the [OpenAI dashboard](https://platform.openai.com/login?launch).

[Sign up/in to LangSmith](https://smith.langchain.com/) and get your API key.

Create a new [GitHub PAT (Personal Access Token)](https://github.com/settings/tokens/new) with the `repo` scope.

[Create a free Geocode account](https://geocode.xyz/api).

```bash
# ------------------LangSmith tracing------------------
LANGCHAIN_API_KEY=...
LANGCHAIN_CALLBACKS_BACKGROUND=true
LANGCHAIN_TRACING_V2=true
# -----------------------------------------------------

GITHUB_TOKEN=...
OPENAI_API_KEY=...
GEOCODE_API_KEY=...
FIRECRAWL_API_KEY=...
```

### Running the Application

To run the application in development mode run:

```bash
yarn dev
```

This will start the application on [`http://localhost:3000`](http://localhost:3000).

To run in production mode:

```bash
yarn start

yarn build
```

#### Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbracesproul%2Fgen-ui&env=GITHUB_TOKEN,OPENAI_API_KEY,GEOCODE_API_KEY,FIRECRAWL_API_KEY,LANGCHAIN_API_KEY,LANGCHAIN_CALLBACKS_BACKGROUND,LANGCHAIN_TRACING_V2&project-name=gen-ui&repository-name=gen-ui)

### Go further

If you're interested in ways to take this demo application further, I'd consider the following:

- Generating entire React components to be rendered, instead of relying on pre-built components. OR: Using the LLM to build custom components using a UI library like [Shadcn](https://ui.shadcn.com/).
- Multi-tool and component usage. Update the LangGraph agent to call multiple tools, and appending multiple different UI components to the client rendered UI.
- Generative UI outside of the chatbot window. Have the UI dynamically render in different areas on the screen. E.g a dashboard, where the components are dynamically rendered based on the LLMs output.
