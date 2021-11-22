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

function filterByDate(date, data, field) {
  const selectedDate = new Date(date);

  const initialDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    0,
    0,
    0,
  );

  const finalDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    23,
    59,
    59,
  );

  return data.filter(
    item =>
      new Date(item[field]) >= initialDate &&
      new Date(item[field]) <= finalDate,
  );
}

async function petDashboardAction(params) {
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
        const dayMealAccompaniment = filterByDate(
          params.date,
          petDocument.feed ? petDocument.feed : [],
          'datetime',
        );

        const dayliControl = filterByDate(
          params.date,
          petDocument.feedHistory ? petDocument.feedHistory : [],
          'datetime',
        );

        const calculateTheTotalMealStatus = type => {
          return petDocument.feed.reduce((accumulator, item) => {
            if (type === item.status) return (accumulator += 1);

            return accumulator;
          }, 0);
        };

        const AllMealAccompaniment = {
          mealAtTheRightTime: petDocument.feed
            ? calculateTheTotalMealStatus('Sim')
            : 0,
          notMealAtTheRightTime: petDocument.feed
            ? calculateTheTotalMealStatus('Não')
            : 0,
        };

        return {
          statusCode: 200,
          petId: petDocument._id,
          petName: petDocument.petName,
          AllMealAccompaniment,
          dayMealAccompaniment,
          dayliControl,
          success: true,
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

exports.main = petDashboardAction;
