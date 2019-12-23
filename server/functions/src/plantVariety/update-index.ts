import { firestore } from 'firebase-functions';

import { FieldValue, getFirestore } from '../admin';
import { Plant } from '../types';
import { generatePlantDisplayName } from '../helpers/generate-plant-display-name';

type IndexPayload = {
  n: string; // display name
  o?: string; // origin name
  l?: boolean; // is local
};

/**
 * We keep an index of plant varieties for each homestead and global plant variety,
 * so we can easily present a list of all of them. We need to keep those indices up-to-date
 * if a plant variety is added or updated.
 */
export const updatePlantVarietyIndex = firestore
  .document('plantVarieties/{plantVarietyId}')
  .onWrite(async (change, context) => {
    const db = getFirestore();

    const { plantVarietyId } = context.params;
    const plantVarietyBefore = (change.before.data() || {}) as Plant;
    const plantVarietyAfter = (change.after.data() || {}) as Plant;
    const homesteadId =
      plantVarietyAfter.homesteadId || plantVarietyBefore.homesteadId;

    const isNewPlantVariety = !change.before.exists;
    const hasPlantVarietyBeenDeleted = !change.after.exists;

    let indexQuery: FirebaseFirestore.Query;

    // new varieties need the first empty index
    // existing varieties need the index they're contained in
    if (isNewPlantVariety) {
      indexQuery = db
        .collection('indices')
        .where('indexName', '==', 'plant-varieties')
        .where('parentId', '==', homesteadId || 'root')
        .where('isFull', '==', false);
    } else {
      indexQuery = db
        .collection('indices')
        .where(`${plantVarietyId}.n`, '>=', '');
    }

    const indexSnapshot = await indexQuery.limit(1).get();
    const [indexDocument] = indexSnapshot.docs;

    if (!indexDocument) {
      return null;
    }

    if (hasPlantVarietyBeenDeleted) {
      return indexDocument.ref.update({
        [plantVarietyId]: FieldValue.delete(),
        isFull: false,
      });
    }

    const previousDisplayName = generatePlantDisplayName(plantVarietyBefore);
    const updatedDisplayName = generatePlantDisplayName(plantVarietyAfter);

    if (previousDisplayName === updatedDisplayName) {
      return null;
    }

    const indexPayload: IndexPayload = {
      n: updatedDisplayName,
    };

    if (homesteadId) {
      indexPayload.l = true;
    }

    return indexDocument.ref.update({
      [plantVarietyId]: indexPayload,
    });
  });
