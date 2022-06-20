Steps to set up Framework

1) Check node and npm version on the computer by executing following command in command prompt/terminal:
node -v
npm -v

To update node, run "nvm install latest" in command prompt/terminal.

2) If node.js/npm is not installed, download the installer with label 'LTS' from https://nodejs.org/en/download/

Installation requires Administrator privileges.
Run the downloaded Node.js Installer (.msi for Windows, .pkg for Mac OS, binaries for Linux) - accept the license, select the destination, and authenticate for the install.
Default installation will set PATH for node.js.
'PATH' for node.js and npm can be set as
Go to Windows Control Panel -> System -> Advanced system settings -> Environment Variables. Edit 'PATH' variable.    
Append "<directory1>\npm;<directory2>\nodejs" to PATH value and restart the computer, where
                               directory1 = directory where npm is installed (e.g. logged-in user directory\AppData\Roaming),  

                               directory2 = directory where node.js is installed

Run "node -v" in command prompt/terminal. This should display LTS version as shown on https://nodejs.org/en/download/.  

3)Protractor setup -

Go to Command prompt/Terminal. Install Protractor globally by executing command :  npm install -g protractor
Run "protractor --version" in command prompt/terminal to check installed version and to make sure Protractor is working.      
Run "webdriver-manager update" in command prompt/terminal to install the necessary binaries like browser drivers, selenium server etc.    
Run "webdriver-manager start" in command prompt/terminal to start selenium server. 

4) Microsoft Visual Studio Code setup - 

Download the installer from https://code.visualstudio.com/download
Run the installer and complete the wizard. System setup requires Administrator privileges. 
Check 'PATH' for VS Code and update if not set (<install directory>\Microsoft VS Code\bin). Restart the computer to confirm 'PATH' changes. 

