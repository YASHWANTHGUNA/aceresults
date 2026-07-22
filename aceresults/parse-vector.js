import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function parseVectorPDF() {
    console.log("Executing text layer diagnostic test...");
    
    const fileBuffer = new Uint8Array(fs.readFileSync('./sample2.pdf')); 
    const loadingTask = pdfjsLib.getDocument({ data: fileBuffer });
    const pdfDocument = await loadingTask.promise;

    console.log(`Total Pages Found: ${pdfDocument.numPages}`);

    let allPagesRows = [];

    for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        
        // 🔍 DIAGNOSTIC LOG: Print exactly how many raw text items exist
        console.log(`Page ${i}: Found ${textContent.items.length} raw electronic text elements.`);

        const items = textContent.items.map(item => ({
            text: item.str.trim(),
            x: item.transform[4],
            y: item.transform[5]
        })).filter(item => item.text !== '');

        const rowMap = {};
        items.forEach(item => {
            const key = Math.round(item.y / 2) * 2; 
            if (!rowMap[key]) rowMap[key] = [];
            rowMap[key].push(item);
        });

        const sortedYKeys = Object.keys(rowMap).sort((a, b) => b - a);
        
        const pageRows = sortedYKeys.map(key => {
            const rowItems = rowMap[key].sort((a, b) => a.x - b.x);
            return rowItems.map(item => item.text).join(' | ');
        });

        allPagesRows.push(...pageRows);
    }

    fs.writeFileSync('./clean-rows.txt', allPagesRows.join('\n'));
    console.log("Diagnostic run complete.");
}

parseVectorPDF().catch(console.error);