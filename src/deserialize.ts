import {Type} from "./type";
import {FIELDS_METADATA_KEY} from "./metadata.keys";
import {FieldMetadata} from "./field.metadata";
import {NoFieldsError} from "./no-fields.error";

/**
 * Convert json for type that you need with updated names
 *
 * @param {Object} json
 * @param {Type<T extends Object>} modelType
 * @returns {T}
 */
export function deserialize<T extends Object>(json: Object, modelType: Type<T>): T {
    const model = new modelType();
    const modelPrototype = Object.getPrototypeOf(model);
    const fields = Reflect.getMetadata(FIELDS_METADATA_KEY, modelPrototype) as FieldMetadata[] | undefined;

    if(fields === undefined) {
        throw new NoFieldsError();
    }

    // Simple serialization
    // TODO: Move to serializers
    fields.forEach(fieldMetadata => (<any>model)[fieldMetadata.propertyName] = (<any>json)[fieldMetadata.name]);

    return model;
}