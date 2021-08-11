import { Entity } from "@backstage/catalog-model";
import { FIREBASE_FUNCTION_IDS } from "../hooks/useFunctionIds";

export const isOnlyOneFirebaseFunction = (entity: Entity) => {
  const rawProjects =
      entity?.metadata.annotations?.[FIREBASE_FUNCTION_IDS] ?? undefined;
  if (!rawProjects) {
    return false;
  }
  const functions = rawProjects.split(',').map(p => p.trim());
  return functions.length === 1;
};

export const isMoreThanOneFirebaseFunction = (entity: Entity) => {
  const rawProjects =
      entity?.metadata.annotations?.[FIREBASE_FUNCTION_IDS] ?? '';
  const functions = rawProjects.split(',').map(p => p.trim());
  return functions.length > 1;
};
