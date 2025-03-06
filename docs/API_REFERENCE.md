# API参考文档

本文档详细说明了记账城市微信小程序与后端API的交互方式和接口定义。

## API基础URL

```
http://localhost:8000
```

在生产环境中，应替换为实际的API服务器地址。

## 通用响应格式

所有API响应都遵循以下格式：

- 成功响应：直接返回数据或操作结果
- 错误响应：返回包含错误详情的JSON对象

错误响应示例：
```json
{
  "detail": "错误信息描述"
}
```

## 认证

当前版本不需要认证。未来版本可能会添加基于微信登录的认证机制。

## API端点

### 交易管理

#### 获取交易列表

```
GET /transactions
```

查询参数：
- `type`: 交易类型（income/expense）
- `category_id`: 分类ID
- `start_date`: 开始日期（YYYY-MM-DD）
- `end_date`: 结束日期（YYYY-MM-DD）
- `location`: 位置

响应：
```json
[
  {
    "id": 1,
    "type": "expense",
    "amount": 100.0,
    "category_id": 1,
    "category_name": "餐饮",
    "description": "午餐",
    "date": "2025-02-27",
    "location": "北京"
  }
]
```

#### 获取单个交易

```
GET /transactions/{id}
```

响应：
```json
{
  "id": 1,
  "type": "expense",
  "amount": 100.0,
  "category_id": 1,
  "category_name": "餐饮",
  "description": "午餐",
  "date": "2025-02-27",
  "location": "北京"
}
```

#### 创建交易

```
POST /transactions
```

请求体：
```json
{
  "type": "expense",
  "amount": 100.0,
  "category_id": 1,
  "description": "午餐",
  "date": "2025-02-27",
  "location": "北京"
}
```

响应：
```json
{
  "id": 1,
  "type": "expense",
  "amount": 100.0,
  "category_id": 1,
  "category_name": "餐饮",
  "description": "午餐",
  "date": "2025-02-27",
  "location": "北京"
}
```

#### 更新交易

```
PUT /transactions/{id}
```

请求体：
```json
{
  "type": "expense",
  "amount": 120.0,
  "category_id": 1,
  "description": "午餐和饮料",
  "date": "2025-02-27",
  "location": "北京"
}
```

响应：
```json
{
  "id": 1,
  "type": "expense",
  "amount": 120.0,
  "category_id": 1,
  "category_name": "餐饮",
  "description": "午餐和饮料",
  "date": "2025-02-27",
  "location": "北京"
}
```

#### 删除交易

```
DELETE /transactions/{id}
```

响应：
```json
{
  "success": true
}
```

### 分类管理

#### 获取分类列表

```
GET /categories
```

查询参数：
- `type`: 分类类型（income/expense）

响应：
```json
[
  {
    "id": 1,
    "name": "餐饮",
    "type": "expense"
  },
  {
    "id": 2,
    "name": "交通",
    "type": "expense"
  }
]
```

### 城市和建筑管理

#### 获取城市数据

```
GET /city
```

响应：
```json
{
  "grid_size": 10,
  "buildings_count": 5,
  "special_buildings_count": 1
}
```

#### 获取建筑列表

```
GET /buildings
```

响应：
```json
[
  {
    "id": 1,
    "type_id": 1,
    "level": 1,
    "x": 3,
    "y": 4,
    "transaction_id": 1,
    "transaction_type": "expense",
    "category_name": "餐饮",
    "location": "北京",
    "is_special": false
  }
]
```

#### 获取建筑类型

```
GET /building-types
```

响应：
```json
[
  {
    "id": 1,
    "name": "住宅",
    "description": "基础住宅建筑"
  },
  {
    "id": 2,
    "name": "商业",
    "description": "商业建筑"
  }
]
```

#### 合并建筑

```
POST /buildings/merge
```

请求体：
```json
{
  "building_ids": [1, 2, 3]
}
```

响应：
```json
{
  "id": 4,
  "type_id": 1,
  "level": 2,
  "x": 3,
  "y": 4,
  "transaction_id": null,
  "transaction_type": null,
  "category_name": "餐饮",
  "location": null,
  "is_special": false
}
```

### 统计分析

#### 获取交易汇总

```
GET /summary
```

查询参数：
- `start_date`: 开始日期（YYYY-MM-DD）
- `end_date`: 结束日期（YYYY-MM-DD）

响应：
```json
{
  "total_income": 1000.0,
  "total_expense": 800.0,
  "income_by_category": [
    {
      "category": "工资",
      "amount": 1000.0
    }
  ],
  "expense_by_category": [
    {
      "category": "餐饮",
      "amount": 500.0
    },
    {
      "category": "交通",
      "amount": 300.0
    }
  ]
}
```

## 错误代码

| 状态码 | 描述 |
|-------|-----|
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## API调用示例

### 微信小程序API调用

```javascript
// 获取交易列表
wx.request({
  url: 'http://localhost:8000/transactions',
  method: 'GET',
  success: (res) => {
    console.log('交易列表:', res.data);
  },
  fail: (err) => {
    console.error('请求失败:', err);
  }
});

// 创建新交易
wx.request({
  url: 'http://localhost:8000/transactions',
  method: 'POST',
  data: {
    type: 'expense',
    amount: 100.0,
    category_id: 1,
    description: '午餐',
    date: '2025-02-27',
    location: '北京'
  },
  success: (res) => {
    console.log('创建成功:', res.data);
  },
  fail: (err) => {
    console.error('创建失败:', err);
  }
});
```

## 注意事项

1. 所有金额数据应为数字类型，不应包含货币符号
2. 日期格式应为YYYY-MM-DD
3. 在生产环境中，API请求应使用HTTPS
4. 建议实现请求重试和错误处理机制
