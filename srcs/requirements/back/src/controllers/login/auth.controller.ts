import { Controller, Post, Body, Res } from '@nestjs/common';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res) {
    // Implement your login logic here
    const { username, password } = loginDto;
    console.log(loginDto);
    console.log(username);
    console.log(password);
    
    
    
    // Validate username and password
    // Perform authentication

    // Example response
    if (username === 'admin' && password === 'password') {
      // If authentication is successful
      return res.status(200).json({ message: 'Login successful' });
    } else {
      // If authentication fails
      return res.status(401).json({ message: 'Invalid username or password' });
    }
  }
}
