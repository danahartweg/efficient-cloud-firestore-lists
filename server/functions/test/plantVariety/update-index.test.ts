import { waitForCloudFunctionExecution } from '../../helpers/wait';
import {
  COLLECTIONS,
  documentPath,
  generateId,
  generateUserId,
} from '../../../test-helpers/contants';
import {
  Firestore,
  getAdminApp,
  setUseRealProjectId,
  setup,
  teardown,
} from '../../../test-helpers/firestore-helpers';

const USER_ID = generateUserId();
const HOMESTEAD_ID = generateId();
const PLANT_VARIETY_ID_1 = generateId();
const PLANT_VARIETY_ID_2 = generateId();
const INDEX_ID_ROOT = generateId();
const INDEX_ID_HOMESTEAD = generateId();

describe('updatePlantVarietyIndex', () => {
  let db: Firestore;

  beforeAll(async () => {
    setUseRealProjectId();

    await setup(USER_ID, {
      [documentPath(COLLECTIONS.INDICES, INDEX_ID_ROOT)]: {
        indexName: 'plant-varieties',
        parentId: 'root',
        isFull: false,
      },
      [documentPath(COLLECTIONS.INDICES, INDEX_ID_HOMESTEAD)]: {
        indexName: 'plant-varieties',
        parentId: HOMESTEAD_ID,
        isFull: false,
      },
    });

    db = getAdminApp();
  });

  afterAll(() => teardown());

  describe('global', () => {
    test('creates a new index', async () => {
      await db
        .collection(COLLECTIONS.PLANT_VARIETIES)
        .doc(PLANT_VARIETY_ID_1)
        .set({
          commonName: 'Name',
          variety: 'Variety',
        });

      await waitForCloudFunctionExecution();

      const plantVarietyIndexDocument = await db
        .collection(COLLECTIONS.INDICES)
        .doc(INDEX_ID_ROOT)
        .get();

      expect(plantVarietyIndexDocument.get(PLANT_VARIETY_ID_1))
        .toMatchInlineSnapshot(`
        Object {
          "n": "Name, Variety",
        }
      `);
    });

    test('updates an index', async () => {
      await db
        .collection(COLLECTIONS.PLANT_VARIETIES)
        .doc(PLANT_VARIETY_ID_1)
        .update({
          commonName: 'New Name',
          variety: 'New Variety',
        });

      await waitForCloudFunctionExecution();

      const plantVarietyIndexDocument = await db
        .collection(COLLECTIONS.INDICES)
        .doc(INDEX_ID_ROOT)
        .get();

      expect(plantVarietyIndexDocument.get(PLANT_VARIETY_ID_1))
        .toMatchInlineSnapshot(`
        Object {
          "n": "New Name, New Variety",
        }
      `);
    });

    test('removes an index', async () => {
      await db
        .collection(COLLECTIONS.PLANT_VARIETIES)
        .doc(PLANT_VARIETY_ID_1)
        .delete();

      await waitForCloudFunctionExecution();

      const plantVarietyIndexDocument = await db
        .collection(COLLECTIONS.INDICES)
        .doc(INDEX_ID_ROOT)
        .get();

      expect(plantVarietyIndexDocument.get(PLANT_VARIETY_ID_1)).toBeUndefined();
    });
  });

  describe('homestead', () => {
    test('creates a new index', async () => {
      await db
        .collection(COLLECTIONS.PLANT_VARIETIES)
        .doc(PLANT_VARIETY_ID_2)
        .set({
          commonName: 'Name',
          homesteadId: HOMESTEAD_ID,
          variety: 'Variety',
        });

      await waitForCloudFunctionExecution();

      const plantVarietyIndexDocument = await db
        .collection(COLLECTIONS.INDICES)
        .doc(INDEX_ID_HOMESTEAD)
        .get();

      expect(plantVarietyIndexDocument.get(PLANT_VARIETY_ID_2))
        .toMatchInlineSnapshot(`
        Object {
          "l": true,
          "n": "Name, Variety",
        }
      `);
    });

    test('updates an index', async () => {
      await db
        .collection(COLLECTIONS.PLANT_VARIETIES)
        .doc(PLANT_VARIETY_ID_2)
        .update({
          commonName: 'New Name',
          homesteadId: HOMESTEAD_ID,
          variety: 'New Variety',
        });

      await waitForCloudFunctionExecution();

      const plantVarietyIndexDocument = await db
        .collection(COLLECTIONS.INDICES)
        .doc(INDEX_ID_HOMESTEAD)
        .get();

      expect(plantVarietyIndexDocument.get(PLANT_VARIETY_ID_2))
        .toMatchInlineSnapshot(`
        Object {
          "l": true,
          "n": "New Name, New Variety",
        }
      `);
    });

    test('removes an index', async () => {
      await db
        .collection(COLLECTIONS.PLANT_VARIETIES)
        .doc(PLANT_VARIETY_ID_2)
        .delete();

      await waitForCloudFunctionExecution();

      const plantVarietyIndexDocument = await db
        .collection(COLLECTIONS.INDICES)
        .doc(INDEX_ID_HOMESTEAD)
        .get();

      expect(plantVarietyIndexDocument.get(PLANT_VARIETY_ID_2)).toBeUndefined();
    });
  });
});
