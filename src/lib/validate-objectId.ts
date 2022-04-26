import { ObjectId } from 'mongodb';

export const isValidObjectId = (id: string): boolean => {
  if (ObjectId.isValid(id) && new ObjectId(id).toString() === id) {
    return true;
  } else {
    return false;
  }
};
