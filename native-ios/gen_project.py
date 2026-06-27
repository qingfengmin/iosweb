import sys
import re

fw_paths = sys.argv[1].strip().split('\n') if sys.argv[1].strip() else []

# ----------------------------------------------------------------
# 过滤二进制损坏 / 不兼容 Xcode 16+ 的广告 SDK 框架
# 这些 xcframework 提取后 binary 格式异常，链接器报 "unknown file type"
# ----------------------------------------------------------------
BROKEN_PATTERNS = [
    r'MTGSDK',              # Mintegral 广告 SDK
    r'KSAdSDK',             # 快手广告 SDK
    r'BUAdSDK',             # 穿山甲广告 SDK
    r'GDTMobSDK',           # 广点通广告 SDK
    r'PAGAdSDK',            # Pangle 广告 SDK
    r'CSJMediation',        # CSJ 聚合
    r'FBAudienceNetwork',   # Facebook 广告
    r'InMobi',              # InMobi 广告
    r'MetaAdapter',         # Meta 广告适配器
    r'AppLovin',            # AppLovin 广告
    r'IronSource',          # IronSource 广告
    r'UnityAds',            # Unity 广告
    r'VungleAdsSDK',        # Vungle 广告
    r'GoogleMobileAds',     # Google 广告
    r'WindSDK',             # Wind 广告
    r'YouTuiAdSDK',         # 优推广告
    r'GeYanSdk',            # 个验 SDK
    r'OctAdSDK',            # Oct 广告
    r'BURelyFoundation_Global',  # 已知损坏
    r'DCUniAd',             # uni-ad 适配器层
    r'AdAdapter',           # 所有 Adapter 后缀
]

filtered = []
for fw in fw_paths:
    blocked = False
    for pattern in BROKEN_PATTERNS:
        if re.search(pattern, fw):
            print(f"  [SKIP] excluded: {fw}")
            blocked = True
            break
    if not blocked:
        filtered.append(fw)

print(f"Frameworks: {len(filtered)} included, {len(fw_paths) - len(filtered)} excluded")

deps = []
for fw in filtered:
    deps.append('      - framework: ' + fw)
    deps.append('        embed: true')

fw_deps_yaml = '\n'.join(deps)

yml = """name: UniAppShell
options:
  bundleIdPrefix: com.qingfeng
  deploymentTarget:
    iOS: "12.0"
targets:
  UniAppShell:
    type: application
    platform: iOS
    sources:
      - UniAppShell
    settings:
      base:
        INFOPLIST_FILE: UniAppShell/Info.plist
        PRODUCT_BUNDLE_IDENTIFIER: com.qingfeng.iosweb
        OTHER_LINKER_FLAGS: "-ObjC -weak_framework SwiftUI"
        FRAMEWORK_SEARCH_PATHS: "$(SRCROOT)/SDK/UniAppX-iOS@5.07/SDK/Libs"
        ENABLE_USER_SCRIPT_SANDBOXING: NO
        CODE_SIGN_IDENTITY: ""
        CODE_SIGNING_REQUIRED: "NO"
        CODE_SIGNING_ALLOWED: "NO"
        VALIDATE_PRODUCT: "NO"
    dependencies:
FW_DEPS_PLACEHOLDER
      - sdk: JavaScriptCore.framework
      - sdk: libc++.tbd
    preBuildScripts:
      - name: "Copy uni-app x Resources"
        script: |
          set -e
          RES_SRC="${SRCROOT}/../unpackage/resources/app-ios/__UNI__447C18F"
          DST="${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/uni-app-x/apps/__UNI__447C18F"
          mkdir -p "${DST}"
          cp -R "${RES_SRC}/www/" "${DST}/"
          echo "Resources copied to ${DST}"
"""

yml = yml.replace('FW_DEPS_PLACEHOLDER', fw_deps_yaml)

with open('project.yml', 'w') as f:
    f.write(yml)

print('project.yml written')
