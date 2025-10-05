const fs = require('fs');
const path = require('path');

// List of routes that need rateLimit fixing
const routesToFix = [
    'gamification.js',
    'forum.js', 
    'videoBlogs.js',
    'photo360.js'
];

const routesDir = path.join(__dirname, 'routes');

routesToFix.forEach(routeFile => {
    const filePath = path.join(routesDir, routeFile);
    
    if (fs.existsSync(filePath)) {
        console.log(`Fixing rateLimit in ${routeFile}...`);
        
        // Read the file
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace the import
        content = content.replace(
            "const rateLimit = require('../middleware/rateLimiter');",
            "const { createLimiter } = require('../middleware/rateLimiter');"
        );
        
        // Replace all rateLimit function calls with createLimiter
        content = content.replace(/rateLimit\('[^']*',\s*\d+,\s*\d+\)/g, 'createLimiter');
        
        // Write back to file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed rateLimit in ${routeFile} ✓`);
    } else {
        console.log(`File ${routeFile} not found, skipping.`);
    }
});

console.log('RateLimit fixes completed!');