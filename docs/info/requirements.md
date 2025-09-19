# Ascribe Requirements
Approximately all of the requirements for the Ascribe Bible Study application version 1.0, though may be up for change as of 0/19/2025

## Table of Contents:
- [Ascribe Requirements](#ascribe-requirements)
  - [Table of Contents:](#table-of-contents)
  - [General](#general)
  - [General Layout](#general-layout)
    - [Core Components](#core-components)
    - [Header](#header)
    - [Body](#body)
    - [Context Menus](#context-menus)
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
  - [Notebook Editor Page](#notebook-editor-page)
    - [Create Notebook Modal](#create-notebook-modal)
    - [Notebook Editor](#notebook-editor)
    - [Note Editor](#note-editor)
    - [Highlight Editor](#highlight-editor)
  - [Side Note Editor](#side-note-editor)
    - [Device Differences](#device-differences)
  - [Daily Readings Page](#daily-readings-page)
  - [Cloud Sync](#cloud-sync)
  - [Platforms](#platforms)
    - [Large Screen](#large-screen)
    - [Medium Screen](#medium-screen)
    - [Small Screen](#small-screen)
  - [Page History](#page-history)
  - [Highlight Picker](#highlight-picker)
  - [Word Picker](#word-picker)
  - [HTMLText Editor](#htmltext-editor)
  - [Help Page?](#help-page)
    - [Layout](#layout-2)
    - [Sections](#sections)

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
    - [ ] Upload `biblio_json` module
    - [ ] **Misc Dropdown**
  - [ ] Notebook Editor Page
    - [ ] Back Button
    - [ ] New Highlight Button
    - [ ] New Note Button
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

### Context Menus
- [ ] Main
  - [ ] For pages:
    - [ ] Bible page
    - [ ] Search page
  - [ ] Actions
    - [ ] New highlight
    - [ ] New notebook

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
    - [ ] Will automatically be set to the current date when selected
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
The notebook page has two different components. One is the main display, which shows all of the notebooks that have been created, and also `biblio_json` modules, as well as an individual notebook editor (see [Notebook Editor Page](#notebook-editor-page)), which allows the user to see all of the notebook entries, and search through them

### Layout
- [ ] Displays a list of notebooks with some basic data about them
  - [ ] Info
    - [ ] Name
    - [ ] Description
      - [ ] Brief HTML encoded description
      - [ ] Expand/Reduce size if long
    - [ ] Highlight colors?
      - [ ] List of all the highlights inside the 
    - [ ] Count of notes?
    - [ ] Word count?
  - [ ] Actions
    - [ ] Edit
      - [ ] Opens the [Notebook Editor Page](#notebook-editor-page)
      - [ ] Disabled if is a builtin module, or an uploaded non note module
    - [ ] Delete
      - [ ] With confirm menu
      - [ ] Possibly cache deleted notebooks, for retrieval?
      - [ ] Disabled if is a builtin module
    - [ ] Clone?
    - [ ] Download
- [ ] Page Actions: (see [Header](#header))
  - [ ] Upload `biblio_json` module
  - [ ] New notebook


<!-- ======================================================================================================== -->
## Notebook Editor Page
Is the editor page when clicking on the Edit notebook button on the [Notebook Page](#notebook-page). Displays sections for the highlights and notes separately, with togglable sections like with the search page. Also enables searching though notes using a search bar.

### Create Notebook Modal
- [ ] Name
  - [ ] Shows error if invalid
- [ ] [HTMLText Editor](#htmltext-editor) for the description
- [ ] Options
  - [ ] Create notebook
  - [ ] Cancel

### Notebook Editor
- [ ] Groups
  - [ ] Highlight Group
  - [ ] Note Group
- [ ] Displays
  - [ ] Highlight Display
    - [ ] Color bar
    - [ ] Title
    - [ ] Priority
    - [ ] Expandable description if long
  - [ ] Note Display
    - [ ] Title (if found)
    - [ ] Expandable note body
    - [ ] References
  - [ ] Both:
    - [ ] Edit button
      - [ ] Opens corresponding editor as a popup modal
    - [ ] Delete
      - [ ] Opens a confirm menu
      - [ ] Caches deleted data?
    - [ ] Move to different notebook
      - [ ] Opens confirm menu?
      - [ ] Shows display for selecting notebook

### Note Editor
- [ ] Data
  - [ ] Optional title
    - [ ] Displays error if invalid
  - [ ] [HTMLText Editor](#htmltext-editor) for the body
  - [ ] Optional verse links, which on the side page, would be automatically added
- [ ] Layout
  - [ ] Similar to the highlight editor that is currently in use, without the color or priority options
  - [ ] References are shown with location and words, with the ability to delete them

### Highlight Editor
- [ ] Data
  - [ ] Title
    - [ ] Displays error if invalid
  - [ ] Color
  - [ ] Display Priority
  - [ ] [HTMLText Editor](#htmltext-editor) for the body
- [ ] Layout
  - [ ] Similar to the current highlight editor, though general improved visuals


<!-- ======================================================================================================== -->
## Side Note Editor
Specifically used when in the Bible or search page, and want to create a note. Can highlight a segment of text with the cursor, then the [Highlight Picker](#highlight-picker) will appear, allowing the user to create a note for that section. The user can also right click, and create a blank note with no attached references.

- [ ] Divider
  - [ ] Resizable and will collapse if less than x% size of the page
- [ ] Buttons
  - [ ] Collapse left
  - [ ] Collapse right
  - [ ] Swap sides?
    - [ ] Should save preferred location
  - [ ] Close editor
  - [ ] Open in Note Editor view (in notebook)
- [ ] Editor
  - [ ] Can edit optional title
    - [ ] Error message if invalid title
  - [ ] [HTMLText Editor](#htmltext-editor) for the main body
  - [ ] References
    - [ ] Displayed with verse location and words (shortened if too long)
    - [ ] Can be added by highlighting area
    - [ ] Can be deleted by button

### Device Differences
Smaller devices will not be able to see the side note editor, and will instead toggle between the editor, and the Bible or search page they are currently on. This would take the place of the collapse buttons.

<!-- ======================================================================================================== -->
## Daily Readings Page
Similar to the old one, but preferably a better layout
- [ ] Calendar selector
  - [ ] Shows current month as the calendar
  - [ ] Can select month as a dropdown
  - [ ] Can select year as a scrollable dropdown
  - [ ] Will automatically display what the current date is
    - [ ] Also reset to current date button
  - [ ] When clicked off, will display what the current date is, if visible
- [ ] Readings section
  - [ ] Displays name of currently selected reading plan
    - [ ] Preference saved across sessions
    - [ ] Can switch what reading plan is selected
  - [ ] Scripture Segments
    - [ ] Portioned (ie: Robert Roberts): Displays each chapter/section of the reading in its portions
    - [ ] Un-portioned: Displays as normal list of all section
    - [ ] Each reference is clickable, and will go to that section
    - [ ] All readings are broken into there individual chapters

<!-- ======================================================================================================== -->
## Cloud Sync
Allows the user to sign into their google account, and sync across device application instances with Google Drive. Possibly enable one drive in the future.

- [ ] Signin interface
  - [ ] Main interface application side is in the [Settings Page](#search-page)
  - [ ] Will redirect to web browser
    - [ ] When signed in successfully, will display a you signed in page in the web browser
    - [ ] When error occurs, will display an error page in the web browser
- [ ] Sync
  - [ ] Sync button is located in the [Header](#header) section
  - [ ] When clicked: User cannot interact and a syncing overlay will be displayed

<!-- ======================================================================================================== -->
## Platforms
Different platforms will display different layouts, depending on there size. All platforms of the same size should look the same however

### Large Screen
Ie: Macs, PC's, Linux, etc

No Change

### Medium Screen
Ie: IPads, Tablets, etc

No Change?

### Small Screen
Ie: IPhones, Android, Pixels, etc

- [ ] Side editors will be swapped out for togglable sections (see [Device Differences](#device-differences))
- [ ] The [Audio Player](#audio-player) will automatically be docked to the bottom of the screen
  - [ ] Cannot be moved
  - [ ] Layout will be changed to make more sense for the device
- [ ] Locked in vertical mode (like Blue Letter Bible)


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
## Highlight Picker
When highlighting a section of text in either the Bible page or the search page, will open so the user can either highlight a passage, or create a note at that location. Pretty much the same as the current implementation, however a change to the create note option.

- [ ] Highlights
  - [ ] Recents
    - [ ] Stores up to x number of recent highlights
    - [ ] Saved across sessions
    - [ ] When highlight deleted, cleared
  - [ ] Highlight area 
    - [ ] Shows all available highlights
    - [ ] Shows option for creating a new highlight
  - [ ] Erase area
    - [ ] Not displayed if no highlights present
    - [ ] Dropdown displaying all erasable highlights
    - [ ] Erase all option
      - [ ] Has confirm if limit surpassed?
- [ ] Create Note
  - [ ] Allows the user to create a note at that location
  - [ ] User selects what notebook to create with
  - [ ] Can create with recent (saved to device, like highlights)
  - [ ] Can search through notebooks
- [ ] Append to note
  - [ ] Appends the section to the currently editing note
  - [ ] Only appears if the user is editing a note: ie, the side editor is opened

<!-- ======================================================================================================== -->
## Word Picker
User can click on a word to look into it more. this is similar to how [seethebible](seethebible.com) does it, but with either a sidebar option, or a popup modal.

- [ ] Sidebar
  - [ ] Is not displayed if the side editor is active (ie: editing a note)
  - [ ] Cannot be displayed on small screen devices
  - [ ] Displays the word
  - [ ] Display highlights
    - [ ] Automatically collapsed, only show name and color
    - [ ] Can be expanded
      - [ ] Description
      - [ ] Priority
      - [ ] Notebook
    - [ ] Can click edit (opens highlight editor)
  - [ ] Displays notes
    - [ ] Collapsible if large
    - [ ] Shows title if exists
    - [ ] References can be displayed
    - [ ] Has edit button
  - [ ] Resalable to percentage of the screen, either direction
    - [ ] Has a minimum size
  - [ ] Is scrollable
- [ ] Popup Modal
  - [ ] Movable around the screen
  - [ ] Contains same information as sidebar
  - [ ] Can be resized
  - [ ] Is scrollable

<!-- ======================================================================================================== -->
## HTMLText Editor
Is A WYSIWYG editor for the `biblio_json` HTML text format, used for notes and highlights

- [ ] Buttons
  - [ ] Format
    - [ ] Bold
    - [ ] Italics
    - [ ] Underlined
    - [ ] Strike-through
    - [ ] Code (monospace)
  - [ ] Lists
    - [ ] Bullet
    - [ ] Numbered
    - [ ] Indent
    - [ ] Unindent
  - [ ] Headers (H1-H6)
  - [ ] Actions
    - [ ] Undo
    - [ ] Redo
- [ ] Keybinds
  - [ ] For all formats as normal
  - [ ] For all lists as normal
  - [ ] Ctrl+Z/Ctrl+Y


<!-- ======================================================================================================== -->
## Help Page?
TBD

### Layout
TBD

### Sections
TBD