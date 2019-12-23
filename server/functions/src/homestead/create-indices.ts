import { firestore } from 'firebase-functions';

import { getFirestore } from '../admin';
import { IndexMeta } from '../types';

/**
 * When a new homestead is created we want to create
 * the needed indices so they can be immediately accessed.
 */
export const createIndicesForHomestead = firestore
  .document('homesteads/{homesteadId}')
  .onCreate(async (_, context) => {
    const db = getFirestore();
    const batch = db.batch();
    const indicesCollection = db.collection('indices');

    batch.set(indicesCollection.doc(), {
      indexName: 'plant-varieties',
      isFull: false,
      parentId: context.params.homesteadId,
    } as IndexMeta);

    /** additional indices to be added later */

    return batch.commit();
  });
