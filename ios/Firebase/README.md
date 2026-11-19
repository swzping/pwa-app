# iOS Firebase 配置目录

此目录存放各环境的 Firebase iOS 配置文件。

## 📂 目录结构

```
Firebase/
├── README.md                           ← 当前文档
├── Development/
│   └── GoogleService-Info.plist       ← Development 环境配置
├── Staging/
│   └── GoogleService-Info.plist       ← Staging 环境配置
└── Production/
    └── GoogleService-Info.plist       ← Production 环境配置
```

## 🔄 工作原理

构建时，Xcode Scheme 的 PreActions 脚本会自动将对应环境的配置文件复制到：
```
ios/GuardianID/GoogleService-Info.plist
```

## 📥 如何配置

1. 从 [Firebase Console](https://console.firebase.google.com/) 下载对应环境的 `GoogleService-Info.plist`
2. 替换对应目录下的配置文件
3. 确保 `BUNDLE_ID` 为 `id.app.guardian`

详细步骤请参考：[../../firebase/配置指南.md](../../firebase/配置指南.md)

## ⚠️ 注意事项

- ✅ 配置文件必须是 **plist 格式**（XML）
- ✅ 不要将 Android 的 `google-services.json` 放在这里
- ✅ 构建前确保配置文件存在且正确

## 🚀 使用

```bash
# Development (使用 GuardianID scheme)
yarn ios:dev16

# Staging (使用 Staging scheme)
yarn ios:stg

# Production (使用 Production scheme)
yarn ios
```

## 🔒 安全

如果配置文件包含敏感信息：
- 不要提交到公开仓库
- 使用密码管理器备份
- 团队内部安全共享

