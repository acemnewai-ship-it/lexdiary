
import React from 'react';
import { Briefcase, Calendar, List, CheckCircle, Plus, FileText, Download, Trash2, BrainCircuit, User } from 'lucide-react';

export const CASE_TYPES = [
  'Civil', 'Criminal', 'Writ', 'Family', 'Revenue', 'Tax', 'Service', 'Other'
];

export const COURT_NAMES = [
  'Supreme Court', 'High Court', 'District Court', 'Session Court', 'Family Court', 'Revenue Court', 'Labour Court', 'Consumer Forum', 'Tribunal'
];

export const REASONS_OF_HEARING = [
  'Admission', 'Notice', 'Order', 'Stay', 'Argument', 'Evidence', 'Judgment', 'Directions', 'Compliance'
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <Calendar className="w-5 h-5" /> },
  { id: 'causelist', label: 'Cause List', icon: <List className="w-5 h-5" /> },
  { id: 'cases', label: 'All Cases', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'ai', label: 'AI Counsel', icon: <BrainCircuit className="w-5 h-5" /> },
];

export const CLIENT_NAV_ITEMS = [
  { id: 'track', label: 'Track Case', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'profile', label: 'My Info', icon: <User className="w-5 h-5" /> },
];
