import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import { Tender, TenderStatus, User, Role, ChecklistItem, EMD, PBG, TenderFee, BidWorkflowStage, OEM, TenderDocument, TenderDocumentType, Product, AssignmentStatus, AssignmentResponse, FinancialRequest, FinancialRequestType, FinancialRequestStatus } from '../types';
// FIX: Remove MOCK_USERS import, as user data will be passed via props.
import { SparklesIcon, UploadCloudIcon, TrashIcon, ExternalLinkIcon, FileTextIcon, PackageIcon, ChatBubbleIcon, CurrencyDollarIcon, SearchIcon, GitBranchIcon, AlertTriangleIcon, PencilIcon, DownloadIcon } from '../constants';
import WorkflowStepper from './WorkflowStepper';
import WorkflowStageActions from './WorkflowStageActions';
import WorkflowChecklist from './WorkflowChecklist';
import { getTenderStatusBadgeClass, formatCurrency, getAssignmentStatusBadgeClass, toDatetimeLocal, openUrlInNewTab, getFinancialRequestStatusBadgeClass } from '../utils/formatting';
import AssignmentResponseModal from './AssignmentResponseModal';
import { SERVER_BASE_URL } from '../services/apiService';


interface TenderDetailViewProps {
    tender: Tender;
    onBack: () => void;
    onAnalyze: (tender: Tender) => void;
    onEligibilityCheck: (tender: Tender) => void;
    currentUser: User;
    // FIX: Add 'users' prop to provide a list of all users for assignments and lookups.
    users: User[];
    onUpdateTender: (tender: Tender) => void;
    onAssignmentResponse: (tenderId: string, status: AssignmentStatus, notes: string) => void;
    oems: OEM[];
    products: Product[];
    financialRequests: FinancialRequest[];
    onGenerateDocument: (tender: Tender) => void;
    onFinancialRequest: (tenderId: string) => void;
    onPrepareBidPacket: (tender: Tender) => void;
    onTrackProcess: (tender: Tender) => void;
    highlightReason?: string;
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

const InfoRow: React.FC<{label: string, value: React.ReactNode}> = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="font-semibold text-gray-800 dark:text-gray-200">{value || 'N/A'}</p>
    </div>
);

const EditableField: React.FC<{
    label: string,
    name: keyof Tender,
    value: any,
    isEditing: boolean,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    type?: string,
    displayFormatter?: (value: any) => React.ReactNode,
    editFormatter?: (value: any) => string,
    className?: string
}> = ({ label, name, value, isEditing, onChange, type = 'text', displayFormatter, editFormatter, className='' }) => {
    const commonInputClass = "mt-1 w-full bg-white dark:bg-slate-700 rounded-md p-1.5 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition border border-gray-300 dark:border-[#30363d]";

    return (
        <div className={className}>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            {isEditing ? (
                type === 'textarea' ? (
                     <textarea
                        name={name}
                        value={editFormatter ? editFormatter(value) : value || ''}
                        onChange={onChange}
                        rows={4}
                        className={commonInputClass}
                    />
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={editFormatter ? editFormatter(value) : value || ''}
                        onChange={onChange}
                        className={commonInputClass}
                    />
                )
            ) : (
                <div className="font-semibold text-gray-800 dark:text-gray-200">
                    {displayFormatter ? displayFormatter(value) : (value || 'N/A')}
                </div>
            )}
        </div>
    );
};

const FinancialDetailCard: React.FC<{
    title: string;
    instrument?: EMD | PBG | TenderFee;
    requests: FinancialRequest[];
    // FIX: Added 'users' prop to look up user names for the request history.
    users: User[];
}> = ({ title, instrument, requests, users }) => {
    // FIX: Create userMap from passed 'users' prop instead of a global mock.
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    const processedRequest = useMemo(() =>
        requests.find(r =>
            r.status === FinancialRequestStatus.Processed ||
            r.status === FinancialRequestStatus.Refunded ||
            r.status === FinancialRequestStatus.Released
        ),
        [requests]
    );

    // Prioritize instrument on tender object first, then a processed request, then the latest request for amount.
    const displayAmount = instrument?.amount ?? processedRequest?.amount ?? requests[0]?.amount;

    // For mode and date, we need submitted info. This comes from the instrument on the tender, or a processed request.
    const displayMode = instrument?.mode ?? processedRequest?.instrumentDetails?.mode ?? 'N/A';
    const displaySubmissionDate = instrument?.submittedDate ?? processedRequest?.instrumentDetails?.processedDate;

    if (!displayAmount) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-IN', {day: 'numeric', month: 'numeric', year: 'numeric'});
    };

    return (
        <div className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-2xl shadow-sm p-6 flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm mb-6">
                 <div>
                    <p className="text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{formatCurrency(displayAmount)}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Mode</p>
                    <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{displayMode}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Submission Date</p>
                    <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{formatDate(displaySubmissionDate)}</p>
                </div>
            </div>

            <hr className="border-gray-200 dark:border-[#30363d]" />

            <div className="mt-4">
                <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">Request History</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {requests.length > 0 ? requests.map(req => (
                        <div key={req.id} className="text-sm p-3 bg-gray-50 dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-[#30363d]">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{req.type}</span>
                                <span className={getFinancialRequestStatusBadgeClass(req.status)}>{req.status}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 mt-1 text-xs">
                                {/* FIX: Property 'name' does not exist on type 'unknown'. Use optional chaining and provide a fallback. */}
                                <span>{userMap.get(req.requestedById)?.name || 'Unknown'}</span>
                                <span>{new Date(req.requestDate).toLocaleDateString('en-IN')}</span>
                            </div>
                             {req.rejectionReason && <p className="mt-1 text-xs text-red-500">Reason: {req.rejectionReason}</p>}
                        </div>
                    )) : (
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400 py-2">No request history.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


const TenderDetailView: React.FC<TenderDetailViewProps> = ({ tender, onBack, onAnalyze, onEligibilityCheck, currentUser, onUpdateTender, onAssignmentResponse, oems, products, financialRequests, onGenerateDocument, onFinancialRequest, onPrepareBidPacket, onTrackProcess, highlightReason, users }) => {
    const canManageAssignments = currentUser.role === Role.Admin;

    const [isEditing, setIsEditing] = useState(false);
    const [editableTender, setEditableTender] = useState<Tender>(tender);
    const [isEditingAssignment, setIsEditingAssignment] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>(tender.assignedTo || []);
    const [selectedDocument, setSelectedDocument] = useState<TenderDocument | null>(null);
    const [deletingDoc, setDeletingDoc] = useState<TenderDocument | null>(null);
    const [assignmentResponseData, setAssignmentResponseData] = useState<{ status: AssignmentStatus } | null>(null);
    const [isReassigning, setIsReassigning] = useState(false); // For scrolling
    const assignmentSectionRef = useRef<HTMLDivElement>(null);
    const [isHighlighted, setIsHighlighted] = useState(false);

    const [numPages, setNumPages] = useState<number | null>(null);
    const pdfContainerRef = useRef<HTMLDivElement>(null);
    const [pdfContainerWidth, setPdfContainerWidth] = useState(0);

    const [newDocumentFile, setNewDocumentFile] = useState<File | null>(null);
    const [newDocumentType, setNewDocumentType] = useState<TenderDocumentType>(TenderDocumentType.Other);

    // FIX: Create userMap from passed 'users' prop instead of a global mock.
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const linkedProduct = useMemo(() => products.find(p => p.id === tender.productId), [products, tender.productId]);
    
    const relevantRequests = useMemo(() => 
        financialRequests.filter(req => req.tenderId === tender.id).sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()),
        [financialRequests, tender.id]
    );
    
    const emdRequests = useMemo(() => relevantRequests.filter(r => r.type.startsWith('EMD')), [relevantRequests]);
    const pbgRequests = useMemo(() => relevantRequests.filter(r => r.type === FinancialRequestType.PBG), [relevantRequests]);
    const tenderFeeRequests = useMemo(() => relevantRequests.filter(r => r.type === FinancialRequestType.TenderFee), [relevantRequests]);


    useEffect(() => {
        if (!isEditing) {
            setEditableTender(tender);
        }
    }, [tender, isEditing]);


    const handleTenderDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const numberFields = ['value', 'totalQuantity', 'emdAmount', 'epbgPercentage', 'epbgDuration', 'cost', 'amountPaid', 'liquidatedDamages'];
        const dateFields = ['deadline', 'openingDate'];
        
        let processedValue: any = value;
        if (numberFields.includes(name)) {
            processedValue = value === '' ? undefined : Number(value);
        } else if (dateFields.includes(name)) {
            processedValue = value ? new Date(value).toISOString() : undefined;
        }
        
        setEditableTender(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const handleSave = () => {
        const newHistoryEntry = {
            userId: currentUser.id,
            user: currentUser.name,
            action: 'Updated Tender Details',
            timestamp: new Date().toISOString(),
        };
        onUpdateTender({...editableTender, history: [...(tender.history || []), newHistoryEntry]});
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditableTender(tender);
        setIsEditing(false);
    };

    const handleDeleteHistoryLog = (timestamp: string) => {
        const updatedHistory = (tender.history || []).filter(log => log.timestamp !== timestamp);
        onUpdateTender({ ...tender, history: updatedHistory });
    };


    useEffect(() => {
        if (highlightReason === 'notification') {
            setIsHighlighted(true);
            const timer = setTimeout(() => setIsHighlighted(false), 4000); // Highlight for 4 seconds
            return () => clearTimeout(timer);
        }
    }, [highlightReason]);

    // Set PDF container width for responsive rendering
    useEffect(() => {
        const updateWidth = () => {
            if (pdfContainerRef.current) {
                setPdfContainerWidth(pdfContainerRef.current.clientWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    useEffect(() => {
        const docs = tender.documents || [];
        if (docs.length > 0) {
            const sortedDocs = [...docs].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
            if (selectedDocument) {
                // If a document is already selected, check if it still exists. If not, select the newest.
                const currentStillExists = sortedDocs.some(d => d.id === selectedDocument.id);
                if (!currentStillExists) {
                    setSelectedDocument(sortedDocs[0]);
                }
            } else {
                 setSelectedDocument(sortedDocs[0]);
            }
        } else {
            setSelectedDocument(null);
        }
    }, [tender.documents, selectedDocument]);
    
    // Reset page count when document changes
    useEffect(() => {
        setNumPages(null);
    }, [selectedDocument]);

    useEffect(() => {
        if (isReassigning) {
            assignmentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setIsReassigning(false); // Reset trigger after scrolling
        }
    }, [isReassigning]);
    
    const oemName = useMemo(() => oems.find(o => o.id === tender.oemId)?.name, [oems, tender.oemId]);
    
    const handleAssignmentSave = () => {
        const originalUsers = new Set(tender.assignedTo || []);
        const newUsers = new Set(selectedUserIds);

        // FIX: Property 'name' does not exist on type 'unknown'. Use optional chaining and provide a fallback.
        const addedIds = selectedUserIds.filter(id => !originalUsers.has(id));
        const removedIds = (tender.assignedTo || []).filter(id => !newUsers.has(id));

        // FIX: Property 'name' does not exist on type 'unknown'. Use optional chaining and provide a fallback.
        const addedNames = addedIds.map(id => userMap.get(id)?.name).filter(Boolean);
        const removedNames = removedIds.map(id => userMap.get(id)?.name).filter(Boolean);

        let details = '';
        if (addedNames.length > 0) details += `Assigned: ${addedNames.join(', ')}. `;
        if (removedNames.length > 0) details += `Unassigned: ${removedNames.join(', ')}.`;

        const newHistoryEntry = {
            userId: currentUser.id,
            user: currentUser.name,
            action: 'Updated Assignment',
            timestamp: new Date().toISOString(),
            details: details.trim() || 'No changes to assignment.'
        };

        // Set status to Pending for newly assigned users and handle responses
        const newResponses = { ...(tender.assignmentResponses || {}) };
        addedIds.forEach(id => {
            newResponses[id] = { status: AssignmentStatus.Pending };
        });
        removedIds.forEach(id => {
            delete newResponses[id];
        });

        const updatedTender = {
            ...tender,
            assignedTo: selectedUserIds,
            assignmentResponses: newResponses,
            history: [...(tender.history || []), newHistoryEntry]
        };

        onUpdateTender(updatedTender);
        setIsEditingAssignment(false);
    };

    const handleStatusChange = (newStatus: TenderStatus) => {
        if (tender.status === newStatus) return;

        const newHistoryEntry = {
            userId: currentUser.id,
            user: currentUser.name,
            action: 'Changed Tender Status',
            timestamp: new Date().toISOString(),
            details: `Status changed from ${tender.status} to ${newStatus}.`
        };

        onUpdateTender({ ...tender, status: newStatus, history: [...(tender.history || []), newHistoryEntry] });
    };

    const handleDeleteDocument = (documentId: string) => {
        const docToDelete = tender.documents?.find(d => d.id === documentId);
        if (docToDelete) {
          setDeletingDoc(docToDelete);
        }
    };

    const confirmDelete = () => {
        if (!deletingDoc) return;

        const updatedDocuments = (tender.documents || []).filter(doc => doc.id !== deletingDoc.id);

        const newHistoryEntry = {
            userId: currentUser.id,
            user: currentUser.name,
            action: 'Deleted Document',
            timestamp: new Date().toISOString(),
            details: `Removed document: ${deletingDoc.name}`
        };

        const updatedTender = {
            ...tender,
            documents: updatedDocuments,
            history: [...(tender.history || []), newHistoryEntry]
        };
        
        if (selectedDocument?.id === deletingDoc.id) {
            setSelectedDocument(null);
        }

        onUpdateTender(updatedTender);
        setDeletingDoc(null);
    };

    const handleAssignmentResponseClick = (status: AssignmentStatus, notes: string) => {
        onAssignmentResponse(tender.id, status, notes);
        setAssignmentResponseData(null);
    };

    const handleReassignClick = () => {
        setIsEditingAssignment(true);
        setIsReassigning(true);
    };

    const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewDocumentFile(e.target.files[0]);
        }
    };
    
    const handleAddDocument = () => {
        if (!newDocumentFile) return;
    
        const reader = new FileReader();
        reader.onloadend = () => {
            const newDoc: TenderDocument = {
                id: `doc${Date.now()}`,
                name: newDocumentFile.name,
                url: reader.result as string,
                type: newDocumentType,
                mimeType: newDocumentFile.type,
                uploadedAt: new Date().toISOString(),
                uploadedById: currentUser.id,
            };
    
            const newHistoryEntry = {
                userId: currentUser.id,
                user: currentUser.name,
                action: 'Uploaded Document',
                timestamp: new Date().toISOString(),
                details: `Uploaded ${newDocumentType}: ${newDocumentFile.name}`
            };
    
            const updatedTender = {
                ...tender,
                documents: [...(tender.documents || []), newDoc],
                history: [...(tender.history || []), newHistoryEntry],
            };
    
            onUpdateTender(updatedTender);
            setNewDocumentFile(null);
            setNewDocumentType(TenderDocumentType.Other);
            // Clear the file input visually
            const fileInput = document.getElementById('file-upload-detail') as HTMLInputElement;
            if(fileInput) fileInput.value = '';
        };
        reader.readAsDataURL(newDocumentFile);
    };
    
    const isAssignedToCurrentUser = (tender.assignedTo || []).includes(currentUser.id);
    const currentUserResponseStatus = tender.assignmentResponses?.[currentUser.id]?.status;

    const getFullUrl = (url?: string) => {
        if (!url) return '';
        if (url.startsWith('/uploads/')) {
            return `${SERVER_BASE_URL}${url}`;
        }
        return url; // Handles data URLs and other absolute URLs
    };

    const renderDocumentPreview = () => {
        if (!selectedDocument) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <UploadCloudIcon className="w-16 h-16" />
                    <p className="mt-2 font-semibold">No Document Selected</p>
                    <p className="text-sm">Upload or select a document to view.</p>
                </div>
            );
        }

        const fullUrl = getFullUrl(selectedDocument.url);

        if (selectedDocument.mimeType === 'application/pdf') {
            return (
                <Document
                    file={fullUrl}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    error={
                        <div className="text-center text-red-500 p-4">Failed to load PDF file. It might be corrupted or in an unsupported format.</div>
                    }
                >
                    {Array.from(new Array(numPages || 0), (el, index) => (
                        <Page key={`page_${index + 1}`} pageNumber={index + 1} width={pdfContainerWidth} className="mb-2" />
                    ))}
                </Document>
            );
        }

        if (selectedDocument.mimeType.startsWith('image/')) {
            return <img src={fullUrl} alt={selectedDocument.name} className="w-full h-full object-contain" />;
        }

        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50 dark:bg-[#0d1117] rounded-md p-4">
                <FileTextIcon className="w-24 h-24 text-gray-400" />
                <p className="mt-4 font-semibold text-lg text-gray-700 dark:text-gray-300 truncate max-w-full px-4">{selectedDocument.name}</p>
                <p className="mt-1 text-sm">Preview not available for this file type.</p>
                <a
                    href={fullUrl}
                    download={selectedDocument.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center space-x-2 px-6 py-3 bg-cyan-500 text-white text-base font-semibold rounded-lg hover:bg-cyan-600 transition-colors shadow"
                >
                    <DownloadIcon className="w-5 h-5" />
                    <span>Download File</span>
                </a>
            </div>
        );
    };

    const responses = Object.values(tender.assignmentResponses || {});
    const hasDeclines = responses.some(r => r.status === AssignmentStatus.Declined);
    const hasAccepts = responses.some(r => r.status === AssignmentStatus.Accepted);
    const needsReassignment = hasDeclines && !hasAccepts;

    const tenderForDisplay = isEditing ? editableTender : tender;

    return (
        <>
            <div className="p-8">
                <button onClick={onBack} className="mb-6 text-sm font-semibold text-cyan-400 hover:underline">
                    &larr; Back to Tender List
                </button>

                {isAssignedToCurrentUser && currentUserResponseStatus === AssignmentStatus.Pending && (
                    <div className="bg-[#fffbeb] dark:bg-yellow-900/20 border-l-4 border-amber-500 p-4 rounded-r-md mb-8" role="alert">
                        <h4 className="font-bold text-[#854d0e] dark:text-yellow-200">Action Required</h4>
                        <p className="text-sm text-[#92400e] dark:text-yellow-300 mt-1">You have been assigned to this tender. Please confirm your participation.</p>
                        <div className="mt-4 space-x-3">
                            <button onClick={() => setAssignmentResponseData({ status: AssignmentStatus.Accepted })} className="px-5 py-2 text-sm font-semibold bg-[#28a745] text-white rounded-md hover:bg-green-700 shadow">Accept</button>
                            <button onClick={() => setAssignmentResponseData({ status: AssignmentStatus.Declined })} className="px-5 py-2 text-sm font-semibold bg-[#dc3545] text-white rounded-md hover:bg-red-700 shadow">Decline</button>
                        </div>
                    </div>
                )}
                
                {isAssignedToCurrentUser && currentUserResponseStatus === AssignmentStatus.Accepted && ![TenderStatus.Won, TenderStatus.Lost, TenderStatus.Dropped, TenderStatus.Archived].includes(tender.status) && (
                     <div className="mb-8">
                        <button onClick={() => setAssignmentResponseData({ status: AssignmentStatus.Declined })} className="px-4 py-2 text-sm bg-white dark:bg-slate-700 text-red-500 dark:text-red-400 border border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/40 shadow-sm">
                            Decline Participation
                        </button>
                    </div>
                )}

                {isAssignedToCurrentUser && currentUserResponseStatus === AssignmentStatus.Declined && (
                    <div className="bg-gray-100 dark:bg-slate-700/50 border-l-4 border-gray-400 p-4 rounded-r-md mb-8" role="status">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">Participation Declined</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">You have declined to participate in this tender. No further action is required from you.</p>
                    </div>
                )}


                {currentUser.role === Role.Admin && needsReassignment && (
                    <div className="bg-orange-50 dark:bg-orange-900/30 border-l-4 border-amber-500 p-4 rounded-r-md mb-8" role="alert">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertTriangleIcon className="h-5 w-5 text-amber-500" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h4 className="font-bold text-orange-800 dark:text-orange-200">Assignment Declined</h4>
                                <p className="text-sm text-orange-800 dark:text-orange-300 mt-1">
                                    This tender requires re-assignment as one or more users have declined.
                                </p>
                                <div className="mt-4">
                                    <button onClick={handleReassignClick} className="px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-md hover:bg-orange-600 shadow-sm">
                                        Re-assign Tender
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                <div className={`bg-white dark:bg-[#161b22] border dark:border-[#30363d] rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/20 p-8 space-y-10 transition-all duration-500 ${isHighlighted ? 'ring-4 ring-cyan-400 ring-offset-4 ring-offset-gray-100 dark:ring-offset-[#0d1117]' : ''}`}>
                     <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{tenderForDisplay.title}</h2>
                            <p className="text-gray-500 dark:text-gray-400">For {tenderForDisplay.clientName} ({tenderForDisplay.department})</p>
                            <div className="flex items-center space-x-2 mt-2">
                                {tenderForDisplay.jurisdiction && <span className={`${getJurisdictionBadgeClass(tenderForDisplay.jurisdiction)}`}>{tenderForDisplay.jurisdiction}</span>}
                                {tenderForDisplay.source && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-500/10 text-gray-400 ring-1 ring-inset ring-gray-500/20">Source: {tenderForDisplay.source}</span>}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {![TenderStatus.Lost, TenderStatus.Dropped, TenderStatus.Archived].includes(tender.status) && (
                                <button onClick={() => onTrackProcess(tender)} className="flex items-center space-x-2 text-sm bg-indigo-500/10 text-indigo-400 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-500/20 transition-colors shadow-sm">
                                    <GitBranchIcon className="w-4 h-4" />
                                    <span>Track Process</span>
                                </button>
                            )}
                            {isEditing ? (
                                <>
                                    <button onClick={handleCancel} className="text-sm bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleSave} className="text-sm bg-cyan-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors shadow-sm">
                                        Save
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 text-sm bg-blue-500/10 text-blue-400 font-semibold px-4 py-2 rounded-lg hover:bg-blue-500/20 transition-colors shadow-sm">
                                    <PencilIcon className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                            )}
                            <select 
                                value={tender.status} 
                                onChange={(e) => handleStatusChange(e.target.value as TenderStatus)}
                                className={`${getTenderStatusBadgeClass(tender.status)} appearance-none bg-transparent cursor-pointer font-bold text-base border-none focus:ring-2 focus:ring-cyan-500`}
                            >
                                {Object.values(TenderStatus).map(s => <option key={s} value={s} className="bg-white dark:bg-[#161b22] text-gray-800 dark:text-gray-200">{s}</option>)}
                            </select>
                        </div>
                    </div>
    
                    <WorkflowStepper tender={tender} onUpdateTender={onUpdateTender} currentUser={currentUser} />
    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-10">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Key Information</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm p-4 bg-gray-50 dark:bg-[#0d1117] border border-[#30363d] rounded-lg">
                                    <EditableField label="Tender Value" name="value" value={tenderForDisplay.value} isEditing={isEditing} onChange={handleTenderDataChange} type="number" displayFormatter={(v) => v > 0 ? formatCurrency(v) : 'Not Specified'} />
                                    <EditableField label="Submission Deadline" name="deadline" value={tenderForDisplay.deadline} isEditing={isEditing} onChange={handleTenderDataChange} type="datetime-local" displayFormatter={(v) => new Date(v).toLocaleString('en-IN', {dateStyle: 'short', timeStyle: 'short', hour12: false})} editFormatter={(v) => toDatetimeLocal(v)} />
                                    <EditableField label="Opening Date" name="openingDate" value={tenderForDisplay.openingDate} isEditing={isEditing} onChange={handleTenderDataChange} type="datetime-local" displayFormatter={(v) => v ? new Date(v).toLocaleString('en-IN', {dateStyle: 'short', timeStyle: 'short', hour12: false}) : 'N/A'} editFormatter={(v) => toDatetimeLocal(v)}/>
                                    <EditableField label="Tender ID" name="tenderNumber" value={tenderForDisplay.tenderNumber} isEditing={isEditing} onChange={handleTenderDataChange} displayFormatter={(v) => <span className="font-mono">{v || tenderForDisplay.id}</span>} />
                                    <EditableField label="Total Quantity" name="totalQuantity" value={tenderForDisplay.totalQuantity} isEditing={isEditing} onChange={handleTenderDataChange} type="number" />
                                    <EditableField label="Item Category" name="itemCategory" value={tenderForDisplay.itemCategory} isEditing={isEditing} onChange={handleTenderDataChange} />
                                    <InfoRow label="Linked OEM" value={oemName || 'N/A'} />
                                    <InfoRow label="Linked Product" value={linkedProduct?.name || 'N/A'} />
                                    <EditableField label="Contract Status" name="contractStatus" value={tenderForDisplay.contractStatus} isEditing={isEditing} onChange={handleTenderDataChange} />
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Description & Actions</h3>
                                    <div className="flex items-center space-x-4">
                                        <button onClick={() => onGenerateDocument(tender)} className="flex items-center space-x-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                                            <FileTextIcon className="w-4 h-4" />
                                            <span>Generate Document</span>
                                        </button>
                                        <button onClick={() => onAnalyze(tender)} className="flex items-center space-x-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                                            <SparklesIcon className="w-4 h-4" />
                                            <span>AI Analysis</span>
                                        </button>
                                    </div>
                                </div>
                                 <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                                    <EditableField className="p-0" label="" name="description" value={tenderForDisplay.description} isEditing={isEditing} onChange={handleTenderDataChange} type="textarea" displayFormatter={(v) => <p>{v || 'No description available.'}</p>} />
                                 </div>
                            </div>
    
                             <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Eligibility & Financials</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm p-4 bg-gray-50 dark:bg-[#0d1117] border border-[#30363d] rounded-lg">
                                    <EditableField label="Min. Bidder Turnover" name="minAvgTurnover" value={tenderForDisplay.minAvgTurnover} isEditing={isEditing} onChange={handleTenderDataChange} />
                                    <EditableField label="Min. OEM Turnover" name="oemAvgTurnover" value={tenderForDisplay.oemAvgTurnover} isEditing={isEditing} onChange={handleTenderDataChange} />
                                    <EditableField label="Past Performance" name="pastPerformance" value={tenderForDisplay.pastPerformance} isEditing={isEditing} onChange={handleTenderDataChange} type="text" />
                                    <EditableField label="EMD Amount" name="emdAmount" value={tenderForDisplay.emdAmount} isEditing={isEditing} onChange={handleTenderDataChange} type="number" displayFormatter={(v) => v !== undefined && v !== null ? formatCurrency(v) : (tender.emd ? formatCurrency(tender.emd.amount): 'N/A')} />
                                    <EditableField label="ePBG Percentage" name="epbgPercentage" value={tenderForDisplay.epbgPercentage} isEditing={isEditing} onChange={handleTenderDataChange} type="number" displayFormatter={(v) => v ? `${v}%` : 'N/A'} />
                                    <EditableField label="ePBG Duration" name="epbgDuration" value={tenderForDisplay.epbgDuration} isEditing={isEditing} onChange={handleTenderDataChange} type="number" displayFormatter={(v) => v ? `${v} Months` : 'N/A'} />
                                    <InfoRow label="MSE Exemption" value={tenderForDisplay.mseExemption ? 'Yes' : 'No'} />
                                    <InfoRow label="Startup Exemption" value={tenderForDisplay.startupExemption ? 'Yes' : 'No'} />
                                    { (tenderForDisplay.sellerRequiredDocuments && tenderForDisplay.sellerRequiredDocuments.length > 0) &&
                                        <div className="col-span-2 md:col-span-4">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Documents Required from Seller</p>
                                            <ul className="list-disc list-inside font-semibold text-gray-800 dark:text-gray-200 mt-1 space-y-1">
                                                {tenderForDisplay.sellerRequiredDocuments.map((doc, i) => <li key={i}>{doc}</li>)}
                                            </ul>
                                        </div>
                                    }
                                </div>
                                <div className="mt-4">
                                    <button onClick={() => onEligibilityCheck(tender)} className="w-full flex items-center justify-center space-x-2 bg-blue-500/10 text-blue-400 font-semibold px-4 py-2 rounded-lg hover:bg-blue-500/20 transition-colors">
                                        <SparklesIcon className="w-5 h-5" />
                                        <span>Run AI Eligibility Check</span>
                                    </button>
                                </div>
                            </div>

                           <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Financial Details</h3>
                                {(emdRequests.length > 0 || tender.emd) || (pbgRequests.length > 0 || tender.pbg) || (tenderFeeRequests.length > 0 || tender.tenderFee) ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(emdRequests.length > 0 || tender.emd) && <FinancialDetailCard title="Earnest Money Deposit (EMD)" instrument={tender.emd} requests={emdRequests} users={users} />}
                                        {(pbgRequests.length > 0 || tender.pbg) && <FinancialDetailCard title="Performance Bank Guarantee (PBG)" instrument={tender.pbg} requests={pbgRequests} users={users} />}
                                        {(tenderFeeRequests.length > 0 || tender.tenderFee) && <FinancialDetailCard title="Tender Fee" instrument={tender.tenderFee} requests={tenderFeeRequests} users={users} />}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 bg-gray-50 dark:bg-[#0d1117] border border-[#30363d] rounded-lg">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No financial details available for this tender.</p>
                                    </div>
                                )}

                                {(currentUser.role === Role.Sales || currentUser.role === Role.Admin) && (
                                    <button 
                                        onClick={() => onFinancialRequest(tender.id)}
                                        className="w-full mt-4 flex items-center justify-center space-x-2 bg-cyan-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors">
                                        <CurrencyDollarIcon className="w-5 h-5" />
                                        <span>Raise Financial Request</span>
                                    </button>
                                )}
                            </div>

                        </div>
                        <div className="space-y-10">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tender Documents</h3>
                                <div className="bg-gray-50 dark:bg-[#0d1117] border border-[#30363d] rounded-lg shadow-inner">
                                    <div ref={pdfContainerRef} className="p-2 h-96 overflow-y-auto">
                                        {renderDocumentPreview()}
                                    </div>
                                    <div className="p-2 border-t border-gray-200 dark:border-[#30363d]">
                                        <h4 className="text-sm font-semibold mb-2 px-2 text-gray-600 dark:text-gray-300">Available Documents:</h4>
                                        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                                            {(tender.documents || []).map(doc => {
                                                const uploader = userMap.get(doc.uploadedById);
                                                const uploadDate = new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                                                return (
                                                    <div
                                                        key={doc.id}
                                                        onClick={() => setSelectedDocument(doc)}
                                                        className={`flex items-center justify-between w-full text-left p-2 rounded-md transition-colors cursor-pointer ${selectedDocument?.id === doc.id ? 'bg-cyan-400/10 dark:bg-cyan-400/10' : 'hover:bg-gray-200 dark:hover:bg-[#30363d]'}`}
                                                    >
                                                        <div className="flex-grow truncate pr-2">
                                                            <p className={`text-sm truncate ${selectedDocument?.id === doc.id ? 'text-cyan-800 dark:text-cyan-200 font-semibold' : 'text-gray-800 dark:text-gray-200'}`}>{doc.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{doc.type}</p>
                                                        </div>
                                                         <div className="flex-shrink-0 flex items-center space-x-2">
                                                            <div className="text-right">
                                                                <p className="text-xs text-gray-600 dark:text-gray-300">{uploader?.name || 'System'}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{uploadDate}</p>
                                                            </div>
                                                            <button onClick={(e) => { e.stopPropagation(); openUrlInNewTab(getFullUrl(doc.url)); }} className="p-1 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-600" title="Open in new tab"><ExternalLinkIcon className="w-4 h-4"/></button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }} className="p-1 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600" title={`Delete ${doc.name}`}><TrashIcon className="w-4 h-4" /></button>
                                                         </div>
                                                    </div>
                                                )
                                            })}
                                             {(tender.documents || []).length === 0 && (
                                                <p className="text-sm text-gray-500 text-center py-4">No documents uploaded yet.</p>
                                             )}
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-gray-200 dark:border-[#30363d]">
                                        <h4 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-300">Upload New Document</h4>
                                        <div className="space-y-3">
                                            <select
                                                value={newDocumentType}
                                                onChange={(e) => setNewDocumentType(e.target.value as TenderDocumentType)}
                                                className="w-full bg-white dark:bg-[#21262d] rounded-md p-2 text-sm border border-gray-300 dark:border-[#30363d] focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                            >
                                                {Object.values(TenderDocumentType).map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id="file-upload-detail"
                                                    onChange={handleFileUploadChange}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 dark:file:bg-cyan-900/50 file:text-cyan-700 dark:file:text-cyan-300 hover:file:bg-cyan-100 dark:hover:file:bg-cyan-800/50 cursor-pointer"
                                                />
                                            </div>
                                            <button
                                                onClick={handleAddDocument}
                                                disabled={!newDocumentFile}
                                                className="w-full bg-cyan-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                            >
                                                <UploadCloudIcon className="w-4 h-4" />
                                                <span>Upload Document</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
    
                            <WorkflowStageActions tender={tender} currentUser={currentUser} onUpdateTender={onUpdateTender} oems={oems} onPrepareBidPacket={onPrepareBidPacket} />
    
                            <div ref={assignmentSectionRef}>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Assigned Team</h3>
                                {canManageAssignments && isEditingAssignment ? (
                                    <div className="bg-gray-50 dark:bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                                        <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Select users to assign:</p>
                                        <div className="space-y-2 mb-4">
                                            {/* FIX: Use 'users' prop instead of MOCK_USERS. */}
                                            {users.map(user => (
                                                <label key={user.id} className="flex items-center space-x-3 cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedUserIds.includes(user.id)}
                                                        onChange={() => {
                                                            setSelectedUserIds(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id]);
                                                        }}
                                                        className="h-4 w-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
                                                    />
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">{user.name} ({user.role})</span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={handleAssignmentSave} className="text-xs bg-cyan-500 text-white font-semibold px-3 py-1 rounded-md hover:bg-cyan-600">Save</button>
                                            <button onClick={() => { setIsEditingAssignment(false); setSelectedUserIds(tender.assignedTo || []); }} className="text-xs bg-gray-200 dark:bg-[#30363d] text-gray-800 dark:text-gray-200 font-semibold px-3 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-[#444c56]">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300">Team Members</h4>
                                             {canManageAssignments && (
                                                <button onClick={() => setIsEditingAssignment(true)} className="text-sm font-semibold text-cyan-400 hover:underline">Edit</button>
                                            )}
                                        </div>
                                        {(tender.assignedTo || []).length > 0 ? (
                                            (tender.assignedTo || []).map(id => userMap.get(id)).filter(Boolean).map(user => {
                                                // FIX: Explicitly cast the assignment response to its correct type to resolve TS error.
                                                const response = tender.assignmentResponses?.[user!.id] as AssignmentResponse | undefined;
                                                const status = response?.status || AssignmentStatus.Pending;
                                                const notes = response?.notes;
                                                return (
                                                    <div key={user!.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#0d1117] border border-[#30363d] rounded-md">
                                                        <div className="flex items-center space-x-3">
                                                            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#161b22]" src={user!.avatarUrl} alt={user!.name} title={user!.name} />
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user!.name}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{user!.role}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            {notes && (
                                                                <div title={notes}>
                                                                    <ChatBubbleIcon className="w-4 h-4 text-gray-500"/>
                                                                </div>
                                                            )}
                                                            <span className={getAssignmentStatusBadgeClass(status)}>{status}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-sm text-gray-500 p-2">Not assigned.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <WorkflowChecklist tender={tender} currentUser={currentUser} onUpdateTender={onUpdateTender} />
                        </div>
                    </div>
    
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">History</h3>
                        <ul className="border border-gray-200 dark:border-[#30363d] rounded-lg max-h-60 overflow-y-auto">
                            {(tender.history || [])
                                .slice()
                                .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                .map((log) => (
                                <li key={log.timestamp} className="p-3 border-b border-gray-200 dark:border-[#30363d] last:border-b-0 group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-gray-800 dark:text-gray-200">
                                                <span className="font-semibold">{log.user}</span> {log.action}
                                            </p>
                                            {log.details && <p className="text-xs text-gray-500 dark:text-gray-400 pl-2 border-l-2 border-gray-200 dark:border-gray-600 ml-1 py-1 px-2 mt-1">{log.details}</p>}
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString('en-IN')}</p>
                                        </div>
                                        {currentUser.role === Role.Admin && (
                                            <button 
                                                onClick={() => handleDeleteHistoryLog(log.timestamp)}
                                                className="p-1 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2"
                                                title="Delete history entry"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
    
                </div>
            </div>
            {deletingDoc && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-2xl w-full max-w-md border border-[#30363d]">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Confirm Deletion</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                Are you sure you want to delete the document "{deletingDoc.name}"? This action cannot be undone.
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-[#0d1117] flex justify-end space-x-3 rounded-b-2xl">
                            <button onClick={() => setDeletingDoc(null)} className="bg-gray-200 dark:bg-[#30363d] text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-[#444c56]">Cancel</button>
                            <button onClick={confirmDelete} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 shadow-sm">Delete</button>
                        </div>
                    </div>
                </div>
            )}
             {assignmentResponseData && (
                <AssignmentResponseModal
                    initialStatus={assignmentResponseData.status}
                    onClose={() => setAssignmentResponseData(null)}
                    onConfirm={handleAssignmentResponseClick}
                />
            )}
        </>
    );
};

export default TenderDetailView;
