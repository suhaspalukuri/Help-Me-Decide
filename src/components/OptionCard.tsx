import React, { useState } from 'react';
import { Option, Contribution, ContributionType } from '../types';
import { ThumbsUpIcon, ThumbsDownIcon, PlusIcon, ChevronUpIcon, ChevronDownIcon } from './Icons';
import { ContributionInput } from './ContributionInput';

interface OptionCardProps {
  option: Option;
  onVote: (optionId: string) => void;
  onAddContribution: (optionId: string, type: ContributionType, text: string) => void;
  onUpdateContributionVote: (optionId: string, contributionId: string, type: ContributionType, direction: 'up' | 'down') => void;
  hasVoted: boolean;
  isExpired: boolean;
  isWinner: boolean;
}

interface ContributionListProps {
    items: Contribution[];
    type: ContributionType;
    optionId: string;
    onUpdateContributionVote: (optionId: string, contributionId: string, type: ContributionType, direction: 'up' | 'down') => void;
    isExpired: boolean;
}

const ContributionList: React.FC<ContributionListProps> = ({ items, type, optionId, onUpdateContributionVote, isExpired }) => {
    const isPro = type === ContributionType.Pro;
    const Icon = isPro ? ThumbsUpIcon : ThumbsDownIcon;
    const iconColor = isPro ? 'text-emerald-600' : 'text-rose-600';
  
    return (
      <div className={`mt-3 space-y-2`}>
        {items.map(item => (
          <div key={item.id} className={`flex items-start gap-3 p-3 rounded-lg bg-zinc-100/70 border border-zinc-200`}>
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
            <div className="flex-grow">
                <p className="text-sm text-zinc-800">{item.text}</p>
                <p className="text-xs text-zinc-500 mt-0.5">- {item.author}</p>
            </div>
            {!isExpired && (
                <div className="ml-auto flex items-center gap-1 text-zinc-500 shrink-0">
                    <button onClick={() => onUpdateContributionVote(optionId, item.id, type, 'up')} className="p-1 rounded-md hover:bg-zinc-200 transition-colors">
                        <ChevronUpIcon className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-sm w-5 text-center tabular-nums">{item.upvotes}</span>
                    <button onClick={() => onUpdateContributionVote(optionId, item.id, type, 'down')} className="p-1 rounded-md hover:bg-zinc-200 transition-colors">
                        <ChevronDownIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
          </div>
        ))}
      </div>
    );
};


export const OptionCard: React.FC<OptionCardProps> = ({ option, onVote, onAddContribution, onUpdateContributionVote, hasVoted, isExpired, isWinner }) => {
  const [showProInput, setShowProInput] = useState(false);
  const [showConInput, setShowConInput] = useState(false);
  const winnerClasses = isWinner ? 'border-emerald-400 border-2 shadow-lg' : 'border-zinc-200';

  return (
    <div className={`bg-white rounded-xl p-6 flex flex-col shadow-sm transition-all ${winnerClasses}`}>
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold text-zinc-900">{option.name}</h3>
        {isWinner && (
          <div className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full -mt-1">Top Choice</div>
        )}
      </div>

      <div className="my-4">
        <button
          onClick={() => onVote(option.id)}
          disabled={hasVoted || isExpired}
          className="w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium bg-white border border-zinc-200 px-4 py-2 rounded-full hover:bg-zinc-100 text-zinc-800 transition-colors"
        >
          <span>Vote</span>
          <span className="text-lg font-bold text-zinc-900">{option.votes}</span>
        </button>
      </div>

      <div className="mt-2 flex-grow">
        {/* Pros Section */}
        <div>
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm text-emerald-700">The Upsides ({option.pros.length})</h4>
            {!isExpired && (
                <button
                    onClick={() => setShowProInput(!showProInput)}
                    className="text-zinc-500 hover:text-emerald-600 p-1.5 rounded-full hover:bg-zinc-100 transition-colors"
                    aria-label="Add pro"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            )}
          </div>
          {showProInput && !isExpired && (
            <ContributionInput 
                onSubmit={text => {
                    onAddContribution(option.id, ContributionType.Pro, text);
                    setShowProInput(false);
                }}
                placeholder="e.g., 'Closer to family'"
                cta="Add Upside"
            />
          )}
          <ContributionList items={option.pros} type={ContributionType.Pro} optionId={option.id} onUpdateContributionVote={onUpdateContributionVote} isExpired={isExpired} />
        </div>

        {/* Cons Section */}
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm text-rose-700">The Downsides ({option.cons.length})</h4>
             {!isExpired && (
                <button
                    onClick={() => setShowConInput(!showConInput)}
                    className="text-zinc-500 hover:text-rose-600 p-1.5 rounded-full hover:bg-zinc-100 transition-colors"
                    aria-label="Add con"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            )}
          </div>
           {showConInput && !isExpired && (
            <ContributionInput 
                onSubmit={text => {
                    onAddContribution(option.id, ContributionType.Con, text);
                    setShowConInput(false);
                }}
                placeholder="e.g., 'Higher cost of living'"
                cta="Add Downside"
            />
          )}
          <ContributionList items={option.cons} type={ContributionType.Con} optionId={option.id} onUpdateContributionVote={onUpdateContributionVote} isExpired={isExpired} />
        </div>
      </div>
    </div>
  );
};
