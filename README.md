# ForestWarbler 的学术主页

一个极简的中英文学术主页框架，包含个人介绍（含 Contact）、Research、Publications 和 Miscellaneous 四个板块。使用原生 HTML、CSS 和 JavaScript，无需安装依赖或构建。默认显示中文，按钮可切换英文，浏览器会记住上次选择。

内容与界面代码分开保存。同一板块的中文和英文放在一个 JSON 文件中，不同板块各用一个文件。职位、学校、研究方向和论文均为明确的示例占位内容，请替换为自己的信息。

## 文件结构

```text
.
├── index.html              # 页面结构
├── assets/
│   ├── styles.css          # 页面样式
│   ├── main.js             # 加载内容和切换语言
│   └── favicon.svg         # 浏览器标签页图标
├── content/
│   ├── site.json           # 网站标题、导航和页脚
│   ├── profile.json        # 个人介绍与 Contact
│   ├── research.json       # Research / 研究方向
│   ├── publications.json   # Publications / 论文发表
│   └── miscellaneous.json  # Miscellaneous / 其他
└── .nojekyll               # 让 GitHub Pages 直接提供静态文件
```

修改内容只需编辑 `content/` 中的文件；调整布局或外观时，再修改 `index.html` 和 `assets/`。

## 编辑中英文内容

每个文件都包含 `zh` 和 `en` 两部分。修改中文后，也请更新同一文件中的英文。例如 `content/research.json`：

```json
{
  "zh": {
    "title": "研究方向",
    "paragraphs": ["在这里概括你关注的研究问题。"],
    "interests": [
      {
        "name": "研究方向名称",
        "description": "简要说明具体问题、方法或目标。"
      }
    ]
  },
  "en": {
    "title": "Research",
    "paragraphs": ["Summarize your research questions here."],
    "interests": [
      {
        "name": "Research area",
        "description": "Briefly describe the questions, methods, or goals."
      }
    ]
  }
}
```

### 个人介绍与 Contact

编辑 `content/profile.json`：

- `title`：导航中的板块名称。
- `name`：姓名。
- `affiliation`：职位、院系和学校等信息。
- `paragraphs`：介绍段落，每个字符串显示为一个段落。
- `contact.title`：联系方式标题。
- `contact.details`：邮箱说明、办公地址等文字，每个字符串显示为一行；可以设为 `[]`。
- `contact.links`：联系方式链接，每项包含 `label` 和 `url`。

Contact 与个人介绍放在同一个文件中。仓库保留了 ForestWarbler 的 GitHub 链接；添加邮箱链接时，可使用 `"url": "mailto:your-name@example.com"`，并替换为自己的邮箱。

### Research

编辑 `content/research.json` 中的 `paragraphs` 和 `interests`。每个研究方向包含 `name` 和 `description`；在中英文数组中添加、删除或调整顺序即可。只想保留概述时，可将 `interests` 设为 `[]`。

### Publications

编辑 `content/publications.json`：`title` 是板块标题，`description` 是可选说明，不需要时设为 `""`。在 `zh.items` 和 `en.items` 中添加或删除对应论文。一个论文条目的格式为：

```json
{
  "title": "论文标题",
  "authors": "作者一，作者二，作者三",
  "venue": "会议或期刊名称",
  "year": "2026",
  "links": [
    {
      "label": "PDF",
      "url": "https://example.com/paper.pdf"
    },
    {
      "label": "Code",
      "url": "https://example.com/code"
    }
  ]
}
```

以上 URL 仅用于说明格式，请替换为真实资源地址。页面中的示例论文没有资源链接。

- 论文按 `items` 数组顺序显示，不会按年份自动排序。将新论文放在数组前面即可优先显示。
- `authors` 是一个完整字符串，按希望显示的顺序填写作者；共同贡献标记等也可直接写在字符串中。
- `year` 使用字符串，例如 `"2026"`。
- `links` 可放论文、代码、数据或项目页；设为 `[]` 时不显示资源链接。
- 内容以纯文本显示，不解析 HTML 或 Markdown。

### Miscellaneous

编辑 `content/miscellaneous.json`，用 `paragraphs` 添加教学、学术服务或个人兴趣，用 `links` 添加相关链接。每个链接包含 `label` 和 `url`，没有链接时保留 `[]`。

### 网站通用文案

编辑 `content/site.json`：

| 字段 | 用途 |
| --- | --- |
| `title` / `description` | 浏览器标签页标题 / 网站描述 |
| `brand` | 页头名称 |
| `navigationLabel` | 导航的无障碍名称 |
| `languageButtonText` / `languageButtonLabel` | 语言按钮可见文案 / 无障碍名称 |
| `skipLink` / `backToTop` | 跳转正文 / 返回顶部链接文案 |
| `footer` | 页脚 |

### JSON 编辑注意

- 使用英文双引号包住字段名和文字。
- 相邻字段、段落或条目之间用逗号分隔，最后一项后面不要加逗号。
- JSON 不支持注释；文案中的双引号需要写成 `\"`。
- 保留字段名和 `zh`、`en`，修改它们对应的内容。
- 网页链接使用完整的 `https://` 或 `http://` 地址，邮箱链接使用 `mailto:`。

## 本地预览

在仓库目录中运行：

```bash
python3 -m http.server 8000
```

然后打开 [http://localhost:8000](http://localhost:8000)。修改文件后刷新页面即可查看效果，按 `Ctrl+C` 停止服务器。

页面通过 `fetch` 读取 JSON，需要通过 HTTP 预览，不能直接双击 `index.html` 打开。

## 发布到 GitHub Pages

将文件提交并推送到 GitHub 后，在仓库的 **Settings → Pages** 中，将发布来源设为 **Deploy from a branch**，选择 `main`（或仓库的默认分支），目录选择 **/ (root)**，然后保存。

此框架无需构建步骤。GitHub Pages 完成部署后，可通过设置页面显示的地址访问；对于名为 `ForestWarbler.github.io` 的个人主页仓库，地址为 [https://forestwarbler.github.io](https://forestwarbler.github.io)。后续修改内容并推送到发布分支即可更新网站。
