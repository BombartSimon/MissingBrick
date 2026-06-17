import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders primary navigation and theme toggle', async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole('link', { name: /MissingBrick/i })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /Sets/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('link', { name: /Shopping List/i }).length).toBeGreaterThan(0);

  const themeToggle = screen.getByRole('button', { name: /Switch to dark mode/i });
  await user.click(themeToggle);
  expect(screen.getByRole('button', { name: /Switch to light mode/i })).toBeInTheDocument();
});
