import fs from 'fs';
import path from 'path';

function parseRichText(text) {
    if (!text) return [];

    // Simple parser for bold (**text**) and basic text
    // Remove footnotes [^1]
    text = text.replace(/\[\^1\]/g, '');

    const parts = [];
    let currentText = '';
    let isBold = false;
    let isItalic = false; // Simplified, assuming ** for bold only for now

    // Split by **
    const boldSplit = text.split('**');

    for (let i = 0; i < boldSplit.length; i++) {
        const chunk = boldSplit[i];
        if (chunk === '') continue;

        // Even indices are normal (if starting with normal), odd are bold.
        // wait, "text **bold** text" -> ["text ", "bold", " text"]
        // If string starts with **, first elem is empty.
        // "**bold**" -> ["", "bold", ""]

        let bold = (i % 2 !== 0);
        // Fix logic if string doesn't start with bold?
        // Actually, if split by '**', tokens are: non-bold, bold, non-bold... 
        // PROVIDED the first chunk is non-bold (can be empty).

        // But what if "**bold** text"? -> ["", "bold", " text"]
        // i=0: "", bold=false.
        // i=1: "bold", bold=true.
        // i=2: " text", bold=false.
        // This holds true.

        // Further split by [text](url) for links? 
        // For now, let's keep it simple. Notion text content.

        parts.push({
            type: "text",
            text: { content: chunk },
            annotations: { bold: bold }
        });
    }

    return parts;
}

function convertMdToBlocks(mdContent) {
    const lines = mdContent.split('\n');
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
        let line = lines[i].trim();

        // Skip empty lines (unless inside something?)
        if (line === '') {
            i++;
            continue;
        }

        // Image
        if (line.startsWith('<img') || line.match(/^!\[.*\]\(.*\)/)) {
            // Extract URL. 
            // <img src="URL" ...>
            const srcMatch = line.match(/src="([^"]+)"/);
            let url = srcMatch ? srcMatch[1] : null;
            if (!url) {
                const mdImageMatch = line.match(/\((http[^)]+)\)/);
                url = mdImageMatch ? mdImageMatch[1] : null;
            }

            if (url) {
                blocks.push({
                    object: "block",
                    type: "image",
                    image: {
                        type: "external",
                        external: { url: url }
                    }
                });
            }
            i++;
            continue;
        }

        // Headers
        if (line.startsWith('# ')) {
            blocks.push({
                object: "block",
                type: "heading_1",
                heading_1: { rich_text: parseRichText(line.substring(2)) }
            });
            i++; continue;
        }
        if (line.startsWith('## ')) {
            blocks.push({
                object: "block",
                type: "heading_2",
                heading_2: { rich_text: parseRichText(line.substring(3)) }
            });
            i++; continue;
        }
        if (line.startsWith('### ')) {
            blocks.push({
                object: "block",
                type: "heading_3",
                heading_3: { rich_text: parseRichText(line.substring(4)) }
            });
            i++; continue;
        }

        // Lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
            blocks.push({
                object: "block",
                type: "bulleted_list_item",
                bulleted_list_item: { rich_text: parseRichText(line.substring(2)) }
            });
            i++; continue;
        }
        if (line.match(/^\d+\.\s/)) {
            blocks.push({
                object: "block",
                type: "numbered_list_item",
                numbered_list_item: { rich_text: parseRichText(line.replace(/^\d+\.\s/, '')) }
            });
            i++; continue;
        }

        // Callout / Quote (using >)
        // Note: the file uses >? No, it uses '***'.

        // Divider
        if (line === '***' || line === '---') {
            blocks.push({
                object: "block",
                type: "divider",
                divider: {}
            });
            i++; continue;
        }

        // Table
        if (line.startsWith('|')) {
            // Collect all table lines
            const tableRows = [];
            while (i < lines.length && lines[i].trim().startsWith('|')) {
                tableRows.push(lines[i].trim());
                i++;
            }

            // Process table
            // Row 1: Header
            // Row 2: Separator (ignore)
            // Row 3+: Data
            if (tableRows.length >= 2) {
                const rows = [];
                // Check if row 2 is separator (contains -)
                let headerRowIndex = 0;
                let dataStart = 1;
                if (tableRows[1].includes('---')) {
                    dataStart = 2;
                }

                // Header
                const headerCells = tableRows[0].split('|').filter(c => c.trim() !== '').map(c => parseRichText(c.trim()));
                // If Notion table block:
                // We need to construct table_row blocks.
                // But we CANNOT add children to a table block in 'blocks' array directly if using 'append' endpoint? 
                // Actually, table block has 'children' property which expects 'table_row' blocks.

                // Construct Table Block
                const tableBlock = {
                    object: "block",
                    type: "table",
                    table: {
                        table_width: headerCells.length,
                        has_column_header: (dataStart === 2),
                        has_row_header: false,
                        children: []
                    }
                };

                // Add rows
                // Header row
                tableBlock.table.children.push({
                    type: "table_row",
                    table_row: {
                        cells: headerCells
                    }
                });

                // Body rows
                for (let j = dataStart; j < tableRows.length; j++) {
                    const cells = tableRows[j].split('|').filter(c => c.trim() !== ''); // simple split, might break if pipe in content
                    // Adjust to match width
                    const richCells = cells.map(c => parseRichText(c.trim()));
                    while (richCells.length < headerCells.length) richCells.push([]);

                    tableBlock.table.children.push({
                        type: "table_row",
                        table_row: {
                            cells: richCells
                        }
                    });
                }
                blocks.push(tableBlock);
            }
            continue; // i already incremented
        }

        // Default: Paragraph
        blocks.push({
            object: "block",
            type: "paragraph",
            paragraph: { rich_text: parseRichText(line) }
        });
        i++;
    }

    return blocks;
}

const mdPath = path.resolve('components', 'Протоколы', 'ПРОТОКОЛ ВСТРЕЧИ.md');
const content = fs.readFileSync(mdPath, 'utf8');
const blocks = convertMdToBlocks(content);

const outputPath = path.resolve('temp_blocks.json');
fs.writeFileSync(outputPath, JSON.stringify(blocks, null, 2));
console.log(`wrote blocks to ${outputPath}`);
