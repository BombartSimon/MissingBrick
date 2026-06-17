import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SetDetailsPage from './$id';

vi.mock('../../services/api', () => ({
  getApiErrorMessage: () => 'Failed',
  resolveAssetUrl: (url: string) => url,
  setsApi: {
    getByIdWithParts: vi.fn().mockResolvedValue({
      data: {
        id: 1,
        set_num: '75075-1',
        name: 'AT-AT',
        year: 2015,
        theme_id: 158,
        num_parts: 88,
        set_img_url: '',
        set_url: '',
        notes: 'Stored with winter sets',
        storage_location: 'Shelf A',
        build_status: 'building',
        last_modified_dt: '',
        created_at: '',
        updated_at: '',
        set_parts: [],
      },
    }),
    updateNotes: vi.fn(),
    delete: vi.fn(),
  },
  missingPartsApi: {
    getBySetId: vi.fn().mockResolvedValue({ data: [] }),
    assign: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  setPhotosApi: {
    list: vi.fn().mockResolvedValue({ data: { photos: [] } }),
    upload: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

test('renders notes and photos panel', async () => {
  render(
    <MemoryRouter initialEntries={["/sets/1"]}>
      <Routes>
        <Route path="/sets/:id" element={<SetDetailsPage />} />
      </Routes>
    </MemoryRouter>
  );

  expect(await screen.findByText('Notes & Photos')).toBeInTheDocument();
  expect(screen.getByDisplayValue('Shelf A')).toBeInTheDocument();
  expect(screen.getByDisplayValue('Stored with winter sets')).toBeInTheDocument();
  expect(screen.getByText('No personal photos yet.')).toBeInTheDocument();
});
