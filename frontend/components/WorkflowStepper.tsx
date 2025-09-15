import React from 'react';
import { Tender, BidWorkflowStage, User } from '../types';
import { CheckCircleIcon, ArrowLeftIcon } from '../constants';

const ALL_STAGES = Object.values(BidWorkflowStage);

const CheckIcon = () => (
    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

interface WorkflowStepperProps {
  tender: Tender;
  onUpdateTender: (tender: Tender) => void;
  currentUser: User;
}

const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ tender, onUpdateTender, currentUser }) => {
  const currentStageIndex = ALL_STAGES.indexOf(tender.workflowStage);

  const handleAdvanceStage = () => {
    if (currentStageIndex < ALL_STAGES.length - 1) {
      const nextStage = ALL_STAGES[currentStageIndex + 1];
      const newHistoryEntry = {
          userId: currentUser.id,
          user: currentUser.name,
          action: 'Advanced Workflow Stage',
          timestamp: new Date().toISOString(),
          details: `Stage advanced from ${tender.workflowStage} to ${nextStage}.`
      };
      onUpdateTender({ ...tender, workflowStage: nextStage, history: [...(tender.history || []), newHistoryEntry] });
    }
  };

  const handleGoBack = () => {
    if (currentStageIndex > 0) {
      const prevStage = ALL_STAGES[currentStageIndex - 1];
      const newHistoryEntry = {
          userId: currentUser.id,
          user: currentUser.name,
          action: 'Reverted Workflow Stage',
          timestamp: new Date().toISOString(),
          details: `Stage reverted from ${tender.workflowStage} to ${prevStage}.`
      };
      onUpdateTender({ ...tender, workflowStage: prevStage, history: [...(tender.history || []), newHistoryEntry] });
    }
  };
  
  const handleStageClick = (index: number) => {
    const clickedStage = ALL_STAGES[index];
    if (clickedStage !== tender.workflowStage) {
      const newHistoryEntry = {
        userId: currentUser.id,
        user: currentUser.name,
        action: 'Manually Set Workflow Stage',
        timestamp: new Date().toISOString(),
        details: `Stage changed from ${tender.workflowStage} to ${clickedStage}.`
      };
      onUpdateTender({ ...tender, workflowStage: clickedStage, history: [...(tender.history || []), newHistoryEntry] });
    }
  };


  return (
    <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-8">Bid Management Workflow</h3>
        
        <div className="w-full">
            <ol className="flex items-start">
                {ALL_STAGES.map((stage, index) => {
                    const isCompleted = index < currentStageIndex;
                    const isCurrent = index === currentStageIndex;
                    const isLineActive = index <= currentStageIndex;

                    return (
                        <li key={stage} className="relative flex-1 group cursor-pointer" onClick={() => handleStageClick(index)} title={stage}>
                            <div className="flex flex-col items-center">
                                {/* Connector Line */}
                                {index > 0 && (
                                    <div className={`absolute top-[14px] right-1/2 w-full h-0.5 transition-colors duration-300 ${isLineActive ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                )}
                                
                                {/* Stage Node */}
                                <div className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10
                                    ${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-indigo-600 ring-4 ring-indigo-500/30' : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600'}`
                                }>
                                    {isCompleted ? <CheckIcon /> : (
                                      isCurrent ? <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> : <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{index + 1}</span>
                                    )}
                                </div>
                                
                                {/* Label */}
                                <p className={`mt-2 text-center text-xs min-h-12 flex items-center justify-center
                                    ${isCurrent ? 'font-bold text-indigo-600 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'}`
                                }>
                                    {stage}
                                </p>
                            </div>
                        </li>
                    )
                })}
            </ol>
        </div>

        <div className="mt-6 flex justify-center items-center space-x-4">
            {currentStageIndex > 0 && (
                <button
                    onClick={handleGoBack}
                    className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors flex items-center"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Go Back
                </button>
            )}
            {tender.workflowStage !== BidWorkflowStage.Complete && (
                <button
                    onClick={handleAdvanceStage}
                    className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center"
                >
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Mark as Complete & Advance to Next Stage
                </button>
            )}
        </div>
    </div>
  );
};

export default WorkflowStepper;