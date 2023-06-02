import { Controller, Post, Body, Res, Req, Get } from '@nestjs/common'
import { LoginDto } from './login.dto'
import { Response, Request } from 'express'
import axios from 'axios'
import { PrismaClient } from '@prisma/client'

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

@Controller('connect')
export class ConnectController {
  @Get('api')
  async handleAuthentication(@Res() res: Response, @Req() req: Request) {
    if (req.query.code) {
		console.log(req.query);
     	console.log('app: have been redirected by the callback');
		const code = req.query.code as string;
     	try {
          exchangeTokenForAccessCode(code);
          return res.redirect(process.env.FRONT_URL);
        }
      catch (error) {
      	console.error('Callback error:', error);
      }
    } else {
			const clientId = process.env.CLIENT_ID;
			const redirectUri = process.env.REDIRECT_URI;
			const scope = 'public';
			const state = 'keep-alive';
			const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
			return res.redirect(authUrl);
    }
  }
}

async function exchangeTokenForAccessCode(token: string)  {
	const qs = require('qs');
	try	{
		let url = 'https://api.intra.42.fr/oauth/token';
		const requestBody = {
			grant_type: 'authorization_code',
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			code: token,
			redirect_uri: 'https://localhost:8080/connect/api'
		};
		const config = {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		};
		let res = await axios.post(url, qs.stringify(requestBody), config);
		const accessToken = res.data.access_token;
		url = process.env.TOKEN_INFO_URL;
		res = await axios.get(url, {
			headers: { 'Authorization': `Bearer ${accessToken}`	}
			}
		)
		let resource_owner_id = res.data.resource_owner_id;
		url = "https://api.intra.42.fr/v2/users" + "/" + resource_owner_id;
		res = await axios.get(url, {
			headers: { 'Authorization': `Bearer ${accessToken}`
		}
		})
		console.log(res);
		const	prisma = new PrismaClient();
		let	user = await prisma.user.findUnique({
			where: {
			  id: res.data.id,
			},
		});
		if (user)
			throw ("app: backend: user already in database, need redirection to landpage.");
		user = await prisma.user.create({
			data: {
				id: res.data.id,
				email: res.data.email,
				login: res.data.login,
				lastName: res.data.last_name,
				firstName: res.data.first_name,
				imageLink: res.data.image.link
			}
		})
		// id: 109075,
		// email: 'oboutarf@student.42.fr',
		// login: 'oboutarf',
		// first_name: 'Oscar',
		// last_name: 'Boutarfa',
		// usual_full_name: 'Oscar Boutarfa',
		// usual_first_name: null,
		// url: 'https://api.intra.42.fr/v2/users/oboutarf',
		// phone: 'hidden',
		// displayname: 'Oscar Boutarfa',
		// kind: 'student',
		// image: {
		//   link: 'https://cdn.intra.42.fr/users/fe72a4a3bdfb4fd06220cff656fdc35c/oboutarf.JPG',
		//   versions: [Object]
		// },
	}
	catch (error)	{
		console.log(error);
	}
}