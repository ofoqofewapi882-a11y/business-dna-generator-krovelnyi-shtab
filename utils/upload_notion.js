import fs from 'fs';
import path from 'path';

// IMPORTANT: Replace with your actual Notion token or set as environment variable
const NOTION_TOKEN = process.env.NOTION_TOKEN || 'YOUR_NOTION_TOKEN_HERE';
const PAGE_ID = '30bd43d8-c0a6-8186-92fc-eebf27edc9cb';
const VERSION = '2022-06-28';

async function upload() {
    const blocksPath = path.resolve('temp_blocks.json');
    if (!fs.existsSync(blocksPath)) {
        console.error('temp_blocks.json not found');
        return;
    }
    const blocks = JSON.parse(fs.readFileSync(blocksPath, 'utf8'));
    console.log(`Read ${blocks.length} blocks.`);

    // Split blocks if > 100
    // Actually, create page limit is 100? No, append limit is 100.
    // Create page body limit is 100.

    const firstBatch = blocks.slice(0, 100);
    const remaining = blocks.slice(100);

    // Create Page
    console.log('Creating page...');
    const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${NOTION_TOKEN}`,
            'Notion-Version': VERSION,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            parent: { page_id: PAGE_ID },
            properties: {
                title: [
                    {
                        text: {
                            content: `Протокол встречи ${new Date().toLocaleDateString('ru-RU')}`
                        }
                    }
                ]
            },
            children: firstBatch
        })
    });

    if (!response.ok) {
        console.error('Failed to create page:', await response.text());
        return;
    }

    const pageData = await response.json();
    console.log(`Page created: ${pageData.id} (${pageData.url})`);

    // Append remaining blocks
    if (remaining.length > 0) {
        console.log(`Appending ${remaining.length} remaining blocks...`);
        // Loop in chunks of 100
        for (let i = 0; i < remaining.length; i += 100) {
            const chunk = remaining.slice(i, i + 100);
            const resp = await fetch(`https://api.notion.com/v1/blocks/${pageData.id}/children`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${NOTION_TOKEN}`,
                    'Notion-Version': VERSION,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    children: chunk
                })
            });
            if (!resp.ok) {
                console.error('Failed to append blocks:', await resp.text());
                break;
            }
            console.log(`Appended chunk ${i / 100 + 1}`);
        }
    }

    console.log('Done.');
}

upload().catch(console.error);
