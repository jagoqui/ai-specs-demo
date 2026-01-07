import { USER_ROLES } from '@/modules/shared/domain/models/user-role.model';
import type { User } from '@/modules/shared/domain/models/user.model';

export const USER_MOCK: User = {
  id: '64b64c8f8f8f8f8f8f8f8f8f',
  email: 'user@example.com',
  name: 'John Doe',
  photoUrl: 'https://example.com/photo.jpg',
  googleId: 'google-123456',
  role: USER_ROLES.OWNER,
  phone: '123-456-7890',
  bio: 'This is a sample bio',
  isAdmin: false,
};
