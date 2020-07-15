import { Serializer } from './serializer';
import { Constructor } from '../type';
import { getMetadata } from '../metadata/get-metadata';
import { NoFieldsError } from '../errors';
import { getPropertyOfJson, parseJsonPropertyName, setPropertyToJson } from '../converters/json-utils';
import { FieldMetadata } from '../field/field.metadata';

export class ModelMetadataSerializer<T> implements Serializer<T> {
  constructor(private modelConstructor: Constructor<T>) {}

  deserialize(json: Object, additionalInfo?: any): T | null {
    const deserializedModel = Object.create(this.modelConstructor.prototype);

    const fields = this.getFieldsMetadata();

    fields.forEach(metadata => {
      const address = parseJsonPropertyName(metadata.jsonPropertyName);
      const jsonValue = getPropertyOfJson(json, address);
      this.setValueToModel(deserializedModel, metadata, jsonValue, additionalInfo);
    });

    return deserializedModel;
  }

  private getFieldsMetadata(): FieldMetadata[] {
    const metadata = getMetadata(this.modelConstructor.prototype);
    if (metadata.length === 0) {
      throw new NoFieldsError();
    }
    return metadata;
  }

  private setValueToModel(model: { [key: string]: any }, metadata: FieldMetadata, jsonValue?: any, additionalInfo?: any): void {
    if (jsonValue !== undefined) {
      model[metadata.modelPropertyName] = !!jsonValue ? metadata.serializer.deserialize(jsonValue, additionalInfo) : null;
    }
  }

  serialize(model: T, additionalInfo?: any): Object | null {
    const fields = this.getFieldsMetadata();

    return fields.reduce((dict: { [key: string]: any }, metadata: FieldMetadata) => {
      const modelValue = (model as { [key: string]: any })[metadata.modelPropertyName];
      if (modelValue !== undefined) {
        const address = parseJsonPropertyName(metadata.jsonPropertyName);
        setPropertyToJson(dict, address, !!modelValue ? metadata.serializer.serialize(modelValue, additionalInfo) : null);
      }
      return dict;
    }, {});
  }
}
