# Plan

### 0.3.0

Note taking support + cloud sync

### 0.2.0

Multiple windows/tab support

### 0.1.1

Mostly a bugfix patch, also adding a better publication pipeline for windows

- [ ] Bugfixes
  - [x] Strongs number inspector cant click on strongs numbers
  - [ ] Whenever loading the bible page, will immediately switch to whatever should be playing in the audio player
    - [ ] Also seems to break chapter navigation
  - [x] Search button does not have a sound effect
  - [ ] Audio player behavior appears bugged
    - [ ] Continuous not being continuous (in Chapter Range mode)
    - [ ] Repeat count not playing the last chapter in the last round? (in Chapter Range mode)
  - [x] Bible printer does not render verse punctuation
  - [x] Label background not the correct color (in the printer page)
    - [x] Verse/Verse Text 
    - [x] Verse/Verse Alt Text
    - [x] Title/Text Format
  - [x] Sound effect for some of the context menu's not playing
    - [x] inspect verse
- [ ] New Features
  - [ ] Translation comparison for verses
  - [x] Copy/Paste context menu for verses
  - [ ] Open chapter/verse popover from their respective context menus
  - [ ] Spell check/suggestions for search page?
  - [ ] Search across modules
  - [ ] Alternate search syntax (&, |)
  - [ ] Printer Settings/Ranges save
- [ ] Publication pipeline
  - [ ] One distribution command line pipeline
    - [ ] Error if not dry run?
    - [ ] Run i18n-translation
  - [ ] One dry-run command line pipeline
    - [ ] Run i18n-translation
  - [ ] Pipeline steps (Windows), use GitHub actions???
    - [ ] Compile application
    - [ ] Generate MSIX package
    - [ ] Upload MSIX package to store
      - [ ] Give updated data
    - [ ] Auto-publish (not in dry-run)
  - [ ] Version bump command
    - [ ] Major
    - [ ] Minor
    - [ ] Patch
    - [ ] Echo version number