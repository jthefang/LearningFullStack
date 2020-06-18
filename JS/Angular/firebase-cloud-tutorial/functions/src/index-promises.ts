import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

var serviceAccount = require("../keys/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://firecast-app-48c9c.firebaseio.com"
});

export const getBostonAreaWeather = functions.https.onRequest(async (request, response) => {
  try {
    const areaSnapshot = await admin.firestore().doc("areas/greater-boston").get();
    const cities = areaSnapshot.data()?.cities;
    const promises = [];
    for (var i = 0; i < cities.length; i++) {
      let city = cities[i];
      const p = admin.firestore().doc(`cities-weather/${city}`).get();
      promises.push(p);
    }

    const citySnapshots = await Promise.all(promises);
    let results: any[] = [];
    citySnapshots.forEach(citySnap => {
      const data = citySnap.data();
      if (data !== undefined)
        data.city = citySnap.id;
      results.push(data);
    });
    response.send(results);
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
})

export const onBostonWeatherUpdate = functions.firestore.document("cities-weather/boston-ma-us").onUpdate(change => {
  const after = change.after.data(); //snapshot after update
  const payload = {
    data: {
      temp: String(after.temp),
      conditions: after.conditions
    }
  };
  return admin.messaging().sendToTopic("weather_boston-ma-us", payload);
})

export const getBostonWeather = functions.https.onRequest(async (request, response) => {
  try {
    const snapshot = await admin.firestore().doc('cities-weather/boston-ma-us').get()
    const data = snapshot.data();
    response.send(data); //terminates the cloud function onRequest
  } catch(error) {
    //Handle the error
    console.log(error);
  response.status(500).send(error);
  }
});
