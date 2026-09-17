import React, { useState } from 'react';
import { Category } from '../types';
import { Tag, Plus, Trash2, Check, X } from 'lucide-react';

interface CategoryManagerModalProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onCreateCategory: (data: { name: string; color: string }) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
}

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  categories,
  isOpen,
  onClose,
  onCreateCategory,
  onDeleteCategory,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onCreateCategory({ name: name.trim(), color });
      setName('');
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Tag className="h-4 w-4" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Manage Categories</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Add New Category Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Category Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Long-term, High Growth, Dividends"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Badge Color</label>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                    color === c
                      ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-blue-600'
                      : 'opacity-75 hover:opacity-100 hover:scale-110'
                  }`}
                >
                  {color === c && <Check className="h-3.5 w-3.5 text-white drop-shadow-sm" />}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {isSubmitting ? 'Creating...' : 'Create Category'}
          </button>
        </form>

        {/* Existing Categories List */}
        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Existing Categories ({categories.length})
          </h4>

          {categories.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No custom categories created yet.</p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/60"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 rounded-full shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                  </div>
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    title="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
