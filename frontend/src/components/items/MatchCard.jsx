import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, ArrowRight } from 'lucide-react';
import Badge from '../common/Badge';

export const MatchCard = ({ match }) => {
  const { matchedItem, matchScore, scoreBreakdown, matchSummary } = match;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 65) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              <Sparkles className="w-3.5 h-3.5" /> AI Match Suggestion
            </span>
            <Badge variant={matchedItem.itemType}>{matchedItem.itemType}</Badge>
          </div>
          <h4 className="font-bold text-slate-900 text-lg">{matchedItem.title}</h4>
        </div>

        {/* Match Percentage Pill */}
        <div className={`px-3 py-1.5 rounded-xl border text-center font-extrabold text-sm ${getScoreColor(matchScore)}`}>
          {matchScore}%
          <span className="block text-[10px] font-medium uppercase tracking-wider">Match</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{matchedItem.description}</p>

      {/* Score Breakdown Pills */}
      {scoreBreakdown && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
          {Object.entries(scoreBreakdown).map(([label, pts]) => (
            pts > 0 && (
              <span key={label} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                {label}: <span className="font-bold text-slate-900">+{pts}</span>
              </span>
            )
          ))}
        </div>
      )}

      {matchSummary && (
        <p className="mt-2 text-[11px] text-blue-700 font-medium italic">
          💡 {matchSummary}
        </p>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{matchedItem.location}</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{matchedItem.itemDate}</span>
          </span>
        </div>

        <Link
          to={`/items/${matchedItem.id}`}
          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 text-xs"
        >
          Inspect Item <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default MatchCard;

