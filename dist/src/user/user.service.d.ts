import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
export declare class UserService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    findOne(username: string): Promise<User | null>;
    create(username: string, password: string): Promise<User>;
}
