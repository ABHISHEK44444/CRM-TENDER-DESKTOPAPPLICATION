const mongoose = require('mongoose');
const { Schema } = mongoose;

const FinancialRecordSchema = new mongoose.Schema({
    amount: Number,
    mode: { type: String, enum: ['DD', 'BG', 'Online', 'Cash', 'N/A'] },
    submittedDate: String,
    documentUrl: String
}, { _id: false });

const EMDSchema = new mongoose.Schema({ ...FinancialRecordSchema.obj,
    type: { type: String, default: 'EMD' },
    expiryDate: String,
    refundStatus: { type: String, enum: ['Pending', 'Requested', 'Under Process', 'Refunded', 'Forfeited', 'Expired'] }
}, { _id: false });

const PBGSchema = new mongoose.Schema({ ...FinancialRecordSchema.obj,
    type: { type: String, default: 'PBG' },
    issuingBank: String,
    expiryDate: String,
    status: { type: String, enum: ['Active', 'Expired', 'Released'] }
}, { _id: false });

const TenderFeeSchema = FinancialRecordSchema;

const ChecklistItemSchema = new mongoose.Schema({
    id: String,
    text: String,
    completed: Boolean
}, { _id: false });

const TenderHistoryLogSchema = new mongoose.Schema({
    userId: String,
    user: String,
    action: String,
    timestamp: String,
    details: String
}, { _id: false });

const NegotiationDetailsSchema = new mongoose.Schema({
    initialOffer: Number,
    counterOffer: Number,
    finalPrice: Number,
    notes: String,
    participatedInRA: Boolean,
    raNotes: String
}, { _id: false });

const CompetitorSchema = new mongoose.Schema({
    name: String,
    price: Number,
    notes: String
}, { _id: false });

const TenderDocumentSchema = new mongoose.Schema({
    id: String,
    name: String,
    url: String,
    type: String,
    mimeType: String,
    uploadedAt: String,
    uploadedById: String
}, { _id: false });

const AssignmentResponseSchema = new mongoose.Schema({
    status: { type: String, enum: ['Pending', 'Accepted', 'Declined'] },
    notes: String,
    respondedAt: String
}, { _id: false });

const ProcessStageLogSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    timestamp: String,
    action: String
}, { _id: false });

const ProcessStageSchema = new mongoose.Schema({
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Skipped'] },
    notes: String,
    documents: [TenderDocumentSchema],
    history: [ProcessStageLogSchema],
    updatedAt: String,
    updatedById: String
}, { _id: false });


const TenderSchema = new Schema({
    id: { type: String, required: true, unique: true },
    tenderNumber: String,
    jurisdiction: String,
    title: { type: String, required: true },
    department: String,
    clientName: String,
    clientId: { type: String, ref: 'Client' },
    status: { type: String },
    workflowStage: { type: String },
    deadline: String,
    openingDate: String,
    value: Number,
    description: String,
    assignedTo: [{ type: String, ref: 'User' }],
    assignmentResponses: { type: Map, of: AssignmentResponseSchema },
    history: [TenderHistoryLogSchema],
    checklists: { type: Map, of: [ChecklistItemSchema] },
    tenderFee: TenderFeeSchema,
    emd: EMDSchema,
    pbg: PBGSchema,
    gemFee: {
        amount: Number,
        status: { type: String, enum: ['Pending Indent', 'Indent Raised', 'Paid'] }
    },
    totalQuantity: Number,
    itemCategory: String,
    minAvgTurnover: String,
    oemAvgTurnover: String,
    pastPerformance: String,
    epbgPercentage: Number,
    epbgDuration: Number,
    emdAmount: Number,
    source: String,
    oemId: { type: String, ref: 'OEM' },
    productId: { type: String, ref: 'Product' },
    preBidMeetingNotes: String,
    contractStatus: { type: String, enum: ['Drafting', 'Signed', 'Expired'] },
    paymentStatus: { type: String, enum: ['Pending', 'Partially Paid', 'Paid'] },
    negotiationDetails: NegotiationDetailsSchema,
    competitors: [CompetitorSchema],
    cost: Number,
    amountPaid: Number,
    liquidatedDamages: Number,
    reasonForLoss: { type: String, enum: ['Price', 'Technical', 'Timeline', 'Relationship', 'Other'] },
    reasonForLossNotes: String,
    pdiStatus: { type: String, enum: ['Not Required', 'Pending', 'Complete'] },
    documents: [TenderDocumentSchema],
    isLOAReceived: Boolean,
    postAwardProcess: { type: Map, of: ProcessStageSchema },
    mseExemption: Boolean,
    startupExemption: Boolean,
    sellerRequiredDocuments: [String]
}, { timestamps: true });

// Add index for sorting performance
TenderSchema.index({ createdAt: -1 });

TenderSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Tender', TenderSchema);
