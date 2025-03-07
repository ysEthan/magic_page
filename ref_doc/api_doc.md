# 生产管理系统 API 文档

## 通用说明

### 1. 认证要求
所有接口都需要在请求头中携带JWT令牌：
```
Authorization: Bearer <access_token>
```

### 2. 响应格式
- 列表接口都支持分页
- 支持过滤和搜索
- 大部分接口支持排序

### 3. 错误响应
```json
{
  "detail": "错误信息"
}
```

### 4. 状态码
- 200: 请求成功
- 201: 创建成功
- 204: 删除成功
- 400: 请求参数错误
- 401: 未认证或认证失败
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误

## 生产管理模块 (Production)

### 1. 生产类目管理 (Categories)

#### 1.1 获取生产类目列表
- **接口**: `/api/production/categories/`
- **方法**: `GET`
- **权限**: 需要认证
- **查询参数**:
  - `category_type`: 类目类型 (resin/metal/ceramic/plush)
  - `is_active`: 是否启用
  - `search`: 搜索关键词（搜索编码、名称和描述）
- **响应**:
  ```json
  {
    "count": "integer",
    "next": "string",
    "previous": "string",
    "results": [
      {
        "id": "integer",
        "code": "string",
        "name": "string",
        "category_type": "string",
        "category_type_display": "string",
        "description": "string",
        "is_active": "boolean",
        "created_at": "datetime",
        "updated_at": "datetime"
      }
    ]
  }
  ```

#### 1.2 创建生产类目
- **接口**: `/api/production/categories/`
- **方法**: `POST`
- **权限**: 需要认证
- **请求参数**:
  ```json
  {
    "code": "string",
    "name": "string",
    "category_type": "string",
    "description": "string",
    "is_active": "boolean"
  }
  ```

### 2. 生产任务管理 (Orders)

#### 2.1 获取生产任务列表
- **接口**: `/api/production/orders/`
- **方法**: `GET`
- **权限**: 需要认证
- **查询参数**:
  - `order_type`: 生产类型 (trial/mass)
  - `status`: 状态 (pending/in_progress/completed/cancelled)
  - `priority`: 优先级 (0/1/2/3)
  - `category`: 类目ID
  - `product`: 产品ID
  - `manager`: 主管用户ID
  - `created_by`: 创建人用户ID
  - `min_planned_start_date`: 最小计划开始日期
  - `max_planned_start_date`: 最大计划开始日期
  - `min_created_at`: 最小创建时间
  - `max_created_at`: 最大创建时间
  - `search`: 搜索关键词
- **响应**:
  ```json
  {
    "count": "integer",
    "next": "string",
    "previous": "string",
    "results": [
      {
        "id": "integer",
        "code": "string",
        "product": "integer",
        "product_info": {
          "id": "integer",
          "code": "string",
          "name": "string"
        },
        "category": "integer",
        "category_info": {
          "id": "integer",
          "code": "string",
          "name": "string",
          "category_type": "string",
          "category_type_display": "string"
        },
        "channel": "integer",
        "channel_info": {
          "id": "integer",
          "code": "string",
          "name": "string"
        },
        "order_type": "string",
        "order_type_display": "string",
        "quantity": "integer",
        "priority": "integer",
        "priority_display": "string",
        "priority_order": "integer",
        "status": "string",
        "status_display": "string",
        "planned_start_date": "date",
        "planned_end_date": "date",
        "actual_start_date": "date",
        "actual_end_date": "date",
        "manager": "integer",
        "manager_info": "object",
        "description": "string",
        "technical_requirements": "string",
        "quality_requirements": "string",
        "created_by": "integer",
        "created_by_info": "object",
        "created_at": "datetime",
        "updated_at": "datetime",
        "main_image": "string",
        "main_image_url": "string",
        "attachments": ["string"],
        "steps": ["object"],
        "comments": ["object"]
      }
    ]
  }
  ```

#### 2.2 创建生产任务
- **接口**: `/api/production/orders/`
- **方法**: `POST`
- **权限**: 需要认证
- **Content-Type**: `multipart/form-data`
- **请求参数**:
  ```json
  {
    "code": "string",
    "product": "integer",
    "category": "integer",
    "channel": "integer",
    "order_type": "string",
    "quantity": "integer",
    "priority": "integer",
    "priority_order": "integer",
    "planned_start_date": "date",
    "planned_end_date": "date",
    "manager": "integer",
    "description": "string",
    "technical_requirements": "string",
    "quality_requirements": "string",
    "main_image": "file",
    "attachments": ["string"]
  }
  ```

#### 2.3 更新任务状态
- **接口**: `/api/production/orders/{id}/update_status/`
- **方法**: `POST`
- **权限**: 需要认证
- **请求参数**:
  ```json
  {
    "status": "string"  // pending/in_progress/completed/cancelled
  }
  ```

#### 2.4 更新优先级排序
- **接口**: `/api/production/orders/{id}/update_priority_order/`
- **方法**: `POST`
- **权限**: 需要认证
- **请求参数**:
  ```json
  {
    "priority_order": "integer"  // 数字越小优先级越高
  }
  ```

#### 2.5 上传任务主图
- **接口**: `/api/production/orders/{id}/upload_image/`
- **方法**: `POST`
- **权限**: 需要认证
- **Content-Type**: `multipart/form-data`
- **请求参数**:
  ```json
  {
    "main_image": "file"  // 图片文件
  }
  ```
- **响应**:
  ```json
  {
    "status": "success",
    "main_image_url": "string"
  }
  ```

### 3. 生产步骤管理 (Steps)

#### 3.1 获取生产步骤列表
- **接口**: `/api/production/steps/`
- **方法**: `GET`
- **权限**: 需要认证
- **查询参数**:
  - `order`: 生产任务ID
  - `step_type`: 步骤类型
  - `status`: 状态
  - `operator`: 操作员ID
  - `search`: 搜索关键词
- **响应**:
  ```json
  {
    "count": "integer",
    "results": [
      {
        "id": "integer",
        "order": "integer",
        "step_type": "string",
        "step_type_display": "string",
        "name": "string",
        "sequence": "integer",
        "description": "string",
        "status": "string",
        "status_display": "string",
        "planned_duration": "string",
        "actual_duration": "string",
        "start_time": "datetime",
        "end_time": "datetime",
        "operator": "integer",
        "operator_info": "object",
        "quality_check_result": "string",
        "notes": "string",
        "attachments": ["string"],
        "created_at": "datetime",
        "updated_at": "datetime"
      }
    ]
  }
  ```

### 4. 生产评论管理 (Comments)

#### 4.1 获取评论列表
- **接口**: `/api/production/comments/`
- **方法**: `GET`
- **权限**: 需要认证
- **查询参数**:
  - `order`: 生产任务ID
  - `step`: 生产步骤ID
  - `comment_type`: 评论类型
  - `author`: 评论人ID
  - `search`: 搜索关键词
- **响应**:
  ```json
  {
    "count": "integer",
    "results": [
      {
        "id": "integer",
        "order": "integer",
        "step": "integer",
        "comment_type": "string",
        "comment_type_display": "string",
        "content": "string",
        "images": ["string"],
        "author": "integer",
        "author_info": "object",
        "parent": "integer",
        "replies": ["object"],
        "created_at": "datetime",
        "updated_at": "datetime"
      }
    ]
  }
  ```

### 5. 来源渠道管理 (Channels)

#### 5.1 获取渠道列表
- **接口**: `/api/production/channels/`
- **方法**: `GET`
- **权限**: 需要认证
- **查询参数**:
  - `is_active`: 是否启用
  - `search`: 搜索关键词
- **响应**:
  ```json
  {
    "count": "integer",
    "next": "string",
    "previous": "string",
    "results": [
      {
        "id": "integer",
        "code": "string",
        "name": "string",
        "description": "string",
        "is_active": "boolean"
      }
    ]
  }
  ```

#### 5.2 创建渠道
- **接口**: `/api/production/channels/`
- **方法**: `POST`
- **权限**: 需要认证
- **请求参数**:
  ```json
  {
    "code": "string",
    "name": "string",
    "description": "string",
    "is_active": "boolean"
  }
  ```
