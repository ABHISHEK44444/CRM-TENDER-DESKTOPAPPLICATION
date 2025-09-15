import React from 'react';
import { Tender, OEM, Product, User, AssignmentStatus, FinancialRequest } from '../types';
import TenderDetailView from './TenderDetailView';
import TenderListView from './TenderListView';

interface TendersViewProps {
  tenders: Tender[];
  oems: OEM[];
  products: Product[];
  financialRequests: FinancialRequest[];
  selectedTender: { tender: Tender, from?: string } | null;
  setSelectedTender: (selection: { tender: Tender, from?: string } | null) => void;
  onAnalyze: (tender: Tender) => void;
  onEligibilityCheck: (tender: Tender) => void;
  currentUser: User;
  users: User[];
  onAddTender: () => void;
  onImportTender: () => void;
  onUpdateTender: (tender: Tender) => void;
  onDeleteTender: (tenderId: string) => void;
  onAssignmentResponse: (tenderId: string, status: AssignmentStatus, notes: string) => void;
  onGenerateDocument: (tender: Tender) => void;
  onFinancialRequest: (tenderId: string) => void;
  onPrepareBidPacket: (tender: Tender) => void;
  onTrackProcess: (tender: Tender) => void;
  filters: any;
  onFiltersChange: (filters: any) => void;
}

export const TendersView: React.FC<TendersViewProps> = (props) => {
    const { selectedTender, setSelectedTender, tenders, financialRequests, users } = props;

    if (selectedTender) {
        const currentTenderState = tenders.find(t => t.id === selectedTender.tender.id) || selectedTender.tender;
        return <TenderDetailView 
            tender={currentTenderState}
            onBack={() => setSelectedTender(null)}
            highlightReason={selectedTender.from}
            onAnalyze={props.onAnalyze}
            onEligibilityCheck={props.onEligibilityCheck}
            currentUser={props.currentUser}
            // FIX: Property 'users' does not exist on type 'IntrinsicAttributes & TenderDetailViewProps'.
            users={users}
            onUpdateTender={props.onUpdateTender}
            onAssignmentResponse={props.onAssignmentResponse}
            oems={props.oems}
            products={props.products}
            financialRequests={financialRequests}
            onGenerateDocument={props.onGenerateDocument}
            onFinancialRequest={props.onFinancialRequest}
            onPrepareBidPacket={props.onPrepareBidPacket}
            onTrackProcess={props.onTrackProcess}
        />;
    }

    return <TenderListView 
        tenders={props.tenders}
        setSelectedTender={props.setSelectedTender}
        onAnalyze={props.onAnalyze}
        currentUser={props.currentUser}
        // FIX: Property 'users' does not exist on type 'IntrinsicAttributes & TenderListViewProps'.
        users={users}
        onAddTender={props.onAddTender}
        onImportTender={props.onImportTender}
        onDeleteTender={props.onDeleteTender}
        filters={props.filters}
        onFiltersChange={props.onFiltersChange}
        oems={props.oems}
        products={props.products}
    />;
};