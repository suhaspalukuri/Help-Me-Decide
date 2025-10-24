import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, TrashIcon, XIcon, ChevronDownIcon } from './Icons';
import { DURATION_OPTIONS } from '../utils/time';

interface CreateBoardProps {
  onCreate: (data: { title: string; description: string; options: string[], isPublic: boolean, durationInSeconds: number }) => Promise<void>;
  onCancel: () => void;
}

const INPUT_CLASS = "w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-0";
const BUTTON_PRIMARY_CLASS = "bg-zinc-900 text-zinc-50 px-5 py-2.5 rounded-md text-sm font-medium hover:bg-zinc-800 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed";

interface CustomSelectProps {
  options: { label: string; value: number }[];
  value: number;
  onChange: (value: number) => void;
  id: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (optionValue: number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        id={id}
        type="button"
        className={`${INPUT_CLASS} flex justify-between items-center text-left`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : ''}</span>
        <ChevronDownIcon className={`w-5 h-5 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul
          className="absolute z-10 mt-1 w-full bg-white border border-zinc-200 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none"
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option.value}
              className="text-zinc-900 cursor-pointer select-none relative py-2.5 px-3 hover:bg-zinc-100"
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleOptionClick(option.value)}
            >
              <span className={`block truncate ${option.value === value ? 'font-semibold' : 'font-normal'}`}>
                {option.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


export const CreateBoard: React.FC<CreateBoardProps> = ({ onCreate, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isPublic, setIsPublic] = useState(false);
  const [durationInSeconds, setDurationInSeconds] = useState(DURATION_OPTIONS[1].value); // Default to 24 hours
  const [isCreating, setIsCreating] = useState(false);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedOptions = options.map(opt => opt.trim()).filter(Boolean);
    if (canSubmit) {
      setIsCreating(true);
      await onCreate({ title: title.trim(), description: description.trim(), options: trimmedOptions, isPublic, durationInSeconds });
    }
  };

  const canSubmit = !isCreating && title.trim() && description.trim() && options.length >= 2 && options.every(opt => opt.trim());

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">What's On Your Mind?</h1>
            <button type="button" onClick={onCancel} className="p-2 rounded-full text-zinc-500 hover:bg-zinc-100 transition-colors" aria-label="Close">
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-700 mb-1.5">The Big Question</label>
              <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Which city should I move to?" className={INPUT_CLASS} required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-700 mb-1.5">Set the Scene</label>
              <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Give your helpers some context. What's the story?" className={INPUT_CLASS} required />
            </div>
            <div>
              <h3 className="text-lg font-medium text-zinc-800 mb-2">What are the choices?</h3>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="text" value={option} onChange={e => handleOptionChange(index, e.target.value)} placeholder={`Choice #${index + 1}`} className={`flex-grow ${INPUT_CLASS}`} required />
                    {options.length > 2 && (
                        <button type="button" onClick={() => removeOption(index)} className="p-2 rounded-full text-zinc-400 hover:text-rose-500 hover:bg-rose-50 transition-colors" aria-label={`Remove Option ${index + 1}`}>
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 5 && (
                <button type="button" onClick={addOption} className="mt-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:text-zinc-700 transition-colors">
                    <PlusIcon className="w-4 h-4"/> Add Another Option
                </button>
              )}
            </div>

            <div className="border-t border-zinc-200 pt-6 space-y-6">
                 <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-zinc-800">Invite the World?</h4>
                        <p className="text-sm text-zinc-500">Make it public to get feedback from everyone.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsPublic(!isPublic)}
                        className={`${isPublic ? 'bg-zinc-900' : 'bg-zinc-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-0`}
                        role="switch"
                        aria-checked={isPublic}
                    >
                        <span
                        aria-hidden="true"
                        className={`${isPublic ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                        />
                    </button>
                </div>
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-zinc-700 mb-1.5">Voting Duration</label>
                    <CustomSelect
                        id="duration"
                        options={DURATION_OPTIONS}
                        value={durationInSeconds}
                        onChange={setDurationInSeconds}
                    />
                </div>
            </div>

          </div>

          <div className="mt-8 border-t border-zinc-200 pt-6 flex justify-end">
            <button type="submit" disabled={!canSubmit} className={BUTTON_PRIMARY_CLASS}>
              {isCreating ? 'Launching...' : 'Launch My Board'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
