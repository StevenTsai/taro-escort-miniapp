# AI病历数据解析录入功能需求设计文档

## 1. 功能概述

本功能旨在为医疗陪诊小程序增加AI辅助能力，通过AI AGENT自动解析患者上传的病历资料（如PDF、Word、图片等），提取关键医疗信息，并自动生成治疗事件数据，最终调用MCP接口录入到数据库中。

## 2. 功能需求

### 2.1 核心功能

1. **文件上传功能**
   - 支持上传多种格式的病历文件：PDF、Word、图片（JPG、PNG）等
   - 支持多文件同时上传
   - 文件大小限制：单个文件不超过20MB
   - 文件数量限制：单次最多上传5个文件

2. **AI解析功能**
   - 调用AI AGENT服务对上传的文件进行解析
   - 提取关键医疗信息，包括但不限于：
     - 患者基本信息（姓名、性别、年龄等）
     - 就诊日期
     - 就诊医院
     - 主治医生
     - 诊断结果
     - 治疗方案
     - 检查项目及结果
     - 用药信息
   - 自动分类事件类型：治疗小结、检查事件、用药事件

3. **数据预览与编辑**
   - 解析完成后，展示AI提取的信息
   - 允许用户对提取的信息进行编辑和修改
   - 提供一键确认或逐条确认的方式

4. **自动录入功能**
   - 确认信息后，自动生成对应的治疗事件数据
   - 调用MCP接口将数据录入到数据库
   - 支持批量录入多个事件

5. **解析历史记录**
   - 记录用户的文件解析历史
   - 显示解析状态和结果
   - 支持查看和管理历史解析记录

### 2.2 辅助功能

1. **解析状态提示**
   - 上传文件后的处理状态提示
   - AI解析过程中的进度提示
   - 解析完成后的结果提示

2. **错误处理**
   - 文件上传失败的处理
   - AI解析失败的处理
   - 数据录入失败的处理
   - 提供重试机制

3. **用户引导**
   - 首次使用时的功能引导
   - 上传文件格式的提示
   - 解析结果的解读提示

## 3. 技术需求

### 3.1 前端技术

1. **文件上传**
   - 使用Taro的文件选择API
   - 支持本地文件选择
   - 支持拍照上传

2. **AI服务调用**
   - 调用后端提供的AI解析接口
   - 处理异步解析过程
   - 处理解析结果的展示

3. **数据处理**
   - 解析结果的格式化
   - 数据校验和验证
   - 与现有事件数据结构的转换

4. **UI组件**
   - 文件上传组件
   - 解析状态展示组件
   - 数据预览和编辑组件
   - 历史记录组件

### 3.2 后端技术

1. **AI AGENT服务**
   - 文件内容提取服务
   - 医疗信息识别和结构化服务
   - 事件类型分类服务

2. **API接口**
   - 文件上传接口
   - AI解析接口
   - 解析状态查询接口
   - 数据录入接口
   - 历史记录查询接口

3. **数据存储**
   - 上传文件的存储
   - 解析结果的存储
   - 历史记录的存储

## 4. 业务流程

### 4.1 主流程

1. **用户进入AI解析页面**
   - 从时间轴页面或患者详情页面进入

2. **选择并上传文件**
   - 选择要解析的病历文件
   - 上传文件到服务器

3. **AI解析处理**
   - 服务器接收文件并调用AI AGENT服务
   - AI解析文件内容，提取医疗信息
   - 分类事件类型，生成结构化数据

4. **解析结果预览**
   - 前端获取解析结果
   - 展示提取的信息和建议的事件类型
   - 用户查看并编辑信息

5. **确认并录入**
   - 用户确认解析结果
   - 前端调用MCP接口录入数据
   - 显示录入结果

6. **返回时间轴**
   - 录入完成后返回时间轴页面
   - 显示新生成的事件

### 4.2 异常流程

1. **文件上传失败**
   - 显示错误提示
   - 提供重试选项

2. **AI解析失败**
   - 显示解析失败提示
   - 分析失败原因
   - 提供人工录入选项

3. **数据录入失败**
   - 显示录入失败提示
   - 提供重试选项
   - 保存解析结果，允许后续再次尝试录入

## 5. 界面设计

### 5.1 页面结构

1. **AI解析主页**
   - 文件上传区域
   - 解析状态显示区域
   - 历史记录入口

2. **文件上传页面**
   - 文件选择按钮
   - 已选文件列表
   - 上传进度显示
   - 开始解析按钮

3. **解析结果页面**
   - 解析状态和耗时
   - 提取的信息列表
   - 编辑和修改界面
   - 确认录入按钮

4. **历史记录页面**
   - 解析记录列表
   - 每条记录的状态和结果
   - 查看详情按钮

### 5.2 交互设计

1. **文件上传交互**
   - 点击上传按钮弹出文件选择器
   - 支持拖拽上传（如果平台支持）
   - 上传进度条显示

2. **解析过程交互**
   - 显示解析中动画
   - 实时更新解析进度
   - 解析完成后显示结果预览

3. **数据编辑交互**
   - 点击字段可编辑
   - 提供下拉选择框选择事件类型
   - 支持批量编辑和确认

4. **反馈交互**
   - 操作成功或失败的提示
   - 解析结果的质量评分
   - 错误处理的引导

## 6. 数据结构

### 6.1 上传文件数据结构

```json
{
  "id": "string",
  "fileName": "string",
  "filePath": "string",
  "fileType": "string",
  "fileSize": "number",
  "uploadTime": "timestamp",
  "status": "string" // uploading, uploaded, parsing, parsed, failed
}
```

### 6.2 解析结果数据结构

```json
{
  "parseId": "string",
  "uploadFiles": ["array"],
  "parseResult": {
    "patientInfo": {
      "name": "string",
      "gender": "string",
      "age": "number"
    },
    "events": [
      {
        "eventType": "string", // treatment, inspection, medication
        "eventDate": "string", // YYYY-MM-DD
        "title": "string",
        "hospitalName": "string",
        "doctorName": "string",
        "diagnosisResult": "string",
        "treatmentPlan": "string",
        "inspectionItems": ["array"],
        "medications": ["array"],
        "isKeyNode": "boolean"
      }
    ]
  },
  "parseTime": "timestamp",
  "parseStatus": "string", // pending, processing, success, failed
  "errorMessage": "string"
}
```

### 6.3 事件数据结构（与现有结构保持一致）

```json
{
  "patientId": "string",
  "eventDate": "string", // YYYY-MM-DD
  "eventType": "string", // treatment, inspection, medication
  "title": "string",
  "content": "string", // JSON格式的详细内容
  "isKeyNode": "number", // 0或1
  "attachments": [
    {
      "fileName": "string",
      "filePath": "string",
      "fileType": "string",
      "fileSize": "number"
    }
  ]
}
```

## 7. API接口设计

### 7.1 文件上传接口

- **接口地址**: `/api/ai/upload`
- **请求方法**: POST
- **请求参数**:
  - `files`: 文件数组
  - `patientId`: 患者ID
- **返回数据**:
  ```json
  {
    "code": 0,
    "data": {
      "uploadId": "string",
      "files": [
        {
          "id": "string",
          "fileName": "string",
          "filePath": "string",
          "status": "uploaded"
        }
      ]
    },
    "msg": "上传成功"
  }
  ```

### 7.2 AI解析接口

- **接口地址**: `/api/ai/parse`
- **请求方法**: POST
- **请求参数**:
  - `uploadId`: 上传ID
  - `files`: 文件ID数组
- **返回数据**:
  ```json
  {
    "code": 0,
    "data": {
      "parseId": "string",
      "status": "processing"
    },
    "msg": "解析任务已提交"
  }
  ```

### 7.3 解析状态查询接口

- **接口地址**: `/api/ai/parse/status`
- **请求方法**: GET
- **请求参数**:
  - `parseId`: 解析ID
- **返回数据**:
  ```json
  {
    "code": 0,
    "data": {
      "parseId": "string",
      "status": "success",
      "progress": 100,
      "result": {
        "patientInfo": {},
        "events": []
      }
    },
    "msg": "查询成功"
  }
  ```

### 7.4 数据录入接口

- **接口地址**: `/api/ai/import`
- **请求方法**: POST
- **请求参数**:
  - `parseId`: 解析ID
  - `events`: 确认后的事件数组
  - `patientId`: 患者ID
- **返回数据**:
  ```json
  {
    "code": 0,
    "data": {
      "importedEvents": [
        {
          "eventId": "string",
          "eventType": "string",
          "status": "success"
        }
      ]
    },
    "msg": "录入成功"
  }
  ```

### 7.5 历史记录查询接口

- **接口地址**: `/api/ai/history`
- **请求方法**: GET
- **请求参数**:
  - `patientId`: 患者ID
  - `page`: 页码
  - `pageSize`: 每页数量
- **返回数据**:
  ```json
  {
    "code": 0,
    "data": {
      "list": [
        {
          "parseId": "string",
          "uploadTime": "timestamp",
          "parseTime": "timestamp",
          "status": "success",
          "fileCount": 2,
          "eventCount": 3
        }
      ],
      "total": 10
    },
    "msg": "查询成功"
  }
  ```

## 8. 实现计划

### 8.1 前端实现

1. **页面开发**
   - 创建AI解析主页 (`src/pages/aiParse/index.jsx`)
   - 创建文件上传页面 (`src/pages/aiParse/upload.jsx`)
   - 创建解析结果页面 (`src/pages/aiParse/result.jsx`)
   - 创建历史记录页面 (`src/pages/aiParse/history.jsx`)

2. **组件开发**
   - 文件上传组件 (`src/components/FileUploader/index.jsx`)
   - 解析状态组件 (`src/components/ParseStatus/index.jsx`)
   - 数据预览组件 (`src/components/DataPreview/index.jsx`)
   - 历史记录组件 (`src/components/ParseHistory/index.jsx`)

3. **功能集成**
   - 在时间轴页面添加AI解析入口
   - 集成文件上传和AI解析流程
   - 实现数据预览和编辑功能
   - 集成MCP接口调用

### 8.2 后端实现

1. **服务搭建**
   - AI AGENT服务部署
   - 文件存储服务配置
   - API接口开发

2. **功能实现**
   - 文件上传处理
   - AI解析任务调度
   - 数据提取和结构化
   - 事件分类和生成
   - MCP接口调用

3. **测试与优化**
   - 功能测试
   - 性能测试
   - 解析准确率优化

## 9. 风险评估

### 9.1 技术风险

1. **AI解析准确率**
   - 不同格式和质量的病历文件可能影响解析准确率
   - 手写病历的识别难度较大
   - 解决方案：提供人工编辑功能，允许用户修正解析结果

2. **文件处理性能**
   - 大文件和多文件同时处理可能导致性能问题
   - 解决方案：限制文件大小和数量，优化处理流程

3. **系统集成风险**
   - 与现有MCP接口的集成可能存在兼容性问题
   - 解决方案：充分测试接口集成，确保数据格式一致性

### 9.2 业务风险

1. **数据安全**
   - 病历数据属于敏感信息，需要确保安全
   - 解决方案：加密存储，严格权限控制

2. **用户体验**
   - AI解析过程可能耗时较长，影响用户体验
   - 解决方案：提供清晰的状态提示，优化解析速度

3. **合规性**
   - 需要符合相关医疗数据处理法规
   - 解决方案：遵循医疗数据处理规范，确保合规性

## 10. 验收标准

1. **功能完整性**
   - 所有核心功能正常运行
   - 辅助功能完善
   - 错误处理机制有效

2. **性能指标**
   - 文件上传速度：≤10秒（20MB文件）
   - AI解析速度：≤30秒（单文件）
   - 数据录入速度：≤5秒（单事件）

3. **准确率指标**
   - 结构化信息提取准确率：≥90%
   - 事件分类准确率：≥85%
   - 整体用户满意度：≥4.5/5

4. **兼容性**
   - 支持主流文件格式
   - 适配不同设备屏幕
   - 与现有功能无缝集成

5. **安全性**
   - 数据传输加密
   - 存储安全
   - 权限控制有效

## 11. 总结

AI病历数据解析录入功能将显著提升医疗陪诊小程序的用户体验，通过自动化处理减少用户手动录入的工作量，同时提高数据录入的准确性和完整性。该功能的实现将为用户提供更加智能、高效的病历管理工具，进一步增强小程序的核心竞争力。