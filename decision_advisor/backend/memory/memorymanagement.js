const createMemoryObject = (
  question,
  answer
) => {

  return {
    question,
    answer,
    createdAt: new Date()
  };

};

module.exports = {
  createMemoryObject
};