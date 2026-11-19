# 🔥 Firebase 环境配置文档

> **注意**: 此目录仅用于存放 Firebase 相关文档。实际配置文件请放在各平台对应的目录中。

---

## 📂 配置文件位置（方案3：混合方案）

### iOS 配置文件
```
ios/Firebase/
├── Development/
│   └── GoogleService-Info.plist
├── Staging/
│   └── GoogleService-Info.plist
└── Production/
    └── GoogleService-Info.plist
```

### Android 配置文件
```
android/app/src/
├── development/
│   └── google-services.json
├── staging/
│   └── google-services.json
└── production/
    └── google-services.json
```

---

## 📋 详细配置指南

请参考：[配置指南.md](./配置指南.md)

---

## 🚀 快速使用

### iOS

**Development**:
```bash
yarn ios:dev16
# Xcode Scheme: GuardianID
```

**Staging**:
```bash
yarn ios:stg
# Xcode Scheme: Staging
```

**Production**:
```bash
yarn ios
# Xcode Scheme: Production
```

### Android

**Development**:
```bash
yarn android:dev
```

**Staging**:
```bash
yarn android:stg
```

**Production**:
```bash
yarn android
```

---

## 🎯 工作原理

### iOS 自动切换
通过 Xcode Scheme 的 PreActions 脚本：
```bash
# 以 Staging 为例
cp "${PROJECT_DIR}/Firebase/Staging/GoogleService-Info.plist" \
   "${PROJECT_DIR}/GuardianID/GoogleService-Info.plist"
```

### Android 自动切换
通过 Gradle productFlavors 的 source sets 机制自动选择对应目录下的 `google-services.json`

---

## 📖 相关文档

- [配置指南.md](./配置指南.md) - 详细的配置步骤
- [README.md](../README.md) - 项目主文档
