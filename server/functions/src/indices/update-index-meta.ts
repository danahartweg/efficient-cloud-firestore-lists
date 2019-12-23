import { firestore } from 'firebase-functions';
// @ts-ignore there is no declaration file for this module
import * as sizeOf from 'firestore-size';

import { getFirestore } from '../admin';
import { IndexMeta } from '../types';

// 1 MiB * 1024 kB * 1024 B * margin of error
const MAX_DOCUMENT_SIZE = 1 * 1024 * 1024 * 0.95;

/**
 * When indices are updated we need to ensure they can still accept more fields.
 * If the index is full, we need to create a new index document to accept more entries.
 */
export const updateIndexMeta = firestore
  .document('indices/{indexId}')
  .onUpdate(async (change, context) => {
    const indexData: IndexMeta = change.after.data() as IndexMeta;

    if (indexData.isFull) {
      return null;
    }

    const currentDocumentSize = sizeOf(indexData);
    if (currentDocumentSize < MAX_DOCUMENT_SIZE) {
      return null;
    }

    const db = getFirestore();
    const batch = db.batch();

    const { indexName, parentId } = indexData;
    batch.set(db.collection('indices').doc(), {
      isFull: false,
      indexName,
      parentId,
    } as IndexMeta);

    batch.update(db.collection('indices').doc(context.params.indexId), {
      isFull: true,
    });

    return batch.commit();
  });
