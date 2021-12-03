## Capacitor: A Cross-platform App Runtime

Capacitor is a cross-platform app runtime that makes it easy to build web apps that run natively on iOS, Android, Electron(Desktop), and the web.

Capacitor provides a consistent, web-focused set of APIs that enable an app to stay as close to web-standards as possible, while accessing rich native device features on platforms that support them. Adding native functionality is easy with a simple Plugin API for Swift on iOS, Java on Android, and JavaScript for the web.

Capacitor is a spiritual successor to Apache Cordova and Adobe PhoneGap, with inspiration from other popular cross-platform tools like React Native and Turbolinks, but focused entirely on enabling modern web apps to run on all major platforms with ease. Capacitor has backwards-compatible support for many existing Cordova plugins.
## Requirements

The base requirements are Node v8.6.0 or later, and NPM version 5.6.0 or later (which is usually automatically installed with the required version of Node).
## iOS Development

For building iOS apps, Capacitor requires a Mac with Xcode 10 or above. Soon, you'll be able to use Ionic Appflow to build for iOS even if you're on Windows.

Additionally, you'll need to install CocoaPods (sudo gem install cocoapods), and install the Xcode Command Line tools (either from Xcode, or running xcode-select --install).

Once you have CocoaPods installed, update your local repo by running pod repo update. You should run this command periodically to ensure you have the latest versions of CocoaPods dependencies.

As a rule, the latest version of Capacitor always supports the last two iOS versions. For example, iOS 11 and iOS 12. For support for older versions of iOS, use an older version of Capacitor (if available).

Capacitor uses the WKWebView.
## Android Development

First, the Java 8 JDK must be installed and set to the default if you have other versions of the JDK installed. Java 9 does not work at the moment.

Android development requires the Android SDK installed with Android Studio. Technically, Android Studio isn't required as you can build and run apps using only the Android CLI tools, but it will make building and running your app much easier so we strongly recommend using it.

Android version support for Capacitor is more complex than iOS. Currently, we are targeting API level 21 or greater, meaning Android 5.0 (Lollipop) or above. As of May 2019, this represents over 89% of the Android market.

Also, Capacitor requires an Android WebView with Chrome version 50 or later. On Android 5 and 6, the Capacitor uses the System WebView. On Android 7+, Google Chrome is used.

## Configuration

Capacitor does not support Cordova install variables, auto configuration, or hooks, due to our philosophy of letting you control your native project source code (meaning things like hooks are unnecessary). If your plugin requires variables or settings to be set, you'll need to apply those configuration settings manually by mapping between the plugin's plugin.xml and required settings on iOS and Android.
## Using Capacitor in a Web Project

Capacitor fully supports traditional web and Progressive Web Apps. In fact, using Capacitor makes it easy to ship a PWA version of your iOS and Android app store apps with minimal work.
## Installation

Chances are, you already have Capacitor installed in your app if you're using Capacitor to build an iOS, Android, or Electron app. In capacitor, the web platform is just the web project that powers your app!
Adding Capacitor to an existing web app

Capacitor was designed to drop-in to any existing modern JS web app. A valid package.json file and a folder containing all web assets are required to get started.

To add Capacitor to your web app, run the following commands:
## Add Capacitor to existing web app

```bash
cd my-app
npm install --save @capacitor/core @capacitor/cli
```


Then, initialize Capacitor with your app information.
```bash
npx cap init
```
## Install Capacitor into an Ionic project

Capacitor is easily installed directly into any Ionic project (1.0-4.x+).

New Ionic Project
```bash
ionic start pwa-poc my-first-app --capacitor
cd pwa-poc
```

Existing Ionic Project
```bash
cd pwa-poc
ionic integrations enable capacitor
```


Initialize Capacitor with app information
```bash
npx cap init [appName] [appId]
```

where appName is the name of your app, and appId is the domain identifier of your app (ex: com.example.app).
Initialize Capacitor with app information
```bash
npx cap init pwa-poc io.ionic.photogallery
```


## Build your Ionic App

You must build your Ionic project at least once before adding any native platforms.
Build Ionic App
```bash
ionic build
```

This creates the www folder that Capacitor has been automatically configured to use as the webDir in capacitor.config.json.
## Add Platforms

```bash
npx cap add ios
npx cap add android
```

Both android and ios folders at the root of the project are created. These are entirely separate native project artifacts that should be considered part of your Ionic app (i.e., check them into source control, edit them in their own IDEs, etc.).


## Syncing your app with Capacitor

Every time you perform a build (e.g.ionic build) that changes your web directory (default:www), you'll need to copy those changes down to your native projects:
```bash
npx cap copy
```

While we've tested a number of popular Cordova plugins, it's possible Capacitor doesn't support every Cordova plugin. Some don't work with Capacitor or Capacitor provides a conflicting alternative. If it's known that the plugin is conflicting or causes build issues, it will be skipped when running npx cap update.

If you find an issue with an existing Cordova plugin, please let us know by providing the issue's details and plugin information.
## Known incompatible plugins (Subject to change)

Some don't work with Capacitor or Capacitor provides a conflicting alternative. If it's known that the plugin is conflicting or causes build issues, it will be skipped when running npx cap update.
```bash
    cordova-plugin-add-swift-support (not needed, Capacitor has built in Swift support)
    cordova-plugin-admobpro (see details)
    cordova-plugin-braintree (see details)
    cordova-plugin-compat (not needed)
    cordova-plugin-console (not needed, Capacitor has its own)
    cordova-plugin-crosswalk-webview (Capacitor doesn't allow to change the webview)
    cordova-plugin-fcm (see details)
    cordova-plugin-firebase (see details)
    cordova-plugin-ionic-keyboard (not needed, Capacitor has it's own)
    cordova-plugin-ionic-webview (not needed, Capacitor uses WKWebView)
    cordova-plugin-music-controls (causes build failures, skipped)
    cordova-plugin-qrscanner (see details)
    cordova-plugin-splashscreen (not needed, Capacitor has its own)
    cordova-plugin-statusbar (not needed, Capacitor has its own)
    cordova-plugin-wkwebview-engine (not needed, Capacitor uses WKWebView)
```

## Creating PWA from the Ionic app
Adding a service worker to your project

To set up the Angular service worker in your project, use the CLI command ng add @angular/pwa. It takes care of configuring your app to use service workers by adding the service-worker package along with setting up the necessary support files.
## Add Angular PWA package to the project
```bash
ng add @angular/pwa --project *project-name*
```

The above command completes the following actions:

- Adds the @angular/service-worker package to your project.
- Enables service worker build support in the CLI.
- Imports and registers the service worker in the app module.
- Updates the index.html file:
- Includes a link to add the manifest.webmanifest(manifest.json) file. manifest.webmanifest  Expand source
- Adds meta tags for theme-color.
- Installs icon files to support the installed Progressive Web App (PWA).
- Creates the service worker configuration file called ngsw-config.json, which specifies the caching behaviors and other settings.

## Adding Capacitor PWA element

Some Capacitor plugins, such as Camera, have web-based UI available when not running natively. For example, calling Camera.getPhoto() will load a responsive photo-taking experience when running on the web or electron:

To enable these controls , we must add @ionic/pwa-elements to our app.
Install PWA elements
```bash
npm install @ionic/pwa-elements
```
For Ionic/Angular Project
```bash
main.ts  Expand source
```

Now build the project with production flag.
Build App with --prod flag
```bash
ionic build --prod
```

This will create the build in www folder and this is our PWA, that can be deployed over any http server.
## Serving with http-server

Because ng serve does not work with service workers, we must use a separate HTTP server to test our project locally. We can use any HTTP server. The example below uses the http-server package from npm. To reduce the possibility of conflicts and avoid serving stale content, test on a dedicated port and disable caching.
Run the code with http-server
```bash
http-server -p 8080 /www
```


