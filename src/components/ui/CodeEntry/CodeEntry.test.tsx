import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { CodeEntry } from './CodeEntry';

test('typing six digits calls onChange and onComplete with the code', () => {
  const onChange = vi.fn();
  const onComplete = vi.fn();
  render(<CodeEntry value="" onChange={onChange} onComplete={onComplete} />);

  fireEvent.change(screen.getByLabelText('Six-digit authenticator code'), {
    target: { value: '123456' },
  });

  expect(onChange).toHaveBeenCalledWith('123456');
  expect(onComplete).toHaveBeenCalledWith('123456');
});

test('non-digit characters are stripped', () => {
  const onChange = vi.fn();
  render(<CodeEntry value="" onChange={onChange} />);
  fireEvent.change(screen.getByLabelText('Six-digit authenticator code'), {
    target: { value: '12a3' },
  });
  expect(onChange).toHaveBeenCalledWith('123');
});

test('error: announces the message and keeps the typed digits', () => {
  render(<CodeEntry value="12" onChange={() => {}} error="That code didn't work." />);
  expect(screen.getByRole('alert')).toHaveTextContent("That code didn't work.");
  expect(screen.getByLabelText('Six-digit authenticator code')).toHaveValue('12');
});

test('expired: locks the input and offers a new code', () => {
  const onRequestNewCode = vi.fn();
  render(<CodeEntry value="" onChange={() => {}} expired onRequestNewCode={onRequestNewCode} />);
  expect(screen.getByLabelText('Six-digit authenticator code')).toBeDisabled();
  expect(screen.getByText(/this code has expired/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Get a new code' }));
  expect(onRequestNewCode).toHaveBeenCalled();
});
