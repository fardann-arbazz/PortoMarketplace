import { Check } from "lucide-react";

interface Step {
  label: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({
  steps,
  currentStep,
}: StepIndicatorProps) {
  return (
    <div className="flex items-start gap-0">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.label} className="flex-1 flex items-start">
            <div className="flex flex-col items-center flex-1">
              {/* Circle + Line */}
              <div className="flex items-center w-full">
                {/* Line before (hidden for first) */}
                {index > 0 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      index <= currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
                {/* Circle */}
                <div
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-all ${
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary bg-primary/10 text-primary ring-4 ring-primary/20"
                        : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {/* Line after (hidden for last) */}
                {!isLast && (
                  <div
                    className={`h-0.5 flex-1 ${
                      index < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
              {/* Label */}
              <span
                className={`mt-2 text-center text-xs font-medium leading-tight transition-colors ${
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              <span className="text-center text-[10px] text-muted-foreground leading-tight mt-0.5">
                {step.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
