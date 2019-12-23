export interface Plant {
  commonName: string;
  homesteadId?: string;
  variety: string;
}

export interface IndexMeta {
  indexName: string;
  isFull: boolean;
  parentId: string;
}
