const fs = require('fs');
const path = require('path');

const files = [
    'resources/js/Pages/users/index.tsx',
    'resources/js/Pages/roles/index.tsx',
    'resources/js/Pages/roles/edit.tsx',
    'resources/js/Pages/roles/create.tsx',
    'resources/js/Pages/pic/index.tsx',
    'resources/js/Pages/penyedia/index.tsx',
    'resources/js/Pages/jenis-dokumen/index.tsx',
    'resources/js/Pages/item-hps/index.tsx',
    'resources/js/Pages/dashboard.tsx',
    'resources/js/Pages/spj/index.tsx',
    'resources/js/Pages/inbox/index.tsx'
];

files.forEach(f => {
    let p = path.join(__dirname, f);
    if (!fs.existsSync(p)) return;
    let c = fs.readFileSync(p, 'utf8');
    if (c.includes('<table')) {
        c = c.replace(/<table className="([^"]*)"/g, (match, classes) => {
            if (!classes.includes('min-w-max')) {
                return `<table className="${classes} min-w-max"`;
            }
            return match;
        });

        c = c.replace(/<th className="([^"]*)"/g, (match, classes) => {
            if (!classes.includes('whitespace-nowrap')) {
                return `<th className="${classes} whitespace-nowrap"`;
            }
            return match;
        });
        
        c = c.replace(/className="([^"]*overflow-x?-?auto[^"]*)"/g, (match, classes) => {
            let newClasses = classes;
            if (!newClasses.includes('w-full')) newClasses += ' w-full';
            return `className="${newClasses}"`;
        });

        // Ensure the main flex container for the page has min-w-0
        // e.g. <div className="flex flex-col gap-4 p-4 md:p-6">
        c = c.replace(/<div className="([^"]*flex-col gap-\d+ p-\d+ md:p-\d+[^"]*)"/g, (match, classes) => {
            let newClasses = classes;
            if (!newClasses.includes('min-w-0')) newClasses += ' min-w-0';
            if (!newClasses.includes('w-full')) newClasses += ' w-full';
            return `<div className="${newClasses}"`;
        });

        fs.writeFileSync(p, c);
        console.log('Fixed', f);
    }
});
