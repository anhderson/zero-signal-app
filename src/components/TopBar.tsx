import { Search, Bell, Inbox, HelpCircle, Hash } from 'lucide-react';
import './TopBar.css';

interface TopBarProps {
  title: string;
  icon?: React.ReactNode;
}

const TopBar = ({ title, icon = <Hash size={24} className="topbar-hash" /> }: TopBarProps) => {
  return (
    <div className="top-bar">
      <div className="topbar-left">
        {icon}
        <h3 className="topbar-title">{title}</h3>
      </div>
      
      <div className="topbar-right">
        <div className="search-bar">
          <input type="text" placeholder="Buscar" />
          <Search size={16} className="search-icon" />
        </div>
        <div className="topbar-icon">
          <Bell size={20} />
        </div>
        <div className="topbar-icon">
          <Inbox size={20} />
        </div>
        <div className="topbar-icon">
          <HelpCircle size={20} />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
