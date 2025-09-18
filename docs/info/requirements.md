# Ascribe Requirements

- List:
  - General Layout
  - Bible
  - Searching
  - Audio Player
  - Settings
  - Notebook Editor
  - Highlight Editor
  - Note Editor
  - Daily Readings
  - Cloud Sync
  - Platforms
  - Help Page?
  - Info Page (For modules ie: Bibles)?

## Table of Contents:
- [Ascribe Requirements](#ascribe-requirements)
  - [Table of Contents:](#table-of-contents)
  - [General Layout](#general-layout)
    - [Core Components](#core-components)
    - [Header](#header)
    - [Body](#body)
  - [Bible](#bible)
    - [Versions](#versions)
    - [Interface](#interface)
  - [Searching](#searching)
    - [Search Syntax](#search-syntax)
    - [Search Page](#search-page)

<!-- ======================================================================================================== -->

## General Layout
The general layout we can keep pretty similar to old version, though would be good to make a few tweaks regarding style

### Core Components
- [ ] Image Button
- [ ] Image Dropdown
- [ ] Text Dropdown
- [ ] Value slider
- [ ] Info Popup (Alert, etc)
- [ ] Search Bar

### Header
The header comprises a sticky top bar with buttons, dropdowns, and sometimes a search input at the top of the page. Most of the more complex settings (indicated in **bold**) are right aligned, whereas all the other buttons are left aligned

- [ ] Options (dependent on Page)
  - [ ] Bible Page
    - [ ] Chapter Selector
    - [ ] Search Bar
    - [ ] Previous Section
    - [ ] Next Section
    - [ ] Audio Player
    - [ ] Version Selector (???)
    - [ ] **Verse Render Settings**
    - [ ] **Misc Dropdown**
  - [ ] Search Page
    - [ ] Chapter Selector
    - [ ] Search Bar
    - [ ] Previous Section
    - [ ] Next Section
    - [ ] Audio Player
    - [ ] **Verse Render Settings**
    - [ ] **Misc Dropdown**
  - [ ] Settings Page
    - [ ] Back Button
    - [ ] **Misc Dropdown**
  - [ ] Daily Readings Page
    - [ ] Version Selector
    - [ ] Back Button
    - [ ] **Misc Dropdown**
  - [ ] Notebooks Page
    - [ ] Back Button
    - [ ] New Notebook
    - [ ] **Misc Dropdown**
  - [ ] Highlight Editor Page
    - [ ] Back Button
    - [ ] New Highlight Button
    - [ ] **Misc Dropdown**
  - [ ] Help Page?
    - [ ] Back Button
    - [ ] **Misc Dropdown**
- [ ] **Misc Dropdown**
  - [ ] Settings
  - [ ] Daily Readings
  - [ ] Notebooks
  - [ ] Help Page?
  - [ ] Highlight Editor
  - [ ] Sync Button? (possibly change location)
- [ ] **Verse Render Settings**
  - [ ] Red letter
  - [ ] Strong's
  - [ ] Footnotes
  - [ ] Use Parallel
  - [ ] Version Selector

### Body
The body is formed of two primary categories: single and split view. Split view is used exclusively(???) for note editing and is not available in mobile, as it would not fit properly on the view screen. If required, it would switch between the two different views

It also contains a footer with the text: "&copy; Ascribe (year)"

<!-- ======================================================================================================== -->


## Bible
Core section of Ascribe, renders as a full page or partial page depending on if currently editing a note, or if on mobile. We can pretty much just copy & paste what we have for the old version

### Versions
- [ ] Required:
  - [ ] KJV
  - [ ] BBE
  - [ ] YLT
  - [ ] ASV
  - [ ] SpaRV
- [ ] Nice to Have:
  - [ ] ESV
  - [ ] NKJV
  - [ ] NASB

### Interface
- [ ] Chapter View
  - [ ] Displays current chapter
  - [ ] Each verse displayed in a numbered list
  - [ ] View Settings?
    - [ ] All verses inline
    - [ ] Red letter enable
    - [ ] Strong's numbers enable (if available for the version)
  - [ ] Special rendering for Gods name?
  - [ ] Verse words:
    - [ ] Displays highlights
    - [ ] Displays notes
    - [ ] Displays footnotes?
    - [ ] Can display Strong's if enabled
  - [ ] Scrollable content area
  - [ ] Next/Previous chapter buttons
    - [ ] Are cyclic: Rev 22 <-> Gen 1
- [ ] Parallels
  - [ ] Can enable to user to display two different bible versions
    - [ ] Only available if it fits the users space
    - [ ] Scroll synced
- [ ] Chapter Selector (same as old)
  - [ ] Toggle selected book
  - [ ] Select chapter in number grid
  - [ ] Resides in the header bar


<!-- ======================================================================================================== -->

## Searching

### Search Syntax
The search syntax should cover all major use cases, and the more esoteric ones as well, that the typical Bible study student should come across
- Format
  - [ ] Bible Section
    - [ ] In the format `prefix? book chapter ":"? start_verse?("-" verse)?`
    - [ ] The book will attempt to be found based on the algorithm implemented in the old version
  - [ ] Words
    - [ ] Exact Phrase
      - [ ] Words wrapped in `"`
    - [ ] Exact Words
    - [ ] Approximate Phrase
  - [ ] Strong's Number
    - [ ] Basic Strong's number syntax: `[HG]\d+`
  - [ ] Regular Expression?
  - [ ] Search in Section
    - [ ] Section syntax definition:
      - [ ] In book chapter range `s_prefix? s_book s_chapter? "-" e_prefix? e_book e_chapter?`
      - [ ] In chapter verse range `prefix? book chapter ":"? start_verse?("-" verse)?`
      - [ ] Any verse range `ranges_prefix? s_book s_chapter? (":"? e_verse)? "-" e_prefix? e_book e_chapter? (":"? e_verse)?`
    - [ ] Section search syntax: `"$" range "|" search_term`
- [ ] General Algorithm
  - [ ] The algorithm will attempt to find all verses that match the search criteria
  - [ ] Possible multi-verse search???
  - [ ] It will look inside the Current bible version (not the parallel one)


### Search Page
