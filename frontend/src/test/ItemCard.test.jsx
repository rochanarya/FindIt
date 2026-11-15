import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ItemCard from '../components/items/ItemCard';

describe('ItemCard Component', () => {
  const mockItem = {
    id: 'test-uuid-1234',
    title: 'Blue Water Bottle',
    description: 'Stainless steel hydro flask left on gym bench',
    itemType: 'FOUND',
    status: 'OPEN',
    location: 'Campus Recreation Center',
    itemDate: '2026-11-12',
    category: { id: 1, name: 'Other' },
    images: [{ id: 1, imageUrl: 'https://example.com/bottle.jpg' }],
  };

  it('renders item title, location, category, and date', () => {
    render(
      <BrowserRouter>
        <ItemCard item={mockItem} />
      </BrowserRouter>
    );

    expect(screen.getByText('Blue Water Bottle')).toBeInTheDocument();
    expect(screen.getByText('Campus Recreation Center')).toBeInTheDocument();
    expect(screen.getByText('2026-11-12')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
    expect(screen.getByText('FOUND')).toBeInTheDocument();
    expect(screen.getByText('OPEN')).toBeInTheDocument();
  });
});

