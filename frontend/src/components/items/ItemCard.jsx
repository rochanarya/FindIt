import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import Badge from '../common/Badge';

export const ItemCard = ({ item }) => {
  const primaryImage = item.images && item.images.length > 0 ? item.images[0].imageUrl : null;

  return (
    <Link
      to={`/items/${item.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition duration-200"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=60';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
            <ImageIcon className="w-10 h-10 mb-1 opacity-60" />
            <span className="text-[11px] font-medium tracking-wide uppercase">No Image Uploaded</span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <Badge variant={item.itemType}>{item.itemType}</Badge>
          <Badge variant={item.status}>{item.status.replace('_', ' ')}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold mb-1">
          <Tag className="w-3.5 h-3.5" />
          <span>{item.category?.name || 'General'}</span>
        </div>

        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1 text-base">
          {item.title}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-4 flex-1">
          {item.description}
        </p>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[130px]">{item.location}</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{item.itemDate}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;

