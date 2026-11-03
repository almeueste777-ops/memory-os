import React from 'react';
import { 
  BookOpen, 
  Database, 
  Share2, 
  Sparkles, 
  Settings as SettingsIcon, 
  Brain, 
  Search, 
  Maximize2, 
  Minimize2, 
  X, 
  Plus, 
  Heart, 
  Pin, 
  Trash2, 
  Calendar, 
  Tag, 
  Image as ImageIcon, 
  RotateCcw, 
  Check, 
  Download, 
  Upload, 
  Folder,
  Layers,
  ArrowRight,
  Edit3,
  GraduationCap,
  Landmark,
  Compass,
  Play,
  MapPin
} from 'lucide-react';

interface OSIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const OSIcon: React.FC<OSIconProps> = ({ name, className = 'w-5 h-5', size = 20 }) => {
  switch (name) {
    case 'loci-world':
    case 'landmark':
      return <Landmark size={size} className={className} />;
    case 'map-pin':
      return <MapPin size={size} className={className} />;
    case 'compass':
      return <Compass size={size} className={className} />;
    case 'play':
      return <Play size={size} className={className} />;
    case 'academy':
    case 'graduation-cap':
      return <GraduationCap size={size} className={className} />;
    case 'journal':
    case 'book-open':
      return <BookOpen size={size} className={className} />;
    case 'vault':
    case 'database':
      return <Database size={size} className={className} />;
    case 'graph':
    case 'network':
    case 'share2':
      return <Share2 size={size} className={className} />;
    case 'recall':
    case 'sparkles':
      return <Sparkles size={size} className={className} />;
    case 'settings':
      return <SettingsIcon size={size} className={className} />;
    case 'brain':
      return <Brain size={size} className={className} />;
    case 'search':
      return <Search size={size} className={className} />;
    case 'maximize':
      return <Maximize2 size={size} className={className} />;
    case 'minimize':
      return <Minimize2 size={size} className={className} />;
    case 'close':
      return <X size={size} className={className} />;
    case 'plus':
      return <Plus size={size} className={className} />;
    case 'heart':
      return <Heart size={size} className={className} />;
    case 'pin':
      return <Pin size={size} className={className} />;
    case 'trash':
      return <Trash2 size={size} className={className} />;
    case 'calendar':
      return <Calendar size={size} className={className} />;
    case 'tag':
      return <Tag size={size} className={className} />;
    case 'image':
      return <ImageIcon size={size} className={className} />;
    case 'rotate':
      return <RotateCcw size={size} className={className} />;
    case 'check':
      return <Check size={size} className={className} />;
    case 'download':
      return <Download size={size} className={className} />;
    case 'upload':
      return <Upload size={size} className={className} />;
    case 'folder':
      return <Folder size={size} className={className} />;
    case 'layers':
      return <Layers size={size} className={className} />;
    case 'arrow-right':
      return <ArrowRight size={size} className={className} />;
    case 'edit':
      return <Edit3 size={size} className={className} />;
    default:
      return <Brain size={size} className={className} />;
  }
};
