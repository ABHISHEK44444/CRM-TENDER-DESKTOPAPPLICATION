// This file contains the mock data previously located in `constants.tsx`.
// It is used by `seed.js` to populate the database.

const Role = { Admin: 'Admin', Sales: 'Sales', Finance: 'Finance', Viewer: 'Viewer' };
const ClientStatus = { Active: 'Active', Lead: 'Lead', Dormant: 'Dormant', Lost: 'Lost' };
const BidWorkflowStage = {
  Identification: 'Tender Identification', Review: 'Tender Review and Shortlisting', Preparation: 'Bid Preparation', PreBidMeeting: 'Pre-Bid Meeting',
  Submission: 'Bid Submission', UnderTechnicalEvaluation: 'Under Technical Evaluation', UnderFinancialEvaluation: 'Under Financial Evaluation',
  FollowUp: 'Follow-Up and Clarifications', Negotiation: 'Negotiation and Counter Offer', LOI_PO: 'Letter of Intent (LOI) / Purchase Order (PO)',
  DeliveryPlanning: 'Project Delivery Planning', Delivery: 'Delivery', Installation: 'Proof of Testing (POT) / Installation',
  Payment: 'Payment Collection', Warranty: 'Warranty Support', Complete: 'Complete'
};
const ClientAcquisitionSource = {
    ColdCalling: 'Cold Calling', ExistingCustomer: 'Existing Customer New Enquiries', Referral: 'Referrals',
    Telephonic: 'Telephonic Outreach', Social: 'Social Platforms', Other: 'Other'
};
const TenderStatus = {
  Drafting: 'Drafting', Submitted: 'Submitted', UnderReview: 'Under Review', Won: 'Won',
  Lost: 'Lost', Archived: 'Archived', Dropped: 'Dropped'
};
const EMDStatus = {
    Pending: 'Pending', Requested: 'Requested', UnderProcess: 'Under Process',
    Refunded: 'Refunded', Forfeited: 'Forfeited', Expired: 'Expired'
};
const PBGStatus = { Active: 'Active', Expired: 'Expired', Released: 'Released' };
const PaymentStatus = { Pending: 'Pending', PartiallyPaid: 'Partially Paid', Paid: 'Paid' };
const AssignmentStatus = { Pending: 'Pending', Accepted: 'Accepted', Declined: 'Declined' };
const TenderDocumentType = {
    TenderNotice: 'Tender Notice', Corrigendum: 'Corrigendum', TechnicalBid: 'Technical Bid', CommercialBid: 'Commercial Bid',
    PurchaseOrder: 'Purchase Order', Contract: 'Contract', DeliverySchedule: 'Delivery Schedule', WarrantyCertificate: 'OEM Warranty Certificate',
    InstallationCertificate: 'Installation Certificate', PreDeliveryInspectionCertificate: 'Pre-Delivery Inspection Certificate',
    Invoice: 'Invoice', ClientSatisfactoryReport: 'Client Satisfactory Report', Other: 'Other', FinancialRequestAttachment: 'Financial Request Attachment',
    ProductBrochure: 'Product Brochure', AuthorizationCertificate: 'Authorization Certificate', TechnicalCompliance: 'Technical Compliance',
    CaseStudy: 'Case Study', LetterOfAcceptance: 'Letter of Acceptance', PBGDocument: 'PBG Document', EMDRefundLetter: 'EMD Refund Letter'
};
const FinancialRequestType = { EMD_BG: 'EMD BG', EMD_DD: 'EMD DD', EMD_Online: 'EMD Online', PBG: 'PBG', TenderFee: 'Tender Fee', Other: 'Other' };
const FinancialRequestStatus = {
    PendingApproval: 'Pending Approval', Approved: 'Approved', Declined: 'Declined', Processed: 'Processed',
    Refunded: 'Refunded', Released: 'Released', Forfeited: 'Forfeited', Expired: 'Expired'
};

const MOCK_DEPARTMENTS = [
    { id: 'dept1', name: 'Sales - Government' }, { id: 'dept2', name: 'Sales - Corporate' },
    { id: 'dept3', name: 'Technical' }, { id: 'dept4', name: 'Finance' },
    { id: 'dept5', name: 'Management' }, { id: 'dept6', name: 'Human Resources' },
    { id: 'dept7', name: 'Marketing' }, { id: 'dept8', name: 'Customer Support' },
    { id: 'dept9', name: 'Logistics' }, { id: 'dept10', name: 'Operations' },
];

const MOCK_DESIGNATIONS = [
    { id: 'desig1', name: 'Sales Director' }, { id: 'desig2', name: 'Sales Manager' },
    { id: 'desig3', name: 'Senior Engineer' }, { id: 'desig4', name: 'Accountant' },
    { id: 'desig5', name: 'Bid Manager' }, { id: 'desig6', name: 'CEO' },
    { id: 'desig7', name: 'COO' }, { id: 'desig8', name: 'Sales Executive' },
    { id: 'desig9', name: 'Senior Accountant' }, { id: 'desig10', name: 'Intern' },
];

const MOCK_USERS = [
  { id: 'user1', name: 'Admin User', username: 'admin', email: 'admin@mintergraph.com', password: 'password123', role: Role.Admin, avatarUrl: 'https://ui-avatars.com/api/?name=Admin+User&background=7f56d9&color=fff&size=40', status: 'Active', department: 'Management', designation: 'CEO' },
  { id: 'user2', name: 'Sales User', username: 'sales', email: 'sales@mintergraph.com', password: 'password123', role: Role.Sales, avatarUrl: 'https://ui-avatars.com/api/?name=Sales+User&background=0284c7&color=fff&size=40', status: 'Active', department: 'Sales - Government', designation: 'Sales Manager', specializations: ['Printers', 'Cloud Services'] },
  { id: 'user3', name: 'Finance User', username: 'finance', email: 'finance@mintergraph.com', password: 'password123', role: Role.Finance, avatarUrl: 'https://ui-avatars.com/api/?name=Finance+User&background=16a34a&color=fff&size=40', status: 'Active', department: 'Finance', designation: 'Accountant' },
  { id: 'user4', name: 'Viewer User', username: 'viewer', email: 'viewer@mintergraph.com', password: 'password123', role: Role.Viewer, avatarUrl: 'https://ui-avatars.com/api/?name=Viewer+User&background=64748b&color=fff&size=40', status: 'Inactive' },
  { id: 'user5', name: 'Kamal Singh', username: 'kamal', email: 'kamal@mintergraph.com', password: 'password123', role: Role.Sales, avatarUrl: 'https://ui-avatars.com/api/?name=Kamal+Singh&background=c2410c&color=fff&size=40', status: 'Active', department: 'Sales - Corporate', designation: 'Sales Director', specializations: ['AI', 'Data Center'] },
  { id: 'user6', name: 'Priya Sharma', username: 'priya', email: 'priya@mintergraph.com', password: 'password123', role: Role.Sales, avatarUrl: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=db2777&color=fff&size=40', status: 'Active', department: 'Sales - Government', designation: 'Sales Executive', specializations: ['Networking', 'Security'] },
  { id: 'user7', name: 'Rohan Gupta', username: 'rohan', email: 'rohan@mintergraph.com', password: 'password123', role: Role.Finance, avatarUrl: 'https://ui-avatars.com/api/?name=Rohan+Gupta&background=16a34a&color=fff&size=40', status: 'Active', department: 'Finance', designation: 'Senior Accountant' },
  { id: 'user8', name: 'Anjali Menon', username: 'anjali', email: 'anjali@mintergraph.com', password: 'password123', role: Role.Sales, avatarUrl: 'https://ui-avatars.com/api/?name=Anjali+Menon&background=0284c7&color=fff&size=40', status: 'Inactive', department: 'Sales - Corporate', designation: 'Sales Manager', specializations: ['Software', 'Cloud'] },
  { id: 'user9', name: 'Vikram Rathore', username: 'vikram', email: 'vikram@mintergraph.com', password: 'password123', role: Role.Admin, avatarUrl: 'https://ui-avatars.com/api/?name=Vikram+Rathore&background=7f56d9&color=fff&size=40', status: 'Active', department: 'Management', designation: 'COO' },
  { id: 'user10', name: 'Sandeep Kumar', username: 'sandeep', email: 'sandeep@mintergraph.com', password: 'password123', role: Role.Viewer, avatarUrl: 'https://ui-avatars.com/api/?name=Sandeep+Kumar&background=64748b&color=fff&size=40', status: 'Active', department: 'Technical', designation: 'Intern' },
];

const MOCK_CLIENTS = [
    { id: 'cli1', name: 'Ministry of Defence', industry: 'Government', gstin: '27AAAAA0000A1Z5', revenue: 15000000, joinedDate: '2022-01-15', contacts: [{id: 'c1', name: 'Ravi Sharma', role: 'Procurement Officer', email: 'ravi.sharma@mod.gov.in', phone: '9876543210', isPrimary: true}], status: ClientStatus.Active, category: 'Key Account', source: ClientAcquisitionSource.ExistingCustomer, history: [{ userId: 'user1', user: 'Admin User', action: 'Created Client', timestamp: new Date().toISOString()}]},
    { id: 'cli2', name: 'National Informatics Centre', industry: 'Government', gstin: '28BBBBB1111B2Z6', revenue: 8000000, joinedDate: '2023-05-20', contacts: [{id: 'c2', name: 'Priya Gupta', role: 'IT Head', email: 'priya.gupta@nic.in', phone: '8765432109'}], status: ClientStatus.Active, category: 'High-Value', potentialValue: 10000000, source: ClientAcquisitionSource.Referral, interactions: [{id: 'int1', type: 'Meeting', notes: 'Discussed cloud migration strategy.', userId: 'user2', user: 'Sales User', timestamp: '2024-05-10T10:00:00Z'}] },
    { id: 'cli3', name: 'State Bank of India', industry: 'Banking', gstin: '29CCCCC2222C3Z7', revenue: 0, joinedDate: '2024-02-10', contacts: [], status: ClientStatus.Lead, category: 'Prospect', potentialValue: 5000000, source: ClientAcquisitionSource.ColdCalling },
    { id: 'cli4', name: 'Bharat Heavy Electricals Limited', industry: 'PSU', gstin: '30DDDDD3333D4Z8', revenue: 25000000, joinedDate: '2021-11-30', contacts: [{id: 'c3', name: 'Suresh Kumar', role: 'Purchase Head', email: 's.kumar@bhel.in', phone: '9123456780', isPrimary: true}], status: ClientStatus.Active, category: 'Key Account', source: ClientAcquisitionSource.ExistingCustomer },
    { id: 'cli5', name: 'HCL Technologies', industry: 'IT/Tech', gstin: '31EEEEE4444E5Z9', revenue: 0, joinedDate: '2024-06-01', contacts: [], status: ClientStatus.Lead, category: 'Prospect', potentialValue: 12000000, source: ClientAcquisitionSource.Social },
    { id: 'cli6', name: 'Tata Motors', industry: 'Manufacturing', gstin: '32FFFFF5555F6Z0', revenue: 5000000, joinedDate: '2022-08-12', contacts: [], status: ClientStatus.Dormant, category: 'Standard', notes: 'Last activity was over a year ago.' },
    { id: 'cli7', name: 'AIIMS, New Delhi', industry: 'Healthcare', gstin: '33GGGGG6666G7Z1', revenue: 30000000, joinedDate: '2023-01-05', contacts: [{id: 'c4', name: 'Dr. Meena Singh', role: 'Chief Medical Officer', email: 'meena.singh@aiims.edu', phone: '9876543211'}], status: ClientStatus.Active, category: 'High-Value', source: ClientAcquisitionSource.Referral },
    { id: 'cli8', name: 'Delhi University', industry: 'Education', gstin: '34HHHHH7777H8Z2', revenue: 1000000, joinedDate: '2023-09-01', contacts: [], status: ClientStatus.Lost, category: 'Standard', notes: 'Lost the last major bid due to pricing.' },
    { id: 'cli9', name: 'Indian Oil Corporation Ltd', industry: 'PSU', gstin: '35IIIII8888I9Z3', revenue: 50000000, joinedDate: '2020-04-22', contacts: [], status: ClientStatus.Active, category: 'Key Account' },
    { id: 'cli10', name: 'Reliance Retail', industry: 'Retail', gstin: '36JJJJJ9999J0Z4', revenue: 0, joinedDate: '2024-07-01', contacts: [], status: ClientStatus.Lead, category: 'High-Value Prospect', potentialValue: 40000000, source: ClientAcquisitionSource.ColdCalling },
];

const MOCK_OEMS = [
    { id: 'oem1', name: 'HP Inc.', contactPerson: 'Amitabh Jain', email: 'amitabh.jain@hp.com', phone: '9988776655', website: 'hp.com', area: 'North', region: 'Delhi NCR', accountManager: 'Sunita Sharma', accountManagerStatus: 'Active' },
    { id: 'oem2', name: 'Dell Technologies', contactPerson: 'Sunita Williams', email: 'sunita.williams@dell.com', phone: '9988776644', website: 'dell.com', area: 'West', region: 'Mumbai', accountManager: 'Rakesh Verma', accountManagerStatus: 'Inactive' },
    { id: 'oem3', name: 'Cisco Systems', contactPerson: 'Vijay Panday', email: 'v.panday@cisco.com', phone: '9988776633', website: 'cisco.com', area: 'South', region: 'Bangalore' },
    { id: 'oem4', name: 'Microsoft Corporation', contactPerson: 'Megha Desai', email: 'm.desai@microsoft.com', phone: '9988776622', website: 'microsoft.com', area: 'All India', region: 'All India', accountManager: 'Kamal Singh', accountManagerStatus: 'Active' },
    { id: 'oem5', name: 'Oracle Corporation', contactPerson: 'Anand Pillai', email: 'anand.pillai@oracle.com', phone: '9988776611', website: 'oracle.com', area: 'All India', region: 'All India' },
    { id: 'oem6', name: 'Lenovo', contactPerson: 'Prakash Jha', email: 'p.jha@lenovo.com', phone: '9988776600', website: 'lenovo.com', area: 'North', region: 'Delhi NCR', accountManager: 'Sunita Sharma', accountManagerStatus: 'Active' },
    { id: 'oem7', name: 'IBM', contactPerson: 'Ritu Verma', email: 'ritu.verma@ibm.com', phone: '9988775599', website: 'ibm.com', area: 'West', region: 'Pune' },
    { id: 'oem8', name: 'Samsung Electronics', contactPerson: 'Ken Choi', email: 'ken.choi@samsung.com', phone: '9988775588', website: 'samsung.com/in', area: 'All India', region: 'All India' },
    { id: 'oem9', name: 'Adobe Inc.', contactPerson: 'Shantanu Narayen', email: 'snarayen@adobe.com', phone: '9988775577', website: 'adobe.com/in', area: 'All India', region: 'All India' },
    { id: 'oem10', name: 'VMware', contactPerson: 'Sanjay Poonen', email: 's.poonen@vmware.com', phone: '9988775566', website: 'vmware.com', area: 'South', region: 'Bangalore', accountManager: 'Rakesh Verma', accountManagerStatus: 'Inactive' },
];

const MOCK_PRODUCTS = [
    { id: 'prod_1', name: 'High-Speed Barcode Printer X500', documents: [ { id: 'doc_prod_1a', name: 'X500 Brochure.pdf', url: '#', type: TenderDocumentType.ProductBrochure, mimeType: 'application/pdf', uploadedAt: '2023-09-01T10:00:00Z', uploadedById: 'user1' }, { id: 'doc_prod_1b', name: 'M Intergraph Auth Cert.pdf', url: '#', type: TenderDocumentType.AuthorizationCertificate, mimeType: 'application/pdf', uploadedAt: '2023-09-01T10:00:00Z', uploadedById: 'user1' } ] },
    { id: 'prod_2', name: 'Enterprise Cloud Service Tier-3', documents: [ { id: 'doc_prod_2a', name: 'Cloud Service SLA.pdf', url: '#', type: TenderDocumentType.CaseStudy, mimeType: 'application/pdf', uploadedAt: '2023-08-15T10:00:00Z', uploadedById: 'user1' } ] },
    { id: 'prod_3', name: 'Network Security Firewall Appliance Z9', documents: [ { id: 'doc_prod_3a', name: 'Z9 Tech Specs.pdf', url: '#', type: TenderDocumentType.TechnicalCompliance, mimeType: 'application/pdf', uploadedAt: '2023-10-01T10:00:00Z', uploadedById: 'user5' }] },
    { id: 'prod_4', name: 'Data Center Rack Server M-Series', documents: [ { id: 'doc_prod_4a', name: 'M-Series Datasheet.pdf', url: '#', type: TenderDocumentType.ProductBrochure, mimeType: 'application/pdf', uploadedAt: '2023-11-20T10:00:00Z', uploadedById: 'user5' } ] },
    { id: 'prod_5', name: 'Unified Communications Software Suite', documents: [] },
    { id: 'prod_6', name: 'Ruggedized Laptop for Field Work', documents: [ { id: 'doc_prod_6a', name: 'Rugged Laptop Brochure.pdf', url: '#', type: TenderDocumentType.ProductBrochure, mimeType: 'application/pdf', uploadedAt: '2024-01-10T10:00:00Z', uploadedById: 'user2' } ] },
    { id: 'prod_7', name: 'AI-Powered Analytics Platform', documents: [ { id: 'doc_prod_7a', name: 'AI Platform Case Study.pdf', url: '#', type: TenderDocumentType.CaseStudy, mimeType: 'application/pdf', uploadedAt: '2024-02-01T10:00:00Z', uploadedById: 'user5' } ] },
    { id: 'prod_8', name: 'VoIP Phone System - 100 User Pack', documents: [] },
    { id: 'prod_9', name: 'Secure Document Management System', documents: [] },
    { id: 'prod_10', name: 'Managed Print Services', documents: [ { id: 'doc_prod_10a', name: 'MPS Overview.pdf', url: '#', type: TenderDocumentType.ProductBrochure, mimeType: 'application/pdf', uploadedAt: '2024-03-01T10:00:00Z', uploadedById: 'user2' } ] },
];

const MOCK_TENDERS = [
  { id: 'ten1', title: 'Supply of Barcode Printers', department: 'Procurement Wing', clientName: 'Ministry of Defence', clientId: 'cli1', status: TenderStatus.Won, workflowStage: BidWorkflowStage.Complete, deadline: '2024-06-30T17:00:00Z', openingDate: '2024-07-01T11:00:00Z', value: 4800000, description: 'Tender for the supply and installation of 408 high-speed barcode printers for various depots.', assignedTo: ['user2'], history: [], tenderNumber: 'GEM/2024/B/12345', jurisdiction: 'GeM', source: 'GeM Portal', oemId: 'oem1', productId: 'prod_1', itemCategory: 'Barcode Printer', totalQuantity: 408, pastPerformance: "3 Years", minAvgTurnover: "24 Lakhs", emdAmount: 96000, epbgPercentage: 3, epbgDuration: 38, cost: 3500000, amountPaid: 4800000, paymentStatus: PaymentStatus.Paid, documents: [] },
  { id: 'ten2', title: 'Cloud Services for NIC Data Center', department: 'IT Infrastructure', clientName: 'National Informatics Centre', clientId: 'cli2', status: TenderStatus.UnderReview, workflowStage: BidWorkflowStage.UnderTechnicalEvaluation, deadline: '2024-08-15T17:00:00Z', value: 7500000, description: 'Provision of Tier-3 equivalent cloud computing services for a period of 3 years.', assignedTo: ['user5', 'user2'], assignmentResponses: { 'user5': { status: AssignmentStatus.Accepted, notes: 'Looks like a good opportunity for our cloud services.' }, 'user2': { status: AssignmentStatus.Pending }}, history: [], tenderNumber: 'NIC/2024/CS/002', source: 'eProc Portals', oemId: 'oem4', productId: 'prod_2', itemCategory: 'Cloud Services', documents: [] },
  { id: 'ten3', title: 'Network Upgrade for SBI Branches', department: 'IT Networking', clientName: 'State Bank of India', clientId: 'cli3', status: TenderStatus.Drafting, workflowStage: BidWorkflowStage.Identification, deadline: '2024-09-01T17:00:00Z', value: 12000000, description: 'Supply and installation of enterprise-grade network switches and routers for 50 branches.', assignedTo: ['user2'], assignmentResponses: { 'user2': { status: AssignmentStatus.Pending }}, history: [], source: 'Cold Calling' },
  { id: 'ten4', title: 'Purchase of Ruggedized Laptops', department: 'Field Operations', clientName: 'Bharat Heavy Electricals Limited', clientId: 'cli4', status: TenderStatus.Lost, workflowStage: BidWorkflowStage.Negotiation, deadline: '2024-07-20T17:00:00Z', value: 2500000, description: 'Tender for 50 ruggedized laptops for field engineers.', assignedTo: ['user6'], history: [], reasonForLoss: 'Price', reasonForLossNotes: 'Competitor quoted 15% lower price.', oemId: 'oem2', productId: 'prod_6', tenderNumber: 'BHEL/2024/L/089' },
  { id: 'ten5', title: 'AI Analytics Platform License', department: 'Digital Transformation', clientName: 'HCL Technologies', clientId: 'cli5', status: TenderStatus.Submitted, workflowStage: BidWorkflowStage.Submission, deadline: '2024-08-25T17:00:00Z', value: 8000000, description: '5-year enterprise license for an AI-powered data analytics platform.', assignedTo: ['user5'], assignmentResponses: { 'user5': { status: AssignmentStatus.Accepted, notes: 'Ready to take the lead on this.' }}, history: [], oemId: 'oem7', productId: 'prod_7', tenderFee: { amount: 5000, mode: 'Online', submittedDate: '2024-08-24T10:00:00Z'}, emd: { type: 'EMD', amount: 160000, mode: 'BG', submittedDate: '2024-08-24T10:00:00Z', expiryDate: '2025-02-28T10:00:00Z', refundStatus: EMDStatus.Requested } },
  { id: 'ten6', title: 'Healthcare IT System Upgrade', department: 'IT', clientName: 'AIIMS, New Delhi', clientId: 'cli7', status: TenderStatus.Dropped, workflowStage: BidWorkflowStage.Review, deadline: '2024-09-10T17:00:00Z', value: 30000000, description: 'Comprehensive upgrade of Hospital Management Information System (HMIS).', assignedTo: ['user2', 'user5'], history: [] },
  { id: 'ten7', title: 'Annual Maintenance Contract for Servers', department: 'Infrastructure', clientName: 'Indian Oil Corporation Ltd', clientId: 'cli9', status: TenderStatus.Won, workflowStage: BidWorkflowStage.Complete, deadline: '2024-06-15T17:00:00Z', value: 4000000, description: 'AMC for Dell and HP servers across North India offices.', assignedTo: ['user6'], history: [], cost: 2800000, pbg: { type: 'PBG', amount: 400000, status: PBGStatus.Active, mode: 'BG', issuingBank: 'HDFC Bank', submittedDate: '2024-07-01T12:00:00Z', expiryDate: '2025-07-31T12:00:00Z'}},
  { id: 'ten8', title: 'VoIP System for Corporate Office', department: 'Telecom', clientName: 'Reliance Retail', clientId: 'cli10', status: TenderStatus.UnderReview, workflowStage: BidWorkflowStage.UnderFinancialEvaluation, deadline: '2024-08-30T17:00:00Z', value: 1500000, description: 'Installation of a 100-user VoIP phone system.', assignedTo: ['user6'], history: [], productId: 'prod_8', oemId: 'oem3' },
  { id: 'ten9', title: 'Procurement of Network Firewalls', department: 'Cyber Security', clientName: 'Ministry of Defence', clientId: 'cli1', status: TenderStatus.Submitted, workflowStage: BidWorkflowStage.Submission, deadline: '2024-09-05T17:00:00Z', value: 6500000, description: 'Supply of next-generation firewalls for data center.', assignedTo: ['user2'], history: [], productId: 'prod_3', oemId: 'oem3' },
  { id: 'ten10', title: 'Document Management System', department: 'Admin', clientName: 'Delhi University', clientId: 'cli8', status: TenderStatus.Drafting, workflowStage: BidWorkflowStage.Identification, deadline: '2024-09-20T17:00:00Z', value: 2200000, description: 'Cloud-based secure document management and archival system.', assignedTo: [], history: [], productId: 'prod_9' },
];

const MOCK_FINANCIAL_REQUESTS = [
    { id: 'finreq1', tenderId: 'ten2', type: FinancialRequestType.EMD_BG, amount: 150000, status: FinancialRequestStatus.Approved, requestedById: 'user2', requestDate: '2024-08-10T10:00:00Z', approverId: 'user3', approvalDate: '2024-08-11T14:00:00Z' },
    { id: 'finreq2', tenderId: 'ten5', type: FinancialRequestType.EMD_BG, amount: 160000, status: FinancialRequestStatus.Processed, requestedById: 'user5', requestDate: '2024-08-20T11:00:00Z', approverId: 'user7', approvalDate: '2024-08-21T09:00:00Z', instrumentDetails: { mode: 'BG', processedDate: '2024-08-22T15:00:00Z', issuingBank: 'ICICI Bank', expiryDate: '2025-03-01T00:00:00Z' } },
    { id: 'finreq3', tenderId: 'ten5', type: FinancialRequestType.TenderFee, amount: 5000, status: FinancialRequestStatus.Processed, requestedById: 'user5', requestDate: '2024-08-20T11:05:00Z', approverId: 'user7', approvalDate: '2024-08-21T09:00:00Z', instrumentDetails: { mode: 'Online', processedDate: '2024-08-21T10:00:00Z' } },
    { id: 'finreq4', tenderId: 'ten8', type: FinancialRequestType.EMD_BG, amount: 30000, status: FinancialRequestStatus.PendingApproval, requestedById: 'user6', requestDate: '2024-08-28T16:00:00Z' },
    { id: 'finreq5', tenderId: 'ten9', type: FinancialRequestType.EMD_BG, amount: 130000, status: FinancialRequestStatus.PendingApproval, requestedById: 'user2', requestDate: '2024-09-01T12:00:00Z' },
    { id: 'finreq6', tenderId: 'ten7', type: FinancialRequestType.PBG, amount: 400000, status: FinancialRequestStatus.Processed, requestedById: 'user6', requestDate: '2024-06-20T10:00:00Z', approverId: 'user3', approvalDate: '2024-06-21T11:00:00Z', instrumentDetails: { mode: 'BG', processedDate: '2024-06-25T14:00:00Z', issuingBank: 'HDFC Bank', expiryDate: '2025-07-31T12:00:00Z' } },
    { id: 'finreq7', tenderId: 'ten1', type: FinancialRequestType.PBG, amount: 144000, status: FinancialRequestStatus.Approved, requestedById: 'user2', requestDate: '2024-06-25T10:00:00Z', approverId: 'user7', approvalDate: '2024-06-26T11:00:00Z' },
    { id: 'finreq8', tenderId: 'ten4', type: FinancialRequestType.EMD_BG, amount: 50000, status: FinancialRequestStatus.Declined, requestedById: 'user6', requestDate: '2024-07-15T10:00:00Z', approverId: 'user3', approvalDate: '2024-07-16T11:00:00Z', rejectionReason: 'Tender value too low for priority processing.' },
    { id: 'finreq9', tenderId: 'ten1', type: FinancialRequestType.EMD_Online, amount: 96000, status: FinancialRequestStatus.Refunded, requestedById: 'user2', requestDate: '2024-06-20T10:00:00Z', approverId: 'user3', approvalDate: '2024-06-21T11:00:00Z', instrumentDetails: { mode: 'Online', processedDate: '2024-06-22T10:00:00Z' } },
    { id: 'finreq10', tenderId: 'ten2', type: FinancialRequestType.Other, amount: 10000, status: FinancialRequestStatus.PendingApproval, requestedById: 'user5', requestDate: '2024-08-12T15:00:00Z', notes: 'Pre-bid meeting travel expenses' },
];

const MOCK_BIDDING_TEMPLATES = [
    { id: 'temp1', name: 'Standard Cover Letter', content: `To,\nThe Procurement Officer,\n{{client.name}},\n{{client.department}}\n\nSubject: Submission of bid for "{{tender.title}}" (Tender No: {{tender.tenderNumber}})\n\nDear Sir/Madam,\n\nWith reference to the above tender, we are pleased to submit our proposal for your kind consideration.\n\nThank you,\n{{currentUser.name}}\nM Intergraph` },
    { id: 'temp2', name: 'Authorization Letter', content: `To Whom It May Concern,\n\nThis is to certify that M/s M Intergraph is an authorized partner for {{tender.oemName || 'our products'}} and is authorized to quote, negotiate, and conclude a contract with you for the above products.\n\nWe assure you of our full support and guarantee for the successful execution of the contract.\n\nSincerely,\n[OEM Contact Person]\n{{tender.oemName}}` },
    { id: 'temp3', name: 'Pre-Bid Query Format', content: `Subject: Pre-Bid Queries for Tender No: {{tender.tenderNumber}}\n\nDear Sir/Madam,\n\nFollowing are our queries regarding the subject tender:\n\n1. [Query 1]\n2. [Query 2]\n\nWe request you to provide clarifications on the above points.\n\nRegards,\n{{currentUser.name}}` },
];

module.exports = {
    MOCK_DEPARTMENTS, MOCK_DESIGNATIONS, MOCK_USERS, MOCK_CLIENTS,
    MOCK_OEMS, MOCK_PRODUCTS, MOCK_TENDERS, MOCK_FINANCIAL_REQUESTS,
    MOCK_BIDDING_TEMPLATES
};
