import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from '../components/common/Badge';

describe('Badge Component', () => {
  it('renders badge with correct text', () => {
    render(<Badge variant="LOST">LOST ITEM</Badge>);
    expect(screen.getByText('LOST ITEM')).toBeInTheDocument();
  });

  it('applies variant styling for FOUND items', () => {
    const { container } = render(<Badge variant="FOUND">FOUND ITEM</Badge>);
    expect(container.firstChild).toHaveClass('text-emerald-700');
  });

  it('renders resolved status styling', () => {
    const { container } = render(<Badge variant="RESOLVED">RESOLVED</Badge>);
    expect(container.firstChild).toHaveClass('text-emerald-700');
  });
});

