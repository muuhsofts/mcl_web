// Gallery.tsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTable, useGlobalFilter, usePagination, Column, CellProps } from 'react-table';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- INTERFACES ---

interface GalleryData {
  id: number;
  title: string | null;
  description: string | null;
  file_path: string | null;
  file_type: 'image' | 'video';
  created_at: string;
  updated_at?: string;
}

interface GalleryApiResponse {
  data: GalleryData[];
}

interface ActionButtonsProps {
  galleryId: number;
  title: string | null;
  onDeletionSuccess: () => void;
}

// --- HELPER FUNCTIONS ---

const constructFileUrl = (filePath: string | null): string | null => {
  if (!filePath) return null;
  const baseUrl = axiosInstance.defaults.baseURL?.replace(/\/$/, '') || '';
  return `${baseUrl}/${filePath.replace(/^\//, '')}`;
};

const getFileType = (filePath: string | null): 'image' | 'video' | 'unknown' => {
  if (!filePath) return 'unknown';
  const ext = filePath.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image';
  if (['mp4', 'mov', 'avi'].includes(ext || '')) return 'video';
  return 'unknown';
};

// --- SUB-COMPONENTS ---

const ActionButtons: React.FC<ActionButtonsProps> = ({ galleryId, title, onDeletionSuccess }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/galleries/${galleryId}`);
      toast.success('Gallery item deleted successfully!');
      onDeletionSuccess();
    } catch (err) {
      toast.error('Failed to delete gallery item.');
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      <Link to={`/edit/gallery/${galleryId}`} className="p-1 text-blue-500 hover:text-blue-600" aria-label={`Edit ${title || 'item'}`}>
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </Link>
      <button onClick={() => setShowConfirm(true)} className="p-1 text-red-500 hover:text-red-600" aria-label={`Delete ${title || 'item'}`}>
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete "{title || 'this item'}"?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition">No</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MediaCell: React.FC<{ value: string | null; fileType: 'image' | 'video' | 'unknown' }> = ({ value, fileType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileUrl = constructFileUrl(value);

  if (!fileUrl) return <span className="text-gray-500 text-xs">No Media</span>;

  if (fileType === 'image') {
    return (
      <>
        <button onClick={() => setIsOpen(true)} className="focus:outline-none">
          <img
            src={fileUrl}
            alt="Gallery thumbnail"
            className="h-16 w-16 object-cover rounded cursor-pointer hover:opacity-80 transition"
            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/64x64?text=Error'; }}
          />
        </button>
        {isOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
            <div className="relative bg-white rounded-lg p-4 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setIsOpen(false)} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img src={fileUrl} alt="Full size" className="w-full h-auto max-h-[80vh] object-contain rounded" />
            </div>
          </div>
        )}
      </>
    );
  }

  if (fileType === 'video') {
    return (
      <video
        src={fileUrl}
        controls
        className="h-16 w-auto max-w-[120px] rounded object-cover"
        onError={() => toast.error('Failed to load video')}
      />
    );
  }

  return <span className="text-gray-500 text-xs">Unknown</span>;
};

// --- MAIN COMPONENT ---

const Gallery: React.FC = () => {
  const [data, setData] = useState<GalleryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<GalleryApiResponse>('/api/galleries');
      setData(response.data.data || []);
    } catch (err: any) {
      const errorMessage = 'Failed to fetch gallery items. ' + (err.response?.data?.error || err.message);
      setError(errorMessage);
      toast.error('Failed to fetch gallery items.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const columns = useMemo<readonly Column<GalleryData>[]>(
    () => [
      { Header: '#', Cell: ({ row }: CellProps<GalleryData>) => <span>{row.index + 1}</span> },
      { Header: 'Title', accessor: 'title', Cell: ({ value }) => value || <span className="text-gray-400 text-xs">—</span> },
      {
        Header: 'Description',
        accessor: 'description',
        Cell: ({ value }) => {
          if (!value) return <span className="text-gray-400 text-xs">—</span>;
          const maxLen = 100;
          const text = value.length > maxLen ? value.substring(0, maxLen) + '...' : value;
          return <span className="text-sm text-gray-700" title={value}>{text}</span>;
        }
      },
      {
        Header: 'Media',
        accessor: 'file_path',
        Cell: ({ row }) => {
          const filePath = row.original.file_path;
          const fileType = row.original.file_type || getFileType(filePath);
          return <MediaCell value={filePath} fileType={fileType} />;
        }
      },
      {
        Header: 'Type',
        accessor: 'file_type',
        Cell: ({ value }) => (
          <span className={`px-2 py-1 text-xs rounded-full ${value === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
            {value || 'unknown'}
          </span>
        )
      },
      { Header: 'Created At', accessor: 'created_at', Cell: ({ value }) => new Date(value).toLocaleDateString() },
      {
        Header: 'Actions',
        id: 'actions',
        Cell: ({ row }) => <ActionButtons galleryId={row.original.id} title={row.original.title} onDeletionSuccess={fetchGallery} />
      },
    ],
    [fetchGallery]
  );

  const tableInstance = useTable(
    { columns, data, initialState: { pageIndex: 0, pageSize: 10 } },
    useGlobalFilter,
    usePagination
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
  } = tableInstance;

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Gallery Records', 20, 10);
    autoTable(doc, {
      head: [['#', 'Title', 'Description', 'Type', 'Created At']],
      body: data.map((row, index) => [
        index + 1,
        row.title || '—',
        (row.description || '—').substring(0, 200),
        row.file_type || 'unknown',
        new Date(row.created_at).toLocaleDateString()
      ]),
    });
    doc.save('gallery_records.pdf');
    toast.success('PDF exported successfully!');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row, index) => ({
        '#': index + 1,
        Title: row.title || '—',
        Description: (row.description || '—').substring(0, 500),
        Type: row.file_type || 'unknown',
        'Created At': new Date(row.created_at).toLocaleDateString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Gallery');
    XLSX.writeFile(workbook, 'gallery_records.xlsx');
    toast.success('Excel exported successfully!');
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen text-lg font-semibold">Loading...</div>;
  if (error && data.length === 0)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
        <div className="text-red-500 text-xl font-semibold mb-4">An Error Occurred</div>
        <p className="text-gray-700 mb-4">{error}</p>
        <button onClick={fetchGallery} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          Try Again
        </button>
      </div>
    );

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop theme="colored" />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Gallery Management</h2>
          <Link to="/add/gallery" className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add to Gallery
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search records..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          />
          <div className="flex gap-2">
            <button onClick={exportToPDF} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
              Export PDF
            </button>
            <button onClick={exportToExcel} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
              Export Excel
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="w-full">
            <thead className="bg-gray-50">
              {headerGroups.map((hg) => (
                <tr {...hg.getHeaderGroupProps()}>
                  {hg.headers.map((col) => (
                    <th
                      {...col.getHeaderProps()}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {col.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
              {page.length > 0 ? (
                page.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className="hover:bg-gray-50 transition-colors">
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} className="px-4 py-4 align-top">
                          {cell.render('Cell')}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                    No gallery items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data.length > 10 && page.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition"
              >
                Previous
              </button>
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition"
              >
                Next
              </button>
            </div>
            <div className="text-sm text-gray-700">
              Page <span className="font-medium">{pageIndex + 1}</span> of <span className="font-medium">{pageOptions.length}</span>
            </div>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;