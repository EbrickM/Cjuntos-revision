import React from 'react';
import {
  Lock,
  Unlock,
  FileText,
  ClipboardList,
  Building2,
  Lightbulb,
  Camera,
  CheckCircle2,
  Target,
  User,
  Users,
  BarChart3,
  TrendingUp,
  Briefcase,
  Link2,
  Mail,
  Smartphone,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  XCircle,
  Search,
  DollarSign,
  Key,
  Bell,
  Edit,
  Circle,
  Rocket,
  Calendar,
  Package,
  Truck,
  IdCard,
  Eye,
  Zap,
  Activity,
  Receipt,
  CreditCard,
  GraduationCap,
  Clock,
  Plus,
  Download,
  Upload,
  AlertTriangle,
  Hand,
  Leaf,
} from 'lucide-react';

export const emojiIconMap = {
  '🔒': Lock,
  '📄': FileText,
  '📋': ClipboardList,
  '🏦': Building2,
  '💡': Lightbulb,
  '📷': Camera,
  '✅': CheckCircle2,
  '🎯': Target,
  '👤': User,
  '📊': BarChart3,
  '💼': Briefcase,
  '🔗': Link2,
  '📧': Mail,
  '📱': Smartphone,
  '⬅️': ArrowLeft,
  '➡️': ArrowRight,
  '❌': XCircle,
  '🔍': Search,
  '💰': DollarSign,
  '🔑': Key,
  '🔔': Bell,
  '✏': Edit,
  '⚠': AlertTriangle,
  '⚠️': AlertTriangle,
  '🟢': Circle,
  '🟡': Circle,
  '🔴': Circle,
  '🌿': Leaf,
  '🔓': Unlock,
  '⏳': Clock,
  '🧾': Receipt,
  '👥': Users,
  '🚀': Rocket,
  '📅': Calendar,
  '📈': TrendingUp,
  '📦': Package,
  '🚛': Truck,
  '🔐': Lock,
  '🪪': IdCard,
  '👁': Eye,
  '←': ArrowLeft,
  '→': ArrowRight,
  '↑': ArrowUp,
  '✓': CheckCircle2,
  '✔️': CheckCircle2,
  '✕': XCircle,
  '➕': Plus,
  '📥': Download,
  '📤': Upload,
  '📞': Smartphone,
  '💳': CreditCard,
  '🎓': GraduationCap,
  '🚦': Activity,
  '👋': Hand,
  '⚡': Zap,
};

export function renderEmojiText(text, iconSize = 16, iconClassName = 'inline-block align-middle mr-1') {
  if (typeof text !== 'string') return text;
  const emojiRegex = new RegExp(
    Object.keys(emojiIconMap)
      .sort((a, b) => b.length - a.length)
      .map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|'),
    'g'
  );

  const parts = text.split(emojiRegex);
  const emojis = text.match(emojiRegex) || [];
  const nodes = [];

  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) nodes.push(parts[i]);
    if (i < emojis.length) {
      const IconComponent = emojiIconMap[emojis[i]];
      nodes.push(
        IconComponent
          ? React.createElement(IconComponent, {
              key: `emoji-${i}-${emojis[i]}`,
              size: iconSize,
              className: iconClassName,
            })
          : emojis[i]
      );
    }
  }

  return nodes;
}
