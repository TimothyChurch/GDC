// --- Stage data interfaces ---

export interface BatchStageBase {
	startedAt?: Date;
	completedAt?: Date;
	vessel?: string;
	notes?: string;
}

export interface MashingStage extends BatchStageBase {
	strikeWaterVolume?: number;
	strikeWaterVolumeUnit?: string;
	strikeWaterTemp?: number;
	strikeWaterTempUnit?: string;
	mashTemp?: number;
	mashTempUnit?: string;
	mashDuration?: number;
	pH?: number;
	preBoilGravity?: number;
	postBoilGravity?: number;
}

export interface FermentingStage extends BatchStageBase {
	yeastStrain?: string;
	pitchTemp?: number;
	pitchTempUnit?: string;
	readings: {
		date: Date;
		temperature: number;
		temperatureUnit: string;
		gravity: number;
		pH?: number;
		notes?: string;
	}[];
	originalGravity?: number;
	finalGravity?: number;
	estimatedAbv?: number;
	washVolume?: number;
	washVolumeUnit?: string;
}

export interface DistillingStage extends BatchStageBase {
	runType?: 'stripping' | 'spirit' | 'single';
	runNumber?: number;
	chargeVolume?: number;
	chargeVolumeUnit?: string;
	chargeAbv?: number;
	additions: {
		tails: {
			volume?: number;
			volumeUnit?: string;
			abv?: number;
		};
		feints?: {
			volume?: number;
			volumeUnit?: string;
			abv?: number;
		};
	};
	collected: {
		foreshots?: {
			vessel?: string;
			volume?: number;
			volumeUnit?: string;
			abv?: number;
		};
		heads: {
			vessel?: string;
			volume?: number;
			volumeUnit?: string;
			abv?: number;
		};
		hearts: {
			vessel?: string;
			volume?: number;
			volumeUnit?: string;
			abv?: number;
		};
		tails: {
			vessel?: string;
			volume?: number;
			volumeUnit?: string;
			abv?: number;
		};
		total: {
			volume?: number;
			volumeUnit?: string;
			abv?: number;
			proofGallons?: number;
		};
	};
	temperatures?: {
		time: Date;
		location: string;
		value: number;
		unit: string;
	}[];
}

export interface MacerationStage extends BatchStageBase {
	baseSpirit: {
		source?: string;
		volume?: number;
		volumeUnit?: string;
		abv?: number;
	};
	botanicals: {
		item?: string;
		name?: string;
		weight?: number;
		weightUnit?: string;
	}[];
	method?: 'direct' | 'vapor basket' | 'both';
	startDate?: Date;
	endDate?: Date;
	temperature?: number;
	temperatureUnit?: string;
	duration?: number;
}

export interface FilteringStage extends BatchStageBase {
	method?: string;
	preVolume?: number;
	preVolumeUnit?: string;
	preAbv?: number;
	postVolume?: number;
	postVolumeUnit?: string;
	postAbv?: number;
	filterMedia?: string;
	passes?: number;
}

export interface BarrelAgingStage extends BatchStageBase {
	barrelType?: string;
	barrelSize?: string;
	charLevel?: string;
	previousUse?: string;
	warehouseLocation?: string;
	entry: {
		date?: Date;
		volume?: number;
		volumeUnit?: string;
		abv?: number;
		proofGallons?: number;
	};
	exit: {
		date?: Date;
		volume?: number;
		volumeUnit?: string;
		abv?: number;
		proofGallons?: number;
	};
	samplings?: {
		date: Date;
		abv?: number;
		volume?: number;
		volumeUnit?: string;
		notes?: string;
	}[];
	targetAge?: number;
}

export interface StorageStage extends BatchStageBase {
	volume?: number;
	volumeUnit?: string;
	abv?: number;
	proofGallons?: number;
}

export interface BlendingStage extends BatchStageBase {
	components: {
		source: string;
		volume?: number;
		volumeUnit?: string;
		abv?: number;
	}[];
	resultVolume?: number;
	resultVolumeUnit?: string;
	resultAbv?: number;
}

export interface ProofingStage extends BatchStageBase {
	startAbv?: number;
	targetAbv?: number;
	startVolume?: number;
	startVolumeUnit?: string;
	waterAdded?: number;
	waterAddedUnit?: string;
	finalVolume?: number;
	finalVolumeUnit?: string;
	finalAbv?: number;
	finalProofGallons?: number;
	waterSource?: string;
}

export interface BottledStage extends BatchStageBase {
	productionRecord?: string;
	bottleCount?: number;
	bottleSize?: string;
	lotNumber?: string;
	labeledAbv?: number;
}

// --- Stages map type ---

export interface BatchStages {
	mashing?: MashingStage;
	fermenting?: FermentingStage;
	distilling?: DistillingStage;
	maceration?: MacerationStage;
	filtering?: FilteringStage;
	barrelAging?: BarrelAgingStage;
	storage?: StorageStage;
	blending?: BlendingStage;
	proofing?: ProofingStage;
	bottled?: BottledStage;
}

// --- Activity log entry ---

export interface BatchLogEntry {
	date: Date;
	action: string;
	user?: string;
	details?: string;
}

// --- Main Batch interface ---

export interface Batch {
	_id: string;
	batchNumber?: string;
	recipe: string;
	pipeline: string[];
	currentStage: string;
	status: 'active' | 'completed' | 'cancelled';
	batchSize: number;
	batchSizeUnit: string;
	recipeCost: number;
	batchCost?: number;
	notes?: string;
	stages: BatchStages;
	log?: BatchLogEntry[];
	createdAt?: string;
	updatedAt?: string;
}
