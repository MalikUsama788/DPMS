"use client";

import { Edit, Trash2, Eye, UserCheck } from "lucide-react";

const getNestedValue = (obj, key) => {
  return key.split(".").reduce((acc, k) => (acc ? acc[k] : null), obj);
};

export default function DataTable({
  columns,
  data,
  page,
  pageSize,
  total,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  setPage,
}) {
  const totalPages = Math.ceil(total / pageSize);

  // Change Status button Color
  const getActionColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "text-green-600 hover:text-green-800";
      case "inactive":
        return "text-red-600 hover:text-red-800";
      default:
        return "text-gray-600 hover:text-gray-800";
    }
  };

  return (
    <div className="bg-gray-50 shadow rounded-lg p-4 space-y-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">#</th>
            {columns.map((col) => (
              <th key={col.key} className="p-2 border">
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete || onView || onStatusChange) && (
              <th className="p-2 border text-center">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr key={row.id || index} className="hover:bg-gray-50">
                {/* Index */}
                <td className="p-2 border">
                  {(page - 1) * pageSize + index + 1}
                </td>

                {/* Data Columns */}
                {columns.map((col) => (
                  <td key={col.key} className="p-2 border">
                    {getNestedValue(row, col.key) ?? "—"}
                  </td>
                ))}

                {/* Action Buttons */}
                {(onEdit || onDelete || onView || onStatusChange) && (
                  <td className="p-2 border">
                    <div className="flex justify-center space-x-2">
                      {onView && (
                        <button
                          onClick={() => onView(row)}
                          className="text-green-600 hover:text-green-800"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row.documentId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      {onStatusChange && (
                        <button
                          onClick={() => onStatusChange(row)}
                          className={getActionColor(row.patient_status)}
                        >
                          <UserCheck size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + 2}
                className="p-4 text-center text-gray-500"
              >
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages || 1}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
