import { registerDecorator, ValidationOptions } from 'class-validator';
import { ObjectId } from 'mongodb';

export function IsMongoDBId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isMongoDBId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return (
            ObjectId.isValid(value) && new ObjectId(value).toString() === value
          );
        },
      },
    });
  };
}
