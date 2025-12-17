const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'components', 'ui');

function removeGenerics(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let hasChanges = false;

    // We loop to find all occurrences
    while (true) {
        const marker = 'React.forwardRef<';
        const startIndex = content.indexOf(marker);
        
        if (startIndex === -1) break;

        // Start scanning from the <
        let openCount = 0;
        let scanIndex = startIndex + 'React.forwardRef'.length; // Points to <
        let parsed = false;

        for (let i = scanIndex; i < content.length; i++) {
            if (content[i] === '<') {
                openCount++;
            } else if (content[i] === '>') {
                openCount--;
                if (openCount === 0) {
                    // Found the closing bracket for the main generic
                    // Replace content from scanIndex (inclusive) to i (inclusive) with nothing
                    const before = content.substring(0, scanIndex);
                    const after = content.substring(i + 1);
                    content = before + after;
                    hasChanges = true;
                    parsed = true;
                    break;
                }
            }
        }

        if (!parsed) {
            console.error(`Could not parse generics in ${filePath} starting at ${startIndex}`);
            break; // Avoid infinite loop if parsing fails
        }
    }

    if (hasChanges) {
        console.log(`Fixing ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

if (fs.existsSync(targetDir)) {
    const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.jsx'));
    files.forEach(file => {
        removeGenerics(path.join(targetDir, file));
    });
    console.log('Finished processing files.');
} else {
    console.error(`Directory not found: ${targetDir}`);
}
