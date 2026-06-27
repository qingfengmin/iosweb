# iOS 离线打包 — GitHub Actions 构建指南

> 适用于 uni-app x 项目，通过 GitHub Actions 自动编译生成未签名 IPA（裸包）
> 仓库：https://github.com/qingfengmin/iosweb

## 原理

不需要 DCloud 云打包 / 不需要 Apple 开发者账号
macOS runner 下载 iOS SDK → 配合本地资源 → xcodebuild 编译 → 生成 IPA

触发方式：push 到 main 自动触发，或手动 Run workflow

## 快速使用

### 编译新版本
```bash
# 1. 更新 uni-app 资源（在 HBuilderX 发行后）
cp -r /path/to/unpackage/resources/app-ios/__UNI__447C18F/www unpackage/resources/app-ios/__UNI__447C18F/www

# 2. 推送触发编译
git add . && git commit -m "chore: rebuild IPA" && git push origin main
```

### 下载 IPA
进入 Actions 页面 → 最新运行 → Artifacts → 下载 `iosweb-offline-*.ipa`

> Artifacts 保留 7 天，需及时下载

---

## 踩坑记录（重要）

以下是实际构建过程中遇到的所有错误及修复方案，复用时优先检查。

### 错误 1：`ld: unknown option: -ld_classic`

**现象**：Xcode 16+ 默认使用 LLD 链接器，`-ld_classic` 是旧版 ld64 专属 flag，LLD 不识别

**报错位置**：`Build IPA` 步骤，链接阶段

**修复**：移除 `OTHER_LINKER_FLAGS` 中的 `-ld_classic`

```python
# 修改前
OTHER_LINKER_FLAGS: "-ObjC -ld_classic -weak_framework SwiftUI"

# 修改后
OTHER_LINKER_FLAGS: "-ObjC -weak_framework SwiftUI"
```

**文件**：`native-ios/gen_project.py`

---

### 错误 2：`ld: unknown file type in '.../MTGSDKSplash.framework/MTGSDKSplash'`

**现象**：Mintegral 等广告 SDK 的 xcframework 提取后 binary 格式异常，链接器无法识别

**根本原因**：UniAppX SDK 内置了大量广告 SDK（MTGSDK / KSAdSDK / BUAdSDK 等），这些框架的二进制格式与 Xcode 16+ 不兼容

**修复**：在 `gen_project.py` 中过滤掉所有广告 SDK 框架，不参与链接

```python
# gen_project.py 中添加过滤逻辑
BROKEN_PATTERNS = [
    r'MTGSDK', r'KSAdSDK', r'BUAdSDK', r'GDTMobSDK',
    r'PAGAdSDK', r'CSJMediation', r'FBAudienceNetwork',
    r'InMobi', r'MetaAdapter', r'AppLovin', r'IronSource',
    r'UnityAds', r'VungleAdsSDK', r'GoogleMobileAds',
    r'WindSDK', r'YouTuiAdSDK', r'GeYanSdk', r'OctAdSDK',
    r'BURelyFoundation_Global', r'DCUniAd', r'AdAdapter',
]
```

> 如果你的项目需要广告功能，需要单独处理这些 SDK 的兼容性，而非直接排除

---

### 错误 3：`error: Framework ... did not contain an Info.plist`

**现象**：Xcode 26（GitHub runner 已升级到 Xcode 26.5）的 Validate 阶段严格检查框架的 Info.plist，AlipaySDK 等第三方框架缺少该文件导致验证失败

**修复**：在 `gen_project.py` 的项目配置中添加 `VALIDATE_PRODUCT: "NO"`

```yaml
# project.yml 生成配置中
settings:
  base:
    VALIDATE_PRODUCT: "NO"
```

**文件**：`native-ios/gen_project.py`

---

### 错误 4：`FRAMEWORK_SEARCH_PATHS` 路径不存在

**现象**：链接器警告 `search path '.../SDK/Libs' not found`，路径配置与实际 SDK 目录结构不匹配

**修复**：修正为 SDK 实际路径

```python
# 修改前（路径不存在）
FRAMEWORK_SEARCH_PATHS: "$(SRCROOT)/SDK/Libs $(SRCROOT)/SDK/SDK/Libs"

# 修改后
FRAMEWORK_SEARCH_PATHS: "$(SRCROOT)/SDK/UniAppX-iOS@5.07/SDK/Libs"
```

**文件**：`native-ios/gen_project.py`

---

### 错误 5：OAuth Token 缺少 `workflow` 权限

**现象**：`git push` 时报 `refusing to allow an OAuth App to create or update workflow .github/workflows/*.yml without 'workflow' scope`

**原因**：通过 `gh auth login` 的 OAuth 方式授权，默认不含 `workflow` 写权限，无法推送 `.github/workflows/` 目录的改动

**规避方案**：把 workflow 相关的修复逻辑移到 `gen_project.py` 等普通文件中，避免修改 `.github/workflows/*.yml`

**根治方案**：使用 Personal Access Token (PAT) 并勾选 `workflow` 权限，或重新 `gh auth refresh --scopes workflow`

---

## 已知限制

| 限制 | 说明 |
|------|------|
| IPA 保留 7 天 | Artifacts 有有效期，需及时下载或配置自动上传到 Release |
| SDK 缓存 7 天过期 | runner 不活跃时缓存失效，需重新下载（约 3-5 分钟） |
| SDK 版本固定 | 当前使用 `UniAppX-iOS@5.07`，DCloud 更新时需手动升级 |
| 未签名 IPA | 真机安装需要本地重新签名，无开发者证书无法上架 App Store |
| macOS runner 迁移 | GitHub 提示 `macos-latest` 将于 2026-06-15 起迁移到 macOS 26，Xcode 版本会变化 |

## 目录结构

```
iosweb/
├── .github/workflows/build-ios.yml   # CI 配置
├── native-ios/
│   ├── gen_project.py                # 生成 Xcode 工程配置（核心脚本）
│   ├── UniAppShell/                  # iOS 原生代码
│   │   ├── AppDelegate.swift
│   │   ├── ViewController.swift
│   │   └── Info.plist
│   └── SDK/                          # (gitignore) iOS SDK，Action 自动下载
├── unpackage/resources/app-ios/
│   └── __UNI__447C18F/www/           # uni-app 编译产物，需手动更新
└── pages/                            # uni-app 业务代码
```

## 本地调试

如需在本地验证 `gen_project.py` 逻辑：

```bash
cd native-ios

# 1. 手动下载并解压 SDK 到 native-ios/SDK/
# 2. 生成 project.yml
python3 gen_project.py "$(find SDK -name '*.xcframework' -maxdepth 6 -type d ! -path '*/__MACOSX/*')"

# 3. 生成 Xcode 工程
xcodegen generate

# 4. 打开工程编译
open UniAppShell.xcodeproj
```
