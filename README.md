# Firefox Tab Suspender  ![Firefox Tab Suspender logo](./assets/fox-64px.png "Firefox Tab Suspender Logo")

![build@master](https://img.shields.io/travis/Hau-Hau/firefox-tab-suspender/master.svg?label=build@master "build@master") ![build@develop](https://img.shields.io/travis/Hau-Hau/firefox-tab-suspender/develop.svg?label=build@develop "build@develop")

![fox-heart-webassembly](./assets/fox-heart-webassembly.png "fox-heart-webassembly")

**IMPORTANT**
Currently this repository is not in use.
New source code is not based on C language so this source code will not be in use anymore.
Works on extension are moved to private repository, I don't want to repeat mistake with releasing unfinished project.
Feel free to fork and share this version.

_Firefox Tab Suspender_ is an open source (only source code, see license) extension for Firefox Browser 59+.


Extension's target are people who use older computers or just want to reduce browser's ram usage. For this reasons I strive to make _Firefox Tab Suspender_ lightweight and performant as much as it is possible.

After install, extension will suspend unused cards according to user's settings.


**Details worth to pay attention:**
* Generating big amounts of styles in development has no cost in production because of that styles are cleaned up in build process. Final stylesheet contains only used styles
* CSS convention is highly based on **SUIT** naming and organizing convention
* If it is possible - instead of writing single style's class, generate full spectrum of possibilities
* WASM is injected after user settings load in place of **//= ../.tmp/service.js** comment
* There is no need of multiply or copying images into src folder, final package contains everything in one folder

-----
