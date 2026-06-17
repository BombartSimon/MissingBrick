import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, EmptyState, ErrorBanner, Modal } from './index';

test('button renders variant content', () => {
  render(<Button variant="primary">Save</Button>);
  expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
});

test('modal renders content and close action', async () => {
  const user = userEvent.setup();
  let closed = false;
  render(
    <Modal title="Edit item" onClose={() => { closed = true; }} footer={<Button>Done</Button>}>
      <p>Modal body</p>
    </Modal>
  );

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('Modal body')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /Close modal/i }));
  expect(closed).toBe(true);
});

test('empty and error states render messages', () => {
  render(<><EmptyState title="Nothing here" description="Add something first." /><ErrorBanner message="Failed to load" /></>);
  expect(screen.getByText('Nothing here')).toBeInTheDocument();
  expect(screen.getByText('Failed to load')).toBeInTheDocument();
});
