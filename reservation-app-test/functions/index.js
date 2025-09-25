// /**
//  * Import function triggers from their respective submodules:
//  *
//  * const {onCall} = require("firebase-functions/v2/https");
//  * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
//  *
//  * See a full list of supported triggers at https://firebase.google.com/docs/functions
//  */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started

// // exports.helloWorld = onRequest((request, response) => {
// //   logger.info("Hello logs!", {structuredData: true});
// //   response.send("Hello from Firebase!");
// // });

const functions = require("firebase-functions");
const admin = require("firebase-admin");

//ユーザー権限（管理者）付与
exports.addAdminClaim = functions.firestore
  .document("admin_users/{docID}")
  .onCreate((snap) => {
    const newAdminUser = snap.data();
    if (newAdminUser === undefined) {
      return;
    }
    modifyAdmin(newAdminUser.uid, true);
    //true: 管理者
  });

//ユーザー権限（管理者）消去
exports.removeAdminClaim = functions.firestore
  .document("admin_users/{docID}")
  .onDelete((snap) => {
    const deletedAdminUser = snap.data();
    if (deletedAdminUser === undefined) {
      return;
    }
    modifyAdmin(deletedAdminUser.uid, false);
    //false: 管理者ではないユーザー
  });

const modifyAdmin = (uid, isAdmin) => {
  admin.auth().setCustomUserClaims(uid, { admin: isAdmin }).then();
};
