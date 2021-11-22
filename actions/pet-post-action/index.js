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

async function createPet(cloudantInstance, pet) {
  return new Promise((resolve, reject) => {
    cloudantInstance.insert(pet, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

async function petPostAction(params) {
  try {
    const decodeToken = await decodeFirebaseToken(params.token);

    const cloudantDB = await getCloudantInstance(
      params.CLOUDANT_URL,
      params.CLOUDANT_IAM_API_KEY,
      params.CLOUDANT_DB_NAME,
    );

    const pet = {
      user: decodeToken.uid,
      petName: params.petName,
      petFeedWeight: params.petFeedWeight,
      feedHours: params.feedHours,
    };

    const result = await createPet(cloudantDB, pet);

    return {
      petId: result.id,
      success: result.ok,
    };
  } catch (err) {
    return {
      error: err,
    };
  }
}

exports.main = petPostAction;
