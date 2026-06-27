import sys

fw_paths = sys.argv[1].strip().split('\n') if sys.argv[1].strip() else []

deps = []
for fw in fw_paths:
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
        OTHER_LINKER_FLAGS: "-ObjC -ld_classic -weak_framework SwiftUI"
        FRAMEWORK_SEARCH_PATHS: "$(SRCROOT)/SDK/Libs $(SRCROOT)/SDK/SDK/Libs"
        ENABLE_USER_SCRIPT_SANDBOXING: NO
        CODE_SIGN_IDENTITY: ""
        CODE_SIGNING_REQUIRED: "NO"
        CODE_SIGNING_ALLOWED: "NO"
    dependencies:
FW_DEPS_PLACEHOLDER
      - sdk: JavaScriptCore.framework
      - sdk: libc++.tbd
    preBuildScripts:
      - name: "Copy uni-app x Resources"
        script: |
          set -e
          RES_SRC="${SRCROOT}/../../unpackage/resources/app-ios/__UNI__447C18F"
          DST="${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/uni-app-x/apps/__UNI__447C18F"
          mkdir -p "${DST}"
          cp -R "${RES_SRC}/www/" "${DST}/"
          echo "Resources copied to ${DST}"
"""

yml = yml.replace('FW_DEPS_PLACEHOLDER', fw_deps_yaml)

with open('project.yml', 'w') as f:
    f.write(yml)

print('project.yml written')
