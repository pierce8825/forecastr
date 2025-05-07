import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardProps {
  title: string;
  value: number;
  valuePrefix?: string;
  valueSuffix?: string;
  percentChange: number;
  percentPrefix?: string;
  percentSuffix?: string;
  percentLabel?: string;
  progressValue: number;
  progressLabel: string;
  isLoading: boolean;
  valueColor?: string;
  progressColor?: string;
  changeDirection?: 'up' | 'down';
  changeColor?: string;
  changeBgColor?: string;
}

const SummaryCard = ({
  title,
  value,
  valuePrefix = "$",
  valueSuffix = "",
  percentChange,
  percentPrefix = "",
  percentSuffix = "%",
  percentLabel,
  progressValue,
  progressLabel,
  isLoading,
  valueColor = "text-gray-900",
  progressColor = "bg-success",
  changeDirection = "up",
  changeColor = "text-green-800",
  changeBgColor = "bg-green-100"
}: SummaryCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-2 w-full mb-1" />
          <Skeleton className="h-3 w-20 mt-1" />
        </CardContent>
      </Card>
    );
  }

  // Format the value as a human-readable number
  const formattedValue = value.toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1
  });

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${changeBgColor} ${changeColor}`}>
            {percentChange > 0 ? "+" : ""}{percentPrefix}{percentChange}{percentSuffix}{percentLabel ? ` ${percentLabel}` : ""}
          </span>
        </div>
        <p className={`text-2xl font-bold font-tabular ${valueColor}`}>
          {valuePrefix}{formattedValue}{valueSuffix}
        </p>
        <div className="mt-2">
          <Progress value={progressValue} className="h-1.5 bg-gray-100" indicatorClassName={progressColor} />
          <p className="text-xs text-gray-500 mt-1">{progressLabel}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
