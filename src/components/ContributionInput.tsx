import React, { useState } from 'react';

interface ContributionInputProps {
  onSubmit: (text: string) => void;
  placeholder: string;
  cta: string;
}

export const ContributionInput: React.FC<ContributionInputProps> = ({ onSubmit, placeholder, cta }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="flex-grow bg-white border border-zinc-300 rounded-md px-3 py-1.5 text-sm ring-offset-white focus:outline-none focus:ring-0 transition"
      />
      <button
        type="submit"
        className="bg-zinc-900 text-zinc-50 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-zinc-800 focus:outline-none focus:ring-0 transition-colors duration-200 disabled:opacity-50"
        disabled={!text.trim()}
      >
        {cta}
      </button>
    </form>
  );
};
