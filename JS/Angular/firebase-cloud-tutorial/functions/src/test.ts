async function myFunction() {
  try {
    const rank = await getRank();
    return "firebase is #" + rank;
  } catch (err) {
    return "Error: " + err;
  }
}

function getRank() {
  return Promise.resolve(1);
}