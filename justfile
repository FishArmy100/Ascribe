set dotenv-load

VERSION := "0.1.0"
LANGUAGES := "spa_Latn swh_Latn"

MSI_PATH := "./src-tauri/target/release/bundle/msi/Ascribe_{{version}}_x64_en-US.msi"
MSIX_PATH := "./packaging/ascribe-{{VERSION}}.msix"
PACKAGE_NAME := "FishArmy100.Ascribe"
PACKAGE_DISPLAY_NAME := "Ascribe"
PUBLISHER_NAME := "{{$PUBLISHER}}"
PUBLISHER_DISPLAY_NAME := "FishArmy100"

gen-config:
    #!/usr/bin/env bash
    cat > "./packaging/ConversionTemplate.xml" << EOF
    <?xml version="1.0" encoding="utf-8"?>
    <MsixPackagingToolTemplate
        xmlns="http://schemas.microsoft.com/appx/msixpackagingtool/template/2018">

        <Settings
            EnforceMicrosoftStoreVersioningRequirements="true" />

        <SaveLocation
            PackagePath="{{MSIX_PATH}}" />

        <Installer
            Path="{{MSI_PATH}}" />

        <PackageInformation
            PackageName="{{PACKAGE_NAME}}"
            PackageDisplayName="{{PACKAGE_DISPLAY_NAME}}"
            PublisherName="CN={{PUBLISHER_NAME}}"
            PublisherDisplayName="{{PUBLISHER_DISPLAY_NAME}}"
            Version="{{VERSION}}.0" />

    </MsixPackagingToolTemplate>
    EOF

install:
    npm install

translate:
    npx auto-i18n-cli                                       \
        -i "./src"                                          \
        -o "./src/assets/translations/translations.json"    \
        -s eng_Latn                                         \
        -l {{LANGUAGES}}                                    \
        -b azure                                            \
        --azureKey $AZURE_KEY

build: 
    npm run tauri build

msix:
    MsixPackagingTool.exe create-package --template packaging\ConversionTemplate.xml -v
