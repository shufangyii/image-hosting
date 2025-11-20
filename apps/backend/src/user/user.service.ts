import { Injectable } from '@nestjs/common';
import { User } from '@clerk/backend';

@Injectable()
export class UserService {
  getMe(user: User) {
    // In a real application, you might fetch more user details from your database
    // based on the Clerk user ID (user.id)
    return {
      id: user.id,
      emailAddresses: user.emailAddresses,
      firstName: user.firstName,
      lastName: user.lastName,
      // Add other relevant user properties
    };
  }
}
