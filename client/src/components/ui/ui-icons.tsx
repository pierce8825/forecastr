import React from "react";

// This component implements the Material Icons from the design using Lucide React
// It maps the Material Icons names to their Lucide React equivalents
import {
  Home,
  BarChart3,
  DollarSign,
  Wallet,
  Users,
  TrendingUp,
  LineChart,
  ClipboardList,
  Settings,
  Bell,
  HelpCircle,
  User,
  Edit,
  Share,
  InfoIcon,
  FilterIcon,
  MoreHorizontal,
  CheckCircle,
  PlusCircle,
  RefreshCw,
  Filter,
  ChevronDown,
  FolderSync,
} from "lucide-react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
}

export const MaterialIcon: React.FC<IconProps> = ({ name, className = "", ...props }) => {
  // Map the Material Icons names to Lucide React components
  const iconMapping: Record<string, React.ReactNode> = {
    dashboard: <Home {...props} className={className} />,
    attach_money: <DollarSign {...props} className={className} />,
    account_balance_wallet: <Wallet {...props} className={className} />,
    people: <Users {...props} className={className} />,
    trending_up: <TrendingUp {...props} className={className} />,
    show_chart: <LineChart {...props} className={className} />,
    assignment: <ClipboardList {...props} className={className} />,
    settings: <Settings {...props} className={className} />,
    notifications: <Bell {...props} className={className} />,
    help_outline: <HelpCircle {...props} className={className} />,
    person: <User {...props} className={className} />,
    edit: <Edit {...props} className={className} />,
    share: <Share {...props} className={className} />,
    info_outline: <InfoIcon {...props} className={className} size={18} />,
    filter_list: <FilterIcon {...props} className={className} size={18} />,
    more_horiz: <MoreHorizontal {...props} className={className} size={18} />,
    check_circle: <CheckCircle {...props} className={className} />,
    add_circle: <PlusCircle {...props} className={className} />,
    add_circle_outline: <PlusCircle {...props} className={className} />,
    refresh: <RefreshCw {...props} className={className} />,
    filter: <Filter {...props} className={className} />,
    expand_more: <ChevronDown {...props} className={className} />,
    sync: <FolderSync {...props} className={className} />,
    bar_chart: <BarChart3 {...props} className={className} />,
  };

  // Return the corresponding icon or a placeholder if not found
  return <>{iconMapping[name] || <div className={className}>Icon: {name}</div>}</>;
};
