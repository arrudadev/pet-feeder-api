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

async function findByUser(cloudantInstance, user) {
  return new Promise((resolve, reject) => {
    const search = `.*${user}.*`;
    cloudantInstance.find(
      {
        selector: {
          user: {
            $regex: search,
          },
        },
      },
      (err, documents) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            data: documents.docs,
            statusCode: documents.docs.length > 0 ? 200 : 404,
          });
        }
      },
    );
  });
}

async function petGetAction(params) {
  try {
    const decodeToken = await decodeFirebaseToken(params.token);

    const cloudantDB = await getCloudantInstance(
      params.CLOUDANT_URL,
      params.CLOUDANT_IAM_API_KEY,
      params.CLOUDANT_DB_NAME,
    );

    const response = await findByUser(cloudantDB, decodeToken.uid);

    if (response.statusCode === 200) {
      return {
        statusCode: 200,
        pets: response.data.map(pet => ({
          petId: pet._id,
          petName: pet.petName,
          petFeedWeight: pet.petFeedWeight,
          feedHours: pet.feedHours,
        })),
        success: true,
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

exports.main = petGetAction;
