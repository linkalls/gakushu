'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Note {
  id: number;
  guid: string;
  noteTypeId: number;
  fields: string[];
  tags: string[];
  created: Date;
  modified: Date;
}

export default function BrowsePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const response = await fetch('/api/notes');
    const data = await response.json();
    setNotes(data);
  };

  const deleteNote = async (id: number) => {
    if (!confirm('このノートを削除しますか？')) return;
    
    await fetch(`/api/notes/${id}`, {
      method: 'DELETE',
    });
    
    loadNotes();
  };

  const filteredNotes = notes.filter(note =>
    note.fields.some(field =>
      field.toLowerCase().includes(searchQuery.toLowerCase())
    ) || note.tags.some(tag =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-sm text-blue-100 hover:text-white">
            ← ホームに戻る
          </Link>
          <h1 className="text-3xl font-bold mt-2">ノート参照</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <input
            type="text"
            placeholder="ノートを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  フロント
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  バック
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  タグ
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredNotes.map((note) => (
                <tr key={note.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">
                    <div 
                      className="line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: note.fields[0] || '' }}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    <div 
                      className="line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: note.fields[1] || '' }}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-1 mb-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            ノートが見つかりません
          </div>
        )}
      </main>
    </div>
  );
}
