import React from 'react';
import { ValidationStep } from '../lib/scriptValidator';
import { Check, AlertCircle, ArrowRight } from 'lucide-react';

interface ValidationStepsProps {
  steps: ValidationStep[];
  currentStep: number;
}

export const ValidationSteps: React.FC<ValidationStepsProps> = ({ steps, currentStep }) => {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`
            p-4 rounded-lg transition-all
            ${index === currentStep 
              ? 'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-200 dark:border-indigo-800'
              : step.isComplete
                ? 'bg-green-50 dark:bg-green-900/30'
                : 'bg-gray-50 dark:bg-gray-800/30'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${step.isComplete
                ? 'bg-green-100 dark:bg-green-900/50'
                : index === currentStep
                  ? 'bg-indigo-100 dark:bg-indigo-900/50'
                  : 'bg-gray-100 dark:bg-gray-800/50'
              }
            `}>
              {step.isComplete ? (
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : index === currentStep ? (
                <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <span className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className={`
                font-medium
                ${step.isComplete
                  ? 'text-green-800 dark:text-green-200'
                  : index === currentStep
                    ? 'text-indigo-800 dark:text-indigo-200'
                    : 'text-gray-800 dark:text-gray-200'
                }
              `}>
                {step.label}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {step.description}
              </p>
            </div>

            {step.error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{step.error}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};