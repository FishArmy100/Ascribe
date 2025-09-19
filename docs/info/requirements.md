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
  - Page History
  - Help Page?
  - Info Page (For modules ie: Bibles)?

## Table of Contents:
- [Ascribe Requirements](#ascribe-requirements)
  - [Table of Contents:](#table-of-contents)
  - [General](#general)
  - [General Layout](#general-layout)
    - [Core Components](#core-components)
    - [Header](#header)
    - [Body](#body)
  - [Bible](#bible)
    - [Versions](#versions)
    - [Interface](#interface)
  - [Searching](#searching)
    - [Advanced Search Settings](#advanced-search-settings)
    - [Search Syntax](#search-syntax)
    - [Search Page](#search-page)
  - [Audio Player](#audio-player)
    - [General](#general-1)
    - [Layout](#layout)
    - [Behavior](#behavior)
  - [Settings Page](#settings-page)
  - [Notebook Page](#notebook-page)
    - [Layout](#layout-1)
    - [Notebooks Display](#notebooks-display)
  - [Notebook Editor Page](#notebook-editor-page)
    - [Notebook Editor](#notebook-editor)
    - [Highlight Editor](#highlight-editor)
    - [Highlights Display](#highlights-display)
  - [Note Editor](#note-editor)
    - [Side Pages](#side-pages)
    - [Editor](#editor)
  - [Daily Readings Page](#daily-readings-page)
  - [Cloud Sync](#cloud-sync)
  - [Platforms](#platforms)
    - [Large Screen](#large-screen)
    - [Medium Screen](#medium-screen)
    - [Small Screen](#small-screen)
  - [Page History](#page-history)
  - [Help Page?](#help-page)
    - [Layout](#layout-2)
    - [Sections](#sections)
  - [Info Page?](#info-page)

<!-- ======================================================================================================== -->

## General
- [ ] Multiple windows? 
  - [ ] At least, should support multiple instances of the application running at the same time


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
When searching, will either send the user to a search results page, if they are searching for a section of words or to the Bible page, if the searched value is a verse/Bible section

### Advanced Search Settings
A small dropdown on the search bar, that makes it a bit easier for the user to enter in search criteria

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
    - [ ] Search in Notebooks
      - [ ] Limit to specific notebook
      - [ ] Titles or inner text?
  - [ ] Strong's Number
    - [ ] Basic Strong's number syntax: `[HG]\d+`
  - [ ] Regular Expression?
  - [ ] Search in Section
    - [ ] Section syntax definition:
      - [ ] In book chapter range `s_prefix? s_book s_chapter? "-" e_prefix? e_book e_chapter?`
      - [ ] In chapter verse range `prefix? book chapter ":"? start_verse?("-" verse)?`
      - [ ] Any verse range `ranges_prefix? s_book s_chapter? (":"? e_verse)? "-" e_prefix? e_book e_chapter? (":"? e_verse)?`
    - [ ] Section search syntax: `"$" range "|" search_term` (possibly change in the futures)
- [ ] General Algorithm
  - [ ] The algorithm will attempt to find all verses that match the search criteria
  - [ ] Possible multi-verse search (???)
  - [ ] It will look inside the Current bible version (not the parallel one)


### Search Page
The search page is pretty much the same as the old version, though just improving on general looks and layout. *For future*: Need to put a setting somewhere for how many verse results are displayed at any given time. Should be a dropdown, and not custom

- [ ] Search Results
  - [ ] Bible Verse
    - [ ] Displays the verse, with all rendering steps that Bible uses
    - [ ] Displays a reference tag
      - [ ] When clicked, goes to the reference
  - [ ] Note in notebook
    - [ ] Displays a small section of text from inside the notebook, around the searched term
    - [ ] Displays a reference tag that allows the user to Go to the thing
- [ ] Layout
  - [ ] Is a scrollable content area, similar to the Bible page
  - [ ] Title
    - [ ] Indicates how many verses were found
    - [ ] Displays a basic error message if something went wrong
  - [ ] Results
    - [ ] An vertical list of results
  - [ ] Section selector
    - [ ] Results divided into sections of x
    - [ ] Switch between results sections


<!-- ======================================================================================================== -->
## Audio Player
Similar to the old version, with behavior, however with improved looks

### General
- [ ] Generates on backend from biblical text
- [ ] Audio version is based on what the current Bible version is selected
- [ ] Audio player toggle located in the top bar on specific pages (see [Header](#header))

### Layout
- [ ] Modes
  - [ ] Pop out window
  - [ ] Docked
    - [ ] Bottom of screen
- [ ] Primary Section
  - [ ] How long the current chapter is
    - [ ] Possibly change if the section is timed?
    - [ ] Slider indicator
    - [ ] Timer indicator
  - [ ] Play pause button
    - [ ] Shows loading symbol if is generating the audio
    - [ ] Shows Pause if is playing
    - [ ] Shows playing if is paused
  - [ ] Various buttons
    - [ ] Rewind
    - [ ] Fast Forward
    - [ ] Restart
- [ ] Secondary section
  - [ ] Behavior settings
    - [ ] Dependent on what behavior is selected
    - [ ] Main behavior dropdown
    - [ ] Rest of the settings dependent on the behavior
  - [ ] Volume slider
  - [ ] Playback speed slider
  - [ ] Display queue button
  - [ ] Voice selection dropdown
    - [ ] Limited based on the version of the Bible selected? (by language)

### Behavior
- [ ] Selection
  - [ ] Section
    - [ ] Start chapter
    - [ ] End chapter
  - [ ] Chapter
    - [ ] Current chapter that the user is on
  - [ ] Daily Readings
    - [ ] Select which daily readings
- [ ] Repeat
  - [ ] Once
  - [ ] Number
    - [ ] Have a dropdown for how many times to repeat
  - [ ] Timed
    - [ ] Should have a dropdown for the amount of time
    - [ ] Should display how much time remaining
  - [ ] Infinite

<!-- ======================================================================================================== -->
## Settings Page
- [ ] Sound Effects
  - [ ] Volume
    - [ ] Slider
    - [ ] Reset/Mute button
  - [ ] Enable/Disable
    - [ ] Page turning
    - [ ] Button clicking
- [ ] Display
  - [ ] Font selection
  - [ ] UI scale slider
    - [ ] Slider
    - [ ] Reset button
- [ ] Cloud
  - [ ] States
    - [ ] Cloud Sync Enabled
      - [ ] Signin
    - [ ] Cloud Sync Disabled
      - [ ] Switch Accounts
      - [ ] Signout
- [ ] Advanced
  - [ ] Clear search history (see [Page History](#page-history))
  - [ ] Open save location

<!-- ======================================================================================================== -->
## Notebook Page

### Layout

### Notebooks Display


<!-- ======================================================================================================== -->
## Notebook Editor Page

### Notebook Editor

### Highlight Editor

### Highlights Display


<!-- ======================================================================================================== -->
## Note Editor

### Side Pages

### Editor

<!-- ======================================================================================================== -->
## Daily Readings Page


<!-- ======================================================================================================== -->
## Cloud Sync


<!-- ======================================================================================================== -->
## Platforms

### Large Screen

### Medium Screen

### Small Screen

<!-- ======================================================================================================== -->
## Page History
- [ ] Stores the navigation history of the user
  - [ ] Only count specific pages
    - [ ] Search pages
    - [ ] Bible pages
  - [ ] Can clear history (see [Settings](#settings-page))
- [ ] Can navigate between history pages
  - [ ] Previous
    - [ ] If no previous states, disabled
  - [ ] Next
    - [ ] If no next pages, disabled
  - [ ] Located in top bar (see [Header](#header))

<!-- ======================================================================================================== -->
## Help Page?

### Layout

### Sections

<!-- ======================================================================================================== -->
## Info Page?