
import React from 'react';
import { User } from '../types';
import { AlertTriangleIcon } from '../constants';

interface ConfirmDeleteUserModalProps {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteUserModal: React.FC<ConfirmDeleteUserModalProps> = ({ user, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 p-2 flex items-center justify-center mx-auto">
                <AlertTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-4">Confirm Deletion</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Are you sure you want to permanently delete the user <span className="font-semibold text-slate-800 dark:text-slate-100">{user.name}</span>? This action cannot be undone.
          </p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end space-x-3 rounded-b-2xl">
          <button onClick={onClose} className="bg-slate-200 dark:bg-slate-600 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
          <button onClick={onConfirm} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 shadow-sm">Delete User</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteUserModal;
