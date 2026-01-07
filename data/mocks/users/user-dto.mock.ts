import { USER_ROLES_DTO } from '@/modules/shared/infrastructure/dtos/role.dto';
import type { UserResponseDto } from '@/modules/shared/infrastructure/dtos/user.dto';

export const USER_DTO_MOCK: UserResponseDto = {
  id: '64b64c8f8f8f8f8f8f8f8f8f',
  email: 'user@example.com',
  name: 'John Doe',
  photoUrl: 'https://example.com/photo.jpg',
  googleId: 'google-123456',
  role: USER_ROLES_DTO.OWNER,
  phoneNumber: '123-456-7890',
  bio: 'This is a sample bio',
};
