# iOS 构建并上传 Firebase App Distribution

## 结论

iOS 上传 Firebase 的输入不是 `.app` 或源码，而是一个**已签名的 `.ipa`**。因此流程和 Android 不同：

1. 使用 Xcode / `xcodebuild archive` 编译 iOS Release。
2. 使用 Apple 的签名证书和 provisioning profile 导出 IPA。
3. 使用 Firebase App Distribution CLI 上传 IPA。
4. 上传脚本在真正上传前要求输入 `y`；输入其他内容或直接回车都会取消。

本项目已经提供：

```bash
yarn build:ios:stg     # 只构建，不上传
yarn upload:ios:stg    # 上传已经构建好的 IPA
yarn deploy:ios:stg   # 构建 + 显式确认后上传

yarn build:ios:prod
yarn upload:ios:prod
yarn deploy:ios:prod
```

构建产物：

```text
ios/build/staging/export/GuardianID.ipa
ios/build/prod/export/GuardianID.ipa
```

## Apple 签名准备

### 本地 Mac

- 在 Xcode 的 `Settings > Accounts` 登录 Apple Developer 账号。
- Team 使用项目中的 `DEVELOPMENT_TEAM`（当前为 `7TU5U5M9U6`）。
- Bundle ID 为 `id.app.guardian`。
- 选择真机或使用 `generic/platform=iOS` 归档，不能使用 Simulator 构建上传。
- 当前脚本默认使用 Apple Development 签名和 `development` 导出，适合先在已有开发证书的机器上验证流程。
- 用 Firebase 分发给测试人员时，建议配置 Apple Distribution 证书和 Ad Hoc profile；测试设备 UDID 必须已经加入 profile。

配置好 Distribution 证书后使用：

```bash
IOS_EXPORT_METHOD=release-testing IOS_CODE_SIGN_IDENTITY="Apple Distribution" yarn build:ios:stg
```

### CI / 构建机

构建机必须预先安装：

- Apple Distribution certificate（以及对应私钥）
- 对 `id.app.guardian` 的 Ad Hoc provisioning profile
- Xcode、CocoaPods、Node/Yarn
- 构建机已登录 Xcode，或在流水线中导入证书、profile 和临时 keychain

`-allowProvisioningUpdates` 只能帮助 Xcode 使用已经可用的账号/签名资源，不能替代 Apple 证书、私钥和 profile。不要把 `.p12`、私钥、密码或 provisioning profile 提交到 Git。

## Firebase 配置

Firebase App Distribution 的 iOS App ID 与 Android App ID 不同：

- Staging: `1:559336040593:ios:3d97159d683b7f6b69b730`
- Production: `1:892404998062:ios:a250109ad7f6e6aa5fb23f`

配置文件分别位于：

```text
ios/Firebase/Staging/GoogleService-Info.plist
ios/Firebase/Production/GoogleService-Info.plist
```

构建前脚本会把对应环境的 `.env` 和 `GoogleService-Info.plist` 放到 Xcode target 使用的位置。Firebase 配置文件是客户端配置，不是 Apple 签名密钥；但仍然应按团队安全策略管理。

首次使用或换机器时，请确认 Firebase CLI 和 service account：

```bash
npm i -g firebase-tools@11.30.0
mkdir -p "$HOME/.firebase-keys"
# 放置 staging-sa.json / prod-sa.json 后：
chmod 600 "$HOME/.firebase-keys/staging-sa.json"
chmod 600 "$HOME/.firebase-keys/prod-sa.json"
```

也可以使用自定义路径：

```bash
FIREBASE_SA_KEY="$HOME/.firebase-keys/staging-sa.json" yarn upload:ios:stg
```

## 是否每次都清缓存？

**不需要。**正常构建不要删除 `ios/Pods`、Xcode DerivedData 或整个 `node_modules`：

- JS/TS、原生业务代码变化：Xcode/RN 会重新编译需要的部分。
- 构建脚本只根据 `Podfile`、本地 `Pods/Manifest.lock` 和一个 ignored 的安装标记判断是否需要 `pod install`。
- 当前项目不要求提交或锁定 `ios/Podfile.lock`；`ios/Pods` 和本地安装标记也不提交。
- `IOS_CLEAN=1 yarn build:ios:stg` 才会执行 clean，适用于切换 Xcode/架构、Pod 异常、链接缓存异常等问题。

首次 checkout 或 `Podfile` 发生变化时需要执行一次 `pod install`，后续构建会复用 Pods 和 `ios/build/DerivedData`，不需要每次重新安装或清缓存。

### 构建进度

Xcode 的命令行工具没有像 Gradle 那样可靠的百分比进度 API。脚本会隐藏冗长的编译参数，只显示当前 target、正在编译的文件以及归档/导出阶段，例如 `🔨 CompileC ...`、`[1/2] Archiving`、`[2/2] Exporting IPA`。如果失败，会保留完整的 xcodebuild 日志路径并打印最后 80 行。

## 常见问题

### `No profiles for ... were found`

签名资源缺失或 Bundle ID / Team 不匹配。先在 Xcode 打开 `ios/GuardianID.xcworkspace`，选 GuardianID target 检查 Signing & Capabilities，再确认 Apple Developer Portal 上有对应 profile。

### `exportArchive: No profiles for ...`

归档成功但导出失败，通常是导出方式和 profile 不匹配。确认使用 Ad Hoc profile，或使用：

```bash
IOS_EXPORT_METHOD=release-testing IOS_CODE_SIGN_IDENTITY="Apple Distribution" yarn build:ios:stg
```

### 只改了 JS 但 IPA 内容没更新

不要手动执行 `bundle:js:ios` 作为常规流程；Release 的 Xcode Build Phase 会自动 bundle JS。若怀疑缓存，先使用 `IOS_CLEAN=1` 构建一次，而不是每次都清理。
