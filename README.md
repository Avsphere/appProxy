# App Proxy Publication Helper

This is a tool to help with the app proxy publication process. It is intended to be used proactively to discover configuration settings in the context of app proxy.

## Current State

7/3/2018 -- This is still an early prototype -- please send any feedback / bugs to t-aaperr@microsoft.com

Currently the script is not in a production form, the javascript has also not been generalized so this will probably not work on old versions of internet explorer.

The UI / UX along with the displayed information is also currently being revised.

By Monday (7/9/2018) I will have this in a nicer position for labs


### How to use (7/3/2018)

Clone the repository

Go to lib/ConfigurationDiscovery.ps1

Change the -dirPath arg in the second to last line to point to the repository's script directory

(You can also change the last line accordingly if you would like to auto open)


You can then run this script on your IIS server as admin.

The index.html file can then be opened

(The pulled data is stored in ./scripts/configDiscoveryData.js)
