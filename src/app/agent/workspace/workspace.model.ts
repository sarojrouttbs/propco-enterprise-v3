export interface Params {
  route?: any;
  entityId: string;
  reference: string;
  entityTitle: string;
  purpose: number;
}

export interface Property {
  state: string;
  params: Params;
  entityType: number;
  entityId: string;
  entity: string;
  entityTitle: string;
  reference: string;
  isSelected: boolean;
  pageRef: string;
}