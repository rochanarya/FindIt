import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RotateCcw, Tag, MapPin, Calendar, CheckSquare } from 'lucide-react';
import { itemService } from '../services/itemService';
import { categoryService } from '../services/categoryService';
import ItemCard from '../components/items/ItemCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';

export const BrowseItemsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters state initialized from URL query params
  const [search, setSearch] = useState(searchParams.get('search') || searchParams.get('q') || '');
  const [itemType, setItemType] = useState(searchParams.get('itemType') || searchParams.get('type') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [direction, setDirection] = useState(searchParams.get('direction') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch items whenever filters change
  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 12,
        sortBy,
        direction,
      };
      if (search.trim()) params.search = search.trim();
      if (itemType) params.itemType = itemType;
      if (categoryId) params.categoryId = categoryId;
      if (status) params.status = status;
      if (location.trim()) params.location = location.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await itemService.getItems(params);
      if (res.success && res.data) {
        setItems(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, itemType, categoryId, status, sortBy, direction]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchItems();
  };

  const handleResetFilters = () => {
    setSearch('');
    setItemType('');
    setCategoryId('');
    setStatus('');
    setLocation('');
    setStartDate('');
    setEndDate('');
    setSortBy('createdAt');
    setDirection('desc');
    setPage(0);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Browse Campus Listings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Search all reported items or filter by category, date, and status ({totalElements} items total)
          </p>
        </div>

        {/* Type Toggle Pills */}
        <div className="inline-flex rounded-xl bg-slate-200/80 p-1 self-start md:self-auto">
          <button
            onClick={() => { setItemType(''); setPage(0); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              itemType === '' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => { setItemType('LOST'); setPage(0); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              itemType === 'LOST' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lost Only
          </button>
          <button
            onClick={() => { setItemType('FOUND'); setPage(0); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              itemType === 'FOUND' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Found Only
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search keyword (e.g. calculator, blue backpack, Dell, keys)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition"
          >
            Filter
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}
              className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="PENDING_CLAIM">Pending Claim</option>
              <option value="RESOLVED">Resolved / Returned</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Location</label>
            <input
              type="text"
              placeholder="e.g. Library, Gym"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onBlur={() => { setPage(0); fetchItems(); }}
              className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
              className="w-full text-xs py-2 px-2 rounded-xl border border-slate-300 bg-white"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Sort Order</label>
            <select
              value={`${sortBy}-${direction}`}
              onChange={(e) => {
                const [sb, dir] = e.target.value.split('-');
                setSortBy(sb);
                setDirection(dir);
                setPage(0);
              }}
              className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="itemDate-desc">Date Lost/Found (Recent)</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full text-xs font-semibold py-2 px-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Item Grid */}
      {loading ? (
        <LoadingSpinner text="Searching listings..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No items found"
          description="Try broadening your search term or resetting your active filters."
          action={
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </>
      )}
    </div>
  );
};

export default BrowseItemsPage;

