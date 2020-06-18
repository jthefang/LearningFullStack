// this is the index.ts for Realtime Database part of the Firebase tutorial
import * as functions from 'firebase-functions';

// respond to changes in the node /rooms, wild card {roomId}, messages, wild card {messageId}
// wild cards will match any child node in the path
export const onMessageCreate = functions.database.ref('/rooms/{roomId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const roomId = context.params.roomId; //this is how you reference the wild cards from above
    const messageId = context.params.messageId;
    console.log(`New message ${messageId} in room ${roomId}`);

    // Get the data that was just created, change it with the emoji
    const messageData = snapshot.val();
    const text = addPizzazz(messageData.text);
    await snapshot.ref.update({ text: text }); //returns a promise

    //the ref = the message node => parent of parent of this node = the node /rooms/{roomId}
    //=> accessing the ref /rooms/{roomId}/messageCount
    const countRef = snapshot.ref.parent?.parent?.child('messageCount');
    return countRef?.transaction(count => { //atomic transactions to prevent race conditions 
      return count + 1;
    });
  })

export const onMessageDelete = functions.database.ref('/rooms/{roomId}/messages/{messageId}')
  .onDelete(async (snapshot, context) => {
    const countRef = snapshot.ref.parent?.parent?.child('messageCount');
    return countRef?.transaction(count => {
      return count - 1;
    });
  })

export const onMessageUpdate = functions.database.ref('/rooms/{roomId}/messages/{messageId}')
  .onUpdate((change, context) => {
    const before = change.before.val();    
    const after = change.after.val();

    if (before.text === after.text) { //need this to prevent infinite updates from the below update!
      console.log("Text didn't change");
      return null; //indicates no additional work to wait on
    }
    const text = addPizzazz(after.text);
    const timeEdited = Date.now();
    return change.after.ref.update({ text, timeEdited }); //add an edited timestamp with the update to the data 
  })

function addPizzazz(text: string): string {
  return text.replace(/\bpizza\b/g, '🍕');
}