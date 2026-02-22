// src/types/index.ts

// ========== Existing Types (Keep these) ==========
export interface Passenger {
  _id: string;
  firstName: string;
  lastName: string;
  jobRole: string;
}

export interface Trip {
  _id: string;
  passengerId: string;
  fromOrigin: string;
  toDestination: string;
  tripDate: string;
  confirmed: boolean;
  numberOfPassengers?: number;
  sortIndices?: {
    [key: string]: number;
  };
}

export interface Site {
  _id: string;
  siteName: string;
  currentPOB: number;
  maximumPOB: number;
  pobUpdatedDate: string;
}

export interface DayData {
  date: Date;
  incoming: Trip[];
  outgoing: Trip[];
  pob: number;
  updateInfo?: string;
}

export type TripType = 'incoming' | 'outgoing';

// ========== New Equipment/Well Types ==========

export interface Item {
  _id?: string;  // Optional as new items might not have ID yet
  itemName: string;
  itemQuantity?: string;
  itemDescription?: string;
  itemLocation?: string;
  itemState?: string;
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

// ========== Extended Site Type (with well references) ==========
export interface SiteWithWells extends Site {
  activeWell?: Well | string | null;  // Can be populated Well object or just ID
  nextWell?: Well | string | null;     // Can be populated Well object or just ID
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

export interface AddItemRequest {
  itemName: string;
  itemQuantity?: string;
  itemDescription?: string;
  itemLocation?: string;
  itemState?: string;
  itemComment?: string;
}

// ========== Site Well Assignment Types ==========
export interface AssignWellRequest {
  wellId: string;
}

export interface SiteWellResponse extends Site {
  activeWell?: Well;
  nextWell?: Well;
}

// ========== Equipment Page View Types ==========
export interface WellColumnProps {
  well: Well;
  columnCount: 1 | 2 | 3 | 4;
  onAddPhase: (well: Well) => void;
  onAddItem: (well: Well, phaseIndex: number, subPhaseIndex: number) => void;
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
}

export interface AddPhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  well: Well | null;
  onSubmit: (wellId: string, phaseName: string) => void;
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

// ========== Utility Types ==========
export type ColumnCount = 1 | 2 | 3 | 4;

export type WellType = 'active' | 'next';

export interface WellAssignment {
  type: WellType;
  well: Well;
}