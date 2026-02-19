export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    const DATABASE_ID = process.env.NOTION_DATABASE_ID;

    if (!NOTION_TOKEN || !DATABASE_ID) {
        return res.status(500).json({ error: 'Server misconfigured' });
    }

    try {
        const { data, blocks } = req.body;

        if (!data || !blocks) {
            return res.status(400).json({ error: 'Missing data or blocks' });
        }

        const today = new Date().toISOString().split('T')[0];
        const results = [];
        const errors = [];

        for (const block of blocks) {
            for (const question of block.questions) {
                const answer = data[question.id];
                if (!answer || answer.trim() === '') continue;

                // Truncate answer to 2000 chars (Notion limit for rich_text)
                const truncatedAnswer = answer.length > 2000 ? answer.substring(0, 2000) + '...' : answer;

                const body = {
                    parent: { database_id: DATABASE_ID },
                    properties: {
                        'Вопрос': {
                            title: [{ text: { content: question.label.substring(0, 2000) } }]
                        },
                        'Блок': {
                            select: { name: `${block.id}. ${block.title}` }
                        },
                        'Ответ': {
                            rich_text: [{ text: { content: truncatedAnswer } }]
                        },
                        'Статус': {
                            select: { name: 'Новый' }
                        },
                        'Дата заполнения': {
                            date: { start: today }
                        }
                    }
                };

                try {
                    const response = await fetch('https://api.notion.com/v1/pages', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${NOTION_TOKEN}`,
                            'Content-Type': 'application/json',
                            'Notion-Version': '2022-06-28'
                        },
                        body: JSON.stringify(body)
                    });

                    if (response.ok) {
                        results.push(question.id);
                    } else {
                        const errData = await response.json();
                        errors.push({ id: question.id, error: errData.message });
                    }
                } catch (e) {
                    errors.push({ id: question.id, error: e.message });
                }
            }
        }

        return res.status(200).json({
            success: true,
            sent: results.length,
            errors: errors.length,
            details: errors.length > 0 ? errors : undefined
        });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}
