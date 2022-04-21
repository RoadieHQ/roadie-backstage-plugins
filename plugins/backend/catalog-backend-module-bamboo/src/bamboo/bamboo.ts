import { GroupEntity, UserEntity } from '@backstage/catalog-model';
import lodash from 'lodash';

export type UserObject = {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  jobTitle: string | null;
  workEmail: string | null;
  department: string[] | null;
  division: string[] | null;
  pronouns: string[] | null;
  supervisor: string;
  photoUploaded: boolean;
  photoUrl: string | null;
  canUploadPhoto: number;
};

export const processGroups = async (): Promise<GroupEntity[]> => {
  return [];
};

export const processUsers = (
  userdata: any,
  defaultAnnotations: {[name: string]: string} = {},
  namespace?: string,
): UserEntity[] => {
  return userdata.map((user: UserObject) => {
    const name = lodash
      .deburr(user.displayName.toLocaleLowerCase())
      .replace(/ /g, '_');
    const entity: UserEntity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: {
        // remove special chars as backstage doesn't support them
        name,
        annotations: {
          'bamboohr.com/user-login': user.displayName,
          'bamboohr.com/supervisor': user.supervisor,
          ...defaultAnnotations
        },
      },
      spec: {
        profile: {},
        memberOf: [],
      },
    };

    if (namespace) entity.metadata.namespace = namespace;
    if (user.displayName) entity.spec.profile!.displayName = user.displayName;
    if (user.workEmail) entity.spec.profile!.email = user.workEmail;
    if (user.photoUrl) entity.spec.profile!.picture = user.photoUrl;
    if (user.jobTitle) entity.metadata.description = user.jobTitle;

    return entity;
  });
};
