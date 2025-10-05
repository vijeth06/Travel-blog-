const fs = require('fs');
const path = require('path');

// List of routes that need fixing
const routesToFix = [
    'recommendations.js',
    'chatbot.js', 
    'travelBuddies.js',
    'gamification.js',
    'forum.js',
    'videoBlogs.js',
    'photo360.js',
    'countries.js'
];

const routesDir = path.join(__dirname, 'routes');

routesToFix.forEach(routeFile => {
    const filePath = path.join(routesDir, routeFile);
    
    if (fs.existsSync(filePath)) {
        console.log(`Fixing ${routeFile}...`);
        
        // Read the file
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace the import
        content = content.replace(
            "const auth = require('../middleware/auth');",
            "const { protect } = require('../middleware/auth');"
        );
        
        // Replace all auth usage with protect (but be careful not to replace in comments or strings)
        content = content.replace(/\bauth\b/g, 'protect');
        
        // Fix the import path if it got changed
        content = content.replace(
            "const { protect } = require('../middleware/protect');",
            "const { protect } = require('../middleware/auth');"
        );
        
        // Write back to file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${routeFile} ✓`);
    } else {
        console.log(`File ${routeFile} not found, skipping.`);
    }
});

console.log('Auth imports fix completed!');