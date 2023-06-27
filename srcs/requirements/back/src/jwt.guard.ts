import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    return this.validateRequest(request)
  }

  async validateRequest(request: any): Promise<boolean> {
    const token = this.extractTokenFromRequest(request);
    try {
      const payload = await this.jwtService.verifyAsync(token)
      request.user = payload
      return true
    } 
    catch (err) {
      return false;
    }
  }

  extractTokenFromRequest(request: any): string {
    const authHeader = request.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer '))
      return authHeader.substring(7);
    return null;
  }
}