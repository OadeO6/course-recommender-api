import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: RegisterDto): Promise<{
        access_token: string;
    }>;
    login(body: LoginDto): Promise<{
        access_token: string;
    } | {
        error: string;
    }>;
}
