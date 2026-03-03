import type { StoryResponse } from '@/services/brand-story.service';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportStoriesToJSON(stories: StoryResponse[], filename = 'stories-export.json') {
  const blob = new Blob([JSON.stringify(stories, null, 2)], { type: 'application/json' });
  triggerDownload(blob, filename);
}

export function exportStoriesToCSV(stories: StoryResponse[], filename = 'stories-export.csv') {
  const headers = [
    'story_id', 'title', 'story_type', 'story_type_subtype',
    'excerpt', 'image_url', 'status', 'read_time', 'sections',
    'is_active', 'created_at', 'updated_at', 'content',
  ];

  const escape = (val: unknown): string => {
    const str = val === null || val === undefined ? '' : String(val);
    if (str.includes('"') || str.includes(',') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = stories.map(s => [
    escape(s.story_id),
    escape(s.title),
    escape(s.story_type),
    escape(s.story_type_subtype),
    escape(s.excerpt),
    escape(s.image_url),
    escape(s.status),
    escape(s.read_time),
    escape(s.sections),
    escape(s.is_active),
    escape(s.created_at),
    escape(s.updated_at),
    escape(JSON.stringify(s.content)),
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  triggerDownload(blob, filename);
}

export async function exportStoriesToExcel(stories: StoryResponse[], filename = 'stories-export.xlsx') {
  const XLSX = await import('xlsx');

  const rows = stories.map(s => ({
    story_id: s.story_id,
    title: s.title,
    story_type: s.story_type,
    story_type_subtype: s.story_type_subtype,
    excerpt: s.excerpt,
    image_url: s.image_url,
    status: s.status,
    read_time: s.read_time,
    sections: s.sections,
    is_active: s.is_active,
    created_at: s.created_at,
    updated_at: s.updated_at,
    content: JSON.stringify(s.content),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 36 }, { wch: 40 }, { wch: 16 }, { wch: 22 },
    { wch: 60 }, { wch: 60 }, { wch: 12 }, { wch: 10 },
    { wch: 10 }, { wch: 10 }, { wch: 22 }, { wch: 22 }, { wch: 80 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Stories');
  XLSX.writeFile(wb, filename);
}
