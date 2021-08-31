1. Copy jquery-ui.js to src/core/libraries
2. Modify src/core/required/adapt/js/scriptLoader
Line 121, add 
```
"jqueryUI"
```
Line 67, add 
```
jqueryUI: 'libraries/jquery-ui',
```

And then force rebuild to reflect the changes
Ensure json-server is running with db.json