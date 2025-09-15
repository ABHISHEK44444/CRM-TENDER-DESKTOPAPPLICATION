


import { GoogleGenAI } from "@google/genai";
import { ChecklistItem, ImportedTenderData, BidWorkflowStage, Client, Tender } from '../types';


const GEMINI_API_KEY = import.meta.env.VITE_API_KEY;
if (!GEMINI_API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will not be available.");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || '' });

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export const extractTenderDetailsFromDocument = async (file: File): Promise<ImportedTenderData> => {
    if (!GEMINI_API_KEY) {
        throw new Error("AI processing is disabled. Please configure your API_KEY.");
    }
    
    const imagePart = await fileToGenerativePart(file);

    const prompt = `
        You are an expert government tender document processor for a company named M Intergraph. Analyze the provided tender document image and extract the following information in a structured JSON format.
        Be meticulous and find the value for each key by looking for its corresponding label in the document. If a value is not found for any field, use null for that field.

        **MOST IMPORTANT RULE: DATE & TIME PARSING**
        - THE DATE FORMAT IN THE DOCUMENT IS ALWAYS **DD-MM-YYYY** (Day-Month-Year).
        - YOU **MUST** PARSE '06-01-2025' AS **JANUARY 6th, 2025**.
        - IT IS **INCORRECT** TO PARSE '06-01-2025' AS JUNE 1st, 2025.
        - Your final output for date-time fields must be a single string in the format 'YYYY-MM-DDTHH:mm:ss'. This represents the **LOCAL TIME** from the document.
        - **DO NOT** include timezone information like 'Z' or '+05:30' in the output string.
        - **Example**: A document showing "Bid End Date/Time: 06-01-2025 13:00:00" MUST become "deadline": "2025-01-06T13:00:00".

        **Extraction Rules:**
        - **tenderNumber**: Find "Bid Number/बोली क्रमांक".
        - **jurisdiction**: Use "Ministry/State Name". If the document has a "GeM Government e Marketplace" logo, the primary jurisdiction is "GeM".
        - **title**: Create a concise summary like "Supply of [Total Quantity] [Item Category]", e.g., "Supply of 408 bar code printer (Q2)".
        - **department**: Find "Department Name/विभाग का नाम".
        - **clientName**: Find "Organisation Name / संगठन का नाम".
        - **deadline**: Find "Bid End Date/Time" and parse it according to the date and time parsing rules above.
        - **openingDate**: Find "Bid Opening Date/Time" and parse it according to the date and time parsing rules above.
        - **value**: Search for 'Estimated Bid Value'. If a clear monetary value for the entire tender is found, parse it as a number. Often, this is not specified; in that case, use null.
        - **totalQuantity**: Find "Total Quantity/कुल मात्रा". Return only the number (e.g., 408).
        - **itemCategory**: Find "Item Category/मद केटेगरी".
        - **minAvgTurnover**: Find "Minimum Average Annual Turnover of the bidder". Return the raw string (e.g., "24 Lakh (s)").
        - **oemAvgTurnover**: Find "OEM Average Turnover (Last 3 Years)". Return the raw string (e.g., "192 Lakh (s)").
        - **pastPerformance**: Find "Past Performance" or "Experience Criteria".
            - **CRITICAL RULE**: Extract **ONLY** the primary summarized value, like a percentage or a number of years. Do **NOT** include any surrounding descriptive text.
            - **Negative Example (Incorrect)**: If the document says "Past Performance: 10% of at least one work of similar nature", extracting \`{"pastPerformance": "10% of at least one work of similar nature"}\` is WRONG.
            - **Positive Example (Correct)**: If the document says "Past Performance: 10% of at least one work of similar nature", you MUST extract \`{"pastPerformance": "10%"}\`.
            - **Positive Example (Correct)**: If the document says "Experience Criteria: 3 Years of experience in supplying similar items", you MUST extract \`{"pastPerformance": "3 Years"}\`.
        - **emdAmount**: Find "EMD Amount/ईएमडी राशि". Parse into a number (e.g., 96000).
        - **epbgPercentage**: Find "ePBG Percentage(%)". Return only the number (e.g., 3.00).
        - **epbgDuration**: Find "Duration of ePBG required (Months)". Return only the number (e.g., 38).
        - **description**: Use the text from "Item Category/मद केटेगरी" for this field.
        - **mseExemption**: Find "MSE Exemption for Years of Experience and Turnover". Parse "Yes" as true, "No" as false. If not found, use null.
        - **startupExemption**: Find "Startup Exemption for Years of Experience and Turnover". Parse "Yes" as true, "No" as false. If not found, use null.
        - **sellerRequiredDocuments**: Find "/Document required from seller".
            - **CRITICAL RULE**: Extract all listed documents as a **JSON array of strings**. Look for delimiters like asterisks (*) or new lines to separate each document requirement into its own string in the array.
            - **Negative Example (Incorrect)**: If the document lists "*Certificates regarding reservation benefits* *Registration Certificates*", extracting \`{"sellerRequiredDocuments": "*Certificates regarding reservation benefits* *Registration Certificates*"}\` as a single string is WRONG.
            - **Positive Example (Correct)**: If the document lists "*Certificates regarding reservation benefits* *Registration Certificates*", you MUST extract \`{"sellerRequiredDocuments": ["Certificates regarding reservation benefits", "Registration Certificates"]}\`.
        
        Return ONLY the raw JSON object. Do not wrap it in markdown backticks or provide any explanation.

        JSON structure to follow:
        {
          "tenderNumber": "string | null",
          "jurisdiction": "string | null",
          "title": "string | null",
          "department": "string | null",
          "clientName": "string | null",
          "deadline": "string | null",
          "openingDate": "string | null",
          "value": "number | null",
          "totalQuantity": "number | null",
          "itemCategory": "string | null",
          "minAvgTurnover": "string | null",
          "oemAvgTurnover": "string | null",
          "pastPerformance": "string | null",
          "emdAmount": "number | null",
          "epbgPercentage": "number | null",
          "epbgDuration": "number | null",
          "description": "string | null",
          "mseExemption": "boolean | null",
          "startupExemption": "boolean | null",
          "sellerRequiredDocuments": "string[] | null"
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                thinkingConfig: { thinkingBudget: 0 },
            }
        });

        // FIX: Access the 'text' property directly from the response object.
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        return JSON.parse(jsonStr) as ImportedTenderData;

    } catch (error) {
        console.error("Error extracting tender details with Gemini API:", error);
        throw new Error("Failed to analyze the document. The document might be unreadable or the format is not supported.");
    }
};


export const analyzeTender = async (description: string): Promise<any> => {
    if (!GEMINI_API_KEY) {
        return Promise.resolve({ error: "AI analysis is disabled. Please configure your API_KEY." });
    }

    const prompt = `
        You are an expert tender analyst for M Intergraph. Analyze the following tender description and provide a concise, structured analysis in JSON format.

        Tender Description:
        ---
        ${description}
        ---

        Return ONLY a raw JSON object with the following structure. Do not wrap it in markdown backticks.
        {
          "summary": "A brief, one-paragraph summary of the project and the client's core need.",
          "requirements": ["A list of the 5 most critical technical, operational, or compliance requirements."],
          "risks": ["A list of 3 potential risks or challenges (e.g., tight deadline, unclear scope)."],
          "successFactors": ["A list of 3 factors critical for winning and successfully delivering this project."]
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        // FIX: Access the 'text' property directly from the response object.
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error analyzing tender with Gemini API:", error);
        return { error: "An error occurred during AI analysis. Please check the console for details." };
    }
};

export const generateStageChecklist = async (description: string, stage: BidWorkflowStage): Promise<ChecklistItem[]> => {
    if (!GEMINI_API_KEY) {
        console.warn("AI checklist generation is disabled. Please configure your API_KEY.");
        return Promise.resolve([]);
    }

    const prompt = `
        You are an expert bid manager for M Intergraph. Based on the tender description and the current workflow stage, generate a JSON array of checklist items.
        Each item must be a clear, actionable task relevant to the specified stage.
        The JSON output must be an array of objects, where each object has a "text" property (string).
        
        Example format: [{"text": "Submit financial statements for the last 3 years."}, {"text": "Confirm ISO 27001 certification."}]

        Tender Description:
        ---
        ${description}
        ---

        Current Workflow Stage:
        ---
        ${stage}
        ---

        Return ONLY the JSON array. Do not include any other text, explanation, or markdown formatting like \`\`\`json.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        // FIX: Access the 'text' property directly from the response object.
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const parsedData = JSON.parse(jsonStr);

        if (Array.isArray(parsedData)) {
            // Validate that items have a 'text' property
            return parsedData
                .filter(item => typeof item === 'object' && item !== null && typeof item.text === 'string')
                .map((item, index) => ({
                    id: `chk-${Date.now()}-${index}`,
                    text: item.text,
                    completed: false,
                }));
        }
        
        console.error("AI response for checklist was not a valid array:", parsedData);
        return [];

    } catch (error) {
        console.error("Error generating checklist with Gemini API:", error);
        return [];
    }
};

export const summarizeClientActivity = async (client: Client, tenders: Tender[]): Promise<{ strategicSummary: string; actionableSuggestions: string[] }> => {
    if (!GEMINI_API_KEY) {
        throw new Error("AI analysis is disabled. Please configure your API_KEY.");
    }

    const clientDataForPrompt = {
        profile: { name: client.name, industry: client.industry, status: client.status, joinedDate: client.joinedDate, notes: client.notes },
        tenderHistory: tenders.map(t => ({ title: t.title, status: t.status, value: t.value, reasonForLoss: t.reasonForLoss, itemCategory: t.itemCategory })),
        interactionSummary: (client.interactions || []).slice(0, 3).map(i => i.notes).join('; ')
    };

    const prompt = `
        You are a sharp, concise business analyst for M Intergraph. Analyze the provided client data and return a JSON object with a strategic summary and actionable suggestions. Be insightful and focus on business growth.

        Data:
        \`\`\`json
        ${JSON.stringify(clientDataForPrompt, null, 2)}
        \`\`\`

        Return ONLY the raw JSON object with this exact structure:
        {
          "strategicSummary": "A one-paragraph summary of the client relationship, their value, and our current standing.",
          "actionableSuggestions": ["A list of 3-4 concrete, forward-looking suggestions for the account manager."]
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        // FIX: Access the 'text' property directly from the response object.
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error generating client summary with Gemini API:", error);
        throw new Error("Failed to generate AI summary.");
    }
};

export const checkEligibility = async (tenderText: string): Promise<{criteria: {criterion: string; details: string; met: 'Yes' | 'No' | 'Partial' | 'N/A'}[], summary: string}> => {
     if (!GEMINI_API_KEY) {
        throw new Error("AI processing is disabled. Please configure your API_KEY.");
    }
    
    const prompt = `
        You are an expert tender eligibility analyst for M Intergraph. Your company's profile is:
        - Annual Turnover: 250 Lakhs
        - Years in Business: 5
        - Key Certifications: ISO 9001, ISO 27001
        
        Analyze the following tender text to determine eligibility. Extract key criteria, compare them against the company profile, and provide a clear summary.

        Tender Text:
        ---
        ${tenderText}
        ---

        Return ONLY a raw JSON object with the following structure. Do not use markdown.
        - For the 'met' field, use 'Yes' if our company profile clearly meets the requirement, 'No' if it does not, 'Partial' if it's close or ambiguous, and 'N/A' if it's a non-binary requirement (e.g., a required document).

        JSON structure:
        {
          "criteria": [
            { "criterion": "Minimum Average Annual Turnover", "details": "e.g., '200 Lakhs'", "met": "Yes | No | Partial | N/A" },
            { "criterion": "Past Experience", "details": "e.g., '3 years in similar projects'", "met": "Yes | No | Partial | N/A" },
            { "criterion": "Required Certifications", "details": "e.g., 'ISO 9001'", "met": "Yes | No | Partial | N/A" },
            { "criterion": "EMD Amount", "details": "e.g., '50,000 INR'", "met": "N/A" }
          ],
          "summary": "A brief, one-paragraph summary of our eligibility, highlighting any critical showstoppers or points that need immediate attention."
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        // FIX: Access the 'text' property directly from the response object.
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error checking eligibility with Gemini API:", error);
        throw new Error("Failed to run AI eligibility check. Please try again.");
    }
};

export const generateReportSummary = async (data: any): Promise<string> => {
     if (!GEMINI_API_KEY) {
        throw new Error("AI processing is disabled. Please configure your API_KEY.");
    }
    
    const prompt = `
        You are a senior business analyst for M Intergraph. You have been provided with the following business intelligence data for the last period.
        
        Data:
        \`\`\`json
        ${JSON.stringify(data, null, 2)}
        \`\`\`

        Based on this data, write a concise, professional, one-paragraph narrative summary.
        - Start by stating the overall performance (e.g., "Performance this period was strong...").
        - Highlight the most significant KPI (e.g., "...driven by a high win rate of X%...").
        - Point out one key strength (e.g., "The team shows exceptional performance in the 'Y' category.").
        - Identify one area for improvement (e.g., "However, the 'Z' tender source has a low success rate and may need strategic review.").
        - Conclude with a forward-looking statement.

        Return ONLY the summary paragraph as a single string. Do not use markdown.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        // FIX: Access the 'text' property directly from the response object.
        return response.text;
    } catch (error) {
        console.error("Error generating report summary with Gemini API:", error);
        throw new Error("Failed to generate AI report summary.");
    }
};