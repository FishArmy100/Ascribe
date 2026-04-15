### Alpha Release Plan

Steps:
1. Sound Effects
   - Sounds
     - Button click
     - Word click
     - Popup
     - Page flip
   - Add volume slider to settings
     - Can be muted
   - Audio music mixer for readings?
2. Reading Behavior
   - Same features as old application
   - Redesign to look better
3. Improve Settings Page UI
   - Redesign to look better
   - Clear view history
4. Completed Readings
   - Way to check readings as completed
   - Can reset all readings (auto reset at the end of the year???)
   - Visual indicator for completed/partially completed readings
5. App Save Data
   - Save and load data
   - Open path to save data
6. Optimization Pass
   - Areas to optimize
     - Searching (specifically HTML)
     - Voice loading
     - Memoizing frontend components
     - Recording loading
       - Storing audio files on the HD instead of RAM
       - Have a fixed allocation size strategy 
     - Reduce db size
     - Load a binary instead of JSON for release using biblio-json
   - Add a compiler profiling flag
     - Forwards to frontend?
     - Enables profiling data for different parts of the application
7.  Add more files
   - More Bibles (English)
   - Add support for more languages
   - More Bible Dictionaries
   - More cross references?
   - TSK References
   - Browns Drivers Briggs Strongs Definitions
8.  Bug Fixes
9.  Android mobile support?
10. Bug Fixes
11. Publish to Windows + Android