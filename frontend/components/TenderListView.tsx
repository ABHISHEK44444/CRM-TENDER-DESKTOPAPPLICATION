import React, { useMemo, useState } from 'react';
import { Tender, TenderStatus, User, OEM, Product, Role } from '../types';
// FIX: Remove MOCK_USERS import, as user data will be passed via props.
import { SparklesIcon, UploadCloudIcon, TrashIcon } from '../constants';
import { getTenderStatusBadgeClass, formatCurrency } from '../utils/formatting';
import { SearchIcon } from '../constants';

interface ConfirmDeleteModalProps {
  tenderTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ tenderTitle, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Confirm Deletion</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Are you sure you want to permanently delete the tender "{tenderTitle}"? This action cannot be undone.
          </p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end space-x-3 rounded-b-2xl">
          <button onClick={onClose} className="bg-slate-200 dark:bg-slate-600 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
          <button onClick={onConfirm} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 shadow-sm">Delete</button>
        </div>
      </div>
    </div>
  );
};

// FIX: Export TenderListViewProps interface.
export interface TenderListViewProps {
  tenders: Tender[];
  oems: OEM[];
  products: Product[];
  setSelectedTender: (selection: { tender: Tender, from?: string } | null) => void;
  onAnalyze: (tender: Tender) => void;
  currentUser: User;
  // FIX: Add 'users' prop to provide a list of all users for filtering and display.
  users: User[];
  onAddTender: () => void;
  onImportTender: () => void;
  onDeleteTender: (tenderId: string) => void;
  filters: {
      statusFilter: string;
      userFilter: string;
      searchTerm: string;
      workflowFilter: string | string[] | null;
      deadlineFilter: '48h' | '7d' | '15d' | null;
  };
  onFiltersChange: (newFilters: Partial<TenderListViewProps['filters']>) => void;
}

const getJurisdictionBadgeClass = (jurisdiction?: string): string => {
    const baseClass = "px-2 py-1 text-xs font-semibold rounded-full ring-1 ring-inset";
    if (!jurisdiction) return `hidden`;
    switch (jurisdiction.toLowerCase()) {
        case 'haryana': return `${baseClass} bg-orange-500/10 text-orange-400 ring-orange-500/20`;
        case 'gem': return `${baseClass} bg-teal-500/10 text-teal-400 ring-teal-500/20`;
        case 'rajasthan': return `${baseClass} bg-rose-500/10 text-rose-400 ring-rose-500/20`;
        default: return `${baseClass} bg-gray-500/10 text-gray-400 ring-gray-500/20`;
    }
}

const TenderListView: React.FC<TenderListViewProps> = ({ tenders, onAnalyze, currentUser, onAddTender, onImportTender, setSelectedTender, filters, onFiltersChange, onDeleteTender, users }) => {
    
    const [tenderToDelete, setTenderToDelete] = useState<Tender | null>(null);

    // FIX: Create userMap from passed 'users' prop instead of a global mock.
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    const filteredTenders = useMemo(() => {
        const { statusFilter, userFilter, searchTerm, workflowFilter, deadlineFilter } = filters;

        const isUpcoming = (dateString: string, days: number): boolean => {
            if (!dateString) return false;
            const targetDate = new Date(dateString);
            const today = new Date();
            const diffTime = targetDate.getTime() - today.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays >= 0 && diffDays <= days;
        };
        
        const finalStatuses: TenderStatus[] = [TenderStatus.Won, TenderStatus.Lost, TenderStatus.Dropped, TenderStatus.Archived];
        return tenders.filter(tender => {
            const statusMatch = statusFilter === 'All' || tender.status === statusFilter || (statusFilter === 'In Process' && !finalStatuses.includes(tender.status));
            const userMatch = userFilter === 'All' || (tender.assignedTo || []).includes(userFilter);
            
            const lowercasedTerm = searchTerm.toLowerCase();
            const searchMatch = !searchTerm ||
                tender.title.toLowerCase().includes(lowercasedTerm) ||
                tender.clientName.toLowerCase().includes(lowercasedTerm) ||
                (tender.tenderNumber || '').toLowerCase().includes(lowercasedTerm);
            
            const workflowMatch = !workflowFilter || (
                Array.isArray(workflowFilter) ? workflowFilter.includes(tender.workflowStage) : tender.workflowStage === workflowFilter
            );

            const deadlineMatch = !deadlineFilter || (
                (deadlineFilter === '48h' && isUpcoming(tender.deadline, 2)) ||
                (deadlineFilter === '7d' && isUpcoming(tender.deadline, 7)) ||
                (deadlineFilter === '15d' && isUpcoming(tender.deadline, 15))
            );

            return statusMatch && userMatch && searchMatch && workflowMatch && deadlineMatch;
        });
    }, [tenders, filters]);

    const handleConfirmDelete = () => {
        if (tenderToDelete) {
            onDeleteTender(tenderToDelete.id);
            setTenderToDelete(null);
        }
    };
    
    const isAdmin = currentUser.role === Role.Admin;
    const colSpan = isAdmin ? 8 : 7;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Tender Directory</h3>
                    
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search tenders..."
                            value={filters.searchTerm}
                            onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
                            className="bg-gray-100 dark:bg-[#21262d] rounded-lg pl-10 pr-4 py-2 w-64 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition border border-gray-300 dark:border-[#30363d]"
                        />
                    </div>
                     <div>
                        <select value={filters.statusFilter} onChange={e => onFiltersChange({ statusFilter: e.target.value })} className="bg-white dark:bg-[#21262d] text-sm font-semibold text-gray-600 dark:text-gray-200 rounded-md px-3 py-2 border border-gray-300 dark:border-[#30363d] focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                            <option value="All">All Statuses</option>
                            <option value="In Process">In Process</option>
                            {Object.values(TenderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div>
                        <select value={filters.userFilter} onChange={e => onFiltersChange({ userFilter: e.target.value })} className="bg-white dark:bg-[#21262d] text-sm font-semibold text-gray-600 dark:text-gray-200 rounded-md px-3 py-2 border border-gray-300 dark:border-[#30363d] focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                            <option value="All">All Users</option>
                            {/* FIX: Use 'users' prop instead of MOCK_USERS. */}
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={onImportTender} className="bg-cyan-500 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-cyan-600 transition-colors shadow-sm flex items-center space-x-2 text-sm">
                        <UploadCloudIcon className="w-4 h-4"/>
                        <span>Import Tender</span>
                    </button>
                    <button onClick={onAddTender} className="bg-gray-800 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-sm">
                       + Add Manually
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-[#161b22] border dark:border-[#30363d] rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[#0d1117] dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-2 py-3">Tender Title</th>
                                <th scope="col" className="px-2 py-3 whitespace-nowrap">Client</th>
                                <th scope="col" className="px-2 py-3 whitespace-nowrap">Status</th>
                                <th scope="col" className="px-2 py-3 whitespace-nowrap">Deadline</th>
                                <th scope="col" className="px-2 py-3 whitespace-nowrap">Assigned</th>
                                <th scope="col" className="px-2 py-3 text-right whitespace-nowrap">Value</th>
                                <th scope="col" className="px-1 py-3 text-center whitespace-nowrap">Actions</th>
                                {isAdmin && <th scope="col" className="px-1 py-3 text-center whitespace-nowrap">Delete</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTenders.map((tender) => {
                                const isOverdue = new Date(tender.deadline) < new Date() && tender.status !== TenderStatus.Won && tender.status !== TenderStatus.Lost;
                                return (
                                    <tr key={tender.id} onClick={() => setSelectedTender({ tender, from: 'list' })} className="bg-white dark:bg-[#161b22] border-b dark:border-[#30363d] hover:bg-gray-50 dark:hover:bg-[#21262d] cursor-pointer">
                                        <th scope="row" className="px-2 py-4 font-medium text-gray-900 dark:text-white">
                                            <p className="font-bold">{tender.title}</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className="text-xs text-gray-500 font-mono">{tender.tenderNumber || tender.id}</span>
                                                {tender.jurisdiction && <span className={getJurisdictionBadgeClass(tender.jurisdiction)}>{tender.jurisdiction}</span>}
                                            </div>
                                        </th>
                                        <td className="px-2 py-4 whitespace-nowrap">{tender.clientName}</td>
                                        <td className="px-2 py-4 whitespace-nowrap">
                                            <span className={getTenderStatusBadgeClass(tender.status)}>{tender.status}</span>
                                        </td>
                                        <td className={`px-2 py-4 whitespace-nowrap font-mono ${isOverdue ? 'text-red-500 font-bold' : ''}`}>
                                            {new Date(tender.deadline).toLocaleDateString('en-IN', {day: '2-digit', month:'short', year: 'numeric'})}
                                        </td>
                                        <td className="px-2 py-4">
                                            <div className="flex items-center -space-x-3">
                                                {(tender.assignedTo || [])
                                                    .map(id => userMap.get(id))
                                                    .filter(Boolean)
                                                    .slice(0, 3)
                                                    .map(user => (
                                                        <img
                                                            key={user!.id}
                                                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#161b22]"
                                                            src={user!.avatarUrl}
                                                            alt={user!.name}
                                                            title={user!.name}
                                                        />
                                                ))}
                                                {(tender.assignedTo?.length || 0) > 3 && (
                                                     <div className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#161b22] bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold">
                                                        +{(tender.assignedTo?.length || 0) - 3}
                                                    </div>
                                                )}
                                                {(tender.assignedTo?.length || 0) === 0 && (
                                                    <span className="text-xs text-gray-500">Unassigned</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-2 py-4 text-right font-mono">{formatCurrency(tender.value)}</td>
                                        <td className="px-1 py-4 text-center">
                                            <div className="flex items-center justify-center space-x-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onAnalyze(tender); }}
                                                    className="font-medium text-cyan-500 hover:underline"
                                                    aria-label={`Analyze tender ${tender.title}`}
                                                >
                                                    Analyze
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedTender({ tender, from: 'list' }); }}
                                                    className="font-medium text-cyan-500 hover:underline"
                                                    aria-label={`View tender ${tender.title}`}
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-1 py-4 text-center">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setTenderToDelete(tender); }}
                                                    className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40"
                                                    aria-label={`Delete tender ${tender.title}`}
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                     {filteredTenders.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                             <p>No tenders match the current filters.</p>
                        </div>
                    )}
                </div>
            </div>
             {tenderToDelete && (
                <ConfirmDeleteModal
                    tenderTitle={tenderToDelete.title}
                    onClose={() => setTenderToDelete(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </div>
    );
};

export default TenderListView;