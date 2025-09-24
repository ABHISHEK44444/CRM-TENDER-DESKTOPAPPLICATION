import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CrmView from './components/CrmView';
import { TendersView } from './components/TendersView';
import AiHelper from './components/AiHelper';
import { Tender, User, Role, Client, NewTenderData, TenderStatus, NewClientData, TenderHistoryLog, ImportedTenderData, BidWorkflowStage, ClientStatus, Contact, ContactData, ClientHistoryLog, NewUserData, UserStatus, AppNotification, InteractionLog, OEM, NewOemData, TenderDocument, TenderDocumentType, Department, Designation, FinancialRequest, FinancialRequestStatus, FinancialRequestType, SystemActivityLog, BiddingTemplate, Product, AssignmentStatus, StandardProcessState, EMD, EMDStatus, PostAwardProcess, AssignmentResponse } from './types';
import * as api from './services/apiService';
import { FinanceView } from './components/FinanceView';
import AdminView from './components/AdminView';
import ReportingView from './components/AnalyticsView';
import AddTenderModal from './components/AddTenderModal';
import ClientFormModal from './components/ClientFormModal';
import GenerateDocumentModal from './components/GenerateDocumentModal';
import ImportTenderModal from './components/ImportTenderModal';
import ContactFormModal from './components/ContactFormModal';
import FinancialRequestModal from './components/FinancialRequestModal';
import ProcessRequestModal from './components/ProcessRequestModal';
import UserFormModal from './components/UserFormModal';
import ReasonForLossModal from './components/ReasonForLossModal';
import OemsView from './components/OemsView';
import OemFormModal from './components/OemFormModal';
import AiEligibilityCheckModal from './components/AiEligibilityCheckModal';
import ProductFormModal from './components/ProductFormModal';
import PrepareBidPacketModal from './components/PrepareBidPacketModal';
import ProcessesView from './components/ProcessesView';
import DeclineRequestModal from './components/DeclineRequestModal';
import ProcessTrackerModal from './components/ProcessTrackerModal';
import Login from './components/Login';
import NotificationsView from './components/NotificationsView';
import { TenderListViewProps } from './components/TenderListView';
import ConfirmDeleteUserModal from './components/ConfirmDeleteUserModal';


// Configure the PDF.js worker to ensure it loads correctly.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const getInitialUser = (): User | null => {
    try {
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
            return JSON.parse(savedUser) as User;
        }
        return null;
    } catch (error) {
        console.error("Could not parse user from sessionStorage", error);
        sessionStorage.removeItem('currentUser'); // Clear corrupted data
        return null;
    }
};

const getInitialView = (): string => {
    try {
        const savedView = sessionStorage.getItem('currentView');
        const validViews = ['dashboard', 'crm', 'tenders', 'my-feed', 'finance', 'admin', 'reporting', 'oems', 'processes', 'notifications'];
        if (savedView && validViews.includes(savedView)) {
            return savedView;
        }
        return 'dashboard';
    } catch (error) {
        console.error("Could not get view from sessionStorage", error);
        sessionStorage.removeItem('currentView');
        return 'dashboard';
    }
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(getInitialUser);
  const [currentView, _setCurrentView] = useState(getInitialView());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAddTenderModalOpen, setIsAddTenderModalOpen] = useState(false);
  const [isImportTenderModalOpen, setIsImportTenderModalOpen] = useState(false);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isFinancialRequestModalOpen, setFinancialRequestModalOpen] = useState(false);
  const [isProcessRequestModalOpen, setProcessRequestModalOpen] = useState(false);
  const [isUserFormModalOpen, setUserFormModalOpen] = useState(false);
  const [isOemFormModalOpen, setOemFormModalOpen] = useState(false);
  const [isReasonForLossModalOpen, setReasonForLossModalOpen] = useState(false);
  const [isGenerateDocumentModalOpen, setGenerateDocumentModalOpen] = useState(false);
  const [isAiEligibilityCheckModalOpen, setIsAiEligibilityCheckModalOpen] = useState(false);
  const [isProductFormModalOpen, setIsProductFormModalOpen] = useState(false);
  const [isPrepareBidPacketModalOpen, setPrepareBidPacketModalOpen] = useState(false);
  const [requestToDecline, setRequestToDecline] = useState<FinancialRequest | null>(null);
  const [tenderToTrack, setTenderToTrack] = useState<Tender | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);


  // Data State
  const [tenderForAiModal, setTenderForAiModal] = useState<Tender | null>(null);
  const [tenderForDocumentModal, setTenderForDocumentModal] = useState<Tender | null>(null);
  const [tenderForEligibilityModal, setTenderForEligibilityModal] = useState<Tender | null>(null);
  const [tenderForBidPacket, setTenderForBidPacket] = useState<Tender | null>(null);

  const [tenderForFinancialRequest, setTenderForFinancialRequest] = useState<string | null>(null);
  const [selectedTender, setSelectedTender] = useState<{ tender: Tender; from?: string } | null>(null);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [editingContact, setEditingContact] = useState<{contact?: Contact, clientId: string} | undefined>(undefined);
  const [requestToProcess, setRequestToProcess] = useState<FinancialRequest | undefined>(undefined);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [editingOem, setEditingOem] = useState<OEM | undefined>(undefined);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [tenderToUpdateLoss, setTenderToUpdateLoss] = useState<Tender | null>(null);

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [oems, setOems] = useState<OEM[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [financialRequests, setFinancialRequests] = useState<FinancialRequest[]>([]);
  const [biddingTemplates, setBiddingTemplates] = useState<BiddingTemplate[]>([]);
  const [standardProcessState, setStandardProcessState] = useState<StandardProcessState>({});

  const [systemAlerts, setSystemAlerts] = useState<AppNotification[]>([]);
  const [eventNotifications, setEventNotifications] = useState<AppNotification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => new Set());
  const [tenderListFilters, setTenderListFilters] = useState<TenderListViewProps['filters']>({
      statusFilter: 'All',
      userFilter: 'All',
      searchTerm: '',
      workflowFilter: null as string | string[] | null,
      deadlineFilter: null as '48h' | '7d' | '15d' | null,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [
            tendersData, clientsData, usersData, oemsData, productsData,
            departmentsData, designationsData, finRequestsData, templatesData,
            processStateData
        ] = await Promise.all([
            api.getData('/tenders'), api.getData('/clients'), api.getData('/users'),
            api.getData('/oems'), api.getData('/products'), api.getData('/data/departments'),
            api.getData('/data/designations'), api.getData('/financial-requests'), api.getBiddingTemplates(),
            api.getStandardProcessState()
        ]);
        setTenders(tendersData);
        setClients(clientsData);
        setUsers(usersData);
        setOems(oemsData);
        setProducts(productsData);
        setDepartments(departmentsData);
        setDesignations(designationsData);
        setFinancialRequests(finRequestsData);
        setBiddingTemplates(templatesData);
        setStandardProcessState(processStateData);
    } catch (error) {
        console.error("Failed to fetch data from backend:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
      if (currentUser) {
          fetchData();
      }
  }, [currentUser, fetchData]);

  const addNotification = useCallback((notification: AppNotification) => {
    setEventNotifications(prev => {
        // Simple check to avoid flooding with identical notifications in quick succession
        if (prev.some(n => n.message === notification.message && n.recipientId === notification.recipientId)) {
            const recentNotifs = prev.filter(n => n.message === notification.message && n.recipientId === notification.recipientId);
            const fiveSecondsAgo = Date.now() - 5000;
            if (recentNotifs.some(n => new Date(n.timestamp).getTime() > fiveSecondsAgo)) {
                 return prev;
            }
        }
        return [...prev, notification];
    });
  }, []);
  
  const allNotifications = useMemo(() => {
    const combined = [...systemAlerts, ...eventNotifications];
    const uniqueNotifications = Array.from(new Map(combined.map(item => [item.id, item])).values());
    return uniqueNotifications.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [systemAlerts, eventNotifications]);
  
  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return allNotifications
        .filter(n => !n.recipientId || n.recipientId === currentUser.id)
        .map(n => ({
            ...n,
            isRead: readNotificationIds.has(n.id)
        }));
  }, [allNotifications, currentUser, readNotificationIds]);

  const handleMarkNotificationsAsRead = useCallback((idsToMark: string[]) => {
    if (idsToMark.length === 0) return;
    setReadNotificationIds(prev => {
        const newSet = new Set(prev);
        let changed = false;
        idsToMark.forEach(id => {
            if (!newSet.has(id)) {
                newSet.add(id);
                changed = true;
            }
        });
        return changed ? newSet : prev;
    });
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    const allIds = userNotifications.map(n => n.id);
    if (allIds.length > readNotificationIds.size) {
        setReadNotificationIds(new Set(allIds));
    }
  }, [userNotifications, readNotificationIds.size]);


  const systemActivityLog = useMemo((): SystemActivityLog[] => {
    const tenderLogs: SystemActivityLog[] = tenders.flatMap(tender => 
        (tender.history || []).map((log, index) => ({
            ...log,
            id: `tend-log-${tender.id}-${index}`,
            entityType: 'Tender',
            entityName: tender.title,
            entityId: tender.id,
        }))
    );
    const clientLogs: SystemActivityLog[] = clients.flatMap(client => 
        (client.history || []).map((log, index) => ({
            ...log,
            id: `cli-log-${client.id}-${index}`,
            entityType: 'Client',
            entityName: client.name,
            entityId: client.id,
        }))
    );
    return [...tenderLogs, ...clientLogs].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [tenders, clients]);

  const setCurrentView = (view: string) => {
    setSelectedTender(null); // Always reset detail view on sidebar navigation
    if (view !== 'tenders' && view !== 'my-feed') {
        // Reset filters only when leaving tender-related views
        setTenderListFilters({
            statusFilter: 'All',
            userFilter: 'All',
            searchTerm: '',
            workflowFilter: null,
            deadlineFilter: null,
        });
    }
    _setCurrentView(view);
    sessionStorage.setItem('currentView', view);
  };
  
  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    try {
        const user = await api.login(username, password);
        if (user) {
            setCurrentUser(user);
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        return false;
    } catch (error) {
        console.error("Login failed", error);
        return false;
    }
  };

  const handleLogout = () => {
      setCurrentUser(null);
      sessionStorage.removeItem('currentUser');
      _setCurrentView('dashboard'); // Reset to default view on logout
      sessionStorage.removeItem('currentView');
  };


  useEffect(() => {
    if (!currentUser) return;
    const viewRoles: Record<string, Role[]> = {
        dashboard: [Role.Admin, Role.Sales, Role.Viewer],
        'my-feed': [Role.Admin, Role.Sales, Role.Viewer],
        finance: [Role.Admin, Role.Finance],
        admin: [Role.Admin],
        reporting: [Role.Admin, Role.Sales],
        oems: [Role.Admin, Role.Sales],
        processes: [Role.Admin, Role.Sales],
        tenders: [Role.Admin, Role.Viewer],
        notifications: [Role.Admin, Role.Sales, Role.Finance, Role.Viewer],
    };
    
    if (viewRoles[currentView] && !viewRoles[currentView].includes(currentUser.role)) {
       if (currentUser.role === Role.Finance) {
           _setCurrentView('finance');
       } else {
           _setCurrentView('dashboard');
       }
    }
  }, [currentUser, currentView]);

  // Notifications generation can be moved to the backend as a cron job or triggered by events.
  // For now, keeping it on the frontend for demonstration.
  useEffect(() => {
    if (!currentUser) return;

    const newAlerts: AppNotification[] = [];
    const now = new Date();

    const checkAndAddAlert = (tender: Tender, dateString: string, type: 'deadline' | 'expiry', messagePrefix: string) => {
        const targetDate = new Date(dateString);
        const diffTime = targetDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 15) { // Notify if within 15 days
            const adminIds = users.filter(u => u.role === Role.Admin).map(u => u.id);
            const recipients = new Set([...(tender.assignedTo || []), ...adminIds]);
            recipients.forEach(userId => {
                newAlerts.push({
                    id: `${tender.id}-${type}-${dateString}-${userId}`,
                    message: `${messagePrefix} for "${tender.title}" is due in ${diffDays} days.`,
                    type: type,
                    relatedTenderId: tender.id,
                    timestamp: now.toISOString(),
                    recipientId: userId,
                    isRead: false,
                });
            });
        }
    }
    
    tenders.forEach(t => {
        if (![TenderStatus.Won, TenderStatus.Lost, TenderStatus.Dropped].includes(t.status)) {
            checkAndAddAlert(t, t.deadline, 'deadline', 'Deadline');
        }
        if (t.emd?.expiryDate) checkAndAddAlert(t, t.emd.expiryDate, 'expiry', 'EMD');
        if (t.pbg?.expiryDate) checkAndAddAlert(t, t.pbg.expiryDate, 'expiry', 'PBG');
    });

    setSystemAlerts(newAlerts);

  }, [tenders, currentUser, users]);
  
  const navigateToTender = useCallback((tenderId: string) => {
    const tender = tenders.find(t => t.id === tenderId);
    if (tender && currentUser) {
        setSelectedTender({ tender, from: 'notification' });
        if (currentUser.role === Role.Sales) {
            setCurrentView('my-feed');
        } else {
            setCurrentView('tenders');
        }
    }
  }, [tenders, currentUser]);

  const handleOpenAiHelper = useCallback((tender: Tender) => {
    setTenderForAiModal(tender);
    setIsAiModalOpen(true);
  }, []);
  
  const handleOpenGenerateDocument = useCallback((tender: Tender) => {
      setTenderForDocumentModal(tender);
      setGenerateDocumentModalOpen(true);
  }, []);

  const handleOpenEligibilityCheck = useCallback((tender: Tender) => {
      setTenderForEligibilityModal(tender);
      setIsAiEligibilityCheckModalOpen(true);
  }, []);

  const handleOpenBidPacket = useCallback((tender: Tender) => {
    setTenderForBidPacket(tender);
    setPrepareBidPacketModalOpen(true);
  }, []);

  const handleOpenProcessTracker = useCallback((tender: Tender) => {
    setTenderToTrack(tender);
  }, []);

  const updateTenderState = useCallback((updatedTender: Tender) => {
    setTenders(prev => prev.map(t => t.id === updatedTender.id ? updatedTender : t));
    setSelectedTender(prev => 
        prev && prev.tender.id === updatedTender.id 
        ? { ...prev, tender: updatedTender } 
        : prev
    );
  }, []);

  const handleUpdateProcessTracker = useCallback(async (tenderId: string, updatedProcess: PostAwardProcess) => {
    if(!currentUser) return;
    const updatedTender = await api.updateTender(tenderId, { postAwardProcess: updatedProcess });
    updateTenderState(updatedTender);
    setTenderToTrack(null);
  }, [currentUser, updateTenderState]);


  const handleAddTender = useCallback(async (tenderData: NewTenderData) => {
    if(!currentUser) return;
    const newTender = await api.createTender({ ...tenderData, assignedTo: [currentUser.id] });
    
    // Generate notification for the creator/assignee
    const notification: AppNotification = {
        id: `${newTender.id}-assign-${currentUser.id}-${Date.now()}`,
        message: `You created and were assigned to the new tender: "${newTender.title}".`,
        type: 'assignment',
        relatedTenderId: newTender.id,
        timestamp: new Date().toISOString(),
        recipientId: currentUser.id,
        isRead: false,
    };
    addNotification(notification);

    setTenders(prev => [newTender, ...prev]);
    setIsAddTenderModalOpen(false);
  }, [currentUser, addNotification]);
  
  const handleUpdateTender = useCallback(async (updatedTenderData: Tender) => {
    const originalTender = tenders.find(t => t.id === updatedTenderData.id);
    const updatedTender = await api.updateTender(updatedTenderData.id, updatedTenderData);

    if (originalTender) {
        const now = new Date().toISOString();
        const originalAssigned = new Set(originalTender.assignedTo || []);
        const newAssigned = new Set(updatedTender.assignedTo || []);
        
        newAssigned.forEach(userId => {
            if (!originalAssigned.has(userId)) {
                // User was newly assigned
                const notification: AppNotification = {
                    id: `${updatedTender.id}-assign-${userId}-${Date.now()}`,
                    message: `You have been assigned to the tender: "${updatedTender.title}".`,
                    type: 'assignment',
                    relatedTenderId: updatedTender.id,
                    timestamp: now,
                    recipientId: userId,
                    isRead: false,
                };
                addNotification(notification);
            }
        });
    }

    if (updatedTender.status === TenderStatus.Lost && !updatedTender.reasonForLoss) {
        setTenderToUpdateLoss(updatedTender);
        setReasonForLossModalOpen(true);
    }
    updateTenderState(updatedTender);
  }, [tenders, addNotification, updateTenderState]);

  const handleDeleteTender = useCallback(async (tenderId: string) => {
    await api.deleteTender(tenderId);
    setTenders(prevTenders => prevTenders.filter(t => t.id !== tenderId));
    setFinancialRequests(prevRequests => prevRequests.filter(req => req.tenderId !== tenderId));
  }, []);

  const handleAssignmentResponse = useCallback(async (tenderId: string, status: AssignmentStatus, notes: string) => {
    if (!currentUser) return;
    const updatedTender = await api.respondToAssignment(tenderId, currentUser.id, status, notes);
    updateTenderState(updatedTender);
  }, [currentUser, updateTenderState]);
  
  const handleSaveReasonForLoss = async (reason: Tender['reasonForLoss'], notes?: string) => {
      if (tenderToUpdateLoss) {
          const updatedTender = await api.updateTender(tenderToUpdateLoss.id, { reasonForLoss: reason, reasonForLossNotes: notes });
          updateTenderState(updatedTender);
          setReasonForLossModalOpen(false);
          setTenderToUpdateLoss(null);
      }
  };
  
  const handleImportTender = useCallback(async (data: ImportedTenderData, file: File | null) => {
      if (!currentUser) return;

      let fileDataPayload: { dataUrl: string; name: string; mimeType: string; } | undefined = undefined;
      if (file) {
          const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = error => reject(error);
              reader.readAsDataURL(file);
          });
          fileDataPayload = {
              dataUrl,
              name: file.name,
              mimeType: file.type,
          };
      }
  
      const newTender = await api.importTender({ 
          ...data, 
          assignedTo: [currentUser.id],
          uploadedFile: fileDataPayload 
      });

      if (newTender.assignedTo && newTender.assignedTo.length > 0) {
        newTender.assignedTo.forEach(userId => {
            const notification: AppNotification = {
                id: `${newTender.id}-assign-${userId}-${Date.now()}`,
                message: `You were assigned to the imported tender: "${newTender.title}".`,
                type: 'assignment',
                relatedTenderId: newTender.id,
                timestamp: new Date().toISOString(),
                recipientId: userId,
                isRead: false,
            };
            addNotification(notification);
        });
      }
      
      api.getData('/clients').then(setClients);
      setTenders(prev => [newTender, ...prev]);
      setIsImportTenderModalOpen(false);
  }, [currentUser, addNotification]);


    const handleAddClient = useCallback(async (clientData: NewClientData | Client) => {
        if ('id' in clientData) { // Editing
            const updatedClient = await api.updateClient(clientData.id, clientData);
            setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
        } else { // Adding
            const newClient = await api.createClient(clientData);
            setClients(prev => [newClient, ...prev]);
        }
        setIsClientFormOpen(false);
        setEditingClient(undefined);
    }, []);
    
     const handleUpdateClient = useCallback(async (clientData: Client, options?: { silent?: boolean }) => {
        const updatedClient = await api.updateClient(clientData.id, clientData, options);
        setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
     }, []);
     
     const handleLogInteraction = useCallback(async (clientId: string, interaction: Omit<InteractionLog, 'id'|'user'|'userId'|'timestamp'>) => {
        const updatedClient = await api.logInteraction(clientId, interaction);
        setClients(prev => prev.map(c => c.id === clientId ? updatedClient : c));
     }, []);
     
     const handleSaveContact = useCallback(async (clientId: string, contactData: ContactData | Contact) => {
        const updatedClient = await api.saveContact(clientId, contactData);
        setClients(prev => prev.map(c => c.id === clientId ? updatedClient : c));
        setIsContactFormOpen(false);
        setEditingContact(undefined);
     }, []);

     const handleDeleteContact = useCallback(async (clientId: string, contactId: string) => {
        const updatedClient = await api.deleteContact(clientId, contactId);
        setClients(prev => prev.map(c => c.id === clientId ? updatedClient : c));
     }, []);

     const handleSaveFinancialRequest = useCallback(async (tenderId: string, type: FinancialRequestType, amount: number, notes?: string, expiryDate?: string) => {
        if (!currentUser) return;
        await api.createFinancialRequest({
            tenderId,
            type,
            amount,
            notes,
            instrumentDetails: { expiryDate },
            requestedById: currentUser.id
        });
        await fetchData(); // Refetch all data to ensure consistency
        setFinancialRequestModalOpen(false);
        setTenderForFinancialRequest(null);
     }, [currentUser, fetchData]);

    const handleUpdateFinancialRequestStatus = useCallback(async (requestId: string, newStatus: FinancialRequestStatus, details?: { reason?: string }) => {
        const updatedRequest = await api.updateFinancialRequest(requestId, { status: newStatus, rejectionReason: details?.reason });
        
        const tender = tenders.find(t => t.id === updatedRequest.tenderId);
        if (tender) {
            let message = '';
            if (newStatus === FinancialRequestStatus.Approved) {
                message = `Your financial request for "${tender.title}" has been approved.`;
            } else if (newStatus === FinancialRequestStatus.Declined) {
                message = `Your financial request for "${tender.title}" has been declined.`;
            }

            if (message) {
                const notification: AppNotification = {
                    id: `${updatedRequest.id}-status-${newStatus}-${Date.now()}`,
                    message: message,
                    type: 'approval',
                    relatedTenderId: tender.id,
                    timestamp: new Date().toISOString(),
                    recipientId: updatedRequest.requestedById,
                    isRead: false,
                };
                addNotification(notification);
            }
        }
        
        setFinancialRequests(prev => prev.map(r => r.id === requestId ? updatedRequest : r));
    }, [tenders, addNotification]);
    
    const handleProcessFinancialRequest = useCallback(async (requestId: string, instrumentDetails: FinancialRequest['instrumentDetails']) => {
        const updatedRequest = await api.updateFinancialRequest(requestId, { status: FinancialRequestStatus.Processed, instrumentDetails });
        setFinancialRequests(prev => prev.map(r => r.id === requestId ? updatedRequest : r));
        await fetchData(); // Refetch all data to update related tender
        setProcessRequestModalOpen(false);
        setRequestToProcess(undefined);
    }, [fetchData]);

    const handleSaveUser = useCallback(async (userData: NewUserData | User) => {
        if ('id' in userData) { // Editing
            const updatedUser = await api.updateUser(userData.id, userData);
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        } else { // Adding
            const newUser = await api.createUser(userData);
            setUsers(prev => [...prev, newUser]);
        }
        setUserFormModalOpen(false);
        setEditingUser(undefined);
    }, []);

    const handleUpdateUserStatus = useCallback(async (userId: string, status: UserStatus) => {
        const updatedUser = await api.updateUser(userId, { status });
        setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    }, []);
    
    const handleConfirmDeleteUser = async () => {
        if (userToDelete) {
            await api.deleteUser(userToDelete.id);
            setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
            setUserToDelete(null);
        }
    };

    const handleSaveOem = useCallback(async (oemData: NewOemData | OEM) => {
        if ('id' in oemData) { // Editing
            const updatedOem = await api.updateOem(oemData.id, oemData);
            setOems(prev => prev.map(o => o.id === updatedOem.id ? updatedOem : o));
        } else { // Adding
            const newOem = await api.createOem(oemData);
            setOems(prev => [newOem, ...prev]);
        }
        setOemFormModalOpen(false);
        setEditingOem(undefined);
    }, []);

    const handleSaveTemplate = useCallback(async (template: BiddingTemplate) => {
        const savedTemplate = await api.saveBiddingTemplate(template);
        if (biddingTemplates.some(t => t.id === savedTemplate.id)) { // Editing
            setBiddingTemplates(prev => prev.map(t => t.id === savedTemplate.id ? savedTemplate : t));
        } else { // Adding new
            setBiddingTemplates(prev => [savedTemplate, ...prev]);
        }
    }, [biddingTemplates]);

    const handleDeleteTemplate = useCallback(async (id: string) => {
        await api.deleteBiddingTemplate(id);
        setBiddingTemplates(prev => prev.filter(t => t.id !== id));
    }, []);

    const handleSaveProduct = useCallback(async (product: Product) => {
        const savedProduct = await api.saveProduct(product);
        if(products.some(p => p.id === savedProduct.id)) {
            setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
        } else {
            setProducts(prev => [savedProduct, ...prev]);
        }
        setIsProductFormModalOpen(false);
        setEditingProduct(undefined);
    }, [products]);

    const handleDeleteProduct = useCallback(async (id: string) => {
        await api.deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
    }, []);

    const handleCardClick = useCallback((filter: { type: string; value: any }) => {
        let newFilters: Partial<TenderListViewProps['filters']> = {
            statusFilter: 'All',
            workflowFilter: null,
            deadlineFilter: null,
        };

        if (filter.type === 'deadline') {
            newFilters.deadlineFilter = filter.value;
            newFilters.statusFilter = 'In Process';
        } else if (filter.type === 'status') {
            newFilters.statusFilter = filter.value;
        } else if (filter.type === 'workflowStage') {
            newFilters.workflowFilter = filter.value;
            newFilters.statusFilter = 'In Process';
        } else if (filter.type === 'workflowStage_and_status') {
            newFilters.workflowFilter = filter.value.workflowStages;
            newFilters.statusFilter = filter.value.status;
        }

        setTenderListFilters(prev => ({ ...prev, ...newFilters }));
        setCurrentView('tenders');
    }, []);

    const handleUpdateStandardProcess = useCallback(async (newState: StandardProcessState) => {
        setStandardProcessState(newState); // Optimistic update
        try {
            await api.updateStandardProcessState(newState);
        } catch (error) {
            console.error("Failed to save SOP state:", error);
            // Here you might want to add a user notification that the save failed
        }
    }, []);

    const mainContent = () => {
        if (isLoading) {
            return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500"></div></div>;
        }
        switch(currentView) {
            case 'dashboard': return <Dashboard tenders={tenders} clients={clients} currentUser={currentUser!} onCardClick={handleCardClick} />;
            case 'crm': return <CrmView clients={clients} tenders={tenders} onAddClient={() => setIsClientFormOpen(true)} onEditClient={(client) => { setEditingClient(client); setIsClientFormOpen(true); }} onUpdateClient={handleUpdateClient} onLogInteraction={handleLogInteraction} onAddContact={(clientId) => { setEditingContact({clientId}); setIsContactFormOpen(true); }} onEditContact={(clientId, contact) => { setEditingContact({clientId, contact}); setIsContactFormOpen(true); }} onDeleteContact={handleDeleteContact} currentUser={currentUser!} />;
            case 'tenders':
            case 'my-feed':
                return <TendersView
                    tenders={currentView === 'my-feed' ? tenders.filter(t => (t.assignedTo || []).includes(currentUser!.id)) : tenders}
                    oems={oems}
                    products={products}
                    financialRequests={financialRequests}
                    selectedTender={selectedTender}
                    setSelectedTender={setSelectedTender}
                    onAnalyze={handleOpenAiHelper}
                    onEligibilityCheck={handleOpenEligibilityCheck}
                    currentUser={currentUser!}
                    // FIX: Pass 'users' prop to TendersView as required by its props interface.
                    users={users}
                    onAddTender={() => setIsAddTenderModalOpen(true)}
                    onImportTender={() => setIsImportTenderModalOpen(true)}
                    onUpdateTender={handleUpdateTender}
                    onDeleteTender={handleDeleteTender}
                    onAssignmentResponse={handleAssignmentResponse}
                    onGenerateDocument={handleOpenGenerateDocument}
                    onFinancialRequest={(tenderId) => {setTenderForFinancialRequest(tenderId); setFinancialRequestModalOpen(true);}}
                    onPrepareBidPacket={handleOpenBidPacket}
                    onTrackProcess={handleOpenProcessTracker}
                    filters={tenderListFilters}
                    onFiltersChange={(newFilters) => setTenderListFilters(prev => ({ ...prev, ...newFilters }))}
                />;
            case 'finance': return <FinanceView users={users} tenders={tenders} financialRequests={financialRequests} currentUser={currentUser!} onRequestNew={() => setFinancialRequestModalOpen(true)} onUpdateRequestStatus={handleUpdateFinancialRequestStatus} onProcessRequest={(req) => { setRequestToProcess(req); setProcessRequestModalOpen(true); }} onDeclineRequest={(req) => setRequestToDecline(req)} />;
            case 'admin': return <AdminView users={users} departments={departments} designations={designations} biddingTemplates={biddingTemplates} products={products} onAddUser={() => setUserFormModalOpen(true)} onEditUser={(user) => {setEditingUser(user); setUserFormModalOpen(true);}} onUpdateUserStatus={handleUpdateUserStatus} onDeleteUser={(user) => setUserToDelete(user)} currentUser={currentUser!} onSaveDepartment={(name) => setDepartments(prev => [...prev, {id: `dept${Date.now()}`, name}])} onDeleteDepartment={(id) => setDepartments(prev => prev.filter(d => d.id !== id))} onSaveDesignation={(name) => setDesignations(prev => [...prev, {id: `desig${Date.now()}`, name}])} onDeleteDesignation={(id) => setDesignations(prev => prev.filter(d => d.id !== id))} onSaveTemplate={handleSaveTemplate} onDeleteTemplate={handleDeleteTemplate} onAddOrUpdateProduct={handleSaveProduct} onEditProduct={(product) => { setEditingProduct(product); setIsProductFormModalOpen(true); }} onDeleteProduct={handleDeleteProduct} />;
            case 'reporting': return <ReportingView tenders={tenders} clients={clients} users={users} financialRequests={financialRequests} activityLog={systemActivityLog} currentUser={currentUser!} />;
            case 'oems': return <OemsView oems={oems} tenders={tenders} onAddOem={() => setOemFormModalOpen(true)} onEditOem={(oem) => {setEditingOem(oem); setOemFormModalOpen(true);}} />;
            case 'processes': return <ProcessesView standardProcessState={standardProcessState} onUpdate={handleUpdateStandardProcess} />;
            case 'notifications': return <NotificationsView notifications={userNotifications} onNotificationClick={navigateToTender} onMarkAllAsRead={handleMarkAllAsRead} />;
            default: return <div>View not found</div>
        }
    };

    if (!currentUser) {
        return <Login onLogin={handleLogin} />;
    }

  return (
    <div className="flex h-screen">
       <Sidebar currentView={currentView} setCurrentView={setCurrentView} currentUser={currentUser} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header 
          title={currentView.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          currentUser={currentUser}
          onLogout={handleLogout}
          notifications={userNotifications}
          onNotificationClick={navigateToTender}
          onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
          onViewAllNotifications={() => setCurrentView('notifications')}
          currentUserParticipationStatus={selectedTender?.tender.assignmentResponses?.[currentUser.id]?.status}
        />
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-[#0d1117]">
          {mainContent()}
        </main>
      </div>

      {isAiModalOpen && tenderForAiModal && <AiHelper tender={tenderForAiModal} onClose={() => setIsAiModalOpen(false)} />}
      {isAddTenderModalOpen && <AddTenderModal clients={clients} onClose={() => setIsAddTenderModalOpen(false)} onSave={handleAddTender} />}
      {isImportTenderModalOpen && <ImportTenderModal onClose={() => setIsImportTenderModalOpen(false)} onSave={handleImportTender} />}
      {isClientFormOpen && <ClientFormModal onClose={() => { setIsClientFormOpen(false); setEditingClient(undefined); }} onSave={handleAddClient} client={editingClient} />}
      {isContactFormOpen && editingContact && <ContactFormModal onClose={() => {setIsContactFormOpen(false); setEditingContact(undefined);}} onSave={handleSaveContact} clientId={editingContact.clientId} contact={editingContact.contact} />}
      {isFinancialRequestModalOpen && <FinancialRequestModal tenders={tenders} onClose={() => {setFinancialRequestModalOpen(false); setTenderForFinancialRequest(null);}} onSave={handleSaveFinancialRequest} initialTenderId={tenderForFinancialRequest} />}
      {isProcessRequestModalOpen && requestToProcess && <ProcessRequestModal request={requestToProcess} onClose={() => { setProcessRequestModalOpen(false); setRequestToProcess(undefined); }} onSave={(details) => handleProcessFinancialRequest(requestToProcess.id, details)} />}
      {isUserFormModalOpen && <UserFormModal onClose={() => { setUserFormModalOpen(false); setEditingUser(undefined); }} onSave={handleSaveUser} user={editingUser} departments={departments} designations={designations} />}
      {isOemFormModalOpen && <OemFormModal onClose={() => { setOemFormModalOpen(false); setEditingOem(undefined); }} onSave={handleSaveOem} oem={editingOem} />}
      {isReasonForLossModalOpen && <ReasonForLossModal onClose={() => setReasonForLossModalOpen(false)} onSave={handleSaveReasonForLoss} />}
      {isGenerateDocumentModalOpen && tenderForDocumentModal && <GenerateDocumentModal tender={tenderForDocumentModal} client={clients.find(c => c.id === tenderForDocumentModal.clientId)!} currentUser={currentUser} templates={biddingTemplates} onClose={() => setGenerateDocumentModalOpen(false)} />}
      {isAiEligibilityCheckModalOpen && tenderForEligibilityModal && <AiEligibilityCheckModal tender={tenderForEligibilityModal} onClose={() => setIsAiEligibilityCheckModalOpen(false)} />}
      {isProductFormModalOpen && <ProductFormModal product={editingProduct} onClose={() => {setIsProductFormModalOpen(false); setEditingProduct(undefined);}} onSave={handleSaveProduct} currentUser={currentUser} />}
      {isPrepareBidPacketModalOpen && tenderForBidPacket && <PrepareBidPacketModal tender={tenderForBidPacket} product={products.find(p => p.id === tenderForBidPacket.productId)} onClose={() => setPrepareBidPacketModalOpen(false)} />}
      {requestToDecline && <DeclineRequestModal onClose={() => setRequestToDecline(null)} onConfirm={(reason) => { handleUpdateFinancialRequestStatus(requestToDecline.id, FinancialRequestStatus.Declined, { reason }); setRequestToDecline(null); }}/>}
      {/* FIX: Pass 'users' prop to ProcessTrackerModal to provide necessary data for user lookups. */}
      {tenderToTrack && <ProcessTrackerModal tender={tenderToTrack} currentUser={currentUser} users={users} onClose={() => setTenderToTrack(null)} onSave={handleUpdateProcessTracker} />}
      {userToDelete && <ConfirmDeleteUserModal user={userToDelete} onClose={() => setUserToDelete(null)} onConfirm={handleConfirmDeleteUser} />}
    </div>
  );
};

export default App;
