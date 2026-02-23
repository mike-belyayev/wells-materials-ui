// src/types/index.ts

// ========== Existing Types (Keep these) ==========
export interface Site {
  _id: string;
  siteName: string;
  currentPOB: number;
  maximumPOB: number;
  pobUpdatedDate: string;
  activeWell?: string | null;  // Added for well reference
  nextWell?: string | null;     // Added for well reference
}

// ========== Equipment/Well Types ==========

export type ItemStatus = 'neutral' | 'green' | 'orange' | 'red';

export interface Item {
  _id?: string;
  itemName: string;
  itemQuantity?: string;
  itemDescription?: string;
  itemLocation?: string;
  itemState?: ItemStatus;
  itemComment?: string;
}

export interface SubPhase {
  _id?: string;
  subPhaseName: string;
  items: Item[];
}

export interface Phase {
  _id?: string;
  phaseName: string;
  subPhases: SubPhase[];
}

export interface Well {
  _id: string;
  wellName: string;
  wellAFE: string;
  wellOwner: string;
  wellPhases: Phase[];
  createdAt: string;
  updatedAt: string;
}

// ========== Extended Site Type (with populated well references) ==========
export interface SiteWithWells extends Omit<Site, 'activeWell' | 'nextWell'> {
  activeWell?: Well | null;
  nextWell?: Well | null;
}

// ========== API Request/Response Types for Wells ==========
export interface CreateWellRequest {
  wellName: string;
  wellAFE: string;
  wellOwner: string;
}

export interface UpdateWellRequest {
  wellName?: string;
  wellAFE?: string;
  wellOwner?: string;
  wellPhases?: Phase[];
}

export interface AddPhaseRequest {
  phaseName: string;
}

export interface AddSubPhaseRequest {
  subPhaseName: string;
}

export interface AddItemRequest {
  itemName: string;
  itemQuantity?: string;
  itemDescription?: string;
  itemLocation?: string;
  itemState?: ItemStatus;
  itemComment?: string;
}

// ========== Site Well Assignment Types ==========
export interface AssignWellRequest {
  wellId: string;
}

export interface SiteWellResponse extends Omit<Site, 'activeWell' | 'nextWell'> {
  activeWell?: Well;
  nextWell?: Well;
}

// ========== Equipment Page View Types ==========
export interface WellColumnProps {
  well: Well;
  columnCount: 1 | 2 | 3 | 4;
  onAddPhase: (well: Well) => void;
  onAddSubPhase: (well: Well, phaseIndex: number) => void;
  onAddItem: (well: Well, phaseIndex: number, subPhaseIndex: number) => void;
  onEditPhase: (well: Well, phaseIndex: number, phaseName: string) => void;
  onEditSubPhase: (well: Well, phaseIndex: number, subPhaseIndex: number, subPhaseName: string) => void;
  onEditItem: (well: Well, phaseIndex: number, subPhaseIndex: number, itemIndex: number, item: Item) => void;
  onMovePhase: (well: Well, phaseIndex: number, direction: 'up' | 'down') => void;
  onMoveSubPhase: (well: Well, phaseIndex: number, subPhaseIndex: number, direction: 'up' | 'down') => void;
  isAdmin: boolean;
}

export interface WellSearchResult {
  _id: string;
  wellName: string;
  wellAFE: string;
  wellOwner: string;
}

// ========== Modal Props Types ==========
export interface CreateWellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (wellData: CreateWellRequest & { wellPhases: [] }) => void;
  currentLocation: string;
}

export interface AddPhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  well: Well | null;
  onSubmit: (wellId: string, phaseName: string) => void;
}

export interface AddSubPhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  phaseInfo: {
    well: Well;
    phaseIndex: number;
  } | null;
  onSubmit: (wellId: string, phaseIndex: number, subPhaseName: string) => void;
}

export interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  phaseInfo: {
    well: Well;
    phaseIndex: number;
    subPhaseIndex: number;
  } | null;
  onSubmit: (wellId: string, phaseIndex: number, subPhaseIndex: number, itemData: AddItemRequest) => void;
}

export interface EditPhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  phaseInfo: {
    well: Well;
    phaseIndex: number;
    phaseName: string;
  } | null;
  onSubmit: (wellId: string, phaseIndex: number, phaseName: string) => void;
}

export interface EditSubPhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  subPhaseInfo: {
    well: Well;
    phaseIndex: number;
    subPhaseIndex: number;
    subPhaseName: string;
  } | null;
  onSubmit: (wellId: string, phaseIndex: number, subPhaseIndex: number, subPhaseName: string) => void;
}

export interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemInfo: {
    well: Well;
    phaseIndex: number;
    subPhaseIndex: number;
    itemIndex: number;
    item: Item;
  } | null;
  onSubmit: (wellId: string, phaseIndex: number, subPhaseIndex: number, itemIndex: number, itemData: Partial<Item>) => void;
}

// ========== Utility Types ==========
export type ColumnCount = 1 | 2 | 3 | 4;

export type WellType = 'active' | 'next';

export interface WellAssignment {
  type: WellType;
  well: Well;
}

export interface EditWellModalProps {
  isOpen: boolean;
  onClose: () => void;
  well: Well | null;
  onSubmit: (wellId: string, wellData: { wellName: string; wellAFE: string }) => void;
}