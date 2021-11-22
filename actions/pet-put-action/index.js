async function decodeFirebaseToken(token) {
  const admin = require('firebase-admin');
  const serviceAccount = require('./service-account-key.json');

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return admin.auth().verifyIdToken(token);
}

async function getCloudantInstance(url, iamApiKey, dbName) {
  const Cloudant = require('@cloudant/cloudant');

  const iamTokenUrl = 'https://iam.cloud.ibm.com/identity/token';

  return new Promise((resolve, reject) => {
    Cloudant(
      {
        url,
        plugins: {
          iamauth: {
            iamApiKey,
            iamTokenUrl,
          },
        },
      },
      (err, cloudant) => {
        if (err) {
          reject(err);
        } else {
          const db = cloudant.use(dbName);

          resolve(db);
        }
      },
    );
  });
}

async function findById(cloudantInstance, id) {
  return new Promise((resolve, reject) => {
    cloudantInstance.get(id, (err, document) => {
      if (err) {
        if (err.message === 'missing') {
          resolve({ data: {}, statusCode: 404 });
        } else {
          reject(err);
        }
      } else {
        resolve({ data: document, statusCode: 200 });
      }
    });
  });
}

async function updatePet(cloudantInstance, pet) {
  return new Promise((resolve, reject) => {
    // Update the document in Cloudant
    cloudantInstance.insert(pet, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

async function petPutAction(params) {
  try {
    const decodeToken = await decodeFirebaseToken(params.token);

    const cloudantDB = await getCloudantInstance(
      params.CLOUDANT_URL,
      params.CLOUDANT_IAM_API_KEY,
      params.CLOUDANT_DB_NAME,
    );

    const response = await findById(cloudantDB, params.petId);

    const petDocument = response.data;

    if (response.statusCode === 200) {
      if (petDocument.user === decodeToken.uid) {
        petDocument.petName = params.petName;
        petDocument.petFeedWeight = params.petFeedWeight;
        petDocument.feedHours = params.feedHours;

        const result = await updatePet(cloudantDB, petDocument);

        return {
          success: result.ok,
        };
      }

      return {
        success: false,
      };
    }

    return {
      response,
    };
  } catch (err) {
    return {
      error: err,
    };
  }
}

exports.main = petPutAction;
