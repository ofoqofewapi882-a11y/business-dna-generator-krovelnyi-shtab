import { FormData, Block } from '../types';

export const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type: type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const generateCSV = (data: FormData, blocks: Block[]): string => {
  let csv = '\uFEFFБлок,Вопрос,Ответ\n'; // Add BOM for Excel

  blocks.forEach(block => {
    block.questions.forEach(q => {
      const answer = (data[q.id] || '').replace(/"/g, '""');
      csv += `"${block.title}","${q.label}","${answer}"\n`;
    });
  });

  return csv;
};

export const generatePDFText = (data: FormData, blocks: Block[]): string => {
  let text = '═══════════════════════════════════════════════════\n';
  text += '  BUSINESS DNA: СТУДИЯ КРОВЛИ\n';
  text += '═══════════════════════════════════════════════════\n\n';
  text += `Дата заполнения: ${new Date().toLocaleDateString('ru-RU')}\n\n`;

  blocks.forEach(block => {
    text += `\n${'─'.repeat(50)}\n`;
    text += `${block.id}. ${block.title.toUpperCase()}\n`;
    text += `${'─'.repeat(50)}\n\n`;

    block.questions.forEach((q, index) => {
      const answer = data[q.id];
      if (answer) {
        text += `[${block.id}.${index + 1}] ${q.label}\n`;
        text += `> ${answer}\n\n`;
      }
    });
  });

  return text;
};

export const generateMarkdown = (data: FormData, blocks: Block[]): string => {
  let md = '# Business DNA: Студия Кровли\n\n';
  md += `*Дата заполнения: ${new Date().toLocaleDateString('ru-RU')}*\n\n`;
  md += '---\n\n';

  blocks.forEach(block => {
    md += `## ${block.id}. ${block.title}\n\n`;

    block.questions.forEach((q, index) => {
      const answer = data[q.id];
      if (answer) {
        md += `**${block.id}.${index + 1} ${q.label}**\n\n`;
        md += `${answer}\n\n`;
      }
    });
  });

  return md;
};

export const generateJSON = (data: FormData): string => {
  return JSON.stringify({
    company: 'Студия Кровли',
    date: new Date().toISOString(),
    data: data
  }, null, 2);
};
