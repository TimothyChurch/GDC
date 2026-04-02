export interface BulkSpiritDeposit {
  batch: string;
  date: Date | string;
  volume: number;
  volumeUnit: string;
  abv: number;
  proofGallons: number;
  value: number;
  costPerProofGallon: number;
}

export interface BulkSpiritWithdrawal {
  batch: string;
  date: Date | string;
  volume: number;
  volumeUnit: string;
  abv: number;
  proofGallons: number;
  value: number;
  costPerProofGallon: number;
}

export interface BulkSpirit {
  _id: string;
  name: string;
  spiritClass: string;
  vessel?: string;
  volume: number;
  volumeUnit: string;
  abv: number;
  proofGallons: number;
  costPerProofGallon: number;
  totalValue: number;
  deposits: BulkSpiritDeposit[];
  withdrawals: BulkSpiritWithdrawal[];
  status: 'active' | 'depleted';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
