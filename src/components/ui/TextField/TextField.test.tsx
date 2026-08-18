import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { TextField } from './TextField';

test('default: no error is announced', () => {
  render(<TextField label="Shop name" />);
  expect(screen.getByLabelText('Shop name')).not.toHaveAttribute('aria-invalid', 'true');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('error: marks the input invalid and announces the message', () => {
  render(<TextField label="Email" error="Enter a valid email address." />);
  const input = screen.getByLabelText('Email');
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.');
});

test('disabled: keeps the label associated but cannot be edited', () => {
  render(<TextField label="Username" defaultValue="dita.marlow" disabled />);
  expect(screen.getByLabelText('Username')).toBeDisabled();
});
