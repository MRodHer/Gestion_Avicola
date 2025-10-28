// Module: Biosecurity Checklists and Logs for Personnel and Facility Management

export interface BiosecurityLog {
  lotId: string;
  date: string;
  personnelEntry: PersonnelEntry[];
  pestControlActions: PestControlAction[];
  mortalityDisposalActions: MortalityDisposalAction[];
  vaccinationRecords: VaccinationRecord[];
}

export interface PersonnelEntry {
  personnelId: string;
  name: string;
  entryTime: string; // ISO datetime
  exitTime?: string; // ISO datetime
  clothingChanged: boolean;
  footwearChanged: boolean;
  handSanitized: boolean;
  notes?: string;
}

export interface PestControlAction {
  date: string; // ISO date
  method: string;
  area: string;
  notes?: string;
}

export interface MortalityDisposalAction {
  date: string; // ISO date
  method: string;
  location: string;
  notes?: string;
}

export interface VaccinationRecord {
  date: string; // ISO date
  vaccineName: string;
  lotNumber: string;
  administeredBy: string;
  notes?: string;
}

// Function to add a personnel entry log
export function addPersonnelEntry(log: BiosecurityLog, entry: PersonnelEntry): BiosecurityLog {
  return {
    ...log,
    personnelEntry: [...log.personnelEntry, entry],
  };
}

// Function to add a pest control action
export function addPestControlAction(log: BiosecurityLog, action: PestControlAction): BiosecurityLog {
  return {
    ...log,
    pestControlActions: [...log.pestControlActions, action],
  };
}

// Function to add a mortality disposal action
export function addMortalityDisposalAction(log: BiosecurityLog, action: MortalityDisposalAction): BiosecurityLog {
  return {
    ...log,
    mortalityDisposalActions: [...log.mortalityDisposalActions, action],
  };
}

// Function to add a vaccination record
export function addVaccinationRecord(log: BiosecurityLog, record: VaccinationRecord): BiosecurityLog {
  return {
    ...log,
    vaccinationRecords: [...log.vaccinationRecords, record],
  };
}