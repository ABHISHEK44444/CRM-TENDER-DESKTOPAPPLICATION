import { NewTenderData, Tender, NewClientData, Client, Contact, ContactData, InteractionLog, FinancialRequestType, User, NewUserData, OEM, NewOemData, BiddingTemplate, Product, AssignmentStatus, StandardProcessState } from '../types';

export const SERVER_BASE_URL = 'http://localhost:5001';
const API_BASE_URL = `${SERVER_BASE_URL}/api`;

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
    }
    return response.json();
};

// Generic GET
export const getData = (endpoint: string) => fetch(`${API_BASE_URL}${endpoint}`).then(handleResponse);

// Auth
export const login = (username: string, password: string): Promise<User> => {
    return fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    }).then(handleResponse);
};

// Tenders
export const createTender = (data: NewTenderData): Promise<Tender> => {
    return fetch(`${API_BASE_URL}/tenders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
};

export const updateTender = (id: string, data: Partial<Tender>): Promise<Tender> => {
    return fetch(`${API_BASE_URL}/tenders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
};

export const deleteTender = (id: string): Promise<any> => {
    return fetch(`${API_BASE_URL}/tenders/${id}`, { method: 'DELETE' }).then(handleResponse);
};

export const importTender = (data: any): Promise<Tender> => {
     return fetch(`${API_BASE_URL}/tenders/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
};

export const respondToAssignment = (tenderId: string, userId: string, status: AssignmentStatus, notes: string): Promise<Tender> => {
    return fetch(`${API_BASE_URL}/tenders/${tenderId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status, notes }),
    }).then(handleResponse);
};

// Clients
export const createClient = (data: NewClientData): Promise<Client> => {
    return fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
};

export const updateClient = (id: string, data: Partial<Client>, options?: { silent?: boolean }): Promise<Client> => {
    const query = options?.silent ? '?silent=true' : '';
    return fetch(`${API_BASE_URL}/clients/${id}${query}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
};

export const logInteraction = (clientId: string, interaction: Omit<InteractionLog, 'id' | 'user' | 'userId' | 'timestamp'>): Promise<Client> => {
    return fetch(`${API_BASE_URL}/clients/${clientId}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interaction),
    }).then(handleResponse);
};

export const saveContact = (clientId: string, contact: Contact | ContactData): Promise<Client> => {
    const url = 'id' in contact ? `${API_BASE_URL}/clients/${clientId}/contacts/${contact.id}` : `${API_BASE_URL}/clients/${clientId}/contacts`;
    const method = 'id' in contact ? 'PUT' : 'POST';
    return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
    }).then(handleResponse);
};

export const deleteContact = (clientId: string, contactId: string): Promise<Client> => {
    return fetch(`${API_BASE_URL}/clients/${clientId}/contacts/${contactId}`, {
        method: 'DELETE',
    }).then(handleResponse);
};


// Financial Requests
export const createFinancialRequest = (data: any): Promise<any> => {
    return fetch(`${API_BASE_URL}/financial-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
};

export const updateFinancialRequest = (id: string, data: any): Promise<any> => {
    return fetch(`${API_BASE_URL}/financial-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
};

// Users
export const createUser = (data: NewUserData): Promise<User> => {
    return fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
};

export const updateUser = (id: string, data: Partial<User>): Promise<User> => {
    return fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
};

export const deleteUser = (id: string): Promise<any> => {
    return fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' }).then(handleResponse);
};

// OEMs
export const createOem = (data: NewOemData): Promise<OEM> => {
    return fetch(`${API_BASE_URL}/oems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
};

export const updateOem = (id: string, data: Partial<OEM>): Promise<OEM> => {
    return fetch(`${API_BASE_URL}/oems/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
};

// Products
export const getProducts = (): Promise<Product[]> => getData('/products');
export const saveProduct = (product: Product): Promise<Product> => {
    const url = product.id.startsWith('prod_') ? `${API_BASE_URL}/products` : `${API_BASE_URL}/products/${product.id}`;
    const method = product.id.startsWith('prod_') ? 'POST' : 'PUT';
    return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
    }).then(handleResponse);
};
export const deleteProduct = (id: string): Promise<any> => {
    return fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' }).then(handleResponse);
};


// Bidding Templates
export const getBiddingTemplates = (): Promise<BiddingTemplate[]> => getData('/data/templates');
export const saveBiddingTemplate = (template: BiddingTemplate): Promise<BiddingTemplate> => {
    const url = template.id.startsWith('temp_') ? `${API_BASE_URL}/data/templates` : `${API_BASE_URL}/data/templates/${template.id}`;
    const method = template.id.startsWith('temp_') ? 'POST' : 'PUT';
    return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
    }).then(handleResponse);
};
export const deleteBiddingTemplate = (id: string): Promise<any> => {
    return fetch(`${API_BASE_URL}/data/templates/${id}`, { method: 'DELETE' }).then(handleResponse);
};

// Standard Processes
export const getStandardProcessState = (): Promise<StandardProcessState> => getData('/data/processes');

export const updateStandardProcessState = (state: StandardProcessState): Promise<StandardProcessState> => {
    return fetch(`${API_BASE_URL}/data/processes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
    }).then(handleResponse);
};
